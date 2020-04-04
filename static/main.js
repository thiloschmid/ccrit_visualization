var hideAbout = function () {
  d3.select("#about").style("display", "none")
}

var showAbout = function () {
  d3.select("#about").style("display", "inline-block")
}

d3.select("#about-link")
  .on("click", showAbout)

d3.select("#close-about")
  .on("click", hideAbout)