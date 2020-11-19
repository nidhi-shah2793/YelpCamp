const express = require("express")
const router = express.Router({ mergeParams: true })

const catchAsync = require("./../utilities/catchAsync")
const Campground = require("./../models/campground")
const Review = require("./../models/reviews")
const ExpressError = require("./../utilities/Expresserror")
const Joi = require("joi")
const { campgroundSchema, reviewSchema } = require("./../joischema")
const { validateReview, isLoggedIn, isReviewAuthor } = require("./../middleware")

//import controller
const reviews = require("../controllers/reviews")

//make a new review
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview))

//delete review
router.delete("/:reviewid", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;