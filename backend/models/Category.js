const mongoose = require('mongoose');


// ============================================
// CATEGORY PLAYER SCHEMA
// ============================================

const categoryPlayerSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true
    },

    playerName: {
      type: String,
      required: true,
      trim: true
    },

    phoneNumber: {
      type: String,
      default: ''
    },

    category: {
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

    otherSize: {
      type: String,
      default: ''
    },

    tshirtName: {
      type: String,
      default: ''
    }
  },
  {
    _id: false
  }
);


// ============================================
// CATEGORY SCHEMA
// ============================================

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      trim: true
    },

    players: {
      type: [categoryPlayerSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);


// ============================================
// PREVENT DUPLICATE CATEGORY NAMES
// ============================================

categorySchema.index(
  { categoryName: 1 },
  { unique: true }
);


module.exports = mongoose.model(
  'Category',
  categorySchema
);