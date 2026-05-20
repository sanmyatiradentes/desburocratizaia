/**
 * DesburocratizaIA — Endpoint seguro Vercel
 * Protege a chave do Google Gemini no servidor.
 * A chave nunca é exposta ao navegador do usuário.
 *
 * Configure a variável de ambiente no Vercel:
 *   Settings > Environment Variables > GEMINI_API_KEY = sua_chave_aqui
 */

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Buscar a chave das variáveis de ambiente do Vercel
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({ error: `Erro interno: ${error.message}` });
  }
}
