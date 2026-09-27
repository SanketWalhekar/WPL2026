const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const registrationRoutes =
  require('./routes/registrationRoutes');

const authRoutes =
  require('./routes/authRoutes');

const categoryRoutes =
  require('./routes/categoryRoutes');

const auction =
  require('./routes/auction');

dotenv.config();

const app = express();


/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(cors());


/*
|--------------------------------------------------------------------------
| Body parsers
|--------------------------------------------------------------------------
*/

app.use(
  express.json()
);

app.use(
  express.urlencoded({
    extended: true
  })
);


/*
|--------------------------------------------------------------------------
| Static uploads
|--------------------------------------------------------------------------
|
| Files are stored here:
|
| backend/
|   uploads/
|     player-photos/
|     payment-screenshots/
|
| And accessed using:
|
| /uploads/player-photos/filename.jpg
|
*/

const uploadsPath =
  path.join(
    __dirname,
    'uploads'
  );


app.use(
  '/uploads',
  express.static(
    uploadsPath
  )
);


/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
*/

app.use(
  '/api/registrations',
  registrationRoutes
);

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/categories',
  categoryRoutes
);

app.use(
  '/api/auction',
  auction
);


/*
|--------------------------------------------------------------------------
| Test route
|--------------------------------------------------------------------------
*/

app.get(
  '/',
  (req, res) => {

    res.json({

      success: true,

      message:
        'WPL Backend API is running'

    });

  }
);


/*
|--------------------------------------------------------------------------
| MongoDB + Server
|--------------------------------------------------------------------------
*/

const PORT =
  process.env.PORT || 5000;


async function startServer() {

  try {

    if (!process.env.MONGODB_URI) {
      throw new Error(
        'MONGODB_URI is missing in .env file'
      );
    }

    console.log('Connecting to MongoDB...');

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      'MongoDB connected successfully'
    );

    const PORT =
      process.env.PORT || 5000;

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );

  } catch (error) {

    console.error(
      'MongoDB connection failed:',
      error.message
    );

    process.exit(1);
  }
}


// Local development only
if (process.env.NODE_ENV !== 'production') {
  startServer();
}


// Vercel
module.exports = app;
