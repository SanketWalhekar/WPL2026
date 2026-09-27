const express = require('express');

const router = express.Router();

const Category = require('../models/Category');
const Registration = require('../models/Registration');


// ======================================================
// GET ALL REGISTERED PLAYERS
// ======================================================
//
// This endpoint is specifically used by the
// Category Selection page.
//
// Only registrationType = player will be returned.
//

// ======================================================
// GET ALL REGISTERED PLAYERS FOR CATEGORY SELECTION
// ======================================================

// ======================================================
// UPDATE CATEGORY
// ======================================================
//
// PUT /api/categories/:id
//
// Allows:
// - Add players
// - Remove players
// - Change category name
//
// A player cannot belong to another category.
// ======================================================

router.put('/:id', async (req, res) => {

  try {

    const categoryId =
      req.params.id;

    const {
      categoryName,
      players
    } = req.body;


    // ==============================================
    // VALIDATE CATEGORY NAME
    // ==============================================

    if (
      !categoryName ||
      !categoryName.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Category name is required.'

      });

    }


    // ==============================================
    // VALIDATE PLAYERS
    // ==============================================

    if (
      !Array.isArray(players) ||
      players.length === 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Please select at least one player.'

      });

    }


    // ==============================================
    // FIND CURRENT CATEGORY
    // ==============================================

    const category =
      await Category.findById(
        categoryId
      );


    if (!category) {

      return res.status(404).json({

        success: false,

        message:
          'Category not found.'

      });

    }


    // ==============================================
    // CHECK DUPLICATE CATEGORY NAME
    // ==============================================

    const duplicateCategory =
      await Category.findOne({

        categoryName:
          categoryName.trim(),

        _id: {
          $ne: categoryId
        }

      });


    if (duplicateCategory) {

      return res.status(409).json({

        success: false,

        message:
          'This category already exists.'

      });

    }


    // ==============================================
    // GET PLAYER IDS
    // ==============================================

    const registrationIds =
      players.map(
        player =>
          player.registrationId
      );


    // ==============================================
    // CHECK IF PLAYER IS IN ANOTHER CATEGORY
    // ==============================================

    const anotherCategory =
      await Category.findOne({

        _id: {
          $ne: categoryId
        },

        'players.registrationId': {
          $in: registrationIds
        }

      });


    if (anotherCategory) {

      const conflictingPlayers =
        anotherCategory.players.filter(
          player =>

            registrationIds.some(
              id =>

                id.toString() ===
                player.registrationId.toString()

            )
        );


      const playerNames =
        conflictingPlayers.map(
          player =>
            player.playerName
        );


      return res.status(409).json({

        success: false,

        message:

          `${playerNames.join(', ')} already belongs to category "${anotherCategory.categoryName}".`

      });

    }


    // ==============================================
    // PREPARE UPDATED PLAYERS
    // ==============================================

    const updatedPlayers =
      players.map(player => ({

        registrationId:
          player.registrationId,

        playerName:
          player.playerName || '',

        phoneNumber:
          player.phoneNumber || '',

        category:
          player.category || '',

        playerPhoto:
          player.playerPhoto || '',

        tshirtSize:
          player.tshirtSize || '',

        otherSize:
          player.otherSize || '',

        tshirtName:
          player.tshirtName || ''

      }));


    // ==============================================
    // UPDATE CATEGORY
    // ==============================================

    category.categoryName =
      categoryName.trim();

    category.players =
      updatedPlayers;


    // ==============================================
    // SAVE
    // ==============================================

    const updatedCategory =
      await category.save();


    // ==============================================
    // RESPONSE
    // ==============================================

    return res.status(200).json({

      success: true,

      message:
        'Category updated successfully.',

      data:
        updatedCategory

    });

  }

  catch (error) {

    console.error(
      'UPDATE CATEGORY ERROR:',
      error
    );


    // Duplicate category name

    if (error.code === 11000) {

      return res.status(409).json({

        success: false,

        message:
          'This category already exists.'

      });

    }


    return res.status(500).json({

      success: false,

      message:
        'Failed to update category.'

    });

  }

});

