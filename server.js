const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path: `./config.env`});
const app = require('./app');

process.on('unhandledRejection', err => {
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', err => {
    console.log(err.name, err.message);
    process.exit(1);
});

///////////////////////////////////////////////////
// config mongoose
//////////////////////////////////////////////////

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndexes: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(() => console.log('DB Connection established'));


///////////////////////////////////////////////////
// Start Server
//////////////////////////////////////////////////

const server = app.listen(process.env.PORT, () => {
    console.log(`App is running on ${process.env.PORT}`);
});

