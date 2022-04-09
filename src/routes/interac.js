const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { upload } = require('../config/multer');
const interacController = require('../controllers/interacController');
let router = express.Router();

router.post('/create-comment', authMiddleware.veryfiToken, upload.any(), interacController.createComment)

router.post('/create-child-comment', authMiddleware.veryfiToken, interacController.createChildComment)

router.put('/update-comment', authMiddleware.veryfiToken, upload.any(), interacController.updateComment)

router.put('/update-child-comment', authMiddleware.veryfiToken, interacController.updateChildComment)

router.delete('/delete-comment', authMiddleware.veryfiToken, interacController.deleteComment)

router.delete('/delete-child-comment', authMiddleware.veryfiToken, interacController.deleteChildComment)

router.get('/history-comment', authMiddleware.veryfiToken, interacController.getHistoryComment)

router.post('/like-recipe', authMiddleware.veryfiToken, interacController.likeRecipe)

router.delete('/dislike-recipe', authMiddleware.veryfiToken, interacController.dislikeRecipe)

router.get('/recipe-liked', authMiddleware.veryfiToken, interacController.getRecipeLiked)

router.post('/follow', authMiddleware.veryfiToken, interacController.followUser)

router.delete('/unfollow', authMiddleware.veryfiToken, interacController.unfollowUser)

router.get('/notification', authMiddleware.veryfiToken, interacController.getNotification)

module.exports = router;