'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_name: {
        type: Sequelize.STRING
      },
      encrypted_password: {
        type: Sequelize.STRING
      },
      google_id: {
        type: Sequelize.STRING
      },
      facebook_id: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      full_name: {
        type: Sequelize.STRING
      },
      introduction: {
        type: Sequelize.TEXT
      },
      date_of_birth: {
        type: Sequelize.DATE
      },
      gender: {
        type: Sequelize.INTEGER
      },
      city: {
        type: Sequelize.STRING
      },
      district: {
        type: Sequelize.STRING
      },
      address_detal: {
        type: Sequelize.TEXT
      },
      avata_image: {
        type: Sequelize.TEXT
      },
      cover_image: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.INTEGER
      },
      role_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};