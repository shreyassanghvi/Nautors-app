const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour must have name'],
        unique: true,
        trim: true,
        maxLength: [40, "Tour name should be at most 40 characters"],
        minLength: [10, "Tour name should be at least 10 characters"]

    },
    slug: {
        type: String
    },
    duration: {
        type: Number,
        required: [true, 'A tour Must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A Tour must have a Group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'difficult', 'medium'],
            message: 'difficulty must be either, easy, medium, or difficult'
        },
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating Must be greater than or equal to 1'],
        max: [5, 'Rating Must be less than or equal to 5'],
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour Must have a Price'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: 'Price Discount ({VALUE}) must be less than the price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: true
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }

}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

tourSchema.virtual('durationWeek').get(function () {
    return this.duration / 7;
});

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    next();
});
tourSchema.pre(/^find/, function (next) {
    this.find({secretTour: {$ne: true}});
    this.start = Date.now();
    next();
})
tourSchema.post(/^find/, function (doc, next) {
    console.log(`Query Took: ${Date.now() - this.start}ms`);

    next();
})
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
    next();
})


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;