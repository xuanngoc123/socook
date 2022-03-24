'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Login_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // this.belongsTo(models.user);
      
    }
  }
  Login_info.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    user_name: DataTypes.STRING,
    encrypted_password: DataTypes.STRING,
    google_id: DataTypes.STRING,
    facebook_id: DataTypes.STRING,
    email: DataTypes.STRING,
    status: DataTypes.INTEGER,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Login_info',
    tableName: 'login_info'
  });
  return Login_info;
};