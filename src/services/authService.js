const bcrypt = require('bcrypt');
const db = require('../models/index');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {getUrlImage} = require('../config/multer');
const sendMail = require('../config/nodemailer');
const {Op} = require('sequelize');
const axios = require('axios');

const authService = {
  resolveRegisterUser: async (data) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        const email = data.body.email.toLowerCase();
        const user_name = data.body.user_name;
        let findUser = await db.Login_info.findOne({
          attributes: {email},
          where: {
            [Op.or]: [{email: email}, {user_name: user_name}],
          },
          raw: true,
        });
        if (!findUser) {
          let salt = await bcrypt.genSalt(10);
          let password = await bcrypt.hash(data.body.password, salt);
          let createUser = await db.User.create(
            {
              full_name: 'Người dùng hệ thống',
              avatar_image: process.env.AVATAR_KEY,
              cover_image: process.env.COVER_KEY,
              create_time: Date.now(),
            },
            {transaction},
          );

          let createLoginInfo = await db.Login_info.create(
            {
              user_id: createUser.user_id,
              user_name: data.body.user_name,
              email: data.body.email,
              encrypted_password: password,
              status: 0,
              role: 'user',
            },
            {transaction},
          );

          let accessToken = authService.generateAccessToken(createLoginInfo, createUser);
          let refreshToken = authService.generateRefreshToken(createLoginInfo, createUser);
          let accessTokenForActive = authService.generateTokenForActive(createLoginInfo);

          const content = `Click link to verify account:  <a href="${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}">${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}</a>`;
          await sendMail(createLoginInfo.email, content, 'ACTIVE ACCOUNT')
            .then(async () => {
              await transaction.commit();
              let findUser = await db.User.findOne({
                where: {user_id: createUser.user_id},
                raw: true,
              });
              findUser.status = 0;
              findUser.email = createLoginInfo.email;
              findUser.user_name = createLoginInfo.user_name;
              return resolve({
                messageCode: 1,
                message: 'successful registration!',
                accessToken,
                refreshToken,
                user: findUser,
              });
            })
            .catch(async (e) => {
              await transaction.rollback();
              console.log(e);
              return resolve({
                messageCode: 3,
                message: 'sent mail verify fail!',
              });
            });
        } else {
          return resolve({
            messageCode: 2,
            message: 'registered email or registered username!',
          });
        }
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'registration failed!',
        });
      }
    });
  },
  resolveVerifyUser: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        jwt.verify(req.body.access, process.env.VERIFY_TOKEN_KEY, async (err, data) => {
          if (err) {
            return resolve({
              messageCode: 3,
              message: 'token invalid!',
            });
          } else {
            await db.Login_info.findOne({
              where: {user_id: data.user_id},
            })
              .then((result) => {
                if (result.status == 1) {
                  return resolve({
                    messageCode: 2,
                    message: 'account activated!',
                  });
                }
                return result;
              })
              .then(async (result) => {
                result.status = 1;
                await result.save({transaction});
                await transaction.commit();
                let user = await db.User.findOne({
                  where: {
                    user_id: result.user_id,
                  },
                  raw: true,
                });
                user.email = result.email;
                user.status = result.status;
                let accessToken = authService.generateAccessToken(result, user);
                let refreshToken = authService.generateRefreshToken(result, user);
                return resolve({
                  messageCode: 1,
                  message: 'verify success!',
                  accessToken,
                  refreshToken,
                  user,
                });
              })
              .catch((e) => {
                console.log(e);
                return reject({
                  messageCode: 0,
                  message: 'verify fail!',
                });
              });
          }
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'verify fail!',
        });
      }
    });
  },
  generateAccessToken: (loginUser, infoUser) => {
    if (infoUser.avatar_image) {
      return jwt.sign(
        {
          user_id: loginUser.user_id,
          email: loginUser.email,
          role: loginUser.role,
          avatar_image: infoUser.avatar_image,
          status: loginUser.status,
        },
        process.env.ACCESS_TOKEN_KEY,
        {expiresIn: '84600s'},
      );
    } else {
      return jwt.sign(
        {
          user_id: loginUser.user_id,
          email: loginUser.email,
          role: loginUser.role,
          avatar_image: '',
          status: loginUser.status,
        },
        process.env.ACCESS_TOKEN_KEY,
        {expiresIn: '84600s'},
      );
    }
  },
  generateTokenForResetPassword: (email) => {
    return jwt.sign(
      {
        email: email,
      },
      process.env.RESET_PASS_KEY,
      {expiresIn: '84600s'},
    );
  },
  generateRefreshToken: (loginUser, infoUser) => {
    return jwt.sign(
      {
        user_id: loginUser.user_id,
        email: loginUser.email,
        role: loginUser.role,
      },
      process.env.REFRESH_TOKEN_KEY,
      {expiresIn: '365d'},
    );
  },
  generateTokenForActive: (loginUser) => {
    return jwt.sign(
      {
        user_id: loginUser.user_id,
        email: loginUser.email,
      },
      process.env.VERIFY_TOKEN_KEY,
      {expiresIn: '180s'},
    );
  },
  resolveLoginUser: async (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let email = data.body.email;
        let password = data.body.password;
        let findUser = await db.Login_info.findOne({
          where: {email: email},
          raw: true,
        });
        if (!findUser) {
          return resolve({
            messageCode: 3,
            message: 'email not found!',
          });
        } else {
          let checkPassword = await bcrypt.compare(password, findUser.encrypted_password);
          if (checkPassword == true) {
            let infoUser = await db.User.findOne({
              where: {user_id: findUser.user_id},
              raw: true,
            });
            if (infoUser.avatar_image) infoUser.avatar_image = getUrlImage(infoUser.avatar_image);
            if (infoUser.cover_image) infoUser.cover_image = getUrlImage(infoUser.cover_image);
            const accessToken = authService.generateAccessToken(findUser, infoUser);
            const refreshToken = authService.generateRefreshToken(findUser, infoUser);
            infoUser.status = findUser.status;
            infoUser.email = findUser.email;
            infoUser.user_name = findUser.user_name;
            return resolve({
              messageCode: 1,
              message: 'login success!',
              accessToken,
              refreshToken,
              user: infoUser,
            });
          } else {
            return resolve({
              messageCode: 2,
              message: 'password invalid!',
            });
          }
        }
      } catch (error) {
        console.log(error);
        reject({
          messageCode: 0,
          message: 'login fail!',
        });
      }
    });
  },
  resolveResetPassword: async (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let email = data.body.email;
        var user = await db.Login_info.findOne({
          where: {email: email},
        });
        if (!user) {
          return resolve({
            messageCode: 3,
            message: 'email invalid!',
          });
        } else {
          let accessTokenForResetPassword = authService.generateTokenForResetPassword(
            data.body.email,
          );
          const content = `Click link to change new password:  <a href="${process.env.BASE_URL_FRONTEND}/rspassword?access=${accessTokenForResetPassword}">${process.env.BASE_URL_FRONTEND}/rspassword?access=${accessTokenForResetPassword}</a>`;
          await sendMail(user.email, content, 'RESET PASSWORD')
            .then(async () => {
              return resolve({
                messageCode: 1,
                message: 'sent mail success!',
              });
            })
            .catch(async (e) => {
              console.log(e);
              return resolve({
                messageCode: 0,
                message: 'sent mail fail!',
              });
            });
        }
      } catch (error) {
        console.log(error);
        reject({
          messageCode: 0,
          message: 'sent mail fail!',
        });
      }
    });
  },
  resolveSavePassword: async (req) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let newPass = req.body.newPassword;
        let salt = await bcrypt.genSalt(10);
        let newEncryPassword = await bcrypt.hash(newPass, salt);

        let accessTokenForResetPassword = req.body.access;
        jwt.verify(accessTokenForResetPassword, process.env.RESET_PASS_KEY, async (err, data) => {
          if (err) {
            res.status(403).json('token invalid!');
          } else {
            let userEmail = data.email;
            let userInfo = await db.Login_info.findOne({
              where: {email: userEmail},
            });
            if (!userInfo) {
              return resolve({
                messageCode: 2,
                message: 'user not found!',
              });
            } else {
              userInfo.encrypted_password = newEncryPassword;
              await userInfo.save({transaction});
              await transaction.commit();
              return resolve({
                messageCode: 1,
                message: 'reset password success!',
              });
            }
          }
        });
      } catch (error) {
        console.log(error);
        await transaction.rollback();
        reject({
          messageCode: 0,
          message: 'reset password fail!',
        });
      }
    });
  },
  resolveChangePassword: async (data) => {
    return new Promise(async (resolve, reject) => {
      const transaction = await db.sequelize.transaction();
      try {
        let email = data.user.email;
        var user = await db.Login_info.findOne({
          where: {email: email},
        });
        if (!user) {
          return resolve({
            messageCode: 3,
            message: 'email invalid!',
          });
        } else {
          let password = data.body.password;
          let newPassword = data.body.newPassword;

          let checkPassword = await bcrypt.compare(password, user.encrypted_password);

          if (checkPassword == true) {
            let salt = await bcrypt.genSalt(10);
            let newEncyptPassword = await bcrypt.hash(newPassword, salt);
            user.encrypted_password = newEncyptPassword;
            await user.save({transaction});
            transaction.commit();
            return resolve({
              messageCode: 1,
              message: 'change password success!',
            });
          } else {
            return resolve({
              messageCode: 2,
              message: 'password invalid!',
            });
          }
        }
      } catch (error) {
        console.log(error);
        transaction.rollback();
        reject({
          messageCode: 0,
          message: 'change password fail!',
        });
      }
    });
  },
  example: async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
      } catch (error) {
        reject(error);
      }
    });
  },
  resolveReSentLink: async (req) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userLogin = await db.Login_info.findOne({
          where: {
            user_id: req.user.user_id,
          },
        });
        if (userLogin.status != 0) {
          return resolve({
            messageCode: 2,
            message: 'acount activated!',
          });
        }
        let accessTokenForActive = authService.generateTokenForActive(req.user);

        const content = `Click link to verify account:  <a href="${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}">${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}</a>`;
        await sendMail(req.user.email, content, 'ACTIVE ACCOUNT')
          .then(async (result) => {
            console.log(result);
            return resolve({
              messageCode: 1,
              message: 'sent email success!',
            });
          })
          .catch(async (e) => {
            console.log(e);
            return resolve({
              messageCode: 0,
              message: 'sent mail fail!',
            });
          });
      } catch (error) {
        console.log(error);
        reject({
          messageCode: 0,
          message: 'sent mail fail!',
        });
      }
    });
  },
  resolveLoginGoogle: async (req) => {
    return new Promise(async (resolve, reject) => {
      const userInfoGoogle = await axios
        .get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${req.body.token}`)
        .catch((err) => {
          throw err;
        });
      const transaction = await db.sequelize.transaction();
      try {
        const checkUserExit = await db.Login_info.findOne({
          where: {
            [Op.or]: [{email: userInfoGoogle.data.email}, {google_id: userInfoGoogle.data.sub}],
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
          return resolve(data);
        } else {
          let createUser = await db.User.create(
            {
              full_name: userInfoGoogle.data.name,
              avatar_image: process.env.AVATAR_KEY,
              cover_image: process.env.COVER_KEY,
              create_time: Date.now(),
            },
            {transaction},
          );
          let createLogininfo = await db.Login_info.create(
            {
              user_id: createUser.user_id,
              user_name: userInfoGoogle.data.name,
              google_id: userInfoGoogle.data.sub,
              email: userInfoGoogle.data.email,
              status: userInfoGoogle.data.email_verified ? 1 : 0,
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
          findUser.status = createLogininfo.status;
          findUser.email = createLogininfo.email;
          findUser.user_name = createLogininfo.user_name;
          let data = {
            messageCode: 1,
            message: 'login success!',
            accessToken,
            refreshToken,
            user: findUser,
          };

          return resolve(data);
        }
      } catch (error) {
        await transaction.rollback();
        console.log(error);
        return done(error, {
          messageCode: 0,
          message: 'login fail!',
        });
      }
    });
  },
  resolveLoginFacebook: async (req) => {
    return new Promise(async (resolve, reject) => {
      const userInfoFacebook = await axios
        .get(`https://graph.facebook.com/me?access_token=${req.body.token}`)
        .catch((err) => {
          throw err;
        });
      const transaction = await db.sequelize.transaction();
      try {
        const checkUserExit = await db.Login_info.findOne({
          where: {
            facebook_id: userInfoFacebook.data.id,
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
          return resolve(data);
        } else {
          let createUser = await db.User.create(
            {
              full_name: userInfoFacebook.data.name,
              avatar_image: process.env.AVATAR_KEY,
              cover_image: process.env.COVER_KEY,
              create_time: Date.now(),
            },
            {transaction},
          );
          let createLogininfo = await db.Login_info.create(
            {
              user_id: createUser.user_id,
              user_name: userInfoFacebook.data.name,
              facebook_id: userInfoFacebook.data.id,
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
          findUser.status = createLogininfo.status;
          findUser.email = createLogininfo.email;
          findUser.user_name = createLogininfo.user_name;
          let data = {
            messageCode: 1,
            message: 'login success!',
            accessToken,
            refreshToken,
            user: findUser,
          };

          return resolve(data);
        }
      } catch (error) {
        await transaction.rollback();
        console.log(error);
        return reject(error, {
          messageCode: 0,
          message: 'login fail!',
        });
      }
    });
  },
};

module.exports = authService;
