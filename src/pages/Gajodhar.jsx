import React, { useState, useRef, useEffect } from "react";
import { chatService } from "../services/chat.service";
import API_CONFIG from "../config/api.config";
import { ResponseStatus } from "../utils/apiResponses";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BOT_AVATAR = "gajodhar.jpg";
const USER_AVATAR = null;

function Gajodhar() {
  const [messages, setMessages] = useState([]); // Make initial state empty
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredMsgIdx, setHoveredMsgIdx] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => setInput(e.target.value);

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
    setMessages([
      { text: "Chat refreshed. Welcome again to Gajodhar chat!", sender: "system" },
    ]);
    setInput("");
    setError(null);
  };

  return (
    <div className="h-full w-full flex items-start justify-center bg-gradient-to-br from-sky-50 via-white to-purple-100 min-h-screen">
      <div className="w-full max-w mx-auto h-screen flex flex-col bg-gradient-to-br from-white/80 to-blue-50/60 shadow-2xl ">
        {/* Chat Header */}
       <div className="flex flex-row items-center justify-between p-4  bg-transparent ">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-blue-300 p-[2px] shadow-xl">
              <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-white">
                <img src="Gajodhar.jpg" alt="Gajodhar Bot" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5">
                <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-60"></div>
                <div className="relative w-full h-full bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 bg-clip-text text-transparent tracking-wide">Gajodhar</h2>
              <div className="text-xs font-medium text-blue-700/80 mt-1">AI Assistant</div>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="group px-5 py-2 bg-gradient-to-r from-violet-500 to-cyan-400 hover:from-violet-600 hover:to-cyan-500 text-white rounded-xl shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 transform hover:scale-[1.02] active:scale-98 transition-all font-semibold text-base"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m11.09.567a7 7 0 11-2.586-7.41" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 w-[800px] mx-auto bg-transparent">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 opacity-70">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">Welcome to Gajodhar</h2>
              <div className="text-base text-gray-600 max-w-xl text-center mb-6">How can I help you today? I’m here to answer your questions, provide insights, and more!</div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.sender === "user";
              const isBot = msg.sender === "bot";
              const isErr = msg.sender === "error";
              return (
                <div key={idx} className={`flex gap-3 items-end w-full animate-fadeIn ${isUser ? "flex-row-reverse" : "flex-row"}`}> 
                  <div className="flex-shrink-0">
                    {isUser ? (
                      USER_AVATAR ? (
                        <img src={USER_AVATAR} alt="You" className="w-8 h-8 rounded-full bg-blue-400 object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-xl select-none">U</div>
                      )
                    ) : isBot ? (
                      <img src="Gajodhar.jpg" alt="GJ" className="w-8 h-8 rounded-full bg-sky-200 shadow-xl object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center font-bold text-pink-600 shadow">!</div>
                    )}
                  </div>

                  <div
                    className={`group relative max-w-[70%] transition-all duration-200 rounded-2xl p-4 md:p-5 shadow-lg border ${isUser
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none shadow-blue-500/20 border-blue-400'
                        : isBot
                        ? 'bg-white/80 text-gray-900 rounded-tl-none border-transparent'
                        : 'bg-red-50 text-red-700 border-red-300'} hover:shadow-2xl`}
                    onMouseEnter={() => setHoveredMsgIdx(idx)}
                    onMouseLeave={() => setHoveredMsgIdx(null)}
                    tabIndex={0}
                    style={{ outline: "none" }}
                  >
                    <div className={`prose prose-sm max-w-none ${isErr ? 'text-red-600' : isUser ? 'text-white' : ''}`}>
                      {isBot ? (
                        <>
                          <ReactMarkdown children={msg.text} remarkPlugins={[remarkGfm]} />
                          {msg.responseTime && (
                            <div className="text-xs mt-2 text-right text-gray-400 italic select-none">{`— ${msg.responseTime}s`}</div>
                          )}
                        </>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                </div>
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
          className="p-4 backdrop-blur-sm bg-transparent  flex gap-3 w-[800px] mx-auto"
          onSubmit={e => { e.preventDefault(); sendMessage(); }}
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base bg-white/80 shadow"
            placeholder={isLoading ? "Please wait for reply..." : "Type your message..."}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            className="px-7 py-3.5 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-500 text-white font-semibold rounded-full shadow-lg transition disabled:opacity-40"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <span className="flex items-center gap-1 text-base font-medium"><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>Sending...</span>
            ) : "Send"}
          </button>
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
      `}</style>
    </div>
  );
}

export default Gajodhar
