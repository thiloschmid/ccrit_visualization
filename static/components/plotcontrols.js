import { structurenameColorMap } from "../config.js"

export function plotControls() {
    var checkboxHandler = [d => console.log(d + '1'), d => console.log(d + '2')]
    var checkboxLabels = ['1', '2']
    var checkboxStatus = {}

    var instructions = ''

    var allStructureNames

    function my(selection) {

        // var plots = []
        selection.each(function (data) {
            allStructureNames = data

            // at the beginning all are shown
            data.forEach( d => {
                checkboxStatus[d] = true
            })
            
            // Write the instructions at the top
            d3.select('#plot-instructions')
                .text(instructions)
            
            const buttonRow = d3.select(this).selectAll('.button-row')
                .data(checkboxLabels)
                .enter()
                .append('div')
                .attr('class', 'button-row')
                
            buttonRow.append('span')
                .attr('class', 'button-label')
                .html( d => '<strong>' + d + '</strong>')

            buttonRow.append('input')
                .attr('class', 'btn btn-info px-2 py-1 ml-3 mr-1')
                .attr('type', 'button')
                .attr('value', 'show all')
                .attr('id', (d, i) => 'select-all-' + i)

            buttonRow.append('input')
                .attr('class', 'btn btn-info px-2 py-1')
                .attr('type', 'button')
                .attr('value', 'hide all')
                .attr('id', (d, i) => 'select-none-' + i)


            const plotDivs = d3.select(this)
                .selectAll('.plot-legend-entry')
                .data(data)
                .enter()
                .append('div')
                .attr('class', 'plot-legend-entry')
                .attr('id', d => d)
                .style('border', d => '4px solid ' + structurenameColorMap(d))
                .on('click', d => { })

            checkboxHandler.forEach((handler, i) => {
                plotDivs.append('input')
                    .attr('type', 'checkbox')
                    .attr('class', 'plot-checkbox')
                    .attr('id', structurename => structurename + '_' + i)
                    .attr('value', structurename => structurename)
                    .attr('checked', true)
                    .on('click', function (structurename) {
                        handler(structurename, this.checked)
                        if (i === 0) {
                            checkboxStatus[structurename] = this.checked
                        }
                        console.log('statnow', checkboxStatus)
                    })
            })

            plotDivs.append('label')
                .attr('class', 'form-check-label ml-1 mt-0')
                .attr('for', structurename => structurename)
                // replace all '_' with spaces
                .text(structurename => structurename.replace(/_/g, ' '))
        })
    }

    my.checkPoints = function (structurenames, i, checked, selection = false) {
        // selection has to be 1 or 2 false
        console.log('toggle', structurenames, checked)
        if (!arguments.length) {
            return checkboxStatus
        }
        // checks (unchecks if checked = false) the i'th checkbox(es) corresponding to the provided structurenames
        if (typeof structurenames === 'string')
            structurenames = [structurenames]

        let checkboxes = d3.selectAll('.plot-checkbox')
        let legendEntries = d3.selectAll('.plot-legend-entry')
        structurenames.forEach(structurename => {
            checkboxes
                .filter('#' + structurename + '_' + i)
                .property('checked', checked)

            if (selection) {
                legendEntries
                    .filter('#' + structurename)
                    .classed('legend-selection-' + selection, true)
            }

            // do the clickhandler
            checkboxHandler[i](structurename, checked, selection)

            // update status
            checkboxStatus[structurename] = checked
        })

        console.log('status now,', checkboxStatus)
    }

    my.checkSelection = function (activeStructures) {
        console.log(allStructureNames)
        my.checkPoints(allStructureNames, 0, false)
        my.checkPoints(activeStructures, 0, true)
    }

    my.instructions = function (_) {
        if (!arguments.length) 
            return instructions
        instructions = _
        return my
    }

    my.checkboxHandler = function (_) {
        if (!arguments.length)
            return checkboxHandler
        checkboxHandler = _
        return my
    }

    my.checkboxLabels = function (_) {
        if (!arguments.length)
            return checkboxLabels
        checkboxLabels = _
        return my
    }

    my.dropdownMenu = function (_) {
        this.dropdownMenu = _
        return my
    }

    return my
}