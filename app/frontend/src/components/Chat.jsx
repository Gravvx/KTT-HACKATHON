// app/frontend/src/components/Chat.jsx
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { chatAPI } from '../services/api';

const Chat = () => {
  const { currentLanguage } = useLanguage();
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await chatAPI.sendMessage(message, currentLanguage);
      setResponse(res.botResponse || res.reply || 'No response from assistant.');
    } catch (err) {
      console.error('Chat error:', err);
      setResponse('⚠️ Error communicating with civic chat backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-xl shadow-sm bg-white">
      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 m-0">
        <span>💬</span> Quick Citizen Query Widget
      </h3>
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a quick question..."
          className="border border-gray-300 p-2 text-sm flex-1 rounded-lg outline-blue-500"
        />
        <button
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 text-sm rounded-lg font-medium cursor-pointer transition"
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
      {response && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-700 whitespace-pre-line">
          <strong className="text-blue-700 block mb-1">Civic Assistant:</strong>
          {response}
        </div>
      )}
    </div>
  );
};

export default Chat;
