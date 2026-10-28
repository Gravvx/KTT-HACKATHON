// app/frontend/src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function Header() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Civic Grievances', icon: '🚧' },
    { to: '/chat', label: 'AI Civic Assistant', icon: '🤖' },
    { to: '/schemes', label: 'Welfare Schemes', icon: '🏛️' },
    { to: '/translate', label: 'Voice & Translate', icon: '🗣️' },
    { to: '/applications', label: 'Track Records', icon: '📋' },
  ];

  return (
    <header role="banner" className="sticky top-0 z-40 bg-[#000000] text-white border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          aria-label="CivicConnect Home - Return to dashboard"
          className="flex items-center gap-2.5 text-white no-underline group outline-none focus:ring-2 focus:ring-[#a3ff00]"
        >
          <div
            aria-hidden="true"
            className="w-9 h-9 bg-[#a3ff00] text-black font-black flex items-center justify-center text-lg border border-black shadow-[2px_2px_0px_#ffffff] group-hover:rotate-3 transition-transform"
          >
            CC
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white uppercase font-heading">
                CivicConnect
              </span>
              <span className="bg-[#a3ff00] text-black text-[10px] font-bold px-1.5 py-0.2 uppercase tracking-wider">
                Civic-AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 m-0 hidden sm:block">
              Citizen Grievance Resolution & Welfare Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav role="navigation" aria-label="Main Navigation" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 no-underline border ${
                  isActive
                    ? 'bg-[#a3ff00] text-black border-[#a3ff00] shadow-[2px_2px_0px_#ffffff]'
                    : 'text-zinc-300 border-transparent hover:text-white hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <span aria-hidden="true" className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Language Selector & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center bg-zinc-900 border-2 border-zinc-700 px-2.5 py-1.5 shadow-[2px_2px_0px_#000000]">
            <span aria-hidden="true" className="text-xs mr-1.5">🌐</span>
            <label htmlFor="language-select" className="sr-only">Choose Language</label>
            <select
              id="language-select"
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer border-none uppercase focus:ring-1 focus:ring-[#a3ff00]"
              style={{ colorScheme: 'dark' }}
              aria-label="Select Interface Language"
            >
              {Object.entries(languages).map(([code, info]) => (
                <option key={code} value={code} className="bg-black text-white">
                  {info.flag} {info.name} ({code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            className="lg:hidden p-2 bg-zinc-900 border-2 border-zinc-700 text-white cursor-pointer hover:bg-zinc-800 transition"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-menu"
          role="navigation"
          aria-label="Mobile Navigation"
          className="lg:hidden bg-zinc-950 border-t-2 border-zinc-800 px-4 py-3 space-y-2"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider no-underline border ${
                  isActive
                    ? 'bg-[#a3ff00] text-black border-[#a3ff00]'
                    : 'text-zinc-300 border-zinc-800 hover:bg-zinc-900'
                }`}
              >
                <span aria-hidden="true">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export default Header;
