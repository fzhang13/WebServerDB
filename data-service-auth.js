const mongoose = require('mongoose');
const bcrpyt = require ('bcryptjs')
var Schema = mongoose.Schema;
var userSchema = new Schema ({
    "userName" : {
        "type" : String,
        "unique" : true
    },
    "password" : String,
    "email" : String,
    "loginHistory": [{
        "dateTime" : Date,
        "userAgent": String,
    }]
});

let User;

module.exports.initialize = function() {
    return new Promise((resolve, reject)=>{
        let db = mongoose.createConnection("mongodb://xszhang:web1234@ds039707.mlab.com:39707/web322_a6xinsongzhang");

        db.on('error', (err)=>{
            reject(err);
        });
        db.once('open',()=>{
            User= db.model("users", userSchema);
            resolve();
        });
    });
}

module.exports.registerUser = function(userData){
    return new Promise((resolve, reject)=>{
        if (userData.password != userData.password2)
            reject('Password do not match');
        else{
            bcrpyt.genSalt(10, function(err, salt){
                bcrpyt.hash(userData.password,salt,function(err, hash){
                    if(err)
                        reject('There was an error encrypting the password');
                    else{
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err)=>{
                            if(err){
                                if(err.code == 11000)
                                    reject("Username already taken");
                                reject("There was an error creating user: "+ err);
                            }else
                                resolve();
                        })
                    }
                })
            })
        }
    });
};

module.exports.checkUsers = function(userData){
    return new Promise((resolve, reject)=>{
        User.find({userName: userData.userName})
            .exec().then((users)=>{
                if(!users)
                    reject('Unable to find user: '+ userData.userName);
                else{
                    bcrpyt.compare(userData.password, users[0].password).then((res)=>{
                        if (res === true){
                            users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                            User.update(
                                { userName: users[0].userName},
                                { $set: {loginHistory: users[0].loginHistory}},
                                { multi: false }
                            ).exec().then((()=>{
                                resolve(users[0]);
                            })).catch((err)=> {
                                reject("There was an error verifying the user: " + err);
                            });
                        }else{
                            reject("Incorrect Password for user: "+ userData.userName);
                        }
                    })
                }
            }).catch(()=> {
                reject('Unable to find user: ' + userData.userName);
            })
    });
}

