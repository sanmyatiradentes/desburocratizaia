"""Junta os arquivos de conteudo/fonte/*.json em conteudo/diario.js (lido pelo site).

Para editar o conteúdo: altere os .json em conteudo/fonte/ e rode
    python3 conteudo/montar.py
"""
import json
from pathlib import Path

PASTA = Path(__file__).parent
FONTE = PASTA / "fonte"
EIXOS = {"Lean", "Gestão de processos", "Kaizen", "SMED e fluxo", "Lei a seu favor", "Inovação", "Pessoas e coragem"}


def carregar(nome):
    return json.loads((FONTE / nome).read_text(encoding="utf-8"))


def juntar_leituras():
    """As 31 primeiras (leituras.json) mantêm a ordem; as de leituras_<eixo>.json
    entram depois, alternando os eixos para não repetir tema em dias seguidos."""
    base = carregar("leituras.json")
    grupos = [carregar(p.name) for p in sorted(FONTE.glob("leituras_*.json"))]
    novas = []
    while any(grupos):
        for g in grupos:
            if g:
                novas.append(g.pop(0))
    return base + novas


dados = {
    "leituras": juntar_leituras(),
    "ferramentas": carregar("ferramentas.json"),
    "leis": carregar("leis.json"),
    "trilhas": carregar("trilhas_a.json") + carregar("trilhas_b.json"),
}

# Conferências mínimas para não publicar conteúdo quebrado.
CAMPOS = {
    "leituras": ["tema", "eixo", "fonte", "ideia", "pratica", "pergunta", "frase"],
    "ferramentas": ["nome", "origem", "em_uma_frase", "como_usar", "exemplo", "armadilha"],
    "leis": ["norma", "dispositivo", "o_que_diz", "como_usar", "limite", "link"],
}
for chave, campos in CAMPOS.items():
    for i, item in enumerate(dados[chave]):
        faltam = [c for c in campos if not item.get(c)]
        assert not faltam, f"{chave}[{i}] sem {faltam}"
for i, l in enumerate(dados["leituras"]):
    assert l["eixo"] in EIXOS, f"leituras[{i}] com eixo desconhecido: {l['eixo']}"
temas = [l["tema"].strip().lower() for l in dados["leituras"]]
repetidos = {t for t in temas if temas.count(t) > 1}
assert not repetidos, f"leituras com tema repetido: {repetidos}"
for i, l in enumerate(dados["leituras"]):
    if "link" in l or "conferido" in l:
        assert l.get("link", "").startswith("https://www.planalto.gov.br/"), f"leituras[{i}] com link fora do Planalto"
        assert l.get("conferido") is True, f"leituras[{i}] ({l['fonte']}) não conferida no texto oficial"
for i, f in enumerate(dados["ferramentas"]):
    assert isinstance(f["como_usar"], list) and f["como_usar"], f"ferramentas[{i}] sem passos"
for i, l in enumerate(dados["leis"]):
    assert l["link"].startswith("https://www.planalto.gov.br/"), f"leis[{i}] com link fora do Planalto"
    assert l.get("conferido") is True, f"leis[{i}] ({l['norma']} {l['dispositivo']}) não conferido no texto oficial"
ids = set()
for t in dados["trilhas"]:
    assert t["id"] not in ids, f"trilha repetida: {t['id']}"
    ids.add(t["id"])
    assert len(t["dias"]) == 21, f"trilha {t['id']} com {len(t['dias'])} dias"
    for i, d in enumerate(t["dias"]):
        faltam = [c for c in ["titulo", "acao", "por_que"] if not d.get(c)]
        assert not faltam, f"{t['id']}[{i}] sem {faltam}"

# Base que a IA do chat consulta (api/chat.js): as leis conferidas entram inteiras no prompt;
# leituras e ferramentas completas ficam à mão para quando a pergunta vem do botão "Perguntar".
base = {
    "leis": [{k: l[k] for k in ("norma", "dispositivo", "o_que_diz", "limite", "link")} for l in dados["leis"]],
    "leituras_lei": [{k: l[k] for k in ("tema", "fonte", "ideia", "link")} for l in dados["leituras"] if l.get("link")],
    "ferramentas": dados["ferramentas"],
    "trilhas": [{k: t[k] for k in ("nome", "subtitulo")} for t in dados["trilhas"]],
    "leituras": [{k: l[k] for k in ("tema", "eixo", "fonte", "ideia", "pratica")} for l in dados["leituras"]],
}
(PASTA.parent / "api" / "base.json").write_text(json.dumps(base, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

# O campo "conferido" é só controle interno; não vai para o site.
for l in dados["leis"] + dados["leituras"]:
    l.pop("conferido", None)

saida = PASTA / "diario.js"
saida.write_text(
    "// Gerado por conteudo/montar.py — edite os .json em conteudo/fonte/\n"
    "window.DESBURO_CONTEUDO = " + json.dumps(dados, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)
print(f"{saida}: {len(dados['leituras'])} leituras, {len(dados['ferramentas'])} ferramentas, "
      f"{len(dados['leis'])} dispositivos legais, {len(dados['trilhas'])} trilhas")
