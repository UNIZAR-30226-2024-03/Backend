const passport = require("passport");
const { OAuth2Strategy: GoogleStrategy } = require("passport-google-oauth");
const { config } = require("dotenv");

config();

const emails = ["gariiarellano01@gmail.com"];

passport.use(
    "auth-google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google",
        },
        function (accessToken, refreshToken, profile, done) {
            const exists = emails.includes(profile.emails[0].value);
            if (!exists) {
                emails.push(profile.emails[0].value);
            }
            done(null, profile);
        }
    )
);
