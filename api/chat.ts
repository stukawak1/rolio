import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { RelationState, EvaluationResult, CharacterId } from 'rolio-shared'

interface ChatRequest {
  userMessage: string
  scenarioContext: string
  relations: RelationState
  history: Array<{ role: 'user' | 'assistant'; content: string }>
}

const SYSTEM_PROMPT = `Ты — движок образовательной игры Rolio. Студент учится быть BA/SA через бытовые сценарии.

Оцени ответ студента и сгенерируй реакции персонажей. Каждый персонаж имеет свой характер:

- Max (инициатор/заказчик): энергичный, говорит расплывчато, хочет всё сразу, нетерпелив
- Leo (разработчик): прямолинейный, ценит конкретику, раздражается от неопределённости
- Nika (QA): внимательная к деталям, думает об ограничениях, осторожная
- Maya (PM): дипломатичная, следит за процессом, ценит структуру

Оцени по 5 критериям (каждый от -2 до +2):
1. clarification — насколько студент прояснил неясности
2. balance — учёл ли интересы всех стейкхолдеров
3. constraints — выявил ли ограничения (бюджет, время, ресурсы)
4. tone — тон общения (тепло и уважительно vs грубо)
5. structure — логичность и структурность ответа

Верни ТОЛЬКО валидный JSON без markdown, без объяснений:
{
  "scores": { "clarification": N, "balance": N, "constraints": N, "tone": N, "structure": N },
  "reactions": {
    "Max": "реакция в голосе Max (1-2 предложения, разговорно)",
    "Leo": "реакция в голосе Leo",
    "Nika": "реакция в голосе Nika",
    "Maya": "реакция в голосе Maya"
  },
  "relationDelta": {
    "Max": { "trust": N, "comfort": N },
    "Leo": { "trust": N, "clarity": N },
    "Nika": { "trust": N, "patience": N },
    "Maya": { "trust": N, "comfort": N }
  },
  "coachNote": "1-2 предложения: что студент сделал хорошо и что можно улучшить",
  "triggerRecovery": false
}

triggerRecovery = true если суммарный relationDelta по любому персонажу ≤ -15.
Все delta значения от -20 до +20.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userMessage, scenarioContext, relations, history } = req.body as ChatRequest

  if (!userMessage || !scenarioContext) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' })
  }

  try {
    // Build conversation for Gemini
    const conversationParts = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const userPrompt = `КОНТЕКСТ СЦЕНАРИЯ:\n${scenarioContext}\n\nТЕКУЩИЕ ОТНОШЕНИЯ:\n${JSON.stringify(relations, null, 2)}\n\nОТВЕТ СТУДЕНТА:\n${userMessage}`

    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        ...conversationParts,
        { role: 'user', parts: [{ text: userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error:', geminiRes.status, errText)
      return res.status(500).json({ error: `Gemini ${geminiRes.status}: ${errText.slice(0, 200)}` })
    }

    const geminiData = await geminiRes.json()
    const text: string = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    // Strip markdown code fences if Gemini adds them
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()

    let result: EvaluationResult
    try {
      result = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ error: 'Invalid AI response format', raw: text })
    }

    // Clamp relation values 0-100
    const updatedRelations: RelationState = JSON.parse(JSON.stringify(relations))
    const relationDelta = result.relationDelta && typeof result.relationDelta === 'object' ? result.relationDelta : {}
    for (const [charId, delta] of Object.entries(relationDelta)) {
      const char = charId as CharacterId
      if (!updatedRelations[char] || !delta || typeof delta !== 'object') continue
      for (const [metric, value] of Object.entries(delta)) {
        const key = metric as keyof RelationState[CharacterId]
        const current = updatedRelations[char][key] ?? 50
        updatedRelations[char][key] = Math.max(0, Math.min(100, current + (value as number)))
      }
    }

    return res.status(200).json({ ...result, updatedRelations })
  } catch (error) {
    console.error('Gemini API error:', error)
    return res.status(500).json({ error: 'AI service error', details: String(error) })
  }
}
