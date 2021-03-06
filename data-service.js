const Sequelize = require("sequelize");

var sequelize = new Sequelize('dega64qhdpeb6e','ubvqwvqcxyvpdz','92392911347410ce321d356766ed2ee37b9825b95af17592f9601188d669c16f',{
    host:'ec2-75-101-138-165.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions:{
        ssl: true
    }
});

const Employee = sequelize.define('Employee', {
    employeeNum: {
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    firstName:Sequelize.STRING,
    lastName:Sequelize.STRING,
    email:Sequelize.STRING,
    SSN:Sequelize.STRING,
    addressStreet:Sequelize.STRING,
    addressCity:Sequelize.STRING,
    addressState:Sequelize.STRING,
    addressPostal:Sequelize.STRING,
    martialStatus:Sequelize.STRING,
    isManager:Sequelize.BOOLEAN,
    employeeManagerNum:Sequelize.INTEGER,
    status:Sequelize.STRING,
    department:Sequelize.INTEGER,
    hireDate:Sequelize.STRING,
});

const Department = sequelize.define('Department',{
    departmentId:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    departmentName: Sequelize.STRING
});

Department.hasMany(Employee, {foreignKey: 'department'});


module.exports.initialize = function () {
    return new Promise((resolve, reject)=> {
        sequelize.sync()
        .then(()=> resolve())
        .catch(()=> reject('unable to sync the database'));
    });
};

module.exports.getAllEmployees = function () {
    return new Promise((resolve, reject) => {
        Employee.findAll()
        .then(()=> resolve(Employee.findAll()))
        .catch(()=> reject('no results returned'))
    });
};

// module.exports.getManagers = function () {
//     return new Promise((resolve, reject) => {
//         let managers = employees.filter(employees => employees.isManager == true);
//         resolve(managers);
//         if (employees.length == 0)
//             reject("no results returned");
//     });
// };

module.exports.getDepartments = function () {
    return new Promise((resolve, reject) => {
        Department.findAll()
        .then((data)=> resolve(data))
        .catch(()=> reject('no results returned'))
    });
};

module.exports.getEmployeesByStatus = function (status) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where:{
                status: status
            }
        })
        .then((data)=> resolve(data))
        .catch(()=> reject('no results returned'))
    });
};

module.exports.getEmployeesByDepartment = function (department) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where:{
                department: department
            }
        })
        .then((data)=>resolve(data))
        .catch(()=>reject("no results returned")) 
    });
}

module.exports.getEmployeesByManager = function (manager) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where:{
                employeeManagerNum: manager
            }
        })
        .then((data)=> resolve(data))
        .catch(()=> reject('no results returned'))
    });
};

module.exports.getEmployeeByNum = function (num) {
    return new Promise((resolve, reject) => {
        Employee.findAll({
            where:{
                employeeNum : num
            }
        })
        .then((data)=>resolve(data))
        .catch(()=> reject('no results returned'))
    });
};

module.exports.addEmployee = function(employeeData){
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for(prop in employeeData){
        if(employeeData[prop]=="") employeeData[prop]=null;
    }
    return new Promise((resolve, reject) => {
        Employee.create(employeeData)
        .then(()=>resolve())
        .catch(()=>reject("unable to create employee"))
    });
};

module.exports.updateEmployee = function(employeeData){
    employeeData.isManager = (employeeData.isManager) ? true : false;
            for(prop in employeeData){
                if(employeeData[prop] == "")
                    employeeData[prop] = null;
            }
            return new Promise ((resolve,reject)=>{
                Employee.update({
                    firstName: employeeData.firstName,
                    lastName: employeeData.lastName,
                    email: employeeData.email,
                    addressStreet: employeeData.addressStreet,
                    addressCity: employeeData.addressCity,
                    addressPostal: employeeData.addressPostal,
                    addressState: employeeData.addressPostal,
                    isManager: employeeData.isManager,
                    employeeManagerNum: employeeData.employeeManagerNum,
                    status: employeeData.status,
                    department: employeeData.department
                },{where:{employeeNum: employeeData.employeeNum}})
                .then((data)=>resolve(data))
                .catch(()=>reject("unable to update employee"))}
)};


module.exports.addDepartment = function(departmentData){
    for(prop in departmentData){
        if(prop =="") prop = null;
    }
    return new Promise((resolve,reject)=>{
        Department.create(departmentData)
        .then(()=> resolve())
        .catch(()=> reject('unable to create department'))
    });
};

module.exports.updateDepartment = function(departmentData){
    for(prop in departmentData){
        if(prop =="") prop = null;
    }
    return new Promise((resolve,reject)=>{
        Department.update(departmentData,{where:{departmentId: departmentData.departmentId}})
        .then((data)=> resolve(data))
        .catch(()=> reject('unable to update department'))
    });
};

module.exports.getDepartmentById = function(id){
    return new Promise((resolve,reject)=>{
        Department.findAll({
            where:{
                departmentId: id
            }
        })
        .then((data)=>resolve(data))
        .catch(()=> reject('no results returned'))
    });
};

module.exports.deleteDepartmentById = function(id){
    return new Promise((resolve,reject)=>{
        Department.destroy({where:{departmentId:id}})
        .then((data)=> resolve(data))
        .catch(()=> reject('unable to delete department'))
    });
};

module.exports.deleteEmployeeByNum = function(empNum){
    return new Promise((resolve, reject) => {
        Employee.destroy({where: {employeeNum:empNum}}) 
        .then((data)=>resolve(data)) 
        .catch(()=>reject("unable to delete employee"))
    });
};