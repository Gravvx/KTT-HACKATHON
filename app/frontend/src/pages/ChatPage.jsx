// app/frontend/src/pages/ChatPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { chatAPI } from '../services/api';
import speechService from '../services/speech';

function ChatPage() {
  const { currentLanguage, currentLanguageInfo } = useLanguage();
  const location = useLocation();

  const [inputMessage, setInputMessage] = useState('');
  const [interimText, setInterimText] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text:
        currentLanguage === 'hi'
          ? 'नमस्ते! मैं सिविककनेक्ट नागरिक AI सहायक हूँ।\n\nसड़क के गड्ढे, कचरे का ढेर, गंदा पानी, बिजली कटौती या पेंशन से जुड़ी किसी भी समस्या के बारे में बोलकर या लिखकर बताएं। मैं आपको जिम्मेदार सरकारी विभाग, शिकायत पोर्टल और हेल्पलाइन नंबर तुरंत प्रदान करूँगा।'
          : 'Hello! I am your CivicConnect Civic Resolution Assistant.\n\nSpeak or type about any civic grievance (road potholes, overflowing garbage, contaminated water, power cuts, or pension issues). I will diagnose the issue, identify the responsible department, and give you step-by-step escalation procedures and official helplines.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [userGeminiKey, setUserGeminiKey] = useState(() => localStorage.getItem('civic_gemini_key') || '');
  const [showKeyModal, setShowKeyModal] = useState(false);

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, interimText, isAudioRecording]);

  useEffect(() => {
    if (isAudioRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAudioRecording]);

  // Handle incoming query passed via router navigation
  useEffect(() => {
    if (location.state?.initialQuery) {
      handleSendMessage(location.state.initialQuery);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSendMessage = async (textToSend = null, audioPayload = null) => {
    const message = textToSend || inputMessage;
    if (!message && !audioPayload) return;

    const trimmed = (message || '').trim();
    const userMsg = {
      sender: 'user',
      text: trimmed || '🎙️ [Spoken Voice Note Query]',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setInterimText('');
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(
        trimmed,
        currentLanguage,
        userGeminiKey || null,
        audioPayload?.base64 || null,
        audioPayload?.mimeType || null
      );
      const botMsg = {
        sender: 'bot',
        text: res.botResponse || 'No response available.',
        provider: res.provider,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '⚠️ Unable to connect to civic assistant. Please verify that the backend is active on http://localhost:5000.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Microphone
  const handleToggleMic = async () => {
    // If already in audio recording mode, stop and send
    if (isAudioRecording) {
      handleStopAudioRecording();
      return;
    }

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setInterimText('');

    try {
      // 1. Try browser SpeechRecognition
      const transcript = await speechService.startListening(currentLanguage, (interim) => {
        setInterimText(interim);
      });

      if (transcript && transcript.trim()) {
        setInputMessage(transcript);
        setInterimText('');
        handleSendMessage(transcript);
      }
    } catch (err) {
      console.warn('SpeechRecognition failed, switching to Audio Recording mode:', err.message);
      setIsListening(false);

      // 2. Automatic fallback: Direct voice audio recording
      try {
        await speechService.startAudioRecording();
        setIsAudioRecording(true);
      } catch (recordErr) {
        console.error('Audio recording failed:', recordErr);
        alert(recordErr.message || 'Microphone access is required.');
      }
    } finally {
      setIsListening(false);
      setInterimText('');
    }
  };

  const handleStopAudioRecording = async () => {
    setIsAudioRecording(false);
    try {
      const audioResult = await speechService.stopAudioRecording();
      if (audioResult && audioResult.base64) {
        handleSendMessage(null, audioResult);
      }
    } catch (err) {
      console.error('Error stopping audio recording:', err);
    }
  };

  const handleSpeak = async (text, index) => {
    if (!text) return;
    if (playingIndex === index) {
      window.speechSynthesis?.cancel();
      setPlayingIndex(null);
      return;
    }

    setPlayingIndex(index);
    try {
      await speechService.speak(text, currentLanguage);
    } catch (err) {
      console.error('Speech playback error:', err);
    } finally {
      setPlayingIndex(null);
    }
  };

  const saveGeminiKey = (key) => {
    setUserGeminiKey(key.trim());
    if (key.trim()) {
      localStorage.setItem('civic_gemini_key', key.trim());
    } else {
      localStorage.removeItem('civic_gemini_key');
    }
    setShowKeyModal(false);
  };

  const quickCivicPrompts = [
    {
      label: currentLanguage === 'hi' ? '🚧 सड़क के गड्ढे' : '🚧 Road Potholes',
      query: currentLanguage === 'hi' ? 'मेरी सड़क पर बहुत बड़ा गड्ढा है, इसकी शिकायत PWD में कैसे करें?' : 'Deep dangerous potholes on our main road, how to resolve with PWD?',
      bg: '#a3ff00',
      text: 'text-black',
    },
    {
      label: currentLanguage === 'hi' ? '🗑️ कचरे का ढेर' : '🗑️ Garbage Dump',
      query: currentLanguage === 'hi' ? 'कॉलोनी में 4 दिनों से कचरा नहीं उठा है, बदबू फैल रही है, Swachhata app पर कैसे दर्ज करें?' : 'Garbage has not been collected for 4 days, foul smell spreading. How to report to municipality?',
      bg: '#ff007a',
      text: 'text-white',
    },
    {
      label: currentLanguage === 'hi' ? '🚰 गंदा पानी / सीवर' : '🚰 Contaminated Water',
      query: currentLanguage === 'hi' ? 'हमारे नल से बदबूदार गंदा पानी आ रहा है, जल बोर्ड में आपातकालीन शिकायत कैसे करें?' : 'Sewage water leaking into drinking water supply pipeline, urgent steps needed.',
      bg: '#00d2ff',
      text: 'text-black',
    },
    {
      label: currentLanguage === 'hi' ? '⚡ स्ट्रीट लाइट बंद' : '⚡ Broken Streetlights',
      query: currentLanguage === 'hi' ? 'गली की स्ट्रीट लाइट 10 दिनों से बंद है, रात में अंधेरा रहता है।' : 'Streetlights are non-functional for past week, posing safety hazard at night.',
      bg: '#ffd600',
      text: 'text-black',
    },
  ];

  return (
    <div className="space-y-4 pb-8">
      {/* Container Card */}
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000000] flex flex-col h-[78vh] sm:h-[82vh]">
        {/* Chat Header */}
        <div className="bg-black text-white p-3.5 sm:p-4 border-b-2 border-black flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#a3ff00] text-black font-black flex items-center justify-center text-lg border border-black">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-white m-0">
                  AI Civic Grievance Resolver
                </h2>
                <span className="bg-[#a3ff00] text-black text-[9px] font-mono font-bold px-1.5 py-0.2 uppercase">
                  Gemini 2.5 Active
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-300 m-0">
                Voice Mode: <strong>{currentLanguage === 'hi' ? 'HINDI (हिंदी)' : 'ENGLISH (India)'}</strong> • Real-time AI Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyModal(true)}
              className="btn-neo bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-zinc-300 border border-zinc-700 px-2.5 py-1.5 cursor-pointer flex items-center gap-1"
              title="Configure Gemini API Key"
            >
              <span>🔑</span>
              <span>API Key</span>
            </button>

            <button
              onClick={() =>
                setMessages([
                  {
                    sender: 'bot',
                    text:
                      currentLanguage === 'hi'
                        ? 'चैट इतिहास साफ किया गया। अपनी नागरिक समस्या बताएं (सड़क, कचरा, पानी, बिजली या सरकारी योजनाएं)।'
                        : 'Chat history cleared. Speak or type any civic problem to get immediate department resolution.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ])
              }
              className="btn-neo bg-zinc-900 hover:bg-zinc-800 text-xs font-bold uppercase text-white border border-zinc-700 px-3 py-1.5 cursor-pointer"
            >
              Clear 🗑️
            </button>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="bg-zinc-100 border-b-2 border-black px-3 sm:px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono font-bold uppercase bg-black text-white px-2 py-0.5 shrink-0">
            One-Tap Queries:
          </span>
          {quickCivicPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className={`btn-neo text-xs font-bold uppercase px-3 py-1 border-2 border-black shrink-0 cursor-pointer ${p.text}`}
              style={{ backgroundColor: p.bg }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Active Microphone Banner (Speech Recognition) */}
        {isListening && (
          <div className="bg-[#a3ff00] text-black p-3 border-b-2 border-black flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="text-lg">🎙️</span>
              <span>
                Listening in {currentLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English'}... Speak your grievance now!
              </span>
              {interimText && (
                <span className="bg-black text-[#a3ff00] px-2 py-0.5 text-xs font-mono lowercase truncate max-w-xs">
                  "{interimText}"
                </span>
              )}
            </div>
            <button
              onClick={() => {
                speechService.stopListening();
                setIsListening(false);
              }}
              className="bg-black text-white px-3 py-1 text-xs font-extrabold uppercase border border-black hover:bg-zinc-900 cursor-pointer"
            >
              Done Speaking ➔
            </button>
          </div>
        )}

        {/* Active Audio Recording Banner (Direct Voice Note Mode) */}
        {isAudioRecording && (
          <div className="bg-[#ff007a] text-white p-3 border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
              <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
              <span>Recording Voice Note ({recordingSeconds}s)... Speak clearly in microphone!</span>
            </div>
            <button
              onClick={handleStopAudioRecording}
              className="btn-neo bg-black text-[#a3ff00] border-2 border-white px-3.5 py-1 text-xs font-extrabold uppercase cursor-pointer"
            >
              Send Voice Note ➔
            </button>
          </div>
        )}

        {/* Conversation Stream with ARIA Live for Screen Reader Accessibility */}
        <div
          role="log"
          aria-live="polite"
          aria-atomic="false"
          aria-label="Conversation with Civic AI"
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#f8f9fa]"
        >
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const isPlayingThis = playingIndex === index;

            return (
              <div
                key={index}
                className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 bg-black text-[#a3ff00] font-black flex items-center justify-center text-xs shrink-0 border border-black">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[80%] p-4 text-xs sm:text-sm font-medium border-2 border-black ${
                    isUser
                      ? 'bg-black text-white shadow-[3px_3px_0px_#a3ff00]'
                      : msg.isError
                      ? 'bg-[#ff007a] text-white shadow-[3px_3px_0px_#000000]'
                      : 'bg-white text-black shadow-[3px_3px_0px_#000000]'
                  }`}
                >
                  <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>

                  <div
                    className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                      isUser ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {msg.provider && (
                        <span className="bg-zinc-100 text-black px-1.5 py-0.2 border border-zinc-300 uppercase">
                          {msg.provider.includes('gemini') ? 'Gemini AI' : 'Civic Engine'}
                        </span>
                      )}
                    </div>

                    {!isUser && !msg.isError && (
                      <button
                        onClick={() => handleSpeak(msg.text, index)}
                        className={`font-bold flex items-center gap-1.5 cursor-pointer uppercase px-2 py-0.5 border border-black ${
                          isPlayingThis
                            ? 'bg-[#ff007a] text-white animate-pulse'
                            : 'bg-[#a3ff00] text-black hover:bg-[#8de000]'
                        }`}
                        title="Read aloud in native language"
                      >
                        <span>🔊</span>
                        <span>{isPlayingThis ? 'Stop Audio ⏹' : 'Listen 🔊'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 bg-[#a3ff00] text-black font-black flex items-center justify-center text-xs shrink-0 border border-black">
                    YOU
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-zinc-700 font-mono text-xs py-2 bg-zinc-100 p-3 border-2 border-black inline-flex">
              <span className="inline-block w-4 h-4 border-2 border-black border-t-[#a3ff00] animate-spin"></span>
              <span>CivicConnect Gemini AI is diagnosing problem & retrieving escalation portals...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Working Mic */}
        <div className="p-3 sm:p-4 bg-white border-t-2 border-black">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Real Mic Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              disabled={loading}
              aria-label={
                isAudioRecording
                  ? 'Stop voice recording'
                  : isListening
                  ? 'Stop speech recognition'
                  : 'Start speech-to-text dictation via microphone'
              }
              title={
                isAudioRecording
                  ? 'Click to stop recording and send'
                  : isListening
                  ? 'Click to stop'
                  : 'Speak via microphone (Hindi / English)'
              }
              className={`btn-neo p-3 border-2 border-black flex items-center justify-center cursor-pointer transition-colors ${
                isAudioRecording
                  ? 'bg-[#ff007a] text-white mic-active'
                  : isListening
                  ? 'bg-[#a3ff00] text-black animate-pulse'
                  : 'bg-[#a3ff00] hover:bg-[#8ee000] text-black'
              }`}
            >
              <span aria-hidden="true" className="text-base">{isAudioRecording ? '⏹️' : '🎙️'}</span>
            </button>

            <label htmlFor="chat-input-field" className="sr-only">Type civic issue inquiry</label>
            <input
              id="chat-input-field"
              type="text"
              aria-label="Civic grievance query input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isAudioRecording
                  ? 'Recording voice note... speak now!'
                  : isListening
                  ? 'Listening in microphone... speak now!'
                  : currentLanguage === 'hi'
                  ? 'सड़क, कचरा, पानी या बिजली की समस्या यहां लिखें या माइक दबाकर बोलें...'
                  : 'Describe your road, sanitation, water, or electricity issue (or click mic to speak)...'
              }
              className="flex-1 border-2 border-black px-4 py-2.5 text-xs sm:text-sm font-medium outline-none bg-zinc-50 focus:bg-white"
            />

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              aria-label="Send civic inquiry message"
              className="btn-neo bg-black hover:bg-zinc-900 text-[#a3ff00] border-2 border-black font-extrabold px-5 py-2.5 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40"
            >
              Send ➔
            </button>
          </form>
        </div>
      </div>

      {/* Gemini API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black max-w-md w-full p-6 shadow-[8px_8px_0px_#000000] relative">
            <button
              onClick={() => setShowKeyModal(false)}
              className="absolute top-4 right-4 text-black hover:bg-zinc-200 w-8 h-8 font-bold border-2 border-black flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-3">
              <span className="bg-[#a3ff00] text-black text-[10px] font-mono font-bold px-2 py-0.5 uppercase">
                AI Provider Settings
              </span>
              <h3 className="text-lg font-black uppercase text-black m-0">
                Google Gemini 2.5 Flash
              </h3>
              <p className="text-xs text-zinc-600 font-medium">
                Gemini API is already configured on your backend server. You can also override or provide your custom Gemini API key below.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase text-black mb-1">
                  Custom Gemini API Key (Optional)
                </label>
                <input
                  type="password"
                  value={userGeminiKey}
                  onChange={(e) => setUserGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full border-2 border-black p-2 text-xs font-mono outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t-2 border-black">
                <button
                  type="button"
                  onClick={() => saveGeminiKey('')}
                  className="px-3 py-1.5 text-xs font-bold uppercase text-red-600 hover:bg-red-50 border border-transparent cursor-pointer"
                >
                  Reset Default
                </button>
                <button
                  type="button"
                  onClick={() => saveGeminiKey(userGeminiKey)}
                  className="btn-neo bg-black text-[#a3ff00] px-4 py-2 text-xs font-bold uppercase cursor-pointer"
                >
                  Save & Apply ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
