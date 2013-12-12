var x = require('libxmljs');
var xslt = require('node_xslt');
var crypto = require('crypto');
var fs = require('./read_file');

module.exports = {
  validate_schema : function (filename) {

    var xsd = fs.read_file_sync('schemas/cfdv32.xsd');
    if (!xsd.status) {
      return xsd;
    }
    xsd = xsd.data;

    var xml = fs.read_file_sync(filename);
    if (!xml.status) {
      return xml;
    }
    xml = xml.data;

    var result = {};

    var xsd_string;
    try {
      xsd_string = x.parseXmlString(xsd);
    } catch (err) {
      return {status: false, error: err};
    }

    var xml_string;
    try {
      xml_string = x.parseXmlString(xml);
    } catch (error) {
      return {status: false, error: error};
    }

    var validate = xml_string.validate(xsd_string);
    return {status: validate, error: [], xml: xml_string};
  },
  get_cadena_original : function (xml) {

    var factura = xslt.readXmlString(xml);
    var cadena_original;

    try {
      cadena_original = xslt.readXsltFile('schemas/cadenaoriginal_3_2.xslt');
    } catch (err) {
      return {status: false, error: err};
    }

    var params = [];
    var transformedString = xslt.transform(cadena_original, factura, params);
    return {status: true, cadena_original: transformedString, error: [] };
  },
  get_digest : function (cadena_original) {
    var shasum = crypto.createHash('sha1');
    shasum.update(cadena_original, 'utf8');
    var digest = shasum.digest('hex');
    return {status: true, digest: digest};
  },
  sign_digest : function (certificado, digest) {
    var pem = fs.read_file_sync(certificado);
    if (!pem.status) {
      return pem;
    }

    pem = pem.data;
    var key = pem.toString('ascii');
    var sign = crypto.createSign('RSA-SHA256');
    sign.update(digest);
    var signature = sign.sign(key, 'base64');
    return {status: true, signature: signature};
  },
  sign_cfdi : function (xml, certificado) {
    var valid_schema = this.validate_schema(xml);
    if (!valid_schema.status) {
      return {status: false, errors: ['Invalid xml, not schema structure']};
    }

    var factura = valid_schema.xml;
    var result = this.get_cadena_original(factura);
    if (!result.status) {
      return {status: false};
    }
    var cadena_original = result.cadena_original;
    var digest = this.get_digest(cadena_original);
    digest = digest.digest;
    var signature = this.sign_digest(certificado, digest);

    return {status: true, signature : signature};
  }
};