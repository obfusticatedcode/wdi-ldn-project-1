//get mongoose
const mongoose = require('mongoose');
const s3 = require('../lib/s3');

//adding some comments using an array to accommodate any amount of comments
const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

commentSchema.methods.belongsTo = function commentBelongsTo(user) {
  if(typeof this.createdBy.id === 'string') return this.createdBy.id === user.id;
  return user.id === this.createdBy.toString();
};

//create a categorySchema


//create the post model
const postSchema = new mongoose.Schema({
  category: {type: String},
  title: {type: String},
  price: {type: Number},
  currency: {type: String},
  description: {type: String},
  location: {type: String},
  lat: { type: Number },
  lng: { type: Number },
  email: {type: String, required: true},
  caption: {type: String},
  image: {type: String},
  stars: {type: Number},
//setting the user id via ObjectId using the ref:
  createdBy: {type: mongoose.Schema.ObjectId, ref: 'User', required: true},
//adding the comments into the postSchema/model
  comments: [commentSchema]
});

postSchema
  .virtual('imageSRC')
  .get(function getImageSRC() {
    if(!this.image) return null;
    if(this.image.match(/^http/)) return this.image;
    return `https://s3-eu-west-1.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${this.image}`;
  });

// this is a helper method for edit and delete buttons to show on page
//refactored to work whether the there's a createdBy or not
postSchema.methods.belongsTo = function postBelongsTo(user) {
  if(typeof this.createdBy.id === 'string') return this.createdBy.id === user.id;
  return user.id === this.createdBy.toString();
};

//removing the image post
postSchema.pre('remove', function removeImage(next){
  if(!this.image) return next();
  s3.deleteObject({ Key: this.image}, next);
});

//export the model
module.exports = mongoose.model('post', postSchema);
