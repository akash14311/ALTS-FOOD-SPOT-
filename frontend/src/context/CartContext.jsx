import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useToast } from './ToastContext';
import { FiArrowLeft, FiX } from 'react-icons/fi';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { showToast } = useToast();

  const [cartState, setCartState] = useState(() => {
    try {
      const saved = localStorage.getItem('altsfoodspot_cart') || localStorage.getItem('foodspot_cart');
      return saved ? JSON.parse(saved) : { items: [], restaurant: null, coupon: null };
    } catch {
      return { items: [], restaurant: null, coupon: null };
    }
  });

  // State to manage restaurant switch confirmation dialog
  const [restaurantConflict, setRestaurantConflict] = useState(null);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('altsfoodspot_cart', JSON.stringify(cartState));
  }, [cartState]);

  // Escape key to dismiss conflict popup
  useEffect(() => {
    if (!restaurantConflict) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setRestaurantConflict(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [restaurantConflict]);

  // Helper to query quantity of an item currently in cart
  const getItemQuantity = (foodId) => {
    const found = cartState.items.find((item) => item._id === foodId);
    return found ? found.quantity : 0;
  };

  // Add item to cart with single-restaurant enforcement and custom quantity selection
  const addToCart = (foodItem, restaurantInfo, quantityToAdd = 1) => {
    const qtyToAdd = Math.max(1, parseInt(quantityToAdd, 10) || 1);
    const { items, restaurant } = cartState;

    // Check if adding from a different restaurant
    if (restaurant && restaurant._id !== restaurantInfo._id && items.length > 0) {
      // Trigger confirmation dialog
      setRestaurantConflict({
        incomingItem: { ...foodItem, requestedQty: qtyToAdd },
        incomingRestaurant: restaurantInfo,
        currentRestaurantName: restaurant.name,
      });
      return false;
    }

    // Add or increment
    setCartState((prev) => {
      const existingIndex = prev.items.findIndex((item) => item._id === foodItem._id);
      let updatedItems;

      if (existingIndex > -1) {
        updatedItems = prev.items.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + qtyToAdd } : item
        );
      } else {
        updatedItems = [...prev.items, { ...foodItem, quantity: qtyToAdd }];
      }

      return {
        ...prev,
        restaurant: restaurantInfo,
        items: updatedItems,
      };
    });

    showToast(`Added ${qtyToAdd > 1 ? `${qtyToAdd}x ` : ''}${foodItem.name} to cart`, 'success');
    return true;
  };

  // Switch restaurant confirmed by user
  const confirmSwitchRestaurant = () => {
    if (!restaurantConflict) return;
    const { incomingItem, incomingRestaurant } = restaurantConflict;
    const initialQty = incomingItem.requestedQty || 1;

    setCartState({
      items: [{ ...incomingItem, quantity: initialQty }],
      restaurant: incomingRestaurant,
      coupon: null,
    });

    setRestaurantConflict(null);
    showToast(`Started new cart from ${incomingRestaurant.name}`, 'info');
  };

  // Cancel switch
  const cancelSwitchRestaurant = () => {
    setRestaurantConflict(null);
  };

  // Update item quantity
  const updateQuantity = (foodId, newQty) => {
    setCartState((prev) => {
      if (newQty <= 0) {
        const remainingItems = prev.items.filter((item) => item._id !== foodId);
        return {
          ...prev,
          items: remainingItems,
          restaurant: remainingItems.length === 0 ? null : prev.restaurant,
          coupon: remainingItems.length === 0 ? null : prev.coupon,
        };
      }

      return {
        ...prev,
        items: prev.items.map((item) =>
          item._id === foodId ? { ...item, quantity: newQty } : item
        ),
      };
    });
  };

  // Remove single item completely
  const removeItem = (foodId) => {
    updateQuantity(foodId, 0);
  };

  // Clear entire cart
  const clearCart = () => {
    setCartState({ items: [], restaurant: null, coupon: null });
  };

  // Apply Coupon
  const applyCoupon = (couponData) => {
    setCartState((prev) => ({
      ...prev,
      coupon: couponData,
    }));
    showToast(`Coupon ${couponData.code} applied!`, 'success');
  };

  // Remove Coupon
  const removeCoupon = () => {
    setCartState((prev) => ({
      ...prev,
      coupon: null,
    }));
    showToast('Coupon removed', 'info');
  };

  // Pricing calculations according to business rules
  const calculations = useMemo(() => {
    const subtotal = cartState.items.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
      0
    );

    // Free delivery above Rs 499, else Rs 40
    let deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
    const platformFee = subtotal > 0 ? 5 : 0;
    const tax = Math.round(subtotal * 0.05); // 5% GST

    // Coupon discount calculation
    let discount = 0;
    if (cartState.coupon && subtotal > 0) {
      const c = cartState.coupon;
      if (c.type === 'freeDelivery') {
        if (subtotal >= (c.minOrder || 249)) {
          discount = deliveryFee;
          deliveryFee = 0;
        }
      } else if (c.type === 'percent') {
        if (subtotal >= (c.minOrder || 0)) {
          const rawDiscount = Math.round((subtotal * c.value) / 100);
          discount = c.maxDiscount ? Math.min(rawDiscount, c.maxDiscount) : rawDiscount;
        }
      } else if (c.type === 'flat') {
        if (subtotal >= (c.minOrder || 0)) {
          discount = Math.min(c.value, subtotal);
        }
      }
    }

    const total = Math.max(0, subtotal + deliveryFee + platformFee + tax - discount);
    const totalItemsCount = cartState.items.reduce((count, item) => count + item.quantity, 0);

    return {
      subtotal,
      deliveryFee,
      platformFee,
      tax,
      discount,
      total,
      totalItemsCount,
    };
  }, [cartState.items, cartState.coupon]);

  return (
    <CartContext.Provider
      value={{
        items: cartState.items,
        restaurant: cartState.restaurant,
        coupon: cartState.coupon,
        addToCart,
        updateQuantity,
        getItemQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        restaurantConflict,
        confirmSwitchRestaurant,
        cancelSwitchRestaurant,
        ...calculations,
      }}
    >
      {children}

      {/* Single-Restaurant Conflict Modal */}
      {restaurantConflict && (
        <div className="modal-overlay" onClick={cancelSwitchRestaurant}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={cancelSwitchRestaurant}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem' }}
                title="Back to Previous Section"
              >
                <FiArrowLeft size={15} />
                <span>Back</span>
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={cancelSwitchRestaurant}
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close"
              >
                <FiX size={16} />
              </button>
            </div>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--primary)' }}>Replace cart items?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Your cart currently contains delicious items from{' '}
              <strong>{restaurantConflict.currentRestaurantName}</strong>. A cart can only contain dishes from one restaurant at a time.
            </p>
            <p style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontWeight: '500' }}>
              Would you like to clear your current cart and start a new order with{' '}
              <strong>{restaurantConflict.incomingRestaurant.name}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-secondary"
                onClick={cancelSwitchRestaurant}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FiArrowLeft size={14} />
                <span>Back (Keep Cart)</span>
              </button>
              <button className="btn btn-primary" onClick={confirmSwitchRestaurant}>
                Start New Order
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
