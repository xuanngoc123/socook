const multer = require("multer");
const { upload } = require("../config/multer");
const userService = require("../services/userService");
const userController = {
  getMyInfo: async (req, res) => {
    try {
      let data = await userService.resolveGetMyInfo(req);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  changeMyInfo: async (req, res) => {
    try {
      let data = await userService.resolveChangeMyInfo(req);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getUserInfo: async (req, res) => {
    try {
      let data = await userService.resolveGetUserInfo(req);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getUserInfoByParams: async (req, res) => {
    try {
      let data = await userService.resolveGetUserInfoByParams(req);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  changeAvatar: async (req, res) => {
    try {
      if (req.fileValidationError) {
        return res.status(422).json(req.fileValidationError);
      }
      let data = await userService.resolveChangeAvatar(req);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  changeCoverImage: async (req, res) => {
    try {
      if (req.fileValidationError) {
        return res.status(422).json(req.fileValidationError);
      }
      let data = await userService.resolveChangeCoverImage(req);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getTopUser: async (req, res) => {
    try {
      let data = await userService.resolveGetTopUser(req);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getTopUserRecipe: async (req, res) => {
    try {
      let data = await userService.resolveGetTopUserRecipe(req);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  getAllUser: async (req, res) => {
    try {
      let data = await userService.resolveGetAllUser();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
};

module.exports = userController;
