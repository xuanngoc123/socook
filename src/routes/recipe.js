const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const recipeController = require('../controllers/recipeController');
const { upload } = require('../config/multer');
const { validateRecipe } = require('../middlewares/recipeValidate');
let router = express.Router();

router.get('/get-recipe', authMiddleware.checkToken, recipeController.getRecipe)

router.get('/check-like', authMiddleware.veryfiTokenActive, recipeController.checkLike)

router.get('/comment-of-recipe', authMiddleware.checkToken, recipeController.getCommentOfRecipe)

router.get('/get-category', recipeController.getCategory)

router.get('/my-list-recipe', authMiddleware.veryfiTokenActive, recipeController.getMyListRecipe)

router.get('/user-list-recipe', recipeController.getUserListRecipe)

router.post('/create-recipe', authMiddleware.veryfiTokenActive, upload.any(), recipeController.createRecipe)

router.get('/wait-recipe', authMiddleware.veryfiTokenActive, recipeController.getWaitRecipe)

router.put('/update-recipe', authMiddleware.veryfiTokenActive, upload.any(), recipeController.updateRecipe)

router.delete('/delete-recipe', authMiddleware.veryfiTokenActive, recipeController.deleteRecipe)

router.put('/allowed-recipe', authMiddleware.veryfiTokenForAdmin, recipeController.allowedRecipe)

router.get('/recipe-of-collection', recipeController.getRecipeOfCollection)

router.get('/recipe-ingerdient', recipeController.getRecipeIngerdient)

router.get('/list-recipe', recipeController.getListRecipe)

router.get('/top-recipe', recipeController.getTopRecipe)

router.get('/top-collection', recipeController.getTopCollection)

module.exports = router;