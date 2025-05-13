const admin = require('firebase-admin');

// Ensure Firestore is initialized
const firestore = admin.firestore();

async function getAllCollectionCounts() {
  const collections = await firestore.listCollections();
  const result = {};

  for (const col of collections) {
    try {
      const snapshot = await col.get();
      result[col.id] = snapshot.size;
    } catch (err) {
      console.error(`Error counting ${col.id}:`, err);
      result[col.id] = 0;
    }
  }

  return result;
}

module.exports = {
  getAllCollectionCounts
};
