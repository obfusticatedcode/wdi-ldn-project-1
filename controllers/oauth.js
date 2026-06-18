const axios = require('axios');
const config = require('../config/oauth');
const User = require('../models/user');

function github(req, res, next) {
  return axios.post(config.github.accessTokenURL, null, {
    params: {
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code: req.query.code
    }
  })
  .then((tokenRes) => {
    return axios.get(config.github.profileURL, {
      params: tokenRes.data,
      headers: { 'User-Agent': 'TradeSpace' }
    });
  })
  .then((profileRes) => {
    const profile = profileRes.data;
    return User
      .findOne({ $or: [{ email: profile.email }, { githubId: profile.id }] })
      .then((user) => {
        if (!user) {
          user = new User({
            username: profile.login,
            email: profile.email,
            image: profile.avatar_url
          });
        }
        user.githubId = profile.id;
        return user.save();
      });
  })
  .then((user) => {
    req.session.userId = user.id;
    req.session.isAuthenticated = true;
    req.flash('info', `Welcome back, ${user.username}!`);
    res.redirect(`/users/${user.id}`);
  })
  .catch(next);
}

module.exports = { github };
