import { structurenameColorMap } from '../config.js'
import { collectSampleData } from '../loaddata.js'
import { scatterPlot } from './scatterplot.js'

header = 'Cover depth [mm]'
// header = 'Meters above sea level [m a.s.l.]'

const attrPlot = scatterPlot()
    .colormap(d => structurenameColorMap(d.structurename))
    .onClickHandler(
        d => {
            plotDetails(d.structurename)
            sampleDetails(d.structurename, d.index)
        }
    )
    .X(d => d.sampleData[header])
    .Y(d => d.ccrit)
    .axisLabel([header, 'Chloride content [% of cement weight]'])
    .tooltipLabel([header, 'Chloride content [%]'])
    



collectSampleData().then(data => {
    console.log(data)
    d3.select('#plot')
        .datum(data)
        .call(attrPlot)
})

