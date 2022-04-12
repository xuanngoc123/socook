const bcrypt = require("bcrypt");
const db = require('../models/index')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
const { getUrlImage } = require("../config/multer");
const sendMail = require("../config/nodemailer");

const authService = {
    resolveRegisterUser: async (data) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                const email = data.body.email;
                let findUser = await db.Login_info.findOne({
                    attributes: { email },
                    where: { email: email },
                    raw: true,
                });
                if (!findUser) {
                    let salt = await bcrypt.genSalt(10);
                    let password = await bcrypt.hash(data.body.password, salt);
                    let createUser = await db.User.create({
                        create_time: Date.now(),
                    }, { transaction })

                    let createLoginInfo = await db.Login_info.create({
                        user_id: createUser.user_id,
                        user_name: data.body.user_name,
                        email: data.body.email,
                        encrypted_password: password,
                        status: 0,
                        role: 'user',
                    }, { transaction })

                    let accessToken = authService.generateAccessToken(createLoginInfo, createUser)
                    let refreshToken = authService.generateRefreshToken(createLoginInfo, createUser)
                    let accessTokenForActive = authService.generateTokenForActive(createLoginInfo);

                    // let transporter = nodemailer.createTransport({
                    // service: "Gmail",
                    // auth: {
                    //     user: process.env.EMAIL_USER,
                    //     pass: process.env.EMAIL_PASSWORD
                    // }
                    // });
                    // let info = await transporter.sendMail({
                    //     from: '"Cook Social"<admin>', // sender address
                    //     to: `${createLoginInfo.email}`, // list of receivers
                    //     subject: "Active Account", // Subject line
                    //     // text: "Click link to verify account: ", // plain text body
                    //     html: `Click link to verify account:  <a href="${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}">${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}</a>` // html body
                    // })
                    const content = `Click link to verify account:  <a href="${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}">${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}</a>`
                    await sendMail(createLoginInfo.email, content)
                        .then(async () => {
                            await transaction.commit();
                            let findUser = await db.User.findOne({
                                where: { user_id: createUser.user_id },
                                raw: true
                            })
                            findUser.status = 0;
                            findUser.email = createLoginInfo.email;
                            return resolve({
                                messageCode: 1,
                                message: 'successful registration!',
                                accessToken,
                                refreshToken,
                                user: findUser
                            });
                        }).catch(async (e) => {
                            await transaction.rollback();
                            console.log(e)
                            return resolve({
                                messageCode: 3,
                                message: "sent mail verify fail!",
                            });
                        })
                }
                else {
                    return resolve({
                        messageCode: 2,
                        message: 'registered email!'
                    });
                }
            } catch (error) {
                console.log(error);
                await transaction.rollback();
                reject({
                    messageCode: 0,
                    message: 'registration failed!'
                });
            }
        })
    },
    resolveVerifyUser: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                jwt.verify(req.body.access, process.env.VERIFY_TOKEN_KEY, async (err, data) => {
                    if (err) {
                        return resolve({
                            messageCode: 0,
                            message: 'verify fail!'
                        })
                    } else {
                        let findLoginInfo = await db.Login_info.findOne({
                            where: { user_id: data.user_id }
                        })
                        if (findLoginInfo == 1) {
                            return resolve({
                                messageCode: 2,
                                message: 'account activated!',
                            })
                        }
                        findLoginInfo.status = 1;
                        await findLoginInfo.save();
                        return resolve({
                            messageCode: 1,
                            message: 'verify success!',
                        })
                    }

                })
            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'verify fail!'
                })
            }
        })
    },
    generateAccessToken: (loginUser, infoUser) => {
        if (infoUser.avatar_image) {
            return jwt.sign({
                user_id: loginUser.user_id,
                email: loginUser.email,
                role: loginUser.role,
                avatar_image: infoUser.avatar_image,
                status: loginUser.status
            },
                process.env.ACCESS_TOKEN_KEY,
                { expiresIn: '84600s' }
            )
        } else {
            return jwt.sign({
                user_id: loginUser.user_id,
                email: loginUser.email,
                role: loginUser.role,
                avatar_image: '',
                status: loginUser.status
            },
                process.env.ACCESS_TOKEN_KEY,
                { expiresIn: '84600s' }
            )
        }

    },
    generateRefreshToken: (loginUser, infoUser) => {
        return jwt.sign({
            user_id: loginUser.user_id,
            email: loginUser.email,
            role: loginUser.role,
        },
            process.env.REFRESH_TOKEN_KEY,
            { expiresIn: '365d' }
        )
    },
    generateTokenForActive: (loginUser) => {
        return jwt.sign({
            user_id: loginUser.user_id,
            email: loginUser.email,
        },
            process.env.VERIFY_TOKEN_KEY,
            { expiresIn: '180s' }
        )
    },
    resolveLoginUser: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let email = data.body.email;
                let password = data.body.password;
                let findUser = await db.Login_info.findOne({
                    where: { email: email },
                    raw: true,
                });
                if (!findUser) {
                    return resolve({
                        messageCode: 3,
                        message: "email not found!"
                    })
                } else {
                    let checkPassword = await bcrypt.compare(password, findUser.encrypted_password);
                    if (checkPassword == true) {
                        let infoUser = await db.User.findOne({
                            where: { user_id: findUser.user_id },
                            raw: true,
                        })
                        if (infoUser.avatar_image) infoUser.avatar_image = getUrlImage(infoUser.avatar_image);
                        if (infoUser.cover_image) infoUser.cover_image = getUrlImage(infoUser.cover_image);
                        const accessToken = authService.generateAccessToken(findUser, infoUser);
                        const refreshToken = authService.generateRefreshToken(findUser, infoUser);
                        infoUser.status = findUser.status;
                        infoUser.email = findUser.email;
                        return resolve({
                            messageCode: 1,
                            message: "login success!",
                            accessToken,
                            refreshToken,
                            user: infoUser
                        });
                    }
                    else {
                        return resolve({
                            messageCode: 2,
                            message: "password invalid!"
                        })
                    }
                }

            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: "login fail!"
                })
            }
        })
    },
    resolveResetPassword: async (data) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                let email = data.body.email;
                var user = await db.Login_info.findOne({
                    where: { email: email },
                });
                if (!user) {
                    return resolve({
                        messageCode: 3,
                        message: "email invalid!"
                    })
                } else {
                    let randomstring = Math.random().toString(36).slice(-8);
                    let salt = await bcrypt.genSalt(10);
                    let newPassword = await bcrypt.hash(randomstring, salt);

                    // let testAccount = await nodemailer.createTestAccount();
                    // let transporter = nodemailer.createTransport({
                    //     service: "Gmail",
                    //     auth: {
                    //         user: process.env.EMAIL_USER,
                    //         pass: process.env.EMAIL_PASSWORD
                    //     }
                    // });

                    user.encrypted_password = newPassword;
                    let checkUpdatePass = await user.save({ transaction });

                    // let info = await transporter.sendMail({
                    //     from: '"Cook Social"', // sender address
                    //     to: `${user.email}`, // list of receivers
                    //     subject: "Reset Password", // Subject line
                    //     text: "Đây là mật khẩu mới của bạn: ", // plain text body
                    //     html: `Đây là mật khẩu mới của bạn: ${randomstring}` // html body
                    // })
                    const content = `Đây là mật khẩu mới của bạn: ${randomstring}`;
                    await sendMail(user.email, content)
                        .then(async () => {
                            await transaction.commit();
                            return resolve({
                                messageCode: 1,
                                message: "sent password success!",
                            });
                        }).catch(async (e) => {
                            await transaction.rollback();
                            console.log(e)
                            return resolve({
                                messageCode: 2,
                                message: "sent password fail!",
                            });
                        })
                    // await transaction.commit();
                    // if (info) {

                    // } else {

                    // }

                }
            } catch (error) {
                console.log(error)
                await transaction.rollback();
                reject({
                    messageCode: 0,
                    message: "reset password fail!"
                })
            }
        })
    },
    resolveChangePassword: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let email = data.user.email;
                var user = await db.Login_info.findOne({
                    where: { email: email },
                });
                if (!user) {
                    return resolve({
                        messageCode: 3,
                        message: "email invalid!"
                    })
                } else {
                    let password = data.body.password;
                    let newPassword = data.body.newPassword;

                    let checkPassword = await bcrypt.compare(password, user.encrypted_password);

                    if (checkPassword == true) {
                        let salt = await bcrypt.genSalt(10);
                        let newEncyptPassword = await bcrypt.hash(newPassword, salt);
                        user.encrypted_password = newEncyptPassword;
                        let checkChangePass = await user.save();
                        if (!checkChangePass) {
                            return resolve({
                                messageCode: 0,
                                message: "change password fail!"
                            })
                        } else {
                            return resolve({
                                messageCode: 1,
                                message: "change password success!"
                            })
                        }
                    } else {
                        return resolve({
                            messageCode: 2,
                            message: "password invalid!"
                        })
                    }
                }

            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: "change password fail!"
                })
            }
        })
    },
    example: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {

            } catch (error) {
                reject(error)
            }
        })
    },
    resolveReSentLink: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let accessTokenForActive = authService.generateTokenForActive(req.user)
                // let transporter = nodemailer.createTransport({
                //     service: "Gmail",
                //     auth: {
                //         user: process.env.EMAIL_USER,
                //         pass: process.env.EMAIL_PASSWORD
                //     }
                // });
                // let info = await transporter.sendMail({
                //     from: '"Cook Social"<admin>', // sender address
                //     to: `${req.user.email}`, // list of receivers
                //     subject: "Active Account", // Subject line
                //     // text: "Click link to verify account: ", // plain text body
                //     html: `Click link to verify account:  <a href="${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}">${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}</a>` // html body
                // })
                const content = `Click link to verify account:  <a href="${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}">${process.env.BASE_URL_FRONTEND}/verify?access=${accessTokenForActive}</a>`
                await sendMail(req.user.email, content)
                    .then(async () => {
                        return resolve({
                            messageCode: 1,
                            message: 'sent email success!',
                            // accessToken
                        });
                    }).catch(async (e) => {
                        console.log(e)
                        return resolve({
                            messageCode: 0,
                            message: "sent mail fail!",
                        });
                    })
            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: "sent mail fail!",
                })
            }
        })
    },
}

module.exports = authService;