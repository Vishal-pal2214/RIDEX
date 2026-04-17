const mongoose = require('mongoose');


function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT,)
        .then(() => {
            console.log('Connected to Db'
            );
        })
        .catch((error) => {
            console.error('Database connection error:', error);
        });
}
module.exports = connectToDb;