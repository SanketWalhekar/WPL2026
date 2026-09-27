const express = require('express');
const bcrypt = require('bcryptjs');

const Admin = require('../models/Admin');

const router = express.Router();


// =====================================================
// ADMIN LOGIN
// POST /api/auth/login
// =====================================================

router.post('/login', async (req, res) => {

  try {

    const {
      username,
      password
    } = req.body;


    // =================================================
    // VALIDATION
    // =================================================

    if (
      !username ||
      !password
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Username and password are required.'

      });

    }


    // =================================================
    // FIND ADMIN
    // =================================================

    const admin = await Admin.findOne({
      username: username.trim()
    });


    // =================================================
    // ADMIN NOT FOUND
    // =================================================

    if (!admin) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid username or password.'

      });

    }


    // =================================================
    // CHECK PASSWORD
    // =================================================

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        admin.password
      );


    if (!isPasswordCorrect) {

      return res.status(401).json({

        success: false,

        message:
          'Invalid username or password.'

      });

    }


    // =================================================
    // LOGIN SUCCESS
    // =================================================

    return res.status(200).json({

      success: true,

      message:
        'Login successful.',

      admin: {

        id: admin._id,

        username: admin.username

      }

    });

  }

  catch (error) {

    console.error(
      'Admin login error:',
      error
    );


    return res.status(500).json({

      success: false,

      message:
        'Internal server error.'

    });

  }

});


module.exports = router;