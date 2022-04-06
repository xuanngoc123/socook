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
                let keyImgAvt = user.avatar_image;
                let keyImgCover = user.cover_image;

                if (user.avatar_image) user.avatar_image = getUrlImage(keyImgAvt);
                if (user.cover_image) user.cover_image = getUrlImage(keyImgCover);
                return resolve({
                    messageCode: 1,
                    message: 'get my info success!',
                    user: user,
                });
            } catch (error) {
                console.log(error);
                reject({
                    messageCode: 0,
                    message: 'get my info fail!'
                })
            }
        })
    },
    resolveChangeMyInfo: async (data) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                let user_id = data.user.user_id;
                let user = await db.User.findOne({
                    where: { user_id: user_id },
                })

                if (data.body.full_name) user.full_name = data.body.full_name;
                if (data.body.introduction) user.introduction = data.body.introduction;
                if (data.body.date_of_birth) user.date_of_birth = data.body.date_of_birth;
                if (data.body.gender) user.gender = data.body.gender;
                if (data.body.city) user.city = data.body.city;
                if (data.body.district) user.district = data.body.district;
                user.last_update = Date.now();

                await user.save({ transaction });
                await transaction.commit();
                return resolve({
                    messageCode: 1,
                    message: 'change info success!'
                })
            } catch (error) {
                console.log(error);
                await transaction.rollback();
                reject({
                    messageCode: 0,
                    message: 'change info fali!'
                })
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
                    return resolve({
                        messageCode: 2,
                        message: 'user not found!'
                    })
                }
                let keyImgAvt = user.avatar_image;
                let keyImgCover = user.cover_image;

                if (user.avatar_image) user.avatar_image = getUrlImage(keyImgAvt);
                if (user.cover_image) user.cover_image = getUrlImage(keyImgCover);
                return resolve({
                    messageCode: 1,
                    message: 'get user info success!',
                    user: user,
                });
            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'get user info fail!'
                })
            }
        })
    },
    resolveChangeAvatar: async (req) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                let user_id = req.user.user_id;
                let user = await db.User.findOne({
                    where: { user_id: user_id }
                })

                let result = req.file;
                if (!result) {
                    return resolve({
                        messageCode: 2,
                        message: 'upload image fail!'
                    })
                }
                else {
                    user.avatar_image = result.key;
                    await user.save({ transaction });
                    await transaction.commit();
                    return resolve({
                        messageCode: 1,
                        message: 'change image success!'
                    })

                }

            } catch (error) {
                console.log(error)
                await transaction.rollback()
                reject({
                    messageCode: 0,
                    message: 'change image fail!'
                })
            }
        })
    },
    resolveChangeCoverImage: async (req) => {
        return new Promise(async (resolve, reject) => {
            const transaction = await db.sequelize.transaction();
            try {
                let user_id = req.user.user_id;
                let user = await db.User.findOne({
                    where: { user_id: user_id }
                })

                let result = req.file;
                if (!result) {
                    return resolve({
                        messageCode: 2,
                        message: 'upload image fail!'
                    })
                }
                else {
                    user.cover_image = result.key;
                    await user.save({ transaction });
                    await transaction.commit();
                    return resolve({
                        messageCode: 1,
                        message: 'change image success!'
                    })
                }
            } catch (error) {
                console.log(error)
                await transaction.rollback();
                reject({
                    messageCode: 0,
                    message: 'change image fail!'
                })
            }
        })
    },
}

module.exports = userService