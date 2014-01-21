
Parse = require("parse").Parse
_ = require "underscore"
fs = require 'fs'

APP_ID = "8u01LExvSvGBmyrVoxD2n3Z9uq7jkNFbQD0AO3oz"
JAVASCRIPT_KEY = "oXkyLu63EtXE3sc38OHjk87NUgTkOWpLHEUHFmwF"

Parse.initialize(APP_ID, JAVASCRIPT_KEY);


module.exports =
  signUp : (username, email, password, callback) ->
    user = new Parse.User()
    user.signUp({email: email, username: username, password: password}, {
      success: (user) ->
        callback {code:200, status:true, user: user}
      ,
      error: (model, error) ->
       callback {code:400, status:false, error: error.message}
    })
  ,
  logIn : (username, password, callback)->
    Parse.User.logIn username, password,
      success: (user)->
        callback {code:200, status: true, user:user}
        # Company = Parse.Object.extend "Company"
        # query = new Parse.Query(Company)
        # query.equalTo("userId", user);
        # query.find
        #   success: (applications) ->
        #     _.each applications, (app)->
        #       console.log app.attributes.name
      error: (user, error) ->
        callback {code:400, status: false, error: error.message}
  ,
  newCompany : (user, name, callback) ->

    # base64 = fs.readFileSync('emisor.pem').toString('base64')
    # file = new Parse.File("myfile5.txt", base64: base64);

    Company = Parse.Object.extend("Company");
    company = new Company();

    company.save({userId:user,name: name}, {
      success: (object) ->
        callback {code:200, status: true, company: company}
      ,
      error: (model, error) ->
        callback {code:400, status: false, error: error.message}
    })
  certificate : (certificate, companyId, callback) ->
    base64 = fs.readFileSync(certificate).toString('base64')
    file = new Parse.File("certificate.pem", base64: base64);
    Company = Parse.Object.extend("Company");
    query = new Parse.Query(Company);
    query.get(companyId, {
      success: (company)->

        company.set 'certificate', file
        company.save(null, {
        success: (company) ->
          callback {code:200, status:true}
        ,
        error: (object, error)->
          callback {code:400, status:false, error: error.message}
        })
      ,
      error: (object, error) ->
        callback {code:400, status:false, error: error.message}
    })
  currentUser : () ->
    Parse.User.current()