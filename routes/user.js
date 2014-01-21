
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.signup = function(req, res){
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  
  ParseApp.signUp(username, email, password, function(response){
    res.json(response.code, response);
  });

};

exports.login = function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  
  ParseApp.logIn(username, password, function(response){
    res.json(response.code, response);
  });
};

