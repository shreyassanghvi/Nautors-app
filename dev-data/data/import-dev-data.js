const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({path: './config.env'});

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
// Read JSON File
//////////////////////////////////////////////////

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));
///////////////////////////////////////////////////
// import data to db
//////////////////////////////////////////////////

const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);
    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
}

if (process.argv.length > 2) {

    if (process.argv[2] === '--import') {
        importData().then(() => {
            console.log('Data Loaded Successfully');
            process.exit(0);
        })
    } else if (process.argv[2] === '--delete') {
        deleteData().then(() => {
            console.log('Data Deleted Successfully');
            process.exit(0);
        })
    }
} else {
    console.log('Invalid Arguments');
    process.exit(1);
}