const mongoose = require("mongoose");
const moment = require("moment");

const contactSchema = new mongoose.Schema({
    company: { type: String },
    call: { type: String },
    email: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    desc: { type: String },
    createdAt: { type: String, default: moment().format("YYYY-MM-DD hh:mm:ss") },
})

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;