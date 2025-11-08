// HRDonna.jsx
import React, { useState, useRef, useEffect } from "react";
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

  return (
    <div className="h-full w-full flex items-start justify-start">
      <div className="w-full max-w mx-auto h-screen flex flex-col bg-gradient-to-br from-[#7DD1D3] to-[#E6FBEB]">
        {/* Chat Header */}
        <div className="backdrop-blur-sm bg-transparent p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-200/20 flex items-center justify-center overflow-hidden">
                  <img
                  src="HR-Donna.jpg"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            <div>
              <h1 className="text-xl font-bold text-black">HR Donna</h1>
            </div>
          </div>
        </div>

  {/* Chat Messages */}
  <div className="flex-1 overflow-y-auto bg-transparent p-1 space-y-4 scrollbar-hide  max-w-[800px] mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
 
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-accent text-white rounded-br-none'
                    : `bg-white shadow-md rounded-bl-none ${
                        message.error ? 'border-l-4 border-red-500' : ''
                      }`
                }`}
              >
                {/* Main message content */}
                <div className={`prose prose-sm max-w-none ${message.error ? 'text-red-600' : ''}`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Style headings
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-3 text-primary" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-2 text-primary-600" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-md font-medium mb-2 text-primary-500" {...props} />,
                      
                      // Style lists
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-3" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 mb-3" {...props} />,
                      li: ({node, ...props}) => <li className="text-gray-700" {...props} />,
                      
                      // Style paragraphs
                      p: ({node, ...props}) => <p className="mb-2 text-gray-700" {...props} />,
                      
                      // Style bold and italic
                      strong: ({node, ...props}) => <strong className="font-bold text-primary-700" {...props} />,
                      em: ({node, ...props}) => <em className="text-secondary-600" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Error details if present */}
                {message.error && message.details && (
                  <div className="mt-2 text-xs text-red-400 border-l-2 border-red-400 pl-2">
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
                  <div className="mt-2 text-xs text-gray-400">
                    {Object.entries(message.metadata).map(([key, value]) => (
                      <p key={key} className="metadata-item">
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-md rounded-lg rounded-bl-none p-4 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 backdrop-blur-sm bg-transparent">
          <div className="flex justify-center gap-2 max-w-[800px] mx-auto">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-600 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}