const Campground = require("../models/campground")
const User = require("../models/user")



module.exports.renderRegisterForm = (req, res) => {
    res.render("users/register")
}

module.exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = new User({ username, email })
        const regUser = await User.register(user, password)
        req.login(regUser, err => {
            if (err) {
                next(err);
            }
            req.flash("success", "Welcome to Yelp Camp")
            res.redirect("/campgrounds")
        })
    }
    catch (e) {  
        req.flash("error", "The username or email entered is already in use by another user! Please try again.") 
        res.redirect("/login")
    }
}

module.exports.renderLogin = (req, res) => {
    res.render("users/login")
}


module.exports.login = async (req, res) => {
    const { username } = req.body;
    req.flash("success", `Welcome back ${username}`)
    const redirectUrl = req.session.returnTo || "/campgrounds"
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout()
    req.flash("success", "Goodbye!")
    res.redirect("/campgrounds")
}