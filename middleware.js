const Campground = require("./models/campground")
const { campgroundSchema, reviewSchema } = require("./joischema")
const ExpressError = require("./utilities/Expresserror")
const Review = require("./models/reviews")

const isLoggedIn = function (req, res, next) {

    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        res.redirect("/login")
    }
    else {
        next()
    }
}

const isAuthorized = async function (req, res, next) {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash("error", "Sorry you cannot edit a campground posted by another user")
        res.redirect(`/campgrounds/${id}`)
    }
    else {
        next()
    }
}

const isReviewAuthor = async function (req, res, next) {
    const { id, reviewid } = req.params;
    const review = await Review.findById(reviewid)
    if (!review.author._id.equals(req.user._id)) {
        req.flash("error", "Sorry you cannot delete a review posted by another user")
        res.redirect(`/campgrounds/${id}`)
    }
    else {
        next()
    }
}

//function to validate campground for edit and new forms
const validateCampground = function (req, res, next) {
    const result = campgroundSchema.validate(req.body)
    if (result.error) {
        next(new ExpressError(result.error, 400))
    }
    else {
        next()
    }
}

//function to validate review
const validateReview = function (req, res, next) {
    const result = reviewSchema.validate(req.body)
    if (result.error) {
        next(new ExpressError(result.error, 400))
    }
    else {
        next()
    }
}


module.exports.isLoggedIn = isLoggedIn
module.exports.isAuthorized = isAuthorized
module.exports.validateCampground = validateCampground
module.exports.validateReview = validateReview
module.exports.isReviewAuthor = isReviewAuthor
