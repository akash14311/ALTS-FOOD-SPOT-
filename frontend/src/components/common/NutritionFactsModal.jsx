import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiShoppingBag,
  FiPlus,
  FiMinus,
  FiInfo,
  FiShield
} from 'react-icons/fi';
import { getDishNutrition, getDishQuantity } from '../../services/mockData';
import { useCart } from '../../context/CartContext';
import '../../styles/nutritionModal.css';

const NutritionFactsModal = ({
  isOpen,
  onClose,
  dish,
  restaurant,
}) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const [modalQty, setModalQty] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setModalQty(1);
    }
  }, [isOpen, dish]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !dish) return null;

  const nutrition = getDishNutrition(dish);
  const cartQty = getItemQuantity ? getItemQuantity(dish._id) : 0;
  const portionDesc = dish.quantity || getDishQuantity(dish);

  const handleAddFromModal = () => {
    if (restaurant) {
      addToCart(dish, restaurant, modalQty);
    } else {
      addToCart(dish, { _id: dish.restaurant || 'rest-1', name: 'Partner Restaurant' }, modalQty);
    }
    onClose();
  };

  return (
    <div className="nutrition-modal-overlay" onClick={onClose}>
      <div className="nutrition-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="nutrition-modal-header">
          <h3 className="nutrition-modal-title">
            <FiActivity style={{ color: '#10B981' }} /> Macro Nutrition & Health Facts
          </h3>
          <button
            type="button"
            className="nutrition-modal-close-btn"
            onClick={onClose}
            aria-label="Close nutrition facts modal"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="nutrition-modal-body">
          {/* Dish Snapshot */}
          <div className="nutrition-dish-preview">
            <img
              src={dish.image}
              alt={dish.name}
              className="nutrition-dish-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80';
              }}
            />
            <div className="nutrition-dish-info">
              <h4 className="nutrition-dish-name">{dish.name}</h4>
              <div className="nutrition-dish-meta">
                <span className={`badge ${dish.isVeg ? 'badge-veg' : 'badge-nonveg'}`}>
                  {dish.isVeg ? '● VEG' : '▲ NON-VEG'}
                </span>
                <span>• {dish.category}</span>
                <span>• 📦 {portionDesc}</span>
              </div>
            </div>
          </div>

          {/* Macro Calorie Hero Card */}
          <div className="macro-calorie-card">
            <div className="macro-calorie-top">
              <div>
                <div className="macro-calorie-num">{nutrition.calories} <span style={{ fontSize: '1rem', fontWeight: '600' }}>kcal</span></div>
                <div className="macro-calorie-sub">Total Energy per Serving ({nutrition.servingSize})</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily Value</span>
                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>
                  {nutrition.dailyValue.calories}%
                </div>
              </div>
            </div>

            {/* Macro Segments Progress Bar */}
            <div className="macro-bar-wrap">
              <div className="macro-bar-track">
                <div
                  className="macro-bar-protein"
                  style={{ width: `${nutrition.macroPct.protein}%` }}
                  title={`Protein: ${nutrition.macroPct.protein}% of calories`}
                />
                <div
                  className="macro-bar-carbs"
                  style={{ width: `${nutrition.macroPct.carbs}%` }}
                  title={`Carbohydrates: ${nutrition.macroPct.carbs}% of calories`}
                />
                <div
                  className="macro-bar-fat"
                  style={{ width: `${nutrition.macroPct.fat}%` }}
                  title={`Fats: ${nutrition.macroPct.fat}% of calories`}
                />
              </div>
            </div>

            {/* 3 Macro Pillars */}
            <div className="macro-pillars-grid">
              <div className="macro-pillar">
                <div className="macro-pillar-label" style={{ color: '#3B82F6' }}>
                  🥩 Protein
                </div>
                <div className="macro-pillar-val">{nutrition.protein}g</div>
                <div className="macro-pillar-pct">{nutrition.macroPct.protein}% cal ({nutrition.dailyValue.protein}% DV)</div>
              </div>

              <div className="macro-pillar">
                <div className="macro-pillar-label" style={{ color: '#10B981' }}>
                  🌾 Carbs
                </div>
                <div className="macro-pillar-val">{nutrition.carbs}g</div>
                <div className="macro-pillar-pct">{nutrition.macroPct.carbs}% cal ({nutrition.dailyValue.carbs}% DV)</div>
              </div>

              <div className="macro-pillar">
                <div className="macro-pillar-label" style={{ color: '#F59E0B' }}>
                  🥑 Fats
                </div>
                <div className="macro-pillar-val">{nutrition.fat}g</div>
                <div className="macro-pillar-pct">{nutrition.macroPct.fat}% cal ({nutrition.dailyValue.fat}% DV)</div>
              </div>
            </div>
          </div>

          {/* Standard Nutrition Breakdown Table */}
          <div className="nutrition-table-box">
            <div className="nutrition-table-header">
              <span>Nutrient</span>
              <span>Amount (% DV*)</span>
            </div>

            <div className="nutrition-table-row">
              <span className="nutrition-table-name">Total Fat</span>
              <span className="nutrition-table-val">
                {nutrition.fat}g <span className="nutrition-dv-tag">({nutrition.dailyValue.fat}%)</span>
              </span>
            </div>

            <div className="nutrition-table-row">
              <span className="nutrition-table-name">Total Carbohydrates</span>
              <span className="nutrition-table-val">
                {nutrition.carbs}g <span className="nutrition-dv-tag">({nutrition.dailyValue.carbs}%)</span>
              </span>
            </div>

            <div className="nutrition-table-row indent">
              <span>Dietary Fiber</span>
              <span>
                {nutrition.fiber}g <span className="nutrition-dv-tag">({nutrition.dailyValue.fiber}%)</span>
              </span>
            </div>

            <div className="nutrition-table-row indent">
              <span>Sugars</span>
              <span>{nutrition.sugar}g</span>
            </div>

            <div className="nutrition-table-row">
              <span className="nutrition-table-name">Protein</span>
              <span className="nutrition-table-val">
                {nutrition.protein}g <span className="nutrition-dv-tag">({nutrition.dailyValue.protein}%)</span>
              </span>
            </div>

            <div className="nutrition-table-row">
              <span className="nutrition-table-name">Sodium</span>
              <span className="nutrition-table-val">
                {nutrition.sodium}mg <span className="nutrition-dv-tag">({nutrition.dailyValue.sodium}%)</span>
              </span>
            </div>

            <div style={{ marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              *Percent Daily Values (% DV) are based on a standard 2,000-calorie reference diet for adults.
            </div>
          </div>

          {/* Highlights & Allergens */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              HEALTH HIGHLIGHTS & DIETARY TAGS:
            </div>
            <div className="nutrition-tags-row">
              {nutrition.highlights.map((tag, idx) => (
                <span key={idx} className="nutrition-badge-pill">
                  <FiCheckCircle size={12} /> {tag}
                </span>
              ))}
              {nutrition.allergens.map((alg, idx) => (
                <span key={idx} className="nutrition-allergen-pill">
                  <FiAlertCircle size={12} /> {alg}
                </span>
              ))}
            </div>
          </div>

          {/* Modal Purchase Action Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-color)',
            marginTop: '0.25rem',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Select Quantity:</div>
              <div className="qty-stepper qty-stepper-sm" style={{ marginTop: '0.25rem' }}>
                <button
                  type="button"
                  className="qty-stepper-btn"
                  onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                  disabled={modalQty <= 1}
                  aria-label="Decrease quantity"
                >
                  <FiMinus size={12} />
                </button>
                <span className="qty-val">{modalQty}</span>
                <button
                  type="button"
                  className="qty-stepper-btn"
                  onClick={() => setModalQty((q) => Math.min(20, q + 1))}
                  aria-label="Increase quantity"
                >
                  <FiPlus size={12} />
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1, minWidth: '160px', padding: '0.65rem 1.25rem' }}
              onClick={handleAddFromModal}
            >
              <FiShoppingBag /> Add {modalQty > 1 ? `(${modalQty}x)` : ''} • ₹{dish.price * modalQty}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionFactsModal;

