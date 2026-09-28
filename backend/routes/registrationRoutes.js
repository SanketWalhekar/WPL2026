const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Registration = require('../models/Registration');

const router = express.Router();


// ======================================================
// UPLOAD DIRECTORIES
// ======================================================

// const uploadsDirectory = path.join(
//   __dirname,
//   '../uploads'
// );

// const playerPhotoDirectory = path.join(
//   uploadsDirectory,
//   'player-photos'
// );

// const paymentScreenshotDirectory = path.join(
//   uploadsDirectory,
//   'payment-screenshots'
// );


// // Create folders automatically
// fs.mkdirSync(
//   playerPhotoDirectory,
//   {
//     recursive: true
//   }
// );

// fs.mkdirSync(
//   paymentScreenshotDirectory,
//   {
//     recursive: true
//   }
// );


// // ======================================================
// // MULTER STORAGE
// // ======================================================

// const storage = multer.diskStorage({

//   destination: function (
//     req,
//     file,
//     cb
//   ) {

//     if (
//       file.fieldname ===
//       'playerPhoto'
//     ) {

//       cb(
//         null,
//         playerPhotoDirectory
//       );

//       return;
//     }


//     if (
//       file.fieldname ===
//       'paymentScreenshot'
//     ) {

//       cb(
//         null,
//         paymentScreenshotDirectory
//       );

//       return;
//     }


//     cb(
//       new Error(
//         'Invalid upload field'
//       )
//     );

//   },


//   filename: function (
//     req,
//     file,
//     cb
//   ) {

//     const extension =
//       path.extname(
//         file.originalname
//       );

//     const uniqueName =
//       `${Date.now()}-${Math.round(
//         Math.random() * 1E9
//       )}${extension}`;

//     cb(
//       null,
//       uniqueName
//     );

//   }

// });

const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const folder =
      file.fieldname === 'playerPhoto'
        ? 'wpl/player-photos'
        : 'wpl/payment-screenshots';

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});


// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = function (
  req,
  file,
  cb
) {

  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];


  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {

    cb(
      null,
      true
    );

  } else {

    cb(
      new Error(
        'Only JPG, JPEG, PNG and WEBP images are allowed'
      ),
      false
    );

  }

};


// ======================================================
// MULTER
// ======================================================

const upload = multer({

  storage: storage,

  fileFilter: fileFilter,

  limits: {
    fileSize:
      10 * 1024 * 1024
  }

});


// ======================================================
// CREATE REGISTRATION
// ======================================================

router.post(
  '/',
  upload.fields([
    {
      name: 'playerPhoto',
      maxCount: 1
    },
    {
      name: 'paymentScreenshot',
      maxCount: 1
    }
  ]),

  async function (
    req,
    res
  ) {

    try {

      console.log(
        'Registration request received'
      );

      console.log(
        'Body:',
        req.body
      );

      console.log(
        'Files:',
        req.files
      );


      // ------------------------------------------------
      // PLAYER PHOTO PATH
      // ------------------------------------------------

      // let playerPhotoPath = '';

      // if (
      //   req.files &&
      //   req.files.playerPhoto &&
      //   req.files.playerPhoto.length > 0
      // ) {

      //   const file =
      //     req.files.playerPhoto[0];

      //   playerPhotoPath =
      //     `/uploads/player-photos/${file.filename}`;

      // }

      let playerPhotoPath = '';
if (req.files && req.files.playerPhoto && req.files.playerPhoto.length > 0) {
  playerPhotoPath = req.files.playerPhoto[0].path; // full Cloudinary URL
}

let paymentScreenshotPath = '';
if (req.files && req.files.paymentScreenshot && req.files.paymentScreenshot.length > 0) {
  paymentScreenshotPath = req.files.paymentScreenshot[0].path; // full Cloudinary URL
}


      // ------------------------------------------------
      // PAYMENT SCREENSHOT PATH
      // ------------------------------------------------

      // let paymentScreenshotPath = '';

      // if (
      //   req.files &&
      //   req.files.paymentScreenshot &&
      //   req.files.paymentScreenshot.length > 0
      // ) {

      //   const file =
      //     req.files.paymentScreenshot[0];

      //   paymentScreenshotPath =
      //     `/uploads/payment-screenshots/${file.filename}`;

      // }


      // ------------------------------------------------
      // CREATE DATA
      // ------------------------------------------------

      const registrationData = {

        ...req.body,

        playerPhoto:
          playerPhotoPath,

        paymentScreenshot:
          paymentScreenshotPath

      };


      // ------------------------------------------------
      // SAVE TO MONGODB
      // ------------------------------------------------

      const registration =
        new Registration(
          registrationData
        );

      await registration.save();


      // ------------------------------------------------
      // RESPONSE
      // ------------------------------------------------

      res.status(201).json({

        success: true,

        message:
          'Registration submitted successfully',

        registration

      });

    } catch (error) {

      console.error(
        'Registration error:',
        error
      );


      // Delete uploaded files if DB save fails
      try {

        if (
          req.files?.playerPhoto
        ) {

          req.files.playerPhoto.forEach(
            file => {

              if (
                fs.existsSync(
                  file.path
                )
              ) {

                fs.unlinkSync(
                  file.path
                );

              }

            }
          );

        }


        if (
          req.files?.paymentScreenshot
        ) {

          req.files.paymentScreenshot.forEach(
            file => {

              if (
                fs.existsSync(
                  file.path
                )
              ) {

                fs.unlinkSync(
                  file.path
                );

              }

            }
          );

        }

      } catch (
        cleanupError
      ) {

        console.error(
          'File cleanup error:',
          cleanupError
        );

      }


      res.status(500).json({

        success: false,

        message:
          'Registration failed',

        error:
          error.message

      });

    }

  }
);


// ======================================================
// GET ALL REGISTRATIONS
// ======================================================

router.get(
  '/',
  async function (
    req,
    res
  ) {

    try {

      const registrations =
        await Registration
          .find()
          .sort({
            createdAt: -1
          });


      res.json({

        success: true,

        registrations

      });

    } catch (error) {

      console.error(
        'Get registrations error:',
        error
      );


      res.status(500).json({

        success: false,

        message:
          'Failed to get registrations',

        error:
          error.message

      });

    }

  }
);


// ======================================================
// GET REGISTRATION BY ID
// ======================================================

router.get(
  '/:id',
  async function (
    req,
    res
  ) {

    try {

      const registration =
        await Registration.findById(
          req.params.id
        );


      if (!registration) {

        return res.status(404).json({

          success: false,

          message:
            'Registration not found'

        });

      }


      res.json({

        success: true,

        registration

      });

    } catch (error) {

      console.error(
        'Get registration error:',
        error
      );


      res.status(500).json({

        success: false,

        message:
          'Failed to get registration',

        error:
          error.message

      });

    }

  }
);


module.exports = router;
