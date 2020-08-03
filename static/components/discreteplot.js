export function discretePlot() {
    var svgWidth = 1000,
        svgHeight = 750,
        radius = 7,
        radiusSelected = 10,
        header = '',
        colormap = d => 'blue'

    var margin = { top: 30, right: 30, bottom: 100, left: 70 }
    var width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom

    // weird default functions, need to be changed via my.x() for other use cases
    var xval = d => d.sampleData[header] ? d.sampleData[header] : 'no data',
        yval = d => d.ccrit

    var xAxis, yAxis,
        xLabel, yLabel

    var tooltip
    // offset in percentages of svgWidth
    var xTooltipOffset = 10,
        yTooltipOffset = 5

    var onClickHandler = d => console.debug(d)

    function my(selection) {
        // selection is a div
        selection.each(function (data) {

            // move 'no data' to the back
            data.sort((a, b) => {
                if (xval(a) === 'no data') return 1
                else if (xval(b) === 'no data') return -1
                else return xval(a).length - xval(b).length
            })

            // try to select the svg if it exists
            var svg = d3.select(this).select('svg > g')

            if (svg.empty()) {
                // append the svg
                svg = d3.select(this).append('svg')
                    .classed('svg-content-responsive', true)
                    .attr('preserveAspectRatio', 'xMinYMin meet')
                    .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
                    .append('g')
                    .attr('transform',
                        'translate(' + margin.left + ',' + margin.top + ')')
                xAxis = svg.append('g')
                yAxis = svg.append('g')
                xLabel = svg.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', width / 2)
                    .attr('y', height + 90)
                    .text(header);
                yLabel = svg.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('x', -height / 2)
                    .attr('y', -40)
                    // rotates counterclockwise around point (0, 0)
                    .attr('transform', 'rotate(-90)')
                    .text('Chloride content [% of cement weight]')

                // add tooltip
                tooltip = d3.select(this)
                    .append('div')
                    .style('opacity', 0)
                    .attr('class', 'scatterplot-tooltip tooltip')
            }

            // X axis
            var xScale = d3.scaleBand()
                .range([0, width])
                .domain(data.map(xval))
                .padding(0.3)

            xAxis.transition()
                .duration(1000)
                .call(d3.axisBottom(xScale))

            xAxis.attr('transform', 'translate(0,' + height + ')')
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end")

            xLabel.text(header)

            // Y axis
            var yScale = d3.scaleLinear()
                .domain([0, 3])
                //.domain(d3.extent(data, d => d.ccrit))
                .range([height, 0])

            yAxis.call(d3.axisLeft(yScale))

            // add circles
            let u = svg.selectAll('circle')
                .data(data)

            let circles = u.enter()
                .append('circle')
                .attr('id', d => d.structurename)
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
                    // console.log(mouseX, mouseY)
                    tooltip
                        .style('left', ((mouseX) * 100 / svgWidth + xTooltipOffset) + '%')
                        .style('top', ((mouseY) * 100 / svgHeight + yTooltipOffset) + '%')
                        .html(
                            '<strong>' + d.structurename.replace(/_/g, ' ') + '</strong>' +
                            '<br> Chloride content: ' + (+yval(d)).toFixed(2) + '%' +
                            '<br> Tags: ' + xval(d))

                })
                .on('mouseout', function (d) {
                    tooltip.style('opacity', 0)
                    d3.select(this)
                        .attr('r', radius)
                })

            circles.merge(u)
                .transition()
                .duration(1000)
                // make sure the circle is in the middle of the band
                .attr('cx', d => xScale(xval(d)) + xScale.bandwidth() / 2)
                .attr('cy', d => yScale(yval(d)))
        })

    }

    // getter and setter methods
    my.x = function (_) {
        if (!arguments.length) return xval
        xval = _
        return my
    }

    my.y = function (_) {
        if (!arguments.length) return yval
        yval = _
        return my
    }

    my.header = function (_) {
        if (!arguments.length) return header
        header = _
        return my
    }

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

    my.showPoints = function (structurenames, visibility) {
        if (typeof structurenames === 'string')
            structurenames = [structurenames]

        structurenames.forEach(structurename => {
            d3.selectAll('circle')
                .filter('#' + structurename)
                .classed('not-visible', !visibility)
        })
    }

    return my
}