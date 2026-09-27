const mongoose = require('mongoose');

const auctionSettingSchema = new mongoose.Schema(
  {
    maximumPoints: {
      type: Number,
      required: true,
      min: 1
    },

    minimumPlayerPoints: {
      type: Number,
      required: true,
      min: 1
    },

    playersPerTeam: {
      type: Number,
      required: true,
      min: 1
    },

    totalTeams: {
      type: Number,
      required: true,
      min: 1
    },

    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'COMPLETED'],
      default: 'DRAFT'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'AuctionSetting',
  auctionSettingSchema
);