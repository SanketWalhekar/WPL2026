const mongoose = require('mongoose');

const auctionPlayerSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },

    categoryName: {
      type: String,
      required: true
    },

    playerName: {
      type: String,
      required: true
    },

    phoneNumber: {
      type: String,
      default: ''
    },

    playerPhoto: {
      type: String,
      default: ''
    },

    tshirtSize: {
      type: String,
      default: ''
    },

    tshirtName: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: ['AVAILABLE', 'SOLD', 'UNSOLD'],
      default: 'AVAILABLE'
    },

    soldToTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuctionTeam',
      default: null
    },

    soldPoints: {
      type: Number,
      default: 0
    },

    soldAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

auctionPlayerSchema.index(
  { registrationId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'AuctionPlayer',
  auctionPlayerSchema
);