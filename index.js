//var con=require('./connection');
const Login=require("./models/user");
var Cart= require('../Practise - Mongo Db/models/cart');
var express=require("express");
var bodyparser = require("body-parser");
var path = require('path');
var app=express();
const nodemailer=require('nodemailer');
const { json } = require('body-parser');
const mongoose = require('mongoose');
var expressValidator = require('express-validator');
const flash=require("connect-flash")
app.use(flash());

// Connect to mongoose

// mongoURI='mongodb://127.0.0.1:27017/Booksella';
// mongoose.connect(mongoURI);
 mongoose.connect('mongodb://127.0.0.1:27017/Booksella');
 var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

const cookieParser = require('cookie-parser')//handlebar
var session = require('express-session');//handlebar
const MongoDBSession = require("connect-mongodb-session")(session)

//app.set('view', path.join(__dirname, 'view'));   
 
app.set('view engine', 'ejs')   
app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: true}));


 // Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
                , root = namespace.shift()
                , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
      
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
             
                default:
                    return false;
            }
        }
    }
}));


const store = new MongoDBSession({
    uri:'mongodb://127.0.0.1:27017/Booksella',
    collection: 'MySessions',
}) 



// Session midleware
app.use(session({
    key:"user_sid",
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
        cookie:{
        expires:6000000
    }
   
 
}));
app.use(cookieParser()) 

const port=process.env.port || 3000;

 // User session
 const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next()
    }
    else {
        res.redirect("login")
    }
}

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie("user_sid");
    }
    next();
});

var sessionChecker = (req, res, next) => {
    var cart = req.session.cart;
    if (req.session.user && req.cookies.user_sid) {
        
        Product.find(function (err, products) {

            if (err)
                console.log(err);
    
            res.render('index', {
                cart: cart,
                products: products
            });
    /* 
            res.redirect("/login") */
    
        });
        
        // res.redirect("/index");
    } else {
        next();
    }
};











//Error global variable
app.locals.errors=null;
 






 



//REGISTER Code


app.get('/',function(req,res){
    const variable = req.flash('message');  // home route is requested
    res.render('register',  { variable });  // register.handlebars page will be send when get request will be called

});

app.get('/register',function(req,res){ // home route is requested
    const variable = req.flash('message');
    res.render('register', { variable } ); // register.handlebars page will be send when get request will be called

});

app.get('/registerotp',function(req,res){ // home route is requested
    const variable = req.flash('message');
    res.render('registerotp', { variable } ); // register.handlebars page will be send when get request will be called

});

app.post("/register",async(req,res)=>{
    try {
        const variable = req.flash('message');
        var regname=req.body.name; // name enterd by user in register page will be stored in name variable
        var regemail=req.body.email; // email enterd by user in register page will be stored in name variable
        var regnumber=req.body.number; // phone number enterd by user in register page will be stored in name variable
        var regpassword=req.body.confpass; // password enterd by user in register page will be stored in name variable
        
            Login.findOne({email:req.body.email})
            .then((user)=>{
                if(user){
                    req.flash('message','!')
                    res.redirect("register")
                       
                }else{

                  


                    
                    let transporter = nodemailer.createTransport({ // it is a stransporter to send emails
                        host: "smtp.gmail.com", // set the smtp server address of google
                        port: 465, // set the  smtp port of google which is 465
                        secure: true,
                    
                    
                        auth: {  // datails of the email from where you will be sending the email
                            user: 'booksella1@gmail.com', // email of sender
                            pass: 'xbomdgfhspnachxm', // password of sender
                        }
                    
                    });
                    

                    var mailOptions = {
                        to: req.body.email, // below is the message sent to the email
                        subject: "Otp for registration is: ",  
                        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + regotp + "</h1>" // html body
                                    };
                
                        transporter.sendMail(mailOptions, (error, info) => { // this sents email
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message sent: %s', info.messageId); //message id shown on terminal
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                         
                            res.render('registerotp',{
                                regname:regname,
                                regemail:regemail,
                                regnumber:regnumber,
                                regpassword:regpassword,
                                variable:variable,
                            })
                           
                        });
                     
                }
            })
    
         
        
    } catch (error) {
        console.log("err");
        
    }
   
 
});

