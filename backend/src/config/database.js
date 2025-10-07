const mongoose = require('mongoose');

let connectionPromise = null;

async function connectToDatabase() {
  if (connectionPromise) return connectionPromise;

  const { MONGODB_URI } = process.env;
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  mongoose.set('strictQuery', false);

  // MongoDB crée automatiquement la base de données si elle n'existe pas
  // lorsqu'on insère la première donnée
    connectionPromise = mongoose
    .connect(MONGODB_URI, {
      autoIndex: true,
      // Assure que la base de données sera créée automatiquement
      // lors de la première insertion de données
      autoCreate: true,
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
