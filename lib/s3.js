const AWS = require("aws-sdk");

AWS.config.update({
  region: "eu-west-2",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const s3 = new AWS.S3();
module.exports = s3;
