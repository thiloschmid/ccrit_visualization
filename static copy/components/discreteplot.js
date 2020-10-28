export function discretePlot() {
    var svgWidth = 1000,
        svgHeight = 750,
        radius = 7,
        radiusSelected = 10,
        header = '',
        colormap = d => 'blue'

    var margin = { top: 50, right: 50, bottom: 120, left: 80 }
    var width = svgWidth - margin.left - margin.right,
        height = svgHeight - margin.top - margin.bottom

    // weird default functions, need to be changed via my.x() for other use cases
    var xval = d => d.sampleData[header] ? d.sampleData[header] : 'no data'
    var yval = d => d.ccrit
    // var xval = d => d.x

    var X = d => d.x

    var xAxis, yAxis,
        xLabel, yLabel

    var axisLabelSize = 20

    var tooltip
    // offset in percentages of svgWidth
    var xTooltipOffset = 10,
        yTooltipOffset = 5

    var onClickHandler = d => console.debug(d)

    var sortDataX = (a, b) => {
        if (X(a) === 'no data') return 1
        else if (X(b) === 'no data') return -1
        else return X(a).length - X(b).length
    }


    // Unfortunately these entries contain values such as "larger than 20" or "13-15" 
    // making them difficult to display in the correct order. This sorting function
    // attempts to rectify this.

    var sortDataSpecial = (a, b) => {
        let aNumbers = X(a).match(/^\d+|\d+\b|\d+(?=\w)/g)
        let bNumbers = X(b).match(/^\d+|\d+\b|\d+(?=\w)/g)
        return aNumbers[0] - bNumbers[0]
    }

    function my(selection) {
        // selection is a div
        selection.each(function (data) {

            // unpack comma separated values
            let newData = []

            data.forEach(
                element => {
                    let entry = xval(element)
                    entry.split(',').forEach(
                        tag => {
                            let newElement = { ...element }
                            newElement.x = tag.trim()
                            newElement.allTags = entry
                            newData.push(newElement)
                        }
                    )
                }
            )

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
                    .attr('class', 'axis')
                yAxis = svg.append('g')
                    .attr('class', 'axis')
                xLabel = svg.append('text')
                    .attr('font-size', axisLabelSize)
                    .attr('text-anchor', 'middle')
                    .attr('x', width / 2)
                    .attr('y', height + 100)
                    .text(header);
                yLabel = svg.append('text')
                    .attr('font-size', axisLabelSize)
                    .attr('text-anchor', 'middle')
                    .attr('x', -height / 2)
                    .attr('y', -50)
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
                .domain(
                    // move 'no data' to the back without mutating data array
                    // order is necessary for the transition
                    [...newData].sort(
                        header !== 'Non-carbonated cover depth [mm]'
                            ? sortDataX
                            : sortDataSpecial).map(X))
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
                .data(newData)

            let circles = u.enter()
                .append('circle')
                .attr('r', radius)

            u.exit().remove()

            let allCircles = circles.merge(u)
                .attr('id', d => d.structurename)
                .attr('fill', d => colormap(d))
                .on('click', d => onClickHandler(d))
                .on('mouseout', function (d) {
                    tooltip.style('opacity', 0)
                    d3.select(this)
                        .attr('r', radius)
                })
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
                            '<strong>' + d.structurename.replace(/_/g, ' ') + ' [' + (d.index + 1) + ' of ' + d.nPoints + ']</strong>' +
                            '<br> Chloride content: ' + (+yval(d)).toFixed(2) + '%' +
                            '<br> Tags: ' + d.allTags)
                })

                .transition()
                .duration(1000)
                // make sure the circle is in the middle of the band
                .attr('cx', d => xScale(X(d)) + xScale.bandwidth() / 2)
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

    my.showPoints = function (structurenames, visibility, selection = false) {
        if (typeof structurenames === 'string')
            structurenames = [structurenames]

        structurenames.forEach(structurename => {
            d3.selectAll('circle')
                .filter('#' + structurename)
                .classed('not-visible', !visibility)
                .classed('selection-' + selection, selection)
        })

        shownIds = structurenames
    }

    my.sortDataX = function (_) {
        if (!arguments.length) return sortDataX
        sortDataX = _
        return my
    }

    return my
}