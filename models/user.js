const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../lib/s3");

const userSchema = new mongoose.Schema({
  firstname: { type: String },
  lastname: { type: String },
  username: { type: String, required: true },
  email: { type: String },
  image: { type: String },
  password: { type: String },
  githubId: { type: Number },
  instagramId: { type: Number },
});

userSchema
  .virtual("passwordConfirmation")
  .set(function setPasswordConfirmation(passwordConfirmation) {
    this._passwordConfirmation = passwordConfirmation;
  });

userSchema.virtual("imageSRC").get(function getImageSRC() {
  if (!this.image) return null;
  if (this.image.match(/^(https?:\/\/|\/)/)) return this.image;
  if (process.env.AWS_BUCKET_NAME) {
    return `https://s3-eu-west-2.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${this.image}`;
  }
  return `/uploads/${this.image}`;
});

userSchema.pre("deleteOne", { document: true }, async function(next) {
  if (!this.image) return next();
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: this.image }));
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre("deleteOne", { document: true }, async function(next) {
  await this.model("Post").deleteMany({ createdBy: this.id });
  next();
});

userSchema.pre("validate", async function checkPassword() {
  if (!this.password && !this.githubId && !this.instagramId) {
    this.invalidate("password", "required");
  }
  if (
    this.isModified("password") &&
    this.password &&
    this._passwordConfirmation !== this.password
  ) {
    this.invalidate("passwordConfirmation", "does not match");
  }
});

userSchema.pre("save", async function hashPassword() {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
  }
});

userSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
