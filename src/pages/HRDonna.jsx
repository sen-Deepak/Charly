// HRDonna.jsx
import React, { useState, useRef, useEffect } from "react";
import { chatService } from "../services/chat.service";
import { supabase } from "../supabaseClient";
import { ResponseStatus } from "../utils/apiResponses";
import API_CONFIG from "../config/api.config";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function HRDonna() {
  // Enhanced error and status handling
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [profile, setProfile] = useState({ full_name: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on initial render
    const savedMessages = localStorage.getItem('hrDonnaChat');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        if (!userId) {
          setProfileLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();
        if (error) throw error;
        if (mounted) setProfile({ full_name: data.full_name || '' });
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };

    fetchProfile();
    return () => { mounted = false };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('hrDonnaChat', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const [isLoading, setIsLoading] = useState(false);

  const clearChat = () => {
    setMessages([]);
    setError(null);
    setApiStatus(null);
    setInputMessage('');
    localStorage.removeItem('hrDonnaChat'); // Clear the chat from localStorage
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
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
      <div className="w-full max-w mx-auto h-screen flex flex-col bg-gradient-to-br from-[#fafafa] to-[#fafafa]">
        {/* Chat Header */}
        <div className="backdrop-blur-sm bg-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 p-[2px] shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-white">
                  <img
                    src="HR-Donna.jpg"
                    alt="HR Donna"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Online Status Indicator */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-full h-full bg-green-500 rounded-full border-2 border-white"></div>
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    HR Donna
                  </h1>
                  {/* Premium Verification Badge */}
                 
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-blue-600/90">AI Assistant</span>
                  
                </div>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="group px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">New Chat</span>
            </button>
          </div>
        </div>

  {/* Chat Messages */}
  <div className="w-[800px] h-[calc(100vh-160px)] overflow-y-auto bg-transparent p-4 space-y-6 mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
    {messages.length === 0 ? (
              <div className="flex flex-col items-center space-y-8 pt-8 animate-fadeIn">
                {/* Welcome Message */}
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {profileLoading 
                    ? "Welcome" 
                    : `Hi, ${profile.full_name ? profile.full_name.split(' ')[0] : 'User'}`}
                </h1>
                <p className="text-lg text-gray-600">
                  I am Donna, how can I help you today?
                </p>
                <p className="text-sm text-gray-500 max-w-lg">
                  Ready to assist you with anything you need, from answering questions to providing recommendations. Let's get started!
                </p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-2xl pt-4">
                {[
                  {
                    title: "How many comp-off days do I have left?",
                    icon: "📅",
                    gradient: "from-blue-500 to-indigo-500"
                  },
                  {
                    title: "What’s the new lunch time?",
                    icon: "🍱",
                    gradient: "from-purple-500 to-pink-500"
                  },
                  {
                    title: "Latest leave rules?",
                    icon: "📖",
                    gradient: "from-orange-500 to-red-500"
                  }
                ].map((card, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputMessage(card.title);
                      handleSendMessage(new Event('click'));
                    }}
                    className="group relative overflow-hidden rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    {/* Content */}
                    <div className="relative space-y-3">
                      <div className="text-3xl">{card.icon}</div>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                        {card.title}
                      </h3>
                    </div>

                    {/* Hover Effect */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                  </button>
                ))}
              </div>
            </div>
           ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-end gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-2' : 'mr-2'}`}>
                  {message.type === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                      U
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary-200/20 flex items-center justify-center overflow-hidden">
                      <img
                        src="HR-Donna.jpg"
                        alt="HR Donna"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[70%] rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none shadow-blue-500/20'
                    : `bg-white shadow-lg rounded-tl-none ${
                        message.error ? 'border-l-4 border-red-500' : ''
                      }`
                } shadow-lg transform transition-all duration-200 hover:shadow-xl`}
              >
                {/* Main message content */}
                <div className={`prose prose-sm max-w-none ${message.error ? 'text-red-600' : message.type === 'user' ? 'text-white' : ''}`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Style headings
                      h1: ({node, ...props}) => <h1 className={`text-xl font-bold mb-3 ${message.type === 'user' ? 'text-white' : 'text-primary'}`} {...props} />,
                      h2: ({node, ...props}) => <h2 className={`text-lg font-semibold mb-2 ${message.type === 'user' ? 'text-white' : 'text-primary-600'}`} {...props} />,
                      h3: ({node, ...props}) => <h3 className={`text-md font-medium mb-2 ${message.type === 'user' ? 'text-white' : 'text-primary-500'}`} {...props} />,
                      
                      // Style lists
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 mb-3" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 space-y-1 mb-3" {...props} />,
                      li: ({node, ...props}) => <li className={message.type === 'user' ? 'text-white/90' : 'text-gray-700'} {...props} />,
                      
                      // Style paragraphs
                      p: ({node, ...props}) => <p className={`mb-2 ${message.type === 'user' ? 'text-white/90' : 'text-gray-700'}`} {...props} />,
                      
                      // Style bold and italic
                      strong: ({node, ...props}) => <strong className={`font-bold ${message.type === 'user' ? 'text-white' : 'text-primary-700'}`} {...props} />,
                      em: ({node, ...props}) => <em className={message.type === 'user' ? 'text-white/80' : 'text-secondary-600'} {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>

                {/* Timestamp */}
                <div className={`mt-2 text-xs ${message.type === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                  {new Date().toLocaleTimeString()}
                </div>

                {/* Error details if present */}
                {message.error && message.details && (
                  <div className="mt-2 text-xs bg-red-50 rounded-lg p-2 border-l-2 border-red-400">
                    <div className="text-red-500 font-medium mb-1">Error Details:</div>
                    <div className="text-red-400">
                      {message.details}
                    </div>
                  </div>
                )}

                {/* Suggestions if present */}
                {message.suggestions && (
                  <div className="mt-3 bg-blue-50 rounded-lg p-2">
                    <p className="text-xs font-medium text-blue-600 mb-1">Suggestions:</p>
                    <ul className="list-disc list-inside text-xs text-gray-600 space-y-1.5">
                      {Array.isArray(message.suggestions) 
                        ? message.suggestions.map((suggestion, i) => (
                            <li key={i} className="hover:text-blue-600 transition-colors duration-200">{suggestion}</li>
                          ))
                        : <li className="hover:text-blue-600 transition-colors duration-200">{message.suggestions}</li>
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
            ))
    )}
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
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
            >
              <span>Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}