import passport from "passport";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import { config } from "dotenv";

config();

const emails = ["gariiarellano01@gmail.com"]

passport.use(
    "auth-google",
    new GoogleStrategy(
    {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google"
    },
    function(accessToken, refreshToken, profile, done) {
        const response = emails.includes(profile.emails[0].value);

        if (response) {
            done(null,profile);
        } else {
            emails.push(profile.emails[0].value);
            done(null,profile);
        }
    }
));