var regotp = Math.random(); // random otp will be generated
regotp = regotp * 100000; // numbers of 0 = number of digits there will be in otp
regotp = parseInt(regotp);
console.log(regotp);



app.post('/register-verify-otp', function (req, res) { // this will be executed when button on otp page will be clicked
    const variable = req.flash('message');
    var regname=req.body.regname;
    var regemail=req.body.regemail;
    var regnumber=req.body.regnumber;
    var regpassword=req.body.regpassword;
    if (req.body.otp == regotp) { 
         const User = new Login({
            name:regname,
            email:regemail,
           number:regnumber,
           password:regpassword,
         });
       User.save()
        res.redirect('/login')
    }
    else {  // wrong otp entered then this message will be shown 
       // res.render('otp', { msg: 'otp is incorrect' });
      /*  req.session.message = {
        type: 'danger',
        intro: 'OTP! ',
        message: 'Does not matched'
      }   */
      req.flash('message','!')
      res.render('registerotp',{
        regname:regname,
        regemail:regemail,
        regnumber:regnumber,
        regpassword:regpassword,
        variable:variable,
    }) // verifyotp.handlebars will be loaded
    }
});




















// login Page Code

app.get('/login',sessionChecker,function(req,res){ // get request for login page
    const variable = req.flash('message');
    req.session.destroy(function(err){
         
    })
   
    res.render('login', { variable }); //login.handlebars page will be send when get request will be called

});

app.get('/login1',function(req,res){
    const variable = req.flash('message');
    res.render('login',{ variable }); //login.handlebars page will be send when get request will be called


});
app.get("/logout", (req, res) => {
        if (req.session.user && req.cookies.user_sid) {
            res.clearCookie("user_sid");
            res.redirect("/login");
        } else {
            res.redirect("/login");
        }
    });

app.post("/login",function(req,res){ // this will be executed when button on login page will be clicked
     

    var email=req.body.email; // email entered by user on login page will be stored in email variable
    var pass=req.body.confpass; // pass entered by user on login page will be stored in email variable
    
    if(email=="admin@gmail.com" && pass=="kishansingh"){
        // var count;

        // Product.count(function (err, c) {
        //     count = c;
        // });
    
        // Product.find(function (err, products) {
        //     res.render('admin/admin_index', {
        //         products: products,
        //         count: count
        //     });
        // });
        res.redirect('/admin/admin_index')
         
    }
     else {
            var cart = req.session.cart;
    
    
         var user =   Login.findOne({ $and: [{ email: req.body.email }, { password: req.body.confpass }] })
                .then((result) => {
                    if (result) {
                    req.session.isAuth=true; 
                        req.session.email = result;

                        
          Product.find(function (err, products) {
            if (err)
                console.log(err);
    
            res.render('index', {
                cart: cart,
                products: products
            });
            /* 
            res.redirect("/login") */
    
         });
        
    
                        // res.redirect("index")
                    } else {
                        req.flash('message', '!')
                        res.redirect("login")
                    }

                    req.session.user = user;
                })
            /*   */
            
        }
         });



 











// OTP




var email; 

var otp = Math.random(); // random otp will be generated
otp = otp * 1000000; // numbers of 0 = number of digits there will be in otp
otp = parseInt(otp);
console.log(otp);

let transporter = nodemailer.createTransport({ // it is a stransporter to send emails
    host: "smtp.gmail.com", // set the smtp server address of google
    port: 465, // set the  smtp port of google which is 465
    secure: true,


    auth: {  // datails of the email from where you will be sending the email
        user: 'booksella1@gmail.com', // email of sender
        pass: 'xbomdgfhspnachxm', // password of sender
    }

});



//EMAIL (reset password)


app.get('/email',function(req,res){ // get request for email page
    const variable = req.flash('message');
    res.render('email', { variable }); // email page will be loaded

});

