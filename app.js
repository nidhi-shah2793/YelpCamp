if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//require express, app, mongoose, path
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const path = require("path")

//require method-override, ejs-mate, joi, express-session, connect-flash, passport, passport-local, mongo-sanitize
const methodOverride = require("method-override")
const ejsMate = require('ejs-mate')
const Joi = require("joi")
const session = require("express-session")
const flash = require("connect-flash")
const passport = require("passport")
const passportLocal = require("passport-local")
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet")
const MongoStore = require('connect-mongo')(session); //connected to express-session name


//import models, joi schema
const Campground = require("./models/campground")
const Review = require("./models/reviews")
const User = require("./models/user")
const { campgroundSchema, reviewSchema } = require("./joischema")

//import utilities - expresserror, catchasync function
const ExpressError = require("./utilities/Expresserror")

//app.set views, view engine
app.set("views", path.join(__dirname, "/views"))
app.set("view engine", "ejs")

//import routes
const camproundRoutes = require("./routes/campgrounds")
const reviewRoutes = require("./routes/reviews")
const userRoutes = require("./routes/users")

//app.use to parse reqbody, method overrride, ejsmate as ejs, 
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.engine("ejs", ejsMate)
app.use(express.static(path.join(__dirname, "/public")))


const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"
// "mongodb://localhost:27017/yelp-camp"

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //in seconds. saves after a certain period of time and not everytime a user refreshes the page
})

store.on("error", function (e) {
    console.log("session store error", e)
})

app.use(session({
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 900000, //in ms
        maxAge: 900000
    }
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())//make sure session is written before this
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// security
app.use(mongoSanitize());
app.use(helmet());

//content security policy
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [
    "https://use.fontawesome.com/",
    "https://fonts.gstatic.com/"
];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],//self and blob need to be there
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/duzfw9qyt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//connect to mongoose
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Mongoose is connected!")
});

//definig a middleware for the flash messages
app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
})


//campground routes and review routes
app.use("/campgrounds", camproundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", userRoutes)


//home page
app.get("/", (req, res) => {
    res.render("home")
})


app.get("/fakeuser", async (req, res) => {

    const user = new User({
        email: "colt@gmail.com",
        username: "colttt"
    })

    const newUser = await User.register(user, password = "chocolate")
    res.send(newUser)

})


//for all other pages (app.all("*")), throw new express error in next() with status code 404
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404))
})


//error middleware. get statuscode and message out from err.  res.status(statusCode).render("error", { err })
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    if (!err.message) {
        err.message = "Something went wrong!"
    }
    res.status(statusCode).render("error", { err })
})

const port = process.env.PORT || 8080

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

