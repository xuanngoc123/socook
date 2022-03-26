const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const userController = require('../controllers/userController');
const upload = require('../config/multer');
let router = express.Router();

//get my info
router.get('/my-info', authMiddleware.veryfiToken, userController.getMyInfo);

//update info
router.put('/change-my-info', authMiddleware.veryfiToken, userController.changeMyInfo);

//get user info by user_id
router.get('/user-info', userController.getUserInfo);

//upload avater image 
router.post('/avatar', authMiddleware.veryfiToken, upload.single('image'), userController.changeAvatar)

router.get('/user/:user_id', userController.getUserInfoByParams);
module.exports = router;