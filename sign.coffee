x = require 'libxmljs'
xslt = require 'node_xslt'
crypto = require 'crypto'
fs = require './read_file'

module.exports =
  validate_schema : (filename) ->
    xsd = fs.read_file_sync 'schemas/cfdv32.xsd'
    return xsd unless xsd.status
  
    xml = fs.read_file_sync filename
    return xml unless xml.status

    try 
      xsd_string = x.parseXmlString xsd.data
    catch err 
      return {status: false, error: err}

    try
      xml_string = x.parseXmlString xml.data
    catch error
      return {status: false, error: error}

    is_valid = xml_string.validate xsd_string 
    return {status: is_valid, error: [], xml: xml_string}
  ,
  get_cadena_original : (xml) ->
    factura = xslt.readXmlString xml
    try
      cadena_original = xslt.readXsltFile('schemas/cadenaoriginal_3_2.xslt')
    catch err
      return {status: false, error: err}
    params = [];
    transformedString = xslt.transform(cadena_original, factura, params)
    return {status: true, cadena_original: transformedString, error: [] }
  ,
  get_digest : (cadena_original) ->
    shasum = crypto.createHash 'sha1'
    shasum.update(cadena_original, 'utf8')
    digest = shasum.digest 'hex'
    return {status: true, digest: digest}
  ,
  sign_digest : (certificado, digest) ->
    pem = fs.read_file_sync(certificado);
    return pem unless pem.status
    pem = pem.data;
    key = pem.toString 'ascii'
    sign = crypto.createSign 'RSA-SHA256'
    sign.update digest
    signature = sign.sign(key, 'base64')
    return {status: true, signature: signature}
  ,
  sign_cfdi : (xml, certificado) ->
    cfdi = this.validate_schema xml
    return {status: false, errors: ['Invalid xml, not schema structure']} unless cfdi.status

    result = @.get_cadena_original cfdi.xml
    return {status: false} unless result.status

    digest = @.get_digest result.cadena_original
    signature = @.sign_digest(certificado, digest.digest)

    return {status: true, signature : signature};