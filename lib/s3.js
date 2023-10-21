const { S3Client } = require("@aws-sdk/client-s3");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");

const s3 = new S3Client({
  region: "eu-west-2",
  credentials: defaultProvider({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  }),
});

module.exports = s3;
