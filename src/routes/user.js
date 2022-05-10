const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const userController = require('../controllers/userController');
const { upload } = require('../config/multer');
let router = express.Router();

//get my info
router.get('/myinfo', authMiddleware.veryfiToken, userController.getMyInfo);

//update info
router.put('/changemyinfo', authMiddleware.veryfiToken, userController.changeMyInfo);

//get user info by query user_id
router.get('/userinfo', authMiddleware.checkToken, userController.getUserInfo);

//change avater image 
router.post('/avatar', authMiddleware.veryfiToken, upload.single('image'), userController.changeAvatar)

//change cover image
router.post('/coverimage', authMiddleware.veryfiToken, upload.single('image'), userController.changeCoverImage)

//get top đầu bếp
router.get('/topuser', userController.getTopUser);

module.exports = router;