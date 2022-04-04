const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
let router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/authValidate');

//register
router.post('/register', validate.validateRegisterUser(), authController.registerUser);


//login
router.post('/login', validate.validateLogin(), authController.loginUser);


//change password
router.put('/changepassword', authMiddleware.veryfiToken, validate.validateChangePassword(), authController.changePassword)


//fogot password
router.put('/resetpassword', validate.validateResetPassword(), authController.resetPassword)

// check token
router.get('/checktoken', authMiddleware.checkToken, (req, res) => {
    res.status(200).json(req.result);
});


module.exports = router;