require('dotenv').config();

module.exports = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    profilesStorageBucket: process.env.PROFILES_STORAGE_BUCKET,
    objectsStorageBucket: process.env.OBJECTS_STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASURMENT_ID
  };