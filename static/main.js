function hideAbout() {
  d3.select("#about")
    .style("display", "none")
  d3.select('#about-link')
    .on('click', showAbout)
}

function showAbout() {
  d3.select("#about")
    .style("display", "inline-block")
  d3.select('#about-link')
    .on('click', hideAbout)
}

d3.select("#about-link")
  .on("click", showAbout)

d3.select("#close-about")
  .on("click", hideAbout)