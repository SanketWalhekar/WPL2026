const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    registrationType: {
      type: String,
      enum: ['player', 'tshirt'],
      required: true
    },

    playerName: {
      type: String,
      trim: true,
      maxlength: 100
    },

    phoneNumber: {
      type: String,
      trim: true,
      maxlength: 15
    },

    category: {
      type: String,
      enum: [
        'Batsman',
        'Bowler',
        'All-Rounder',
        'Wicket Keeper'
      ],
      default: null
    },

    tshirtName: {
      type: String,
      trim: true,
      maxlength: 50
    },

    tshirtSize: {
      type: String,
      trim: true,
      maxlength: 20
    },

    otherSize: {
      type: String,
      trim: true,
      maxlength: 20
    },

    paymentType: {
  type: String,
  enum: ['online', 'cash'],
  default: 'online',
  required: true
},

    // Relative path of player photo
    playerPhoto: {
      type: String,
      default: null
    },

    // Relative path of payment screenshot
    paymentScreenshot: {
      type: String,
      default: null
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'Registration',
  registrationSchema
);