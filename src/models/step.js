'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Step extends Model {
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
    Step.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        recipe_id: DataTypes.INTEGER,
        number: DataTypes.INTEGER,
        content: DataTypes.TEXT,
        image_url_list: DataTypes.TEXT,
    }, {
        sequelize,
        modelName: 'Step',
        tableName: 'step'
    });
    return Step;
};