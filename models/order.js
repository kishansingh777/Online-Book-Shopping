const mongoose = require("mongoose");

const userschema = new mongoose.Schema({

    paymentstatus: {
        type: String,
    },
    paymentmode: {
        type: String,
    },
    orderId: {
        type: String,
    },

    date: {
        type: String,
    },
    email:{
        type:String,
    },
    amount: {
        type: Number,
    },
    responsemessage: {
        type: String,
    },
    Address:[{
        street:{
            type: String,
            
        },
        city:{
            type: String,
            
        },
        zip:{
            type: Number,
            
        },
        state:{
            type: String,
            
        },
        country:{
            type:String
        },
    }],
    product:[{
        title:String,
        Qty:Number,
        price:Number,
        Availquantity:Number,
        image:String,
    }],

})

const Order = mongoose.model('order', userschema);


module.exports = Order;