const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const recipeController = require('../controllers/recipeController');
const { upload } = require('../config/multer');
const { validateRecipe } = require('../middlewares/recipeValidate');
let router = express.Router();

router.get('/get-recipe', authMiddleware.checkToken, recipeController.getRecipe)

router.get('/comment-of-recipe', recipeController.getCommentOfRecipe)

router.get('/get-category', recipeController.getCategory)

router.get('/my-list-recipe', authMiddleware.veryfiToken, recipeController.getMyListRecipe)

router.get('/user-list-recipe', recipeController.getUserListRecipe)

router.post('/create-recipe', authMiddleware.veryfiToken, upload.any(), recipeController.createRecipe)

router.get('/wait-recipe', authMiddleware.veryfiToken, recipeController.getWaitRecipe)

router.put('/update-recipe', authMiddleware.veryfiToken, upload.any(), recipeController.updateRecipe)

router.delete('/delete-recipe', authMiddleware.veryfiToken, recipeController.deleteRecipe)

router.put('/allowed-recipe', authMiddleware.veryfiTokenForAdmin, recipeController.allowedRecipe)

router.get('/recipe-of-collection', recipeController.getRecipeOfCollection)

router.get('/recipe-category', recipeController.getRecipeCategory)
module.exports = router;