const Campground = require("../models/campground")
const Review = require("../models/reviews")

module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    const review = new Review(req.body.review)
    review.author = req.user
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash("success", "Created a new review!")
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewid } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewid } })
    const review = await Review.findByIdAndDelete(reviewid)
    req.flash("success", "Deleted your review!")
    res.redirect(`/campgrounds/${id}`)
}