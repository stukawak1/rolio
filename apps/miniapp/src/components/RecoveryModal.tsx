import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from '../hooks/useLocale'
import type { CharacterId } from 'rolio-shared'

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

interface Props {
  characterId: CharacterId
  onClose: () => void
}

export default function RecoveryModal({ characterId, onClose }: Props) {
  const { t } = useLocale()
  const [explanation, setExplanation] = useState('')

  const color = CHARACTER_COLORS[characterId]
  const emoji = CHARACTER_EMOJIS[characterId]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'flex-end',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 40px',
          borderTop: `2px solid ${color}`,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: color + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
          }}>
            {emoji}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{t('recovery.title')}</div>
            <div style={{ color, fontSize: 13, fontWeight: 500 }}>{characterId}</div>
          </div>
        </div>

        <textarea
          value={explanation}
          onChange={e => setExplanation(e.target.value)}
          placeholder={t('recovery.placeholder')}
          rows={3}
          style={{
            width: '100%',
            background: 'var(--surface2)',
            borderRadius: 12,
            padding: '12px 14px',
            color: 'var(--text)',
            fontSize: 15,
            resize: 'none',
            marginBottom: 16,
          }}
        />

        <button
          onClick={onClose}
          disabled={!explanation.trim()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            background: explanation.trim() ? color : 'var(--surface2)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 15,
            transition: 'background 0.2s',
          }}
        >
          {t('recovery.cta')}
        </button>
      </motion.div>
    </motion.div>
  )
}
