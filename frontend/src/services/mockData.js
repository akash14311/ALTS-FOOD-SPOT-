// Mock data for Phase 1 frontend preview and tests

export const mockCuisines = [
  { id: 'biryani', name: 'Biryani', icon: '🍲', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80' },
  { id: 'pizza', name: 'Pizza', icon: '🍕', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80' },
  { id: 'burgers', name: 'Burgers', icon: '🍔', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80' },
  { id: 'south-indian', name: 'South Indian', icon: '🥞', image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=300&auto=format&fit=crop&q=80' },
  { id: 'chinese', name: 'Chinese', icon: '🍜', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80' },
  { id: 'desserts', name: 'Desserts', icon: '🍰', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80' },
  { id: 'north-indian', name: 'North Indian', icon: '🍛', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&auto=format&fit=crop&q=80' },
  { id: 'healthy', name: 'Healthy & Bowls', icon: '🥗', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80' }
];

export const mockRestaurants = [
  {
    _id: 'rest-1',
    name: 'Spice Villa',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    cuisines: ['North Indian', 'Mughlai', 'Biryani'],
    rating: 4.6,
    deliveryTimeMins: 30,
    priceRange: '₹₹',
    isVeg: false,
    address: { street: 'Koramangala 5th Block', city: 'Bangalore' }
  },
  {
    _id: 'rest-2',
    name: 'The Burger Hub',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Burgers', 'American', 'Fast Food'],
    rating: 4.5,
    deliveryTimeMins: 25,
    priceRange: '₹₹',
    isVeg: false,
    address: { street: 'Indiranagar 100ft Road', city: 'Bangalore' }
  },
  {
    _id: 'rest-3',
    name: 'Pizza Point',
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Pizza', 'Italian', 'Pastas'],
    rating: 4.4,
    deliveryTimeMins: 35,
    priceRange: '₹₹',
    isVeg: false,
    address: { street: 'HSR Layout Sector 2', city: 'Bangalore' }
  },
  {
    _id: 'rest-4',
    name: 'Biryani House',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Biryani', 'Hyderabadi', 'Kebabs'],
    rating: 4.7,
    deliveryTimeMins: 28,
    priceRange: '₹₹',
    isVeg: false,
    address: { street: 'Whitefield Main Road', city: 'Bangalore' }
  },
  {
    _id: 'rest-5',
    name: 'South Indian Kitchen',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    cuisines: ['South Indian', 'Dosa', 'Filter Coffee'],
    rating: 4.8,
    deliveryTimeMins: 20,
    priceRange: '₹',
    isVeg: true,
    isPureVeg: true,
    address: { street: 'Jayanagar 4th Block', city: 'Bangalore' }
  },
  {
    _id: 'rest-6',
    name: 'Tandoori Tales',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
    cuisines: ['Tandoori', 'North Indian', 'Curries'],
    rating: 4.3,
    deliveryTimeMins: 32,
    priceRange: '₹₹',
    isVeg: false,
    address: { street: 'MG Road', city: 'Bangalore' }
  }
];

export const mockPopularDishes = [
  {
    _id: 'dish-1',
    name: 'Hyderabadi Chicken Dum Biryani',
    restaurantId: 'rest-4',
    restaurantName: 'Biryani House',
    price: 320,
    rating: 4.8,
    isVeg: false,
    category: 'Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
    description: 'Slow-cooked fragrant basmati rice layered with juicy spiced chicken and saffron.'
  },
  {
    _id: 'dish-2',
    name: 'Classic Smoky Cheese Burger',
    restaurantId: 'rest-2',
    restaurantName: 'The Burger Hub',
    price: 249,
    rating: 4.6,
    isVeg: false,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
    description: 'Tender patty topped with melted cheddar, grilled onions, and house special sauce.'
  },
  {
    _id: 'dish-3',
    name: 'Paneer Butter Masala',
    restaurantId: 'rest-1',
    restaurantName: 'Spice Villa',
    price: 280,
    rating: 4.7,
    isVeg: true,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
    description: 'Cottage cheese cubes simmered in a silky, rich tomato butter makhani gravy.'
  },
  {
    _id: 'dish-4',
    name: 'Artisanal Margherita Pizza',
    restaurantId: 'rest-3',
    restaurantName: 'Pizza Point',
    price: 349,
    rating: 4.5,
    isVeg: true,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
    description: 'Crispy hand-stretched crust with San Marzano tomato sauce, fresh mozzarella, and basil.'
  },
  {
    _id: 'dish-5',
    name: 'Crispy Butter Masala Dosa',
    restaurantId: 'rest-5',
    restaurantName: 'South Indian Kitchen',
    price: 140,
    rating: 4.9,
    isVeg: true,
    category: 'South Indian',
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop&q=80',
    description: 'Golden fermented rice crepe stuffed with spiced potato mash, served with 3 chutneys.'
  },
  {
    _id: 'dish-6',
    name: 'Butter Naan & Dal Makhani Combo',
    restaurantId: 'rest-6',
    restaurantName: 'Tandoori Tales',
    price: 260,
    rating: 4.6,
    isVeg: true,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    description: 'Slow-simmered creamy black lentils paired with two fresh tandoori butter naans.'
  }
];

export const mockOffers = [
  {
    code: 'FIRST50',
    title: '50% OFF on 1st Order',
    discount: '50% OFF',
    desc: 'Up to ₹120 on orders above ₹299',
    badge: 'Welcome Special',
    minOrder: 299
  },
  {
    code: 'CRAVE10',
    title: '10% Instant Feast',
    discount: '10% OFF',
    desc: 'Up to ₹100 on orders above ₹199',
    badge: 'All Users',
    minOrder: 199
  },
  {
    code: 'FOOD20',
    title: '20% Mega Celebration',
    discount: '20% OFF',
    desc: 'Up to ₹150 on orders above ₹399',
    badge: 'Weekend Deal',
    minOrder: 399
  },
  {
    code: 'FREEDEL',
    title: 'Free Delivery',
    discount: '100% OFF Delivery',
    desc: 'On all orders above ₹249',
    badge: 'Speed Saver',
    minOrder: 249
  }
];

export const mockReviews = [
  {
    name: 'Rahul Sharma',
    city: 'Koramangala, Bangalore',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    review: 'ALTS FOOD spot is a lifesaver! The live order tracking is so smooth and accurate. My Biryani arrived piping hot in just 25 minutes!'
  },
  {
    name: 'Priya Patel',
    city: 'Indiranagar, Bangalore',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    review: 'Cleanest food app experience I have ever seen. No messy UI, the discounts actually work, and customer support was super responsive.'
  },
  {
    name: 'Arjun Verma',
    city: 'HSR Layout, Bangalore',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    review: 'The single-restaurant cart check and status updates give it such a professional feel. Truly feels like Swiggy and Zomato combined.'
  }
];

/**
 * Helper to compute or fallback to realistic dish quantity / portion sizes
 */
export const getDishQuantity = (dish) => {
  if (dish?.quantity) return dish.quantity;
  const name = (dish?.name || '').toLowerCase();
  const cat = (dish?.category || '').toLowerCase();
  if (name.includes('biryani') || cat.includes('biryani')) return '1 Handi (500g • Serves 1-2)';
  if (name.includes('pizza') || cat.includes('pizza')) return '1 Pizza (10" Medium • 6 Slices)';
  if (name.includes('burger') || cat.includes('burger')) return '1 Burger (240g) + Crispy Dip';
  if (name.includes('naan') || name.includes('roti') || name.includes('bread') || name.includes('paratha')) return '2 Pcs Freshly Baked';
  if (name.includes('dosa') || name.includes('idli')) return '1 Full Plate (Serves 1)';
  if (name.includes('noodle') || name.includes('fried rice') || cat.includes('chinese')) return '1 Wok Bowl (450g • Serves 1-2)';
  if (name.includes('dumpling') || name.includes('dim sum') || name.includes('momo')) return '6 Steamed Pcs with Sauce';
  if (name.includes('cake') || name.includes('jamun') || name.includes('dessert') || cat.includes('dessert')) return '1 Serving (Standard Portion)';
  if (name.includes('shake') || name.includes('lassi') || name.includes('juice') || cat.includes('beverage') || name.includes('cola')) return '1 Glass (350ml Chilled)';
  if (name.includes('paneer') || name.includes('chicken') || name.includes('curry') || name.includes('dal') || name.includes('gravy')) return '1 Handi (400g • Serves 1-2)';
  return '1 Standard Portion (Serves 1-2)';
};

/**
 * Computes comprehensive macro nutrition facts and health insights for any food dish
 */
export const getDishNutrition = (dish) => {
  const custom = dish?.nutrition;
  const name = (dish?.name || '').toLowerCase();
  const cat = (dish?.category || '').toLowerCase();
  const isVeg = Boolean(dish?.isVeg);

  let base = {
    calories: 450,
    protein: isVeg ? 16 : 30,
    carbs: 52,
    fat: 18,
    fiber: 5,
    sugar: 5,
    sodium: 480,
    servingSize: getDishQuantity(dish),
    highlights: isVeg ? ['100% Vegetarian', 'Fiber Rich'] : ['High Protein', 'Rich in Iron'],
    allergens: isVeg ? ['Contains Dairy'] : ['Contains Poultry'],
  };

  if (name.includes('biryani') || cat.includes('biryani')) {
    base = {
      calories: isVeg ? 580 : 680,
      protein: isVeg ? 18 : 34,
      carbs: 82,
      fat: isVeg ? 22 : 26,
      fiber: 6,
      sugar: 4,
      sodium: 590,
      servingSize: '1 Handi (~500g)',
      highlights: [isVeg ? 'Traditional Veg Handi' : 'High Quality Protein', 'Aromatic Spices', 'Slow Cooked Dum'],
      allergens: isVeg ? ['Contains Dairy (Ghee)', 'Cashews'] : ['Contains Poultry', 'Dairy (Ghee)'],
    };
  } else if (name.includes('pizza') || cat.includes('pizza')) {
    base = {
      calories: isVeg ? 680 : 760,
      protein: isVeg ? 24 : 32,
      carbs: 86,
      fat: 26,
      fiber: 5,
      sugar: 7,
      sodium: 740,
      servingSize: '1 Pizza (10" • 6 Slices)',
      highlights: ['Artisanal Crust', 'Real Mozzarella', 'Oven Baked'],
      allergens: ['Contains Gluten (Wheat)', 'Contains Dairy (Cheese)'],
    };
  } else if (name.includes('burger') || cat.includes('burger')) {
    base = {
      calories: isVeg ? 520 : 620,
      protein: isVeg ? 18 : 31,
      carbs: 56,
      fat: 27,
      fiber: 4,
      sugar: 8,
      sodium: 680,
      servingSize: '1 Burger (240g)',
      highlights: ['Grilled Patty', 'Fresh Brioche', 'Crispy Greens'],
      allergens: ['Contains Gluten', 'Contains Dairy', 'Sesame Seeds'],
    };
  } else if (name.includes('dosa') || name.includes('idli')) {
    base = {
      calories: 340,
      protein: 11,
      carbs: 58,
      fat: 8,
      fiber: 7,
      sugar: 3,
      sodium: 410,
      servingSize: '1 Full Plate (~350g)',
      highlights: ['Fermented Batter', 'Gut Friendly', 'Low Fat', 'Pure Veg'],
      allergens: ['Mustard Seeds (in Sambar)', 'Coconut (in Chutney)'],
    };
  } else if (name.includes('noodle') || name.includes('fried rice') || cat.includes('chinese')) {
    base = {
      calories: 520,
      protein: isVeg ? 14 : 26,
      carbs: 76,
      fat: 18,
      fiber: 5,
      sugar: 6,
      sodium: 690,
      servingSize: '1 Wok Bowl (~450g)',
      highlights: ['Wok Tossed', 'Fresh Vegetables', 'Rich in Flavor'],
      allergens: ['Contains Gluten', 'Contains Soy'],
    };
  } else if (name.includes('tikka') || name.includes('kebab') || name.includes('grilled')) {
    base = {
      calories: isVeg ? 390 : 480,
      protein: isVeg ? 22 : 42,
      carbs: 16,
      fat: 18,
      fiber: 4,
      sugar: 4,
      sodium: 520,
      servingSize: '1 Sizzler Plate (6 Pcs)',
      highlights: ['Clay Tandoor Grilled', 'Lean Protein', 'Low Carb', 'Keto Friendly'],
      allergens: ['Contains Dairy (Curd marinade)'],
    };
  } else if (name.includes('paneer') || name.includes('dal') || name.includes('curry')) {
    base = {
      calories: isVeg ? 430 : 540,
      protein: isVeg ? 21 : 36,
      carbs: 34,
      fat: 23,
      fiber: 7,
      sugar: 5,
      sodium: 520,
      servingSize: '1 Handi (~400g)',
      highlights: ['Rich Mughlai Gravy', 'High Calcium & Protein', 'Slow Simmered'],
      allergens: ['Contains Dairy (Cream, Butter, Paneer)'],
    };
  } else if (name.includes('shake') || name.includes('lassi') || cat.includes('beverage')) {
    base = {
      calories: 260,
      protein: 9,
      carbs: 38,
      fat: 8,
      fiber: 2,
      sugar: 29,
      sodium: 120,
      servingSize: '1 Glass (350ml)',
      highlights: ['Chilled Fresh', 'Probiotic Rich', 'Refreshing'],
      allergens: ['Contains Dairy (Milk/Yogurt)'],
    };
  } else if (name.includes('cake') || name.includes('jamun') || cat.includes('dessert')) {
    base = {
      calories: 390,
      protein: 6,
      carbs: 54,
      fat: 18,
      fiber: 2,
      sugar: 36,
      sodium: 160,
      servingSize: '1 Serving Portion',
      highlights: ['Artisanal Sweet Treat', 'Warm & Indulgent'],
      allergens: ['Contains Dairy', 'Contains Gluten'],
    };
  }

  // Override with any custom database fields if present
  if (custom && typeof custom === 'object') {
    if (custom.calories) base.calories = custom.calories;
    if (custom.protein) base.protein = custom.protein;
    if (custom.carbs) base.carbs = custom.carbs;
    if (custom.fat) base.fat = custom.fat;
    if (custom.fiber) base.fiber = custom.fiber;
    if (custom.sugar) base.sugar = custom.sugar;
    if (custom.sodium) base.sodium = custom.sodium;
  }

  // Calorie math: Protein 4 kcal/g, Carbs 4 kcal/g, Fat 9 kcal/g
  const proteinKcal = base.protein * 4;
  const carbsKcal = base.carbs * 4;
  const fatKcal = base.fat * 9;
  const calculatedTotalKcal = proteinKcal + carbsKcal + fatKcal || base.calories;

  base.macroPct = {
    protein: Math.round((proteinKcal / calculatedTotalKcal) * 100),
    carbs: Math.round((carbsKcal / calculatedTotalKcal) * 100),
    fat: Math.round((fatKcal / calculatedTotalKcal) * 100),
  };

  // % Daily Value (based on 2000 kcal diet)
  base.dailyValue = {
    calories: Math.round((base.calories / 2000) * 100),
    protein: Math.round((base.protein / 50) * 100),
    carbs: Math.round((base.carbs / 275) * 100),
    fat: Math.round((base.fat / 78) * 100),
    fiber: Math.round((base.fiber / 28) * 100),
    sodium: Math.round((base.sodium / 2300) * 100),
  };

  return base;
};
