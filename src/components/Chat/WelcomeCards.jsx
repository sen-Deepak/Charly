import React from "react";

/**
 * Unified WelcomeCards component for displaying welcome message and cards
 * Shown when no messages exist, disappears once chat starts
 */
export default function WelcomeCards({
  title = "Welcome",
  subtitle = "How can I help you today?",
  description = "I'm here to assist you!",
  cards = [],
  onCardClick = () => {},
  showProfileName = false,
  profileName = "",
}) {
  return (
    <div className="flex flex-col items-center space-y-8 pt-8 animate-fadeIn">
      {/* Welcome Message */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {showProfileName && profileName
            ? `Hi, ${profileName.split(" ")[0]}`
            : title}
        </h1>
        <p className="text-lg text-gray-600">{subtitle}</p>
        <p className="text-sm text-gray-500 max-w-lg">{description}</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl pt-4">
        {cards.map((card, idx) => (
          <button
            key={idx}
            onClick={() => onCardClick(card.title)}
            className="group relative overflow-hidden rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
          >
            {/* Gradient Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            ></div>

            {/* Content */}
            <div className="relative space-y-3">
              <div className="text-3xl">{card.icon}</div>
              <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                {card.title}
              </h3>
            </div>

            {/* Hover Effect */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}
            ></div>
          </button>
        ))}
      </div>
    </div>
  );
}
