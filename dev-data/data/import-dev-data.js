const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
dotenv.config({path: `./config.env`});

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
// Read JSON File
//////////////////////////////////////////////////

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
///////////////////////////////////////////////////
// import data to db
//////////////////////////////////////////////////

const importData = async () => {
    try {
        await Tour.create(tours);
    } catch (e) {
        console.log(e)
    }
}

const deleteData = async () => {
    try {
        await Tour.deleteMany();
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