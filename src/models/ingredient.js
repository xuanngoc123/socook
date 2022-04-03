'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Ingredient extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            // this.hasOne(models.login_info, {sourceKey: 'user_id'});
            // this.belongsToMany(models.Recipe_has_ingredient, { targetKey: 'id' });
            this.hasMany(models.Recipe_has_ingredient, { foreignKey: { name: 'ingredient_id' } })
        }
    }
    Ingredient.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
    }, {
        sequelize,
        modelName: 'Ingredient',
        tableName: 'ingredient'
    });
    return Ingredient;
};