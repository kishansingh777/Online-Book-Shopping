var mongoose = require('mongoose');
// Product Schema
var cartSchema = mongoose.Schema({
   
    email: {
        type: String,
        required: true
    },
    product:{
           type:Array
    }
    
    
});

var cart = module.exports = mongoose.model('cart', cartSchema);