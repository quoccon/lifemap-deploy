const admin = require('firebase-admin');

const serviceAccount = require('../services/shoes-701d0-firebase-adminsdk-0bsy8-2267792de4.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://shoes-701d0.appspot.com',
});

const bucket = admin.storage().bucket();

module.exports = { bucket };