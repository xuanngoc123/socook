'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Child_comment extends Model {
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
  Child_comment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      parent_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      content: DataTypes.TEXT,
      create_time: DataTypes.DATE,
      last_update: DataTypes.DATE,
      update_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Child_comment',
      tableName: 'child_comment',
    },
  );
  return Child_comment;
};
