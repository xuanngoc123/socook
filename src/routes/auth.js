const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
let router = express.Router();
const authController = require('../controllers/authController');
const { validateAuth } = require('../middlewares/authValidate');

//register
router.post('/register', validateAuth.validateRegisterUser(), authController.registerUser);

router.put('/verify', validateAuth.validateVerifyUser(), authController.veryfiUser);

router.post('/resentlink', authMiddleware.veryfiToken, authController.reSentLink);

//login
router.post('/login', validateAuth.validateLogin(), authController.loginUser);


//change password
router.put('/changepassword', authMiddleware.veryfiToken, validateAuth.validateChangePassword(), authController.changePassword)


//fogot password
router.put('/resetpassword', validateAuth.validateResetPassword(), authController.resetPassword)

router.put('/savepassword', authController.savePassword)
// check token
router.get('/checktoken', authMiddleware.checkToken, (req, res) => {
    return res.status(200).json(req.result);
});


module.exports = router;