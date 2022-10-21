'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recipe_has_ingredient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.hasOne(models.Ingredient, { foreignKey: { name: 'id' } });
    }
  }
  Recipe_has_ingredient.init(
    {
      recipe_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      ingredient_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      quantity: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Recipe_has_ingredient',
      tableName: 'recipe_has_ingredient',
    },
  );
  return Recipe_has_ingredient;
};
