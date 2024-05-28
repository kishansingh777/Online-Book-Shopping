var mongoose = require('mongoose');
// Product Schema
var wishlistSchema = mongoose.Schema({
   
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    email:{
        type:String
    }
    
});

var Wishlist = module.exports = mongoose.model('wishlist', wishlistSchema);