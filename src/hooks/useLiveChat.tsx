import { useState, createContext, useContext, ReactNode } from "react";

interface LiveChatContextType {
  isOpen: boolean;
  initialMessage: string | null;
  openChat: (message?: string) => void;
  closeChat: () => void;
  clearInitialMessage: () => void;
}

const LiveChatContext = createContext<LiveChatContextType | null>(null);

export function LiveChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const openChat = (message?: string) => {
    if (message) {
      setInitialMessage(message);
    }
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const clearInitialMessage = () => {
    setInitialMessage(null);
  };

  return (
    <LiveChatContext.Provider value={{
      isOpen,
      initialMessage,
      openChat,
      closeChat,
      clearInitialMessage
    }}>
      {children}
    </LiveChatContext.Provider>
  );
}

export function useLiveChat() {
  const context = useContext(LiveChatContext);
  if (!context) {
    throw new Error("useLiveChat must be used within LiveChatProvider");
  }
  return context;
}
