'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Category_has_recipe extends Model {
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
    Category_has_recipe.init({
        category_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        recipe_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        }
    }, {
        sequelize,
        modelName: 'Category_has_recipe',
        tableName: 'category_has_recipe'
    });
    return Category_has_recipe;
};