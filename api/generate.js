const MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-7b-instruct:free'
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, mode, count } = req.body;
  if (!text || !mode) return res.status(400).json({ error: 'Missing text or mode' });

  const prompts = {
    flashcards: `Создай ровно ${count || 6} флэшкарт по тексту. Только JSON массив (никакого markdown):\n[{"q":"вопрос","a":"ответ"}]\n\nТекст:\n${text}`,
    quiz: `Создай ровно ${count || 6} вопросов с 4 вариантами по тексту. Только JSON (никакого markdown):\n[{"q":"вопрос","options":["А) ...","Б) ...","В) ...","Г) ..."],"correct":0}]\ncorrect — индекс правильного ответа (0-3).\n\nТекст:\n${text}`,
    summary: `Сделай структурированный конспект текста на русском. Используй эмодзи-буллеты и ключевые термины. Только plain text.\n\nТекст:\n${text}`
  };

  // Пробуем модели по очереди
  for (const model of MODELS) {
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
          model,
          messages: [{ role: 'user', content: prompts[mode] }],
          max_tokens: 1500,
          temperature: 0.7
        })
      });

      const data = await response.json();

      // Если rate limit — пробуем следующую модель
      if (response.status === 429 || data.error?.code === 429) {
        console.log(`Model ${model} rate limited, trying next...`);
        continue;
      }

      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || 'OpenRouter error' });
      }

      const result = data.choices?.[0]?.message?.content || '';
      return res.status(200).json({ result, model_used: model });

    } catch (err) {
      console.log(`Model ${model} failed: ${err.message}`);
      continue;
    }
  }

  // Все модели не ответили
  return res.status(429).json({ error: 'Все модели перегружены. Попробуй через минуту.' });
}
