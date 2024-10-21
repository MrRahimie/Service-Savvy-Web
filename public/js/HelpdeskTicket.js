const mongoose = require("mongoose");

const helpdeskTicketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    priority: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { collection: 'Ticket' });  // Specify the collection name here

const HelpdeskTicket = mongoose.model("HelpdeskTicket", helpdeskTicketSchema);

module.exports = HelpdeskTicket;