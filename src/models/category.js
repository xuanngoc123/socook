'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
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
  Category.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: DataTypes.STRING,
      category_group_id: DataTypes.INTEGER,
      create_time: DataTypes.DATE,
      last_update: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Category',
      tableName: 'category',
    },
  );
  return Category;
};
