import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook to manage chat messages
 * @returns {Object} Messages state and handlers
 */
export const useMessages = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I'm AgriSense AI. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMessage = useCallback((sender, text) => {
    setMessages((prev) => [...prev, { sender, text }]);
  }, []);

  const sendMessage = useCallback(async (onAIResponse) => {
    if (!input.trim()) return;

    const userMessage = input;
    addMessage("user", userMessage);
    setInput("");
    setLoading(true);

    try {
      // Call the AI response handler
      if (onAIResponse) {
        const aiText = await onAIResponse(userMessage);
        addMessage("ai", aiText);
      } else {
        // Default mock response
        setTimeout(() => {
          addMessage(
            "ai",
            `You asked: "${userMessage}". Here's an AI-generated recommendation based on AgriSense data.`
          );
        }, 800);
      }
    } catch (error) {
      addMessage("ai", "Sorry, I encountered an error. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [input, addMessage]);

  const handleKeyPress = useCallback(
    (e, onAIResponse) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(onAIResponse);
      }
    },
    [sendMessage]
  );

  return {
    messages,
    input,
    loading,
    messagesEndRef,
    setInput,
    addMessage,
    sendMessage,
    handleKeyPress,
  };
};
