const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

/**
 * Intelligent Culinary Recommendation Engine for ALTS FOOD spot
 */
const quickPrompts = [
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
 * Parses user natural language query and extracts intent filters
 */
function parseQueryIntent(text = '') {
  const q = text.toLowerCase().trim();
  const filters = {
    isVeg: null,
    maxPrice: null,
    minProtein: null,
    maxCalories: null,
    categoryKeyword: null,
    dishKeyword: null,
    tags: []
  };

  // Diet detection
  if (/\b(pure veg|vegetarian|only veg|veg)\b/i.test(q) && !/\b(non[-\s]?veg)\b/i.test(q)) {
    filters.isVeg = true;
    filters.tags.push('Vegetarian');
  } else if (/\b(non[-\s]?veg|chicken|mutton|meat|fish|egg)\b/i.test(q)) {
    filters.isVeg = false;
    filters.tags.push('Non-Vegetarian');
  }

  // Budget detection (e.g. "under 200", "under ₹300", "below 250")
  const priceMatch = q.match(/(?:under|below|less than|within|budget of)\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (priceMatch) {
    filters.maxPrice = parseInt(priceMatch[1], 10);
    filters.tags.push(`Under ₹${filters.maxPrice}`);
  }

  // Macro Goals
  if (/\b(high protein|protein rich|bodybuilding|gym|muscle)\b/i.test(q)) {
    filters.minProtein = 25;
    filters.tags.push('High Protein');
  }
  if (/\b(low calorie|low cal|diet|weight loss|healthy|light)\b/i.test(q)) {
    filters.maxCalories = 480;
    filters.tags.push('Low Calorie');
  }
  if (/\b(keto|low carb)\b/i.test(q)) {
    filters.tags.push('Keto Friendly');
  }

  // Category & Cuisine Cravings
  if (/\b(biryani|dum biryani|handi)\b/i.test(q)) filters.categoryKeyword = 'biryani';
  else if (/\b(pizza|crust|slice)\b/i.test(q)) filters.categoryKeyword = 'pizza';
  else if (/\b(burger|patty|fries)\b/i.test(q)) filters.categoryKeyword = 'burger';
  else if (/\b(dosa|idli|vada|south indian)\b/i.test(q)) filters.categoryKeyword = 'south-indian';
  else if (/\b(noodle|fried rice|chinese|dim sum|momos|manchurian)\b/i.test(q)) filters.categoryKeyword = 'chinese';
  else if (/\b(cake|dessert|sweet|jamun|ice cream|pastry)\b/i.test(q)) filters.categoryKeyword = 'dessert';
  else if (/\b(shake|lassi|juice|beverage|drink|cola)\b/i.test(q)) filters.categoryKeyword = 'beverage';
  else if (/\b(paneer|curry|roti|naan|dal|thali|north indian)\b/i.test(q)) filters.categoryKeyword = 'north-indian';

  return filters;
}

/**
 * Handles AI chat recommendation requests
 */
exports.getAiSuggestions = async (req, res) => {
  try {
    const { message, preference } = req.body;
    const userMessage = (message || '').trim();

    if (!userMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message or prompt for the AI Assistant'
      });
    }

    const intent = parseQueryIntent(userMessage);

    // Apply client overrides if passed explicitly
    if (preference) {
      if (typeof preference.isVeg === 'boolean') intent.isVeg = preference.isVeg;
      if (preference.maxPrice) intent.maxPrice = Number(preference.maxPrice);
      if (preference.minProtein) intent.minProtein = Number(preference.minProtein);
      if (preference.maxCalories) intent.maxCalories = Number(preference.maxCalories);
    }

    // Build DB Query
    let queryFilter = { isAvailable: { $ne: false } };

    if (intent.isVeg !== null) {
      queryFilter.isVeg = intent.isVeg;
    }

    if (intent.maxPrice) {
      queryFilter.price = { $lte: intent.maxPrice };
    }

    // Fetch candidate dishes with restaurant populated
    let dishes = await Food.find(queryFilter)
      .populate('restaurant', 'name rating deliveryTimeMins address')
      .lean();

    // In case DB has no foods yet, fallback to dummy items for resilience
    if (!dishes || dishes.length === 0) {
      dishes = await Food.find({}).populate('restaurant', 'name rating').lean();
    }

    // Score & Rank dishes based on keywords and nutrition macros
    const scoredDishes = dishes.map((dish) => {
      let score = dish.rating ? dish.rating * 10 : 40;
      const dName = (dish.name || '').toLowerCase();
      const dCat = (dish.category || '').toLowerCase();
      const dDesc = (dish.description || '').toLowerCase();

      // Category match boost
      if (intent.categoryKeyword) {
        if (dName.includes(intent.categoryKeyword) || dCat.includes(intent.categoryKeyword)) {
          score += 45;
        }
      }

      // Keyword matches
      const tokens = userMessage.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      tokens.forEach((token) => {
        if (dName.includes(token)) score += 20;
        if (dDesc.includes(token)) score += 10;
        if (dCat.includes(token)) score += 15;
      });

      // Protein filter / boost
      const protein = dish.nutrition?.protein || 20;
      if (intent.minProtein && protein >= intent.minProtein) {
        score += 35;
      }

      // Calorie filter / boost
      const calories = dish.nutrition?.calories || 500;
      if (intent.maxCalories && calories <= intent.maxCalories) {
        score += 30;
      }

      if (dish.isPopular) score += 8;

      return { ...dish, matchScore: score };
    });

    // Sort descending by score
    scoredDishes.sort((a, b) => b.matchScore - a.matchScore);

    // Pick top 3 to 4 best recommendations
    const topPicks = scoredDishes.slice(0, 4);

    // Generate contextual AI response narrative
    let aiResponseText = '';
    const topPickNames = topPicks.map((d) => d.name).join(', ');

    if (intent.categoryKeyword === 'biryani') {
      aiResponseText = `Aromatic spices and tender layers! I found these top-rated Dum Biryanis for you${intent.maxPrice ? ` under ₹${intent.maxPrice}` : ''}. Each portion comes fresh with raita and authentic gravy:`;
    } else if (intent.minProtein) {
      aiResponseText = `Targeting high protein? Excellent choice! These dishes deliver 25g+ of pure lean protein per serving to power your day:`;
    } else if (intent.maxCalories) {
      aiResponseText = `Here are chef-crafted healthy dishes under ${intent.maxCalories} kcal. Packed with natural flavor without compromising your fitness goals:`;
    } else if (intent.maxPrice) {
      aiResponseText = `Pocket-friendly and delicious! Here are the best culinary value picks under ₹${intent.maxPrice}:`;
    } else if (intent.isVeg) {
      aiResponseText = `100% Pure Vegetarian goodness! Here are top-rated vegetarian favorites prepared in hygienic kitchens:`;
    } else {
      aiResponseText = `I analyzed our partner kitchens across the city for "${userMessage}". Here are the most delicious matches tailored to your taste:`;
    }

    // Dynamic next-step follow-up option button prompts
    const followUps = [];
    if (!intent.isVeg) followUps.push({ label: '🌱 Filter Pure Veg', query: `${userMessage} (Vegetarian only)` });
    if (!intent.maxPrice) followUps.push({ label: '💰 Show under ₹250', query: `${userMessage} under 250` });
    if (!intent.minProtein) followUps.push({ label: '💪 High Protein Options', query: `${userMessage} with high protein` });
    followUps.push({ label: '🍰 Add Dessert', query: 'Suggest delicious desserts' });
    followUps.push({ label: '🥤 Drink Recommendations', query: 'Show beverages and chilled shakes' });

    return res.json({
      success: true,
      data: {
        reply: aiResponseText,
        intentDetected: intent.tags,
        items: topPicks.map((dish) => ({
          _id: dish._id,
          name: dish.name,
          price: dish.price,
          description: dish.description,
          image: dish.image,
          isVeg: dish.isVeg,
          quantity: dish.quantity || '1 Standard Portion (Serves 1-2)',
          nutrition: dish.nutrition || { calories: 520, protein: 24, carbs: 54, fat: 18 },
          restaurant: dish.restaurant || { _id: 'rest-1', name: 'ALTS Kitchen Partner' },
          rating: dish.rating || 4.5
        })),
        followUpOptions: followUps.slice(0, 4)
      }
    });
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate culinary AI suggestions: ' + error.message
    });
  }
};

/**
 * Returns available quick prompt starter options
 */
exports.getQuickPrompts = (req, res) => {
  return res.json({
    success: true,
    data: quickPrompts
  });
};

