import admin from 'firebase-admin';
import {readFileSync} from 'fs';
const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT
);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "sendora-download.firebasestorage.app"
})
const bucket = admin.storage().bucket();
export default bucket;