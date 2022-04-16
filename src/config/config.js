const env = {
    "development": {
        "username": "root",
        "password": process.env.MYSQL_PASS,
        "database": "recipedb",
        "host": process.env.MYSQL_HOST,
        "dialect": "mysql",
        "define": {
            "freezeTableName": true,
            "createdAt": false,
            "updatedAt": false,
            "id": false
        }
    },
    "test": {
        "username": "root",
        "password": process.env.MYSQL_PASS,
        "database": "recipedb",
        "host": process.env.MYSQL_HOST,
        "dialect": "mysql",
        "define": {
            "freezeTableName": true,
            "createdAt": false,
            "updatedAt": false,
            "id": false
        }
    },
    "production": {
        "username": "root",
        "password": process.env.MYSQL_PASS,
        "database": "recipedb",
        "host": process.env.MYSQL_HOST,
        "dialect": "mysql",
        "define": {
            "freezeTableName": true,
            "createdAt": false,
            "updatedAt": false,
            "id": false
        }
    }
}
module.exports = env