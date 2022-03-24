const { Sequelize } = require('sequelize');

// Option 3: Passing parameters separately (other dialects)

const sequelize = new Sequelize('recipedb', 'root', 'mot2ba4nam6', {
    host: 'aa5jr3ty3y77lr.cyfgjqbdi1mp.ap-southeast-1.rds.amazonaws.com',
    dialect: 'mysql',
    
});

let connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = connectDB;