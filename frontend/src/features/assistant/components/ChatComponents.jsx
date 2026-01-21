import Button from "@/components/ui/Button";

export const ChatMessage = ({ sender, text }) => {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} `}>
      <div
        className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl shadow-md break-words transition-colors ${
          isUser
            ? "bg-green-500 text-white dark:bg-green-600"
            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export const ChatMessages = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-4">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} sender={msg.sender} text={msg.text} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export const ChatInput = ({
  input,
  onInputChange,
  onSend,
  onKeyPress,
  loading,
}) => {
  return (
    <div className="flex items-center space-x-4 px-4 pb-4 ">
      <input
        type="text"
        className="flex-1 px-4 py-3 rounded-xl shadow-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 dark:bg-gray-800 dark:text-gray-100 transition"
        placeholder="Ask me anything about your crops..."
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={onKeyPress}
        disabled={loading}
      />
      <Button
        onClick={onSend}
        disabled={loading}
        className="flex-shrink-0"
      >
        {loading ? "..." : "Send"}
      </Button>
    </div>
  );
};
