const authService = require('../services/authService')

const authController = {
    registerUser: async (req, res) => {
        try {
            let data = await authService.resolveRegisterUser(req.body);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json("dang ki ko thanh cong")
        }
    },
    loginUser: async (req, res) => {
        try {
            let data = await authService.resolveLoginUser(req.body);
            res.status(200).json(data)
        } catch (error) {
            res.status(500).json(error)
        }
    },
    getUser: async (req, res) => {
        try {
            let data = await authService.resolveGetUser();

            res.status(200).json(data);
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
    }

}

module.exports = authController;