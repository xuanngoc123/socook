const bcrypt = require("bcrypt");
const { promise, reject } = require("bcrypt/promises");
const db = require('../models/index')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");
const { getUrlImage } = require("../config/multer");

const authService = {
    resolveRegisterUser: async (data) => {
        return new Promise(async (resolve, reject) => {
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
                    let count = await db.User.max('user_id') + 1;
                    let createUser = await db.User.create({
                        // user_id: count,
                        create_time: Date.now(),
                    })
                    if (!createUser) {
                        resolve({
                            messageCode: 3,
                            message: 'user creation error!'
                        })
                    } else {
                        let createLoginInfo = await db.Login_info.create({
                            user_id: createUser.user_id,
                            user_name: data.body.user_name,
                            email: data.body.email,
                            encrypted_password: password,
                            role: 'user',
                        })
                        if (!createLoginInfo) {
                            resolve({
                                messageCode: 3,
                                message: 'user creation error!'
                            })
                        }
                        resolve({
                            messageCode: 1,
                            message: 'successful registration!'
                        });
                    }

                }
                else {
                    resolve({
                        messageCode: 2,
                        message: 'registered email!'
                    });
                }
            } catch (error) {
                console.log('register: ' + error);
                reject({
                    messageCode: 0,
                    message: 'registration failed!'
                });
            }
        })
    },
    generateAccessToken: (user) => {
        return jwt.sign({
            user_id: user.user_id,
            email: user.email,
            role: user.role,
        },
            process.env.ACCESS_TOKEN_KEY,
            { expiresIn: '84600s' }
        )
    },
    generateRefreshToken: (user) => {
        return jwt.sign({
            user_id: user.user_id,
            email: user.email,
            role: user.role,
        },
            process.env.REFRESH_TOKEN_KEY,
            { expiresIn: '365d' }
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
                    resolve({
                        messageCode: 3,
                        message: "email invalid!"
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
                        const accessToken = authService.generateAccessToken(findUser);
                        const refreshToken = authService.generateRefreshToken(findUser);
                        resolve({
                            messageCode: 1,
                            message: "login success!",
                            accessToken,
                            refreshToken,
                            user: infoUser
                        });
                    }
                    else {
                        resolve({
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
            try {
                let email = data.body.email;
                var user = await db.Login_info.findOne({
                    where: { email: email },
                });
                if (!user) {
                    resolve({
                        messageCode: 3,
                        message: "email invalid!"
                    })
                } else {
                    let randomstring = Math.random().toString(36).slice(-8);
                    let salt = await bcrypt.genSalt(10);
                    let newPassword = await bcrypt.hash(randomstring, salt);

                    // let testAccount = await nodemailer.createTestAccount();
                    let transporter = nodemailer.createTransport({
                        service: "Gmail",
                        auth: {
                            user: "xuanngochq2k@gmail.com",
                            pass: "xuanngocuet"
                        }
                    });

                    user.encrypted_password = newPassword;
                    let checkUpdatePass = await user.save();

                    if (!checkUpdatePass) {
                        resolve({
                            messageCode: 0,
                            message: "reset password fail!"
                        })
                    }
                    let info = await transporter.sendMail({
                        from: '"Cook Social" <admin>', // sender address
                        to: `${user.email}`, // list of receivers
                        subject: "Reset Password", // Subject line
                        text: "Đây là mật khẩu mới của bạn: ", // plain text body
                        html: `Đây là mật khẩu mới của bạn: ${randomstring}` // html body
                    });
                    if (info) {
                        resolve({
                            messageCode: 1,
                            message: "sent password success!",
                        });
                    } else {
                        resolve({
                            messageCode: 2,
                            message: "sent password fail!",
                        });
                    }

                }
            } catch (error) {
                console.log("err reset pass: " + error)
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
                    resolve({
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
                            resolve({
                                messageCode: 0,
                                message: "change password fail!"
                            })
                        } else {
                            resolve({
                                messageCode: 1,
                                message: "change password success!"
                            })
                        }
                    } else {
                        resolve({
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
    // resolveCheckToken: async (data) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let token = data.token;
    //             if (token) {
    //                 const accessToken = token.split(" ")[1];
    //                 jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY, (err, data) => {
    //                     if (err) {
    //                         res.status(403).json("token ko hop le");
    //                     }
    //                     req.user = data;
    //                     next();
    //                 })
    //             } else {
    //                 res.status(401).json("ban chua duoc xac thuc");
    //             }
    //         } catch (error) {
    //             reject(error)
    //         }
    //     })
    // },

    resolveDeleteUser: (userid) => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.user.findOne({
                    where: { id: userid },
                    raw: true,
                })
                if (data) {
                    await db.user.destroy({
                        where: { id: userid },
                    });
                    resolve("xoa thanh cong");
                } else {
                    resolve("id ko hop le");
                }

            } catch (error) {
                console.log(error)
                reject(error)
            }
        })
    },
    example: async () => {
        return new Promise(async (resolve, reject) => {
            try {

            } catch (error) {
                reject(error)
            }
        })
    },
}

module.exports = authService;