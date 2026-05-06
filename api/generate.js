export default async function handler(req, res) {
  // Только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, mode, count } = req.body;

  // Базовая валидация
  if (!text || !mode) {
    return res.status(400).json({ error: 'Missing text or mode' });
  }

  // Промпты
  const prompts = {
    flashcards: `Создай ровно ${count || 6} флэшкарт по тексту. Только JSON массив (никакого markdown, никакого текста до или после):
[{"q":"вопрос","a":"ответ"}]

Текст:
${text}`,

    quiz: `Создай ровно ${count || 6} вопросов с 4 вариантами по тексту. Только JSON (никакого markdown):
[{"q":"вопрос","options":["А) ...","Б) ...","В) ...","Г) ..."],"correct":0}]
correct — индекс правильного ответа (0-3).

Текст:
${text}`,

    summary: `Сделай структурированный конспект текста на русском. Используй эмодзи-буллеты и выдели ключевые термины. Только plain text.

Текст:
${text}`
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.SITE_URL || 'https://studyai.vercel.app',
        'X-Title': 'StudyAI'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'user', content: prompts[mode] }],
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'OpenRouter error' });
    }

    const result = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ result });

  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err.message });
  }
}
