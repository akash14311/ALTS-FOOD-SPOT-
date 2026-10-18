require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Address = require('../models/Address');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Favorite = require('../models/Favorite');
const Coupon = require('../models/Coupon');
const connectDB = require('../config/db');

const seedDatabase = async (exitOnComplete = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('\n--- 🧹 Clearing Existing Database Collections ---');
    await User.deleteMany({});
    await Address.deleteMany({});
    await Restaurant.deleteMany({});
    await Food.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Favorite.deleteMany({});
    await Coupon.deleteMany({});
    console.log('✓ All collections wiped clean.');

    // 1. Create Users
    console.log('\n--- 👤 Seeding Users ---');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      mobile: '9876543210',
      passwordHash: adminPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    });

    const rahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@foodspot.com',
      mobile: '9888877771',
      passwordHash: userPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    });

    const priya = await User.create({
      name: 'Priya Patel',
      email: 'priya@foodspot.com',
      mobile: '9888877772',
      passwordHash: userPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    });

    const arjun = await User.create({
      name: 'Arjun Verma',
      email: 'arjun@foodspot.com',
      mobile: '9888877773',
      passwordHash: userPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    });

    console.log('✓ Seeded 4 primary users (1 admin, 3 regular users).');

    // 2. Create Saved Addresses
    console.log('\n--- 📍 Seeding Saved Addresses ---');
    const rahulAddress1 = await Address.create({
      user: rahul._id,
      fullName: 'Rahul Sharma',
      mobile: '9888877771',
      houseNo: 'Flat 402, Sunshine Heights',
      street: '12th Main, Koramangala 4th Block',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
      isDefault: true,
    });

    const rahulAddress2 = await Address.create({
      user: rahul._id,
      fullName: 'Rahul Sharma (Office)',
      mobile: '9888877771',
      houseNo: 'Tower B, Tech Park',
      street: 'Outer Ring Road, Bellandur',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560103',
      isDefault: false,
    });

    rahul.savedAddresses = [rahulAddress1._id, rahulAddress2._id];
    await rahul.save();

    const priyaAddress = await Address.create({
      user: priya._id,
      fullName: 'Priya Patel',
      mobile: '9888877772',
      houseNo: 'Villa 18, Palm Meadows',
      street: 'Varthur Main Road, Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      isDefault: true,
    });
    priya.savedAddresses = [priyaAddress._id];
    await priya.save();

    const arjunAddress = await Address.create({
      user: arjun._id,
      fullName: 'Arjun Verma',
      mobile: '9888877773',
      houseNo: '#89, 7th Cross',
      street: '27th Main Road, HSR Sector 1',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560102',
      isDefault: true,
    });
    arjun.savedAddresses = [arjunAddress._id];
    await arjun.save();
    console.log('✓ Seeded addresses.');

    // 3. Create Coupons
    console.log('\n--- 🏷️ Seeding Promotional Coupons ---');
    await Coupon.create([
      {
        code: 'CRAVE10',
        description: '10% OFF on all orders above ₹199 (Max ₹100)',
        type: 'percent',
        value: 10,
        minOrder: 199,
        maxDiscount: 100,
        isActive: true,
      },
      {
        code: 'FIRST50',
        description: '50% OFF on your very first order above ₹299 (Max ₹120)',
        type: 'percent',
        value: 50,
        minOrder: 299,
        maxDiscount: 120,
        isActive: true,
      },
      {
        code: 'FOOD20',
        description: '20% OFF on mega orders above ₹399 (Max ₹150)',
        type: 'percent',
        value: 20,
        minOrder: 399,
        maxDiscount: 150,
        isActive: true,
      },
      {
        code: 'CRAVE20',
        description: '20% OFF on mega orders above ₹399 (Max ₹150)',
        type: 'percent',
        value: 20,
        minOrder: 399,
        maxDiscount: 150,
        isActive: true,
      },
      {
        code: 'FREEDEL',
        description: 'Free Delivery on any order above ₹249',
        type: 'freeDelivery',
        value: 40,
        minOrder: 249,
        maxDiscount: 40,
        isActive: true,
      },
    ]);
    console.log('✓ Seeded 5 standard coupons.');

    // 4. Create 10 Restaurants & Dishes
    console.log('\n--- 🍽️ Seeding 10 Restaurants & 80+ Dishes ---');

    const restaurantsData = [
      {
        name: 'Spice Villa',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['North Indian', 'Mughlai', 'Biryani'],
        rating: 4.6,
        deliveryTimeMins: 30,
        priceRange: '₹₹',
        isVeg: false,
        isPureVeg: false,
        address: { street: 'Koramangala 5th Block', city: 'Bangalore', state: 'Karnataka', pincode: '560034' },
        dishes: [
          { name: 'Paneer Butter Masala', category: 'Main Course', price: 280, isVeg: true, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80', description: 'Fresh cottage cheese simmered in a creamy tomato makhani sauce.' },
          { name: 'Murgh Makhani (Butter Chicken)', category: 'Main Course', price: 340, isVeg: false, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop&q=80', description: 'Tender tandoori chicken chunks cooked in rich velvety buttery gravy.' },
          { name: 'Garlic Butter Naan', category: 'Starters', price: 65, isVeg: true, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80', description: 'Clay-oven baked flatbread infused with roasted garlic and butter.' },
          { name: 'Tandoori Chicken Platter', category: 'Starters', price: 360, isVeg: false, rating: 4.7, isPopular: true, image: '/images/dishes/tandoori-chicken.jpg', description: 'Juicy half chicken marinated in yogurt and traditional aromatic spices.' },
          { name: 'Dal Tadka Special', category: 'Main Course', price: 210, isVeg: true, rating: 4.4, isPopular: false, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80', description: 'Yellow lentils tempered with cumin, garlic, dry red chillies and ghee.' },
          { name: 'Gulab Jamun (2 Pcs)', category: 'Desserts', price: 90, isVeg: true, rating: 4.8, isPopular: false, image: 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=600&auto=format&fit=crop&q=80', description: 'Soft golden fried milk-dough balls soaked in rose scented sugar syrup.' },
          { name: 'Sweet Mango Lassi', category: 'Beverages', price: 110, isVeg: true, rating: 4.7, isPopular: false, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&auto=format&fit=crop&q=80', description: 'Thick churned fresh yogurt blended with Alphonso mango pulp.' },
          { name: 'Dum Mutton Biryani', category: 'Biryani', price: 390, isVeg: false, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80', description: 'Slow-cooked succulent goat meat layered with spiced saffron basmati.' }
        ]
      },
      {
        name: 'The Burger Hub',
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Burgers', 'American', 'Fast Food'],
        rating: 4.5,
        deliveryTimeMins: 25,
        priceRange: '₹₹',
        isVeg: false,
        isPureVeg: false,
        address: { street: 'Indiranagar 100ft Road', city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
        dishes: [
          { name: 'Smoky BBQ Cheese Burger', category: 'Burgers', price: 249, isVeg: false, rating: 4.7, isPopular: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80', description: 'Juicy chicken patty grilled to perfection with smoky BBQ glaze and melted cheddar.' },
          { name: 'Crispy Paneer Supreme Burger', category: 'Burgers', price: 219, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80', description: 'Thick herb-crusted cottage cheese patty with spicy mayo and crisp lettuce.' },
          { name: 'Peri Peri Crinkle Fries', category: 'Starters', price: 129, isVeg: true, rating: 4.6, isPopular: true, image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=600&auto=format&fit=crop&q=80', description: 'Crisp golden potato crinkle cuts tossed in fiery African peri-peri spices.' },
          { name: 'Classic Chicken Wings (6 Pcs)', category: 'Starters', price: 279, isVeg: false, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&auto=format&fit=crop&q=80', description: 'Deep fried crispy wings smothered in hot Louisiana buffalo sauce.' },
          { name: 'Double Bacon Smash Burger', category: 'Burgers', price: 329, isVeg: false, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80', description: 'Two smashed beef-style patties with crispy chicken bacon and double cheese.' },
          { name: 'Chocolate Mud Brownie', category: 'Desserts', price: 139, isVeg: true, rating: 4.7, isPopular: false, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80', description: 'Warm fudgy chocolate brownie drizzled with hot dark chocolate ganache.' },
          { name: 'Thick Oreo Milkshake', category: 'Beverages', price: 169, isVeg: true, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80', description: 'Creamy vanilla ice cream blended with crushed Oreo cookies.' },
          { name: 'Spicy Veggie Delight Burger', category: 'Burgers', price: 189, isVeg: true, rating: 4.3, isPopular: false, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&auto=format&fit=crop&q=80', description: 'Seasoned green pea and potato patty with tangy pickles and sesame buns.' }
        ]
      },
      {
        name: 'Pizza Point',
        image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Pizza', 'Italian', 'Pastas'],
        rating: 4.4,
        deliveryTimeMins: 35,
        priceRange: '₹₹',
        isVeg: false,
        isPureVeg: false,
        address: { street: 'HSR Layout Sector 2', city: 'Bangalore', state: 'Karnataka', pincode: '560102' },
        dishes: [
          { name: 'Margherita Fresca (11")', category: 'Pizza', price: 349, isVeg: true, rating: 4.6, isPopular: true, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80', description: 'San Marzano tomato base with imported buffalo mozzarella and fresh sweet basil.' },
          { name: 'Chicken Pepperoni Blast (11")', category: 'Pizza', price: 449, isVeg: false, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop&q=80', description: 'Loaded with spicy cured chicken pepperoni and extra mozzarella.' },
          { name: 'Farmhouse Veggie Overload (11")', category: 'Pizza', price: 399, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&auto=format&fit=crop&q=80', description: 'Topped with bell peppers, sweet corn, mushrooms, black olives and red onions.' },
          { name: 'Creamy Alfredo Penne Pasta', category: 'Main Course', price: 299, isVeg: true, rating: 4.4, isPopular: false, image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&auto=format&fit=crop&q=80', description: 'Al dente penne folded into a rich parmesan garlic cream sauce.' },
          { name: 'Garlic Breadsticks with Dip', category: 'Starters', price: 149, isVeg: true, rating: 4.7, isPopular: true, image: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=400&auto=format&fit=crop&q=80', description: 'Baked dough fingers brushed with herb butter and served with cheesy jalapeno dip.' },
          { name: 'Spicy Arrabbiata Chicken Pasta', category: 'Main Course', price: 339, isVeg: false, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&auto=format&fit=crop&q=80', description: 'Tangy spiced tomato sauce tossed with herbs and grilled chicken breast.' },
          { name: 'Molten Choco Lava Cake', category: 'Desserts', price: 129, isVeg: true, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&auto=format&fit=crop&q=80', description: 'Decadent chocolate cake with a warm flowing liquid fudge center.' },
          { name: 'Italian Lemon Iced Tea', category: 'Beverages', price: 99, isVeg: true, rating: 4.3, isPopular: false, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80', description: 'Brewed black tea infused with real lemon juice and fresh mint.' }
        ]
      },
      {
        name: 'Biryani House',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Biryani', 'Hyderabadi', 'Kebabs'],
        rating: 4.7,
        deliveryTimeMins: 28,
        priceRange: '₹₹',
        isVeg: false,
        isPureVeg: false,
        address: { street: 'Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', pincode: '560066' },
        dishes: [
          { name: 'Special Chicken Dum Biryani', category: 'Biryani', price: 320, isVeg: false, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80', description: 'Signature dish cooked under dough seal with marinated country chicken and long basmati.' },
          { name: 'Royal Mutton Biryani (Bone-in)', category: 'Biryani', price: 420, isVeg: false, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80', description: 'Tender baby goat cuts slow-infused with saffron, mint, and pure desi ghee.' },
          { name: 'Paneer Makhani Biryani', category: 'Biryani', price: 270, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=400&auto=format&fit=crop&q=80', description: 'Marinated paneer tikka pieces layered with fragrantly spiced rice.' },
          { name: 'Chicken Seekh Kebab (4 Pcs)', category: 'Starters', price: 290, isVeg: false, rating: 4.7, isPopular: true, image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80', description: 'Minced spiced chicken skewers roasted on open embers with mint chutney.' },
          { name: 'Mirchi Ka Salan & Raita Combo', category: 'Starters', price: 80, isVeg: true, rating: 4.4, isPopular: false, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80', description: 'Traditional Hyderabadi peanut sesame chili curry and cooling onion cucumber curd.' },
          { name: 'Chicken 65 Hyderabadi Style', category: 'Starters', price: 260, isVeg: false, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80', description: 'Crispy battered chicken nuggets tossed with curry leaves, yogurt and green chillies.' },
          { name: 'Shahi Tukda', category: 'Desserts', price: 110, isVeg: true, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80', description: 'Crisp fried bread soaked in saffron rabri condensed milk and topped with pistachios.' },
          { name: 'Thums Up (750ml)', category: 'Beverages', price: 45, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80', description: 'Chilled bubbly cola with intense thunder flavor.' }
        ]
      },
      {
        name: 'South Indian Kitchen',
        image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['South Indian', 'Dosa', 'Filter Coffee'],
        rating: 4.8,
        deliveryTimeMins: 20,
        priceRange: '₹',
        isVeg: true,
        isPureVeg: true,
        address: { street: 'Jayanagar 4th Block', city: 'Bangalore', state: 'Karnataka', pincode: '560011' },
        dishes: [
          { name: 'Ghee Podi Masala Dosa', category: 'Main Course', price: 140, isVeg: true, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop&q=80', description: 'Extra crispy golden crepe smeared with aromatic gunpowder podi and pure ghee.' },
          { name: 'Steamed Idli (3 Pcs) with Vada', category: 'Starters', price: 95, isVeg: true, rating: 4.7, isPopular: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80', description: 'Pillow-soft fermented rice cakes and crunchy lentil medu vada with hot sambar.' },
          { name: 'Crispy Rava Onion Dosa', category: 'Main Course', price: 130, isVeg: true, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400&auto=format&fit=crop&q=80', description: 'Semolina crepe laced with green chillies, ginger, and caramelized onions.' },
          { name: 'Medu Vada (2 Pcs)', category: 'Starters', price: 60, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', description: 'Golden fried savory donut fritters with crispy exterior and soft fluffy crumb.' },
          { name: 'Bisi Bele Bath', category: 'Main Course', price: 120, isVeg: true, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80', description: 'Hearty Karnataka style rice-lentil stew cooked with fresh vegetables and boondi.' },
          { name: 'Kesari Bath (Pineapple)', category: 'Desserts', price: 75, isVeg: true, rating: 4.7, isPopular: false, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', description: 'Traditional semolina pudding roasted in ghee, saffron, and pineapple chunks.' },
          { name: 'Authentic Filter Kaapi', category: 'Beverages', price: 50, isVeg: true, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80', description: 'Freshly decocted chicory blend frothed with hot creamy milk.' },
          { name: 'Curd Rice with Pomegranate', category: 'Main Course', price: 90, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80', description: 'Cool seasoned yogurt rice tempered with mustard, curry leaves, and ginger.' }
        ]
      },
      {
        name: 'Tandoori Tales',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Tandoori', 'North Indian', 'Curries'],
        rating: 4.3,
        deliveryTimeMins: 32,
        priceRange: '₹₹',
        isVeg: false,
        isPureVeg: false,
        address: { street: 'MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        dishes: [
          { name: 'Dal Makhani Bukhara', category: 'Main Course', price: 260, isVeg: true, rating: 4.7, isPopular: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', description: 'Black lentils slow cooked overnight on low embers with butter and fresh cream.' },
          { name: 'Amritsari Kulcha with Chole', category: 'Main Course', price: 230, isVeg: true, rating: 4.6, isPopular: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80', description: 'Stuffed potato onion tandoori bread served with tangy Punjabi chickpeas.' },
          { name: 'Tandoori Paneer Tikka (6 Pcs)', category: 'Starters', price: 290, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80', description: 'Smoky skewered paneer cubes with bell peppers and roasted onion petals.' },
          { name: 'Afghani Malai Murgh Tikka', category: 'Starters', price: 340, isVeg: false, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80', description: 'Boneless chicken marinated in cashew cream, cheese, and crushed cardamom.' },
          { name: 'Kadhai Chicken', category: 'Main Course', price: 320, isVeg: false, rating: 4.4, isPopular: false, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop&q=80', description: 'Spiced chicken cooked with crunchy bell peppers and coarsely pounded coriander seeds.' },
          { name: 'Laccha Paratha', category: 'Starters', price: 55, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&auto=format&fit=crop&q=80', description: 'Multi-layered crispy whole wheat tandoori flatbread brushed with ghee.' },
          { name: 'Rasmalai (2 Pcs)', category: 'Desserts', price: 120, isVeg: true, rating: 4.8, isPopular: false, image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80', description: 'Poached cottage cheese discs immersed in thickened saffron almond milk.' },
          { name: 'Masala Chaas', category: 'Beverages', price: 65, isVeg: true, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&auto=format&fit=crop&q=80', description: 'Refreshing spiced buttermilk whisked with ginger, roasted cumin, and mint.' }
        ]
      },
      {
        name: 'Sweet Cravings',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Desserts', 'Cakes', 'Ice Creams'],
        rating: 4.9,
        deliveryTimeMins: 22,
        priceRange: '₹₹',
        isVeg: true,
        isPureVeg: false,
        address: { street: 'Koramangala 1st Block', city: 'Bangalore', state: 'Karnataka', pincode: '560034' },
        dishes: [
          { name: 'Belgian Chocolate Truffle Pastry', category: 'Desserts', price: 169, isVeg: true, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80', description: 'Layers of rich chocolate sponge with dark Belgian chocolate silky ganache.' },
          { name: 'New York Baked Cheesecake Slice', category: 'Desserts', price: 219, isVeg: true, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop&q=80', description: 'Velvety cream cheese filling on butter graham cracker crust with blueberry compote.' },
          { name: 'Red Velvet Jar Cake', category: 'Desserts', price: 189, isVeg: true, rating: 4.7, isPopular: false, image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&auto=format&fit=crop&q=80', description: 'Moist crimson crumb cake layered with fluffy sweet cream cheese frosting.' },
          { name: 'Nutella Belgian Waffle', category: 'Desserts', price: 199, isVeg: true, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&auto=format&fit=crop&q=80', description: 'Freshly griddled golden waffle topped with generous warm Nutella and chopped almonds.' },
          { name: 'Sundae Fantasy Tub (500ml)', category: 'Desserts', price: 299, isVeg: true, rating: 4.8, isPopular: false, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop&q=80', description: 'Triple chocolate scoop tub loaded with fudge brownies and choco chips.' },
          { name: 'Alphonso Mango Pastry', category: 'Desserts', price: 159, isVeg: true, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80', description: 'Seasonal fresh sponge cake loaded with real mango chunks and whipped cream.' },
          { name: 'Iced Caramel Macchiato', category: 'Beverages', price: 180, isVeg: true, rating: 4.7, isPopular: false, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80', description: 'Espresso poured over iced vanilla milk and drizzled with buttery caramel.' },
          { name: 'Hazelnut Frappe', category: 'Beverages', price: 190, isVeg: true, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80', description: 'Blended icy coffee with roasted hazelnut syrup and whipped cream crown.' }
        ]
      },
      {
        name: 'Cafe Coffee Corner',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Coffee', 'Sandwiches', 'Beverages'],
        rating: 4.5,
        deliveryTimeMins: 20,
        priceRange: '₹',
        isVeg: false,
        isPureVeg: false,
        address: { street: 'Church Street', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
        dishes: [
          { name: 'Classic Cappuccino', category: 'Beverages', price: 140, isVeg: true, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80', description: 'Double shot arabica espresso topped with thick micro-foam milk.' },
          { name: 'Cold Brew on the Rocks', category: 'Beverages', price: 170, isVeg: true, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80', description: '18-hour steeped single-origin coffee with smooth chocolate tasting notes.' },
          { name: 'Grilled Peri Peri Paneer Sandwich', category: 'Starters', price: 189, isVeg: true, rating: 4.6, isPopular: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80', description: 'Crusty sourdough toast packed with spicy cottage cheese and molten mozzarella.' },
          { name: 'Chicken Tikka Club Sandwich', category: 'Starters', price: 229, isVeg: false, rating: 4.7, isPopular: true, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80', description: 'Triple decker toast with roasted tandoori chicken, egg omelette, and crisp greens.' },
          { name: 'Butter Croissant', category: 'Starters', price: 110, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80', description: 'Flaky golden French pastry baked with 100% Normandy butter.' },
          { name: 'Blueberry Danish Pastry', category: 'Desserts', price: 145, isVeg: true, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80', description: 'Crisp puff ring with sweet custard and wild blueberry glaze.' },
          { name: 'Classic Green Tea Matcha Latte', category: 'Beverages', price: 185, isVeg: true, rating: 4.4, isPopular: false, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80', description: 'Japanese ceremonial grade matcha whisked with warm oat milk.' },
          { name: 'Avocado Toast with Seeds', category: 'Starters', price: 240, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&auto=format&fit=crop&q=80', description: 'Smashed ripe Hass avocado on multigrain loaf with chili flakes and flax seeds.' }
        ]
      },
      {
        name: 'Wok & Roll',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Chinese', 'Asian', 'Noodles'],
        rating: 4.6,
        deliveryTimeMins: 28,
        priceRange: '₹₹',
        isVeg: false,
        isPureVeg: false,
        address: { street: 'Koramangala 7th Block', city: 'Bangalore', state: 'Karnataka', pincode: '560095' },
        dishes: [
          { name: 'Chilli Chicken Dry', category: 'Starters', price: 279, isVeg: false, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&auto=format&fit=crop&q=80', description: 'Wok-tossed battered chicken cubes with dark soy, bell peppers, and fresh green chillies.' },
          { name: 'Veg Hakka Noodles', category: 'Main Course', price: 199, isVeg: true, rating: 4.6, isPopular: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80', description: 'Thin wheat noodles tossed with shredded cabbage, carrots, bell peppers and scallions.' },
          { name: 'Schezwan Chicken Fried Rice', category: 'Main Course', price: 249, isVeg: false, rating: 4.7, isPopular: true, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80', description: 'Fragrant wok-charred rice tossed with spicy homemade Sichuan pepper sauce.' },
          { name: 'Crispy Veg Spring Rolls (6 Pcs)', category: 'Starters', price: 179, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80', description: 'Golden pastry skins filled with seasoned glass noodles and stir-fried greens.' },
          { name: 'Steamed Chicken Momos (6 Pcs)', category: 'Starters', price: 189, isVeg: false, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=400&auto=format&fit=crop&q=80', description: 'Himalayan style steamed dumplings filled with juicy chicken and served with fiery red chutney.' },
          { name: 'Veg Manchurian Gravy', category: 'Main Course', price: 219, isVeg: true, rating: 4.4, isPopular: false, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80', description: 'Deep fried veggie balls simmered in garlicky ginger soy sauce.' },
          { name: 'Honey Darsaan with Vanilla Scoop', category: 'Desserts', price: 140, isVeg: true, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&auto=format&fit=crop&q=80', description: 'Crispy fried flat noodles tossed in warm honey and sesame seeds with ice cream.' },
          { name: 'Peach Iced Tea', category: 'Beverages', price: 95, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80', description: 'Chilled refreshing tea infused with sweet wild peach syrup.' }
        ]
      },
      {
        name: 'Green Bowl',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=700&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=80',
        cuisines: ['Healthy', 'Salads', 'Vegan'],
        rating: 4.7,
        deliveryTimeMins: 25,
        priceRange: '₹₹',
        isVeg: true,
        isPureVeg: true,
        address: { street: 'Koramangala 3rd Block', city: 'Bangalore', state: 'Karnataka', pincode: '560034' },
        dishes: [
          { name: 'Mediterranean Quinoa Salad Bowl', category: 'Main Course', price: 289, isVeg: true, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80', description: 'Protein-packed cooked quinoa, Kalamata olives, cherry tomatoes, cucumbers and lemon vinaigrette.' },
          { name: 'Avocado Caesar Crunch Salad', category: 'Main Course', price: 319, isVeg: true, rating: 4.7, isPopular: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80', description: 'Crisp romaine lettuce, Hass avocado slices, sourdough croutons and vegan Caesar dressing.' },
          { name: 'Grilled Tofu Teriyaki Bowl', category: 'Main Course', price: 279, isVeg: true, rating: 4.6, isPopular: false, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80', description: 'Organic tofu cubes seared in sweet sesame teriyaki over brown rice and steamed broccoli.' },
          { name: 'Classic Hummus with Warm Pita', category: 'Starters', price: 199, isVeg: true, rating: 4.8, isPopular: true, image: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=400&auto=format&fit=crop&q=80', description: 'Velvety chickpea tahini dip topped with extra virgin olive oil, paprika and two pita breads.' },
          { name: 'Roasted Pumpkin & Ginger Soup', category: 'Starters', price: 169, isVeg: true, rating: 4.5, isPopular: false, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&auto=format&fit=crop&q=80', description: 'Comforting creamy winter squash soup with hints of warming ginger and toasted pumpkin seeds.' },
          { name: 'Chia Berry Pudding Jar', category: 'Desserts', price: 159, isVeg: true, rating: 4.9, isPopular: true, image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=400&auto=format&fit=crop&q=80', description: 'Superfood chia seeds soaked in almond milk with raspberry puree and toasted granola.' },
          { name: 'Green Detox Cold Pressed Juice', category: 'Beverages', price: 149, isVeg: true, rating: 4.7, isPopular: false, image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&auto=format&fit=crop&q=80', description: 'Pure extract of green apple, cucumber, celery, spinach, ginger and lemon.' },
          { name: 'Berry Antioxidant Smoothie', category: 'Beverages', price: 179, isVeg: true, rating: 4.8, isPopular: false, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80', description: 'Blended blueberries, strawberries, and Greek yogurt sweetened with wild honey.' }
        ]
      }
    ];

    const allDishesCreated = [];
    const createdRestaurants = [];

    for (const rData of restaurantsData) {
      const { dishes, ...restDetails } = rData;
      const restaurant = await Restaurant.create(restDetails);
      createdRestaurants.push(restaurant);

      for (const dish of dishes) {
        const createdFood = await Food.create({
          ...dish,
          restaurant: restaurant._id,
        });
        allDishesCreated.push(createdFood);
      }
    }

    console.log(`✓ Created ${createdRestaurants.length} restaurants and ${allDishesCreated.length} food items.`);

    // 5. Create Sample Orders
    console.log('\n--- 📦 Seeding Orders with Different Statuses ---');

    const biryaniHouse = createdRestaurants.find((r) => r.name === 'Biryani House');
    const biryaniFood1 = allDishesCreated.find((f) => f.name === 'Special Chicken Dum Biryani');
    const biryaniFood2 = allDishesCreated.find((f) => f.name === 'Chicken 65 Hyderabadi Style');

    await Order.create({
      user: rahul._id,
      restaurant: biryaniHouse._id,
      items: [
        { foodId: biryaniFood1._id, name: biryaniFood1.name, price: biryaniFood1.price, quantity: 2, image: biryaniFood1.image, isVeg: biryaniFood1.isVeg },
        { foodId: biryaniFood2._id, name: biryaniFood2.name, price: biryaniFood2.price, quantity: 1, image: biryaniFood2.image, isVeg: biryaniFood2.isVeg }
      ],
      address: {
        fullName: rahulAddress1.fullName,
        mobile: rahulAddress1.mobile,
        houseNo: rahulAddress1.houseNo,
        street: rahulAddress1.street,
        city: rahulAddress1.city,
        state: rahulAddress1.state,
        pincode: rahulAddress1.pincode
      },
      subtotal: 900,
      deliveryFee: 0,
      platformFee: 5,
      discount: 100,
      tax: 45,
      total: 850,
      couponCode: 'CRAVE10',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      status: 'Delivered',
      statusHistory: [
        { status: 'Placed', at: new Date(Date.now() - 45 * 60 * 1000), note: 'Order placed' },
        { status: 'Accepted', at: new Date(Date.now() - 40 * 60 * 1000), note: 'Accepted by kitchen' },
        { status: 'Preparing', at: new Date(Date.now() - 35 * 60 * 1000), note: 'Chef is cooking' },
        { status: 'Out for Delivery', at: new Date(Date.now() - 15 * 60 * 1000), note: 'Rider is on the way' },
        { status: 'Delivered', at: new Date(Date.now() - 2 * 60 * 1000), note: 'Delivered safely' }
      ]
    });

    const spiceVilla = createdRestaurants.find((r) => r.name === 'Spice Villa');
    const paneerFood = allDishesCreated.find((f) => f.name === 'Paneer Butter Masala');
    const naanFood = allDishesCreated.find((f) => f.name === 'Garlic Butter Naan');

    await Order.create({
      user: rahul._id,
      restaurant: spiceVilla._id,
      items: [
        { foodId: paneerFood._id, name: paneerFood.name, price: paneerFood.price, quantity: 1, image: paneerFood.image, isVeg: paneerFood.isVeg },
        { foodId: naanFood._id, name: naanFood.name, price: naanFood.price, quantity: 2, image: naanFood.image, isVeg: naanFood.isVeg }
      ],
      address: {
        fullName: rahulAddress1.fullName,
        mobile: rahulAddress1.mobile,
        houseNo: rahulAddress1.houseNo,
        street: rahulAddress1.street,
        city: rahulAddress1.city,
        state: rahulAddress1.state,
        pincode: rahulAddress1.pincode
      },
      subtotal: 410,
      deliveryFee: 40,
      platformFee: 5,
      discount: 0,
      tax: 21,
      total: 476,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      status: 'Preparing',
      statusHistory: [
        { status: 'Placed', at: new Date(Date.now() - 10 * 60 * 1000), note: 'Order received' },
        { status: 'Accepted', at: new Date(Date.now() - 8 * 60 * 1000), note: 'Restaurant accepted' },
        { status: 'Preparing', at: new Date(Date.now() - 2 * 60 * 1000), note: 'Meal being prepared' }
      ]
    });

    const burgerHub = createdRestaurants.find((r) => r.name === 'The Burger Hub');
    const burgerFood = allDishesCreated.find((f) => f.name === 'Smoky BBQ Cheese Burger');
    const friesFood = allDishesCreated.find((f) => f.name === 'Peri Peri Crinkle Fries');

    await Order.create({
      user: priya._id,
      restaurant: burgerHub._id,
      items: [
        { foodId: burgerFood._id, name: burgerFood.name, price: burgerFood.price, quantity: 1, image: burgerFood.image, isVeg: burgerFood.isVeg },
        { foodId: friesFood._id, name: friesFood.name, price: friesFood.price, quantity: 1, image: friesFood.image, isVeg: friesFood.isVeg }
      ],
      address: {
        fullName: priyaAddress.fullName,
        mobile: priyaAddress.mobile,
        houseNo: priyaAddress.houseNo,
        street: priyaAddress.street,
        city: priyaAddress.city,
        state: priyaAddress.state,
        pincode: priyaAddress.pincode
      },
      subtotal: 378,
      deliveryFee: 40,
      platformFee: 5,
      discount: 0,
      tax: 19,
      total: 442,
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      status: 'Placed',
      statusHistory: [
        { status: 'Placed', at: new Date(Date.now() - 2 * 60 * 1000), note: 'Order placed' }
      ]
    });

    console.log('✓ Seeded orders across Delivered, Preparing, and Placed statuses.');

    // 6. Create Favorites
    console.log('\n--- ❤️ Seeding User Favorites ---');
    await Favorite.create([
      { user: rahul._id, type: 'restaurant', refId: biryaniHouse._id },
      { user: rahul._id, type: 'food', refId: paneerFood._id },
      { user: priya._id, type: 'restaurant', refId: burgerHub._id },
      { user: arjun._id, type: 'restaurant', refId: createdRestaurants[4]._id },
    ]);
    console.log('✓ Seeded user favorites.');

    // Terminal Summary Output
    console.log('\n========================================================');
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('========================================================');
    console.log('Brand: food spot ("Your cravings. Our mission.")');
    console.log('--------------------------------------------------------');
    console.log('🔑 PRE-SEEDED CREDENTIALS FOR TESTING & VIVA:');
    console.log('--------------------------------------------------------');
    console.log('1. Super Admin:');
    console.log('   Email:    admin@gmail.com');
    console.log('   Password: Admin@123');
    console.log('   Role:     admin');
    console.log('');
    console.log('2. Customer 1 (Rahul):');
    console.log('   Email:    rahul@foodspot.com');
    console.log('   Password: User@123');
    console.log('   Role:     user');
    console.log('');
    console.log('3. Customer 2 (Priya):');
    console.log('   Email:    priya@foodspot.com');
    console.log('   Password: User@123');
    console.log('');
    console.log('4. Customer 3 (Arjun):');
    console.log('   Email:    arjun@foodspot.com');
    console.log('   Password: User@123');
    console.log('--------------------------------------------------------');
    console.log('🏷️ AVAILABLE COUPONS:');
    console.log('   - CRAVE10 : 10% OFF (Min ₹199, Max ₹100)');
    console.log('   - FIRST50 : 50% OFF (Min ₹299, Max ₹120, 1st order)');
    console.log('   - FOOD20  : 20% OFF (Min ₹399, Max ₹150)');
    console.log('   - FREEDEL : Free Delivery (Min ₹249)');
    console.log('========================================================\n');

    if (exitOnComplete) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('✕ Seeding Error:', error);
    if (exitOnComplete) {
      process.exit(1);
    }
    throw error;
  }
};

// If run directly from command line
if (require.main === module) {
  seedDatabase(true);
}

module.exports = seedDatabase;
