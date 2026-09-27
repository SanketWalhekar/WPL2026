const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const Admin = require('./models/Admin');


// =====================================================
// MONGODB CONNECTION
// =====================================================

const MONGO_URI =
  'mongodb://SanketWalhekar4099:Sanket4099@cluster0-shard-00-00.sevwc.mongodb.net:27017,cluster0-shard-00-01.sevwc.mongodb.net:27017,cluster0-shard-00-02.sevwc.mongodb.net:27017/wpl2026?ssl=true&replicaSet=atlas-iiprtr-shard-0&authSource=admin';

// =====================================================
// CREATE ADMIN
// =====================================================

async function createAdmin() {

  try {

    await mongoose.connect(
      MONGO_URI
    );

    console.log(
      'MongoDB connected.'
    );


    // =================================================
    // ADMIN LOGIN DETAILS
    // =================================================

    const username = 'admin';

    const password = 'Admin@123';


    // =================================================
    // CHECK IF ADMIN ALREADY EXISTS
    // =================================================

    const existingAdmin =
      await Admin.findOne({
        username
      });


    if (existingAdmin) {

      console.log(
        'Admin already exists.'
      );

      await mongoose.connection.close();

      return;

    }


    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    // =================================================
    // CREATE ADMIN
    // =================================================

    await Admin.create({

      username,

      password:
        hashedPassword

    });


    console.log(
      '===================================='
    );

    console.log(
      'Admin created successfully.'
    );

    console.log(
      'Username: admin'
    );

    console.log(
      'Password: Admin@123'
    );

    console.log(
      '===================================='
    );


    await mongoose.connection.close();

  }

  catch (error) {

    console.error(
      'Error creating admin:',
      error
    );

    await mongoose.connection.close();

  }

}


createAdmin();