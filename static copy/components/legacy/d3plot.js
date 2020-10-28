import { filenames, getSampleData } from '../../config.js'

export { showPlots }

const
  svgWidth = 800,
  svgHeight = 600,
  circleRadius = 7,
  circleRadiusSelected = 10,
  markerSideLength = 12

const 
  TOOLTIP_X_OFFSET = 80,
  TOOLTIP_Y_OFFSET = 40


var legend

const margin = { top: 50, right: 50, bottom: 60, left: 70 }
  , width = svgWidth - margin.left - margin.right
  , height = svgHeight - margin.top - margin.bottom

const xScale = d3.scaleLinear()
  .domain([0, 3]) // range of the critical chloride contents
  .range([0, width])

const yScale = d3.scaleLinear()
  .domain([0, 1]) // range of probabilities
  .range([height, 0])

// Add the SVG element where the plot is drawn 
// fixed aspect ratio makes the plot scalable
const svg = d3.select('#plot')
  .append('svg')
  .attr('preserveAspectRatio', 'xMinYMin meet')
  .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
  .classed('svg-content-responsive', true)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.right + ')')

// x axis label
svg.append('text')
  .attr('text-anchor', 'end')
  .attr('x', width / 2 + 130)
  .attr('y', height + 40)
  .text('Chloride content [% of cement weight]');

// y axis label
svg.append('text')
  .attr('text-anchor', 'end')
  .attr('transform', 'rotate(-90)')
  .attr('y', -40)
  .attr('x', -height / 2 + 110)
  .text('Cumulative corrosion frequency')

// Add x axis
svg.append('g')
  .attr('class', 'x axis')
  .call(d3.axisBottom(xScale))
  .attr('transform', 'translate(0, ' + height + ')')

// Add y axis
svg.append('g')
  .attr('class', 'y axis')
  .call(d3.axisLeft(yScale))

// dots for the measurements
const gDots = svg.append('g')

// setup color 'scale' s.t. each filename is assigned a color
var myColor = d3.scaleOrdinal()
  .domain(filenames)
  .range(d3.schemeTableau10);

var currentlySelectedPlot = null,
  currentlySelectedSample = null

// show plot details in the divider below
async function plotDetails(name) {
  d3.select('div#structure-details').style('visibility', 'visible')

  // deselect currently selected plot
  if (currentlySelectedPlot !== null) {
    currentlySelectedPlot.classed('selected', false)
  }

  // select the new plot
  currentlySelectedPlot = d3.select('div.plot-legend-entry#' + name)
    .classed('selected', true)

  const sampleDetails = await getSampleData()

  d3.select('#plot-title')
    .text(name.replace(/_/g, ' '))

  var details = sampleDetails[name]
  var keys = Object.keys(details['Common values'])

  d3.selectAll('.structure-tablerow').remove()

  var tablerow = d3.select('#plot-table')
    .selectAll('tablerow')
    .data(keys)
    .enter()
    .append('tr')
    .attr('class', 'tablerow structure-tablerow')

  tablerow.append('th')
    .attr('scope', 'row')
    .text(d => d)

  tablerow.append('td')
    .text(d => details['Common values'][d])
}

function clearSampleDetails() {
  d3.select('div#sample-details').style('visibility', 'hidden')
}

// show plot details in the divider below
async function sampleDetails(name, index) {
  const sampleData = await getSampleData()

  // remove current table rows
  d3.selectAll('.sample-tablerow').remove()

  // make the div visible
  d3.select('div#sample-details').style('visibility', 'visible')


  d3.select('#sample-title')
    .text(name.replace(/_/g, ' ') + ' ' + 'sample ' + (index + 1))

  var details = sampleData[name]
  var keys = Object.keys(details['Sample-specific values'])

  let tablerow = d3.select('#sample-table')
    .selectAll('tablerow')
    .data(keys)
    .enter()
    .append('tr')
    .attr('class', 'tablerow sample-tablerow')

  tablerow.append('th')
    .attr('scope', 'row')
    .text(d => d)

  tablerow.append('td')
    .text(d => details['Sample-specific values'][d][index])
}

var tooltip = d3.select('#plot')
  .append('div')
  .style('opacity', 0)
  .attr('class', 'tooltip')
  .style('background-color', 'white')
  .style('border', 'solid')
  .style('border-width', '1px')
  .style('border-radius', '5px')
  .style('padding', '10px')