app.get('/otp',function(req,res){ // get request for otp which is verifyotp.handlebars
    const variable = req.flash('message');
    res.render('verifyotp',{ variable }); //verifyotp.handlebars will be sent when this get request will be called

});

app.post('/send', async (req, res)=> { 
    
    try {

        email = req.body.email; // to store the email entered by user to send otp will be stored in email variabl
    
    
    Login.findOne({email:email})
    .then((result)=>{
        if(result){
            var mailOptions = {
                to: req.body.email, // below is the message sent to the email
                subject: "Otp for registration is: ",  
                html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
                            };
        
                transporter.sendMail(mailOptions, (error, info) => { // this sents email
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message sent: %s', info.messageId); //message id shown on terminal
                    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                    res.redirect("otp")
                   
                });
        }else{
            req.flash('message','!')
            res.redirect("email")
        }
                
    })
        
    } catch (error) {
        console.log("err");
        
    }
});

app.post('/otp', function (req, res) { // this will be executed when button on otp page will be clicked

    if (req.body.otp == otp) {  // if otp is same as sent on email then redirect to password chhange page
        res.redirect('/changePassword') // load change password page
    }
    else {  // wrong otp entered then this message will be shown 
       // res.render('otp', { msg: 'otp is incorrect' });
      /*  req.session.message = {
        type: 'danger',
        intro: 'OTP! ',
        message: 'Does not matched'
      }   */
      req.flash('message','!')
       res.redirect('/otp'); // verifyotp.handlebars will be loaded
    }
});

app.get('/changePassword',function(req,res){ // get request for change password
    const variable = req.flash('message');
    res.render('changePassword',{ variable }); // change password will be loaded 

});

app.post('/changePassword', function (req, res) { // this will  be executed when button o changePassword will be clicked
    var password = req.body.password; // new password enterd by user will be stored in password variable 
    

    Login.findOneAndUpdate(
        { email: email },
        { password: password })
        .then((result) => {
            if (result) {

                res.redirect("login")
            }
            else {
                req.flash('message', '!')
                res.redirect("changePassword")
            }
        })




 





});
















// Get category module
var Category= require('../Practise - Mongo Db/models/category');

// Get category index

app.get('/admin/category',function(req,res){

    Category.find(function(err,categories){
        if(err) throw err
        res.render('admin/categories',{
            categories:categories
        })
    })

});

// Get add-category Page

app.get('/admin/category/add_category',function(re,res){
    var title="";
    res.render('admin/add_category',{
        title:title
    });
})


// Post add-category Page

app.post('/admin/category/add-category', function (req, res) {

    req.checkBody('title', 'Title must have a value.').notEmpty();

   
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors=req.validationErrors();
    
    if(errors){
        res.render('admin/add_category', {
            errors:errors,
            title: title,
            
        });

     }

 
     else {
        Category.findOne({slug: slug}, function (err, category) {
            if (category) {
                //req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/add_category', {
                    title: title
                });
            } else {
                var category = new Category({
                    title: title,
                    slug: slug
                });

                category.save(function (err) {
                    if (err) throw err
                       // return console.log(err);

                    Category.find(function (err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });

                    //req.flash('success', 'Category added!');
                    res.redirect('/admin/category');
                });
            }
        });
    }
    

})


// Get edit Category

app.get('/admin/category/edit_category/:id', function (req, res) {

    Category.findById(req.params.id, function (err, category) {
        if (err)throw err
            
        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });

});


/*
 * POST edit category
 */
app.post('/admin/category/edit_category/:id', function (req, res) {
    
    req.checkBody('title', 'Title must have a value.').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;
  
    var errors=req.validationErrors();

     if(errors){
        res.render('admin/edit_category', {
            errors:errors,
            title: title,
            id: id
        });

     }

   else {
        Category.findOne({slug: slug, _id: {'$ne': id}}, function (err, category) {
            if (category) {
               // req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, function (err, category) {
                    if (err)
                        return console.log(err);

                    category.title = title;
                    category.slug = slug;

                    category.save(function (err) {
                        if (err) throw err
                             

                        Category.find(function (err, categories) {
                            if (err)  throw err
                                 
                             else {
                                req.app.locals.categories = categories;
                            }
                        });

                        //req.flash('success', 'Category edited!');
                        
                        res.redirect('/admin/category');
                    });

                });


            }
        });
    }
    
});



