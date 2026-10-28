// app/frontend/src/App.jsx
import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import SchemesPage from './pages/SchemesPage';
import TranslatePage from './pages/TranslatePage';
import ApplicationsPage from './pages/ApplicationsPage';

// High-Resilience Error Boundary for System Reliability & Efficiency
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center text-center">
          <div className="card-neo bg-zinc-900 border-2 border-[#a3ff00] p-6 max-w-lg shadow-[6px_6px_0px_#a3ff00]">
            <span className="bg-[#ff007a] text-white text-xs font-mono font-bold px-2 py-0.5 uppercase">
              System Safeguard
            </span>
            <h1 className="text-2xl font-black text-[#a3ff00] mt-3 uppercase">
              Recoverable Application State
            </h1>
            <p className="text-sm text-zinc-300 mt-2 font-medium">
              A temporary display issue occurred. All citizen records remain safe in local offline storage.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-neo mt-4 bg-[#a3ff00] text-black font-extrabold uppercase px-4 py-2 border-2 border-black cursor-pointer"
            >
              Reload CivicConnect
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          {/* Skip link for WCAG Accessibility & Screen Readers */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#ffd600] focus:text-black focus:font-black focus:border-2 focus:border-black focus:shadow-[3px_3px_0px_#000]"
          >
            Skip to main content
          </a>

          <div className="min-h-screen bg-[#f8f9fa] text-black flex flex-col font-sans selection:bg-[#a3ff00] selection:text-black">
            {/* Top Sticky Header with Semantic Banner Role */}
            <Header />

            {/* Main Content Area */}
            <main
              id="main-content"
              role="main"
              tabIndex="-1"
              className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 outline-none"
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/schemes" element={<SchemesPage />} />
                <Route path="/translate" element={<TranslatePage />} />
                <Route path="/applications" element={<ApplicationsPage />} />
              </Routes>
            </main>

            {/* High-Contrast Neo-Brutalist Footer with Semantic Landmark */}
            <footer role="contentinfo" className="bg-black text-white border-t-2 border-black py-6 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="w-7 h-7 bg-[#a3ff00] text-black font-black flex items-center justify-center text-xs border border-black"
                  >
                    CC
                  </div>
                  <div>
                    <span className="font-extrabold uppercase text-sm tracking-tight text-white font-heading">
                      CivicConnect
                    </span>
                    <p className="text-[11px] text-zinc-400 m-0">
                      Citizen Grievance Resolution & Welfare Platform
                    </p>
                  </div>
                </div>

                {/* Verified Contact & Social Links with Accessible Labels */}
                <nav aria-label="Footer links" className="flex items-center gap-3">
                  {/* Gmail Link */}
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=gaurav@civicconnect.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Compose support email on Gmail to gaurav@civicconnect.in"
                    className="btn-neo bg-[#ff007a] hover:bg-[#e0006b] text-white border-2 border-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 no-underline cursor-pointer"
                    title="Compose Email on Gmail"
                  >
                    <svg aria-hidden="true" className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <span>Email Support</span>
                  </a>

                  {/* GitHub Profile Link */}
                  <a
                    href="https://github.com/Gravvx"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit Gravvx GitHub profile (opens in new tab)"
                    className="btn-neo bg-[#a3ff00] hover:bg-[#8ee000] text-black border-2 border-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 no-underline cursor-pointer"
                    title="Visit GitHub Profile (Gravvx)"
                  >
                    <svg aria-hidden="true" className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub (Gravvx)</span>
                  </a>
                </nav>
              </div>
            </footer>
          </div>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
