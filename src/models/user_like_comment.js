'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_like_comment extends Model {
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
  User_like_comment.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      comment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'User_like_comment',
      tableName: 'user_like_comment',
    },
  );
  return User_like_comment;
};
