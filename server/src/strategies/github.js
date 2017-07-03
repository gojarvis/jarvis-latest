let GraphUtil = require("../utils/graph");
let graphUtil = new GraphUtil();

let GitHubStrategy = require("passport-github").Strategy;
let GITHUB_CLIENT_ID = "a595d84888f2d2a687a4";
let GITHUB_CLIENT_SECRET = "3279791b36883a5138acf4db4080a5982faee3d8";

let githubStrategy = new GitHubStrategy(
    {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        graphUtil
            .getSaveUserInGraph({ username: profile.username })
            .then(result => {
                return cb(null, result);
            })
            .catch(cb);
    }
);

module.exports = githubStrategy;
