export function linePlot() {
    /*
    Draw a line on a canvas with provided axis etc. 
    */
    // const
    //     svgWidth = 1000,
    //     svgHeight = 750,

    // const margin = { top: 50, right: 50, bottom: 60, left: 70 }
    // const width = svgWidth - margin.left - margin.right
    // const height = svgHeight - margin.top - margin.bottom
    var strokeWidth = 2,
        dashed = false

    var xScale, yScale

    var colormap = () => 'black'

    function my(selection) {
        selection.each(function (data) {
            data.forEach(entry => {
                let line = d3.line()
                    .x(d => xScale(d))
                    .y((d, i) => yScale(entry.y[i]))
                    .curve(d3.curveMonotoneX)

                let svg = d3.select(this).select('svg > g')

                console.log(dashed)

                svg.append('path')
                    .attr('id', entry.structurename)
                    .datum(entry.x)
                    .attr('class', 'line')
                    .attr('d', line)
                    .attr('stroke', colormap(entry))
                    .style('stroke-width', strokeWidth)
                    .classed('dashed', dashed)

            })
        })
    }


    my.showLines = function (structurenames, visibility) {
        // shows or hides the structure or strucutres
        if (typeof structurenames === 'string')
            structurenames = [structurenames]

        structurenames.forEach(structurename => {
            d3.selectAll('path')
                .filter('#' + structurename)
                .classed('not-visible', !visibility)
        })
    }

    my.drawRects = function (structurename) {
        // alternatively draw a border in pink or teal
    }

    // getter and setter methods
    my.colormap = function (_) {
        if (!arguments.length) return colormap
        colormap = _
        return my
    }

    my.dashed = function(_) {
        if (!arguments.length) return dashed
        dashed = _
        return my
    }

    my.strokeWidth = function(_) {
        if (!arguments.length) return strokeWidth
        strokeWidth = _
        return my
    }

    my.xScale = function (_) {
        if (!arguments.length) return xScale
        xScale = _
        return my
    }

    my.yScale = function (_) {
        if (!arguments.length) return yScale
        yScale = _
        return my
    }

    return my
}


