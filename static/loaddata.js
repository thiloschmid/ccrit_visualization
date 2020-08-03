// Helper functions to assemble data in arrays

export { getStructureData, collectSampleData, getSampleDataJson }

/*-----------------------------------------------------------------------------
    1.  Scatter plot: points and lines 
*/
async function getStructureData(structurenames) {
    // gather all points from the different files corresponding to structures
    let allPoints = []
    let lines = []
    for (const structurename of structurenames) {
        // gather points from csv
        let { x, y, points } = await readCsv(structurename)
        allPoints.push(...points)
        lines.push({ structurename: structurename, x: x, y: y })
    }

    return { points: allPoints, lines: lines }
}


async function readCsv(structurename) {
    /* 
    Collect the data from the csv file. The csv has three rows and no column 
    headers. The first and second rows are the x and y values for the lognormal
    fit which will be represented by a line. The last row are the measured 
    ccrit values.
    */

    const data = await d3.text('./data/' + structurename + '.csv')
    // returns an 2-array: [ x(100), y(100) ]
    var dataset = d3.csvParseRows(data)

    let x = dataset[0]
    let y = dataset[1]

    // default to an empty array
    let ccrit_measurements = dataset[2] ? dataset[2] : []

    let points = []

    for (let i = 0; i < ccrit_measurements.length; i++) {
        points.push({
            x: ccrit_measurements[i],
            y: (i + 1) / (ccrit_measurements.length + 1),
            structurename: structurename,
            index: i, 
            nPoints: ccrit_measurements.length // number of points
        })
    }
    return { x: x, y: y, points: points }
}

/*-----------------------------------------------------------------------------
    2.  Discrete plot: points for discrete x values 
*/
async function collectSampleData() {
    const data = await d3.json('./data/sample_data.json')
    // data is the whole json object, want to extract the sample-specific values
    // and a single value for the ccrit since it is not the same column for each
    // sample
    let samples = []
    Object.entries(data).forEach(
        // iterate through structure
        ([key, value], i) => {
            // rename because 'key' keyword is used again below
            let structurename = key 
            let sampleVals = value['Sample-specific values']

            // Try to obtain the ccrit value from one of these columns
            let ccrit = sampleVals["Critical chloride content referred to mass of cement (measured for each sample) [M-pct. by cem.wt.]"]
            if (!ccrit) {
                ccrit = sampleVals['Critical chloride content referred to mass of cement (assumed 300kg per m3) [M-pct. by cem.wt.]']
            }
            if (!ccrit) {
                ccrit = sampleVals["Critical chloride content referred to mass of concrete [M-pct. by concr.wt.]"]
            }
            /*
            Want to go from data structure
            { foo: [1,2,3], bar: [a,b,c] }
            to 
            [{foo: 1, bar: a}, {foo: 2, bar: b}, {foo: 3, bar: c}]
            */
            // if ccrit is defined iterate through all ccrit values and store
            // its sampleData
            ccrit && ccrit.forEach( 
                (c, i) => {
                    // parse '(0.084)' to 0.084
                    typeof (c) === 'string' && (c = c.replace(/[()]/g, ''))

                    let sampleData = {}
                    Object.entries(sampleVals).forEach(
                        ([key, value]) => {
                            sampleData[key] = value === '' ? 'no data' : value[i]
                        }
                    )
                    samples.push({ structurename: structurename, ccrit: c, sampleData: sampleData, index: i })
                }
            )
        }
    )
    return samples
}

/*-----------------------------------------------------------------------------
    3.  Simple function to read the sample_data.json object to display the 
        details in a table 
*/
async function getSampleDataJson() {
    return d3.json('./data/sample_data.json')
  }

