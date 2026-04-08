import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLocale } from '../hooks/useLocale'

export default function Onboarding() {
  const { t } = useLocale()
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      background: 'linear-gradient(160deg, #0f0f13 0%, #1a1035 100%)',
    }}>
      {/* Logo / mascot placeholder */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        style={{ fontSize: 80, marginBottom: 24 }}
      >
        🎭
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: 28,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 12,
          background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {t('onboarding.title')}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          fontSize: 16,
          color: 'var(--text-muted)',
          textAlign: 'center',
          maxWidth: 280,
          marginBottom: 48,
        }}
      >
        {t('onboarding.subtitle')}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate('/choose-role')}
        style={{
          width: '100%',
          maxWidth: 320,
          padding: '16px 24px',
          borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)',
          color: '#fff',
          fontSize: 17,
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(124,111,247,0.4)',
        }}
      >
        {t('onboarding.cta')}
      </motion.button>
    </div>
  )
}
