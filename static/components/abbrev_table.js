let leftTableHeaders = [
    "Orientation of reinforcement in the structure",
    "Characteristics on the concrete interface"
]

// append the headers 
let tables = d3.selectAll('.abbreviations-table')
    
let tr = tables.append('thead')
    .append('tr')

tr.append('th')
    .text('Abbreviation')

tr.append('th')
    .text('Meaning')

addAbbrevTableData()

async function addAbbrevTableData() {
    let leftTable = d3.select('#abbrev-table-left').append('tbody')
    let rightTable = d3.select('#abbrev-table-right').append('tbody')

    const tableData = await d3.json('./data/abbreviations.json')
    
    Object.entries(tableData).forEach(
        ([key, value]) => {
            let tbody = leftTableHeaders.includes(key) ? leftTable : rightTable

            tbody.append('tr')
                .append('td')
                .attr('class', 'subheading')
                .attr('colspan', 2)
                .html(key + '<br>')

            let row = tbody.selectAll('entries')
                .data(Object.keys(value))
                .enter()
                .append('tr')

            row.append('td')
                .text(d => d)

            row.append('td')
                .text(d => value[d])
            
        }
    )
}


