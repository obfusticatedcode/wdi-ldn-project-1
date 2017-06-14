const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const s3 = require('../lib/s3');


const userSchema = new mongoose.Schema({
  firstname: {type: String},
  lastname: {type: String},
  username: { type: String, required: true },
  email: { type: String },
  image: { type: String },
  password: { type: String },
  githubId: { type: Number },
  instagramId: { type: Number }

});

userSchema
  .virtual('passwordConfirmation')
  .set(function setPasswordConfirmation(passwordConfirmation) {
    this._passwordConfirmation = passwordConfirmation;
  });

userSchema
  .virtual('imageSRC')
  .get(function getImageSRC() {
    if(!this.image) return null;
    if(this.image.match(/^http/)) return this.image;
    return `https://s3-eu-west-1.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${this.image}`;
  });

userSchema.pre('remove', function removeImage(next) {
  if(!this.image) return next();
  s3.deleteObject({ Key: this.image }, next);
});

//pre remove hook
userSchema.pre('remove', function removeUserPosts(next) {
  this.model('Post').remove({ createdBy: this.id }, next);
});

// lifecycle hook - mongoose middleware
//github and instagram
userSchema.pre('validate', function checkPassword(next) {
  if((!this.password && !this.githubId) && (!this.password && !this.instagramId)) {
    this.invalidate('password', 'required');
  }
  if(this.isModified('password') && this.password && this._passwordConfirmation !== this.password){
    this.invalidate('passwordConfirmation', 'does not match');
  }
  next();
});




userSchema.pre('save', function checkPassword(next) {
  if(this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
  }
  next();
});

userSchema.methods.validatePassword = function validatePassword(password) {
  return bcrypt.compareSync(password, this.password);
};



module.exports = mongoose.model('User', userSchema);
