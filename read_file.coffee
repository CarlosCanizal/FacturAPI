fs = require('fs')
module.exports = 
  read_file_sync: (filename) ->
    variable = {}
    try 
      variable.status = true
      variable.data = fs.readFileSync filename
    catch error
      variable.status = false
      variable.error = 'Error reading file #{filename} : #{error}'
    variable