router.get('/players', async (req, res) => {

  try {

    // ==============================================
    // GET ALL REGISTERED PLAYERS
    // ==============================================

    const players = await Registration.find({
      registrationType: 'player'
    })
    .sort({
      createdAt: -1
    })
    .lean();


    // ==============================================
    // GET ALL CATEGORIES
    // ==============================================

    const categories = await Category.find({})
      .select('categoryName players')
      .lean();


    // ==============================================
    // CREATE MAP OF ASSIGNED PLAYERS
    // ==============================================

    const assignedPlayers = new Map();


    categories.forEach(category => {

      if (!category.players) {
        return;
      }

      category.players.forEach(player => {

        if (player.registrationId) {

          assignedPlayers.set(
            player.registrationId.toString(),
            {
              categoryId: category._id,
              categoryName: category.categoryName
            }
          );

        }

      });

    });


    // ==============================================
    // ADD ASSIGNMENT INFORMATION TO PLAYERS
    // ==============================================

    const playersWithCategory = players.map(player => {

      const assignment =
        assignedPlayers.get(
          player._id.toString()
        );


      if (assignment) {

        return {

          ...player,

          isAssigned: true,

          assignedCategoryId:
            assignment.categoryId,

          assignedCategory:
            assignment.categoryName

        };

      }


      return {

        ...player,

        isAssigned: false,

        assignedCategoryId: null,

        assignedCategory: null

      };

    });


    // ==============================================
    // RESPONSE
    // ==============================================

    return res.status(200).json({

      success: true,

      data: playersWithCategory

    });

  }

  catch (error) {

    console.error(
      'GET CATEGORY PLAYERS ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to load registered players.'

    });

  }

});


// ======================================================
// CREATE CATEGORY
// ======================================================
//
// POST /api/categories
//

router.post('/', async (req, res) => {

  try {

    const {
      categoryName,
      players
    } = req.body;


    // ==============================================
    // VALIDATE CATEGORY NAME
    // ==============================================

    if (
      !categoryName ||
      !categoryName.trim()
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Category name is required.'

      });

    }


    // ==============================================
    // VALIDATE PLAYERS
    // ==============================================

    if (
      !Array.isArray(players) ||
      players.length === 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Please select at least one player.'

      });

    }


    // ==============================================
    // CHECK DUPLICATE CATEGORY
    // ==============================================

    const existingCategory =
      await Category.findOne({

        categoryName:
          categoryName.trim()

      });


    if (existingCategory) {

      return res.status(409).json({

        success: false,

        message:
          'This category already exists.'

      });

    }


    // ==============================================
    // PREPARE PLAYERS
    // ==============================================

    const categoryPlayers =
      players.map(player => ({

        registrationId:
          player.registrationId,

        playerName:
          player.playerName || '',

        phoneNumber:
          player.phoneNumber || '',

        category:
          player.category || '',

        playerPhoto:
          player.playerPhoto || '',

        tshirtSize:
          player.tshirtSize || '',

        otherSize:
          player.otherSize || '',

        tshirtName:
          player.tshirtName || ''

      }));


    // ==============================================
    // CREATE CATEGORY
    // ==============================================

    const category =
      new Category({

        categoryName:
          categoryName.trim(),

        players:
          categoryPlayers

      });


    // ==============================================
    // SAVE
    // ==============================================

    const savedCategory =
      await category.save();


    // ==============================================
    // RESPONSE
    // ==============================================

    return res.status(201).json({

      success: true,

      message:
        'Category saved successfully.',

      data:
        savedCategory

    });

  }

  catch (error) {

    console.error(
      'CREATE CATEGORY ERROR:',
      error
    );


    // Duplicate MongoDB index

    if (error.code === 11000) {

      return res.status(409).json({

        success: false,

        message:
          'This category already exists.'

      });

    }


    return res.status(500).json({

      success: false,

      message:
        'Failed to save category.'

    });

  }

});


// ======================================================
// GET ALL CATEGORIES
// ======================================================
//
// GET /api/categories
//

router.get('/', async (req, res) => {

  try {

    const categories =
      await Category.find()
        .sort({
          createdAt: -1
        });


    return res.status(200).json({

      success: true,

      data: categories

    });

  }

  catch (error) {

    console.error(
      'GET CATEGORIES ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to load categories.'

    });

  }

});


// ======================================================
// GET CATEGORY BY ID
// ======================================================
//
// GET /api/categories/:id
//

router.get('/:id', async (req, res) => {

  try {

    const category =
      await Category.findById(
        req.params.id
      );


    if (!category) {

      return res.status(404).json({

        success: false,

        message:
          'Category not found.'

      });

    }


    return res.status(200).json({

      success: true,

      data: category

    });

  }

  catch (error) {

    console.error(
      'GET CATEGORY ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to load category.'

    });

  }

});


// ======================================================
// DELETE CATEGORY
// ======================================================
//
// DELETE /api/categories/:id
//

router.delete('/:id', async (req, res) => {

  try {

    const category =
      await Category.findByIdAndDelete(
        req.params.id
      );


    if (!category) {

      return res.status(404).json({

        success: false,

        message:
          'Category not found.'

      });

    }


    return res.status(200).json({

      success: true,

      message:
        'Category deleted successfully.'

    });

  }

  catch (error) {

    console.error(
      'DELETE CATEGORY ERROR:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Failed to delete category.'

    });

  }

});


module.exports = router;