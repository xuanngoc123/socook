const { validationResult } = require('express-validator');
const authService = require('../services/authService')

const authController = {
    registerUser: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            let data = await authService.resolveRegisterUser(req);
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    loginUser: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            let data = await authService.resolveLoginUser(req);
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    resetPassword: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            let data = await authService.resolveResetPassword(req);
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    savePassword: async (req, res) => {
        try {
            let data = await authService.resolveSavePassword(req);
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    changePassword: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            let data = await authService.resolveChangePassword(req);
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    veryfiUser: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            let data = await authService.resolveVerifyUser(req);
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    reSentLink: async (req, res) => {
        try {
            let data = await authService.resolveReSentLink(req);
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json(error)
        }
    },
}

module.exports = authController;