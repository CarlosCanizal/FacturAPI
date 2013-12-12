
var sign = require('./sign.js');
var sello_digital = sign.sign_cfdi('factura.xml', 'certificados/emisor.pem');
console.log(sello_digital);