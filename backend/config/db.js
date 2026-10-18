const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

let memoryServer = null;

// Connect to MongoDB database
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food_spot';
  
  // 1. Try connecting to specified URI (local or Atlas)
  try {
    const maskedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`Connecting to MongoDB at: ${maskedURI}`);
    
    const conn = await mongoose.connect(mongoURI, {
      dbName: 'food_spot',
      serverSelectionTimeoutMS: 3000 // 3 second timeout for quick fallback
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (initialError) {
    console.warn(`! Standard MongoDB connect failed: ${initialError.message}`);
    
    // 2. If standard connect failed and MONGODB_URI is default local, try starting MongoMemoryServer
    if (mongoURI.includes('127.0.0.1') || mongoURI.includes('localhost')) {
      try {
        console.log('🔄 Initializing in-memory MongoDB fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'food_spot',
            port: 27017 // Try standard port
          }
        });
        const memoryUri = memoryServer.getUri();
        console.log(`✓ In-Memory MongoDB started at: ${memoryUri}`);

        const conn = await mongoose.connect(memoryUri);
        console.log(`✓ MongoDB Connected via In-Memory Server: ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      } catch (memError) {
        // In-memory server could fail if binary download fails; try dynamic port
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          memoryServer = await MongoMemoryServer.create();
          const memoryUri = memoryServer.getUri();
          const conn = await mongoose.connect(memoryUri);
          console.log(`✓ MongoDB Connected via In-Memory Server (Dynamic Port): ${conn.connection.host}`);
          return conn;
        } catch (innerMemErr) {
          console.error(`✕ In-Memory MongoDB fallback failed: ${innerMemErr.message}`);
        }
      }
    }

    console.error('✕ Could not establish MongoDB connection.');
    console.error('💡 Tip: Please check that MongoDB is running locally, or configure a free MongoDB Atlas cloud URI in backend/.env');
    return null;
  }
};

module.exports = connectDB;
