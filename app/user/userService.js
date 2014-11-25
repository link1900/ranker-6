var userService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var uuid = require('node-uuid');
var moment = require('moment');
var User = require('./user').model;
var userStates = require('./user').states;
var notificationService = require('../notification/notificationService');
var mongoService = require('../mongoService');
var helper = require('../helper');
var validator = require('validator');
var cleaner = require('validator');


userService.resetPassword = function(user){
    user.passwordReset = {
        tokenCreated: new Date(),
        token: uuid.v4(),
        expirationDate: moment().add(24,'h').toDate()
    };

    return mongoService.savePromise(user).then(userService.sendUserPasswordReset);
};

userService.sendUserPasswordReset = function(user){
    var email = notificationService.createNewEmail();

    email.addTo(user.email);
    email.setSubject("Password change request");
    email.addSubstitution('-email-', user.email);
    email.addSubstitution('-passwordLink-', notificationService.siteUrl + "/user/passwordReset/#/" + user.passwordReset.token);
    email.setText("A request to change the password for your -siteName- account -email- has been received. Please follow the link below to set a new password.\n-passwordLink-\n\n" +
    "You received this email because you or someone else has requested a password change.\n If you do not wish to change your password you can ignore this email.\n" +
    "For your security, this link is only valid for 24 hours from the time of your request. Also note that if you requested to change your password multiple times, only the link contained in the most recent email will be valid. If the link does not work, please resubmit your password change request.");


    return notificationService.sendEmail(email).then(function(){
        return user;
    });
};

userService.sendUserAcceptedEmail = function(user){
    var email = notificationService.createNewEmail();
    email.addTo(user.email);
    email.setSubject("Welcome to the -siteName-");
    email.setText("Your request to join the -siteName- website has been accepted. You can now login at -siteUrl-");
    return notificationService.sendEmail(email).then(function(){
        return user;
    });
};

userService.setUserActive = function(user){
    user.state = 'Active';
    return q(user);
};

userService.checkForPassword = function(user){
    if (validator.isNull(user.password) || !validator.isLength(user.password, 6, 150)){
        return q.reject("must provide a valid password field");
    }

    return q(user);
};

userService.cleanUser = function(user){
    if (user.email){
        user.email = cleaner.normalizeEmail(user.email);
    }
    if(user.password){
        user.password = cleaner.trim(user.password);
    }
    if(user.firstName){
        user.firstName = cleaner.trim(user.firstName);
    }
    if(user.lastName){
        user.lastName = cleaner.trim(user.lastName);
    }
    return q(user);
};

userService.validateUserIsEditable = function(user){
    if (!_.contains(['Active','Inactive'], user.state)){
        return q.reject("can only edit a user that is active or inactive");
    }

    return q(user);
};

userService.getUserForToken = function(token){
    var deferred = q.defer();
    User.findOne({"passwordReset.token": token, "passwordReset.expirationDate" : {$gt : new Date()}}, function(err, model) {
        if(err){
            deferred.reject(err);
        } else if(!model){
            deferred.reject('Invalid token');
        } else {
            deferred.resolve(model);
        }
    });
    return deferred.promise;
};

userService.cleanEmail = function(email){
    if (email){
        return q(cleaner.normalizeEmail(email));
    } else {
        return q(email);
    }
};

userService.findUserByEmail = function(email){
    return mongoService.findOne(User, {email: email});
};

userService.validateEmail = function(email){
    if (validator.isNull(email) || !validator.isEmail(email)){
        return q.reject("must provide a valid email");
    } else {
        return q(email);
    }
};

userService.validateUser = function(user){
    if (validator.isNull(user.email) || !validator.isEmail(user.email)){
        return q.reject("must provide a valid email");
    }

    if(validator.isNull(user.firstName) || !validator.isLength(user.firstName, 0, 50)){
        return q.reject("must provide an first name");
    }

    if(validator.isNull(user.lastName) || !validator.isLength(user.lastName, 0, 50)){
        return q.reject("must provide an last name");
    }

    if (!_.contains(_.values(userStates), user.state)){
        return q.reject("unknown user status of type: " + user.state);
    }

    return q(user);
};

userService.newUser = function(userRequest, startingState){
    var user = userRequest;
    if (startingState != null){
        user.state = startingState;
    }
    return q(new User(user));
};

userService.checkIfAccessCanBeGranted = function(user){
    if (user.state == "Requested Access"){
        return q(user);
    } else {
        return q.reject("Can only grant access to new users that have requested it");
    }
};

userService.checkIfUserExists = function(user){
    return mongoService.oneExists(User, {_id: {$ne: user._id}, email: user.email}).then(function(exists){
        if (exists){
            return q.reject('email ' + user.email + " is already used");
        } else {
            return q(user);
        }
    })
};

userService.mergeUpdateRequest = function(updateRequest, existingEntity){
    delete updateRequest.password;
    return q(_.extend(existingEntity, updateRequest));
};