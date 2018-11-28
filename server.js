
/*********************************************************************************
* WEB322 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: __Xin Song Felix Zhang__ Student ID: __111976171_ Date: _Nov 10th, 2018_
*
* Online (Heroku) Link:  https://murmuring-earth-25765.herokuapp.com/
*
********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const dataService = require('./data-service.js');
const dataServiceAuth = require('./data-service-auth.js')
const HTTP_PORT = process.env.PORT || 8080;
const multer = require('multer');
const fs = require('fs');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const clientSessions = require('client-sessions');


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
app.set("view engine", ".hbs");

const storage = multer.diskStorage({
    destination: "./public/images/uploaded/",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(clientSessions({
    cookieName: "session", 
    secret: "web322_assignment6",
    duration: 3 * 60 * 1000, 
    activeDuration: 1000 * 60 
}));
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
}); 

app.use(function(req,res,next){
    let route=req.baseUrl + req.path;
    app.locals.activeRoute = (route=="/")? "/":route.replace(/\/$/,"");
    next();
});

let ensureLogin = (req, res, next) => {
    if(!req.session.user){
        res.redirect("/login");
    } else {
        next();
    }
};



app.get("/", (req, res) => {
    res.render("home");
});

app.get("/about", (req, res) => {
    res.render('about');
});

app.get("/login", (req, res) =>{
    res.render('login');
});

app.get("/register", (req,res)=>{
    res.render('register');
});

app.get("/logout", (req, res)=>{
    req.session.reset();
    res.redirect('/');
});

app.get("/userHistory", ensureLogin, (req, res)=>{
    res.render('userHistory');
});


app.get("/employees", ensureLogin, (req, res) => {
    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status)
            .then((data) => {
                if (data.length > 0) res.render("employees", { employees: data });
                else res.render("employees", { message: "no results" })
            })
            .catch((err) => res.render("employees", { message: "no results" }))
    } else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department)
            .then((data) => {
                if (data.length > 0) res.render("employees", { employees: data });
                else res.render("employees", { message: "no results" })
            })
            .catch((err) => res.render("employees", { message: "no results" }))
    } else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager)
            .then((data) => {
                if (data.length > 0) res.render("employees", { employees: data });
                else res.render("employees", { message: "no results" })
            })
            .catch((err) => res.render("employees", { message: "no results" }))
    } else {
        dataService.getAllEmployees()
            .then((data) => {
                if (data.length > 0) res.render("employees", { employees: data });
                else res.render("employees", { message: "no results" })
            })
            .catch((err) => res.render("employees", { message: "no results" }))
    }
});


// app.get("/managers", (req, res) => {
//     dataService.getManagers()
//         .then((data) => res.json(data))
//         .catch((err) => res.json({ "message": err }))
// });

app.get('/departments', ensureLogin, (req, res) => {
    dataService.getDepartments()
        .then((data) => {
            if (data.length > 0) res.render("departments", { departments: data });
            else res.render("departments", { message: "no results" })
        })
        .catch((err) => res.render("departments", { message: "no results" }))
});

app.get("/employees/add", ensureLogin, (req, res) => {
    dataService.getDepartments()
        .then((data) => res.render("addEmployee", { departments: data }))
        .catch(() => res.render("addEmployee", { departments: [] }))
});

app.get("/departments/add", ensureLogin, (req, res) => {
    res.render("addDepartment");
});

app.get("/images/add", ensureLogin, (req, res) => {
    res.render('addImage');
});

app.get('/images', ensureLogin, (req, res) => {
    fs.readdir('./public/images/uploaded', (err, imageFile) => {
        res.render("images", { data: imageFile, title: "Images" });
    });
});

app.get("/employee/:empNum", ensureLogin, (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(dataService.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
});

app.get('/employees/delete/:empNum', ensureLogin, (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum)
        .then((data) => res.redirect("/employees"))
        .catch(() => res.status(500).send("Unable to Remove Employee / Employee not found"))
});


app.get('/department/:departmentId', ensureLogin, (req, res) => {
    dataService.getDepartmentById(req.params.departmentId)
        .then((data) => {
            if (data.length > 0) res.render("department", { department: data });
            else res.status(404).send("Department Not Found");
        })
        .catch(() => { res.status(404).send("Department Not Found") })
});

app.get('/departments/delete/:departmentId', ensureLogin, (req, res) => {
    dataService.deleteDepartmentById(req.params.departmentId)
        .then((data) => res.redirect("/departments"))
        .catch(() => res.status(500).send("Unable to Remove Department/Department Not Found"))
});

app.post('/register', (req,res)=>{
    dataServiceAuth.registerUser(req.body)
    .then((value)=>{
        res.render('register', {successMessage : "User Created"});
    }).catch((err)=>{
        res.render('register', {errorMessage: err, userName: req.body.userName});
    })
});

app.post('/login', (req,res)=>{
    req.body.userAgent = req.get('User-Agent');
    dataServiceAuth.checkUsers(req.body)
    .then((user)=>{
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/employees');
    }).catch((err)=> {
        res.render('login', {errorMessage: err, userName: req.body.userName});
    });
});



app.post("/images/add", ensureLogin, upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.post('/employees/add', ensureLogin, (req, res) => {
    dataService.addEmployee(req.body)
        .then(() => res.redirect('/employees'))
        .catch((err) => res.json({ "message": err }))
});

app.post("/employee/update", ensureLogin, (req, res) => {
    dataService.updateEmployee(req.body)
        .then(res.redirect("/employees"))
        .catch((err) => res.json({ "message": err }))
});

app.post("/departments/add", ensureLogin, (req, res) => {
    dataService.addDepartment(req.body)
        .then(res.redirect('/departments'))
        .catch((err) => res.json({ "message": err }))
});

app.post("/department/update", ensureLogin, (req, res) => {
    dataService.updateDepartment(req.body)
        .then(res.redirect('/departments'))
        .catch((err) => res.json({ "message": err }))
});

app.get('*', (req, res) => {
    res.status(404);
    res.redirect('https://cdn-images-1.medium.com/max/1600/1*dd3fMSPJ2jqsxkNakbIbHw.gif');
});

dataService.initialize()
    .then(dataServiceAuth.initialize)
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("app listening on: " + HTTP_PORT)
        });
    }).catch(function (err) {
        console.log("unable to start server: " + err);
    });

