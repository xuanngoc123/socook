const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../models/index');
const authService = require('../services/authService');
const { Op, TableHints } = require("sequelize");

passport.serializeUser((user, cb) => {
    cb(null, user)
})
passport.deserializeUser((obj, cb) => {
    cb(null, obj)
})

passport.use(
    new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/api/auth/google/callback',
        passReqToCallback: true
    }, async (request, accessToken, refreshToken, profile, done) => {
        const transaction = await db.sequelize.transaction();
        try {
            const checkUserExit = await db.Login_info.findOne({
                where: {
                    [Op.or]: [{ email: profile.emails[0].value }, { google_id: profile.id }]
                }
            })
            if (checkUserExit) {
                let user = await db.User.findOne({
                    where: { user_id: checkUserExit.user_id },
                    raw: true
                });
                let accessToken = authService.generateAccessToken(checkUserExit, user);
                let refreshToken = authService.generateRefreshToken(checkUserExit, user);
                user.avatar_image = profile.photos[0].value;
                user.status = checkUserExit.status;
                user.email = checkUserExit.email;
                user.user_name = checkUserExit.user_name
                let data = {
                    messageCode: 1,
                    message: "login success!",
                    accessToken,
                    refreshToken,
                    user
                }
                return done(null, data)
            }
            else {
                let createUser = await db.User.create({
                    full_name: profile.name,
                    create_time: Date.now()
                }, { transaction })
                let createLogininfo = await db.Login_info.create({
                    user_id: createUser.user_id,
                    user_name: profile.name,
                    google_id: profile.id,
                    email: profile.emails[0].value,
                    status: (profile.emails[0].verified == true) ? 1 : 0,
                    role: 'user'
                }, { transaction })

                let user = await db.User.findOne({
                    where: { user_id: createUser.user_id },
                    raw: true
                });
                let accessToken = authService.generateAccessToken(createLogininfo, createUser);
                let refreshToken = authService.generateRefreshToken(createLogininfo, createUser);
                user.avatar_image = profile.photos[0].values;
                user.status = checkUserExit.status;
                user.email = checkUserExit.email;
                user.user_name = checkUserExit.user_name
                let data = {
                    messageCode: 1,
                    message: "login success!",
                    accessToken,
                    refreshToken,
                    user
                }
                await transaction.commit();
                return done(null, data)

            }
        } catch (error) {
            await transaction.rollback();
            console.log(error);
            return done(error, {
                messageCode: 0,
                message: "login fail!",
            })
        }
    })

);
passport.use(
    new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/api/auth/facebook/callback'
    }, (request, accessToken, refreshToken, profile, done) => {
        return done(null, profile)
    })
)



module.exports = passport