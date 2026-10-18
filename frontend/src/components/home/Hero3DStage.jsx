import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import {
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiStar,
  FiRotateCw,
  FiLayers,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiExternalLink,
  FiX,
  FiArrowLeft,
} from 'react-icons/fi';
import '../../styles/hero3d.css';

// Custom inline SVG Flame icon
const FlameIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    width="1em"
    height="1em"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.32 1.83-6.19 4.54-7.69.45-.25 1.02.04 1.08.55.15 1.25.75 2.37 1.66 3.16.29.25.72.08.79-.3 0-2.31 1.4-4.8 3.51-6.52.37-.3.92-.07.96.4.15 1.7.97 3.2 2.21 4.15.34.26.83.08.92-.33.31-1.38.83-2.6 1.54-3.56.28-.38.83-.34.98.11 1.25 3.65 1.81 7.27.81 10.53C20.01 19.5 16.32 23 12 23z" />
  </svg>
);

// 4 Signature Dishes with Rich Interactive Telemetry
// 4 Signature Dishes with Rich Interactive Telemetry
const HERO_3D_DISHES = [
  {
    id: 'hero-dish-1',
    name: 'Hyderabadi Dum Biryani',
    cuisine: 'Royal Mughlai & Aged Saffron Basmati',
    price: 280,
    rating: 4.9,
    reviews: '2,480',
    deliveryTime: '22 mins',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    badge: 'Trending #1 🔥',
    icon: '🍲',
    calories: '540 kcal',
    protein: '28g',
    carbs: '62g',
    fat: '16g',
    isVeg: false,
    spiceLevel: 3,
    chef: 'Chef Farhan Qureshi',
    chefHeritage: '24 Years Awadhi Royal Kitchen Experience',
    chefSecret: 'Charcoal-sealed brass handi with 45-min slow saffron steam infusion.',
    recentReviews: [
      { user: 'Priya Sharma', rating: 5, comment: 'The saffron aroma hits you the moment you unseal the box!' },
      { user: 'Rahul V.', rating: 5, comment: 'Incredible tender mutton, authentic Hyderabadi flavor.' },
    ],
    ingredients: [
      {
        name: 'Saffron Basmati',
        note: 'Aged 2 Years in Dehradun',
        icon: '🌾',
        x: -110,
        y: -70,
        origin: 'Himalayan foothills of Dehradun, aged in teakwood silos for extra-long non-sticky grains.',
        craft: 'Slow-steamed over low charcoal with hand-bloomed Kashmiri Mongra saffron stigmas.',
        nutrition: 'Complex slow-release carbohydrates • Gluten-free • Natural antioxidants.',
      },
      {
        name: 'Tender Meat',
        note: 'Marinated in Ghee & Curd for 12h',
        icon: '🥩',
        x: 110,
        y: -65,
        origin: 'Prime farm-raised cuts tenderized with raw papaya pulp and fresh highland yogurt.',
        craft: 'Simmered in sealed handi so succulent juices infuse deep into the aged marrow.',
        nutrition: '28g High-bioavailability complete protein • High in bio-iron and zinc.',
      },
      {
        name: 'Caramelized Birista',
        note: 'Slow Golden-Fried Onions',
        icon: '🧅',
        x: -115,
        y: 65,
        origin: 'Crisp Nashik pink onions hand-sliced to uniform ribbons.',
        craft: 'Slow-rendered in pure cow ghee until achieving a deep sweet mahogany glaze.',
        nutrition: 'Rich in dietary quercetin flavonoids and prebiotic fiber.',
      },
      {
        name: 'Shahi Garam Masala',
        note: 'Green Cardamom, Star Anise & Mace',
        icon: '✨',
        x: 115,
        y: 70,
        origin: 'Single-estate Idukki green cardamom, Ceylon mace, and Malabar black pepper.',
        craft: 'Freshly stone-pounded in small artisanal batches right before cooking.',
        nutrition: 'Thermogenic digestive aid • Calming anti-inflammatory phytonutrients.',
      },
    ],
    restaurant: {
      _id: 'rest-4',
      name: 'Biryani House',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'hero-dish-2',
    name: 'Artisan Cheesy Crust Pizza',
    cuisine: 'Stone-Baked Sourdough & Fresh Mozzarella',
    price: 399,
    rating: 4.8,
    reviews: '1,890',
    deliveryTime: '25 mins',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80',
    badge: 'Chef Choice 🍕',
    icon: '🍕',
    calories: '680 kcal',
    protein: '22g',
    carbs: '78g',
    fat: '24g',
    isVeg: true,
    spiceLevel: 1,
    chef: 'Chef Marco Bellini',
    chefHeritage: 'Naples Certified Master Pizzaiolo',
    chefSecret: '480°C volcanic stone oven bake with 48h cold-fermented mother dough.',
    recentReviews: [
      { user: 'Ananya D.', rating: 5, comment: 'Cheesy crust pull is insane! Fresh basil makes all the difference.' },
      { user: 'Kunal M.', rating: 4.8, comment: 'Crisp light airy dough, zero heavy bloated feeling.' },
    ],
    ingredients: [
      {
        name: 'San Marzano Sauce',
        note: 'D.O.P. Sweet Italian Plum Tomatoes',
        icon: '🍅',
        x: -110,
        y: -70,
        origin: 'Volcanic valley of Mount Vesuvius, naturally sun-ripened with sweet balanced acidity.',
        craft: 'Hand-crushed with sea salt and cold-pressed extra virgin olive oil.',
        nutrition: 'Extremely rich in lycopene and vitamin C • 100% natural, zero refined sugars.',
      },
      {
        name: 'Fior Di Latte',
        note: 'Fresh Whole-Milk Mozzarella',
        icon: '🧀',
        x: 110,
        y: -65,
        origin: 'Handcrafted daily in traditional Campania style using pure whole milk curd.',
        craft: 'Blistered into bubbly golden patches with an elastic, decadent cheese-pull.',
        nutrition: 'Rich in bone-strengthening calcium and bioavailable dairy proteins.',
      },
      {
        name: 'Sourdough Crust',
        note: '48-Hour Cold Wild Fermentation',
        icon: '🥖',
        x: -115,
        y: 65,
        origin: 'Italian Tipo 00 unbleached wheat flour cultivated with a 12-year sourdough culture.',
        craft: 'Baked on 480°C volcanic stone for a crisp airy honeycomb cornicione crust.',
        nutrition: 'Low glycemic index • Naturally broken-down gluten for effortless digestion.',
      },
      {
        name: 'Genovese Basil',
        note: 'Fresh Hand-Torn with Cold EVOO',
        icon: '🌿',
        x: 115,
        y: 70,
        origin: 'Hydroponically grown sweet basil leaves plucked minutes before dressing.',
        craft: 'Hand-torn over steaming molten cheese to release fresh fragrant essential oils.',
        nutrition: 'High in vitamin K, eugenol antioxidants, and natural plant flavonoids.',
      },
    ],
    restaurant: {
      _id: 'rest-3',
      name: 'Pizza Point',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'hero-dish-3',
    name: 'Smoked Smash Cheeseburger',
    cuisine: 'Grilled Patty, Melted Cheddar & Brioche',
    price: 220,
    rating: 4.7,
    reviews: '3,120',
    deliveryTime: '18 mins',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
    badge: 'Super Fast ⚡',
    icon: '🍔',
    calories: '610 kcal',
    protein: '34g',
    carbs: '46g',
    fat: '28g',
    isVeg: false,
    spiceLevel: 2,
    chef: 'Chef Dexter Hayes',
    chefHeritage: 'Austin Texas Craft Smokehouse Specialist',
    chefSecret: 'Cast-iron smash searing locks in juices with smoked paprika butter glaze.',
    recentReviews: [
      { user: 'Vikram R.', rating: 5, comment: 'Crispy lacy edges and super juicy center. Best burger in town.' },
      { user: 'Siddharth T.', rating: 4.7, comment: 'Toasted brioche bun stayed warm and buttery.' },
    ],
    ingredients: [
      {
        name: 'Double Patty',
        note: 'Prime Chuck Crisp Smash Sear',
        icon: '🥩',
        x: -110,
        y: -70,
        origin: '80/20 grass-fed prime chuck grind prepared fresh every morning.',
        craft: 'Smashed on 450°F cast iron to create lacy caramelized edges with a tender juicy center.',
        nutrition: '34g High-density muscle protein • Excellent source of B-complex vitamins.',
      },
      {
        name: 'Aged Cheddar',
        note: 'Sharp Molten Double Slice',
        icon: '🧀',
        x: 110,
        y: -65,
        origin: '18-month cave-aged sharp Wisconsin yellow cheddar.',
        craft: 'Steam-melted under a chef dome to drape perfectly over the seared patties.',
        nutrition: 'Rich in calcium, phosphorus, and essential fatty acids.',
      },
      {
        name: 'Butter Brioche',
        note: 'Griddled with Cultured Butter',
        icon: '🍞',
        x: -115,
        y: 65,
        origin: 'French-style bakery brioche enriched with slow-churned cultured butter.',
        craft: 'Lightly toasted on the flattop to seal against juices while remaining cloud-soft.',
        nutrition: 'Wholesome baked energy with comforting buttery aroma.',
      },
      {
        name: 'Secret Relish',
        note: 'Smoked Jalapeno Dill Aioli',
        icon: '🌶️',
        x: 115,
        y: 70,
        origin: 'Oakwood-smoked green jalapenos and crisp fermented dill pickles.',
        craft: 'Emulsified with garlic confit and organic egg yolk for a tangy, smoky punch.',
        nutrition: 'Natural capsaicin promotes circulation and enhances taste perception.',
      },
    ],
    restaurant: {
      _id: 'rest-2',
      name: 'The Burger Hub',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
    },
  },
  {
    id: 'hero-dish-4',
    name: 'Tokyo Shoyu Ramen Bowl',
    cuisine: 'Slow-Simmered Broth, Chashu & Nori',
    price: 320,
    rating: 4.9,
    reviews: '1,540',
    deliveryTime: '28 mins',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&auto=format&fit=crop&q=80',
    badge: 'Top Rated ⭐',
    icon: '🍜',
    calories: '490 kcal',
    protein: '26g',
    carbs: '54g',
    fat: '14g',
    isVeg: false,
    spiceLevel: 2,
    chef: 'Chef Kenji Takahashi',
    chefHeritage: 'Shinjuku Ramen Master Apprentice',
    chefSecret: '16-hour kombu-pork bone double reduction with aged barrel shoyu tare.',
    recentReviews: [
      { user: 'Neha Gupta', rating: 5, comment: 'Broth is so rich and gelatinous. The molten egg is perfection!' },
      { user: 'Aditya P.', rating: 5, comment: 'Proper springy noodles with smoky chashu slices.' },
    ],
    ingredients: [
      {
        name: 'Umami Broth',
        note: '16h Double Simmered Reduction',
        icon: '🥣',
        x: -110,
        y: -70,
        origin: 'Hokkaido dashi kombu, dried shiitake, and cedar-barrel aged artisanal shoyu tare.',
        craft: 'Double-simmered at gentle roll for 16 hours to extract silky gelatin and rich umami.',
        nutrition: 'Naturally rich in bio-collagen, amino acids, and essential trace electrolytes.',
      },
      {
        name: 'Chashu Braised Pork',
        note: 'Sous-Vide with Mirin & Ginger',
        icon: '🥓',
        x: 110,
        y: -65,
        origin: 'Rolled prime pork belly marinated with sake, sweet mirin, and grated ginger.',
        craft: 'Slow cooked for 14 hours then flash-seared with a blowtorch before placing.',
        nutrition: '26g High-quality protein • Melt-in-mouth tenderness.',
      },
      {
        name: 'Ajitsuke Tamago',
        note: 'Jammy Yolked Soy Marinated Egg',
        icon: '🥚',
        x: -115,
        y: 65,
        origin: 'Farm-fresh pasture eggs with rich amber yolks.',
        craft: 'Steeped for 24 hours in sweetened soy tare to yield a rich, molten jammy center.',
        nutrition: 'Choline for cognitive focus • Rich in lutein and vitamin D.',
      },
      {
        name: 'Hand-Pulled Noodles',
        note: 'Artisanal High-Hydration Wheat',
        icon: '🥢',
        x: 115,
        y: 70,
        origin: 'High-protein Japanese wheat flour blended with mineral alkaline kansui.',
        craft: 'Freshly stretched and cut with custom waves to grip and lift every drop of broth.',
        nutrition: 'Long-lasting complex energy • Ideal chewy al-dente texture.',
      },
    ],
    restaurant: {
      _id: 'rest-1',
      name: 'Spice Villa',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&auto=format&fit=crop&q=80',
    },
  },
];

const Hero3DStage = () => {
  const navigate = useNavigate();
  const { addToCart, items: cartItems } = useCart();
  const { showToast } = useToast();

  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [explodedView, setExplodedView] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Escape key to close modal popovers and go back
  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);
  const [selectedIngredient, setSelectedIngredient] = useState(
    HERO_3D_DISHES[0].ingredients[0].name
  );
  const [plateViewTab, setPlateViewTab] = useState('flavors'); // 'flavors' | 'chef' | 'nutrition' | 'reviews'
  const [realRestaurants, setRealRestaurants] = useState([]);
  const [realFoods, setRealFoods] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // References for DIRECT DOM updates (NO high-frequency state re-renders)
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const touchStartX = useRef(null);

  const activeDish = HERO_3D_DISHES[activeIndex];
  const activeIngObj =
    activeDish.ingredients.find((i) => i.name === selectedIngredient) ||
    activeDish.ingredients[0];

  // Fetch real restaurants and dishes on mount to get live MongoDB ObjectIds
  useEffect(() => {
    API.get('/restaurants')
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setRealRestaurants(res.data);
        }
      })
      .catch(() => {});

    API.get('/foods')
      .then((res) => {
        if (res.success && res.data?.length > 0) {
          setRealFoods(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Check if active item is already in cart
  const currentCartItem = cartItems?.find(
    (i) => i._id === activeDish.id || i.foodId === activeDish.id
  );
  const inCartQty = currentCartItem ? currentCartItem.quantity : 0;

  const handleMoveToItemDetails = (ing) => {
    const targetDishName = activeDish.name;
    // Map to live MongoDB ObjectId if available
    const matchedRest = realRestaurants.find(
      (r) =>
        r.name.toLowerCase() === activeDish.restaurant.name.toLowerCase() ||
        r.name.toLowerCase().includes(activeDish.restaurant.name.toLowerCase()) ||
        activeDish.restaurant.name.toLowerCase().includes(r.name.toLowerCase())
    ) || realRestaurants[0];
    const targetRestId = matchedRest ? matchedRest._id : activeDish.restaurant._id;
    const restName = matchedRest ? matchedRest.name : activeDish.restaurant.name;
    const ingName = ing?.name || activeIngObj?.name || '';

    showToast(
      `Moving to ${targetDishName}${ingName ? ` (${ingName})` : ''} at ${restName}...`,
      'info'
    );
    navigate(`/restaurants/${targetRestId}?highlight=${encodeURIComponent(targetDishName)}`);
  };

  // Auto-cycle through dishes every 6 seconds when not hovered and not exploded
  useEffect(() => {
    if (!autoRotate || explodedView || activeModal) return;

    const interval = setInterval(() => {
      triggerDishChange((prev) => (prev + 1) % HERO_3D_DISHES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoRotate, explodedView, activeModal, activeIndex]);

  // Floating ambient neon particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let isVisible = true;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.offsetWidth || 520;
        canvas.height = canvas.parentElement.offsetHeight || 500;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animationFrameId) {
        render();
      }
    }, { threshold: 0.1 });
    observer.observe(canvas);

    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * (canvas.width || 500),
      y: Math.random() * (canvas.height || 500),
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? '255, 77, 46' : '255, 180, 0',
      alpha: Math.random() * 0.35 + 0.15,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.4 - 0.15,
      pulse: Math.random() * 0.04 + 0.01,
    }));

    const render = () => {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha += Math.sin(Date.now() * p.pulse * 0.05) * 0.005;

        if (p.y < 0) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        const a = Math.max(0.1, Math.min(0.55, p.alpha));
        
        // Fast dual-pass soft glow without expensive CPU shadowBlur
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${a * 0.25})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${a})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // DIGNIFIED, SILKY-SMOOTH TILT SYSTEM WITH RAF LERP DAMPING (Zero Shaking, Zero Jitter)
  const tiltRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    isHovered: false,
    rafId: null,
  });

  const updateTilt = () => {
    if (!cardRef.current) return;

    const tilt = tiltRef.current;
    // 0.08 lerp factor: buttery smooth, dignified glide with zero oscillation
    tilt.currentX += (tilt.targetX - tilt.currentX) * 0.08;
    tilt.currentY += (tilt.targetY - tilt.currentY) * 0.08;

    const curX = tilt.currentX;
    const curY = tilt.currentY;

    cardRef.current.style.transform = `perspective(1200px) rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;

    // Continue frame loop while mouse is inside or until settled near 0
    if (tilt.isHovered || Math.abs(tilt.targetX - curX) > 0.01 || Math.abs(tilt.targetY - curY) > 0.01) {
      tilt.rafId = requestAnimationFrame(updateTilt);
    } else {
      tilt.rafId = null;
    }
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = Math.max(-1, Math.min(1, (x / rect.width) * 2 - 1));
    const normY = Math.max(-1, Math.min(1, (y / rect.height) * 2 - 1));

    // Dignified, subtle, calm spatial tilt (max 1.2deg X, 1.5deg Y)
    tiltRef.current.targetX = -normY * 1.2;
    tiltRef.current.targetY = normX * 1.5;
    tiltRef.current.isHovered = true;

    cardRef.current.style.setProperty('--mouse-x', `${((x / rect.width) * 100).toFixed(1)}%`);
    cardRef.current.style.setProperty('--mouse-y', `${((y / rect.height) * 100).toFixed(1)}%`);

    if (!tiltRef.current.rafId) {
      tiltRef.current.rafId = requestAnimationFrame(updateTilt);
    }
  };

  const handleMouseLeave = () => {
    tiltRef.current.targetX = 0;
    tiltRef.current.targetY = 0;
    tiltRef.current.isHovered = false;

    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--mouse-x', '50%');
    cardRef.current.style.setProperty('--mouse-y', '50%');

    if (!tiltRef.current.rafId) {
      tiltRef.current.rafId = requestAnimationFrame(updateTilt);
    }
  };

  useEffect(() => {
    return () => {
      if (tiltRef.current.rafId) {
        cancelAnimationFrame(tiltRef.current.rafId);
      }
    };
  }, []);

  // Touch swipe support on the food stage
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches?.[0]?.clientX;
    if (touchEndX !== undefined) {
      const diff = touchEndX - touchStartX.current;
      if (diff > 40) {
        handlePrev();
      } else if (diff < -40) {
        handleNext();
      }
    }
    touchStartX.current = null;
  };

  // Smooth 3D dish transition
  const triggerDishChange = (indexOrFn) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => {
        const next = typeof indexOrFn === 'function' ? indexOrFn(prev) : indexOrFn;
        setSelectedIngredient(HERO_3D_DISHES[next].ingredients[0].name);
        return next;
      });
      setActiveModal(null);
      setIsTransitioning(false);
    }, 160);
  };

  const handlePrev = () => {
    triggerDishChange((prev) => (prev - 1 + HERO_3D_DISHES.length) % HERO_3D_DISHES.length);
  };

  const handleNext = () => {
    triggerDishChange((prev) => (prev + 1) % HERO_3D_DISHES.length);
  };

  const handleSelectDish = (idx) => {
    if (idx === activeIndex) return;
    triggerDishChange(idx);
  };

  const handleAddToCart = () => {
    // Find matching real restaurant from realRestaurants if available
    const matchedRest =
      realRestaurants.find(
        (r) =>
          r.name.toLowerCase() === activeDish.restaurant.name.toLowerCase() ||
          r.name.toLowerCase().includes(activeDish.restaurant.name.toLowerCase()) ||
          activeDish.restaurant.name.toLowerCase().includes(r.name.toLowerCase())
      ) || realRestaurants[0];

    const restaurantObj = matchedRest
      ? {
          _id: matchedRest._id,
          name: matchedRest.name,
          image: matchedRest.image || activeDish.restaurant.image,
        }
      : activeDish.restaurant;

    // Find matching real food from realFoods if available
    const matchedFood = realFoods.find(
      (f) =>
        (f.name && f.name.toLowerCase().includes(activeDish.name.toLowerCase())) ||
        (activeDish.name && activeDish.name.toLowerCase().includes(f.name.toLowerCase())) ||
        (matchedRest && f.restaurant?._id === matchedRest._id)
    );

    const dishToAdd = {
      _id: matchedFood ? matchedFood._id : activeDish.id,
      name: matchedFood ? matchedFood.name : activeDish.name,
      price: matchedFood ? matchedFood.price : activeDish.price,
      image: matchedFood ? matchedFood.image : activeDish.image,
      isVeg: matchedFood ? matchedFood.isVeg : activeDish.isVeg,
      category: 'Signature',
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(dishToAdd, restaurantObj);
    }

    setAddedSuccess(true);
    showToast(`Added ${quantity}x ${dishToAdd.name} to cart!`, 'success');
    setTimeout(() => setAddedSuccess(false), 1500);
  };

  return (
    <div
      className="hero-3d-wrapper"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Main Outer Card */}
      <div
        className="hero-3d-spatial-card"
        ref={cardRef}
        style={{
          transform: 'perspective(1200px) rotateX(1deg) rotateY(-1deg)',
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        }}
      >
        {/* Soft Specular Light Gloss */}
        <div className="hero-3d-gloss-reflection" />

        {/* Ambient Canvas Dust */}
        <canvas ref={canvasRef} className="hero-3d-particle-layer" />

        {/* Top Control Bar with 100% Functioning Buttons */}
        <div className="hero-3d-header-row">
          <button
            type="button"
            className="hero-3d-badge-live"
            onClick={() => showToast('Live 3D Gourmet Theatre active & responding.', 'info')}
            title="Click or tap to verify live status"
            id="hero-3d-live-btn"
          >
            <span className="live-dot-pulse" />
            <span>3D GOURMET THEATRE</span>
          </button>

          <div className="hero-3d-header-actions">
            {/* Functional Toggle: 3D Flavor Anatomy */}
            <button
              type="button"
              className={`hero-3d-ctrl-btn ${explodedView ? 'active' : ''}`}
              onClick={() => {
                setExplodedView(!explodedView);
                setActiveModal(null);
              }}
              title={explodedView ? 'Switch to 3D Showcase' : 'Open Plate Details Studio'}
              id="hero-3d-explode-btn"
            >
              <FiLayers />
              <span>{explodedView ? '3D Showcase' : 'Plate Details'}</span>
            </button>

            {/* Functional Toggle: Auto-Orbit Spin */}
            <button
              type="button"
              className={`hero-3d-ctrl-btn ${autoRotate ? 'active' : ''}`}
              onClick={() => {
                const nextState = !autoRotate;
                setAutoRotate(nextState);
                showToast(
                  nextState ? 'Auto-Orbit resumed' : 'Interactive mode active',
                  'info'
                );
              }}
              title={autoRotate ? 'Pause 3D rotation' : 'Start Auto-Orbit'}
              id="hero-3d-orbit-toggle-btn"
            >
              <FiRotateCw className={autoRotate ? 'spin-icon' : ''} />
              <span>{autoRotate ? 'Orbiting' : 'Paused'}</span>
            </button>
          </div>
        </div>

        {/* Central 3D Spatial Stage Arena */}
        <div
          className={`hero-3d-theatre-arena ${explodedView ? 'studio-arena-mode' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {explodedView ? (
            /* THE REVOLUTIONARY SENSORY LENS & CULINARY DECK FOR PLATE VIEW */
            <div className="plate-lens-space">
              {/* Upper Section: Signature Dish Bar (Plate Hub + Identity + Dish Switcher) */}
              <div className="lens-dish-header">
                <div
                  className="lens-plate-anchor"
                  onClick={handleNext}
                  role="button"
                  tabIndex={0}
                  title="Click or tap to view next signature dish"
                >
                  <div className="lens-plate-halo" />
                  <img
                    src={activeDish.image}
                    alt={activeDish.name}
                    className="lens-plate-thumb"
                  />
                  <span className="lens-plate-badge">{activeDish.badge}</span>
                </div>

                <div className="lens-dish-summary">
                  <div className="lens-eyebrow-row">
                    <span className="lens-cuisine-tag">{activeDish.cuisine.split('&')[0]}</span>
                    <span className="lens-prep-tag">⏱ {activeDish.deliveryTime}</span>
                    <span className="lens-rating-tag">★ {activeDish.rating}</span>
                  </div>
                  <h4 className="lens-dish-title">{activeDish.name}</h4>
                  <span className="lens-rest-by">Specialty from {activeDish.restaurant.name}</span>
                </div>

                <div className="lens-dish-nav">
                  <button
                    type="button"
                    className="lens-nav-btn"
                    onClick={handlePrev}
                    aria-label="Previous Dish"
                    id="lens-prev-dish-btn"
                  >
                    <FiChevronLeft />
                  </button>
                  <span className="lens-nav-count">
                    {activeIndex + 1}/{HERO_3D_DISHES.length}
                  </span>
                  <button
                    type="button"
                    className="lens-nav-btn"
                    onClick={handleNext}
                    aria-label="Next Dish"
                    id="lens-next-dish-btn"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>

              {/* 4 Dimension Lens Selector Tabs */}
              <div className="lens-dimension-tabs">
                <button
                  type="button"
                  className={`lens-dim-tab ${plateViewTab === 'flavors' ? 'active' : ''}`}
                  onClick={() => setPlateViewTab('flavors')}
                  id="lens-tab-flavors"
                >
                  <span>🌾 4 Flavors</span>
                </button>
                <button
                  type="button"
                  className={`lens-dim-tab ${plateViewTab === 'chef' ? 'active' : ''}`}
                  onClick={() => setPlateViewTab('chef')}
                  id="lens-tab-chef"
                >
                  <span>👨‍🍳 Chef Craft</span>
                </button>
                <button
                  type="button"
                  className={`lens-dim-tab ${plateViewTab === 'nutrition' ? 'active' : ''}`}
                  onClick={() => setPlateViewTab('nutrition')}
                  id="lens-tab-nutrition"
                >
                  <span>⚡ Nutrition</span>
                </button>
                <button
                  type="button"
                  className={`lens-dim-tab ${plateViewTab === 'reviews' ? 'active' : ''}`}
                  onClick={() => setPlateViewTab('reviews')}
                  id="lens-tab-reviews"
                >
                  <span>⭐ Reviews</span>
                </button>
              </div>

              {/* Tab Content: Spacious, Uncluttered & Dignified */}
              <div className="lens-content-arena">
                {/* 1. FLAVORS DIMENSION */}
                {plateViewTab === 'flavors' && (
                  <div className="lens-view-flavors">
                    {/* 4 Ingredient Option Tabs */}
                    <div className="lens-flavor-pills">
                      {activeDish.ingredients.map((ing) => {
                        const isSelected = activeIngObj?.name === ing.name;
                        return (
                          <button
                            key={ing.name}
                            type="button"
                            className={`lens-flavor-pill ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedIngredient(ing.name)}
                            id={`lens-pill-${ing.name.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            <span className="pill-icon">{ing.icon}</span>
                            <span className="pill-label">{ing.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Ingredient Story Card */}
                    {activeIngObj && (
                      <div className="lens-ingredient-card">
                        <div className="lens-ing-header">
                          <div className="lens-ing-title-group">
                            <span className="lens-ing-icon">{activeIngObj.icon}</span>
                            <div>
                              <h5 className="lens-ing-name">{activeIngObj.name}</h5>
                              <span className="lens-ing-note">📍 {activeIngObj.note}</span>
                            </div>
                          </div>
                          <span className="lens-macro-pill">
                            {activeIngObj.nutrition.split('•')[0]}
                          </span>
                        </div>

                        <div className="lens-ing-body">
                          <div className="lens-story-item">
                            <span className="story-label">🌾 Sourcing & Origin:</span>
                            <p>{activeIngObj.origin}</p>
                          </div>
                          <div className="lens-story-item">
                            <span className="story-label">👨‍🍳 Culinary Craft:</span>
                            <p>{activeIngObj.craft}</p>
                          </div>
                        </div>

                        {/* Direct Jump to Item Details */}
                        <div className="lens-action-row">
                          <button
                            type="button"
                            className="lens-jump-btn"
                            onClick={() => handleMoveToItemDetails(activeIngObj)}
                            id="lens-jump-details-btn"
                          >
                            <span>Move to {activeDish.name} in Menu</span>
                            <FiExternalLink />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. CHEF CRAFT DIMENSION */}
                {plateViewTab === 'chef' && (
                  <div className="lens-view-chef">
                    <div className="lens-chef-card">
                      <div className="lens-chef-header">
                        <div className="lens-chef-avatar">
                          <FiAward />
                        </div>
                        <div>
                          <h5>{activeDish.chef}</h5>
                          <span className="lens-chef-heritage">{activeDish.chefHeritage}</span>
                        </div>
                      </div>

                      <div className="lens-chef-secret-box">
                        <span className="secret-badge">🔥 Master Culinary Technique:</span>
                        <p>{activeDish.chefSecret}</p>
                      </div>

                      <button
                        type="button"
                        className="lens-jump-btn"
                        onClick={() => handleMoveToItemDetails()}
                        id="lens-chef-jump-btn"
                      >
                        <span>Explore Menu at {activeDish.restaurant.name}</span>
                        <FiExternalLink />
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. NUTRITION DIMENSION */}
                {plateViewTab === 'nutrition' && (
                  <div className="lens-view-nutrition">
                    <div className="lens-macro-grid">
                      <div className="lens-macro-card macro-calories">
                        <span className="macro-num">{activeDish.calories}</span>
                        <span className="macro-name">Energy</span>
                        <div className="macro-bar"><span style={{ width: '75%' }} /></div>
                      </div>
                      <div className="lens-macro-card macro-protein">
                        <span className="macro-num">{activeDish.protein}</span>
                        <span className="macro-name">Protein</span>
                        <div className="macro-bar"><span style={{ width: '85%' }} /></div>
                      </div>
                      <div className="lens-macro-card macro-carbs">
                        <span className="macro-num">{activeDish.carbs}</span>
                        <span className="macro-name">Carbs</span>
                        <div className="macro-bar"><span style={{ width: '65%' }} /></div>
                      </div>
                      <div className="lens-macro-card macro-fats">
                        <span className="macro-num">{activeDish.fat}</span>
                        <span className="macro-name">Healthy Fats</span>
                        <div className="macro-bar"><span style={{ width: '45%' }} /></div>
                      </div>
                    </div>

                    <div className="lens-nutrition-meta">
                      <span className="lens-diet-tag">
                        {activeDish.isVeg ? '🌱 100% Pure Vegetarian' : '🍗 Non-Veg Specialist'}
                      </span>
                      <span className="lens-diet-tag">
                        Spice: {Array(activeDish.spiceLevel).fill('🔥').join('')}
                      </span>
                      <span className="lens-diet-tag">Zero Artificial Additives</span>
                    </div>
                  </div>
                )}

                {/* 4. REVIEWS DIMENSION */}
                {plateViewTab === 'reviews' && (
                  <div className="lens-view-reviews">
                    <div className="lens-reviews-summary">
                      <div className="reviews-score-block">
                        <span className="score-val">{activeDish.rating}</span>
                        <div className="score-stars">★★★★★</div>
                        <span className="score-count">{activeDish.reviews} Verified Orders</span>
                      </div>
                      <div className="reviews-card-list">
                        {activeDish.recentReviews.map((rev, idx) => (
                          <div key={idx} className="lens-review-bubble">
                            <div className="bubble-head">
                              <strong>{rev.user}</strong>
                              <span className="bubble-star">★ {rev.rating}</span>
                            </div>
                            <p className="bubble-quote">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* STANDARD 3D SHOWCASE (Plate Centered with 4 HUD badges & Pedestal) */
            <>
              {/* Cybernetic Glowing Pedestal Base */}
              <div className="hero-3d-pedestal-platform">
                <div className="pedestal-outer-ring" />
                <div className="pedestal-neon-core" />
                <div className="pedestal-light-beam" />
              </div>

              {/* Functional Clickable HUD 1: Top Left (Chef Special & Prep Time) */}
              <button
                type="button"
                className={`hero-3d-floating-hud hud-top-left ${activeModal === 'chef' ? 'hud-active' : ''}`}
                onClick={() => setActiveModal(activeModal === 'chef' ? null : 'chef')}
                title="Click or tap to view Chef & Recipe Details"
                id="hero-hud-chef-btn"
              >
                <div className="hud-icon-wrap chef-glow">
                  <FiAward />
                </div>
                <div className="hud-info">
                  <span className="hud-title">{activeDish.badge}</span>
                  <span className="hud-subtitle">Prep: {activeDish.deliveryTime}</span>
                </div>
                <span className="hud-tap-hint">ℹ</span>
              </button>

              {/* Functional Clickable HUD 2: Top Right (Spice & Diet Tag) */}
              <button
                type="button"
                className={`hero-3d-floating-hud hud-top-right ${activeModal === 'spice' ? 'hud-active' : ''}`}
                onClick={() => setActiveModal(activeModal === 'spice' ? null : 'spice')}
                title="Click or tap to view Spice & Diet details"
                id="hero-hud-spice-btn"
              >
                <div className="spice-meter">
                  {[...Array(4)].map((_, i) => (
                    <FlameIcon
                      key={i}
                      className={`spice-flame ${i < activeDish.spiceLevel ? 'active' : 'dim'}`}
                    />
                  ))}
                </div>
                <div className="hud-info">
                  <span className="hud-title">
                    {activeDish.isVeg ? '🌱 Pure Veg' : '🍗 Non-Veg'}
                  </span>
                  <span className="hud-subtitle">{activeDish.calories}</span>
                </div>
                <span className="hud-tap-hint">ℹ</span>
              </button>

              {/* Functional Carousel Left Arrow */}
              <button
                type="button"
                className="hero-3d-nav-arrow arrow-left"
                onClick={handlePrev}
                aria-label="Previous Dish"
                id="hero-3d-prev-btn"
              >
                <FiChevronLeft />
              </button>

              {/* Functional Carousel Right Arrow */}
              <button
                type="button"
                className="hero-3d-nav-arrow arrow-right"
                onClick={handleNext}
                aria-label="Next Dish"
                id="hero-3d-next-btn"
              >
                <FiChevronRight />
              </button>

              {/* Central 3D Food Plate Showcase */}
              <div className="hero-3d-plate-stage">
                {/* Hologram Aura Ring on Active Dish */}
                <div className="dish-hologram-aura" />

                {/* 3D Food Plate with Click to Cycle */}
                <div
                  className={`dish-plate-container ${isTransitioning ? 'is-flipping' : ''}`}
                  onClick={handleNext}
                  role="button"
                  tabIndex={0}
                  title="Click or tap to see next signature dish"
                >
                  <img
                    src={activeDish.image}
                    alt={activeDish.name}
                    className="dish-plate-visual"
                  />

                  {/* Gentle Steam Wisps */}
                  <div className="steam-container">
                    <span className="steam-wisp wisp-1" />
                    <span className="steam-wisp wisp-2" />
                    <span className="steam-wisp wisp-3" />
                  </div>
                </div>
              </div>

              {/* Functional Clickable HUD 3: Bottom Left (Rating & Reviews) */}
              <button
                type="button"
                className={`hero-3d-floating-hud hud-bottom-left ${activeModal === 'reviews' ? 'hud-active' : ''}`}
                onClick={() => setActiveModal(activeModal === 'reviews' ? null : 'reviews')}
                title="Click or tap to view Customer Reviews"
                id="hero-hud-reviews-btn"
              >
                <span className="hud-star">★</span>
                <div className="hud-info">
                  <span className="hud-title">{activeDish.rating} Rating</span>
                  <span className="hud-subtitle">{activeDish.reviews} Verified</span>
                </div>
                <span className="hud-tap-hint">ℹ</span>
              </button>

              {/* Functional Clickable HUD 4: Bottom Right (Nutrition & Macros) */}
              <button
                type="button"
                className={`hero-3d-floating-hud hud-bottom-right ${activeModal === 'nutrition' ? 'hud-active' : ''}`}
                onClick={() => setActiveModal(activeModal === 'nutrition' ? null : 'nutrition')}
                title="Click or tap to view Macro Nutrition Facts"
                id="hero-hud-nutrition-btn"
              >
                <div className="macro-chip">⚡</div>
                <div className="hud-info">
                  <span className="hud-title">{activeDish.protein} Protein</span>
                  <span className="hud-subtitle">Freshly Made</span>
                </div>
                <span className="hud-tap-hint">ℹ</span>
              </button>
            </>
          )}

          {/* Interactive Modal Popovers inside the 3D Stage */}
          {activeModal && (
            <div
              className="hero-3d-modal-overlay"
              onClick={() => setActiveModal(null)}
            >
              <div
                className="hero-3d-modal-card"
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    className="modal-back-btn"
                    onClick={() => setActiveModal(null)}
                    title="Back to 3D Dish View"
                  >
                    <FiArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    className="modal-close-btn"
                    onClick={() => setActiveModal(null)}
                    aria-label="Close"
                  >
                    <FiX />
                  </button>
                </div>

                {/* 1. Chef Modal */}
                {activeModal === 'chef' && (
                  <div className="modal-inner">
                    <div className="modal-header">
                      <FiAward className="modal-icon text-primary" />
                      <div>
                        <h4>{activeDish.chef}</h4>
                        <span className="modal-sub">{activeDish.chefHeritage}</span>
                      </div>
                    </div>
                    <div className="modal-body-content">
                      <div className="modal-secret-box">
                        <strong>Culinary Secret:</strong>
                        <p>{activeDish.chefSecret}</p>
                      </div>
                      <button
                        type="button"
                        className="modal-action-btn"
                        onClick={() => navigate(`/restaurants/${activeDish.restaurant._id}`)}
                      >
                        Visit {activeDish.restaurant.name} Menu <FiExternalLink />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Spice Modal */}
                {activeModal === 'spice' && (
                  <div className="modal-inner">
                    <div className="modal-header">
                      <FlameIcon className="modal-icon text-primary" />
                      <div>
                        <h4>Flavor & Spice Gauge</h4>
                        <span className="modal-sub">{activeDish.name}</span>
                      </div>
                    </div>
                    <div className="modal-body-content">
                      <div className="spice-scale-row">
                        <span>Spice Intensity:</span>
                        <div className="flame-scale">
                          {[...Array(4)].map((_, i) => (
                            <FlameIcon
                              key={i}
                              className={`scale-flame ${i < activeDish.spiceLevel ? 'active' : 'dim'}`}
                            />
                          ))}
                        </div>
                        <span className="spice-rating-label">
                          {activeDish.spiceLevel === 1 && 'Mild & Fragrant'}
                          {activeDish.spiceLevel === 2 && 'Medium Tangy'}
                          {activeDish.spiceLevel === 3 && 'Traditional Spicy 🔥'}
                          {activeDish.spiceLevel === 4 && 'Fiery Hot 🔥🔥'}
                        </span>
                      </div>
                      <div className="diet-pill-row">
                        <span className="diet-tag">
                          {activeDish.isVeg ? '🌱 100% Vegetarian' : '🍗 Non-Veg Specialist'}
                        </span>
                        <span className="diet-tag">Zero Artificial Preservatives</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Customer Reviews Modal */}
                {activeModal === 'reviews' && (
                  <div className="modal-inner">
                    <div className="modal-header">
                      <FiStar className="modal-icon text-warning" />
                      <div>
                        <h4>Customer Reviews ({activeDish.rating}★)</h4>
                        <span className="modal-sub">Based on {activeDish.reviews} orders</span>
                      </div>
                    </div>
                    <div className="modal-body-content">
                      <div className="reviews-list">
                        {activeDish.recentReviews.map((rev, i) => (
                          <div key={i} className="review-item">
                            <div className="review-user-row">
                              <strong>{rev.user}</strong>
                              <span className="review-stars">★★★★★</span>
                            </div>
                            <p className="review-text">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Nutrition Modal */}
                {activeModal === 'nutrition' && (
                  <div className="modal-inner">
                    <div className="modal-header">
                      <span className="modal-icon">⚡</span>
                      <div>
                        <h4>Macro Nutrition Facts</h4>
                        <span className="modal-sub">Per Standard Portion</span>
                      </div>
                    </div>
                    <div className="modal-body-content">
                      <div className="macros-grid">
                        <div className="macro-cell">
                          <span className="macro-val">{activeDish.calories}</span>
                          <span className="macro-lbl">Calories</span>
                        </div>
                        <div className="macro-cell">
                          <span className="macro-val">{activeDish.protein}</span>
                          <span className="macro-lbl">Protein</span>
                        </div>
                        <div className="macro-cell">
                          <span className="macro-val">{activeDish.carbs}</span>
                          <span className="macro-lbl">Carbs</span>
                        </div>
                        <div className="macro-cell">
                          <span className="macro-val">{activeDish.fat}</span>
                          <span className="macro-lbl">Healthy Fats</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Specific Ingredient / Component Telemetry Modal */}
                {activeModal === 'ingredient' && activeIngObj && (
                  <div className="modal-inner">
                    <div className="modal-header">
                      <span className="modal-icon" style={{ fontSize: '2rem', lineHeight: 1 }}>
                        {activeIngObj.icon}
                      </span>
                      <div>
                        <h4>{activeIngObj.name}</h4>
                        <span className="modal-sub">
                          Signature Component of {activeDish.name} • {activeDish.restaurant.name}
                        </span>
                      </div>
                    </div>
                    <div className="modal-body-content">
                      <div className="ing-modal-grid">
                        <div className="ing-modal-card">
                          <span className="ing-card-lbl">📍 Sourcing & Origin</span>
                          <p>{activeIngObj.origin}</p>
                        </div>
                        <div className="ing-modal-card">
                          <span className="ing-card-lbl">👨‍🍳 Culinary Craft & Preparation</span>
                          <p>{activeIngObj.craft}</p>
                        </div>
                        <div className="ing-modal-card">
                          <span className="ing-card-lbl">🥗 Nutrition & Dietary Role</span>
                          <p>{activeIngObj.nutrition}</p>
                        </div>
                      </div>

                      <div className="ing-modal-actions-row">
                        <button
                          type="button"
                          className="modal-action-btn primary-move-btn"
                          onClick={() => {
                            setActiveModal(null);
                            handleMoveToItemDetails(activeIngObj);
                          }}
                          id="modal-move-item-details-btn"
                        >
                          <span>Move to {activeDish.name} in Menu</span>
                          <FiExternalLink />
                        </button>
                        <button
                          type="button"
                          className="modal-action-btn secondary-order-btn"
                          onClick={() => {
                            handleAddToCart();
                            setActiveModal(null);
                          }}
                          id="modal-order-dish-btn"
                        >
                          <FiShoppingBag />
                          <span>Order {activeDish.name} (₹{activeDish.price})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3D Dock Action Panel with 100% Responsive Order Now Button */}
        <div className="hero-3d-dock-panel">
          <div className="dock-left-details">
            <div className="dock-title-row">
              <span className="dock-dish-emoji">{activeDish.icon}</span>
              <h3 className="dock-dish-title">{activeDish.name}</h3>
            </div>
            <p className="dock-dish-cuisine">{activeDish.cuisine}</p>
            <div className="dock-price-tag">
              <span className="dock-currency">₹</span>
              <span className="dock-amount">{activeDish.price}</span>
              <span className="dock-tax-note">All taxes included</span>
            </div>
          </div>

          <div className="dock-right-actions">
            {/* Interactive Quantity Stepper */}
            <div className="dock-qty-stepper">
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                id="hero-3d-qty-minus-btn"
              >
                <FiMinus />
              </button>
              <span className="qty-number">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                aria-label="Increase quantity"
                id="hero-3d-qty-plus-btn"
              >
                <FiPlus />
              </button>
            </div>

            {/* Functional Order Now Button */}
            <button
              type="button"
              className={`dock-order-btn ${addedSuccess ? 'btn-added' : ''}`}
              onClick={handleAddToCart}
              id="hero-3d-add-cart-btn"
            >
              {addedSuccess ? (
                <>
                  <FiCheck className="btn-icon" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <FiShoppingBag className="btn-icon" />
                  <span>Order Now</span>
                </>
              )}
            </button>

            {/* Quick View Cart Button if item in cart */}
            {inCartQty > 0 && (
              <button
                type="button"
                className="dock-cart-pill-btn"
                onClick={() => navigate('/cart')}
                title="View items in cart"
                id="hero-3d-view-cart-btn"
              >
                <FiShoppingBag />
                <span>Cart ({inCartQty})</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Interactive Dish Selector Switcher Tabs: Hyderabadi, Artisan, Smoked, Tokyo */}
        <div className="hero-3d-pill-bar">
          {HERO_3D_DISHES.map((dish, idx) => {
            const isSelected = activeIndex === idx;
            const shortName = dish.name.split(' ')[0]; // "Hyderabadi", "Artisan", "Smoked", "Tokyo"
            return (
              <button
                key={dish.id}
                type="button"
                className={`hero-3d-tab-pill ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectDish(idx)}
                id={`hero-dish-tab-${idx}`}
                aria-label={`Select ${dish.name}`}
              >
                <span className="tab-pill-icon">{dish.icon}</span>
                <span className="tab-pill-name">{shortName}</span>
                <span className="tab-pill-price">₹{dish.price}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Hero3DStage;
