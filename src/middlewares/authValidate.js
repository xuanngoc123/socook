const { check } = require('express-validator');

let validateRegisterUser = () => {
  return [
    check('user.username', 'username does not Empty').not().isEmpty(),
    check('user.username', 'username more than 6 degits').isLength({ min: 6 }),
    check('user.email', 'Invalid does not Empty').not().isEmpty(),
    check('user.email', 'Invalid email').isEmail(),
    check('user.password', 'Invalid does not Empty').not().isEmpty(),
    check('user.password', 'password more than 8 degits').isLength({ min: 8 })
  ];
}

let validateLogin = () => {
  return [
    check('user.email', 'Invalid does not Empty').not().isEmpty(),
    check('user.email', 'Invalid email').isEmail(),
    check('user.password', 'password more than 6 degits').isLength({ min: 6 })
  ];
}

let validate = {
  validateRegisterUser: validateRegisterUser,
  validateLogin: validateLogin
};

module.exports = { validate };