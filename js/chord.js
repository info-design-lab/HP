queue()
    .defer(d3.csv, 'data/Harry.csv')
    .defer(d3.csv, 'data/Ron.csv')
    .defer(d3.csv, 'data/Hermoini.csv')
    .defer(d3.csv, 'harrysankey.csv')
    .await(makeRankVis);

function makeRankVis(error, harry, ron, hermoini,harrysankey){

    if(error){
        console.log(error);
    }

    var questions = []

    harry.forEach(function(d){
        for(var i in d){
          if(i != "question"){
              d[i] = parseInt(d[i]);
          }
        }
        questions.push(d["question"])
    });

    ron.forEach(function(d){
        for(var i in d){
          if(i != "question"){
              d[i] = parseInt(d[i])
          }
        }
    });

    hermoini.forEach(function(d){
        for(var i in d){
          if(i != "question"){
              d[i] = parseInt(d[i])
          }
        }
    }); 

    var current_movie = "all";

    var slider = document.getElementById("myRange");

        // create the svg area
    var svg = d3.select("#chord_diagram")
      .append("svg")
        .attr("width", 650)
        .attr("height", 650)
      .append("g")
        .attr("transform", "translate(320,320)")

    slider.oninput = function() {

       if(this.value==0) current_movie="all";
       else current_movie="m"+this.value;
       makeVis(current_movie);
    } 

    makeVis(current_movie);

function makeVis(current_movie){

    svg.selectAll("path").remove();


    // sankey matrix !!!!
    // create input data: a square matrix that provides flow between entities
    var matrix = [
      [0, 0, 0], // harry    // betwwen the characters there is no link
      [0, 0, 0], // ron
      [0, 0, 0], // hermonin

      //[] // questions will be added later
      //[] // questions 
      //[] // questions 
      //[] // questions 
      //[] // questions 
      //[] // questions 
      // ... 
    ];

    // character to the question
    [harry, ron, hermoini].forEach(function(character, i){
        for(var q in character){
            if(q != "columns"){
              matrix[i].push(character[q][current_movie])
            }
        }
    });
    // questions to character
    for(var i = 0; i < questions.length; i++){
        matrix.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    for(var i = 3; i < matrix[0].length; i++){
      for(var j = 0; j < matrix[0].length; j++){
          matrix[i][j] = matrix[j][i]
      }      
    }
    // 4 groups, so create a vector of 4 colors
    //var colors = [ "#FF3399", "#31668dff", "#00994c"]
    var colors = [ "#7799cc", "#FF6961", "#efa355"]
    var qcolors = ["#7799cc", "#FF6961", "#efa355","#f69cc4","#59955c","#a29574","#c33c23","#3d0158","FE7914","#58a6a6","#DF9881","#875C36","#b7c68b","#957DAD","#58949c"]

    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending)
        (matrix)
    // add the groups on the outer part of the circle
    svg
      .datum(res)
      .append("g")
      .selectAll("g")
      .data(function(d) { return d.groups; })
      .enter()
      .append("g")
      .append("path")
        .attr("class", function(d,i){ return i; })
        .style("fill", function(d,i){ return qcolors[i] })
        .style("opacity",0.7)
        .style("stroke", function(d,i){ return qcolors[i] })
        .attr("d", d3.arc()
          .innerRadius(300)
          .outerRadius(320)
        )
      .on('mousemove', function (d) {
            d3.selectAll("path")
            .style("opacity", 0.2);            
            d3.selectAll(document.getElementsByClassName(this.getAttribute("class")))
              .style("opacity", 1); 

        })
          .on("mouseover", function() {
           // updateInfo(d, x, y);
              d3.selectAll("path")
              .style("opacity", 0.2); 
              d3.selectAll(document.getElementsByClassName(this.getAttribute("class")))
              .style("opacity", 1);
          })
          .on("mouseout", function(d) {

            d3.selectAll("path")
              .style("opacity", 0.7);
          });
        
    // Add the links between groups
    svg
      .datum(res)
      .append("g")
      .selectAll("path")
      .data(function(d) { return d; })
      .enter()
      .append("path")
        .attr("d", d3.ribbon()
          .radius(300)
        )        
        .attr("class", function(d,i){ return d.source.index + " " +d.source.subindex; })
        .style("fill", function(d){ return(colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
        .style("opacity",0.7)
        .style("stroke", function(d){ return(colors[d.source.index]) })
        .on('mousemove', function (d) {
            d3.selectAll("path")
            .style("opacity", 0.3);
            d3.select(this)
              .style("opacity", 1); 

        })
          .on("mouseover", function() {
           // updateInfo(d, x, y);
              d3.selectAll("path")
              .style("opacity", 0.3);
              d3.select(this)
              .style("opacity", 1);
          })
          .on("mouseout", function(d) {

            d3.selectAll("path")
              .style("opacity", 0.7);
          });
        }

/**
var units = "Widgets";

   var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 700 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; };

    // append the svg canvas to the page
   var svg2 = d3.select("#sankey_diagram").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");
   
  // Set the sankey diagram properties
  var sankey = d3.sankey()
      .nodeWidth(36)
      .nodePadding(40)
      .size([width, height]);

  var path = sankey.links();

  // load the data (using the timelyportfolio csv method)
d3.csv("Harry-Sankey.csv", function(error, data) {

  //set up graph in same style as original example but empty
  graph = {"nodes" : [], "links" : []};

    data.forEach(function (d) {
      graph.nodes.push({ "name": d.Question });
      graph.nodes.push({ "name": d.Movie });
      graph.links.push({ "source": d.Question,
                         "target": d.Movie,
                         "value": +d.Value });
     });

     // return only the distinct / unique nodes
     graph.nodes = d3.keys(d3.nest()
       .key(function (d) { 
      return d.name; })
       .map(graph.nodes));

     // loop through each link replacing the text with its index from node
     graph.links.forEach(function (d, i) {
       graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
       graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
     });

     //now loop through each nodes to make nodes an array of objects
     // rather than an array of strings
     graph.nodes.forEach(function (d, i) {
       graph.nodes[i] = { "name": d };
     });

 
  sankey
    .nodes(graph.nodes)
    .links(graph.links);

// add in the links
  var link = svg2.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

// add the link titles
  link.append("title")
        .text(function(d) {
          //console.log(d);
        return d.Question + " → " + 
                d.Movie + "\n" + format(d.Value); });

// add in the nodes
  var node = svg2.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
      return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { 
      this.parentNode.appendChild(this); })
      .on("drag", dragmove));

// add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { 
      return d.color = color(d.name.replace(/ ./, "")); })
      .style("stroke", function(d) { 
      return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { 
      return d.name + "\n" + format(d.value); });

// add in the title for the nodes
  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

// the function for moving the nodes
  function dragmove(d) {
    d3.select(this).attr("transform", 
        "translate(" + d.x + "," + (
                d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
            ) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
}); **/

}