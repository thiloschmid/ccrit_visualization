import { structurenames, structurenameColorMap, discreteHeaders, nonDiscreteHeaders } from '../config.js'
import { getStructureData, collectSampleData, getSampleDataJson } from '../loaddata.js'

// Import different plots
import { scatterPlot } from './scatterplot.js'
import { discretePlot } from './discreteplot.js'
import { linePlot } from './lineplot.js'
import { plotControls } from './plotcontrols.js'

// for the filter functionality
export { showPlots }


// TEST
d3.select('#tab-plot1')
    .on('click', function () {
        d3.selectAll('.plot-tab')
            .classed('active', false)
        d3.select(this).classed('active', true)
        showScatterPlot()
    })

d3.select('#tab-plot2')
    .on('click', function () {
        d3.selectAll('.plot-tab')
            .classed('active', false)
        d3.select(this).classed('active', true)
        showDiscretePlot('Steel-concrete interface information: Concrete at corrosion spot')
    })
// ============================================================================

// store if the current plot is 'discrete' or 'scatter' 
var currentPlot

var dropdownButton

// details of the selected structure and samples are shown in a table below
var selectedStructure = null,
    selectedSample = null

// define the plots and attach the same colormap which maps the structure name
// to a color
const myScatterPlot = scatterPlot()
    .colormap(d => structurenameColorMap(d.structurename))
    .onClickHandler(
        d => {
            plotDetails(d.structurename)
            sampleDetails(d.structurename, d.index)
        }
    )

const myLinePlot = linePlot()
    .colormap(d => structurenameColorMap(d.structurename))
    .dashed(true)   // make the lines dashed

const myDiscretePlot = discretePlot()
    .colormap(d => structurenameColorMap(d.structurename))
    .onClickHandler(
        d => {
            plotDetails(d.structurename)
            sampleDetails(d.structurename, d.index)
        }
    )

const myAttributePlot = scatterPlot()
    .colormap(d => structurenameColorMap(d.structurename))
    .onClickHandler(
        d => {
            plotDetails(d.structurename)
            sampleDetails(d.structurename, d.index)
        }
    )

// legend shown to the right of the plot used by both plots
const myControls = plotControls()

// show the scatter plot initially
showScatterPlot()

/* ----------------------------------------------------------------------------
    Function that draws the scatter plot on the canvas and attaches the click events
    to the checkboxes in the plot controls. 
*/
async function showScatterPlot() {
    let currentSelection = myControls.checkPoints()
    let activeStructures = Object.keys(currentSelection).filter(key => currentSelection[key])

    if (currentPlot !== 'scatter') {

        let q = d3.select('div.dropdown')
        console.log(q)
        q.remove()
    }

    currentPlot = 'scatter'

    // clear canvas & legend
    d3.select('#plot').select('svg').remove()
    d3.selectAll('#plot-selection > .plot-legend-entry').remove()

    const { points, lines } = await getStructureData(structurenames)
    d3.select('#plot')
        .datum(points)
        // draw the plot on this selection with above data
        .call(myScatterPlot)

    // set the axis of the line plot to be the same
    myLinePlot
        .xScale(myScatterPlot.xScale())
        .yScale(myScatterPlot.yScale())

    d3.select('#plot')
        .datum(lines)
        .call(myLinePlot)


    // make it two checkboxes (because the array is 2 long) and assign checkHandlers
    myControls
        .checkboxHandler([myScatterPlot.showPoints, myLinePlot.showLines])
        .checkboxLabels(['Data pts.', 'Fit'])
        .instructions(
            'Click on a point on the left to display sample-specific information and measurements. \
            The measurements and the log-normal fit can be toggled by clicking on the checkboxes below.'
        )

    d3.select('#plot-selection')
        .datum(structurenames)
        .call(myControls)

    d3.select('input#select-all-0')
        .on('click', () => myControls.checkPoints(structurenames, 0, true))

    d3.select('input#select-none-0')
        .on('click', () => myControls.checkPoints(structurenames, 0, false))

    d3.select('input#select-all-1')
        .on('click', () => myControls.checkPoints(structurenames, 1, true))

    d3.select('input#select-none-1')
        .on('click', () => myControls.checkPoints(structurenames, 1, false))
}

