import { sortableHeaders } from '../config.js'
import { getSampleDataJson } from '../loaddata.js'
import { showPlots } from './plot.js'

var rowSelection = {}
var altRowSelection = {}

const hideFilterMenu = function () {
  d3.select("#filter")
    .style("display", "none")
  // hide if clicked again
  d3.select('#filter-link')
    .on('click', showFilterMenu)
}

const showFilterMenu = function () {
  d3.select("#filter")
    .style("display", "inline-block")
  // hide if clicked again
  d3.select('#filter-link')
    .on('click', hideFilterMenu)
}

d3.select("#filter-link")
  .on("click", showFilterMenu)

d3.select("#close-filter")
  .on("click", hideFilterMenu)

function setFilter(event, name) {
  // function called by clicking on the different filter tabs
  d3.selectAll('.tablinks')
    .classed('active', false)

  d3.select('#tablink-' + name)
    .classed('active', true)

  d3.selectAll('.tabcontent')
    .classed('tabcontent-active', false)

  d3.select('#' + name + '-filter')
    .classed('tabcontent-active', true)
}

// make the function global to have easy onClick functionality
window.setFilter = setFilter

async function createTable() {
  const sampleData = await getSampleDataJson()
  const sampleArray = Object.entries(sampleData)

  // append header
  let table = d3.select('#filter-sort-table')

  var headers = table.append('thead').append('tr')

  var sortAscending = true

  headers.selectAll('th')
    .data(['ID', ...sortableHeaders]).enter()
    .append('th')
    .attr('scope', 'column')
    .text(d => d === 'Meters above sea level [m a.s.l.]' ? 'Altitude [m a.s.l.]' : d)
    .on('click', d => {
      if (sortAscending) {
        rows.sort((a, b) => a[1]['Sortable headers'][d] > b[1]['Sortable headers'][d])//console.log(a, b))
        sortAscending = false
      } else {
        rows.sort((a, b) => a[1]['Sortable headers'][d] < b[1]['Sortable headers'][d])//console.log(a, b))
        sortAscending = true
      }
    })

  var rows = table.append('tbody').selectAll('tr')
    .data(sampleArray).enter()
    .each(d => rowSelection[d[0]] = false)
    .each(d => altRowSelection[d[0]] = false)
    .append('tr')
    .on('click', toggleRowSelection) // d[0] is the structure name (str)

  rows.selectAll('td')
    // data: [id, sortable common values]
    .data((d, i) => [d[0], ...sortableHeaders.map(h => d[1]['Common values'][h])])
    .enter()
    .append('td')
    // regEx selects all (g: global flag) occurences of '_' by ' '
    .text(d => typeof d === 'string' ? d.replace(/_/g, ' ') : d)
  //(d => d ? d.replace(/_/g, " ") : '') // return empty string if d is undefined
}

async function createCurrentTable(ids, altIds) {
  const sampleData = await getSampleDataJson()
  //const sampleArray = Object.entries(sampleData)

  // append header
  let table = d3.select('#filter-curr-table')

  // remove existing rows
  table.selectAll('tr').remove()

  var headers = table.append('thead').append('tr')

  var sortAscending = true

  headers.selectAll('th')
    .data(['ID', ...sortableHeaders]).enter()
    .append('th')
    .attr('scope', 'column')
    .text(d => d === 'Meters above sea level [m a.s.l.]' ? 'Altitude [m a.s.l.]' : d)
    .on('click', d => {
      if (sortAscending) {
        rows.sort((a, b) => a[1]['Sortable headers'][d] > b[1]['Sortable headers'][d])//console.log(a, b))
        sortAscending = false
      } else {
        rows.sort((a, b) => a[1]['Sortable headers'][d] < b[1]['Sortable headers'][d])//console.log(a, b))
        sortAscending = true
      }
    })

  let tbody = table.append('tbody')

  let rows = tbody.selectAll('.selected-row')
    .data(ids).enter()
    .append('tr')
    .attr('class', 'selected-row')

  let altRows = tbody.selectAll('.selected-row-alt')
    .data(altIds).enter()
    .append('tr')
    .attr('class', 'selected-row-alt')

  rows.selectAll('td')
    // data: [id, sortable common values]
    .data(id => [id, ...sortableHeaders.map(h => sampleData[id]['Common values'][h])])
    .enter()
    .append('td')
    // regEx selects all (g: global flag) occurences of '_' by ' '
    .text(d => typeof d === 'string' ? d.replace(/_/g, ' ') : d)
  //(d => d ? d.replace(/_/g, " ") : '') // return empty string if d is undefined

  altRows.selectAll('td')
    // data: [id, sortable common values]
    .data(id => [id, ...sortableHeaders.map(h => sampleData[id]['Common values'][h])])
    .enter()
    .append('td')
    // regEx selects all (g: global flag) occurences of '_' by ' '
    .text(d => typeof d === 'string' ? d.replace(/_/g, ' ') : d)
  //(d => d ? d.replace(/_/g, " ") : '') // return empty string if d is undefined
}

function toggleRowSelection(d) {
  // toggles the selection on the clicked row
  let id = d[0]
  if (!d3.select('#selection-toggle-switch').node().checked) {
    rowSelection[id] = !rowSelection[id]
    altRowSelection[id] = false // reset the second selection for all toggles
  } else {
    altRowSelection[id] = !altRowSelection[id]
    rowSelection[id] = false // reset the first selection
  }
  // fix the classes
  d3.select(this)
    .classed('selected-row', rowSelection[id])
    .classed('selected-row-alt', altRowSelection[id])
}

function clearRowSelection() {
  rowSelection = {}
  altRowSelection = {}
  d3.select('#filter-sort-table').selectAll('tr')
    .classed('selected-row', false)
    .classed('selected-row-alt', false)
  showPlots([], [])
  createCurrentTable([], [])

  d3.selectAll('circle')
    .classed('selection-1', false)
    .classed('selection-2', false)

  d3.selectAll('.plot-legend-entry')
    .classed('legend-selection-1', false)
    .classed('legend-selection-2', false)
}

function getSelectedIds() {
  return Object.keys(rowSelection).filter(id => rowSelection[id])
}

function getAltSelectedIds() {
  // second selection
  return Object.keys(altRowSelection).filter(id => altRowSelection[id])
}

// bind 'show selected' button
d3.select('#show-selected')
  .on('click', () => {
    showPlots(getSelectedIds(), getAltSelectedIds())
    createCurrentTable(getSelectedIds(), getAltSelectedIds())
  })

// bind clear selection button
d3.select('#clear-selection')
  .on('click', clearRowSelection)

createTable()