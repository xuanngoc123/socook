'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.hasOne(models.login_info, {sourceKey: 'user_id'});
    }
  }
  User.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    full_name: DataTypes.STRING,
    introduction: DataTypes.TEXT,
    date_of_birth: DataTypes.DATE,
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    avatar_image: DataTypes.TEXT,
    cover_image: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user'
  });
  return User;
};