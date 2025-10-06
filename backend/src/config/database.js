const mongoose = require('mongoose');

let connectionPromise = null;

async function connectToDatabase() {
  if (connectionPromise) return connectionPromise;

  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  mongoose.set('strictQuery', false);

  connectionPromise = mongoose
    .connect(MONGODB_URI, {
      autoIndex: true,
    })
    .then((connection) => {
      const uriSafe = MONGODB_URI.replace(/:\w+@/, ':****@');
      console.log(`✅ Connected to MongoDB: ${uriSafe}`);
      return connection;
    })
    .catch((error) => {
      connectionPromise = null;
      console.error('❌ MongoDB connection error', error);
      throw error;
    });

  return connectionPromise;
}

module.exports = {
  connectToDatabase,
};
