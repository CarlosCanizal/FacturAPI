exports.signature = function(req, res){
  var sello_digital;
  if (req.files.xml){
    var xml = req.files.xml.path;
    sello = Sign.sign_cfdi( xml, 'certificados/emisor.pem');
    res.json(sello.code,sello);
  }else{
    res.json(400,{'error': "XML file is required" });
  }
};