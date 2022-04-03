const { getUrlImage } = require('../config/multer')
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
                let keyImgAvt = user.avatar_image;
                let keyImgCover = user.cover_image;

                if (user.avatar_image) user.avatar_image = getUrlImage(keyImgAvt);
                if (user.cover_image) user.cover_image = getUrlImage(keyImgCover);
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
                let keyImgAvt = user.avatar_image;
                let keyImgCover = user.cover_image;

                if (user.avatar_image) user.avatar_image = getUrlImage(keyImgAvt);
                if (user.cover_image) user.cover_image = getUrlImage(keyImgCover);
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
                } else {
                    let result = req.file;
                    if (!result) {
                        resolve({
                            messageCode: 3,
                            message: 'upload image fail!'
                        })
                    }
                    else {
                        user.avatar_image = result.key;
                        let checkChangeAvatar = await user.save();
                        if (!checkChangeAvatar) {
                            reject({
                                messageCode: 0,
                                message: 'change image fail!'
                            })
                        }
                        else {
                            resolve({
                                messageCode: 1,
                                message: 'change image success!'
                            })
                        }
                    }
                }
            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'change image fail!'
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
                } else {
                    let result = req.file;
                    if (!result) {
                        resolve({
                            messageCode: 3,
                            message: 'upload image fail!'
                        })
                    }
                    else {
                        user.cover_image = result.key;
                        let checkChangImage = await user.save();
                        if (!checkChangImage) {
                            reject({
                                messageCode: 0,
                                message: 'change image fail!'
                            })
                        }
                        else {
                            resolve({
                                messageCode: 1,
                                message: 'change image success!'
                            })
                        }
                    }
                }
            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'change image fail!'
                })
            }
        })
    },
}

module.exports = userService