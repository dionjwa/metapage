---
---

<html>
<head>
<meta charset="utf-8">
<!-- Author: Bo Ericsson -->
<title>Real Time Chart Multi</title>
<link rel="stylesheet type=text/css" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/2.3.2/css/bootstrap.min.css" media="all">
<style>
.axis text {
  font: 10px sans-serif;
}
.chartTitle {
  font-size: 12px;
  font-weight: bold;
  text-anchor: middle;
}
.axis .title {
  font-weight: bold;
  text-anchor: middle;
}
.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
.x.axis path {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
.nav .area {
  fill: lightgrey;
  stroke-width: 0px;
}
.nav .line {
  fill: none;
  stroke: darkgrey;
  stroke-width: 1px;
}
.viewport {
  stroke: grey;
  fill: black;
  fill-opacity: 0.3;
}
.viewport .extent {
  fill: green;
}
.well {
  padding-top: 0px;
  padding-bottom: 0px;
}
</style>
</head>
<body>

<div style="max-width: 600px; max-height: 400px; padding: 10px">

  <div class="well">
    <h4>D3 Based Real Time Chart with Multiple Data Streams </h4>
  </div>
  <input id="debug" type="checkbox" name="debug" value="debug" style="margin-bottom: 10px" /> Debug
  <input id="halt" type="checkbox" name="halt" value="halt" style="margin-bottom: 10px" /> Halt

  <div id="viewDiv"></div>

</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js"></script>
<script src="realTimeChartMulti.js"></script>
<script>
'use strict';

// create the real time chart
var chart = realTimeChartMulti()
    .title("Button clicks")
    .yTitle("Categories")
    .xTitle("Time")
    .yDomain(["Category1", "Category2", "Category3"]) // initial y domain (note array)
    .border(true)
    .width(900)
    .height(350);

// invoke the chart
var chartDiv = d3.select("#viewDiv").append("div")
    .attr("id", "chartDiv")
    .call(chart);

// alternative and equivalent invocation
//chart(chartDiv);

// event handler for debug checkbox
d3.select("#debug").on("change", function() {
  var state = d3.select(this).property("checked")
  chart.debug(state);
})

// event handler for halt checkbox
d3.select("#halt").on("change", function() {
  var state = d3.select(this).property("checked")
  chart.halt(state);
})


// configure the data generator

// mean and deviation for generation of time intervals
var tX = 5; // time constant, multiple of one second
var meanMs = 1000 * tX, // milliseconds
    dev = 200 * tX; // std dev

// define time scale
var timeScale = d3.scale.linear()
    .domain([300 * tX, 1700 * tX])
    .range([300 * tX, 1700 * tX])
    .clamp(true);

// define function that returns normally distributed random numbers
var normal = d3.random.normal(meanMs, dev);

// define color scale
var color = d3.scale.category10();

// in a normal use case, real time data would arrive through the network or some other mechanism
var d = -1;
var shapes = ["rect", "circle"];
var timeout = 0;

// define data generator
function dataGenerator() {

  setTimeout(function() {

    // add categories dynamically
    d++;
    switch (d) {
      case 5:
        chart.yDomain(["Category1", "Category2"]);
        break;
      case 10:
        chart.yDomain(["Category1", "Category2", "Category3"]);
        break;
      default:
    }

    // output a sample for each category, each interval (five seconds)
    chart.yDomain().forEach(function(cat, i) {

      // create randomized timestamp for this category data item
      var now = new Date(new Date().getTime() + i * (Math.random() - 0.5) * 1000);

      // create new data item
      var obj;
      var doSimple = false;
      if (doSimple) {
        obj = {
          // simple data item (simple black circle of constant size)
          time: now,
          color: "black",
          opacity: 1,
          category: "Category" + (i + 1),
          type: "circle",
          size: 5,
        };

      } else {
        obj = {
          // complex data item; four attributes (type, color, opacity and size) are changing dynamically with each iteration (as an example)
          time: now,
          color: color(d % 10),
          opacity: Math.max(Math.random(), 0.3),
          category: "Category" + (i + 1),
          //type: shapes[Math.round(Math.random() * (shapes.length - 1))], // the module currently doesn't support dynamically changed svg types (need to add key function to data, or method to dynamically replace svg object – tbd)
          type: "circle",
          size: Math.max(Math.round(Math.random() * 12), 4),
        };
      }

      // send the datum to the chart
      chart.datum(obj);
    });

    // drive data into the chart at average interval of five seconds
    // here, set the timeout to roughly five seconds
    timeout = Math.round(timeScale(normal()));

    // do forever
    dataGenerator();

  }, timeout);
}

// start the data generator
// dataGenerator();

</script>

{% include metaframe_lib_script.html %}
<script src="index.js"></script>
</html>
