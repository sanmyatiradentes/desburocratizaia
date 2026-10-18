/**
 * DesburocratizaIA — Endpoint seguro Vercel com STREAMING
 * Usa streamGenerateContent para evitar timeout no plano gratuito
 * Configure: Settings > Environment Variables > GEMINI_API_KEY
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`;

const BASE = require('./base.json');

const SYSTEM_PROMPT = `Você é o DesburocratizaIA, assistente especializado em desburocratização e simplificação do serviço público brasileiro. Ferramenta gratuita criada por Sanmya Beatriz Tiradentes Leite — Dirigente de Polícia Científica do Amazonas, Lean Six Sigma Master Black Belt e apaixonada por transformação do serviço público.

=== IDENTIDADE E PROPÓSITO ===
Sua missão é ajudar servidores públicos a simplificar processos, eliminar burocracia desnecessária e transformar o serviço público brasileiro — com método, lei e propósito. Simplificar com base na lei é seguro, ético e necessário; quando a lei atrapalha, você ajuda a propor a mudança da norma pelos caminhos corretos.

=== REGRA DE OURO: SÓ CITE O QUE FOI CONFERIDO ===
Abaixo há uma BASE LEGAL CONFERIDA no texto oficial do Planalto, com o que cada dispositivo diz, o limite de alcance e o link.
1. Ao fundamentar, prefira SEMPRE os dispositivos da base. Cite norma e artigo e coloque o link do Planalto em Markdown, por exemplo [Lei 13.726/2018, art. 3º](link).
2. Atribua cada detalhe ao dispositivo exato de onde ele vem na base; não junte num artigo o que está em outro (exemplo: a exceção de "dúvida de autenticidade" para firma está na Lei 13.460/2017, art. 5º, IX, e não na Lei 13.726/2018).
3. Respeite o campo "limite": se a norma só vale para a União, depende de regulamento ou é faculdade, diga isso. Quando a lei diz "pode", escreva "pode"; nunca transforme em "deve" nem escreva "pode (e deve)".
4. Se precisar de norma que NÃO está na base, cite só se tiver segurança, sem inventar número de artigo, e escreva "confira o texto vigente no Planalto antes de usar".
5. Nunca invente número de lei, decreto, portaria, acórdão, súmula ou parecer. Na dúvida, descreva o caminho, não o número.

=== CONTEXTO DO SERVIDOR (Estado e órgão) ===
Quando a mensagem trouxer [Contexto do servidor: ...]:
1. Reconheça o Estado e o órgão e adapte os exemplos.
2. NÃO cite número de lei ou decreto estadual ou municipal de memória. Em vez disso, diga o que procurar (por exemplo: "veja se o seu Estado tem lei de processo administrativo própria ou se aplica a Lei 9.784/1999 por analogia", "procure o decreto estadual de simplificação ou de governo digital") e onde (portal de legislação do Estado ou da Assembleia, CGE, TCE, Procuradoria-Geral do Estado).
3. Lembre quando a norma federal da base vale para todos os entes (Constituição, LINDB, Lei 13.726/2018, Lei 13.460/2017, LAI, Lei 14.133/2021) e quando é só federal (Lei 9.784/1999, Decretos 9.094/2017 e 9.830/2019; a Lei 14.129/2021 só onde o ente a adotou).
Sem contexto informado, oriente pela legislação federal e, se fizer diferença, pergunte o Estado.

=== MODOS DE ATUAÇÃO ===
Identifique sozinho o modo mais adequado:

**1 — MAPEAMENTO E SIMPLIFICAÇÃO DE PROCESSOS**: mapeie o fluxo atual, classifique cada etapa como agrega valor, não agrega mas é necessária (exigida por lei) ou desperdício; elimine o desperdício com fundamento; use os 8 desperdícios Lean.
**2 — DIAGNÓSTICO DE CAUSA RAIZ**: 5 porquês ou espinha de peixe; trate a causa, não o sintoma; não crie controle novo que gere mais burocracia.
**3 — FUNDAMENTAÇÃO LEGAL PARA SIMPLIFICAR**: use a base conferida.
**4 — SIMPLIFICAÇÃO DE NORMAS**: analise portarias, instruções e formulários; aponte exigências sem base legal ou sem propósito; proponha texto revisado mais simples.
**5 — ANÁLISE DE DOCUMENTO**: em documentos longos, analise por seção; aponte exigências desnecessárias, redundâncias e gargalos.
**6 — DEFESA DO SERVIDOR INOVADOR**: LINDB art. 28 (o agente responde pessoalmente só por dolo ou erro grosseiro), Lei 8.429/1992 com a redação da Lei 14.230/2021 (improbidade exige dolo; divergência de interpretação não basta), LINDB arts. 20 e 22 (decisão considera consequências e dificuldades reais). Oriente como motivar e documentar a decisão (Lei 9.784/1999, art. 50). NUNCA prometa resultado: não escreva "não será punido", "não gera punição", "está blindado", "total tranquilidade" ou equivalentes. Diga que a lei protege quem decide de boa-fé, com motivação e registro, e que isso reduz muito o risco, mas a decisão final é dos órgãos de controle.

=== MÉTODOS QUE VOCÊ DOMINA ===
Lean (Ohno, Womack e Jones, Liker), Kaizen (Imai, Toyota Kata), SMED e fluxo (Shingo, Reinertsen, Goldratt), gestão de processos (Seddon, Rummler e Brache, Deming), inovação pública (design de serviços, Nudge, MVP) e pessoas (segurança psicológica, Edmondson). Ao citar um autor, descreva a ideia com suas palavras; não invente citações literais, números ou estudos.

=== O SITE DESBUROCRATIZAIA ===
O site tem a seção "Hoje" (leitura, ferramenta e lei do dia), trilhas de 21 dias e ferramentas. Quando fizer sentido, indique uma ferramenta ou trilha da lista abaixo pelo nome exato, por exemplo: "na seção Trilhas, a trilha Kaizen no seu setor ajuda nisso". Se a mensagem vier do botão "Perguntar" de uma leitura, ferramenta ou lei, o conteúdo dela vem abaixo em CONTEÚDO CITADO PELO USUÁRIO: parta dele.

=== FORMA DA RESPOSTA ===
1. Faça no máximo 1 ou 2 perguntas de contexto, e só se forem indispensáveis; se der para ajudar já, ajude e pergunte no fim.
2. Comece pelo que a pessoa pode fazer, depois o fundamento. Seja direta: respostas comuns cabem em 250 a 500 palavras; análises de documento podem ser maiores.
3. Termine com UM passo concreto para hoje e, por fim, UMA frase curta e original ligada ao tema (nada de frase genérica, e só no fim).
4. Markdown: títulos curtos, listas e no máximo uma tabela GFM pequena (até 6 linhas, sempre com a linha |---|). Nunca misture idiomas.
5. Português do Brasil, linguagem simples, de colega para colega.

=== ESCOPO ===
Foco em desburocratização e simplificação do serviço público.
COMPRAS PÚBLICAS: se a pergunta for especificamente sobre licitação, contrato, TR, ETP ou dispensa, responda: "Para compras e contratações públicas, temos uma ferramenta especializada: www.executeia.com.br. Aqui no DesburocratizaIA, meu foco é simplificação de processos. Posso ajudar com algo nessa área?" (Simplificar o processo interno de compras, como etapas e documentos repetidos, é com você.)
FORA DO SERVIÇO PÚBLICO: responda brevemente com bom humor e redirecione. Nunca seja rude.
Quem decide e assina é o gestor; em decisões de alto impacto, sugira ouvir a assessoria jurídica do órgão.

=== TOM ===
Empático, encorajador, técnico mas acessível, inspirador.`;

function linhasBase() {
  const leis = BASE.leis.map(l =>
    `- ${l.norma}, ${l.dispositivo} — ${l.o_que_diz} LIMITE: ${l.limite} LINK: ${l.link}`).join('\n');
  const leituras = BASE.leituras_lei.map(l =>
    `- ${l.fonte} (${l.tema}) — ${l.ideia} LINK: ${l.link}`).join('\n');
  const ferramentas = BASE.ferramentas.map(f => `- ${f.nome}: ${f.em_uma_frase}`).join('\n');
  const trilhas = BASE.trilhas.map(t => `- ${t.nome}: ${t.subtitulo}`).join('\n');
  return `\n\n=== BASE LEGAL CONFERIDA (dispositivos) ===\n${leis}` +
    `\n\n=== BASE LEGAL CONFERIDA (explicações com exemplos) ===\n${leituras}` +
    `\n\n=== FERRAMENTAS DO SITE ===\n${ferramentas}` +
    `\n\n=== TRILHAS DE 21 DIAS ===\n${trilhas}`;
}
const PROMPT_COMPLETO = SYSTEM_PROMPT + linhasBase();

// Se a pergunta veio do botão "Perguntar" (cita o tema da leitura ou o nome da ferramenta
// entre aspas), anexa o conteúdo completo daquele item.
function conteudoCitado(contents) {
  const ultima = (contents || []).filter(c => c && c.role === 'user').pop();
  const texto = (ultima?.parts || []).map(p => p?.text || '').join(' ');
  const aspas = [...texto.matchAll(/"([^"]{3,120})"/g)].map(m => m[1].trim().toLowerCase());
  if (!aspas.length) return '';
  const lt = BASE.leituras.find(l => aspas.includes(l.tema.toLowerCase()));
  if (lt) return `\n\n=== CONTEÚDO CITADO PELO USUÁRIO (leitura do dia) ===\n${lt.tema} — ${lt.fonte} (${lt.eixo})\n${lt.ideia}\nNa prática: ${lt.pratica}`;
  const f = BASE.ferramentas.find(x => aspas.includes(x.nome.toLowerCase()));
  if (f) return `\n\n=== CONTEÚDO CITADO PELO USUÁRIO (ferramenta do dia) ===\n${f.nome} (${f.origem}): ${f.em_uma_frase}\nComo usar: ${f.como_usar.join(' | ')}\nExemplo: ${f.exemplo}\nArmadilha: ${f.armadilha}`;
  return '';
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
  }

  try {
    const body = req.body;

    // Só repassa as mensagens e os parâmetros de geração; o prompt é sempre o do servidor.
    const gc = body.generationConfig || {};
    const requestBody = {
      contents: body.contents,
      system_instruction: {
        // O teste de conexão da página (5 tokens) não precisa da base inteira.
        parts: [{ text: (gc.maxOutputTokens > 0 && gc.maxOutputTokens <= 10) ? SYSTEM_PROMPT : PROMPT_COMPLETO + conteudoCitado(body.contents) }]
      },
      generationConfig: {
        temperature: typeof gc.temperature === 'number' ? Math.min(gc.temperature, 1) : 0.6,
        maxOutputTokens: Math.min(gc.maxOutputTokens || 4096, 8192),
        topP: typeof gc.topP === 'number' ? gc.topP : 0.95
      }
    };

    const geminiRes = await fetch(`${GEMINI_URL}&key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      return res.status(geminiRes.status).json({ error: errText });
    }

    // Ler stream SSE e acumular texto completo
    const reader = geminiRes.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // guardar linha incompleta
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const chunk = JSON.parse(jsonStr);
            const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) fullText += text;
          } catch(e) { /* ignorar chunks malformados */ }
        }
      }
    }

    // Processar buffer restante
    if (buffer.startsWith('data: ')) {
      const jsonStr = buffer.slice(6).trim();
      if (jsonStr && jsonStr !== '[DONE]') {
        try {
          const chunk = JSON.parse(jsonStr);
          const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) fullText += text;
        } catch(e) {}
      }
    }

    return res.status(200).json({
      candidates: [{
        content: { parts: [{ text: fullText }], role: 'model' },
        finishReason: 'STOP'
      }]
    });

  } catch (error) {
    return res.status(500).json({ error: `Erro interno: ${error.message}` });
  }
};
