const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const recipeController = require('../controllers/recipeController');
const { upload } = require('../config/multer');
const { validateRecipe } = require('../middlewares/recipeValidate');
let router = express.Router();

router.get('/get-recipe', authMiddleware.checkToken, recipeController.getRecipe)

router.post('/create-recipe', authMiddleware.veryfiToken, upload.any(), validateRecipe.validateCreateRecipe(), recipeController.createRecipe)

router.get('/wait-recipe', authMiddleware.veryfiToken, recipeController.getWaitRecipe)

router.put('/update-recipe', authMiddleware.veryfiToken, upload.any(), validateRecipe.validateUpdateRecipe(), recipeController.updateRecipe)

router.delete('/delete-recipe', authMiddleware.veryfiToken, recipeController.deleteRecipe)

module.exports = router;