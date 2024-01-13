const multer = require("multer");
const express = require("express");
const path = require("path");
const sharp = require("sharp");
const fs = require("fs");
const multer_route = express();
multer_route.use(express.static("public"));


const createStorage = (folderName) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, `../public/images/${folderName}`));
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
    },
  });
};

const userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/userRaw"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});


const brandStorage = createStorage("brand");
const categoryStorage = createStorage("category");
const productStorage = createStorage("productRaw");
const bannerStorage = createStorage("banner");


const createMulter = (storage) => {
  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const allowedFormats = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/webp",
        "image/avif",
      ];

      if (allowedFormats.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
        cb(
          new Error(
            "Only .png, .jpg, .jpeg, .webp, and .avif formats are allowed!"
          )
        );
      }
    },
  });
};
const uploadUser = createMulter(userStorage);
const uploadBrand = createMulter(brandStorage);
const uploadCategory = createMulter(categoryStorage);
const uploadProduct = createMulter(productStorage);
const uploadBanner = createMulter(bannerStorage);




const productImgResize = async (req, res, next) => {
 

  try {
    await Promise.all(
      req.files.map(async (file) => {
        // Use try-catch to handle errors during image processing
        try {
          let sharpInstance = sharp(file.path);

          await sharpInstance
            .resize(300, 300)
            .toFormat("jpeg")
            .jpeg({ quality: 100 })
            .toFile(`public/images/products/${file.filename}`);

          // Destroy the sharp instance to release resources
          sharpInstance.destroy();

          // Use fs.promises.unlink for asynchronous file deletion
          await fs.promises.unlink(file.path);
          console.log(`File ${file.filename} deleted successfully.`);
        } catch (error) {
          console.error(
            `Error processing image ${file.filename}: ${error.message}`
          );
        }
      })
    );
  } catch (error) {
    console.error(`Error in productImgResize: ${error.message}`);
  }

  next();
};

const userImgResize = async (req, res, next) => {
  try {
    if (!req.file) {
      // No file uploaded, proceed to the next middleware/controller
      return next();
    }

    await Promise.all(
      [req.file].map(async (file) => {
        // Use try-catch to handle errors during image processing
        try {
          let sharpInstance = sharp(file.path);

          await sharpInstance
            .resize(300, 300)
            .toFormat("jpeg")
            .jpeg({ quality: 100 })
            .toFile(`public/images/userProfile/${file.filename}`);

          // Destroy the sharp instance to release resources
          sharpInstance.destroy();

          // Use fs.promises.unlink for asynchronous file deletion
          await fs.promises.unlink(file.path);
          console.log(`File ${file.filename} deleted successfully.`);
        } catch (error) {
          console.error(
            `Error processing image ${file.filename}: ${error.message}`
          );
        }
      })
    );
  } catch (error) {
    console.error(`Error in userImgResize: ${error.message}`);
  }

  next();
};


module.exports = {
  uploadUser,
  uploadBanner,
  uploadBrand,
  uploadCategory,
  uploadProduct,
  productImgResize,
  userImgResize,
  uploadBanner,
};
