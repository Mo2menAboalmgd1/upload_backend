const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype.startsWith("audio/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only images, videos, audio files, and PDFs are allowed."
        )
      );
    }
  },
});

module.exports = upload;
