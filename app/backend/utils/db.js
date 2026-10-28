// app/backend/utils/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI not set in .env (running in memory-only mode)');
    return;
  }

  try {
    await mongoose.connect(uri, {
      dbName: 'civicconnect',
      serverSelectionTimeoutMS: 3000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.warn('⚠️ MongoDB connection could not be established:', err.message);
    console.warn('ℹ️ Running backend with in-memory service catalog and stateless auth.');
  }
};

module.exports = connectDB;
