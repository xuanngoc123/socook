'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
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
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: DataTypes.STRING,
      receive_user_id: DataTypes.INTEGER,
      recipe_id: DataTypes.INTEGER,
      child_comment_id: DataTypes.INTEGER,
      comment_id: DataTypes.INTEGER,
      create_user_id: DataTypes.TEXT,
      create_time: DataTypes.DATE,
      is_viewed: DataTypes.INTEGER,
      reason: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'Notification',
      tableName: 'notification',
    },
  );
  return Notification;
};
