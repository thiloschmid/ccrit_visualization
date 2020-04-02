var margin = {top: 50, right: 50, bottom: 50, left: 50}
  , width = 700 - margin.left - margin.right // Use the window's width 
  , height = 500 - margin.top - margin.bottom; // Use the window's height

var data = [
  {x: 0, y: 0},
  {x: 1, y: 1},
  {x: 2, y: 4},
  {x: 3, y: 9},
  {x: 4, y: 16},
]

var lognormalPdf = (x, mu, sigma) => sigma/x/Math.sqrt(2*Math.PI)*Math.exp(-1*(Math.log(x)-mu)**2/2/sigma**2)

// "linspace from python" 
var xdata = [
  0.0505050505051, 0.10101010101, 0.151515151515, 0.20202020202, 0.252525252525, 
  0.30303030303, 0.353535353535, 0.40404040404, 0.454545454545, 0.505050505051, 
  0.555555555556, 0.606060606061, 0.656565656566, 0.707070707071, 0.757575757576, 
  0.808080808081, 0.858585858586, 0.909090909091, 0.959595959596, 1.0101010101, 
  1.06060606061, 1.11111111111, 1.16161616162, 1.21212121212, 1.26262626263, 
  1.31313131313, 1.36363636364, 1.41414141414, 1.46464646465, 1.51515151515, 
  1.56565656566, 1.61616161616, 1.66666666667, 1.71717171717, 1.76767676768, 
  1.81818181818, 1.86868686869, 1.91919191919, 1.9696969697, 2.0202020202, 
  2.07070707071, 2.12121212121, 2.17171717172, 2.22222222222, 2.27272727273, 
  2.32323232323, 2.37373737374, 2.42424242424, 2.47474747475, 2.52525252525, 
  2.57575757576, 2.62626262626, 2.67676767677, 2.72727272727, 2.77777777778, 
  2.82828282828, 2.87878787879, 2.92929292929, 2.9797979798, 3.0303030303, 
  3.08080808081, 3.13131313131, 3.18181818182, 3.23232323232, 3.28282828283, 
  3.33333333333, 3.38383838384, 3.43434343434, 3.48484848485, 3.53535353535, 
  3.58585858586, 3.63636363636, 3.68686868687, 3.73737373737, 3.78787878788, 
  3.83838383838, 3.88888888889, 3.93939393939, 3.9898989899, 4.0404040404, 
  4.09090909091, 4.14141414141, 4.19191919192, 4.24242424242, 4.29292929293, 
  4.34343434343, 4.39393939394, 4.44444444444, 4.49494949495, 4.54545454545, 
  4.59595959596, 4.64646464646, 4.69696969697, 4.74747474747, 4.79797979798,
  4.84848484848, 4.89898989899, 4.94949494949, 5.0, 
]

// apply lognormal pdf function to the values
var ydata = xdata.map( x => lognormalPdf(x, 0.3, 0.73) )

var ymax = Math.max( ...ydata );
    ymin = Math.min( ...ydata );

var xScale = d3.scaleLinear()
  .domain([0, 1.1*5])
  .range([0, width])

var yScale = d3.scaleLinear()
  .domain([0, 1.1*ymax])
  .range([height, 0])

var line = d3.line()
  // i is the index of the element, how convenient
  .x( (d,i)  => xScale(xdata[i]) ) 
  .y( d => yScale(d) )
  //.curve(d3.curveMonotoneX)

var svg = d3.select("#plot")
  .append("svg")
    .attr("width", width+100)
    .attr("height", height+100)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")

svg.append("g")
  .attr("class", "x axis")
  .call(d3.axisBottom(xScale))
    .attr("transform", "translate(0, "+ height + ")")

svg.append("g")
  .attr("class", "y axis")
  .call(d3.axisLeft(yScale))

svg.append("path")
  .datum(ydata)
  .attr("class", "line")
  .attr("d", line)
  .on("click", arg => console.log(arg))

svg.selectAll(".dot")
  .data(ydata)
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("cx", (d, i) => xScale(xdata[i]))
  .attr("cy", d => yScale(d))
  .attr("r", 5)
  .on("click", arg => console.log(arg))