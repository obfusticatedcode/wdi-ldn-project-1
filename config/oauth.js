const github = {
  loginURL: "https://github.com/login/oauth/authorize",
  accessTokenURL: "https://github.com/login/oauth/access_token",
  profileURL: "https://api.github.com/user",
  scope: "user:email",
  get clientId() { return process.env.GITHUB_CLIENT_ID; },
  get clientSecret() { return process.env.GITHUB_CLIENT_SECRET; },
  getLoginURL() {
    return `${this.loginURL}?client_id=${this.clientId}&scope=${this.scope}`;
  },
};

module.exports = { github };