/*
 * GET delete category
 */
app.get('/admin/category/delete-category/:id', function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if (err) throw err
             

        Category.find(function (err, categories) {
            if (err) throw err
                
             else {
                req.app.locals.categories = categories;
            }
        });

       // req.flash('success', 'Category deleted!');
        res.redirect('/admin/category/');
    });
});












// Admin adding product

var fileupload=require('express-fileupload');
var mkdirp=require('mkdirp');
var fs=require('fs-extra');
var resizeImg=require('resize-img');
const { title } = require("process");

var Product= require('../Practise - Mongo Db/models/product');

const { cookie } = require("express-validator/check");
const { Cookie } = require("express-session");

// Express fileupload middleware
app.use(fileupload());


 //GET admin index
 
 app.get('/admin/admin_index', function (req, res) {
    var count;
    var orderCount;
    Product.count(function (err, c) {
        count = c;
    });
    Order.count(function (err, c) {
        orderCount = c;
    });
 

    Product.find(function (err, products) {
        Order.find(function (err, order) {
        res.render('admin/admin_index', {
            products: products,
            count: count,
            order:order,
            orderCount:orderCount
        });
    });
});
});

// Admin index edit

app.get('/admin_index/edit/:id', function (req, res) {
   
    var id=req.params.id;

    
    Product.find(function (err, products) {
        Order.findById(req.params.id,function (err, order) {
        res.render('admin/edit_order', {
            products: products,
            id:id,
            order:order,
        });
        
    });
});

});

// Admin edit order post


app.post('/admin/order/edit-order/:id', function (req, res) {

    
    var id=req.params.id;
    var category=req.body.category;
  
                Order.findById(id, function (err, order) {
                    if (err)
                        console.log(err);

                
                    order.paymentstatus=category;
                   
                    order.save(function (err) {
                        if (err) throw err
                        });

                    res.redirect('/admin/admin_index');
    
                    });
          

                });
           









// Admin search

app.get('/admin/admin-search',(req,res)=>{  
        

    Order.find({"$or":[{date:{$regex:req.query.psearch,$options:'i'}}]},(err,order)=>{  
    if(err){  
    console.log(err);  
    }else{  
    res.render('admin/admin-search',{order:order});  
    }  
  
    
    });
});





 
 //GET products index
 
app.get('/admin/products', function (req, res) {
    var count;

    Product.count(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

 

// GET add product
 
app.get('/admin/products/add-product', function (req, res) {

    var title = "";
    var desc = "";
    var price = "";
    var quantity="";

    Category.find(function (err, categories) {
        res.render('admin/add_products', {
            title: title,
            desc: desc,
            categories: categories,
            quantity:quantity,
            price: price

        });
    });


});


 // Add product post

app.post('/admin/products/add-product', function (req, res) {
    var imageFile = req.files && typeof req.files.image !== "undefined" ? req.files.image.name : "";
     
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
   // req.checkBody('quantity', 'Quantity must have a value.').notEmpty();
   req.checkBody('quantity', 'Quantity must have a value.').isDecimal();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var quantity=req.body.quantity;
    
    var errors = req.validationErrors();
   // const variable=req.flash('message');

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_products', {
                errors: errors,
                title: title,
                desc: desc,
                categories: categories,
                price: price,
                quantity:quantity
            });
        });
    }
  else {
        Product.findOne({slug: slug}, function (err, product) {
            if (product) {
                
                Category.find(function (err, categories) {
                    res.render('admin/add_products', {
                        title: title,
                        desc: desc,
                        categories: categories,
                        price: price,
                        quantity:quantity

                    });
                });
            } else {

                var price2 = price;

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    price: price2,
                    category: category,
                    quantity:quantity,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err) throw err
                        
                 
                    mkdirp('public/product_images/' + product._id, function (err) {
                        if (err) throw err

                   
                    });
               
    
                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            if (err) throw err
                        });
                    }

                   // req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});

