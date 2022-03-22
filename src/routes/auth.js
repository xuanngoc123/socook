const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
let router = express.Router();
const authController = require('../controllers/authController')

router.post('/register', authController.registerUser);
router.get('/register', authMiddleware.checkToken, (req, res) => {
    console.log(req.user);
});
router.post('/login', authController.loginUser);
router.get('/user', authMiddleware.veryfiToken, authController.getUser);
router.delete('/delete/:id', authMiddleware.veryfiAdminToken, authController.deleteUser);

module.exports = router;