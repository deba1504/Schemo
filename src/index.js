const express = require("express")
const mongoose = require('mongoose');
const path = require("path")
const app = express()
// const hbs = require("hbs")
const LogInCollection = require("./mongodb")
const port = process.env.PORT || 3000 
app.use(express.json())

app.use(express.urlencoded({ extended: false }))
 
const tempelatePath = path.join(__dirname, '../tempelates')
const publicPath = path.join(__dirname, '../public')
console.log(publicPath);
const fs = require('fs');
const handlebars = require('handlebars');

// Read the Handlebars template file
const source = fs.readFileSync('tempelates/login.hbs', 'utf8');

// Compile the template to a function
const template = handlebars.compile(source);

// Define data to pass into the template
const data = {
    title: 'My Website',
    message: 'Hello, World!'
};

// Execute the template function with data
const html = template(data);

// Write the compiled HTML to an HTML file
fs.writeFileSync('docs/index.html', html, 'utf8');

app.set('view engine', 'hbs')
app.set('views', tempelatePath)
app.use(express.static(publicPath))


// hbs.registerPartials(partialPath)

app.get('/home', (req, res) => {
    res.render('home')
})
app.get('/about', (req, res) => {
    res.render('about')
})
app.get('/student', (req, res) => {
    res.render('student')
})
app.get('/student2', (req, res) => {
    res.render('student2')
})
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/', (req, res) => {
    res.render('login')
})
app.get('/agriculture', (req, res) => {
    res.render('agriculture')
})


// app.get('/home', (req, res) => {
//     res.render('home')
// })

app.post('/signup', async (req, res) => {
    const { name, password, dob, email } = req.body;

    // Function to check if dob is a future date
    const isFutureDate = (dob) => {
        const today = new Date();
        const dobDate = new Date(dob);
        return dobDate > today;
    };

    const isValidEmail = (email) => {
        let f1 = false, f2 = false;
        for(i of email){
            
            if(i == '@'){
                f1 = true;
            }
            if(i == '.'){
                f2 = true;
            }
        }
        return f1 && f2;
    };

    if (isFutureDate(dob)) {
        return res.render("signup", { error: "DOB can not be a future date dude..!!" });
    }

    if (!isValidEmail(email)) {
        return res.render("signup", { error: "Email format is not correct.." });
    }

    const data = new LogInCollection({
        name: name,
        password: password,
        dob: dob,
        email: email
    });

    try {
        await LogInCollection.insertMany([data]);
        // await data.save();
        res.render("home");
    } catch (error) {
        res.status(500).send("Error signing up. Please try again.");
    }
});



app.post('/login', async (req, res) => {
    try {
        const user = await LogInCollection.findOne({ email: req.body.email });

        if (!user) {
            // User not found in database
            return res.render("login", { error: "Incorrect details. Please try again." });
        }

        if (user.password === req.body.password) {
            // Passwords match, render home page
            return res.status(201).render("home", { naming: `${req.body.password}+${req.body.email}` });
        } else {
            // Password does not match
            return res.render("login", { error: "Incorrect password. Please try again." });
        }
    } catch (e) {
        console.error(e);
        res.render("login", { error: "An error occurred. Please try again later." });
    }
});





app.listen(port, () => {
    console.log('port connected');
})