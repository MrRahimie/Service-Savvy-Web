const mongoose = require('mongoose');

// Define the schema for the Review collection
const reviewSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  comment: { type: String, required: true }
});

// Create the Review model based on the schema
const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;
