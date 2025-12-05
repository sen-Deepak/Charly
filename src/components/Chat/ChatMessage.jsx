import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Unified ChatMessage component for displaying messages
 * Handles both user and bot messages with consistent styling
 * Supports markdown rendering for bot messages
 */
export default function ChatMessage({
  message = "",
  sender = "user", // 'user', 'bot', or 'error'
  timestamp = new Date(),
  metadata = null,
  suggestions = null,
  details = null,
  isError = false,
  botImage = null,
  responseTime = null,
}) {
  const isUser = sender === "user";
  const isBot = sender === "bot";
  const isErr = sender === "error";

  return (
    <div
      className={`flex gap-3 items-end w-full animate-fadeIn ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? "ml-2" : "mr-2"}`}>
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
            U
          </div>
        ) : isBot ? (
          <div className="w-8 h-8 rounded-full bg-secondary-200/20 flex items-center justify-center overflow-hidden shadow-lg">
            {botImage ? (
              <img
                src={botImage.startsWith('/') ? botImage : `/${botImage}`}
                alt="Bot"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                B
              </div>
            )}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center font-bold text-red-600 shadow-lg">
            !
          </div>
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[70%] rounded-2xl p-4 transition-all duration-200 hover:shadow-xl transform ${
          isUser
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-500/20"
            : isBot
            ? "bg-white shadow-lg rounded-tl-none"
            : "bg-red-50 text-red-700 border-l-4 border-red-500 rounded-tl-none shadow-lg"
        }`}
      >
        {/* Main message content */}
        <div
          className={`prose prose-sm max-w-none ${
            isErr ? "text-red-600" : isUser ? "text-white" : ""
          }`}
        >
          {isBot ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Style headings
                h1: ({ node, ...props }) => (
                  <h1
                    className="text-xl font-bold mb-3 text-primary"
                    {...props}
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    className="text-lg font-semibold mb-2 text-primary-600"
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <h3
                    className="text-md font-medium mb-2 text-primary-500"
                    {...props}
                  />
                ),

                // Style lists
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-4 space-y-1 mb-3" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-4 space-y-1 mb-3" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="text-gray-700" {...props} />
                ),

                // Style paragraphs
                p: ({ node, ...props }) => (
                  <p className="mb-2 text-gray-700" {...props} />
                ),

                // Style bold and italic
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-primary-700" {...props} />
                ),
                em: ({ node, ...props }) => (
                  <em className="text-secondary-600" {...props} />
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          ) : (
            message
          )}
        </div>

        {/* Error details if present */}
        {isErr && details && (
          <div className="mt-2 text-xs bg-red-100 rounded-lg p-2 border-l-2 border-red-400">
            <div className="text-red-700 font-medium mb-1">Error Details:</div>
            <div className="text-red-600">{details}</div>
          </div>
        )}

        {/* Suggestions if present */}
        {suggestions && (
          <div className="mt-3 bg-blue-50 rounded-lg p-2">
            <p className="text-xs font-medium text-blue-600 mb-1">Suggestions:</p>
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1.5">
              {Array.isArray(suggestions)
                ? suggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className="hover:text-blue-600 transition-colors duration-200"
                    >
                      {suggestion}
                    </li>
                  ))
                : <li className="hover:text-blue-600 transition-colors duration-200">{suggestions}</li>}
            </ul>
          </div>
        )}

        {/* Additional metadata if present */}
        {metadata && !isErr && (
          <div className="mt-2 text-xs text-gray-400">
            {Object.entries(metadata).map(([key, value]) => (
              <p key={key} className="metadata-item">
                {key}: {typeof value === "object" ? JSON.stringify(value) : value}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
