// ADD YOUR OWN KEYS AND RENAME THIS FILE TO keys.js
const TWITTER_TOKENS = {
  FACEBOOK_APP_ID:4037464052986839, 
FACEBOOK_APP_SECRET:"b3b43429d3162f4da229519758811330"
};
// "mongodb+srv://atlas-admin:1c9quyne5f@cluster0.lud4s.mongodb.net/userDB"

const MONGODB = {
  MONGODB_URI: "mongodb://localhost:27017/userDB"
};

const SESSION = {
  COOKIE_KEY: "thisappisawesome"
};

const GOOGLE_TOKENS={
  GOOGLE_CLIENT_ID:"880991497316-rvp7bk40797o33ffd4ekqftck462b9n9.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET:"-zh36ybIBeW1UrkmsxmLWekw"
}


const KEYS = {
  ...TWITTER_TOKENS,
  ...MONGODB,
  ...SESSION,
  ...GOOGLE_TOKENS
};

module.exports = KEYS;
