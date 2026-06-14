import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App } from './App.js'
import { HowItWorks } from './pages/HowItWorks.js'
import { Privacy } from './pages/Privacy.js'
import { Terms } from './pages/Terms.js'
import { ConsentBanner, getConsent } from './components/ConsentBanner.js'
import { loadAnalytics } from './analytics.js'
import './index.css'

function Root() {
  const [, setConsent] = useState(getConsent())

  const handleConsent = (v: 'accepted' | 'declined' | null) => {
    setConsent(v)
    if (v === 'accepted') loadAnalytics()
  }

  // Load analytics immediately if already accepted on a previous visit
  if (getConsent() === 'accepted') loadAnalytics()

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </BrowserRouter>
      <ConsentBanner onConsent={handleConsent} />
    </>
  )
}

createRoot(document.getElementById('root')!).render(<Root />)
