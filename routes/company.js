exports.newCompany = function(req, res){

  var currentUser = ParseApp.currentUser();
  if(currentUser){
    var name = req.body.name;
    ParseApp.newCompany(currentUser, name, function(response){
       res.json(response.code, response);
    });
  }else
  {
    res.json(400, 'no user logged!');
  }

};

exports.certificate = function(req, res){

  var types = {
    'cer': 'application/x-x509-ca-cert',
    'pem': 'application/x-x509-ca-cert',
    'key': 'application/x-iwork-keynote-sffkey'
  };

  if (!req.files.certificate || req.files.certificate.type != types.pem)
    res.json(400,{'error': "PEM file is required." });

  var certificate = req.files.certificate.path;
  var companyId = req.body.companyId;
  ParseApp.certificate(certificate, companyId, function(response){
     res.json(response.code, response);
  });

};