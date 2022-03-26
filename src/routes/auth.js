const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
let router = express.Router();
const authController = require('../controllers/authController')
//register
router.post('/register', authController.registerUser);
router.get('/register', authMiddleware.checkToken, (req, res) => {
    console.log(req.user);
});

//login
router.post('/login', authController.loginUser);

//change password
router.put('/changepassword', authMiddleware.veryfiToken, authController.changePassword)

//fogot password
router.put('/resetpassword', authController.resetPassword)

//check auth
router.get('/checkauth', authController.checkToken);

router.delete('/delete/:id', authMiddleware.veryfiTokenForDelete, authController.deleteUser);



module.exports = router;