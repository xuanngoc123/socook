
const recipeService = require("../services/recipeService");

const recipeController = {
    getRecipe: async (req, res) => {
        try {
            let data = await recipeService.resolveGetRecipe(req);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    createRecipe: async (req, res) => {
        try {
            if (req.fileValidationError) {
                return res.status(422).json(req.fileValidationError);
            }
            let data = await recipeService.resolveCreateRecipe(req);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    getWaitRecipe: async (req, res) => {
        try {
            let data = await recipeService.resolveGetWaitRecipe(req);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    updateRecipe: async (req, res) => {
        try {
            if (req.fileValidationError) {
                return res.status(422).json(req.fileValidationError);
            }
            let data = await recipeService.resolveUpdateRecipe(req);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json(error)
        }
    },
    deleteRecipe: async (req, res) => {
        try {
            let data = await recipeService.resolveDeleteRecipe(req);
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json(error)
        }
    },
}
module.exports = recipeController