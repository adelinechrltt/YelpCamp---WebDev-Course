const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsyncError = require('../utils/catchAsyncError');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');

const {reviewJoiSchema} = require("../schemas");

const validateReview = (req, res, next) => {
    const { error } = reviewJoiSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message);
        throw new ExpressError(`ERROR: ${msg}`, 400);
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsyncError(async(req, res, next) => {
    console.log(1);
    const { id } = req.params;
    console.log(2);
    const campground = await Campground.findById(id);
    if(campground) console.log(campground);
    else console.log();
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${id}`);
}))

router.delete('/:reviewId', catchAsyncError(async(req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;