// get product edit module
app.get('/admin/products/edit-product/:id', function (req, res) {

    var errors;
    if (req.session.errors){
        errors = req.session.errors;

    }
 
    req.session.errors = null;

    
  

    Category.find(function (err, categories) {

        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            } else {
                           res.render('admin/edit_product', {
                            title: p.title,
                            desc: p.desc,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: p.price,
                            image: p.image,
                            quantity:p.quantity,
                            id: p._id
                        });
                    }
                });
            
        });

    });



//Post edit product

app.post('/admin/products/edit-product/:id', function (req, res) {

    
    var price = req.body.price;
    var id = req.params.id;
    var quantity=req.body.quantity;
    var category=req.body.category;

    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('quantity', 'Quantity must have a value.').isDecimal();

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
        
    }
        
        
     else {
                Product.findById(id, function (err, product) {
                    if (err)
                        console.log(err);

                    
                    product.price = parseFloat(price).toFixed(2);
                    product.quantity=quantity;
                    product.category=category;
                   
                    product.save(function (err) {
                        if (err) throw err
                             

                      
                        });

                    res.redirect('/admin/products');
    
                    });
                }

                });
           


















// Delete product

app.get('/admin/products/delete-product/:id', function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });
            
             
            res.redirect('/admin/products');
        }
    });

});






// Home Page

// Get all categories to pass to index.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});


 // Passing all product details to index page
app.get('/index',isAuth, function (req, res) {


    var cart = req.session.cart;

    if (req.session.user && req.cookies.user_sid) {
        Product.find(function (err, products) {
            if (err)
                console.log(err);
    
            res.render('index', {
                cart: cart,
                products: products
            });
    /* 
            res.redirect("/login") */
    
        });
    } else {
        res.redirect("/login");
    }
  
});










// Displaying category product 

 // GET products by category
 
app.get('/category_product/:category', function (req, res) {

    var categorySlug = req.params.category;
    var cart=req.session.cart;
    Category.findOne({slug: categorySlug}, function (err, category) {
        Product.find({category: categorySlug}, function (err, products) {
            if (err)
                console.log(err);

            res.render('admin/category_product', {
                title: category.title,
                products: products,
                cart:cart
            });
        });
    });

});


 // get category nav bar


app.get('/categories_list',function(req,res){
    var cart=req.session.cart;
    res.render('categories_list',{
        cart:cart

    });

});

// get product details
 
app.get('/product_details/:category/:product', function (req, res) {

    
    var cart=req.session.cart;

    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) throw err
            
         else {
             

                    res.render('product_details', {
                         
                        title: product.title,
                        product: product,
                        cart:cart
                    });
                }
            });
        
    });




// search

    app.get('/search',(req,res)=>{  
        

        Product.find({"$or":[{title:{$regex:req.query.psearch,$options:'i'}},{category:{$regex:req.query.psearch,$options:'i'}}]},(err,product)=>{  
        if(err){  
        console.log(err);  
        }else{  
        res.render('search',{product:product});  
        }  
       
        
        });
    });
 
// Profile
    app.get("/profile",isAuth, function (req, res) {
    
        var email=req.session.email;
        var cart=req.session.cart;
        Login.find().exec()
            .then((users, err) => {
                if (users) {
                    Order.find(function (err, order) {
                        res.render('profile', {
                            
                            users: users,
                            email:email,
                            cart:cart,
                            order:order,
                             
                        });
              
                    });
                    /*   console.log(result); */
                } else {
                    console.log("err");
                }
            })
    })


    app.get("/aboutus", function (req, res) {
        var cart=req.session.cart;
        res.render("aboutus",{
            cart:cart,
        })
    })
    
    app.get("/privacypolicy", function (req, res) {
        res.render("privacypolicy")
    })
    
    app.get("/contact", function (req, res) {
        var cart=req.session.cart;
        res.render("contact",{
            cart:cart,
        })
    })















