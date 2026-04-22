const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow';
    
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`[db] MongoDB connected natively: ${conn.connection.host}/${conn.connection.name}`);
    } catch (err) {
      console.warn(`[db] Native MongoDB connection failed, falling back to In-Memory DB: ${err.message}`);
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`[db] In-Memory MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    }
  } catch (err) {
    console.error(`[db] Critical MongoDB error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
