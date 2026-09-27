const mongoose = require('mongoose');

const auctionTeamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    owner1: {
      type: String,
      required: true,
      trim: true
    },

    owner2: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuctionTeam', auctionTeamSchema);