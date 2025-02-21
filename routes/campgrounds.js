const express = require('express');
const router = express.Router();
const catchAsyncError = require('../utils/catchAsyncError');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

const {campgroundJoiSchema} = require("../schemas");

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

router.get('/', async(req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', {campgrounds});
})

router.get('/new', async(req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, catchAsyncError(async(req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Succesfully created new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.get('/:id', async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground){
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds/');
    }
    res.render('campgrounds/show', { campground });
})

router.get('/:id/edit', async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds/');
    }
    res.render('campgrounds/edit', { campground });
})

router.put('/:id', validateCampground, (async(req, res, next) => {
    const { id } = req.params; 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    if(!campground){
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds/');
    }
    req.flash('success', 'Succesfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:id', async(req, res) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id);
    if(!campground){
        req.flash('error', 'Cannot find campground!');
        return res.redirect('/campgrounds/');
    }
    req.flash('success', 'Succesfully deleted campground!');
    res.redirect(`/campgrounds`);
})


module.exports = router;