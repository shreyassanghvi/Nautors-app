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
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(DB)
    .then(() => console.log('DB Connection established'));


///////////////////////////////////////////////////
// Start Server
//////////////////////////////////////////////////

const server = app.listen(process.env.PORT, () => {
    console.log(`App is running on ${process.env.PORT}`);
});

