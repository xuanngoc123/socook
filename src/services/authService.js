const bcrypt = require("bcrypt");
const { promise, reject } = require("bcrypt/promises");
const db = require('../models/index')
const jwt = require('jsonwebtoken')
const authService = {
    resolveRegisterUser: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                const email = data.email;
                let salt = await bcrypt.genSalt(10);
                let password = await bcrypt.hash(data.password, salt);

                let findUser = await db.User.findOne({
                    where: { email: email },
                    raw: true,
                });
                if (!findUser) {
                    await db.User.create({
                        user_name: data.name,
                        email: data.email,
                        encrypted_password: password,
                        role_id: 'user',
                    })
                    resolve("dang ki thanh cong");
                }
                else {
                    resolve("email da duoc dang ki");
                }
            } catch (error) {
                reject(error);
            }
        })
    },
    resolveLoginUser: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let emailUser = data.email;
                let password = data.password;
                let findUser = await db.User.findOne({
                    where: { email: emailUser },
                    raw: true,
                });
                if (!findUser) {
                    resolve({ message: "tai khoan khong dung" })
                } else {
                    let checkPassword = await bcrypt.compare(password, findUser.encrypted_password);
                    if (checkPassword == true) {
                        const accessToken = jwt.sign({
                            id: findUser.id,
                            email: findUser.email,
                            role_id: findUser.role_id,
                        },
                            process.env.ACCESS_TOKEN_KEY,
                            { expiresIn: '600s' }
                        )

                        resolve({ message: "dang nhap thanh cong", accessToken, user: findUser });
                    }
                    else {
                        resolve({ message: "mat khau khong dung" })
                    }
                }

            } catch (error) {
                console.log(error)
                reject(error)
            }
        })
    },
    resolveGetUser: async () => {
        return new Promise(async (resolve, reject) => {
            try {
                let data = await db.User.findAll({
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
                let data = await db.User.findOne({
                    where: { id: userid },
                    raw: true,
                })
                if (data) {
                    await db.User.destroy({
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