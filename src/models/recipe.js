'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Recipe extends Model {
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
    Recipe.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: DataTypes.STRING,
        main_image_url: DataTypes.TEXT,
        owner_id: DataTypes.INTEGER,
        total_views: DataTypes.INTEGER,
        short_description: DataTypes.TEXT,
        amount_of_people: DataTypes.INTEGER,
        is_allowed: DataTypes.INTEGER,
        cooking_time: DataTypes.INTEGER,
        create_time: DataTypes.DATE,
        last_update: DataTypes.DATE,
        update_by: DataTypes.STRING,
        is_notification: DataTypes.INTEGER,
    }, {
        sequelize,
        modelName: 'Recipe',
        tableName: 'recipe'
    });
    return Recipe;
};