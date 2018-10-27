var employees = new Array();
var departments = new Array();

const fs = require('fs');


module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        fs.readFile('data/employees.json', 'utf-8', (err, data) => {
            if (err) {
                reject('unable to read file');
            }
            else {
                employees = JSON.parse(data);
                resolve('Success');
                return new Promise((resolve, reject) => {
                    fs.readFile('data/departments.json', 'utf-8', (err, data) => {
                        if (err) {
                            reject('unable to read file');
                        }
                        else {
                            departments = JSON.parse(data);
                            resolve('Success');
                        }
                    });
                });
            }
        });
    });
};

module.exports.getAllEmployees = function () {
    return new Promise((resolve, reject) => {
        resolve(employees);
        if (employees.length == 0)
            reject("no results returned");
    });
};

module.exports.getManagers = function () {
    return new Promise((resolve, reject) => {
        let managers = employees.filter(employees => employees.isManager == true);
        resolve(managers);
        if (employees.length == 0)
            reject("no results returned");
    });
};

module.exports.getDepartments = function () {
    return new Promise((resolve, reject) => {
        resolve(departments);
        if (departments.length == 0)
            reject("no results returned");
    });
};

module.exports.addEmployee = function (employeeData) {
    return new Promise((resolve, reject) => {
        if (!employeeData.isManager)
            employeeData.isManager = false;
        else
            employeeData.isManager = true;

        employeeData.employeeNum = employees.length + 1;
        employees.push(employeeData);
        resolve(employees);
        if (employees.length == 0)
            reject("no results returned");
    });
};

module.exports.getEmployeesByStatus = function (status) {
    return new Promise((resolve, reject) => {
        let filterEmp = employees.filter(employees => employees.status == status);
        resolve(filterEmp);
        if (filterEmp.length == 0)
            reject("no results returned");
    });
};

module.exports.getEmployeesByDepartment = function (department) {
    return new Promise((resolve, reject) => {
        let filterEmp = employees.filter(employees => employees.department == department);
        resolve(filterEmp);
        if (filterEmp.length == 0)
            reject("no results returned");
    });
};

module.exports.getEmployeesByManager = function (manager) {
    return new Promise((resolve, reject) => {
        let filterEmp = employees.filter(employees => employees.employeeManagerNum == manager);
        resolve(filterEmp);
        if (filterEmp.length == 0)
            reject("no results returned");
    });
};

module.exports.getEmployeesByNum = function (num) {
    return new Promise((resolve, reject) => {
        let filterEmp = employees.filter(employees => employees.employeeNum == num);
        resolve(filterEmp[0]);
        if (filterEmp.length == 0)
            reject("no results returned");
    });
};

module.exports.updateEmployee = function(employeeData){
    return new Promise((resolve,reject)=>{
        employeeData.isManager = (employeeData.isManager)? true : false;
        return new Promise((resolve,reject)=>{
            employees.forEach(employee =>{
                if(employee.employeeNum == employeeData.employeeNum){
                    employee.splice(employeeData.employeeNum -1, 1, employeeData);
                }
            });
            resolve();
        });
    });
};
