const express = require('express');
const router = express.Router();

const AuctionTeam = require('../models/AuctionTeam');
const AuctionSetting = require('../models/AuctionSetting');
const AuctionPlayer = require('../models/AuctionPlayer');
const Category = require('../models/Category');

router.post('/teams', async (req, res) => {
  try {

    const {
      teamName,
      owner1,
      owner2
    } = req.body;

    if (!teamName || !owner1 || !owner2) {
      return res.status(400).json({
        success: false,
        message: 'Team name and both owner names are required.'
      });
    }

    const existingTeam = await AuctionTeam.findOne({
      teamName: teamName.trim()
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: 'This team already exists.'
      });
    }

    const team = await AuctionTeam.create({
      teamName: teamName.trim(),
      owner1: owner1.trim(),
      owner2: owner2.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Team created successfully.',
      data: team
    });

  } catch (error) {

    console.error('ADD TEAM ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create team.'
    });
  }
});

router.get('/teams', async (req, res) => {

  try {

    const teams = await AuctionTeam.find({})
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: teams
    });

  } catch (error) {

    console.error('GET TEAMS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to load teams.'
    });
  }

});

router.post('/settings', async (req, res) => {

  try {

    const {
      maximumPoints,
      minimumPlayerPoints,
      playersPerTeam
    } = req.body;

    if (
      !maximumPoints ||
      !minimumPlayerPoints ||
      !playersPerTeam
    ) {
      return res.status(400).json({
        success: false,
        message: 'All auction settings are required.'
      });
    }

    const teamsCount = await AuctionTeam.countDocuments();

    if (teamsCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Create at least one team first.'
      });
    }

    const minimumRequiredPoints =
      Number(minimumPlayerPoints) *
      Number(playersPerTeam);

    if (minimumRequiredPoints > Number(maximumPoints)) {

      return res.status(400).json({
        success: false,
        message:
          `Maximum points must be at least ${minimumRequiredPoints} because every team must reserve minimum points for all players.`
      });
    }

    const settings = await AuctionSetting.create({
      maximumPoints,
      minimumPlayerPoints,
      playersPerTeam,
      totalTeams: teamsCount,
      status: 'DRAFT'
    });

    return res.status(201).json({
      success: true,
      message: 'Auction settings saved.',
      data: settings
    });

  } catch (error) {

    console.error('SAVE AUCTION SETTINGS ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to save auction settings.'
    });
  }

});

router.post('/initialize-players', async (req, res) => {

  try {

    const categories = await Category.find({}).lean();

    if (!categories.length) {
      return res.status(400).json({
        success: false,
        message: 'No categories found.'
      });
    }

    let createdCount = 0;

    for (const category of categories) {

      for (const player of category.players || []) {

        const existing =
          await AuctionPlayer.findOne({
            registrationId: player.registrationId
          });

        if (existing) {
          continue;
        }

        await AuctionPlayer.create({

          registrationId: player.registrationId,

          categoryId: category._id,

          categoryName: category.categoryName,

          playerName: player.playerName,

          phoneNumber: player.phoneNumber || '',

          playerPhoto: player.playerPhoto || '',

          tshirtSize: player.tshirtSize || '',

          tshirtName: player.tshirtName || '',

          status: 'AVAILABLE',

          soldToTeam: null,

          soldPoints: 0
        });

        createdCount++;
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Auction players initialized.',
      createdCount
    });

  } catch (error) {

    console.error(
      'INITIALIZE AUCTION PLAYERS ERROR:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to initialize auction players.'
    });
  }

});

router.get('/categories', async (req, res) => {

  try {

    const categories = await Category.find({})
      .select('_id categoryName players')
      .lean();

    const result = categories.map(category => ({
      _id: category._id,
      categoryName: category.categoryName,
      playerCount: category.players?.length || 0
    }));

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {

    console.error('GET AUCTION CATEGORIES ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to load categories.'
    });
  }

});

router.get(
  '/categories/:categoryId/players',
  async (req, res) => {

    try {

      const players = await AuctionPlayer.find({
        categoryId: req.params.categoryId
      })
      .populate(
        'soldToTeam',
        'teamName owner1 owner2'
      )
      .sort({ createdAt: 1 })
      .lean();

      return res.status(200).json({
        success: true,
        data: players
      });

    } catch (error) {

      console.error(
        'GET CATEGORY AUCTION PLAYERS ERROR:',
        error
      );

      return res.status(500).json({
        success: false,
        message: 'Failed to load category players.'
      });
    }

  }
);

