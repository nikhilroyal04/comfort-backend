const multer = require("multer");
const sharp = require("sharp"); // For image processing
const { adminStorage } = require("../config/firebase");

// Set up multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); 

// Function to handle image upload to Firebase Storage with resizing
const uploadImage = async (file, width = 512, height = 512) => { // Default size: 500x500
  try {
    const bucket = adminStorage.bucket();
    const filePath = `comfort-way/${Date.now()}_${file.originalname}`; // Custom path in Firebase Storage
    const firebaseFile = bucket.file(filePath);

    // Resize the image using sharp
    const resizedBuffer = await sharp(file.buffer)
      .resize(width, height, {
        fit: sharp.fit.cover, // Ensures the image covers the entire dimension
      })
      .toBuffer();

    const blobStream = firebaseFile.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        reject(error);
      });

      blobStream.on("finish", async () => {
        const [url] = await firebaseFile.getSignedUrl({
          action: "read",
          expires: "03-09-2491", // Validity of the signed URL
          queryParams: { alt: "media" },
        });
        resolve(url); // Return the signed URL for the image
      });

      blobStream.end(resizedBuffer); // Upload resized image buffer to Firebase
    });
  } catch (error) {
    throw new Error("Error uploading image: " + error.message);
  }
};

module.exports = {
  uploadImage,
  upload,
};