// Add to Cart
app.get('*', function(req,res,next) {
    res.locals.cart = req.session.cart;
    res.locals.email=req.session.email;
    res.locals.address= req.session.address;
    next();
 });



 // when user will click on add to cart it will store product details in cart var

 
app.get('/cart/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({ slug: slug }, function (err, product) {
        if (err) throw err
        
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                 title: slug,
                qty: 1,
                price: product.price,
                quantity: product.quantity,
                image: '/product_images/' + product._id + '/' + product.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug ) {
                    if(cart[i].qty<product.quantity){
                        cart[i].qty++;
                        newItem = false;
                        break;
                    }
                     
                    newItem = false;
                     
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: product.price,
                    quantity: product.quantity,
                    image: '/product_images/' + product._id + '/' + product.image
                });
            }
        }


       
        res.redirect('/product_details/' + product.category + "/" + product.slug);
        // res.redirect('back');
    });

});

























// Buy now get 

 app.get('/buy/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({slug: slug}, function (err, product) {
        if (err)throw err
         
        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: product.price,
                quantity:product.quantity,
                image: '/product_images/' + product._id + '/' + product.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].title == slug) {
                    if(cart[i].qty<product.quantity){
                        cart[i].qty++;
                        newItem = false;
                        break;
                    }
                     
                    newItem = false;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: product.price,
                    quantity:product.quantity,
                    image: '/product_images/' + product._id + '/' + product.image
                });
            }
        }

 

      res.redirect('/cart');
    });

});


 // GET add to cart page
 
app.get('/cart',isAuth, function (req, res) {
    var email=req.session.email;
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart');
         
    } else {
        res.render('cart', {
            cart: req.session.cart,
            email:email
        });
       
    }

});


// GET increment or decrement  product
 
app.get('/cart/update/:product', function (req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    if(cart[i].qty<cart[i].quantity){
                        cart[i].qty++;
                    }
                    break;
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1)
                        cart.splice(i, 1);
                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0)
                        delete req.session.cart;
                    break;
                default:
                    console.log('update problem');
                    break;
            }
            break;
        }
    }

     
    res.redirect('/cart');

});









// Wishlist

var Wishlist= require('../Practise - Mongo Db/models/wishlist');

app.get('/wishlist',function(req,res){
    var email=req.session.email;
    Product.find(function (err, products) {
     Wishlist.find(function(err,wishlist){
        res.render("wishlist",{
              wishlist:wishlist,
              products:products,
              email:email
        });
     })

})
});


app.get('/wishlist/:product',function (req, res) {
    
    var slug=req.params.product;
    var email=req.session.email;
     
    Product.findOne({slug: slug}, function (err, product) {
        Wishlist.findOne({slug:slug},function(err,wishlist){
        if(wishlist){

            if(wishlist.email!=email.email){
                var wish=new Wishlist({
                    title: product.title,
                    slug: product.slug,
                    desc: product.desc,
                    price: product.price,
                    category: product.category,
                    quantity:product.quantity,
                    image: product.image,
                    email:email.email
                })
                wish.save(function(err){
                    if(err)throw err
                })
                res.redirect('/product_details/'+product.category+"/"+product.slug);
    
            }
             else{
                res.redirect('/product_details/'+product.category+"/"+product.slug);
             }
           
        }

        else{
            var wish=new Wishlist({
                title: product.title,
                slug: product.slug,
                desc: product.desc,
                price: product.price,
                category: product.category,
                quantity:product.quantity,
                image: product.image,
                email:email.email
            })
            wish.save(function(err){
                if(err)throw err
            })
            res.redirect('/product_details/'+product.category+"/"+product.slug);
        }
    })



})
});



// Delete wishlist

app.get('/wishlist/delete/:id', function (req, res) {

    var id = req.params.id;
   

   
            Wishlist.findByIdAndRemove(id, function (err) {
                console.log(err);
                res.redirect('/wishlist');
            });
            
             
             
 

});





















