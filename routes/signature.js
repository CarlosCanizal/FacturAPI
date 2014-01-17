exports.signature = function(req, res){
  var sello_digital;
  if (req.files.xml){
    var xml = req.files.xml.path;
    sello_digital = Sign.sign_cfdi( xml, 'certificados/emisor.pem');
    res.json(sello_digital);
  }else{
    res.json(400,{'error': "XML file is required" });
  }
};