const interacService = require("../services/interacService");

const interacController = {
    createComment: async (req, res) => {
        try {
            if (req.fileValidationError) {
                return res.status(422).json(req.fileValidationError);
            }
            let data = await interacService.resolveCreateComment(req);
            return res.status(200).json(data)

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    createChildComment: async (req, res) => {
        try {
            let data = await interacService.resolveCreateChildComment(req);
            return res.status(200).json(data)

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    updateComment: async (req, res) => {
        try {
            if (req.fileValidationError) {
                return res.status(422).json(req.fileValidationError);
            }
            let data = await interacService.resolveUpdateComment(req);
            return res.status(200).json(data)

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    deleteComment: async (req, res) => {
        try {
            let data = await interacService.resolveDeleteComment(req);
            return res.status(200).json(data)

        } catch (error) {
            res.status(500).json(error)
        }
    },
    getHistoryComment: async (req, res) => {
        try {
            let data = await interacService.resolveGetHistoryComment(req);
            return res.status(200).json(data)

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    likeRecipe: async (req, res) => {
        try {
            let data = await interacService.resolveLikeRecipe(req);
            return res.status(200).json(data)

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    dislikeRecipe: async (req, res) => {
        try {
            let data = await interacService.resolveDisLikeRecipe(req);
            return res.status(200).json(data)

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    getRecipeLiked: async (req, res) => {
        try {
            let data = await interacService.resolveGetRecipeLiked(req);
            return res.status(200).json(data)

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    followUser: async (req, res) => {
        try {
            let data = await interacService.resolveFollowUser(req);
            return res.status(200).json(data)

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    unfollowUser: async (req, res) => {
        try {
            let data = await interacService.resolveUnFollowUser(req);
            return res.status(200).json(data)

        } catch (error) {
            return res.status(500).json(error)
        }
    },
    getNotification: async (req, res) => {
        try {
            let data = await interacService.resolveGetNotification(req);
            return res.status(200).json(data)
        } catch (error) {
            return res.status(500).json(error)
        }
    },
}

module.exports = interacController