const env = {
  development: {
    username: "root",
    password: process.env.MYSQL_PASS,
    database: "recipedb",
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    pool: {
      max: 20000,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      id: false,
    },
  },
  test: {
    username: "root",
    password: process.env.MYSQL_PASS,
    database: "recipedb",
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    pool: {
      max: 20000,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      id: false,
    },
  },
  production: {
    username: "root",
    password: process.env.MYSQL_PASS,
    database: "recipedb",
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
    pool: {
      max: 20000,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
    define: {
      freezeTableName: true,
      createdAt: false,
      updatedAt: false,
      id: false,
    },
  },
};
module.exports = env;
