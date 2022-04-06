const { check } = require('express-validator');

let validateRegisterUser = () => {
  return [
    check('user_name', 'username does not Empty').not().isEmpty(),
    check('user_name', 'username more than 6 degits').isLength({ min: 6 }),
    check('email', 'Invalid does not Empty').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('password', 'Invalid does not Empty').not().isEmpty(),
    check('password', 'password more than 8 degits').isLength({ min: 8 })
  ];
}

let validateLogin = () => {
  return [
    check('email', 'Invalid does not Empty').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('password', 'password more than 8 degits').isLength({ min: 8 }),
    check('password', 'Invalid does not Empty').not().isEmpty(),
  ];
}

let validateChangePassword = () => {
  return [
    check('newPassword', 'new password more than 8 degits').isLength({ min: 8 }),
    check('newPassword', 'Invalid does not Empty').not().isEmpty(),
    check('password', 'password more than 8 degits').isLength({ min: 8 }),
    check('password', 'Invalid does not Empty').not().isEmpty(),
  ];
}

let validateResetPassword = () => {
  return [
    check('email', 'Invalid does not Empty').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
  ]
}

let validateVerifyUser = () => {
  return [
    check('access', 'Invalid does not Empty').not().isEmpty(),
  ];
}



let validateAuth = {
  validateRegisterUser: validateRegisterUser,
  validateLogin: validateLogin,
  validateChangePassword: validateChangePassword,
  validateResetPassword: validateResetPassword,
  validateVerifyUser: validateVerifyUser
};

module.exports = { validateAuth };