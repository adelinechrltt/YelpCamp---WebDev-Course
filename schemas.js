// our JOI schema

const Joi = require('joi');

const campgroundJoiSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

module.exports = { campgroundJoiSchema };

module.exports.reviewJoiSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().greater(0).less(6).required(),
        body: Joi.string().required()
    }).required()
})