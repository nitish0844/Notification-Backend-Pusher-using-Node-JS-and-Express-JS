/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const express = require("express");
const axios = require("axios");
const admin = require("firebase-admin");
const functions = require("firebase-functions"); // Add this line
const cors = require("cors");
const helmet = require("helmet");

// Initialize Firebase Admin SDK
const serviceAccount = require("./platform2learn-54f87-firebase-adminsdk-epft1-2b8186ed54.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const corsOptions = {
  origin: "https://us-central1-platform2learn-54f87.cloudfunctions.net", // Replace this with the correct origin for your client application
  methods: ["POST"], // Add other HTTP methods if needed
};

const app = express();

// Middleware to enable CORS
// app.use(cors(corsOptions));
app.use(
  cors({
    origin: true, // Allow requests from any origin
  })
);

// Middleware to set security headers
app.use(helmet());

// Middleware to parse JSON data
app.use(express.json());

app.post("/send-notification", (req, res) => {
  // Get registration tokens and notification payload from the request body
  const { registrationTokens, notificationPayload } = req.body;
  console.log("Received registrationTokens:", registrationTokens);
  console.log("Received notificationPayload:", notificationPayload);
  // Send notification using Firebase Cloud Messaging (FCM)
  const message = {
    tokens: registrationTokens,
    notification: {
      title: notificationPayload.title,
      body: notificationPayload.body,
      imageUrl: notificationPayload.imageUrl,
    },
  };

  admin
    .messaging()
    .sendMulticast(message)
    .then((response) => {
      console.log("Successfully sent notification:", response);
      res.status(200).json({ message: "Notification sent successfully" });
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    });
});

// Export the app as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
