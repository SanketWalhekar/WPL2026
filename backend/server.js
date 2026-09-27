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
| MongoDB connection (serverless-safe)
|--------------------------------------------------------------------------
|
| Vercel reuses warm function instances between requests but can also
| spin up new ones (cold starts). This ensures every request waits for
| a real DB connection before touching any model, while avoiding a
| reconnect on every single request once a warm instance is connected.
|
*/

let isConnected = false;

async function connectDB() {

  if (isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is missing in environment variables'
    );
  }

  console.log('Connecting to MongoDB...');

  await mongoose.connect(
    process.env.MONGODB_URI
  );

  isConnected = true;

  console.log('MongoDB connected successfully');
}

// Ensure DB connection exists before any route handler runs
app.use(async (req, res, next) => {

  try {

    await connectDB();

    next();

  } catch (error) {

    console.error(
      'MongoDB connection failed:',
      error.message
    );

    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });

  }

});


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
| Local server (Vercel doesn't use app.listen — it handles the HTTP
| server internally and just invokes the exported app)
|--------------------------------------------------------------------------
*/

const PORT =
  process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {

  connectDB().then(() => {

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );

  }).catch((error) => {

    console.error(
      'Failed to start local server:',
      error.message
    );

    process.exit(1);

  });

}


// Vercel
module.exports = app;
