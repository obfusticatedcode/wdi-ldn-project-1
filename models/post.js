const mongoose = require("mongoose");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../lib/s3");

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

commentSchema.methods.belongsTo = function commentBelongsTo(user) {
  if (typeof this.createdBy.id === "string") return this.createdBy.id === user.id;
  return user.id === this.createdBy.toString();
};

const postSchema = new mongoose.Schema({
  category:    { type: String },
  title:       { type: String },
  price:       { type: Number },
  currency:    { type: String },
  description: { type: String },
  location:    { type: String },
  lat:         { type: Number },
  lng:         { type: Number },
  email:       { type: String, required: true },
  caption:     { type: String },
  images:      [{ type: String }],
  createdBy:   { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  comments:    [commentSchema],
});

function resolveImageURL(image) {
  if (!image) return null;
  if (image.match(/^(https?:\/\/|\/)/)) return image;
  if (process.env.AWS_BUCKET_NAME) {
    return `https://s3-eu-west-1.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${image}`;
  }
  return `/uploads/${image}`;
}

postSchema.virtual("imageSRC").get(function() {
  return resolveImageURL(this.images?.[0]);
});

postSchema.virtual("imagesSRC").get(function() {
  return (this.images || []).map(resolveImageURL).filter(Boolean);
});

postSchema.methods.belongsTo = function postBelongsTo(user) {
  if (typeof this.createdBy.id === "string") return this.createdBy.id === user.id;
  return user.id === this.createdBy.toString();
};

postSchema.pre("deleteOne", { document: true }, async function(next) {
  if (!this.images?.length) return next();
  try {
    await Promise.all(
      this.images
        .filter(img => img && !img.match(/^(https?:\/\/|\/)/))
        .map(key => s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key })))
    );
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Post", postSchema);
