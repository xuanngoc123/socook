const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
let router = express.Router();
const authController = require('../controllers/authController');
const { validateAuth } = require('../middlewares/authValidate');
const passport = require('../config/passport');

//register
router.post('/register', validateAuth.validateRegisterUser(), authController.registerUser);

router.put('/verify', validateAuth.validateVerifyUser(), authController.veryfiUser);

router.post('/resentlink', authMiddleware.veryfiToken, authController.reSentLink);

//login
router.post('/login', validateAuth.validateLogin(), authController.loginUser);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { successRedirect: `${process.env.BASE_URL_FRONTEND}/` }), (req, res) => {
    if (req.user) {
        res.status(200).json(req.user)

    } else {
        res.status(500).json({
            messageCode: 0,
            message: "login fail!",
        })
    }
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook'), (req, res) => {
    // if (req.user) {
    //     res.status(200).json(req.user)

    // } else {
    //     res.status(500).json({
    //         messageCode: 0,
    //         message: "login fail!",
    //     })
    // }
    console.log(req.user);
    res.send(req.user);

});

//change password
router.put('/changepassword', authMiddleware.veryfiTokenActive, validateAuth.validateChangePassword(), authController.changePassword)


//fogot password
router.put('/resetpassword', validateAuth.validateResetPassword(), authController.resetPassword)

router.put('/savepassword', authController.savePassword)
// check token
router.get('/checktoken', authMiddleware.checkToken, (req, res) => {
    return res.status(200).json(req.result);
});


module.exports = router;