import React from 'react';
import { HiSparkles } from 'react-icons/hi';
import '../../styles/aiAssistant.css';

const AiAssistantFab = ({ onClick }) => {
  return (
    <div className="ai-fab-container">
      <button
        type="button"
        className="ai-fab-btn"
        onClick={onClick}
        aria-label="Open ALTS AI Food Concierge"
        id="ai-assistant-fab-btn"
      >
        <span className="ai-fab-sparkle">
          <HiSparkles />
        </span>
        <span>AI Food Assistant</span>
      </button>
    </div>
  );
};

export default AiAssistantFab;
