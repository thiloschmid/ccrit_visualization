import { structurenameColorMap } from "../config.js"

export function plotControls() {
    var checkboxHandler = [d => console.log(d + '1'), d => console.log(d + '2')]
    var checkboxLabels = ['1', '2']

    function my(selection) {
        // var plots = []
        selection.each(function (data) {
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
                    })
            })

            plotDivs.append('label')
                .attr('class', 'form-check-label ml-1 mt-0')
                .attr('for', structurename => structurename)
                // replace all '_' with spaces
                .text(structurename => structurename.replace(/_/g, ' '))
        })
    }

    my.checkPoints = function (structurenames, i, checked) {
        // checks (unchecks if checked = false) the i'th checkbox(es) corresponding to the provided structurenames
        if (typeof structurenames === 'string')
            structurenames = [structurenames]

        let checkboxes = d3.selectAll('.plot-checkbox')
        structurenames.forEach(structurename => {
            checkboxes
                .filter('#' + structurename + '_' + i)
                .property('checked', checked)

            // do the clickhandler
            console.log(checkboxHandler[i])
            checkboxHandler[i](structurename, checked)
        })
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