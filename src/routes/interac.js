const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { upload } = require('../config/multer');
const interacController = require('../controllers/interacController');
let router = express.Router();

router.post('/create-comment', authMiddleware.veryfiToken, upload.any(), interacController.createComment)

router.put('/update-comment', authMiddleware.veryfiToken, upload.any(), interacController.updateComment)

router.delete('/delete-comment', authMiddleware.veryfiToken, interacController.deleteComment)

router.get('/history-comment', authMiddleware.veryfiToken, interacController.getHistoryComment)

router.post('/like-recipe', authMiddleware.veryfiToken, interacController.likeRecipe)

router.post('/dislike-recipe', authMiddleware.veryfiToken, interacController.dislikeRecipe)

router.get('/recipe-liked', authMiddleware.veryfiToken, interacController.getRecipeLiked)

router.post('/follow', authMiddleware.veryfiToken, interacController.followUser)
router.post('/unfollow', authMiddleware.veryfiToken, interacController.unfollowUser)

module.exports = router;