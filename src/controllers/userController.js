const userService = require('../services/userService')
const userController = {
    getMyInfo: async (req, res) => {
        try {
            let data = await userService.resolveGetMyInfo(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    changeMyInfo: async (req, res) => {
        try {
            let data = await userService.resolveChangeMyInfo(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    getUserInfo: async (req, res) => {
        try {
            let data = await userService.resolveGetUserInfo(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    getUserInfoByParams: async (req, res) => {
        try {
            let data = await userService.resolveGetUserInfoByParams(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    changeAvatar: async (req, res) => {
        try {
            let data = await userService.resolveChangeAvatar(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    changeCoverImage: async (req, res) => {
        try {
            let data = await userService.resolveChangeCoverImage(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },

}

module.exports = userController