
/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: __Xin Song Felix Zhang__ Student ID: __111976171_ Date: _Oct 20th, 2018_
*
* Online (Heroku) Link:  https://murmuring-earth-25765.herokuapp.com/
*
********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const dataService = require('./data-service.js');
const HTTP_PORT = process.env.PORT || 8080;
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');

app.engine(".hbs", exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));


app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});


app.set("view engine", ".hbs");

const storage = multer.diskStorage({
    destination: "./public/images/uploaded/",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

function onHttpStart() {
    console.log("Express http server listening on " + HTTP_PORT);
};

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/", (req, res) => {
    res.render("home");
});


app.get("/about", (req, res) => {
    res.render('about');
});


app.get("/employees", (req, res) => {
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status)
            .then((data) => res.render("employees", { employees: data }))
            .catch((err) => res.render("employees", { message: "no results" }))
    } else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department)
            .then((data) => res.render("employees", { employees: data }))
            .catch((err) => res.render("employees", { message: "no results" }))
    } else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager)
            .then((data) => res.render("employees", { employees: data }))
            .catch((err) => res.render("employees", { message: "no results" }))
    } else {
        dataService.getAllEmployees()
            .then((data) => res.render("employees", { employees: data }))
            .catch((err) => res.render("employees", { message: "no results" }))
    }
});


app.get("/managers", (req, res) => {
    dataService.getManagers()
        .then((data) => res.json(data))
        .catch((err) => res.json({ "message": err }))
});

app.get('/departments', (req, res) => {
    dataService.getDepartments()
        .then((data) => res.render("departments", { departments: data }))
        .catch((err) => res.render("departments", { message: "no results" }))
});

app.get("/employees/add", (req, res) => {
    res.render('addEmployee');
});

app.get("/images/add", (req, res) => {
    res.render('addImage');
});

app.get('/images', (req, res) => {
    fs.readdir('./public/images/uploaded', (err, imageFile) => {
        res.render("images", { data: imageFile, title: "Images" });
    });
});

app.get('/employee/:employeeNum', (req, res) => {
    dataService.getEmployeesByNum(req.params.employeeNum)
        .then((data) => res.render("employee", { employee: data }))
        .catch(() => {
            res.render("employee", { message: "no results" })
        })
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.post('/employees/add', (req, res) => {
    dataService.addEmployee(req.body)
        .then(res.redirect('/employees'))
        .catch((err) => res.json({ "message": err }));
});

app.post("/employee/update", (req, res) => {
    console.log(req.body);
    res.redirect("/employees");
});

app.get('*', (req, res) => {
    res.status(404);
    res.redirect('https://cdn-images-1.medium.com/max/1600/1*dd3fMSPJ2jqsxkNakbIbHw.gif');
});

dataService.initialize()
    .then(() => { app.listen(HTTP_PORT, onHttpStart); })
    .catch(() => { console.log("error"); });

