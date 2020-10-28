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

// same for Abbreviations

function hideAbbreviations() {
  d3.select("#abbreviations")
    .style("display", "none")
  d3.select('#abbreviations-link')
    .on('click', showAbbreviations)
}

function showAbbreviations() {
  d3.select("#abbreviations")
    .style("display", "inline-block")
  d3.select('#abbreviations-link')
    .on('click', hideAbbreviations)
}

d3.select("#abbreviations-link")
  .on("click", showAbbreviations)

d3.select("#close-abbreviations")
  .on("click", hideAbbreviations)