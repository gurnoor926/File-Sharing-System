import admin from 'firebase-admin';
import {readFileSync} from 'fs';
const serviceAccount = JSON.parse(
    readFileSync(new URL('./sendoraDownload.json',import.meta.url))
);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "sendora-download.firebasestorage.app"
})
const bucket = admin.storage().bucket();
export default bucket;