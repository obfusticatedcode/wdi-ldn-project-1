const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const fileFilter = (req, file, next) => {
  const whitelist = ["image/png", "image/jpeg", "image/gif"];
  if (whitelist.includes(file.mimetype)) {
    next(null, true);
  } else {
    next(new Error("Unsupported file type"), false);
  }
};

const limits = { fileSize: 1024 * 1024 * 500 };

// Use S3 when AWS credentials are present, local disk otherwise
if (process.env.AWS_BUCKET_NAME) {
  const s3 = require("./s3");
  const multerS3 = require("multer-s3");

  module.exports = multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_BUCKET_NAME,
      key(req, file, next) {
        const ext = file.mimetype.replace("image/", "");
        next(null, `${uuidv4()}.${ext}`);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    fileFilter,
    limits,
  });
} else {
  // Local fallback — uploads go to public/uploads/
  const storage = multer.diskStorage({
    destination: path.join(__dirname, "../public/uploads"),
    filename(req, file, next) {
      const ext = path.extname(file.originalname);
      next(null, `${uuidv4()}${ext}`);
    },
  });

  module.exports = multer({ storage, fileFilter, limits });
}
