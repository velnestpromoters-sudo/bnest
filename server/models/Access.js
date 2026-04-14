const mongoose = require('mongoose');

const accessSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "paid",
  },
  interactionStage: {
    type: String,
    enum: ['contact_unlocked', 'visited', 'negotiating', 'finalized'],
    default: 'contact_unlocked'
  }
}, { timestamps: true });

module.exports = mongoose.model('Access', accessSchema);
