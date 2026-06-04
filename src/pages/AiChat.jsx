import React, { useState, useRef, useEffect } from 'react';
import SidebarLayout from '../components/SidebarLayout';
import { chatWithAI } from '../services/aiService';
import { Sparkles, Send, Mic, User, Bot, Plus, Trash2 } from 'lucide-react';
import './AiChat.css';

const QUICK_PROMPTS = [
  '✈️ Plan a trip to Japan',
  '💰 Budget tips for Europe',
  '🧳 What to pack for Bali?',
  '📋 Visa for Thailand',
  '🍜 Best food in Tokyo',
  '🏨 Cheap hotels in Goa',
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `✈️ **Hello! I'm your Traveloop AI Travel Agent!**

I can help you with:
- 🗺️ **Trip Planning** — Build complete itineraries for any destination
- 💰 **Budget Advice** — Smart spending tips and cost breakdowns
- 🧳 **Packing Lists** — What to bring for any trip
- 📋 **Visa Requirements** — Entry requirements for 190+ countries
- 🍜 **Local Recommendations** — Best food, hotels, and hidden gems

**Where are you dreaming of going?** Just ask me anything!`,
};

export default function AiChat() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const reply = await chatWithAI(newMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => setMessages([INITIAL_MESSAGE]);

  const renderMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  return (
    <SidebarLayout>
      <div className="ai-chat-page">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="ai-avatar"><Bot size={20} /></div>
            <div>
              <h2>Traveloop AI</h2>
              <div className="ai-online"><span className="online-dot" />Online · Powered by Gemini</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clearChat}><Trash2 size={14} /> Clear</button>
        </div>

        {/* Quick Prompts */}
        <div className="quick-prompts">
          {QUICK_PROMPTS.map(qp => (
            <button key={qp} className="quick-prompt-chip" onClick={() => sendMessage(qp)}>{qp}</button>
          ))}
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-msg ${msg.role}`}>
              <div className="msg-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className="msg-bubble">
                <div className="msg-content" dangerouslySetInnerHTML={{ __html: renderMessage(msg.content) }} />
                <div className="msg-time">{new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-msg assistant">
              <div className="msg-avatar"><Bot size={16} /></div>
              <div className="msg-bubble">
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <div className="chat-input-wrap">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Ask me anything about travel..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
          <p className="chat-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </SidebarLayout>
  );
}
