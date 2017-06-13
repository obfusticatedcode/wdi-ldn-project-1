const router = require('express').Router();
const registrations = require('../controllers/registrations');
const users = require('../controllers/users');
const postsController = require('../controllers/posts');
const sessions = require('../controllers/sessions');
const oauth = require('../controllers/oauth');
const secureRoute = require('../lib/secureRoute');
const upload = require('../lib/upload');

//index
router.get('/', (req, res) => res.render('statics/index'));


//users routes
router.route('/users/:id')
  .get(secureRoute, users.show)
  .post(secureRoute, upload.single('image'), users.update)
  .delete(secureRoute, users.delete);

router.route('/users/:id/edit')
  .get(secureRoute, users.edit);

router.route('/register')
  .get(registrations.new)
  .post(registrations.create);

router.route('/login')
  .get(sessions.new)
  .post(sessions.create);

router.route('/logout')
  .get(sessions.delete);

router.route('/oauth/github')
  .get(oauth.github);


//posts routes
router.route('/posts')
  .get(postsController.index)
  .post(secureRoute,upload.single('image'), postsController.create);

router.route('/posts/new')
  .get(secureRoute, postsController.new);

router.route('/posts/:id')
  .get(postsController.show)
  .post(secureRoute, upload.single('image'), postsController.update)
  .delete(secureRoute, postsController.delete);

router.route('/posts/:id/edit')
  .get(secureRoute, postsController.edit);

router.route('/posts/:id/comments')
  .post(secureRoute, postsController.createComment);

router.route('/posts/:id/comments/:commentId')
  .delete(secureRoute, postsController.deleteComment);

router.all('*', (req, res) => res.notFound());

module.exports = router;
