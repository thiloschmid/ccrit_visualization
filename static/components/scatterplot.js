export function scatterPlot() {
    const
        svgWidth = 1000,
        svgHeight = 750,
        radius = 7,
        radiusSelected = 10
    // rectLength = 12

    // offset in percentages of svgWidth
    var xTooltipOffset = 10,
        yTooltipOffset = 5

    const margin = { top: 50, right: 50, bottom: 60, left: 70 }
    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom

    var xScale, yScale,
        xAxis, yAxis,
        xAxisLabel, yAxisLabel // the DOM elements, axisLabel below refers to the text

    var axisLabel = ['Chloride content [% of cement weight]', 'Cumulative corrosion frequency']
    var tooltipLabel = ['Chloride content', 'Corrosion frequency']

    // if the domain is not specified, it chooses the range itself
    var xdomain = null,
        ydomain = null

    var X = d => d.x, 
        Y = d => d.y

    var xval = d => parseFloat(X(d)),
        yval = d => parseFloat(Y(d))

    var colormap = d => 'blue' // default

    var tooltip
    var onClickHandler = d => console.debug(d)

    function my(selection) {
        selection.each(function (data) {

            // select the svg if it exists
            var svg = d3.select(this).select('svg > g')

            if (svg.empty()) {
                // create the svg
                svg = d3.select(this).append('svg')
                    .classed('svg-content-responsive', true)
                    .attr('preserveAspectRatio', 'xMinYMin meet')
                    .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
                    .append('g')
                    .attr('transform',
                        'translate(' + margin.left + ',' + margin.top + ')')

                xAxis = svg.append('g')
                    .attr('transform', 'translate(0,' + height + ')')
                    .attr('class', 'axis')

                yAxis = svg.append('g')
                    .attr('class', 'axis')

                xAxisLabel = svg.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', width / 2)
                    .attr('y', height + 40)
                    .text(axisLabel[0])

                yAxisLabel = svg.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', -height / 2)
                    .attr('y', -40)
                    // rotates counterclockwise around point (0, 0)
                    .attr('transform', 'rotate(-90)')
                    .text(axisLabel[1])

                //  add tooltip
                tooltip = d3.select(this)
                    .append('div')
                    .style('opacity', 0)
                    .attr('class', 'scatterplot-tooltip tooltip')
            }

            // X axis
            xScale = d3.scaleLinear()
                .domain(d3.extent(data.map(d => xval(d))))
                    //[0, 1.1 * d3.max(data.map(d => xval(d)))]) // range of the critical chloride contents
                .range([0, width])

            xAxis.call(d3.axisBottom(xScale))

            // Y axis
            yScale = d3.scaleLinear()
                .domain([0, d3.max(data.map(d => yval(d)))])
                .range([height, 0])

            yAxis.call(d3.axisLeft(yScale))

            var u = svg.selectAll('circle')
                .data(data)

            u.enter()
                .append('circle')
                .merge(u)
                .attr('id', d => d.structurename)
                .attr('cx', d => xScale(xval(d)))
                .attr('cy', d => yScale(yval(d)))
                .attr('r', radius)
                .attr('fill', d => colormap(d))
                .on('click', d => onClickHandler(d))
                .on('mouseover', function (d) {
                    tooltip.style('opacity', 1)
                    d3.select(this)
                        .attr('r', radiusSelected)
                })
                .on('mousemove', function (d) {
                    // const { width: canvasWidth, height: canvasHeight } = d3.select('.svg-content-responsive').node().getBoundingClientRect()
                    const [mouseX, mouseY] = d3.mouse(this)
                    // console.debug(mouseX, mouseY)
                    // console.log(mouseX < (svgWidth / 2) ? 'left' : 'right', (mouseX + xTooltipOffset) + 'px')
                    tooltip
                        .style('left', ((mouseX) * 100 / svgWidth + xTooltipOffset) + '%')
                        .style('top', ((mouseY) * 100 / svgHeight + yTooltipOffset) + '%')
                        // .style(
                        //     mouseX < (svgWidth / 2) ? 'left' : 'right', (mouseX + xTooltipOffset) + 'px')
                        // .style(
                        //     mouseY < svgHeight / 2 ? 'top' : 'bottom', (mouseY + yTooltipOffset) + 'px')
                        .html(
                            '<strong>' + d.structurename.replace(/_/g, ' ') + ' [' + (d.index + 1) + ' of ' + d.nPoints + ']</strong> ' +
                            '<br>' + tooltipLabel[0] + ': ' +
                            // don't ask, it works :o
                            (parseFloat(X(d)) !== NaN ? parseFloat(parseFloat(X(d)).toFixed(2)) : X(d)) +
                            '<br>' + tooltipLabel[1] + ': ' +
                            (parseFloat(Y(d)) !== NaN ? parseFloat(parseFloat(Y(d)).toFixed(2)) : Y(d))
                        )
                })
                .on('mouseout', function (d) {
                    tooltip.style('opacity', 0)
                    d3.select(this)
                        .attr('r', radius)
                })
                .transition()
                .duration(1000)
        })
    }

    my.showPoints = function (structurenames, visibility, selection = false) {
        // shows or hides the structure or strucutres
        if (typeof structurenames === 'string')
            structurenames = [structurenames]
        
        structurenames.forEach(structurename => {
            d3.selectAll('circle')
                .filter('#' + structurename)
                .classed('not-visible', !visibility)
                .classed('selection-' + selection, selection)
        })
    }

    // getter and setter methods
    my.colormap = function (_) {
        if (!arguments.length) return colormap
        colormap = _
        return my
    }

    my.onClickHandler = function (_) {
        if (!arguments.length) return onClickHandler
        onClickHandler = _
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

    my.X = function (_) {
        if (!arguments.length) return X
        X = _
        return my
    }

    my.Y = function (_) {
        if (!arguments.length) return Y
        Y = _
        return my
    }

    my.axisLabel = function (_) {
        if (!arguments.length) return axisLabel
        axisLabel = _
        return my
    }

    my.tooltipLabel = function (_) {
        if (!arguments.length) return tooltipLabel
        tooltipLabel = _
        return my
    }

    return my
}


