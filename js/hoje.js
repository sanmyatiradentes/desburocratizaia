// DesburocratizaIA — Leitura do dia (leitura, ferramenta, lei a seu favor),
// trilhas de 21 dias e "Ouvir o dia". Conteúdo fixo em conteudo/diario.js.
// Nada aqui é enviado a servidor: o progresso fica no localStorage do aparelho.

(function () {
  var C = window.DESBURO_CONTEUDO;
  if (!C) return;

  var MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  var SEMANA = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
  var SITE = 'https://www.desburocratizaia.com.br/#hoje';
  var desloc = 0;          // dias de distância de hoje (setas ‹ ›)

  // --- utilitários ---

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function $(id) { return document.getElementById(id); }

  function hojeLocal(d) {
    d = d || new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function chaveData(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  // Número do dia contado a partir de 1/1/2026 — todos veem o mesmo conteúdo no mesmo dia.
  function numeroDia(d) {
    return Math.round((hojeLocal(d) - new Date(2026, 0, 1)) / 86400000);
  }
  function item(lista, n) { return lista[((n % lista.length) + lista.length) % lista.length]; }

  function ler(chave, padrao) {
    try { var v = localStorage.getItem(chave); return v ? JSON.parse(v) : padrao; } catch (e) { return padrao; }
  }
  function gravar(chave, v) {
    try { localStorage.setItem(chave, JSON.stringify(v)); } catch (e) {}
  }

  function dataDoDia() {
    var d = hojeLocal(); d.setDate(d.getDate() + desloc); return d;
  }
  function conteudoAtual() {
    var n = numeroDia(dataDoDia());
    return {lei: item(C.leis, n), fer: item(C.ferramentas, n), lt: item(C.leituras, n), n: n};
  }

  // --- Sequência de dias (visitas) ---

  function registrarVisita() {
    var v = ler('dbia_visitas', {ultimo: null, seq: 0});
    var hoje = chaveData(hojeLocal());
    if (v.ultimo === hoje) return v.seq;
    var ontem = hojeLocal(); ontem.setDate(ontem.getDate() - 1);
    v.seq = (v.ultimo === chaveData(ontem)) ? v.seq + 1 : 1;
    v.ultimo = hoje;
    gravar('dbia_visitas', v);
    return v.seq;
  }

  // --- Levar um conteúdo para o assistente ---

  function perguntar(texto) {
    if (typeof window.preencher === 'function') { window.preencher(texto); return; }
    var input = $('user-input');
    if (!input) return;
    input.value = texto;
    $('ferramenta').scrollIntoView({behavior: 'smooth'});
  }

  function botoes(qual, rotuloPergunta) {
    return '<div class="hj-botoes">' +
      '<button class="hj-btn" data-ouvir="' + qual + '">Ouvir</button>' +
      '<button class="hj-btn" data-perguntar="' + qual + '">' + rotuloPergunta + '</button>' +
      '<button class="hj-btn discreto" data-compartilhar="' + qual + '">Compartilhar</button>' +
    '</div>';
  }

  // --- Seção "Hoje" ---

  function renderHoje() {
    var d = dataDoDia(), c = conteudoAtual();

    $('hoje-data').textContent = SEMANA[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()];
    $('hoje-rotulo').textContent = desloc === 0 ? 'Hoje' : (desloc === -1 ? 'Ontem' : (desloc === 1 ? 'Amanhã' : (desloc < 0 ? 'Há ' + (-desloc) + ' dias' : 'Daqui a ' + desloc + ' dias')));
    $('hoje-voltar-hoje').style.visibility = desloc === 0 ? 'hidden' : 'visible';

    var lt = c.lt;
    $('card-leitura').innerHTML =
      '<div class="hj-tag">Leitura do dia · ' + esc(lt.eixo) + '</div>' +
      '<h3 class="hj-tit">' + esc(lt.tema) + '</h3>' +
      '<div class="hj-autor">' + (lt.link
        ? '<a href="' + esc(lt.link) + '" target="_blank" rel="noopener">' + esc(lt.fonte) + '</a>'
        : esc(lt.fonte)) + '</div>' +
      '<p class="hj-texto">' + esc(lt.ideia) + '</p>' +
      '<div class="hj-acao"><strong>Na prática, hoje</strong><p>' + esc(lt.pratica) + '</p></div>' +
      '<p class="hj-pergunta">' + esc(lt.pergunta) + '</p>' +
      '<p class="hj-frase">' + esc(lt.frase) + '</p>' +
      botoes('leitura', 'Aplicar ao meu caso');

    var f = c.fer;
    $('card-ferramenta').innerHTML =
      '<div class="hj-tag">Ferramenta do dia</div>' +
      '<h3 class="hj-tit">' + esc(f.nome) + '</h3>' +
      '<div class="hj-autor">' + esc(f.origem) + '</div>' +
      '<p class="hj-ideia">' + esc(f.em_uma_frase) + '</p>' +
      '<ol class="hj-passos">' + f.como_usar.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>' +
      '<p>' + esc(f.exemplo) + '</p>' +
      '<div class="hj-alerta"><strong>Cuidado para não engessar</strong><p>' + esc(f.armadilha) + '</p></div>' +
      botoes('ferramenta', 'Usar no meu setor');

    var l = c.lei;
    $('card-lei').innerHTML =
      '<div class="hj-tag">A lei a seu favor</div>' +
      '<h3 class="hj-tit">' + esc(l.norma) + '</h3>' +
      '<a class="hj-ref" href="' + esc(l.link) + '" target="_blank" rel="noopener">' + esc(l.dispositivo) + ' <span>· ler no Planalto ↗</span></a>' +
      '<p class="hj-ideia">' + esc(l.o_que_diz) + '</p>' +
      '<div class="hj-acao"><strong>Como usar</strong><p>' + esc(l.como_usar) + '</p></div>' +
      '<div class="hj-alerta"><strong>Limite</strong><p>' + esc(l.limite) + '</p></div>' +
      botoes('lei', 'Aplicar ao meu caso');
  }

  // --- Ouvir (voz do navegador) ---

  var falando = false;

  function vozPt() {
    var vozes = speechSynthesis.getVoices().filter(function (v) { return /^pt(-|_)BR/i.test(v.lang); });
    var pref = ['Luciana', 'Google português do Brasil', 'Francisca', 'Thalita', 'Microsoft Maria'];
    for (var i = 0; i < pref.length; i++) {
      var v = vozes.filter(function (x) { return x.name.indexOf(pref[i]) === 0; })[0];
      if (v) return v;
    }
    return vozes[0] || null;
  }

  // O Chrome corta falas longas; por isso a leitura vai em frases curtas, uma após a outra.
  function falar(blocos, botao) {
    if (!('speechSynthesis' in window)) { alert('Seu navegador não tem leitura em voz alta.'); return; }
    if (falando) { pararFala(); return; }
    var frases = [];
    blocos.forEach(function (b) {
      (String(b).match(/[^.!?…]+[.!?…]*/g) || []).forEach(function (f) { f = f.trim(); if (f) frases.push(f); });
    });
    var voz = vozPt();
    falando = true;
    marcarBotoes(botao, true);
    frases.forEach(function (f, i) {
      var u = new SpeechSynthesisUtterance(f);
      u.lang = 'pt-BR'; u.rate = 1;
      if (voz) u.voice = voz;
      if (i === frases.length - 1) u.onend = function () { falando = false; marcarBotoes(null, false); };
      speechSynthesis.speak(u);
    });
  }
  function pararFala() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    falando = false;
    marcarBotoes(null, false);
  }
  function marcarBotoes(botao, ativo) {
    document.querySelectorAll('[data-ouvir],#hj-ouvir-dia').forEach(function (b) {
      b.classList.remove('falando');
      if (b.dataset.rotulo) { b.textContent = b.dataset.rotulo; delete b.dataset.rotulo; }
    });
    if (ativo && botao) {
      botao.dataset.rotulo = botao.textContent;
      botao.textContent = 'Parar';
      botao.classList.add('falando');
    }
  }

  // "Lei" lida em voz alta: "Art." e "§" soam mal na voz do navegador.
  function paraVoz(s) {
    return String(s).replace(/\bArts?\.\s*/g, 'artigo ').replace(/§§?\s*/g, 'parágrafo ').replace(/\binc\.\s*/g, 'inciso ');
  }

  function roteiro(qual) {
    var c = conteudoAtual();
    if (qual === 'leitura') return ['Leitura do dia. ' + c.lt.tema + '.', c.lt.ideia, 'Na prática, hoje. ' + c.lt.pratica, 'Para pensar. ' + c.lt.pergunta, c.lt.frase];
    if (qual === 'ferramenta') return ['Ferramenta do dia. ' + c.fer.nome + '.', c.fer.em_uma_frase, 'Como usar.'].concat(c.fer.como_usar).concat([c.fer.exemplo, 'Cuidado para não engessar. ' + c.fer.armadilha]);
    if (qual === 'lei') return ['A lei a seu favor. ' + paraVoz(c.lei.norma) + ', ' + paraVoz(c.lei.dispositivo) + '.', paraVoz(c.lei.o_que_diz), 'Como usar. ' + paraVoz(c.lei.como_usar), 'Limite. ' + paraVoz(c.lei.limite)];
    // Dia completo, no formato de um pequeno podcast.
    var d = dataDoDia();
    return ['Olá! Aqui é o Desburocratiza I A, com a leitura do dia. ' + SEMANA[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()] + '.']
      .concat(roteiro('leitura'), roteiro('ferramenta'), roteiro('lei'))
      .concat(['Isso é tudo por hoje. Uma exigência a menos é uma pessoa atendida mais cedo. Até amanhã!']);
  }

  function textoPergunta(qual) {
    var c = conteudoAtual();
    if (qual === 'leitura') return 'Li a leitura de hoje, "' + c.lt.tema + '" (' + c.lt.eixo + '). Como aplico isso no meu setor? Minha situação é: ';
    if (qual === 'ferramenta') return 'Quero usar a ferramenta "' + c.fer.nome + '" no meu setor sem criar mais burocracia. Meu processo é: ';
    return 'Como uso a ' + c.lei.norma + ', ' + c.lei.dispositivo + ', na minha situação? Meu caso é: ';
  }

  function compartilhar(qual) {
    var c = conteudoAtual(), texto;
    if (qual === 'leitura') texto = c.lt.tema + '\n\n' + c.lt.ideia + '\n\nNa prática, hoje: ' + c.lt.pratica;
    else if (qual === 'ferramenta') texto = 'Ferramenta do dia: ' + c.fer.nome + '\n\n' + c.fer.em_uma_frase + '\n\nCuidado para não engessar: ' + c.fer.armadilha;
    else texto = 'A lei a seu favor: ' + c.lei.norma + ', ' + c.lei.dispositivo + '\n\n' + c.lei.o_que_diz + '\n\nTexto oficial: ' + c.lei.link;
    texto += '\n\nLeitura do dia no DesburocratizaIA: ' + SITE;
    if (navigator.share) {
      navigator.share({title: 'DesburocratizaIA — Leitura do dia', text: texto}).catch(function () {});
    } else {
      window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    }
  }

  // --- Trilhas de 21 dias ---

  function estadoTrilhas() { return ler('dbia_trilhas', {}); }

  // Índice do dia em foco: o que foi feito hoje, senão o próximo a fazer (ou o último, se concluída).
  function diaAtualTrilha(s) {
    if (!s) return 0;
    var n = s.feitos.length;
    if (s.feitos.indexOf(chaveData(hojeLocal())) !== -1) return n - 1;
    return Math.min(n, 20);
  }

  function renderTrilhas() {
    var est = estadoTrilhas();
    $('tr-lista').innerHTML = C.trilhas.map(function (t) {
      var s = est[t.id], feitos = s ? s.feitos.length : 0;
      var status = !s ? 'Começar trilha' : (feitos >= 21 ? '✓ Concluída' : 'Continuar · dia ' + Math.min(feitos + 1, 21));
      return '<div class="tr-card' + (s ? ' iniciada' : '') + '">' +
        '<div class="tr-nome">' + esc(t.nome) + '</div>' +
        '<div class="tr-sub">' + esc(t.subtitulo) + '</div>' +
        '<div class="tr-para">' + esc(t.para_quem) + '</div>' +
        '<div class="tr-fontes">' + esc(t.fontes) + '</div>' +
        '<div class="tr-barra"><span style="width:' + Math.round(feitos / 21 * 100) + '%"></span></div>' +
        '<button class="hj-btn tr-abrir" data-trilha="' + esc(t.id) + '">' + status + '</button>' +
      '</div>';
    }).join('');
  }

  function abrirTrilha(id) {
    var t = C.trilhas.filter(function (x) { return x.id === id; })[0];
    var est = estadoTrilhas(), s = est[id];
    if (!s) { s = est[id] = {inicio: chaveData(hojeLocal()), feitos: []}; gravar('dbia_trilhas', est); renderTrilhas(); }
    var feitos = s.feitos.length;
    var jaFezHoje = s.feitos.indexOf(chaveData(hojeLocal())) !== -1;
    var atual = diaAtualTrilha(s);
    var dia = t.dias[atual];

    var acoes;
    if (feitos >= 21) acoes = '<p class="tr-msg">Você concluiu os 21 dias. A melhoria virou hábito — agora é ensinar alguém.</p>';
    else if (jaFezHoje) acoes = '<p class="tr-msg">✓ Feito hoje. O dia ' + (feitos + 1) + ' libera amanhã — mudança que dura vem de constância, não de pressa.</p>';
    else acoes = '<button class="btn-primary tr-feito" data-feito="' + esc(id) + '">✓ Fiz hoje</button>';

    $('tr-detalhe').innerHTML =
      '<button class="tr-fechar" data-fechar="1" aria-label="Fechar">×</button>' +
      '<div class="hj-tag">Trilha de 21 dias</div>' +
      '<h3 class="hj-tit">' + esc(t.nome) + '</h3>' +
      '<div class="tr-barra grande"><span style="width:' + Math.round(feitos / 21 * 100) + '%"></span></div>' +
      '<div class="tr-cont">' + feitos + ' de 21 dias</div>' +
      '<div class="tr-dia">' +
        '<div class="tr-dia-num">Dia ' + (atual + 1) + '</div>' +
        '<h4>' + esc(dia.titulo) + '</h4>' +
        '<p>' + esc(dia.acao) + '</p>' +
        '<p class="tr-pq"><strong>Por quê:</strong> ' + esc(dia.por_que) + '</p>' +
        acoes +
      '</div>' +
      '<div class="tr-mapa">' + t.dias.map(function (d, i) {
        var cls = i < feitos ? 'ok' : (i === atual ? 'agora' : '');
        return '<span class="' + cls + '" title="Dia ' + (i + 1) + ' — ' + esc(d.titulo) + '">' + (i < feitos ? '✓' : i + 1) + '</span>';
      }).join('') + '</div>' +
      '<div class="hj-botoes">' +
        '<button class="hj-btn" data-pergunta-trilha="' + esc(id) + '">Pedir ajuda com este dia</button>' +
        '<button class="hj-btn discreto" data-recomecar="' + esc(id) + '">Recomeçar trilha</button>' +
      '</div>';
    $('tr-detalhe').classList.add('aberto');
    $('tr-detalhe').scrollIntoView({behavior: 'smooth', block: 'nearest'});
  }

  function marcarFeito(id) {
    var est = estadoTrilhas(), s = est[id];
    var hoje = chaveData(hojeLocal());
    if (!s || s.feitos.indexOf(hoje) !== -1 || s.feitos.length >= 21) return;
    s.feitos.push(hoje);
    gravar('dbia_trilhas', est);
    renderTrilhas();
    abrirTrilha(id);
  }

  // --- Eventos ---

  document.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'hoje-ant') { desloc--; pararFala(); renderHoje(); }
    else if (b.id === 'hoje-prox') { desloc++; pararFala(); renderHoje(); }
    else if (b.id === 'hoje-voltar-hoje') { desloc = 0; pararFala(); renderHoje(); }
    else if (b.id === 'hj-ouvir-dia') falar(roteiro('dia'), b);
    else if (b.dataset.ouvir) falar(roteiro(b.dataset.ouvir), b);
    else if (b.dataset.perguntar) perguntar(textoPergunta(b.dataset.perguntar));
    else if (b.dataset.compartilhar) compartilhar(b.dataset.compartilhar);
    else if (b.dataset.trilha) abrirTrilha(b.dataset.trilha);
    else if (b.dataset.feito) marcarFeito(b.dataset.feito);
    else if (b.dataset.fechar) $('tr-detalhe').classList.remove('aberto');
    else if (b.dataset.recomecar) {
      if (!confirm('Recomeçar esta trilha do dia 1? O progresso atual será zerado.')) return;
      var est = estadoTrilhas(); delete est[b.dataset.recomecar]; gravar('dbia_trilhas', est);
      renderTrilhas(); abrirTrilha(b.dataset.recomecar);
    }
    else if (b.dataset.perguntaTrilha) {
      var t = C.trilhas.filter(function (x) { return x.id === b.dataset.perguntaTrilha; })[0];
      var i = diaAtualTrilha(estadoTrilhas()[t.id]);
      perguntar('Estou na trilha "' + t.nome + '", dia ' + (i + 1) + ': "' + t.dias[i].titulo + '". Como faço isso bem na minha realidade? ');
    }
  });

  function iniciar() {
    var seq = registrarVisita();
    $('hoje-seq').textContent = seq > 1 ? seq + ' dias seguidos' : 'Comece sua sequência hoje';
    renderHoje();
    renderTrilhas();
    if ('speechSynthesis' in window) speechSynthesis.getVoices(); // pré-carrega as vozes
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
