import React from "react";

/**
 * Unified ChatHeader component for chat pages
 * Displays bot avatar, name, status, and new chat button
 * Keeps bot-specific name and image while providing consistent styling
 */
export default function ChatHeader({
  botName = "Chat Bot",
  botImage = "bot-avatar.jpg",
  subtitle = "AI Assistant",
  showVerificationBadge = true,
  onNewChat = () => {},
  isLoading = false,
}) {
  return (
    <div className="backdrop-blur-sm bg-transparent p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Bot Avatar with Status Indicator */}
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 p-[2px] shadow-lg">
            <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-white">
              <img
                src={botImage}
                alt={botName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online Status Indicator */}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-full h-full bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>

          {/* Bot Info */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {botName}
              </h1>
              {/* Verification Badge */}
              {showVerificationBadge && (
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-600/90">{subtitle}</span>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          disabled={isLoading}
          className="group px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">New Chat</span>
        </button>
      </div>
    </div>
  );
}
