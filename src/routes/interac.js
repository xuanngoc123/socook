const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { upload } = require('../config/multer');
const interacController = require('../controllers/interacController');
let router = express.Router();

router.post('/create-comment', authMiddleware.veryfiTokenActive, upload.any(), interacController.createComment)

router.post('/create-child-comment', authMiddleware.veryfiTokenActive, interacController.createChildComment)

router.put('/update-comment', authMiddleware.veryfiTokenActive, upload.any(), interacController.updateComment)

router.put('/update-child-comment', authMiddleware.veryfiTokenActive, interacController.updateChildComment)

router.delete('/delete-comment', authMiddleware.veryfiTokenActive, interacController.deleteComment)

router.delete('/delete-child-comment', authMiddleware.veryfiTokenActive, interacController.deleteChildComment)

router.get('/history-comment', authMiddleware.veryfiTokenActive, interacController.getHistoryComment)

router.post('/like-recipe', authMiddleware.veryfiTokenActive, interacController.likeRecipe)

router.delete('/dislike-recipe', authMiddleware.veryfiTokenActive, interacController.dislikeRecipe)

router.get('/recipe-liked', authMiddleware.veryfiTokenActive, interacController.getRecipeLiked)

router.post('/follow', authMiddleware.veryfiTokenActive, interacController.followUser)

router.delete('/unfollow', authMiddleware.veryfiTokenActive, interacController.unfollowUser)

router.get('/notification', authMiddleware.veryfiTokenActive, interacController.getNotification)

router.post('/like-comment', authMiddleware.veryfiTokenActive, interacController.likeComment)

router.delete('/dislike-comment', authMiddleware.veryfiTokenActive, interacController.dislikeComment)

router.put('/notification', authMiddleware.veryfiTokenActive, interacController.updateNotification)

router.put('/allnotification', authMiddleware.veryfiTokenActive, interacController.updateAllNotification)

module.exports = router;