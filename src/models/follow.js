'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Follow extends Model {
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
    Follow.init({
        follow_user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        followed_user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        create_time: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Follow',
        tableName: 'follow'
    });
    return Follow;
};