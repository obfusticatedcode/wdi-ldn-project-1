const github = {
  loginURL: "https://github.com/login/oauth/authorize",
  accessTokenURL: "https://github.com/login/oauth/access_token",
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  profileURL: "https://api.github.com/user",
  scope: "user:email",
  getLoginURL() {
    return `${this.loginURL}?client_id=${this.clientId}&scope=${this.scope}`;
  },
};

const instagram = {
  loginUrl: "https://api.instagram.com/oauth/authorize/",
  accessTokenUrl: "https://api.instagram.com/oauth/access_token",
  redirectUri:
    process.env.NODE_ENV === "production"
      ? "https://polar-springs-29447.herokuapp.com/oauth/instagram"
      : "http://localhost:8000/oauth/instagram",
  clientId: process.env.INSTAGRAM_CLIENT_ID,
  clientSecret: process.env.INSTAGRAM_SECRET_KEY,
  responseCode: "code",
  getLoginURL() {
    return `${this.loginUrl}?client_id=${this.clientId}&redirect_uri=${this.redirectUri}&response_type=${this.responseCode}`;
  },
};

module.exports = {
  github,
  instagram,
};
