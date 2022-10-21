'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ip_view extends Model {
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
  Ip_view.init(
    {
      ip_address: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      recipe_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      total_views: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Ip_view',
      tableName: 'ip_view',
    },
  );
  return Ip_view;
};
