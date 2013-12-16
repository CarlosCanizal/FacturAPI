sign = require('./sign.js');
sello_digital = sign.sign_cfdi('factura.xml', 'certificados/emisor.pem');
console.log(sello_digital);