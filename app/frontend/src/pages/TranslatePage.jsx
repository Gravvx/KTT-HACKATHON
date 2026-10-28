// app/frontend/src/pages/TranslatePage.jsx
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translationAPI } from '../services/api';
import speechService from '../services/speech';

function TranslatePage() {
  const { currentLanguage, languages } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState(currentLanguage || 'hi');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [detectedSource, setDetectedSource] = useState(null);

  const sampleQueries = [
    { label: 'Pension Eligibility', text: 'What documents are required for old age pension?' },
    { label: 'Healthcare Scheme', text: 'How do I get Ayushman Bharat cashless hospital card?' },
    { label: 'Ration Quota', text: 'Where can I collect my monthly grain ration?' },
    { label: 'Road Potholes', text: 'Where to report dangerous potholes on main road?' },
  ];

  const handleTranslate = async (textOverride = null) => {
    const textToTranslate = textOverride || inputText;
    if (!textToTranslate.trim()) return;

    setLoading(true);
    setDetectedSource(null);
    try {
      const res = await translationAPI.translateText(textToTranslate, targetLang, sourceLang);
      setTranslatedText(res.translatedText || '');
      if (res.sourceLang) setDetectedSource(res.sourceLang);
    } catch (err) {
      console.error('Translation error:', err);
      alert('Translation failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    try {
      const transcript = await speechService.startListening(
        sourceLang === 'auto' ? currentLanguage : sourceLang
      );
      if (transcript && transcript.trim()) {
        setInputText(transcript);
        handleTranslate(transcript);
      }
    } catch (err) {
      console.warn('Speech input ended:', err.message);
      if (err.message && !err.message.includes('No words detected')) {
        alert(err.message);
      }
    } finally {
      setIsListening(false);
    }
  };

  const handleSpeakText = async (text, lang) => {
    if (!text) return;
    setIsSpeaking(true);
    try {
      await speechService.speak(text, lang || targetLang);
    } catch (err) {
      console.error('Speech playback error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang === 'auto') return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title Banner */}
      <section className="bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_#000000]">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#ff007a] text-white text-[11px] font-mono font-bold px-2.5 py-0.5 uppercase tracking-wider">
            Voice & Language Studio
          </div>
          <h1 className="text-2xl sm:text-4xl font-black uppercase text-black tracking-tight leading-tight">
            MULTILINGUAL SPEECH & TEXT TRANSLATOR
          </h1>
          <p className="text-xs sm:text-sm text-zinc-700 font-medium leading-relaxed">
            Speak or type queries in any Indian dialect. Instant translation with audio speech playback designed for low-literacy accessibility.
          </p>
        </div>
      </section>

      {/* Sample Quick Questions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] font-mono font-bold uppercase bg-black text-[#a3ff00] px-2 py-1 shrink-0">
          Try Query:
        </span>
        {sampleQueries.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputText(item.text);
              handleTranslate(item.text);
            }}
            className="btn-neo text-xs font-bold uppercase px-3 py-1.5 bg-white text-black border-2 border-black whitespace-nowrap cursor-pointer hover:bg-zinc-100"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Interactive Two-Panel Translator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Source Input */}
        <div className="card-neo bg-white flex flex-col justify-between">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <span className="text-xs font-bold uppercase text-black flex items-center gap-1.5">
                <span>📝</span> Source Input
              </span>
              <div className="flex items-center gap-1">
                <label htmlFor="source-lang-select" className="text-[11px] text-zinc-500 font-medium">From:</label>
                <select
                  id="source-lang-select"
                  aria-label="Select source language"
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="text-xs font-bold bg-zinc-100 border-2 border-black px-2 py-1 outline-none uppercase cursor-pointer"
                >
                  <option value="auto">Auto Detect</option>
                  {Object.entries(languages).map(([code, info]) => (
                    <option key={code} value={code}>
                      {info.flag} {info.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <label htmlFor="translation-input-textarea" className="sr-only">Source query text</label>
            <textarea
              id="translation-input-textarea"
              aria-label="Source text to translate"
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question or query here, or tap the microphone below to speak in Hindi or English..."
              className="w-full text-sm font-medium text-black outline-none resize-none bg-transparent placeholder:text-zinc-400"
            />
          </div>

          <div className="p-4 bg-zinc-50 border-t-2 border-black flex items-center justify-between">
            <button
              onClick={handleVoiceInput}
              aria-label={isListening ? 'Stop microphone dictation' : 'Tap to speak via microphone'}
              className={`btn-neo px-4 py-2 text-xs font-extrabold uppercase tracking-wider border-2 border-black flex items-center gap-2 cursor-pointer ${
                isListening
                  ? 'bg-[#ff007a] text-white mic-active'
                  : 'bg-[#a3ff00] text-black hover:bg-[#8ee000]'
              }`}
            >
              <span>🎙️</span>
              <span>{isListening ? 'Listening (Click to Stop)' : 'Tap to Speak'}</span>
            </button>

            <div className="flex items-center gap-2">
              {inputText && (
                <button
                  onClick={() => {
                    setInputText('');
                    setTranslatedText('');
                  }}
                  className="text-xs font-bold uppercase text-zinc-500 hover:text-black cursor-pointer px-2"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => handleTranslate()}
                disabled={loading || !inputText.trim()}
                className="btn-neo bg-black text-[#a3ff00] hover:bg-zinc-900 border-2 border-black px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Translating...' : 'Translate ➔'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Translated Output */}
        <div className="card-neo bg-white flex flex-col justify-between">
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <span className="text-xs font-bold uppercase text-black flex items-center gap-1.5">
                <span>🌐</span> Translated Result
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSwap}
                  title="Swap languages"
                  className="px-2 py-1 text-xs font-bold bg-white border border-black hover:bg-zinc-100 cursor-pointer"
                >
                  ⇄
                </button>
                <span className="text-[11px] text-zinc-500 font-medium">To:</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="text-xs font-bold bg-zinc-100 border-2 border-black px-2 py-1 outline-none uppercase cursor-pointer"
                >
                  {Object.entries(languages).map(([code, info]) => (
                    <option key={code} value={code}>
                      {info.flag} {info.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="min-h-[144px] text-sm font-medium leading-relaxed">
              {loading ? (
                <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs pt-4">
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-[#a3ff00] animate-spin"></span>
                  Processing translation...
                </div>
              ) : translatedText ? (
                <div className="text-black font-semibold">{translatedText}</div>
              ) : (
                <p className="text-xs font-medium text-zinc-400 italic pt-4">
                  Translated regional text will appear here. Tap "Listen" to hear it pronounced out loud in your selected language.
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-zinc-50 border-t-2 border-black flex items-center justify-between">
            <div className="text-[11px] font-mono font-bold text-zinc-600 uppercase">
              {detectedSource ? `Source: ${detectedSource}` : `Target: ${targetLang.toUpperCase()}`}
            </div>

            <button
              onClick={() => handleSpeakText(translatedText, targetLang)}
              disabled={!translatedText || isSpeaking}
              className="btn-neo bg-[#00d2ff] hover:bg-[#00beea] text-black border-2 border-black px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <span>🔊</span>
              <span>{isSpeaking ? 'Playing Audio...' : 'Listen Audio'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TranslatePage;