//// PAYMENT


const Order=require("./models/order");
const wishlist = require("./models/wishlist");





app.get('/onlinepay',function(req,res){
    var email=req.session.email;
    var cart=req.session.cart;
    var cartTotal=0;
    cart.forEach(function(product){
        var total=product.qty*product.price ;
        cartTotal+= total;

    });
    res.render("onlinepay",{
              email:email,
              cartTotal:cartTotal,
              cart:cart,
    });
})
app.get('/cashondelivery',function(req,res){
    var email=req.session.email;
     
    res.render("cashondelivery",{
              email:email,
    });
})


app.post('/choose-payment',function(req,res){
    var street=req.body.street;
    var city=req.body.city;
    var zip=req.body.zip;
    var state=req.body.state;
    var country=req.body.country;
    
    req.session.address = [];
    req.session.address.push({
        street:street,
        city:city,
        zip:zip,
        state:state,
        country:country
    });
   
    var email=req.session.email;
     
    var cart=req.session.cart;
    var cartTotal=0;
    cart.forEach(function(product){
    var total=product.qty*product.price ;
    cartTotal+= total;

});
    
   


    res.render("checkout",{
              email:email,
              cartTotal:cartTotal,
    });
 
 

})













app.get("/cod",async(req,res)=>{

    var cart=req.session.cart;
    // console.log(cart);
    var cartTotal=0;
    cart.forEach(function(product){
        var total=product.qty*product.price ;
        cartTotal+= total;

    });
     
   var product=cart;
    
 

    






    var email= req.session.email;
   
    var useraddr= req.session.address;
     
 
    let addrr =[];
    for(let i=0;i<useraddr.length;i++){
        let argsss={
            street:useraddr[i].street,
            city:useraddr[i].city,
            zip:useraddr[i].zip,
            state:useraddr[i].state,
            country:useraddr[i].country,
        }
        addrr.push(argsss);
    }
    







    

res.render("cod",{
    orderId:Math.floor(Date.now()/100),
    paymentmode:"CASH ON DELIVERY",
    paymentstatus:"Proccessing",
    date:new Date(),
    cart:cart,
    amount:cartTotal, // yaha pe cart.ejs ke andar jo <%= cartTotal %> hai woh daalna hai
    addr:addrr,
    email:email.email,
    respmsg:"YOUR ORDER WILL BE DELIVERED WITHIN A WEEK."
   
})
let arr =[];
for(let i=0;i<product.length;i++){
    let args={
        title:product[i].title,
        Qty:product[i].qty,
        price:product[i].price,
        Availquantity:product[i].quantity,
        image:product[i].image
    }
    arr.push(args);
}

const column= new Order({
    
    orderId:Math.floor(Date.now()/100),
    date:new Date(), 
    paymentmode:"CASH ON DELIVERY",
    paymentstatus:"Proccessing",
    amount:cartTotal, // yaha pe cart.ejs ke andar jo <%= cartTotal %> hai woh daalna hai
    product:arr,
    email:email.email,
    Address:addrr,
})

column.save();



// Reducing quantity from product database
var afterOrderQuantity;
for(let i=0;i<product.length;i++){

  

  Product.findOne({slug:product[i].title},function(err,Product){
       afterOrderQuantity=Product.quantity-product[i].qty;
       Product.quantity=afterOrderQuantity;
       
      Product.save();
  })
  
}



 
})



app.get('/index-after-payment',isAuth, function (req, res) {

  delete req.session.cart;
  delete req.session.address;
  res.redirect('/index');
  

});








const Razorpay=require('razorpay');

const instance = new Razorpay({
    key_id: 'rzp_test_sphx3FcTEfnWLr',
    key_secret: 'UfHiJkKHGV6i5yfDowraEVml'
  })

  app.post("/api/payment/order",(req,res)=>{
    var params = { 
        currency: "INR",
        receipt: "su001",
        payment_capture: '1'
      };
  console.log(params);
    
    instance.orders.create(params).then((data) => {
           res.send({"sub":data,"status":"success"});
    }).catch((error) => {
           res.send({"sub":error,"status":"failed"});
    })
    console.log(data);
    });


