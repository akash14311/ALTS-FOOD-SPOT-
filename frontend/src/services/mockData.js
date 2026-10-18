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
    review: 'food spot is a lifesaver! The live order tracking is so smooth and accurate. My Biryani arrived piping hot in just 25 minutes!'
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
