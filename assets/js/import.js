var records = require('./resources/dataset/restaurants_list.json') //load the list of restaurants
var csv = require('fast-csv')
var merge = require('lodash.merge')
var info = {}
var final = []
var algoliasearch = require('algoliasearch')
var client = algoliasearch('G25069ZST3', '33edd1a1fea9b8c455cecbde90f8d040')


csv.fromPath('./resources/dataset/restaurants_info.csv', //parse the csv file
 {delimiter: ';', headers: true})
 .on('data', (data) => {
   var id = data.objectID + '' //convert the objectID to a string if not already
   var rating = new Number(data.stars_count)
   data.rating = rating
   var reviews = new Number(data.reviews_count)
   data.reviews_count = reviews
   info[id] = data
 }).on('end', () => {
  records.forEach((record) => { //merge each csv item into the restaurant list
    var recid = record.objectID + '' //convert the objectID to a string if not already
   var pay = []
   record.payment_options.forEach((method) => {
     if (method === 'Visa') {
       pay.push(method)
     } else if (method === 'MasterCard') {
       pay.push(method)
     } else if (method === 'AMEX') {
       pay.push(method)
     } else if (method === 'Discover') {
       pay.push(method)
     }
   })
   record.payment_options = pay;
    if (info[recid]) {
      var temp = {}
      merge(temp, record, info[recid])
      final.push(temp)
    } else {
      final.push(record)
    }
  })
  var index = client.initIndex('restaurants')
  index.clearIndex((err, content) => {  //clean out the index if you are importing multiple times
    if (err) {
      console.log('error deleting index')
    } else {
      console.log(content)
      index.addObjects(final,  (err, res) => { //batch push the objects into the index
        if (err) {
          console.log('error in import', err)
        } else {
          console.log('import complete', res)
        }
      })
    }
  })  
 })

