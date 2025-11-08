// HRDonna.jsx
import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiPaperclip, FiMic, FiZap } from 'react-icons/fi'
import { chatService } from "../services/chat.service";
import { ResponseStatus } from "../utils/apiResponses";
import API_CONFIG from "../config/api.config";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function HRDonna() {
  // Enhanced error and status handling
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setError(null);
    setApiStatus(null);
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage);
      setApiStatus(response.status);
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.message,
        metadata: response.metadata,
        suggestions: response.suggestions,
        details: response.details
      }]);
    } catch (error) {
      console.error('Error:', error);
      setError(error);
      setApiStatus(error.status);

      setMessages(prev => [...prev, {
        type: 'bot',
        content: error.message,
        error: true,
        code: error.code,
        suggestions: error.suggestions,
        details: error.details
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const starterPrompts = [
    'What are our PTO policies?',
    'Show onboarding checklist for new hires',
    'How do I request remote work?',
    'Benefits summary for full-time employees'
  ]

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-secondary-900 via-secondary-800/40 to-success-900/30">
      {/* Decorative background grid + radial glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-[36rem] w-[36rem] rounded-full bg-secondary-600/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      <div className="relative mx-auto max-w-5xl min-h-screen flex flex-col p-4 lg:p-6">
        {/* Chat shell */}
        <div className="flex flex-col flex-1 rounded-2xl bg-white/70 shadow-2xl ring-1 ring-black/5 backdrop-blur-md overflow-hidden">
          {/* Chat Header */}
          <div className="relative z-10 bg-gradient-to-r from-secondary-700/10 to-accent-600/10 px-4 sm:px-6 py-4 border-b border-black/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-md bg-secondary-200/30">
                  <img src="/HR-Donna.jpg" alt="HR Donna" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-semibold text-primary-700">HR Donna</h1>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 ring-1 ring-primary/10">
                      <FiZap className="h-3 w-3" /> Enterprise
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="relative inline-flex h-2 w-2"><span className="absolute inline-flex h-2 w-2 rounded-full bg-success-400 animate-ping" /><span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" /></span>
                    Online • Secure HR Assistant
                  </div>
                </div>
              </div>
              {/* Right side header actions (placeholder for future) */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 rounded-md bg-white/70 ring-1 ring-black/5">v1.0</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4 no-scrollbar">
            {/* Starter prompts (only when empty) */}
            {messages.length === 0 && (
              <div className="mx-auto max-w-2xl">
                <div className="mb-3 text-sm text-gray-500">Try asking:</div>
                <div className="flex flex-wrap gap-2">
                  {starterPrompts.map((p, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setInputMessage(p)}
                      className="px-3 py-1.5 rounded-full bg-white text-gray-700 hover:text-primary-700 hover:ring-primary/20 ring-1 ring-black/5 shadow-sm transition"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`flex items-end gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type !== 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden ring-1 ring-black/5 bg-secondary-200/50">
                    <img src="/HR-Donna.jpg" alt="HR" className="w-full h-full object-cover" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-br-sm'
                      : `bg-white/90 text-gray-800 ring-1 ring-black/5 rounded-bl-sm ${message.error ? 'ring-red-300/60' : ''}`
                  }`}
                >
                  {/* Main message content */}
                  <div className={`prose prose-sm max-w-none ${message.error ? 'text-red-600' : ''}`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 text-primary-700" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2 text-primary-600" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 text-primary-500" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-3" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 mb-3" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 text-gray-700" {...props} />,
                        a: ({node, ...props}) => <a className="text-primary-600 underline hover:text-primary-700" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-primary-700" {...props} />,
                        em: ({node, ...props}) => <em className="text-secondary-600" {...props} />,
                        code: ({node, ...props}) => <code className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  {/* Error details if present */}
                  {message.error && message.details && (
                    <div className="mt-2 text-xs text-red-500 border-l-2 border-red-300 pl-2">
                      {message.details}
                    </div>
                  )}

                  {/* Suggestions if present */}
                  {message.suggestions && (
                    <div className="mt-3">
                      <p className="text-xs text-secondary-500 mb-1">Suggestions:</p>
                      <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                        {Array.isArray(message.suggestions)
                          ? message.suggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))
                          : <li>{message.suggestions}</li>
                        }
                      </ul>
                    </div>
                  )}

                  {/* Additional metadata if present */}
                  {message.metadata && !message.error && (
                    <div className="mt-2 text-[11px] text-gray-400">
                      {Object.entries(message.metadata).map(([key, value]) => (
                        <p key={key} className="metadata-item">
                          {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white grid place-items-center ring-1 ring-black/5">U</div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 ring-1 ring-black/5 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="relative z-10 border-t border-black/5 bg-white/80 backdrop-blur px-3 sm:px-6 py-3">
            <div className="mx-auto max-w-3xl">
              <div className="flex items-center gap-2 rounded-full ring-1 ring-black/10 bg-white shadow-sm px-3 py-1.5">
                <button type="button" title="Attach" className="p-2 rounded-full text-gray-500 hover:text-primary-700 hover:bg-primary-50 transition">
                  <FiPaperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask HR Donna anything about policies, benefits, onboarding..."
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 px-1"
                />
                <button type="button" title="Voice" className="p-2 rounded-full text-gray-500 hover:text-primary-700 hover:bg-primary-50 transition">
                  <FiMic className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FiSend className="h-5 w-5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>

              {/* Footer helper text */}
              <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-2">
                <span>HR Donna respects your privacy. Responses may be AI-assisted.</span>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Utilities */}
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </div>
  );
}