// creates a plot of the data in the file 
var plotCsv = async function (filename) {
  // d3.text() returns a promise
  const data = await d3.text('./data/' + filename + '.csv') //.then( function (data) {

  // returns an 2-array: [ x(100), y(100) ]
  var dataset = d3.csvParseRows(data)

  let x = dataset[0]
  let y = dataset[1]

  let ccrit_measurements = dataset[2] ? dataset[2] : []

  let points = []

  for (let i = 0; i < ccrit_measurements.length; i++) {
    points.push({
      x: ccrit_measurements[i],
      y: (i + 1) / (ccrit_measurements.length + 1),
      sampleName: filename,
      nPoints: ccrit_measurements.length
    })
  }

  // add line element
  let line = d3.line()
    // i is the index of the element, how convenient
    .x((d, i) => xScale(x[i]))
    .y(d => yScale(d))
    .curve(d3.curveMonotoneX)

  // draw the path
  let path = svg.append('path')
    .datum(y)
    .attr('class', 'line')
    .attr('d', line)
    .attr('stroke', myColor(filename))
    .style('stroke-width', 4)
    .datum(filename)
    .on('click', d => {
      clearSampleDetails()
      plotDetails(d)
    })


  let datapoints = gDots.selectAll()
    .data(points)
    .enter()

  let dots = datapoints.append('circle')
    .attr('class', d => 'dot' + d)
    .attr('id', (d, i) => '' + d.sampleName + '_' + i)
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', circleRadius)
    .style('fill', myColor(filename))
    .on('mouseover', function (d) {
      tooltip.style('opacity', 1)
      d3.select(this)
        .attr('r', circleRadiusSelected)
    })
    .on('mousemove', function (d, i) {
      const {width: canvasWidth, height: canvasHeight} = d3.select('.svg-content-responsive').node().getBoundingClientRect()
      const [mouseX, mouseY] = d3.mouse(this)
      tooltip.html(
        '<strong>' + d.sampleName.replace(/_/g, ' ') + ' [' + (i + 1) + ' of ' + d.nPoints + ']</strong> ' +
        '<br> Chloride content: ' + d.x + '%' +
        '<br> Corrosion probability: ' + d.y.toFixed(2))
        .style(
          mouseX < canvasWidth/2 ? 'left' : 'right', (mouseX + TOOLTIP_X_OFFSET) + 'px')
        .style(
          mouseY < canvasHeight/2 ? 'top' : 'bottom', (mouseY + TOOLTIP_Y_OFFSET) + 'px')
    })
    .on('mouseout', function (d) {
      tooltip.style('opacity', 0)
      d3.select(this)
        .attr('r', circleRadius)
    })
    .on('click', function (d, i) {
      d3.selectAll('.dot')
        .classed('selected', false)
        .attr('r', circleRadius)
      plotDetails(d.sampleName)
      sampleDetails(d.sampleName, i)
      d3.select(this)
        .attr('r', circleRadiusSelected)
        .classed('selected', true)
    })
  // append rectangles too but hide them
  let rects = datapoints.append('rect')
    .attr('class', 'square')
    .attr('id', (d, i) => '' + d.sampleName + '_' + i)
    .attr('x', d => xScale(d.x) - markerSideLength / 2)
    .attr('y', d => yScale(d.y) - markerSideLength / 2)
    .attr('width', markerSideLength)
    .attr('height', markerSideLength)
    .style('fill', myColor(filename))
    .style('visibility', 'hidden')
    .on('mouseover', function (d) {
      tooltip.style('opacity', 1)
    })
    .on('mousemove', function (d, i) {
      tooltip.html(
        '<strong>' + d.sampleName.replace(/_/g, ' ') + ' [' + (i + 1) + ' of ' + d.nPoints + ']</strong> ' +
        '<br> Chloride content: ' + d.x + '%' +
        '<br> Corrosion probability: ' + d.y.toFixed(2))
        .style('left', (d3.mouse(this)[0] + TOOLTIP_X_OFFSET) + 'px')
        .style('top', (d3.mouse(this)[1] + TOOLTIP_Y_OFFSET) + 'px')
    })
    .on('mouseout', function (d) {
      tooltip.style('opacity', 0)
      d3.select(this)
        .attr('width', markerSideLength)
        .attr('height', markerSideLength)
    })
    .on('click', function (d, i) {
      d3.selectAll('.dot')
        .classed('selected', false)
        .attr('width', markerSideLength)
        .attr('height', markerSideLength)
      plotDetails(d.sampleName)
      sampleDetails(d.sampleName, i)
      d3.select(this)
        .classed('selected', true)
    })

  return { path: path, dots: dots, rects: rects }
}

// store all plots in an object
var plots = {};
for (let i = 0; i < filenames.length; i++) {
  let fname = filenames[i]
  plotCsv(fname).then(p =>
    plots[fname] = {
      path: p.path,
      dots: p.dots,
      rects: p.rects,
      showPath: true,
      showPoints: true,
      showRects: false
    })
}

function togglePath(filename) {
  let p = plots[filename]
  if (p.showPath) {
    p.path.attr('stroke', 'none')
  } else {
    p.path.attr('stroke', myColor(filename))
  }
  p.showPath = !p.showPath
}

function togglePoints(filename, rectMarkers = false) {
  let p = plots[filename]
  if (p.showPoints) {
    p.dots.style('visibility', 'hidden')
      .classed('not-active', true)
    p.showPoints = !p.showPoints
  } else if (p.showRects) {
    p.rects.style('visibility', 'hidden')
      .classed('not-active', true)
    p.showRects = !p.showRects
  } else if (rectMarkers) {
    p.rects.style('visibility', 'visible')
      .classed('not-active', false)
    p.showRects = !p.showRects
  } else {
    p.dots.style('visibility', 'visible')
      .classed('not-active', false)
    p.showPoints = !p.showPoints
  }
}

