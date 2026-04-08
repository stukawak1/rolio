import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocaleContext, createTranslator } from './hooks/useLocale'
import Onboarding from './pages/Onboarding'
import ChooseRole from './pages/ChooseRole'
import Game from './pages/Game'
import './index.css'

const queryClient = new QueryClient()

function App() {
  const [locale, setLocale] = useState<'ru' | 'en'>('ru')
  const t = createTranslator(locale)

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/choose-role" element={<ChooseRole />} />
            <Route path="/game/:roleId" element={<Game />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </LocaleContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
