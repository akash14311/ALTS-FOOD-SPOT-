import React, { createContext, useContext, useState, useCallback } from 'react';
import AiAssistantModal from '../components/ai/AiAssistantModal';
import AiAssistantFab from '../components/ai/AiAssistantFab';

const AiAssistantContext = createContext(null);

export const AiAssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');

  const openAi = useCallback((prompt = '') => {
    setInitialPrompt(prompt);
    setIsOpen(true);
  }, []);

  const closeAi = useCallback(() => {
    setIsOpen(false);
    setInitialPrompt('');
  }, []);

  return (
    <AiAssistantContext.Provider value={{ isOpen, openAi, closeAi }}>
      {children}

      {/* Global Interactive Floating Action Button */}
      <AiAssistantFab onClick={() => openAi()} />

      {/* Global AI Assistant Drawer / Modal */}
      <AiAssistantModal
        isOpen={isOpen}
        onClose={closeAi}
        initialPrompt={initialPrompt}
      />
    </AiAssistantContext.Provider>
  );
};

export const useAiAssistant = () => {
  const context = useContext(AiAssistantContext);
  if (!context) {
    throw new Error('useAiAssistant must be used within an AiAssistantProvider');
  }
  return context;
};

