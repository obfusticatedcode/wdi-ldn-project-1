const s3 = require("./s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const uuid = require("uuid");

// Check if AWS_BUCKET_NAME is set
if (!process.env.AWS_BUCKET_NAME) {
  throw new Error("AWS_BUCKET_NAME environment variable is not set!");
}

module.exports = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key(req, file, next) {
      const ext = file.mimetype.replace("image/", "");
      next(null, `${uuid.v4()}.${ext}`);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter(req, file, next) {
    const whitelist = ["image/png", "image/jpeg", "image/gif"];
    if (whitelist.includes(file.mimetype)) {
      next(null, true);
    } else {
      next(new Error("Unsupported file type"), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 500, // 500MB
  },
});
