const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YelpCamp',
        allowed_formats: ["jpg", "png", "jpeg"]
        // format: async (req, file) => 'png', // supports promises as well
        // public_id: (req, file) => 'computed-filename-using-request',
    },
});

module.exports.cloudinary = cloudinary
module.exports.storage = storage

// const parser = multer({ storage: storage });

// app.post('/upload', parser.single('image'), function (req, res) {
//     res.json(req.file);
// });