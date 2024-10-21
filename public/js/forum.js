const mongoose = require('mongoose');

// Define the schema for the forum collection
const forumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }
});

// Create the forum model based on the schema
const Forum = mongoose.model('Forum', forumSchema);

// Export the forum model
module.exports = Forum;
