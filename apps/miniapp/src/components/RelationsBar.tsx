import { useLocale } from '../hooks/useLocale'
import type { RelationState, CharacterId } from 'rolio-shared'

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

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{
      height: 4,
      background: 'var(--border)',
      borderRadius: 2,
      overflow: 'hidden',
      flex: 1,
    }}>
      <div style={{
        height: '100%',
        width: `${value}%`,
        background: color,
        borderRadius: 2,
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

interface Props {
  relations: RelationState
}

export default function RelationsBar({ relations }: Props) {
  const { t } = useLocale()
  const characters = Object.keys(relations) as CharacterId[]

  return (
    <div style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '12px 16px',
    }}>
      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 12,
      }}>
        {t('relations.title')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {characters.map((charId) => {
          const rel = relations[charId]
          const color = CHARACTER_COLORS[charId]
          return (
            <div key={charId}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
              }}>
                <span>{CHARACTER_EMOJIS[charId]}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{charId}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(['trust', 'clarity', 'comfort', 'patience'] as const).map(metric => (
                  <div key={metric} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      width: 72,
                      flexShrink: 0,
                    }}>
                      {t(`relations.${metric}`)}
                    </span>
                    <MetricBar value={rel[metric]} color={color} />
                    <span style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      width: 28,
                      textAlign: 'right',
                      flexShrink: 0,
                    }}>
                      {rel[metric]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
