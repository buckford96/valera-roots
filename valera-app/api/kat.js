export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { needs, notes, resources } = req.body

  const resourceList = resources.map((r, i) =>
    `${i + 1}. ${r.name} — ${r.description}. Who qualifies: ${r.eligibility_notes || 'see details'}. How to apply: ${r.how_to_apply || 'see details'}.`
  ).join('\n')

  const prompt = `You are KAT, an AI navigator built by Valera Roots to help case managers connect clients to benefits and services. You speak in plain, warm, professional language. You are direct and practical.

A case manager has just looked up resources for a client. Here is the session context:

Presenting needs: ${needs.join(', ')}
${notes ? `Additional context: ${notes}` : ''}

Resources found (${resources.length}):
${resourceList}

Write a brief synthesis (as many sentences as needed) for the case manager. Prioritize the most important resources, flag anything time-sensitive or that requires immediate action, and note any gaps where no resource was found. Speak directly to the case manager, not the client. Do not use bullet points. Write in short paragraphs, one idea per paragraph, separated by line breaks.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  const summary = data.content?.[0]?.text || ''
  res.status(200).json({ summary })
}