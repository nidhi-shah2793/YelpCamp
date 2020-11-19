const Campground = require("../models/campground")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const { cloudinary } = require("../cloudinary")

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new")
}

module.exports.createCampground = async (req, res, next) => {
    const response = await geocoder.forwardGeocode({ query: req.body.campground.location, limit: 1 }).send()
    const newCampground = new Campground(req.body.campground)
    newCampground.geometry = response.body.features[0].geometry;
    newCampground.author = req.user._id
    if (req.files) {
        newCampground.images = req.files.map(file => ({ url: file.path, filename: file.filename }))
    }
    await newCampground.save()
    req.flash("success", "Successfully made a new campground!")
    res.redirect(`/campgrounds/${newCampground._id}`)
}


module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    try {
        const campground = await Campground.findById(id).populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        }).populate("author")
        res.render("campgrounds/show", { campground })
    }
    catch {
        req.flash("error", "Campground was not found")
        res.redirect("/campgrounds")
    }
}


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    try {
        const campground = await Campground.findById(id);
        res.render("campgrounds/edit", { campground })
    }
    catch {
        req.flash("error", "Campground was not found")
        res.redirect("/campgrounds")
    }

}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true })
    const imgs = req.files.map(file => ({ url: file.path, filename: file.filename }))
    campground.images.push(...imgs)
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await campground.save()
    req.flash("success", "Successfully updated the campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}

//if delete images we have to-
//delete images from cloudinary
//delete the image object in campground.images whose filename matches the filename in deleteImages

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id)
    req.flash("success", "Deleted your campground!")
    res.redirect("/campgrounds")

}