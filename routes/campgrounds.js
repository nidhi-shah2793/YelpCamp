const express = require("express")
const router = express.Router()

const catchAsync = require("./../utilities/catchAsync")
const Campground = require("./../models/campground")
const Review = require("./../models/reviews")
const ExpressError = require("./../utilities/Expresserror")
const Joi = require("joi")
const { campgroundSchema, reviewSchema } = require("./../joischema")
const { isLoggedIn, isAuthorized, validateCampground } = require("../middleware")
const multer = require('multer')
const { storage } = require("../cloudinary")
const upload = multer({ storage })

//import all controllers
const campgrounds = require("./../controllers/campgrounds")

router.route("/")
    .get(catchAsync(campgrounds.index)) //index page. find all campgrounds and then render index.ejs with var campgrounds
    .post(isLoggedIn, upload.array("campground[image]"), validateCampground, catchAsync(campgrounds.createCampground))
//req to post new campground. run validatecampground function
// add new campground, save and redirect to its show page

//form to make new campground.
router.get("/new", isLoggedIn, campgrounds.renderNewForm)

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground)) //show page. find campground from req.params id and render show page with var foundcampground
    .put(isLoggedIn, isAuthorized, upload.array("campground[image]"), validateCampground, catchAsync(campgrounds.updateCampground)) //update campground. run validatecampground first. find the campground based on id, update: req.body.campground, 3rd argument: runvalidators
    .delete(isLoggedIn, isAuthorized, catchAsync(campgrounds.deleteCampground)) //delete campground. find campground and delete. redirect to all campgrounds

//edit a campground. find campground based on id. render edit.ejs with var campground
router.get("/:id/edit", isLoggedIn, isAuthorized, catchAsync(campgrounds.renderEditForm))

module.exports = router;