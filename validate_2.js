#!/usr/local/bin/node

var x = require('libxmljs');
var xslt = require('node_xslt');
var crypto = require('crypto');
var fs = require('./read_file');

//cargar el xsd, si existe algun error termina la ejecucion del script.
var xsd = fs.read_file_sync('cfdv32.xsd');
if (!xsd.status) {
  console.log(xsd.error);
  process.exit(1);
}

//xsd guarda el contenido del archivo xsd
xsd = xsd.data;

var xml = fs.read_file_sync('factura.xml');
if (!xml.status) {
  console.log(xml.error);
  process.exit(1);
}

//gurada el contenido del archivo xml
xml = xml.data;


var xsdDoc = x.parseXmlString(xsd);
var xmlDoc0 = x.parseXmlString(xml);

var validate = xmlDoc0.validate(xsdDoc);
//console.log("is valid? ", validate);

if (!validate) {
  process.exit(1);
}

//PASO 2

var factura = xslt.readXmlString(xmlDoc0);
var cadena_original = xslt.readXsltFile('cadenaoriginal_3_2.xslt');

var params = [];
var transformedString = xslt.transform(cadena_original, factura, params);
console.log(transformedString);

//PASO 3

var shasum = crypto.createHash('sha1');
shasum.update(transformedString, 'utf8');

var digest = shasum.digest('hex');
console.log(digest);

//PASO 4


var pem = fs.read_file_sync('certificados/emisor.pem');
if (!pem.status) {
  console.log(pem.error);
  process.exit(1);
}

pem = pem.data;
var key = pem.toString('ascii');
var sign = crypto.createSign('RSA-SHA256');
sign.update(digest);
var signature = sign.sign(key, 'base64');
console.log(signature);


