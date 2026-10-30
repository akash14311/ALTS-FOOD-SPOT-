import API from './api';
import {
  mockPopularDishes,
  mockRestaurants,
  getDishQuantity,
  getDishNutrition,
} from './mockData';

export const STARTER_PROMPTS = [
  { id: 'high-protein', label: '💪 High Protein (>30g)', query: 'Show me high protein dishes with more than 30g protein' },
  { id: 'low-calorie', label: '🥗 Low Calorie (<450 kcal)', query: 'Healthy meals under 450 calories' },
  { id: 'budget', label: '💰 Budget Friendly (<₹250)', query: 'What are the best dishes under 250 rupees?' },
  { id: 'biryani', label: '🍲 Best Biryanis', query: 'Recommend the top aromatic Dum Biryanis' },
  { id: 'pure-veg', label: '🌱 Pure Vegetarian', query: 'Show popular pure veg dishes with great ratings' },
  { id: 'meal-for-2', label: '👥 Meal for 2 People', query: 'Suggest a complete dinner combo for two people' },
  { id: 'dessert', label: '🍰 Sweets & Desserts', query: 'Recommend delicious sweet treats and desserts' },
  { id: 'spicy', label: '🌶️ Spicy & Savory', query: 'I want something spicy and flavor-packed' }
];

/**
 * Intelligent client-side fallback if backend API is offline or responding slowly
 */
function localAiReasoning(userMessage = '') {
  const q = userMessage.toLowerCase().trim();
  const isVeg = /\b(pure veg|vegetarian|only veg|veg)\b/i.test(q) && !/\b(non[-\s]?veg)\b/i.test(q);
  const isNonVeg = /\b(non[-\s]?veg|chicken|mutton|meat|fish|egg)\b/i.test(q);
  const priceMatch = q.match(/(?:under|below|less than|within|budget of)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;
  const isHighProtein = /\b(high protein|protein|gym|muscle)\b/i.test(q);
  const isLowCalorie = /\b(low calorie|low cal|diet|weight loss|healthy)\b/i.test(q);

  let pool = [...mockPopularDishes];

  // Diet filter
  if (isVeg) pool = pool.filter((d) => d.isVeg);
  if (isNonVeg) pool = pool.filter((d) => !d.isVeg);

  // Price filter
  if (maxPrice) pool = pool.filter((d) => d.price <= maxPrice);

  // Keyword score
  const scored = pool.map((d) => {
    let score = d.rating * 10;
    const name = d.name.toLowerCase();
    const desc = d.description.toLowerCase();
    const cat = d.category.toLowerCase();

    if (q.includes('biryani') && (name.includes('biryani') || cat.includes('biryani'))) score += 50;
    if (q.includes('pizza') && (name.includes('pizza') || cat.includes('pizza'))) score += 50;
    if (q.includes('burger') && (name.includes('burger') || cat.includes('burger'))) score += 50;
    if (q.includes('dosa') && (name.includes('dosa') || cat.includes('south-indian'))) score += 50;
    if (q.includes('dessert') && (name.includes('cake') || cat.includes('dessert'))) score += 50;

    const nutrition = getDishNutrition(d);
    if (isHighProtein && nutrition.protein >= 24) score += 35;
    if (isLowCalorie && nutrition.calories <= 480) score += 30;

    return { ...d, matchScore: score, nutrition };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  const topPicks = (scored.length > 0 ? scored : mockPopularDishes).slice(0, 3).map((d) => ({
    _id: d._id,
    name: d.name,
    price: d.price,
    description: d.description,
    image: d.image,
    isVeg: d.isVeg,
    quantity: d.quantity || getDishQuantity(d),
    nutrition: d.nutrition || getDishNutrition(d),
    restaurant: mockRestaurants.find((r) => r._id === d.restaurant) || mockRestaurants[0],
    rating: d.rating || 4.5,
  }));

  let replyText = `I analyzed your request for "${userMessage}" across ALTS FOOD spot kitchens! Here are our chef-recommended top matches:`;
  if (isHighProtein) replyText = 'Targeting high protein? These power-packed dishes deliver generous protein per serving:';
  else if (isLowCalorie) replyText = 'Healthy and light! These delicious dishes fit comfortably within your calorie target:';
  else if (maxPrice) replyText = `Top culinary value picks under ₹${maxPrice} with lightning delivery:`;
  else if (isVeg) replyText = '100% Vegetarian perfection! Aromatic, fresh, and highly rated:';

  const followUpOptions = [
    { label: '🌱 Only Vegetarian', query: `${userMessage} (Vegetarian only)` },
    { label: '💰 Budget under ₹250', query: `${userMessage} under ₹250` },
    { label: '💪 High Protein Options', query: `${userMessage} with high protein` },
    { label: '🍰 Add Sweet Dessert', query: 'Suggest best desserts' },
  ];

  return {
    reply: replyText,
    items: topPicks,
    followUpOptions: followUpOptions.slice(0, 4),
  };
}

/**
 * Sends a message to the AI Assistant
 */
export const queryAiAssistant = async (message, preference = {}) => {
  try {
    const res = await API.post('/ai/chat', { message, preference });
    if (res.success && res.data) {
      return res.data;
    }
    return localAiReasoning(message);
  } catch (err) {
    console.warn('Backend AI route unavailable, using intelligent local engine:', err.message);
    return localAiReasoning(message);
  }
};

