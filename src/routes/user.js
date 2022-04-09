const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const userController = require('../controllers/userController');
const { upload } = require('../config/multer');
let router = express.Router();

//get my info
router.get('/my-info', authMiddleware.veryfiToken, userController.getMyInfo);

//update info
router.put('/change-my-info', authMiddleware.veryfiToken, userController.changeMyInfo);

//get user info by query user_id
router.get('/user-info', userController.getUserInfo);

//change avater image 
router.post('/avatar', authMiddleware.veryfiToken, upload.single('image'), userController.changeAvatar)

//change cover image
router.post('/cover-image', authMiddleware.veryfiToken, upload.single('image'), userController.changeCoverImage)


router.get('/top-user', userController.getTopUser);

module.exports = router;