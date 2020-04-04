var svgWidth = 800,
    svgHeight = 500;

var margin = { top: 50, right: 50, bottom: 60, left: 70 }
  , width = svgWidth - margin.left - margin.right // Use the window's width 
  , height = svgHeight - margin.top - margin.bottom; // Use the window's height


var xScale = d3.scaleLinear()
  .domain([0, 6]) // range of the critical chloride contents
  .range([0, width])

var yScale = d3.scaleLinear()
  .domain([0, 1]) // range of probabilities
  .range([height, 0])

// Add the SVG element where the plot is drawn 
// fixed aspect ratio makes the plot scalable
var svg = d3.select("#plot")
  .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight)
    .classed("svg-content-responsive", true)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

// x axis label
svg.append("text")
  .attr("text-anchor", "end")
  .attr("x", width / 2 + 130)
  .attr("y", height + 40)
  .text("Chloride content [M-pct. by cem. wt.]");

// y axis label
svg.append("text")
  .attr("text-anchor", "end")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("x", -height / 2 + 70)
  .text("Corrosion probability")

// Add x axis
svg.append("g")
  .attr("class", "x axis")
  .call(d3.axisBottom(xScale))
  .attr("transform", "translate(0, " + height + ")")

// Add y axis
svg.append("g")
  .attr("class", "y axis")
  .call(d3.axisLeft(yScale))

var gDots = svg.append("g")

// add line element
var line = d3.line()
  // i is the index of the element, how convenient
  .x((d, i) => xScale(x[i]))
  .y(d => yScale(d))
  .curve(d3.curveMonotoneX)

var filenames = [
  'T1-C1-H', 'T2-W1-V', 'T2-W2-V', 'B3-A1-V', 'B3-A1-H', 'T4-S1-H',
  'B1-E1-H_and_B1-E2-H', 'T3-W1-V', 'T3-W2-V'
];

sampleDetailsPromise = d3.json("./data/sample-details.json")

// setup color "scale" s.t. each filename is assigned a color
var myColor = d3.scaleOrdinal()
  .domain(filenames)
  .range(d3.schemeTableau10);

// show plot details in the divider below
var plotDetails = async function (name) {
  d3.select("div.plot-details").style("visibility", "visible")
  
  sampleDetails = await sampleDetailsPromise
  
  var p = d3.select("#plot-title")
    .text(name.replace(/_/g, " "))

  var details = sampleDetails.samples[name]
  var keys = Object.keys(details)

  d3.selectAll("#tablerow").remove()

  var tablerow = d3.select("tbody")
    .selectAll("tablerow")
    .data(keys)
    .enter()
    .append("tr")
    .attr("id", "tablerow")

  tablerow.append("th")
    .attr("scope", "row")
    .text(d => d)

  tablerow.append("td")
    .text(d => details[d])
}

var tooltip = d3.select("#plot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

// creates a plot of the data in the file 
var plotCsv = async function (filename) {
  // d3.text() returns a promise
  data = await d3.text("./data/" + filename + ".csv") //.then( function (data) {

  // returns an 2-array: [ x(100), y(100) ]
  var dataset = d3.csvParseRows(data)

  x = dataset[0]
  y = dataset[1]

  ccrit_measurements = dataset[2] ? dataset[2] : []

  points = []

  for (let i = 0; i < ccrit_measurements.length; i++) {
    points.push({
      x: ccrit_measurements[i],
      y: (i + 1) / (ccrit_measurements.length + 1),
      sampleName: filename,
      nPoints: ccrit_measurements.length
    })
  }

  path = svg.append("path")
    .datum(y)
    .attr("class", "line")
    .attr("d", line)
    .attr("stroke", myColor(filename))
    .style("stroke-width", 4)
    .datum(filename)
    .on("click", d => plotDetails(d))

  dots = gDots
    .selectAll("dot")
      .data(points)
      .enter()
    .append("circle")
      .attr("class", "dot")
      .attr("id", (d, i) => "" + d.sampleName + "_" + i)
      .attr("cx", d => xScale(d.x))
      .attr("cy", (d, i) => yScale(d.y))
      .attr("r", 7)
      .style("fill", myColor(filename))
      .on("mouseover", function(d) {
        console.log("mouseover")
        tooltip.style("opacity", 1)
        d3.select(this)
          .attr("r", 10)
          .classed("hovered", true)
      })
      .on("mousemove", function(d, i) {
        tooltip.html(
          "<strong>" + d.sampleName.replace(/_/g, " ") + " [" + (i+1) + " of " + d.nPoints + "]</strong> " + 
          "<br> Chloride content: " + d.x +
          "<br> Corrosion probability: " + d.y.toFixed(2))
        .style("left", (d3.mouse(this)[0]+130) + "px")
        .style("top", (d3.mouse(this)[1]+50 + "px"))
      })
      .on("mouseout", function(d) {
        tooltip.style("opacity", 0)
        d3.select(this)
          .attr("r", 7)
          .classed("hovered", false)
      })
      .on("click", d => plotDetails(d.sampleName))

  return { path: path, dots: dots }
}

// store all plots
var plots = {};
for (let i = 0; i < filenames.length; i++) {
  let fname = filenames[i]
  plotCsv(fname).then(p => plots[fname] = { path: p.path, dots: p.dots, show: true })
}

var togglePath = function (filename) {
  let p = plots[filename]
  if (p.show) {
    p.path.attr("stroke", "none");
    p.dots.style("visibility", "hidden")
      .classed("not-active", true)
  } else {
    p.path.attr("stroke", myColor(filename))
    p.dots.style("visibility", "visible")
      .classed("not-active", false)
  }
  p.show = !p.show
}

var showAllPaths = function () {
  for (let i = 0; i < filenames.length; i++) {
    plots[filenames[i]].path.attr("stroke", myColor(filenames[i]))
    plots[filenames[i]].dots
      .style("visibility", "visible")
      .classed("not-active", false)
    plots[filenames[i]].show = true
  }
}

var hideAllPaths = function () {
  for (let i = 0; i < filenames.length; i++) {
    plots[filenames[i]].path.attr("stroke", "none")
    plots[filenames[i]].dots
      .style("visibility", "hidden") 
      .classed("not-active", true)
    plots[filenames[i]].show = false
  }
}

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

// create checkboxes to select plots
var myDiv = d3.select("#plot-selection")
  .selectAll("myOptions")
  .data(filenames)
  .enter()
  .append("div")
  .attr("class", "form-check plot-check")
  .style("border", d => "4px solid " + myColor(d))
  .on("click", d => plotDetails(d))

myDiv.append("input")
  .attr("type", "checkbox")
  .attr("class", "form-check-input")
  .attr("id", fn => fn)
  .attr("value", fn => fn)
  .attr("checked", true)
  .on("click", d => togglePath(d))

myDiv.append("label")
  .attr("class", "form-check-label ml-1 mt-0")
  .attr("for", fn => fn)
  // replace all "_" with spaces
  .text(fn => fn.replace(/_/g, " ")) 

d3.select("input.select-all")
  .on("click", checkAll)

d3.select("input.select-none")
  .on("click", checkNone)
