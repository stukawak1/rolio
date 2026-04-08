import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '../hooks/useLocale'
import type { PlayerRoleId } from 'rolio-shared'

const ROLES: Array<{ id: PlayerRoleId; emoji: string; color: string; available: boolean }> = [
  { id: 'ba', emoji: '🔍', color: '#7c6ff7', available: true },
  { id: 'pm', emoji: '📋', color: '#f472b6', available: false },
  { id: 'dev', emoji: '💻', color: '#34d399', available: false },
  { id: 'qa', emoji: '🔬', color: '#fb923c', available: false },
]

export default function ChooseRole() {
  const { t } = useLocale()
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      padding: '48px 24px 32px',
      background: 'var(--bg)',
    }}>
      <motion.h1
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}
      >
        {t('chooseRole.title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ color: 'var(--text-muted)', marginBottom: 32 }}
      >
        {t('chooseRole.subtitle')}
      </motion.p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ROLES.map((role, i) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileTap={role.available ? { scale: 0.98 } : {}}
            onClick={() => role.available && navigate(`/game/${role.id}`)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '16px 20px',
              borderRadius: 'var(--radius)',
              background: 'var(--surface)',
              border: `1px solid ${role.available ? role.color + '40' : 'var(--border)'}`,
              textAlign: 'left',
              opacity: role.available ? 1 : 0.5,
              cursor: role.available ? 'pointer' : 'default',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: role.color + '20',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flexShrink: 0,
            }}>
              {role.emoji}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>
                {t(`roles.${role.id}.name`)}
                {!role.available && (
                  <span style={{
                    marginLeft: 8,
                    fontSize: 11,
                    background: 'var(--surface2)',
                    color: 'var(--text-muted)',
                    padding: '2px 8px',
                    borderRadius: 99,
                  }}>
                    Скоро
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: role.color, fontWeight: 500 }}>
                {t(`roles.${role.id}.role`)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {t(`roles.${role.id}.desc`)}
              </div>
            </div>

            {role.available && (
              <div style={{ color: role.color, fontSize: 20 }}>→</div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
