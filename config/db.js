const mongoose = require('mongoose');

const { MONGO_URI } = process.env;

exports.connect = () => {
    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Connection successful");
    }).catch((error) => {
        console.log(error);
        console.log("Failed to connect to db");
        process.exit(1);
    });
}