//grabbing the post model
const Post = require('../models/post');

//create route
function createRoute(req, res, next) {
  //adding user to the post createRoute controller
  req.body.createdBy = req.user;

  if(req.file) req.body.image = req.file.key;



  Post
    .create(req.body)
    .then(() => res.redirect('/posts'))
    .catch((err) => {
      if(err.name === 'ValidationError') return res.badRequest(`/posts/new`, err.toString());
      next(err);
    });
}

//home/index route
function indexRoute(req, res, next) {
  Post
    .find()
    .populate('createdBy')
    .exec()
    .then((posts) => res.render('posts/index', { posts }))
    .catch(next);
}

//new route
function newRoute(req, res) {
  return res.render('posts/new');
}



//display or show
function showRoute(req, res, next) {
  Post
    .findById(req.params.id)
    .populate('createdBy comments.createdBy') //passing in the user's Objectid
    .exec()
    .then((post) => {
      if(!post) return res.notFound();
      return res.render('posts/show', { post });
    })
    .catch(next);
}

//edit route
function editRoute(req, res, next) {

  Post
    .findById(req.params.id)
    .populate('createdBy')
    .exec()
    .then((post) => {
      if(!post) return res.redirect();
      if(!post.belongsTo(req.user)) return res.unauthorized(`/posts/${post.id}`, 'You do not have permission to edit that resource');
      return res.render('posts/edit', { post });
    })
    .catch(next);
}

//update route
function updateRoute(req, res, next) {
  if(req.file) req.body.image = req.file.key;
  
  Post
    .findById(req.params.id)
    .populate('createdBy')
    .exec()
    .then((post) => {
      if(!post) return res.notFound();

      for(const field in req.body) {
        post[field] = req.body[field];
      }

      return post.save();
    })
    .then(() => res.redirect(`/posts/${req.params.id}`))
    .catch((err) => {
      if(err.name === 'ValidationError') return res.badRequest(`/posts/${req.params.id}/edit`, err.toString());
      next(err);
    });
}

//delete route
function deleteRoute(req, res, next) {
  Post
    .findById(req.params.id)
    .populate('createdBy')
    .exec()
    .then((post) => {
      if(!post) return res.notFound();
      if(!post.belongsTo(req.user)) return res.unauthorized(`/posts/${post.id}`, 'You do not have permission to delete that resource');
      return post.remove();
    })
    .then(() => res.redirect('/posts'))
    .catch(next);
}

//adding in the comments controller since it's embedded and not a separate resource
function createCommentRoute(req, res, next) {
  //adding in the logged in user to the body via req.body
  req.body.createdBy = req.user;

  Post
    .findById(req.params.id)
    .exec()
    .then((post) => {
      if(!post) return res.notFound();
      //pushing some comments into the comments array
      post.comments.push(req.body); // create an embedded record
      return post.save();
    })
    .then((post) => res.redirect(`/posts/${post.id}`))
    .catch(next);
}

function deleteCommentRoute(req, res, next) {
  Post
    .findById(req.params.id)
    .exec()
    .then((post) => {
      if(!post) return res.notFound();
      // get the embedded record by it's id
      const comment = post.comments.id(req.params.commentId);
      comment.remove();

      return post.save();
    })
    .then((post) => res.redirect(`/posts/${post.id}`))
    .catch(next);
}

//exporting the functions to be used elsewhere§
module.exports = {
  index: indexRoute,
  new: newRoute,
  create: createRoute,
  show: showRoute,
  edit: editRoute,
  update: updateRoute,
  delete: deleteRoute,
  createComment: createCommentRoute,
  deleteComment: deleteCommentRoute
};
