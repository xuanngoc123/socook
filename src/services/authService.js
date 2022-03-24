const bcrypt = require("bcrypt");
const { promise, reject } = require("bcrypt/promises");
const db = require('../models/index')
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer");

const authService = {
    resolveRegisterUser: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const email = data.email;
                let findUser = await db.Login_info.findOne({
                    attributes: { email },
                    where: { email: email },
                    raw: true,
                });
                if (!findUser) {
                    let salt = await bcrypt.genSalt(10);
                    let password = await bcrypt.hash(data.password, salt);
                    let count = await db.User.max('user_id') + 1;
                    let createUser = await db.User.create({
                        user_id: count,
                    })
                    if (!createUser) {
                        resolve({
                            messageCode: 3,
                            message: 'user creation error!'
                        })
                    } else {
                        let createLoginInfo = await db.Login_info.create({
                            user_id: count,
                            user_name: data.user_name,
                            email: data.email,
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
            { expiresIn: '600s' }
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
                let email = data.email;
                let password = data.password;
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
                let email = data.email;
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
                        from: '"Cook Social"', // sender address
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
                let email = data.email;
                var user = await db.Login_info.findOne({
                    where: { email: email },
                });
                if (!user) {
                    resolve({
                        messageCode: 3,
                        message: "email invalid!"
                    })
                } else {
                    let password = data.password;
                    let newPassword = data.newPassword;

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
    resolveGetUser: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.user.findAll({
                    raw: true
                })
                resolve(data);
            } catch (error) {
                reject(error)
            }
        })
    },
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