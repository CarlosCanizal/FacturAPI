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
      return {code:500,status: false, error: err}

    try
      xml_string = x.parseXmlString xml.data
    catch error
      return {code:400,status: false, error: error}

    is_valid = xml_string.validate xsd_string
    return {code:200 ,status: true, xml: xml_string} if is_valid
    return {code:300 ,status: false, error: 'Invalid xml, not schema structure'} 
  ,
  get_cadena_original : (xml) ->
    factura = xslt.readXmlString xml
    try
      cadena_original = xslt.readXsltFile('schemas/cadenaoriginal_3_2.xslt')
    catch err
      return {code:500, status: false, error: err}
    params = [];
    transformedString = xslt.transform(cadena_original, factura, params)
    return {code:200, status: true, cadena_original: transformedString, error: [] }
  ,
  get_digest : (cadena_original) ->
    shasum = crypto.createHash 'sha1'
    shasum.update(cadena_original, 'utf8')
    digest = shasum.digest 'hex'
    return {code:200 , status: true, digest: digest}
  ,
  sign_digest : (certificado, digest) ->
    pem = fs.read_file_sync(certificado);
    return pem unless pem.status
    pem = pem.data;
    key = pem.toString 'ascii'
    sign = crypto.createSign 'RSA-SHA256'
    sign.update digest
    signature = sign.sign(key, 'base64')
    return {code:200,status: true, signature: signature} if signature
    return {code:409,status: false, error: 'Error signing xml, check your PEM file.'}
  ,
  sign_cfdi : (xml, certificado) ->
    cfdi = @.validate_schema xml
    #return {code:cfdi.code, status: false, errors: ['Invalid xml, not schema structure']} unless cfdi.status
    return cfdi unless cfdi.status

    result = @.get_cadena_original cfdi.xml
    return result unless result.status

    digest = @.get_digest result.cadena_original
    signature = @.sign_digest(certificado, digest.digest)
    return signature