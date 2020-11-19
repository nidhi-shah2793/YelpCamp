const mongoose = require("mongoose")
const Review = require("./reviews")
const Schema = mongoose.Schema
const opts = { toJSON: { virtuals: true } };


const imageSchema = new Schema({
    url: String,
    filename: String
})

imageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200")
})

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }]
}, opts)

campgroundSchema.virtual("properties.popupText").get(function () {
    return `<strong><a href=http://localhost:8080/campgrounds/${this._id}>${this.title}</a></strong>
<p>${this.description.slice(0, 30)}...</p>`
})



campgroundSchema.post("findOneAndDelete", async function (campground) {
    if (campground) {
        await Review.remove({
            _id: { $in: campground.reviews }
        })
    }
})

const Campground = mongoose.model("Campground", campgroundSchema)
module.exports = Campground