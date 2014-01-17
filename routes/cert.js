exports.upload = function(req, res){
  var types = {
    'cer': 'application/x-x509-ca-cert',
    'pem': 'application/x-x509-ca-cert',
    'key': 'application/x-iwork-keynote-sffkey'
  };

  if (req.files.cert && req.files.cert.type == types.pem){
    var cert = req.files.cert.path;
    var newPath = "certificados/demo.cer";
    uploadFile(cert, newPath, function(response){
      res.json(response.code, response.message);
    });
  }else{
    res.json(400,{'error': "PEM file is required." });
  }
};


//funcion para subir un archivo al servidor
function uploadFile(pathFile, newPath, callback){
   Fs.readFile(pathFile, function (err, data) {
    Fs.writeFile(newPath, data, function (err) {
      var response ={'code':200, 'message': {'message':'Upload Succesful!'} };
      if(err){
        response.code = 500;
        response.message = err;
      }

      if (callback && typeof(callback) === "function")
        callback(response);
    });
  });
}