function showAllPaths() {
  for (let i = 0; i < filenames.length; i++) {
    plots[filenames[i]].path.attr('stroke', myColor(filenames[i]))
    plots[filenames[i]].showPath = true
  }
  // check all checkboxes
  d3.select('#plot-selection')
    .selectAll('input[type=checkbox].plot-cb-path')
    .property('checked', true)
}

function hideAllPaths() {
  for (let i = 0; i < filenames.length; i++) {
    plots[filenames[i]].path.attr('stroke', 'none')
    plots[filenames[i]].showPath = false
  }
  // uncheck all checkboxes
  d3.select('#plot-selection')
    .selectAll('input[type=checkbox].plot-cb-path')
    .property('checked', false)
}

function showAllPoints() {
  for (let i = 0; i < filenames.length; i++) {
    plots[filenames[i]].dots
      .style('visibility', 'visible')
      .classed('not-active', false)
    plots[filenames[i]].showPoints = true
  }
  // check all checkboxes
  d3.select('#plot-selection')
    .selectAll('input[type=checkbox].plot-cb-points')
    .property('checked', true)
}

function hideAllPoints() {
  filenames.forEach(filename => {
    plots[filename].dots
      .style('visibility', 'hidden')
      .classed('not-active', true)
    plots[filename].rects
      .style('visibility', 'hidden')
      .classed('not-active', true)
    plots[filename].showPoints = false
    plots[filename].showRects = false
  })
  // uncheck all checkboxes
  d3.select('#plot-selection')
    .selectAll('input[type=checkbox].plot-cb-points')
    .property('checked', false)
}

// create checkboxes to select plots
var myDiv = d3.select('#plot-selection')
  .selectAll('myOptions')
  .data(filenames)
  .enter()
  .append('div')
  .attr('class', 'plot-legend-entry')
  .attr('id', d => d)
  .style('border', d => '4px solid ' + myColor(d))
  .on('click', d => {
    clearSampleDetails()
    plotDetails(d)
  })

myDiv.append('input')
  .attr('type', 'checkbox')
  .attr('class', 'plot-checkbox plot-cb-points')
  .attr('id', fn => fn)
  .attr('value', fn => fn)
  .attr('checked', true)
  .on('click', filename => togglePoints(filename))

myDiv.append('input')
  .attr('type', 'checkbox')
  .attr('class', 'plot-checkbox plot-cb-path')
  .attr('id', fn => fn)
  .attr('value', fn => fn)
  .attr('checked', true)
  .on('click', filename => togglePath(filename))

myDiv.append('label')
  .attr('class', 'form-check-label ml-1 mt-0')
  .attr('for', fn => fn)
  // replace all '_' with spaces
  .text(fn => fn.replace(/_/g, ' '))

d3.select('input.select-all')
  .on('click', showAllPaths)

d3.select('input.select-none')
  .on('click', hideAllPaths)

d3.select('input.select-all-pts')
  .on('click', showAllPoints)

d3.select('input.select-none-pts')
  .on('click', hideAllPoints)

legend = svg.append('g')
legend.append('text')
  .attr('class', 'legend-text')
  .attr('text-anchor', 'beginning')
  .attr('x', 0.8 * width)
  .attr('y', 0.8 * height)
  .text('First selection')
legend.append('text')
  .attr('class', 'legend-text')
  .attr('text-anchor', 'beginning')
  .attr('x', 0.8*width)
  .attr('y', (0.8*height+20))
  .text('Second selection');
legend.append('circle')
  .attr('text-anchor', 'beginning')
  .attr('class', 'legend')
  .attr('cx', (0.8 * width - 21 + circleRadius))
  .attr('cy', (0.8 * height - circleRadius))
  .attr('r', circleRadius)
legend.append('rect')
  .attr('text-anchor', 'beginning')
  .attr('width', markerSideLength)
  .attr('height', markerSideLength)
  .attr('class', 'legend-alt')
  .attr('x', (0.8 * width - 20))
  .attr('y', (0.8 * height + 20 - markerSideLength))

legend.style('visibility', 'hidden')

function showPlots(ids, altIds) {
  console.log('circs: ', ids)
  console.log('rects: ', altIds)
  hideAllPaths()
  hideAllPoints()
  ids.forEach(id => {
    // togglePath(id)
    togglePoints(id)
    // check the checkboxes
    let sel = d3.selectAll('.plot-cb-points')
      .filter('#' + id)
      .property('checked', true)
  })
  altIds.forEach(id => {
    // togglePath(id)
    togglePoints(id, true)
    // check the checkboxes
    let sel = d3.selectAll('.plot-cb-points')
      .filter('#' + id)
      .property('checked', true)
  })

  if (!ids.length && !altIds.length) {
    // show no plots
    legend.style('visibility', 'hidden')
  } else {
    // show legend
    legend.style('visibility', 'visible')
  }
}