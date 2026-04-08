import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { useLocale } from '../hooks/useLocale'
import RelationsBar from '../components/RelationsBar'
import RecoveryModal from '../components/RecoveryModal'
import type {
  ChatMessage, RelationState, EvaluationResult, CharacterId
} from 'rolio-shared'
import { DEFAULT_RELATION_STATE } from 'rolio-shared'

// First scene of Chapter 1: "Что-нибудь эпичное"
const SCENARIO_CONTEXT = `
Глава 1: "Что-нибудь эпичное"
Студент играет роль Alex — будущего BA/SA.
Компания друзей (Max, Leo, Nika, Maya) обсуждает планы на пятницу после сессии.

Max написал в общий чат: "пацаны ну всё, сессия сдана, давайте в эту пятницу что-нибудь эпичное замутим"

Все ответили позитивно, но никто ничего конкретного не предложил.
Теперь студент (Alex) должен что-то написать в чат.

Образовательная цель: научить задавать уточняющие вопросы вместо того чтобы угадывать требования.
`.trim()

const CHARACTER_COLORS: Record<CharacterId, string> = {
  Max: '#f472b6',
  Leo: '#34d399',
  Nika: '#fb923c',
  Maya: '#7c6ff7',
}

const CHARACTER_EMOJIS: Record<CharacterId, string> = {
  Max: '😄',
  Leo: '💻',
  Nika: '🔬',
  Maya: '📋',
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', from: 'Max', text: 'пацаны ну всё, сессия сдана 🎉 давайте в эту пятницу что-нибудь эпичное замутим', timestamp: Date.now() - 5000 },
  { id: '2', from: 'Maya', text: '🔥🔥🔥', timestamp: Date.now() - 4000 },
  { id: '3', from: 'Leo', text: 'я за', timestamp: Date.now() - 3000 },
  { id: '4', from: 'Nika', text: 'наконец-то 😅', timestamp: Date.now() - 2000 },
]

export default function Game() {
  const { roleId } = useParams()
  const { t } = useLocale()

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [relations, setRelations] = useState<RelationState>(DEFAULT_RELATION_STATE)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [showRelations, setShowRelations] = useState(false)
  const [recovery, setRecovery] = useState<{ characterId: CharacterId } | null>(null)
  const [history, setHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isThinking) return

    const playerMsg: ChatMessage = {
      id: crypto.randomUUID(),
      from: 'player',
      text,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, playerMsg])
    setInput('')
    setIsThinking(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          scenarioContext: SCENARIO_CONTEXT,
          relations,
          history,
        }),
      })

      const data: EvaluationResult & { updatedRelations: RelationState } = await res.json()

      // Add character reactions to chat
      const reactionMessages: ChatMessage[] = Object.entries(data.reactions)
        .filter(([, msg]) => msg && msg.trim())
        .map(([charId, msg]) => ({
          id: crypto.randomUUID(),
          from: charId as CharacterId,
          text: msg,
          timestamp: Date.now(),
        }))

      // Add coach note
      const coachMsg: ChatMessage = {
        id: crypto.randomUUID(),
        from: 'coach',
        text: data.coachNote,
        timestamp: Date.now(),
      }

      setMessages(prev => [...prev, ...reactionMessages, coachMsg])
      setRelations(data.updatedRelations)

      // Update conversation history for Claude
      setHistory(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: JSON.stringify(data.reactions) },
      ])

      // Trigger recovery if needed
      if (data.triggerRecovery) {
        const worstChar = Object.entries(data.relationDelta ?? {})
          .sort(([, a], [, b]) => {
            const sumA = Object.values(a ?? {}).reduce((s, v) => s + (v as number), 0)
            const sumB = Object.values(b ?? {}).reduce((s, v) => s + (v as number), 0)
            return sumA - sumB
          })[0]?.[0] as CharacterId
        if (worstChar) setRecovery({ characterId: worstChar })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsThinking(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Auto-resize textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  }

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Глава 1</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Что-нибудь эпичное</div>
        </div>
        <button
          onClick={() => setShowRelations(!showRelations)}
          style={{
            background: 'var(--surface2)',
            borderRadius: 8,
            padding: '6px 12px',
            color: 'var(--accent2)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          👥 Команда
        </button>
      </div>

      {/* Relations panel */}
      <AnimatePresence>
        {showRelations && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', flexShrink: 0 }}
          >
            <RelationsBar relations={relations} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {msg.from === 'player' ? (
              // Player message (right aligned)
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  maxWidth: '75%',
                  background: 'var(--accent)',
                  borderRadius: '16px 16px 4px 16px',
                  padding: '10px 14px',
                  fontSize: 15,
                }}>
                  {msg.text}
                </div>
              </div>
            ) : msg.from === 'coach' ? (
              // Coach insight
              <div style={{
                background: '#1a1a2e',
                border: '1px solid var(--accent)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--accent2)',
              }}>
                <span style={{ fontWeight: 600 }}>{t('chat.coachNote')}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 6 }}>{msg.text}</span>
              </div>
            ) : (
              // Character message
              <div style={{ display: 'flex', gap: 10, maxWidth: '80%' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: CHARACTER_COLORS[msg.from as CharacterId] + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {CHARACTER_EMOJIS[msg.from as CharacterId]}
                </div>
                <div>
                  <div style={{
                    fontSize: 12,
                    color: CHARACTER_COLORS[msg.from as CharacterId],
                    fontWeight: 600,
                    marginBottom: 4,
                  }}>
                    {msg.from}
                  </div>
                  <div style={{
                    background: 'var(--surface)',
                    borderRadius: '4px 16px 16px 16px',
                    padding: '10px 14px',
                    fontSize: 15,
                  }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {/* Thinking indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
                padding: '4px 0',
              }}
            >
              {t('chat.thinking')}
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.inputPlaceholder')}
          rows={1}
          style={{
            flex: 1,
            background: 'var(--surface2)',
            borderRadius: 12,
            padding: '10px 14px',
            color: 'var(--text)',
            fontSize: 15,
            resize: 'none',
            lineHeight: 1.5,
            maxHeight: 120,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isThinking}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: input.trim() && !isThinking ? 'var(--accent)' : 'var(--surface2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            flexShrink: 0,
          }}
        >
          <Send size={18} color={input.trim() && !isThinking ? '#fff' : 'var(--text-muted)'} />
        </button>
      </div>

      {/* Recovery modal */}
      <AnimatePresence>
        {recovery && (
          <RecoveryModal
            characterId={recovery.characterId}
            onClose={() => setRecovery(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
