var margin = { top: 50, right: 50, bottom: 50, left: 50 }
      , width = 700 - margin.left - margin.right // Use the window's width 
      , height = 500 - margin.top - margin.bottom; // Use the window's height

var svg = d3.select("#plot")
  .append("svg")
  .attr("width", width + 100)
  .attr("height", height + 100)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

var xScale = d3.scaleLinear()
  .domain([0, 6])
  .range([0, width])

var yScale = d3.scaleLinear()
  .domain([0, 1])
  .range([height, 0])

svg.append("g")
  .attr("class", "x axis")
  .call(d3.axisBottom(xScale))
  .attr("transform", "translate(0, " + height + ")")

svg.append("g")
  .attr("class", "y axis")
  .call(d3.axisLeft(yScale))

var line = d3.line()
  // i is the index of the element, how convenient
  .x((d, i) => xScale(x[i]))
  .y(d => yScale(d))
  .curve(d3.curveMonotoneX)

var filenames = [
  'T1-C1-V', 'T2-W1-V', 'T2-W2-V', 'B3-A1-V', 'B3-A1-H', 'T4-S1-H', 
  'B1-E1-H_and_B1-E2-H', 'T3-W1-V', 'T3-W2-V'
];

var myColor = d3.scaleOrdinal()
      .domain(filenames)
      .range(d3.schemeSet1);

var plotDetails = function (data) {
  console.log(data.filename)
  var p = d3.select("#plot-title")
    .text(data.filename)
}

var plotCsv = async function (filename) {
  // d3.text() returns a promise
  data = await d3.text("./data/" + filename + ".csv") //.then( function (data) {
  
  // returns an 2-array: [ x(100), y(100) ]
  var dataset = d3.csvParseRows(data)

  x = dataset[0]
  y = dataset[1]

  path = svg.append("path")
    .datum(y)
    .attr("class", "line")
    .attr("d", line)
    .attr("stroke", myColor(filename))
    .style("stroke-width", 4)
    .datum({filename})
    .on("click", d => plotDetails(d) )

  return path
}

var plots = {};
for (let i = 0; i < filenames.length; i++) {
  let fname = filenames[i]
  plotCsv(fname).then(p => plots[fname] = {path: p, show: true})
}

var togglePath = function (filename) {
  let p = plots[filename]
  p.show
    ? p.path.attr("stroke", "none") 
    : p.path.attr("stroke", myColor(filename))

  p.show = !p.show
}

var showAllPaths = function () {
  for (let i = 0; i < filenames.length; i++ ) {
    plots[filenames[i]].path.attr("stroke", myColor(filenames[i]))
    plots[filenames[i]].show = true
  }
}

var hideAllPaths = function () {
  for (let i = 0; i < filenames.length; i++ ) {
    plots[filenames[i]].path.attr("stroke", "none")
    plots[filenames[i]].show = false
  }
}

// create checkboxes to select plots
var myDiv = d3.select("#plot-selection")
  .selectAll("myOptions")
    .data(filenames)
  .enter()
    .append("div")
      .attr("class", "form-check")
    
myDiv.append("input")
  .attr("type", "checkbox")
  .attr("class", "form-check-input")
  .attr("id", fn => fn)
  .attr("value", fn => fn)
  .attr("checked", true)
  .on("click", d => togglePath(d))

myDiv.append("label")
  .attr("class", "form-check-label")
  .attr("for", fn => fn)
  .text(fn => fn)



var checkAll = function () {
  d3.select("#plot-selection")
    .selectAll("input[type=checkbox]")
    .property("checked", true)
  showAllPaths()
}

var checkNone = function () {
  d3.select("#plot-selection")
    .selectAll("input[type=checkbox]")
    .property("checked", false)
  hideAllPaths()
}

d3.select("input.select-all")
  .on("click", checkAll)

d3.select("input.select-none")
  .on("click", checkNone)