router.post('/sell-player', async (req, res) => {

  try {

    const {
      playerId,
      teamId,
      soldPoints
    } = req.body;

    if (!playerId || !teamId || !soldPoints) {

      return res.status(400).json({
        success: false,
        message:
          'Player, team and sold points are required.'
      });

    }

    const points = Number(soldPoints);

    if (!Number.isFinite(points)) {

      return res.status(400).json({
        success: false,
        message: 'Invalid points.'
      });

    }

    const settings =
      await AuctionSetting.findOne({
        status: {
          $in: ['DRAFT', 'ACTIVE']
        }
      }).sort({
        createdAt: -1
      });

    if (!settings) {

      return res.status(400).json({
        success: false,
        message: 'Auction settings not found.'
      });

    }

    const player =
      await AuctionPlayer.findById(playerId);

    if (!player) {

      return res.status(404).json({
        success: false,
        message: 'Player not found.'
      });

    }

    if (player.status === 'SOLD') {

      return res.status(409).json({
        success: false,
        message: 'This player is already sold.'
      });

    }

    const team =
      await AuctionTeam.findById(teamId);

    if (!team) {

      return res.status(404).json({
        success: false,
        message: 'Team not found.'
      });

    }

    /*
     * Find how many players this team
     * has already purchased.
     */

    const boughtPlayers =
      await AuctionPlayer.countDocuments({
        soldToTeam: teamId,
        status: 'SOLD'
      });

    /*
     * How many players still need to be purchased
     * AFTER buying this player?
     */

    const playersAfterPurchase =
      settings.playersPerTeam -
      (boughtPlayers + 1);

    if (playersAfterPurchase < 0) {

      return res.status(400).json({
        success: false,
        message:
          'This team has already completed its maximum number of players.'
      });

    }

    /*
     * Total points already spent
     */

    const spentResult =
      await AuctionPlayer.aggregate([
        {
          $match: {
            soldToTeam: team._id,
            status: 'SOLD'
          }
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$soldPoints'
            }
          }
        }
      ]);

    const spentPoints =
      spentResult.length
        ? spentResult[0].total
        : 0;

    /*
     * Remaining points before buying
     */

    const remainingPoints =
      settings.maximumPoints -
      spentPoints;

    /*
     * Reserve minimum amount for
     * every remaining player.
     */

    const reservedPoints =
      playersAfterPurchase *
      settings.minimumPlayerPoints;

    /*
     * Maximum possible price for this player.
     */

    const maximumAllowedBid =
      remainingPoints -
      reservedPoints;

    /*
     * Minimum player amount
     */

    if (
      points <
      settings.minimumPlayerPoints
    ) {

      return res.status(400).json({
        success: false,
        message:
          `Minimum player price is ${settings.minimumPlayerPoints} points.`,
        maximumAllowedBid
      });

    }

    /*
     * Main auction rule
     */

    if (points > maximumAllowedBid) {

      return res.status(400).json({

        success: false,

        message:
          `Maximum allowed bid for this player is ${maximumAllowedBid} points. You must reserve ${reservedPoints} points for your remaining ${playersAfterPurchase} players.`,

        maximumAllowedBid,

        remainingPoints,

        reservedPoints,

        playersRemaining: playersAfterPurchase
      });

    }

    /*
     * Save SOLD
     */

    player.status = 'SOLD';

    player.soldToTeam = teamId;

    player.soldPoints = points;

    player.soldAt = new Date();

    await player.save();

    const newSpentPoints =
      spentPoints + points;

    const newRemainingPoints =
      settings.maximumPoints -
      newSpentPoints;

    const nextPlayersRemaining =
      settings.playersPerTeam -
      (boughtPlayers + 1);

    const nextReservedPoints =
      nextPlayersRemaining *
      settings.minimumPlayerPoints;

    const nextMaximumBid =
      newRemainingPoints -
      nextReservedPoints;

    return res.status(200).json({

      success: true,

      message:
        `${player.playerName} sold to ${team.teamName} for ${points} points.`,

      data: {

        player,

        team: {
          _id: team._id,
          teamName: team.teamName
        },

        spentPoints: newSpentPoints,

        remainingPoints:
          newRemainingPoints,

        playersBought:
          boughtPlayers + 1,

        playersRemaining:
          nextPlayersRemaining,

        maximumNextBid:
          nextMaximumBid
      }

    });

  } catch (error) {

    console.error(
      'SELL PLAYER ERROR:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to sell player.'
    });

  }

});

router.get('/team-review', async (req, res) => {

  try {

    const settings =
      await AuctionSetting.findOne({})
        .sort({ createdAt: -1 })
        .lean();

    if (!settings) {

      return res.status(404).json({
        success: false,
        message: 'Auction settings not found.'
      });

    }

    const teams =
      await AuctionTeam.find({})
        .lean();

    const result = [];

    for (const team of teams) {

      const players =
        await AuctionPlayer.find({
          soldToTeam: team._id,
          status: 'SOLD'
        }).lean();

      const spentPoints =
        players.reduce(
          (sum, player) =>
            sum + Number(player.soldPoints || 0),
          0
        );

      const remainingPoints =
        settings.maximumPoints -
        spentPoints;

      const playersRemaining =
        settings.playersPerTeam -
        players.length;

      const reservedPoints =
        playersRemaining *
        settings.minimumPlayerPoints;

      const maximumNextBid =
        remainingPoints -
        reservedPoints;

      result.push({

        teamId: team._id,

        teamName: team.teamName,

        owner1: team.owner1,

        owner2: team.owner2,

        playersBought: players.length,

        playersRemaining,

        maximumPoints:
          settings.maximumPoints,

        spentPoints,

        remainingPoints,

        reservedPoints,

        maximumNextBid,

        players

      });

    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {

    console.error(
      'TEAM REVIEW ERROR:',
      error
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to load team review.'
    });

  }

});
  module.exports = router;
