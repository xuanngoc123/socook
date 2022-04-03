const interacService = require("../services/interacService");

const interacController = {
    createComment: async (req, res) => {
        try {
            let data = await interacService.resolveCreateComment(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    updateComment: async (req, res) => {
        try {
            let data = await interacService.resolveUpdateComment(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    deleteComment: async (req, res) => {
        try {
            let data = await interacService.resolveDeleteComment(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    getHistoryComment: async (req, res) => {
        try {
            let data = await interacService.resolveGetHistoryComment(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    likeRecipe: async (req, res) => {
        try {
            let data = await interacService.resolveLikeRecipe(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    dislikeRecipe: async (req, res) => {
        try {
            let data = await interacService.resolveDisLikeRecipe(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    getRecipeLiked: async (req, res) => {
        try {
            let data = await interacService.resolveGetRecipeLiked(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    followUser: async (req, res) => {
        try {
            let data = await interacService.resolveFollowUser(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    unfollowUser: async (req, res) => {
        try {
            let data = await interacService.resolveUnFollowUser(req);
            res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
}

module.exports = interacController