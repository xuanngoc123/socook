const { getUrlImage } = require('../config/multer')
const db = require('../models/index')

const userService = {
    getNumberOfFollow: async (user_id) => {
        const [countFollow] = await db.sequelize.query(
            `SELECT COUNT(follow_user_id) AS number_of_followers FROM follow WHERE follow.followed_user_id = ${user_id} GROUP by followed_user_id`
        )
        console.log(countFollow[0].number_of_followers);
        return countFollow[0].number_of_followers;
    },
    resolveGetMyInfo: async (data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await db.User.findOne({
                    where: { user_id: data.user.user_id },
                    raw: true
                })
                let userLoginInfo = await db.Login_info.findOne({
                    where: {
                        user_id: user.user_id
                    },
                    raw: true
                })

                user.avatar_image = getUrlImage(user.avatar_image);
                user.cover_image = getUrlImage(user.cover_image);
                user.email = userLoginInfo.email;
                user.user_name = userLoginInfo.user_name;
                const [countFollow] = await db.sequelize.query(
                    `SELECT COUNT(follow_user_id) AS number_of_followers FROM follow WHERE follow.followed_user_id = ${user.user_id} GROUP by followed_user_id`
                )
                if (countFollow.length != 0) {
                    user.countFollow = countFollow[0].number_of_followers
                } else {
                    user.countFollow = 0;
                }
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

                let userReturn = await db.User.findOne({
                    where: { user_id: user_id },
                    raw: true
                })
                let login_info = await db.Login_info.findOne({
                    where: { user_id: user_id },
                })
                userReturn.avatar_image = getUrlImage(userReturn.avatar_image);
                userReturn.cover_image = getUrlImage(userReturn.cover_image);
                userReturn.status = login_info.status;
                userReturn.email = login_info.email;
                userReturn.user_name = login_info.user_name;
                return resolve({
                    messageCode: 1,
                    message: 'change info success!',
                    user: userReturn
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
                if (req.query.user_name) {
                    var userLogin = await db.Login_info.findOne({
                        where: { user_name: req.query.user_name },
                        raw: true,
                    })
                    if (userLogin) {
                        var user = await db.User.findOne({
                            where: { user_id: userLogin.user_id },
                            raw: true,
                        })
                    }
                } else if (req.query.user_id) {
                    var user = await db.User.findOne({
                        where: { user_id: req.query.user_id },
                        raw: true,
                    })
                }
                if (!user) {
                    return resolve({
                        messageCode: 2,
                        message: 'user not found!'
                    })
                }

                if (req.result.user == null || req.result.user == undefined) {
                    var followed = null;

                } else {
                    let checkFollow = await db.Follow.findOne({
                        where: {
                            followed_user_id: user.user_id,
                            follow_user_id: req.result.user.user_id
                        }
                    })
                    followed = 0
                    if (checkFollow) {
                        followed = 1
                    }
                }

                let userLoginInfo = await db.Login_info.findOne({
                    where: {
                        user_id: user.user_id
                    },
                    raw: true
                })

                user.avatar_image = getUrlImage(user.avatar_image);
                user.cover_image = getUrlImage(user.cover_image);

                user.followed = followed
                user.email = userLoginInfo.email;
                user.user_name = userLoginInfo.user_name;

                const [countFollow] = await db.sequelize.query(
                    `SELECT COUNT(follow_user_id) AS number_of_followers FROM follow WHERE follow.followed_user_id = ${user.user_id} GROUP by followed_user_id`
                )
                if (countFollow.length != 0) {
                    user.countFollow = countFollow[0].number_of_followers
                } else {
                    user.countFollow = 0;
                }

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
                        message: 'upload image fail!',
                    })
                }
                else {
                    user.avatar_image = result.key;
                    await user.save({ transaction });
                    await transaction.commit();

                    let userReturn = await db.User.findOne({
                        where: { user_id: user_id },
                        raw: true
                    })
                    let login_info = await db.Login_info.findOne({
                        where: { user_id: user_id },
                        raw: true
                    })
                    userReturn.avatar_image = getUrlImage(userReturn.avatar_image);
                    userReturn.cover_image = getUrlImage(userReturn.cover_image);
                    userReturn.status = login_info.status;
                    userReturn.email = login_info.email;
                    userReturn.user_name = login_info.user_name;
                    return resolve({
                        messageCode: 1,
                        message: 'change image success!',
                        user: userReturn
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
                        message: 'upload image fail!',
                    })
                }
                else {
                    user.cover_image = result.key;
                    await user.save({ transaction });
                    await transaction.commit();
                    let userReturn = await db.User.findOne({
                        where: { user_id: user_id },
                        raw: true
                    })
                    let login_info = await db.Login_info.findOne({
                        where: { user_id: user_id },
                        raw: true
                    })
                    userReturn.avatar_image = getUrlImage(userReturn.avatar_image);
                    userReturn.cover_image = getUrlImage(userReturn.cover_image);
                    userReturn.status = login_info.status;
                    userReturn.email = login_info.email;
                    userReturn.user_name = login_info.user_name;
                    return resolve({
                        messageCode: 1,
                        message: 'change image success!',
                        user: userReturn
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
    resolveGetTopUser: async (req) => {
        return new Promise(async (resolve, reject) => {
            try {
                let limit = req.query.limit;
                const [countFollow] = await db.sequelize.query(
                    `SELECT follow.followed_user_id, COUNT(follow_user_id) AS number_of_followers FROM follow GROUP by followed_user_id ORDER BY COUNT(follow_user_id) DESC LIMIT ${limit}`
                )
                var arr = []
                for (let i = 0; i < countFollow.length; i++) {
                    arr.push(countFollow[i].followed_user_id)
                }
                let topUser = await db.User.findAll({
                    where: {
                        user_id: arr
                    },
                    raw: true
                })
                for (let i = 0; i < topUser.length; i++) {
                    topUser[i].number_of_followers = countFollow[i].number_of_followers;
                    topUser[i].avatar_image = getUrlImage(topUser[i].avatar_image);
                    topUser[i].cover_image = getUrlImage(topUser[i].cover_image);
                }
                return resolve({
                    messageCode: 1,
                    message: 'get top user success!',
                    data: topUser
                })
            } catch (error) {
                console.log(error)
                reject({
                    messageCode: 0,
                    message: 'get top user fail!'
                })
            }
        })
    },
}

module.exports = userService