/* ----------------------------------------------------------------------------
    Function that draws the discrete plot on the canvas and attaches the click events
    to the checkboxes in the plot controls. 
*/
function showDiscretePlot(header) {
    let currentSelection = myControls.checkPoints()
    let activeStructures = Object.keys(currentSelection).filter(key => currentSelection[key])

    // set the desired header
    if (currentPlot !== 'discrete') {
        // clear canvas & legend
        d3.select('#plot').select('svg').remove()
        let plotSelection = d3.select('#plot-selection')
        plotSelection.selectAll('div').remove()

        // create dropdown menu to select header

        let dropdown = plotSelection
            .append('div')
            .attr('class', 'dropdown')

        dropdownButton = dropdown.append('button')
            .attr('class', 'dropbtn')
            // .text('Select attribute')
            .html(`<strong>${header}</strong>`)

        let dropdownContent = dropdown.append('div')
            .attr('class', 'dropdown-content')

        dropdownContent.selectAll('a')
            .data(discreteHeaders)
            .enter()
            .append('a')
            .text(d => d)
            .on('click', d => showDiscretePlot(d))

        dropdownContent.selectAll()
            .data(nonDiscreteHeaders)
            .enter()
            .append('a')
            .text(d => d)
            .on('click', d => showAttributePlot(d))

        myDiscretePlot
            .header(header)

        // only need one checkbox since there are no lines to toggle
        myControls
            .checkboxHandler([myDiscretePlot.showPoints])
            .checkboxLabels(['Data pts.'])
            .instructions(
                'Click on a point on the left to display sample-specific information and measurements. \
                The visibility of the circles can be toggled by clicking on the checkboxes below. \
                Select a different attribute for the x axis using the button below.'
            )

        d3.select('#plot-selection')
            .datum(structurenames)
            .call(myControls)

        collectSampleData().then(data => {
            console.log(data)
            d3.select('#plot')
                .datum(data) // equivalent to data([samples])
                .call(myDiscretePlot)
            myControls.checkSelection(activeStructures)
        })

        d3.select('input#select-all-0')
            .on('click', () => myControls.checkPoints(structurenames, 0, true))

        d3.select('#select-none-0')
            .on('click', () => myControls.checkPoints(structurenames, 0, false))

    } else {
        // let currentSelection = myControls.checkPoints(=
        myDiscretePlot
            .header(header)

        dropdownButton.html(`<strong>${header}</strong>`)

        d3.select('#plot')
            .call(myDiscretePlot)

        myControls.checkSelection(activeStructures)
    }

    console.log('act', activeStructures)
    currentPlot = 'discrete'

}

function showAttributePlot(header) {

    let currentSelection = myControls.checkPoints()
    let activeStructures = Object.keys(currentSelection).filter(key => currentSelection[key])

    currentPlot = 'attribute'

    dropdownButton.html(`<strong>${header}</strong>`)

    d3.select('#plot').select('svg').remove()

    myAttributePlot
        .X(d => d.sampleData[header])
        .Y(d => d.ccrit)
        .axisLabel([header, 'Chloride content [% of cement weight]'])
        .tooltipLabel([header, 'Chloride content [%]'])

    myControls
        .checkboxHandler([myAttributePlot.showPoints])

    d3.select('#plot-selection')
        .datum(structurenames)
        .call(myControls)

    collectSampleData().then(data => {
        d3.select('#plot')
            .datum(data)
            .call(myAttributePlot)

        myControls.checkSelection(activeStructures)
    })

    // myControls.checkSelection(currentSelection)
    console.log('act', activeStructures)
}


/* ----------------------------------------------------------------------------
    Functions called by the filter 
*/
async function showPlots(sel_1, sel_2) {
    // if (currentPlot !== 'scatter') {
    //     await showScatterPlot()
    // }

    // clear canvas
    myControls.checkPoints(structurenames, 0, false)

    if (currentPlot === 'scatter') {
        myControls.checkPoints(structurenames, 1, false)
    }

    sel_1 && myControls.checkPoints(sel_1, 0, true, 1)
    sel_2 && myControls.checkPoints(sel_2, 0, true, 2)
}


/* ----------------------------------------------------------------------------
    Functions called by clicking on a circle
*/

// show plot details in the divider below
async function plotDetails(structurename) {
    d3.select('div#structure-details').style('visibility', 'visible')

    // deselect currently selected plot
    if (selectedSample !== null) {
        selectedSample.classed('selected', false)
    }

    // select the new plot
    selectedSample = d3.select('div.plot-legend-entry#' + structurename)
        .classed('selected', true)

    const sampleData = await getSampleDataJson()

    d3.select('#plot-title')
        .text(structurename.replace(/_/g, ' '))

    var details = sampleData[structurename]
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

function clearSampleTable() {
    d3.select('div#sample-details').style('visibility', 'hidden')
}

// show sample details in the divider below
async function sampleDetails(structurename, index) {
    const sampleData = await getSampleDataJson()

    // remove current table rows
    d3.selectAll('.sample-tablerow').remove()

    // make the div visible
    d3.select('div#sample-details').style('visibility', 'visible')


    d3.select('#sample-title')
        .text(structurename.replace(/_/g, ' ') + ' ' + 'sample ' + (index + 1))

    var details = sampleData[structurename]
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