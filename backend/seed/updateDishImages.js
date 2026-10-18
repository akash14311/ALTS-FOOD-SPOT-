require('dotenv').config();
const mongoose = require('mongoose');
const Food = require('../models/Food');
const Order = require('../models/Order');
const connectDB = require('../config/db');

// Map of dish name to corrected, high-accuracy image URL
const dishImageMap = {
  'Tandoori Chicken Platter': '/images/dishes/tandoori-chicken.jpg',
  'Gulab Jamun (2 Pcs)': 'https://images.unsplash.com/photo-1666190092159-3171cf0fbb12?w=600&auto=format&fit=crop&q=80',
  'Chicken Seekh Kebab (4 Pcs)': 'https://images.unsplash.com/photo-1628294895950-9805252327bc?w=600&auto=format&fit=crop&q=80',
  'Chicken 65 Hyderabadi Style': 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
  'Shahi Tukda': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
  'Medu Vada (2 Pcs)': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
  'Bisi Bele Bath': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
  'Kesari Bath (Pineapple)': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
  'Curd Rice with Pomegranate': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
  'Dal Makhani Bukhara': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
  'Tandoori Paneer Tikka (6 Pcs)': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
  'Afghani Malai Murgh Tikka': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
  'Rasmalai (2 Pcs)': 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80',
  'Alphonso Mango Pastry': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
  'Veg Manchurian Gravy': 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80',
  'Green Detox Cold Pressed Juice': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&auto=format&fit=crop&q=80',
  'Paneer Makhani Biryani': 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=400&auto=format&fit=crop&q=80',
  'Mirchi Ka Salan & Raita Combo': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
};

async function updateDbCollection(dbUri, label) {
  try {
    const conn = await mongoose.createConnection(dbUri).asPromise();
    const FoodModel = conn.model('Food', Food.schema);
    const OrderModel = conn.model('Order', Order.schema);

    console.log(`\n--- 🔄 Syncing Food Images for [${label}] ---`);
    let updatedCount = 0;

    for (const [dishName, newImageUrl] of Object.entries(dishImageMap)) {
      const res = await FoodModel.updateMany(
        { name: dishName },
        { $set: { image: newImageUrl } }
      );
      if (res.matchedCount > 0) {
        console.log(`✓ [${label}] Updated image for: "${dishName}" (${res.modifiedCount} updated)`);
        updatedCount += res.modifiedCount;
      }
    }

    // Also update order item snapshots
    const orders = await OrderModel.find();
    let updatedOrderItems = 0;
    for (const order of orders) {
      let modified = false;
      for (const item of order.items) {
        if (dishImageMap[item.name] && item.image !== dishImageMap[item.name]) {
          item.image = dishImageMap[item.name];
          modified = true;
          updatedOrderItems++;
        }
      }
      if (modified) {
        await order.save();
      }
    }
    if (updatedOrderItems > 0) {
      console.log(`✓ [${label}] Updated ${updatedOrderItems} items across orders.`);
    }

    console.log(`🎉 [${label}] Total dishes updated: ${updatedCount}`);
    await conn.close();
  } catch (err) {
    console.error(`✕ Error syncing [${label}]:`, err.message);
  }
}

async function updateImages() {
  try {
    const baseUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food_spot';
    const serverHost = baseUri.replace(/\/[^/]+$/, '');

    // Sync both 'test' (in-memory or active default) and 'food_spot' databases
    await updateDbCollection(`${serverHost}/test`, 'DB: test');
    await updateDbCollection(`${serverHost}/food_spot`, 'DB: food_spot');

    console.log('\n✅ Image sync completed successfully.\n');
    process.exit(0);
  } catch (err) {
    console.error('✕ Failed to update images:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  updateImages();
}

module.exports = { dishImageMap, updateImages };
