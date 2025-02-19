const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const {campgroundJoiSchema, reviewJoiSchema} = require("./schemas");

const catchAsyncError = require("./utils/catchAsyncError");
const ExpressError = require("./utils/ExpressError");

const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

const validateCampground = (req, res, next) => {
    // if(!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
    console.log(campgroundJoiSchema);

    const { error } = campgroundJoiSchema.validate(req.body);
    // console.log(isValid);
    if(error){    
        const msg = error.details.map(el => el.message).join(", ");
        throw new ExpressError(`ERROR: ${msg}`, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewJoiSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message);
        throw new ExpressError(`ERROR: ${msg}`, 400);
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', async(req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
})

app.get('/campgrounds/new', async(req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, catchAsyncError(async(req, res, next) => {

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.get('/campgrounds/:id', async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
})

app.get('/campgrounds/:id/edit', async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
})

app.put('/campgrounds/:id', validateCampground, (async(req, res, next) => {
    const { id } = req.params; 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', async(req, res) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id);
    res.redirect(`/campgrounds`);
})

app.post('/campgrounds/:id/reviews', validateReview, catchAsyncError(async(req, res, next) => {
    const { id } = req.params; 
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', catchAsyncError(async(req, res, next) => {
    console.log(req.params.id)
    await Campground.findOneAndDelete(req.params.id);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsyncError(async(req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500 } = err;
    if(!err.message) err.message = "Oh no, something went wrong!";
    res.status(statusCode).render(`error`, { err });
})

app.listen(3000, () => {
    console.log('Serving on port 3001');
})