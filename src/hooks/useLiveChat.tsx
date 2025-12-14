import { useState, createContext, useContext, ReactNode } from "react";

interface LiveChatContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
}

const LiveChatContext = createContext<LiveChatContextType | null>(null);

export function LiveChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <LiveChatContext.Provider value={{
      isOpen,
      openChat: () => setIsOpen(true),
      closeChat: () => setIsOpen(false)
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
