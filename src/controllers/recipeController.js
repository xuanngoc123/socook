
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
    createRecipe: async (req, res) => {
        try {
            let data = await recipeService.resolveCreateRecipe(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    getWaitRecipe: async (req, res) => {
        try {
            let data = await recipeService.resolveGetWaitRecipe(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    updateRecipe: async (req, res) => {
        try {
            let data = await recipeService.resolveUpdateRecipe(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    deleteRecipe: async (req, res) => {
        try {
            let data = await recipeService.resolveDeleteRecipe(req);
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json(error)
        }
    },
}
module.exports = recipeController