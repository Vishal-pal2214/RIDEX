const mongoose = require('mongoose');

let isConnected = false;

function connectToDb() {
    mongoose.connect(process.env.DB_CONNECT, {
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority',
    })
        .then(() => {
            isConnected = true;
            console.log('✅ Connected to MongoDB');
        })
        .catch((error) => {
            isConnected = false;
            console.error('❌ Database connection error:', error.message);
            console.log('⚠️  Server will continue to run. Database operations will fail until MongoDB is available.');
            // Don't throw - let server continue running
            // Reconnect periodically
            setTimeout(connectToDb, 5000);
        });

    // Handle disconnection events
    mongoose.connection.on('disconnected', () => {
        isConnected = false;
        console.log('⚠️  Disconnected from MongoDB, attempting to reconnect...');
        setTimeout(connectToDb, 5000);
    });
}

const isDbConnected = () => isConnected;

module.exports = connectToDb;
module.exports.isDbConnected = isDbConnected;