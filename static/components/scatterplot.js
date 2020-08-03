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
        xLabel, yLabel

    var xval = d => d.x,
        yval = d => d.y

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

                yAxis = svg.append('g')

                xLabel = svg.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', width / 2)
                    .attr('y', height + 40)
                    .text('Chloride content [% of cement weight]')
                yLabel = svg.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', -height / 2)
                    .attr('y', -40)
                    // rotates counterclockwise around point (0, 0)
                    .attr('transform', 'rotate(-90)')
                    .text('Cumulative corrosion frequency')

                //  add tooltip
                tooltip = d3.select(this)
                    .append('div')
                    .style('opacity', 0)
                    .attr('class', 'scatterplot-tooltip tooltip')
            }

            // X axis
            xScale = d3.scaleLinear()
                .domain([0, 1.1 * d3.max(data.map(d => xval(d)))]) // range of the critical chloride contents
                .range([0, width])

            xAxis.call(d3.axisBottom(xScale))

            // Y axis
            yScale = d3.scaleLinear()
                .domain([0, 1]) // range of probabilities
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
                .on('mousemove', function (d, i) {
                    // const { width: canvasWidth, height: canvasHeight } = d3.select('.svg-content-responsive').node().getBoundingClientRect()
                    const [mouseX, mouseY] = d3.mouse(this)
                    // console.debug(mouseX, mouseY)
                    // console.log(mouseX < (svgWidth / 2) ? 'left' : 'right', (mouseX + xTooltipOffset) + 'px')
                    tooltip
                        .style('left', ((mouseX)*100/svgWidth + xTooltipOffset) + '%')
                        .style('top', ((mouseY)*100/svgHeight + yTooltipOffset) + '%')
                        // .style(
                        //     mouseX < (svgWidth / 2) ? 'left' : 'right', (mouseX + xTooltipOffset) + 'px')
                        // .style(
                        //     mouseY < svgHeight / 2 ? 'top' : 'bottom', (mouseY + yTooltipOffset) + 'px')
                        .html(
                            '<strong>' + d.structurename.replace(/_/g, ' ') + ' [' + (i + 1) + ' of ' + d.nPoints + ']</strong> ' +
                            '<br> Chloride content: ' + d.x + '%' +
                            '<br> Corrosion probability: ' + d.y.toFixed(2))

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

    my.showPoints = function (structurenames, visibility) {
        // shows or hides the structure or strucutres
        if (typeof structurenames === 'string')
            structurenames = [structurenames]
        console.log(structurenames, visibility)
        structurenames.forEach( structurename => {
            d3.selectAll('circle')
                .filter('#'+ structurename)
                .classed('not-visible', !visibility)
        })
    }

    my.attachClass = function(structurenames, className) {
        // draw something significantly different e.g. rectangles or a different border
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

    return my
}


