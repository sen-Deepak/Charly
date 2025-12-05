import React, { useState, useRef, useEffect } from "react";
import { chatService } from "../services/chat.service";
import API_CONFIG from "../config/api.config";
import { ResponseStatus } from "../utils/apiResponses";
import { generateGajodharChatId } from "../utils/chatIdService";
import ChatHeader from "../components/Chat/ChatHeader";
import WelcomeCards from "../components/Chat/WelcomeCards";
import ChatMessage from "../components/Chat/ChatMessage";
import SearchBar from "../components/Chat/SearchBar";
import SendButton from "../components/Chat/SendButton";

const BOT_AVATAR = "/gajodhar.jpg";
const USER_AVATAR = null;
const CHAT_ID_STORAGE_KEY = "gajodharChatId";
const CHAT_STORAGE_KEY = "gajodhar_chat_history";

const loadStoredMessages = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(CHAT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Failed to load chat history", err);
    return [];
  }
};

const saveMessagesToStorage = (messages) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.error("Failed to save chat history", err);
  }
};

const getOrCreateChatId = () => {
  if (typeof window === "undefined") return generateGajodharChatId();
  try {
    const stored = window.localStorage.getItem(CHAT_ID_STORAGE_KEY);
    if (stored) return stored;
    const newId = generateGajodharChatId();
    window.localStorage.setItem(CHAT_ID_STORAGE_KEY, newId);
    return newId;
  } catch (err) {
    console.error("Failed to manage chat ID", err);
    return generateGajodharChatId();
  }
};

function Gajodhar() {
  const [messages, setMessages] = useState(() => loadStoredMessages());
  const [chatId, setChatId] = useState(() => getOrCreateChatId());
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredMsgIdx, setHoveredMsgIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      hasHydratedRef.current = true;
      return;
    }
    saveMessagesToStorage(messages);
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(CHAT_ID_STORAGE_KEY, chatId);
  }, [chatId]);

  const handleInputChange = (e) => setInput(e.target.value);

  const handleNewChat = () => {
    const newChatId = generateGajodharChatId();
    setChatId(newChatId);
    localStorage.setItem(CHAT_ID_STORAGE_KEY, newChatId);
    setMessages([]);
    setError(null);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setError(null);
    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      { text: userMessage, sender: "user" }
    ]);
    setInput("");
    const start = Date.now();
    try {
      const response = await chatService.sendAgentMessage({
        message: userMessage,
        chatId,
        url: API_CONFIG.GAJODHAR_FULL_URL,
      });
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      setMessages((prev) => [
        ...prev,
        {
          text: response.message || "No response from agent.",
          sender: "bot",
          status: response.status,
          responseTime: elapsed,
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          text: err.message || "An error occurred. Please try again.",
          sender: "error",
        }
      ]);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRefresh = () => {
    const newChatId = generateGajodharChatId();
    setChatId(newChatId);
    localStorage.setItem(CHAT_ID_STORAGE_KEY, newChatId);
    setMessages([]);
    setInput("");
    setError(null);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  return (
    <div className="h-full w-full flex items-start justify-center bg-transparent min-h-screen">
      <div className="w-full max-w mx-auto h-screen flex flex-col bg-gradient-to-br from-[#DAE2F8] via-white to-[#D6A4A4] shadow-2xl ">
        {/* Chat Header */}
        <ChatHeader
          botName="Gajodhar"
          botImage="/Gajodhar.jpg"
          subtitle="AI Assistant"
          showVerificationBadge={true}
          onNewChat={handleRefresh}
          isLoading={isLoading}
        />

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 w-[800px] mx-auto bg-transparent">
          {messages.length === 0 ? (
            <WelcomeCards
              title="Welcome Buddy"
              subtitle="How can I help you today?"
              description="I'm here to answer your questions, provide insights, and more from the Meme Department!"
              cards={[
                {
                  title: "What’s the content count from last week?",
                  icon: "📊",
                  gradient: "from-blue-500 to-indigo-500"
                },
                {
                  title: "Who produced the most content yesterday?",
                  icon: "🚀",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  title: "How did Nitin Sharma perform last month?",
                  icon: "📅",
                  gradient: "from-orange-500 to-red-500"
                }
              ]}
              onCardClick={(cardTitle) => {
                setInput(cardTitle);
                sendMessage();
              }}
            />
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              return (
                <ChatMessage
                  key={idx}
                  message={msg.text}
                  sender={msg.sender}
                  timestamp={new Date()}
                  metadata={null}
                  suggestions={null}
                  details={null}
                  isError={msg.sender === "error"}
                  botImage={isUser ? null : "/Gajodhar.jpg"}
                  responseTime={msg.responseTime || null}
                />
              );
            })
          )}
          {isLoading && (
            <div className="flex gap-3 mt-4 items-end">
              <img src={BOT_AVATAR} className="w-8 h-8 rounded-full object-cover shadow" alt="..." />
              <div className="bg-white/70 text-gray-500 px-6 py-3 rounded-2xl rounded-tl-none shadow animate-pulse max-w-[70%] transition">Gajodhar is typing...</div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Input Bar */}
        <form
          className="p-4 backdrop-blur-sm bg-transparent flex gap-3 w-[800px] mx-auto"
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
        >
          <SearchBar
            value={input}
            onChange={setInput}
            onSubmit={sendMessage}
            placeholder="Type your message..."
            disabled={isLoading}
            isLoading={isLoading}
            onKeyDown={handleKeyDown}
          />
          <SendButton
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            isLoading={isLoading}
            variant="gradient"
          />
        </form>
        {error && (
          <div className="mx-8 my-4 px-5 py-2 rounded-xl border border-red-300 bg-red-50 text-red-600 text-center animate-pulse text-sm shadow">
            {error}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn, .animate-fade-in { animation: fade-in 0.2s cubic-bezier(0.49,0.41,0.53,0.95); }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default Gajodhar
