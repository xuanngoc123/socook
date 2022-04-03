'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
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
    Comment.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: DataTypes.INTEGER,
        recipe_id: DataTypes.INTEGER,
        content: DataTypes.TEXT,
        image_url_list: DataTypes.TEXT,
        create_time: DataTypes.DATE,
        last_update: DataTypes.DATE,
        update_by: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Comment',
        tableName: 'comment'
    });
    return Comment;
};