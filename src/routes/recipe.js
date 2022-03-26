const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const recipeController = require('../controllers/recipeController')
let router = express.Router();

router.get('/recipe', recipeController.getRecipe)

router.post('/create-recipe', authMiddleware.veryfiToken)

module.exports = router;