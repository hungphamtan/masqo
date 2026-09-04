import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { App } from './App.js'
import { HowItWorks } from './pages/HowItWorks.js'
import { Privacy } from './pages/Privacy.js'
import { Terms } from './pages/Terms.js'
import { WebAppDetail } from './pages/how-it-works/WebApp.js'
import { ExtensionDetail } from './pages/how-it-works/Extension.js'
import { CliDetail } from './pages/how-it-works/Cli.js'
import { EngineDetail } from './pages/how-it-works/Engine.js'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/how-it-works/web-app" element={<WebAppDetail />} />
      <Route path="/how-it-works/extension" element={<ExtensionDetail />} />
      <Route path="/how-it-works/cli" element={<CliDetail />} />
      <Route path="/how-it-works/engine" element={<EngineDetail />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
    </Routes>
  </BrowserRouter>
)
