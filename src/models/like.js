'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
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
  Like.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      recipe_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      sequelize,
      modelName: 'Like',
      tableName: 'like',
    },
  );
  return Like;
};
