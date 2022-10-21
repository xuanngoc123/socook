const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
let router = express.Router();
const authController = require('../controllers/authController');
const {validateAuth} = require('../middlewares/authValidate');
const passport = require('../config/passport');

//register
router.post('/register', validateAuth.validateRegisterUser(), authController.registerUser);

router.put('/verify', validateAuth.validateVerifyUser(), authController.veryfiUser);

router.post('/resentlink', authMiddleware.veryfiToken, authController.reSentLink);

//login
router.post('/login', validateAuth.validateLogin(), authController.loginUser);

router.post('/login-google', authController.loginGoogle);

router.post('/login-facebook', authController.loginFacebook);

const successLoginUrl = 'http://localhost:3000/login/success';
const errorLoginUrl = 'http://localhost:3000/login/error';

router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/google/callback', passport.authenticate('google'), (req, res) => {
  console.log(req.user);
  res.json(req.user);
});

router.get('/facebook', passport.authenticate('facebook', {scope: ['email']}));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
  }),
  (req, res) => {
    console.log(req.user);
    res.json(req.user);
  },
);

//change password
router.put(
  '/changepassword',
  authMiddleware.veryfiTokenActive,
  validateAuth.validateChangePassword(),
  authController.changePassword,
);

//fogot password
router.put('/resetpassword', validateAuth.validateResetPassword(), authController.resetPassword);

router.put('/savepassword', authController.savePassword);
// check token
router.get('/checktoken', authMiddleware.checkToken, (req, res) => {
  return res.status(200).json(req.result);
});

module.exports = router;
