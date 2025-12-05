// HRDonna.jsx
import React, { useState, useRef, useEffect } from "react";
import { chatService } from "../services/chat.service";
import { supabase } from "../supabaseClient";
import { ResponseStatus } from "../utils/apiResponses";
import API_CONFIG from "../config/api.config";
import { generateHRDonnaChatId } from "../utils/chatIdService";
import ChatHeader from "../components/Chat/ChatHeader";
import WelcomeCards from "../components/Chat/WelcomeCards";
import ChatMessage from "../components/Chat/ChatMessage";
import SearchBar from "../components/Chat/SearchBar";
import SendButton from "../components/Chat/SendButton";
import VersionToggle from "../components/Chat/VersionToggle";

export default function HRDonna() {
  // Enhanced error and status handling
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [profile, setProfile] = useState({ full_name: '', role: '' });
  const [profileLoading, setProfileLoading] = useState(true);
  const [version, setVersion] = useState(() => {
    // Load version preference from localStorage
    return localStorage.getItem('hrDonnaVersion') || 'v1';
  });
  const [chatId, setChatId] = useState(() => {
    // Load or create chat ID from localStorage
    return localStorage.getItem('hrDonnaChatId') || generateHRDonnaChatId(version);
  });
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
          .select('full_name, role')
          .eq('id', userId)
          .single();
        if (error) throw error;
        if (mounted) setProfile({ full_name: data.full_name || '', role: data.role || '' });
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

  // Save chatId to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('hrDonnaChatId', chatId);
  }, [chatId]);

  const [isLoading, setIsLoading] = useState(false);

  const clearChat = () => {
    const newChatId = generateHRDonnaChatId(version);
    setChatId(newChatId);
    localStorage.setItem('hrDonnaChatId', newChatId);
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
      const response = await chatService.sendMessage(userMessage, version, chatId);
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

  const handleVersionChange = (newVersion) => {
    setVersion(newVersion);
    localStorage.setItem('hrDonnaVersion', newVersion);
  };

  return (
    <div className="h-full w-full flex items-start justify-start">
      <div className="w-full max-w mx-auto h-screen flex flex-col bg-gradient-to-br from-[#fafafa] to-[#fafafa]">
        {/* Chat Header */}
        <ChatHeader
          botName="HR Donna"
          botImage="https://i.ibb.co/BVF5synS/HR-Donna.jpg"
          subtitle="AI Assistant"
          showVerificationBadge={true}
          onNewChat={clearChat}
          isLoading={isLoading}
        />

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-transparent p-4 space-y-6 w-[800px] mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {messages.length === 0 ? (
            <WelcomeCards
              title="Welcome"
              subtitle="I am Donna, how can I help you today?"
              description="Ready to assist you with anything you need, from answering questions to providing recommendations. Let's get started!"
              cards={[
                {
                  title: "How many comp-off days do I have left?",
                  icon: "📅",
                  gradient: "from-blue-500 to-indigo-500"
                },
                {
                  title: "What's the new lunch time?",
                  icon: "🍱",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  title: "Latest leave rules?",
                  icon: "📖",
                  gradient: "from-orange-500 to-red-500"
                }
              ]}
              onCardClick={(cardTitle) => {
                setInputMessage(cardTitle);
                handleSendMessage(new Event('click'));
              }}
              showProfileName={!profileLoading}
              profileName={profile.full_name}
            />
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.content}
                sender={message.type}
                timestamp={new Date()}
                metadata={message.metadata}
                suggestions={message.suggestions}
                details={message.details}
                isError={message.error}
                botImage="https://i.ibb.co/BVF5synS/HR-Donna.jpg"
              />
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
          <div className="flex gap-3 w-[800px] mx-auto items-center">
            <SearchBar
              value={inputMessage}
              onChange={setInputMessage}
              onSubmit={handleSendMessage}
              placeholder="Type your message here..."
              disabled={isLoading}
              isLoading={isLoading}
            />
            <SendButton
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              isLoading={isLoading}
              variant="blue"
            />
            {profile.role === 'admin' && (
              <div className="ml-auto">
                <VersionToggle version={version} onVersionChange={handleVersionChange} />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
