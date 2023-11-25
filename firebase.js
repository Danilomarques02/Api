const admin = require("firebase-admin");
const serviceAccount = require("./conta-firestore.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.firestore = admin.firestore();
