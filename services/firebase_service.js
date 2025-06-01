const admin = require('firebase-admin');
require('dotenv').config();


const base64 = process.env.FIREBASE_CREDENTIALS_BASE64;
const serviceAccount = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://shoes-701d0.appspot.com',
    projectId: serviceAccount.project_id,
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});

const bucket = admin.storage().bucket();

module.exports = { bucket, messaging: admin.messaging() };