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
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'New review created!');
    res.redirect(`/campgrounds/${id}`);
}))

router.delete('/:reviewId', catchAsyncError(async(req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Succesfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;