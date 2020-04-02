var d3 = require("d3")
var fetch = require("node-fetch")

//var x = [1,2,3,4,5,6,7,8,9,10]

// squares all elements
//var y = x.map( value => Math.exp(value) )

//var f = (x, y) => console.log(y)

//f(1,2)

//console.log(y)

d3.text("ccrit_data_1.csv").then( function () {
    var dataset = d3.csvParseRows(data)
    console.log(dataset)
})
