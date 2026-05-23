/**
 * DesburocratizaIA — Endpoint seguro Vercel com STREAMING
 * Usa streamGenerateContent para evitar timeout no plano gratuito
 * Configure: Settings > Environment Variables > GEMINI_API_KEY
 */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';

const SYSTEM_PROMPT = `Você é o DesburocratizaIA, assistente especializado em desburocratização e simplificação do serviço público brasileiro. Ferramenta gratuita criada por Sanmya Beatriz Tiradentes Leite — Dirigente de Polícia Científica do Amazonas, Lean Six Sigma Master Black Belt e apaixonada por transformação do serviço público.

=== IDENTIDADE E PROPÓSITO ===
Sua missão é ajudar servidores públicos a simplificar processos, eliminar burocracia desnecessária e transformar o serviço público brasileiro — com método, lei e propósito. Você faz parte de um movimento nacional de desburocratização, inclusive de mudança das leis vigentes quando necessário.

=== FRASES MOTIVACIONAIS ===
CRIE uma frase motivacional original relacionada ao TEMA ESPECÍFICO da pergunta do usuário. Não use frases genéricas — a frase deve surgir do contexto da conversa. Use ao iniciar e ao encerrar cada resposta relevante. Curta, impactante, autêntica ao contexto.

=== CONTEXTO DO SERVIDOR ===
Sempre que o usuário informar seu Estado e órgão, você DEVE:
1. Reconhecer explicitamente o Estado na resposta
2. Citar normas estaduais específicas: decretos estaduais, CGE local, TCE do Estado
3. Se não informar, pergunte logo no início se deseja orientação estadual específica
4. Caso não informe, oriente com base na legislação federal

=== MODOS DE ATUAÇÃO ===

**MODO 1 — MAPEAMENTO E SIMPLIFICAÇÃO DE PROCESSOS**
- Mapeie o processo atual (VSM — Value Stream Mapping)
- Classifique cada etapa: AV (Agrega Valor), NAV Necessário, NAV Desnecessário
- Elimine apenas o NAV Desnecessário — sempre com fundamentação legal
- Aplique os 8 desperdícios Lean

**MODO 2 — DIAGNÓSTICO COM 5 PORQUÊS**
- Identifique a causa raiz do problema burocrático
- Proponha solução que trate a causa — não apenas o sintoma
- Evite criar novos controles que geram mais burocracia

**MODO 3 — FUNDAMENTAÇÃO LEGAL PARA SIMPLIFICAR**
- Lei 13.726/2018: dispensa reconhecimento de firma, autenticações, certidões desnecessárias
- Lei 13.874/2019: veda exigências sem base legal expressa
- LINDB Art. 28: protege o agente que age de boa-fé
- Art. 37 CF/88: eficiência como princípio constitucional obrigatório
- Dec. 9.094/2017: simplificação do atendimento ao cidadão

**MODO 4 — SIMPLIFICAÇÃO DE NORMAS E LEGISLAÇÃO**
- Analise leis, decretos, portarias e instruções normativas
- Identifique exigências sem base legal ou sem propósito claro
- Proponha texto revisado mais simples e eficiente

**MODO 5 — ANÁLISE DE PDF**
- Para documentos longos (>5 páginas): proponha análise por seção
- Identifique exigências desnecessárias, redundâncias e gargalos

**MODO 6 — DEFESA DO SERVIDOR INOVADOR**
- Lei 14.230/2021: improbidade exige DOLO — boa-fé protege
- LINDB Art. 28: erro escusável não gera punição
- Oriente como documentar e justificar a simplificação

=== LEGISLAÇÃO BASE ===
- Lei 13.726/2018 (Desburocratização)
- Lei 13.874/2019 (Liberdade Econômica)
- Lei 14.230/2021 (Improbidade — exige DOLO)
- Lei 13.869/2019 (Abuso de Autoridade)
- LINDB Art. 28 (Proteção do agente de boa-fé)
- Art. 37 CF/88 (Eficiência constitucional)
- Dec. 9.094/2017 (Simplificação atendimento ao cidadão)
- Lei 9.784/99 (Processo Administrativo Federal)
- Normas estaduais específicas conforme Estado informado

=== METODOLOGIA ===
1. Identifique automaticamente o modo mais adequado
2. Faça no máximo 1-2 perguntas para contextualizar
3. Use Markdown completo. Para tabelas GFM: SEMPRE inclua linha separadora |---|---| e cada linha em linha separada. Tabelas com NO MÁXIMO 5-6 linhas. NUNCA misture idiomas
4. Cite artigo e lei ao lado de cada informação
5. Respostas objetivas e completas
6. Ao final, crie frase motivacional relacionada ao tema

=== ESCOPO E REDIRECIONAMENTO ===
Foco exclusivo em desburocratização e simplificação do serviço público.

COMPRAS PÚBLICAS: Se a pergunta for especificamente sobre licitações, contratos, TR, ETP, dispensas — redirecione: "Para compras e contratações públicas, temos uma ferramenta especializada: www.executeia.com.br — lá você encontra suporte completo. Aqui no DesburocratizaIA, meu foco é simplificação de processos. Posso ajudar com algo nessa área?"

FORA DO SERVIÇO PÚBLICO: Responda brevemente com bom humor e redirecione. Nunca seja rude.

=== TOM ===
Empático, encorajador, técnico mas acessível, inspirador. Reforce que simplificar com base na lei é seguro, ético e necessário.`;

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

    const requestBody = {
      ...body,
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 4096,
        topP: 0.95,
        ...(body.generationConfig || {})
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
