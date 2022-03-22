'use strict';
const {
  Model
} = require('sequelize');
const { route } = require('../routes/auth');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
    user_name: DataTypes.STRING,
    encrypted_password: DataTypes.STRING,
    google_id: DataTypes.STRING,
    facebook_id: DataTypes.STRING,
    email: DataTypes.STRING,
    full_name: DataTypes.STRING,
    introduction: DataTypes.TEXT,
    date_of_birth: DataTypes.DATE,
    gender: DataTypes.INTEGER,
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    address_detal: DataTypes.TEXT,
    avata_image: DataTypes.TEXT,
    cover_image: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    role_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};