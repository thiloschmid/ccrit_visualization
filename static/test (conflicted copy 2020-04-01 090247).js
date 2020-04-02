var margin = { top: 50, right: 50, bottom: 50, left: 50 }
      , width = 700 - margin.left - margin.right // Use the window's width 
      , height = 500 - margin.top - margin.bottom; // Use the window's height

var svg = d3.select("#plot")
  .append("svg")
  .attr("width", width + 100)
  .attr("height", height + 100)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

filenames = [
  'T1-C1-V', 'T2-W1-V', 'T2-W2-V', 'B3-A1-V', 'B3-A1-H', 'T4-S1-H', 
  'B1-E1-H_and_B1-E2-H', 'T3-W1-V', 'T3-W2-V'
]

d3.text("../data/" + "T1-C1-V" + ".csv").then( function (data) {
  var dataset = d3.csvParseRows(data)
  x = dataset[0]
  y = dataset[1]

  var xScale = d3.scaleLinear()
    .domain(d3.extent(x))
    .range([0, width])

  var yScale = d3.scaleLinear()
    .domain(d3.extent(y))
    .range([height, 0])

  var line = d3.line()
    // i is the index of the element, how convenient
    .x((d, i) => xScale(x[i]))
    .y(d => yScale(d))
  //.curve(d3.curveMonotoneX)

  console.log(svg)

  svg.append("g")
    .attr("class", "x axis")
    .call(d3.axisBottom(xScale))
    .attr("transform", "translate(0, " + height + ")")

  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(yScale))

  svg.append("path")
    .datum(y)
    .attr("class", "line")
    .attr("d", line)
    .on("click", arg => console.log(arg))

  svg.selectAll(".dot")
    .data(y)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("cx", (d, i) => xScale(x[i]))
    .attr("cy", d => yScale(d))
    .attr("r", 5)
    .on("click", arg => console.log(arg))

  console.log(svg)
})


// plotCsv("B3-A1-H")
// plotCsv("B3-A1-V")