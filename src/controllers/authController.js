const authService = require('../services/authService')

const authController = {
    registerUser: async (req, res) => {
        try {
            let data = await authService.resolveRegisterUser(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    loginUser: async (req, res) => {
        try {
            let data = await authService.resolveLoginUser(req);
            res.status(200).json(data)
        } catch (error) {
            res.status(500).json(error)
        }
    },
    deleteUser: async (req, res) => {
        try {
            let id = req.params.id;
            let data = await authService.resolveDeleteUser(id);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    resetPassword: async (req, res) => {
        try {
            let data = await authService.resolveResetPassword(req);
            res.status(200).json(data)
        } catch (error) {
            res.status(500).json(error)
        }
    },
    changePassword: async (req, res) => {
        try {
            let data = await authService.resolveChangePassword(req);
            res.status(200).json(data)
        } catch (error) {
            res.status(500).json(error)
        }
    },
    checkToken: async (req, res) => {
        try {
            let data = await authService.resolveCheckToken(req.headers);
            res.status(200).json(data)
        } catch (error) {
            res.status(500).json(error)
        }
    },

}

module.exports = authController;