var barLayout = {
  title: "Levels for specific bacteria",
  xaxis: { title: "Ammount" },
  yaxis: { title: "Bacteria Name"}
};

function populateData(dataset) {
  d3.select("#sample-metadata").html("");
  var id = "ID : " + dataset[0].id
  var ethnicity = "Ethnicity : " + dataset[0].ethnicity
  var gender = "Gender : " + dataset[0].gender
  var age = "Age : " + dataset[0].age
  var location = "Location : " + dataset[0].location
  var bbtype = "bbtype : " + dataset[0].bbtype
  var wfreq = "wfreq : " + dataset[0].wfreq
  d3.select("#sample-metadata")
    .append("h5")
    .text(id);
  d3.select("#sample-metadata")
    .append("h5")
    .text(ethnicity);
  d3.select("#sample-metadata")
    .append("h5")
    .text(gender);
  d3.select("#sample-metadata")
    .append("h5")
    .text(age);
  d3.select("#sample-metadata")
    .append("h5")
    .text(location);
  d3.select("#sample-metadata")
    .append("h5")
    .text(bbtype);
  d3.select("#sample-metadata")
    .append("h5")
    .text(wfreq);
}

function topTen(dataset) {
  var top = []
  for (var i=0; i<10; i++){
    top.push(dataset[(9-i)]);
  }
  return top;
}

function bacteriaName(dataset){
  var namedDataset = [];
  dataset.forEach(function(d){
    var current =  "OTU " + d;
    namedDataset.push(current);
  });
  return namedDataset;
}

function setTrace(dataset) {
  var xVal = topTen(dataset.map(d=>d.sample_values)[0]);
  var unnamed = topTen(dataset.map(d=>d.otu_ids)[0])
  var yVal = bacteriaName(unnamed);
  var labVal = topTen(dataset.map(d=>d.otu_labels)[0]);
  var trace = [{
    x : xVal,
    y : yVal,
    text : labVal,
    type: "bar",
    orientation: "h"
  }];
  return trace;
}

function setBubbleTrace(dataset){
  var xVal = dataset.map(d=>d.otu_ids)[0];
  var yVal = dataset.map(d=>d.sample_values)[0];
  var labVal = dataset.map(d=>d.otu_labels)[0];
  var trace = [{
    x : xVal,
    y : yVal,
    text: labVal,
    mode: 'markers',
    marker:{
      color : xVal,
      size: yVal 
    }
  }];
  return trace;
}

function setGaugeTrace(dataset){
  var val = dataset.map(d=>d.wfreq)[0];
  var trace = [{
    domain: { x: [0, 1], y: [0, 1] },
    value: val,
    title: {text: "Wash Frequency"},
    type: "indicator",
		mode: "gauge+number",
    gauge: {
      axis: { range: [0, 9]}
    }
  }];
  return trace;
}


function init() {
  d3.json("/samples.json").then(function(data) {
    function filterSubject(dataset) {
      return dataset.id == "940";
    };
  var firstData = data.metadata.filter(filterSubject);
  var firstSample = data.samples.filter(filterSubject);
  var trace = setTrace(firstSample);
  var bubbleTrace = setBubbleTrace(firstSample);
  var gaugeTrace = setGaugeTrace(firstData);
  Plotly.newPlot("bar", trace, barLayout);
  Plotly.newPlot("bubble", bubbleTrace);
  Plotly.newPlot("gauge", gaugeTrace);
  populateData(firstData);
  });
};

d3.json("/samples.json").then(function(data) {
    var names = data.names;
    var samples = data.samples;
    var sampleId = samples.id;
    var drop = d3.select("#selDataset")
      .selectAll('option')
      .data(names)
      .enter()
      .append('option')
      .html(d => d);
  // Call updatePlotly() when a change takes place to the DOM
  d3.selectAll("#selDataset").on("change", updatePlotly);
});

function updatePlotly() {
  // Use D3 to select the dropdown menu
  var dropdownMenu = d3.select("#selDataset");
  // Assign the value of the dropdown menu option to a variable
  var currentId = dropdownMenu.property("value");

  d3.json("/samples.json").then(function (data) {
    function filterSubject(dataset) {
      return dataset.id == currentId;
    };
    var currentSample = data.samples.filter(filterSubject);
    var currentData = data.metadata.filter(filterSubject);
    var trace = setTrace(currentSample);
    var bubbleTrace = setBubbleTrace(currentSample);
    var gaugeTrace = setGaugeTrace(currentData);
    var x = trace[0].x;
    var y = trace[0].y;
    var labels = trace[0].text;
    var bubX = bubbleTrace[0].x;
    var bubY = bubbleTrace[0].y;
    var bubLabVal = bubbleTrace[0].labVal;
    var bubMarker = {
      color : bubX,
      size : bubY
    };
    var gaugeVal = gaugeTrace[0].value;
    Plotly.restyle("bar", "x", [x]);
    Plotly.restyle("bar", "y", [y]);
    Plotly.restyle("bar", "text", [labels]);
    Plotly.restyle("bar", "type", "bar");
    Plotly.restyle("bubble", "x", [bubX]);
    Plotly.restyle("bubble", "y", [bubY]);
    Plotly.restyle("bubble", "text", [bubLabVal]);
    Plotly.restyle("bubble", "marker", [bubMarker]);
    Plotly.restyle("gauge", "value", [gaugeVal]);
    populateData(currentData)
  });
};

function optionChanged (){
  updatePlotly();
};

init();