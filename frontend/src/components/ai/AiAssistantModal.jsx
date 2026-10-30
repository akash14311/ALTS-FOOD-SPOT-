import React, { useState, useEffect, useRef } from 'react';
import {
  FiX,
  FiSend,
  FiTrash2,
  FiShoppingBag,
  FiPlus,
  FiMinus,
  FiActivity,
  FiCompass,
  FiCheckCircle,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { queryAiAssistant, STARTER_PROMPTS } from '../../services/aiAssistantService';
import NutritionFactsModal from '../common/NutritionFactsModal';
import '../../styles/aiAssistant.css';

const INITIAL_GREETING = {
  id: 'greeting',
  sender: 'assistant',
  text: "Hello! I am your ALTS AI Food Concierge 👨‍🍳. Tell me what you're craving, your calorie/macro goals, or choose any option button below to get personalized suggestions:",
  items: [],
  followUpOptions: [
    { label: '💪 High Protein (>30g)', query: 'Show high protein dishes with over 30g protein' },
    { label: '🥗 Low Calorie (<450 kcal)', query: 'Healthy meals under 450 calories' },
    { label: '💰 Best under ₹250', query: 'Top rated budget meals under 250' },
    { label: '🍲 Best Biryani', query: 'Recommend the best aromatic Dum Biryanis' },
  ],
};

const AiAssistantModal = ({ isOpen, onClose, initialPrompt = '' }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cardQuantities, setCardQuantities] = useState({});
  const [nutritionModalDish, setNutritionModalDish] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-send initial prompt if triggered from an option button
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCardQtyChange = (dishId, delta) => {
    setCardQuantities((prev) => {
      const cur = prev[dishId] || 1;
      const next = Math.max(1, Math.min(20, cur + delta));
      return { ...prev, [dishId]: next };
    });
  };

  const handleSendMessage = async (queryToSend) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const data = await queryAiAssistant(text);
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        items: data.items || [],
        followUpOptions: data.followUpOptions || [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Apologies! I encountered a small hiccup searching for dishes. Please try another option button below:',
          items: [],
          followUpOptions: STARTER_PROMPTS.slice(0, 4),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_GREETING]);
  };

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal-header">
          <div className="ai-header-profile">
            <div className="ai-avatar-badge">
              <HiSparkles />
              <span className="ai-online-dot"></span>
            </div>
            <div>
              <h3 className="ai-header-title">ALTS AI Concierge</h3>
              <span className="ai-header-sub">Smart Taste & Macro Assistant</span>
            </div>
          </div>

          <div className="ai-header-actions">
            <button
              type="button"
              className="ai-header-btn"
              onClick={handleClearChat}
              title="Reset conversation"
            >
              <FiTrash2 size={16} />
            </button>
            <button
              type="button"
              className="ai-header-btn"
              onClick={onClose}
              aria-label="Close AI Assistant"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Quick Option Buttons Bar */}
        <div className="ai-prompts-bar">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              className="ai-option-pill"
              onClick={() => handleSendMessage(prompt.query)}
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="ai-chat-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-message-row ${msg.sender}`}>
              <div className={`ai-bubble ${msg.sender}`}>{msg.text}</div>

              {/* Embedded Dish Cards if suggested */}
              {msg.items && msg.items.length > 0 && (
                <div className="ai-dish-recommendations-list">
                  {msg.items.map((dish) => {
                    const cartQty = getItemQuantity ? getItemQuantity(dish._id) : 0;
                    const selectedQty = cardQuantities[dish._id] || 1;

                    return (
                      <div key={dish._id} className="ai-dish-card">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="ai-dish-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80';
                          }}
                        />

                        <div className="ai-dish-content">
                          <h4 className="ai-dish-title">{dish.name}</h4>
                          <div className="ai-dish-restaurant">
                            by {dish.restaurant?.name || 'ALTS Partner Kitchen'}
                          </div>

                          <div className="ai-dish-badges">
                            <span
                              className={`badge ${dish.isVeg ? 'badge-veg' : 'badge-nonveg'}`}
                              style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                            >
                              {dish.isVeg ? '● VEG' : '▲ NON-VEG'}
                            </span>
                            <span
                              className="dish-quantity-pill"
                              style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                            >
                              📦 {dish.quantity}
                            </span>
                            {dish.nutrition && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--primary)',
                                  fontWeight: '700',
                                }}
                              >
                                ⚡ {dish.nutrition.calories} kcal • 🥩 {dish.nutrition.protein}g P
                              </span>
                            )}
                          </div>

                          <div className="ai-dish-action-row">
                            <div className="ai-dish-price">₹{dish.price}</div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <button
                                type="button"
                                className="btn-nutrition-facts"
                                style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}
                                onClick={() => setNutritionModalDish(dish)}
                                title="View Macro Nutrition Facts"
                              >
                                <FiActivity size={11} /> Macros
                              </button>

                              {cartQty === 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <div className="qty-picker" style={{ minWidth: '70px', padding: '1px 3px' }}>
                                    <button
                                      type="button"
                                      className="qty-picker-btn"
                                      style={{ width: '20px', height: '20px' }}
                                      onClick={() => handleCardQtyChange(dish._id, -1)}
                                      disabled={selectedQty <= 1}
                                    >
                                      <FiMinus size={10} />
                                    </button>
                                    <span className="qty-picker-val" style={{ fontSize: '0.75rem' }}>
                                      {selectedQty}
                                    </span>
                                    <button
                                      type="button"
                                      className="qty-picker-btn"
                                      style={{ width: '20px', height: '20px' }}
                                      onClick={() => handleCardQtyChange(dish._id, 1)}
                                    >
                                      <FiPlus size={10} />
                                    </button>
                                  </div>

                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                                    onClick={() =>
                                      addToCart(
                                        dish,
                                        dish.restaurant || { _id: 'rest-1', name: 'Partner' },
                                        selectedQty
                                      )
                                    }
                                  >
                                    <FiPlus /> Add
                                  </button>
                                </div>
                              ) : (
                                <div className="qty-stepper" style={{ transform: 'scale(0.85)' }}>
                                  <button
                                    className="qty-stepper-btn"
                                    onClick={() => updateQuantity(dish._id, cartQty - 1)}
                                  >
                                    <FiMinus />
                                  </button>
                                  <span className="qty-val">{cartQty}</span>
                                  <button
                                    className="qty-stepper-btn"
                                    onClick={() => updateQuantity(dish._id, cartQty + 1)}
                                  >
                                    <FiPlus />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Follow-up Quick Option Buttons */}
              {msg.followUpOptions && msg.followUpOptions.length > 0 && (
                <div className="ai-followup-chips">
                  {msg.followUpOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="ai-chip-btn"
                      onClick={() => handleSendMessage(opt.query)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="ai-message-row assistant">
              <div className="ai-bubble assistant">
                <span className="ai-typing-indicator">
                  <span className="ai-typing-dot"></span>
                  <span className="ai-typing-dot"></span>
                  <span className="ai-typing-dot"></span>
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="ai-chat-input-area">
          <form
            className="ai-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              className="ai-input-field"
              placeholder="Ask, e.g. 'Spicy dinner under ₹300 with high protein'..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping}
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={!inputText.trim() || isTyping}
              title="Send to AI Assistant"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Embedded Macro Nutrition Facts Modal */}
      <NutritionFactsModal
        isOpen={Boolean(nutritionModalDish)}
        onClose={() => setNutritionModalDish(null)}
        dish={nutritionModalDish}
        restaurant={nutritionModalDish?.restaurant}
      />
    </div>
  );
};

export default AiAssistantModal;
