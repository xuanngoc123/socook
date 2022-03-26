
const recipeService = require("../services/recipeService");

const recipeController = {
    getRecipe: async (req, res) => {
        try {
            let data = await recipeService.resolveGetRecipe(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
}
module.exports = recipeController