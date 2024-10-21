const mongoose = require('mongoose');

// Define the schema for the Service collection
const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  imageUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assuming you have a User model
  rating: { type: Number, default: 0 }, // Add the rating field with default value 0
  freelancerName: { type: String }, // Add freelancerName field
  freelancerEmail: { type: String }, // Add freelancerEmail field
  freelancerPhone: { type: String }, // Add freelancerPhone field
  freelancerLocation: { type: String }, // Add freelancerLocation field
  ordercompleted: { type: Number, default: 0 }, // Add orderCompleted field with default value 0
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'reviews' }]
});

// Create the Service model based on the schema
const Service = mongoose.model('Service', serviceSchema);

// Export the Service model
module.exports = Service;
