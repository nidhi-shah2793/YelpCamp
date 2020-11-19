//require mongoose
const mongoose = require("mongoose")

//import campground model, seed helper files
const Campground = require("./../models/campground")
const cities = require("./cities")
const { descriptors, places } = require("./seedHelpers")

//connect to mongoose
mongoose.connect("mongodb://localhost:27017/yelp-camp", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Mongoose is connected!")
});

//geocoder
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: "pk.eyJ1IjoibmRzaGFoIiwiYSI6ImNraGZud2hiMTAxbTczNHBieG44c3FhYWoifQ.RppCmyZqfDXlUDQ4Mk5ikQ" });

const sample = (array) => array[Math.floor(Math.random() * array.length)]


//make an async function - delete everything in model, loop 50 times during which make a new campground. 
//each campground - random location, random title, image, lorem description, random price
//save campground 
const seedDB = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/duzfw9qyt/image/upload/v1605199237/YelpCamp/aczsmwtoal6xky5refl7.jpg',
                    filename: 'YelpCamp/aczsmwtoal6xky5refl7'
                },
                {
                    url: 'https://res.cloudinary.com/duzfw9qyt/image/upload/v1605199237/YelpCamp/tfdrutsjfwusjfggu8hj.jpg',
                    filename: 'YelpCamp/tfdrutsjfwusjfggu8hj'
                }],
            description: "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate rem perferendis sed odit accusamus eos ipsam veniam, commodi saepe corporis. Vel nostrum magnam ratione quo sequi! Pariatur, fuga. Voluptate!Sit sint corporis ducimus voluptates veniam voluptas fugiat unde aperiam recusandae dignissimos repudiandae error vero, pariatur, numquam consequuntur amet odio ipsum libero doloremque, assumenda velit magnam quos esse distinctio. Vel.",
            price: Math.floor(Math.random() * 30) + 20,
            author: "5fac2a42154edf43b07e92d3"
        })
        const response = await geocoder.forwardGeocode({ query: camp.location, limit: 1 }).send()
        camp.geometry = response.body.features[0].geometry;
        await camp.save()
    }
}

//execute function and close connection
seedDB()
    // .then(mongoose.connection.close())
