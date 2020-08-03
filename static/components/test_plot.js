import { structurenames, structurenameColorMap, discreteHeaders } from '../config.js'
import { getStructureData, collectSampleData, getSampleDataJson } from '../loaddata.js'

// Import different plots
import { scatterPlot } from './scatterplot.js'
import { discretePlot } from './discreteplot.js'
import { linePlot } from './lineplot.js'
import { plotControls } from './plotcontrols.js'

// for the filter functionality
export { showPlots }

// store if the current plot is 'discrete' or 'scatter' 
var currentPlot

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

// legend shown to the right of the plot used by both plots
const myControls = plotControls()

// show the scatter plot initially
showScatterPlot()

/* ----------------------------------------------------------------------------
    Function that draws the scatter plot on the canvas and attaches the click events
    to the checkboxes in the plot controls. 
*/
async function showScatterPlot() {
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
    console.log(currentPlot)
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
        
        dropdown.append('button')
            .attr('class', 'dropbtn')
            .text('Select header')

        let dropdownContent = dropdown.append('div')
            .attr('class', 'dropdown-content')

        console.log(discreteHeaders)
        console.log(dropdownContent)            
    
        dropdownContent.selectAll('a')
            .data(discreteHeaders)
            .enter()
            .append('a')
            .text(d => d)
            .on('click', d => showDiscretePlot(d))

        currentPlot = 'discrete'

        myDiscretePlot
            .header(header)

        collectSampleData().then(data => {
            console.log(data)
            d3.select('#plot')
                .datum(data) // equivalent to data([samples])
                .call(myDiscretePlot)
        })
        // only need one checkbox since there are no lines to toggle
        myControls
            .checkboxHandler([myDiscretePlot.showPoints])
            .checkboxLabels(['Data pts.'])

        d3.select('#plot-selection')
            .datum(structurenames)
            .call(myControls)

        d3.select('input#select-all-0')
            .on('click', () => myControls.checkPoints(structurenames, 0, true))

        d3.select('#select-none-0')
            .on('click', () => myControls.checkPoints(structurenames, 0, false))

    } else {
        console.log('this')

        myDiscretePlot
            .header(header)

        d3.select('#plot')
            .call(myDiscretePlot)
    }

}


// TEST
d3.select('#test-button2')
    .on('click', e => {
        showScatterPlot()
    })

d3.select('#test-button')
    .on('click', e => {
        showDiscretePlot('Steel-concrete interface information: Concrete not at corrosion spot')
    })

d3.select('#test-button3')
    .on('click', e => {
        showDiscretePlot('Steel-concrete interface information: Concrete at corrosion spot')
    })
// -----------------------------------

/* ----------------------------------------------------------------------------
    Functions called by the filter 
*/
async function showPlots(sel_1, sel_2) {
    if (currentPlot !== 'scatter') {
        await showScatterPlot()
    }
    myControls.checkPoints(structurenames, 0, false)
    myControls.checkPoints(structurenames, 1, false)
    sel_1 && myControls.checkPoints(sel_1, 0, true)
    sel_2 && myControls.checkPoints(sel_2, 1, true)
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

    console.log(sampleData)

    d3.select('#plot-title')
        .text(structurename.replace(/_/g, ' '))

    var details = sampleData[structurename]
    var keys = Object.keys(details['Common values'])
    console.log(sampleData)
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