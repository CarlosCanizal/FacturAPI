exports.upload = function(req, res){
  if (req.files.cert){
    var cert = req.files.cert.path;
    var newPath = "certificados/demo.cer";
    uploadFile(cert, newPath, function(response){
      res.json(response.code, response.message);
    });
  }else{
    res.json(400,{'error': "CERT file is required" });
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
