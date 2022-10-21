const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const passportJwt = require('passport-jwt');
const ExtractJwt = passportJwt.ExtractJwt;
const StrategyJwt = passportJwt.Strategy;
const db = require('../models/index');
const authService = require('../services/authService');
const {Op} = require('sequelize');
const {getUrlImage} = require('./multer');

passport.serializeUser((data, cb) => {
  // console.log(data);
  cb(null, data);
});
passport.deserializeUser(async (user, cb) => {
  console.log(user);
  const findUser = await db.Login_info.findOne({
    where: {
      [Op.or]: [{google_id: user.user_id}, {facebook_id: user.user_id}],
    },
  }).catch((err) => {
    cb(err, null);
  });
  cb(null, findUser);
});

passport.use(
  new StrategyJwt(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_KEY,
    },
    function (jwtPayload, done) {
      return db.User.findOne({
        where: {
          user_id: jwtPayload.user_id,
        },
      })
        .then((user) => {
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      const transaction = await db.sequelize.transaction();
      try {
        const checkUserExit = await db.Login_info.findOne({
          where: {
            [Op.or]: [{email: profile.emails[0].value}, {google_id: profile.id}],
          },
        });
        if (checkUserExit) {
          let user = await db.User.findOne({
            where: {user_id: checkUserExit.user_id},
            raw: true,
          });
          let accessToken = authService.generateAccessToken(checkUserExit, user);
          let refreshToken = authService.generateRefreshToken(checkUserExit, user);

          user.avatar_image = getUrlImage(user.avatar_image);
          user.cover_image = getUrlImage(user.cover_image);
          user.status = checkUserExit.status;
          user.email = checkUserExit.email;
          user.user_name = checkUserExit.user_name;
          let data = {
            messageCode: 1,
            message: 'login success!',
            accessToken,
            refreshToken,
            user,
          };
          return done(null, data);
        } else {
          let createUser = await db.User.create(
            {
              full_name: profile.displayName,
              avatar_image: process.env.AVATAR_KEY,
              cover_image: process.env.COVER_KEY,
              create_time: Date.now(),
            },
            {transaction},
          );
          let createLogininfo = await db.Login_info.create(
            {
              user_id: createUser.user_id,
              user_name: profile.displayName,
              google_id: profile.id,
              email: profile.emails[0].value,
              status: profile.emails[0].verified == true ? 1 : 0,
              role: 'user',
            },
            {transaction},
          );
          await transaction.commit();

          let findUser = await db.User.findOne({
            where: {user_id: createUser.user_id},
            raw: true,
          });
          let accessToken = authService.generateAccessToken(createLogininfo, createUser);
          let refreshToken = authService.generateRefreshToken(createLogininfo, createUser);

          findUser.avatar_image = getUrlImage(findUser.avatar_image);
          findUser.cover_image = getUrlImage(findUser.cover_image);
          findUser.status = checkUserExit.status;
          findUser.email = checkUserExit.email;
          findUser.user_name = checkUserExit.user_name;
          let data = {
            messageCode: 1,
            message: 'login success!',
            accessToken,
            refreshToken,
            user: findUser,
          };

          return done(null, data);
        }
      } catch (error) {
        await transaction.rollback();
        console.log(error);
        return done(error, {
          messageCode: 0,
          message: 'login fail!',
        });
      }
    },
  ),
);
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: 'http://localhost:8080/api/auth/facebook/callback',
    },
    async (request, accessToken, refreshToken, profile, done) => {
      const transaction = await db.sequelize.transaction();
      try {
        const checkUserExit = await db.Login_info.findOne({
          where: {
            facebook_id: profile.id,
          },
        });
        if (checkUserExit) {
          let user = await db.User.findOne({
            where: {user_id: checkUserExit.user_id},
            raw: true,
          });
          let accessToken = authService.generateAccessToken(checkUserExit, user);
          let refreshToken = authService.generateRefreshToken(checkUserExit, user);

          user.avatar_image = getUrlImage(user.avatar_image);
          user.cover_image = getUrlImage(user.cover_image);
          user.status = checkUserExit.status;
          user.email = checkUserExit.email;
          user.user_name = checkUserExit.user_name;
          let data = {
            messageCode: 1,
            message: 'login success!',
            accessToken,
            refreshToken,
            user,
          };
          return done(null, data);
        } else {
          let createUser = await db.User.create(
            {
              full_name: profile.displayName,
              avatar_image: process.env.AVATAR_KEY,
              cover_image: process.env.COVER_KEY,
              create_time: Date.now(),
            },
            {transaction},
          );
          let createLogininfo = await db.Login_info.create(
            {
              user_id: createUser.user_id,
              user_name: profile.displayName,
              facebook_id: profile.id,
              status: 1,
              role: 'user',
            },
            {transaction},
          );
          await transaction.commit();

          let findUser = await db.User.findOne({
            where: {user_id: createUser.user_id},
            raw: true,
          });
          let accessToken = authService.generateAccessToken(createLogininfo, createUser);
          let refreshToken = authService.generateRefreshToken(createLogininfo, createUser);

          findUser.avatar_image = getUrlImage(findUser.avatar_image);
          findUser.cover_image = getUrlImage(findUser.cover_image);
          findUser.status = checkUserExit.status;
          findUser.email = checkUserExit.email;
          findUser.user_name = checkUserExit.user_name;
          let data = {
            messageCode: 1,
            message: 'login success!',
            accessToken,
            refreshToken,
            user: findUser,
          };

          return done(null, data);
        }
      } catch (error) {
        await transaction.rollback();
        console.log(error);
        return done(error, {
          messageCode: 0,
          message: 'login fail!',
        });
      }
    },
  ),
);

module.exports = passport;