app.get("/payment.ejs",function(req,res){
    res.render("payment")
})





app.post("/web/payment.html/success",(req,res)=>{
const params=req.body;
const config=req.body;

var cart=req.session.cart;
// console.log(cart);
var cartTotal=0;
cart.forEach(function(product){
    var total=product.qty*product.price ;
    cartTotal+= total;

});
 
var useraddr= req.session.address;
     
 
let addrr =[];
for(let i=0;i<useraddr.length;i++){
    let argsss={
        street:useraddr[i].street,
        city:useraddr[i].city,
        zip:useraddr[i].zip,
        state:useraddr[i].state,
        country:useraddr[i].country,
    }
    addrr.push(argsss);
}



var product=cart;
var email= req.session.email;

let arr =[];
for(let i=0;i<product.length;i++){
    let args={
        title:product[i].title,
        Qty:product[i].qty,
        price:product[i].price,
        Availquantity:product[i].quantity,
        image:product[i].image
    }
    arr.push(args);
}


 
        res.render("razorpay",{
            amount:cartTotal,
            paymentmode:"Online",
            orderId:Math.floor(Date.now()/100),
            date:new Date(),
            cart:cart,
            paymentstatus:"Proccessing",
            email:email.email,
            addr:addrr,
            respmsg:"YOUR ORDER WILL BE DELIVERED WITHIN A WEEK."
        })
     
const col=new Order({

 
    paymentstatus:"Proccessing",
    orderId:Math.floor(Date.now()/100),
    date:new Date(), 
    amount:cartTotal,
    responsemessage:"THANKYOU FOR PLACING THE ORDER",
    paymentmode:"Online",
     product:arr,
     email:email.email,
     Address:addrr,
  
  })
  console.log(email)
  col.save(); 

// Reducing quantity from product database
  var afterOrderQuantity;
  for(let i=0;i<product.length;i++){

    

    Product.findOne({slug:product[i].title},function(err,Product){
         afterOrderQuantity=Product.quantity-product[i].qty;
         Product.quantity=afterOrderQuantity;
         
        Product.save();
    })
    
}




    })



// Pdf invoice

var pdf        = require('html-pdf');
var FS         = require('fs');
const { log } = require("console");
var options    = {format:'A2'};




app.post('/pdf/:orderId',(req,res)=>{
    var orderId = req.params.orderId;
    var cart=req.session.cart;
// console.log(cart);
var cartTotal=0;
cart.forEach(function(product){
var total=product.qty*product.price ;
cartTotal+= total;

});

var useraddr= req.session.address;


let addrr =[];
for(let i=0;i<useraddr.length;i++){
let argsss={
  street:useraddr[i].street,
  city:useraddr[i].city,
  zip:useraddr[i].zip,
  state:useraddr[i].state,
  country:useraddr[i].country,
}
addrr.push(argsss);
}



var product=cart;
var email= req.session.email;

let arr =[];
for(let i=0;i<product.length;i++){
let args={
  title:product[i].title,
  Qty:product[i].qty,
  price:product[i].price,
  Availquantity:product[i].quantity,
  image:product[i].image
}
arr.push(args);
}




     res.render("razorpay",{
      amount:cartTotal,
      paymentmode:"Online",
      orderId:orderId,
      date:new Date(),
      cart:cart,
      paymentstatus:"SUCCESSFUL",
      addr:addrr,
      respmsg:"YOUR ORDER WILL BE DELIVERED WITHIN A WEEK."
  },function(err,html){
  pdf.create(html, options).toFile('./public/uploads/demopdf.pdf', function(err, result) {
      if (err){
          return console.log("err");
      }
       else{
      // console.log("res");
      var datafile = FS.readFileSync('./public/uploads/demopdf.pdf');
      res.header('content-type','application/pdf');
      res.send(datafile);
       }
    });
})
})









// Port 
app.listen(port,()=>{
    console.log('server is running');
});







