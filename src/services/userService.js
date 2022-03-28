const { changeAvatar } = require('../controllers/userController')
const db = require('../models/index')

const userService = {
    resolveGetMyInfo: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.User.findOne({
                    where: { user_id: data.user.user_id },
                    raw: true
                })
                if (!user) {
                    resolve({
                        messageCode: 2,
                        message: 'user not found!'
                    })
                }
                resolve({
                    messageCode: 1,
                    message: 'get my info success!',
                    user: user,
                });
            } catch (error) {
                console.log("getMyInfo: " + error);
                reject({
                    messageCode: 0,
                    message: 'get my info fail!'
                })
            }
        })
    },
    resolveChangeMyInfo: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user_id = data.user.user_id;
                let user = await db.User.findOne({
                    where: { user_id: user_id },
                })
                if (!user) {
                    resolve({
                        messageCode: 2,
                        message: 'user not found!'
                    })
                }

                user.full_name = data.body.full_name;
                user.introduction = data.body.introduction;
                user.date_of_birth = data.body.date_of_birth;
                user.gender = data.body.gender;
                user.city = data.body.city;
                user.district = data.body.district;
                user.last_update = Date.now();

                let checkChangeMyInfo = await user.save();
                if (!checkChangeMyInfo) {
                    resolve({
                        messageCode: 0,
                        message: 'change info fali!'
                    })
                }
                resolve({
                    messageCode: 1,
                    message: 'change info success!'
                })
            } catch (error) {
                console.log("change my info" + error);
                reject(resolve({
                    messageCode: 0,
                    message: 'change info fali!'
                }))
            }
        })
    },
    resolveGetUserInfo: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.User.findOne({
                    where: { user_id: req.query.user_id },
                    raw: true,
                })
                if (!user) {
                    resolve({
                        messageCode: 2,
                        message: 'user not found!'
                    })
                }
                resolve({
                    messageCode: 1,
                    message: 'get user info success!',
                    user: user,
                });
            } catch (error) {
                reject({
                    messageCode: 0,
                    message: 'get user info fail!'
                })
            }
        })
    },
    resolveGetUserInfoByParams: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.User.findOne({
                    where: { user_id: req.params.user_id },
                    raw: true,
                })
                if (!user) {
                    resolve({
                        messageCode: 2,
                        message: 'user not found!'
                    })
                }
                resolve({
                    messageCode: 1,
                    message: 'get user info success!',
                    user: user,
                });
            } catch (error) {
                reject({
                    messageCode: 0,
                    message: 'get user info fail!'
                })
            }
        })
    },
    resolveChangeAvatar: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user_id = req.user.user_id;
                let user = await db.User.findOne({
                    where: { user_id: user_id }
                })
                if (!user) {
                    resolve({
                        messageCode: 2,
                        message: 'user not found!'
                    })
                }
                const host = req.hostname;
                const filePath = req.protocol + "://" + host + '/uploads/' + req.file.filename;
                user.avatar_image = filePath;
                let checkChangeAvatar = await user.save();
                if (!checkChangeAvatar) {
                    reject({
                        messageCode: 0,
                        message: 'change avatar fail!'
                    })
                }
                else {
                    resolve({
                        messageCode: 1,
                        message: 'change avatar success!'
                    })
                }
            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'change avatar fail!'
                })
            }
        })
    },
    resolveChangeCoverImage: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user_id = req.user.user_id;
                let user = await db.User.findOne({
                    where: { user_id: user_id }
                })
                if (!user) {
                    resolve({
                        messageCode: 2,
                        message: 'user not found!'
                    })
                }
                const host = req.hostname;
                const filePath = req.protocol + "://" + host + '/uploads/' + req.file.filename;
                user.cover_image = filePath;
                let checkChangeAvatar = await user.save();
                if (!checkChangeAvatar) {
                    reject({
                        messageCode: 0,
                        message: 'change avatar fail!'
                    })
                }
                else {
                    resolve({
                        messageCode: 1,
                        message: 'change avatar success!'
                    })
                }
            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'change avatar fail!'
                })
            }
        })
    },
}

module.exports = userService