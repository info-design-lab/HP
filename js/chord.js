queue()
    .defer(d3.csv, 'data/Harry.csv')
    .defer(d3.csv, 'data/Ron.csv')
    .defer(d3.csv, 'data/Hermoini.csv')
    .await(makeRankVis);

function makeRankVis(error, harry, ron, hermoini){

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
        .attr("id", function(d,i){ return "segment"; })
        .style("fill", function(d,i){ return qcolors[i] })
        .style("opacity",0.7)
        .style("stroke", function(d,i){ return qcolors[i] })
        .attr("d", d3.arc()
          .innerRadius(300)
          .outerRadius(320)
        )
      .on('mousemove', function (d) {
            d3.selectAll(".chord")
            .style("opacity", 0.05);            
            d3.selectAll(document.getElementsByClassName(this.getAttribute("class")))
              .style("opacity", 0.8);  

        })
          .on("mouseover", function() {
           // updateInfo(d, x, y);
              d3.selectAll(".chord")
              .style("opacity", 0.05); 
              d3.selectAll(document.getElementsByClassName(this.getAttribute("class")))
              .style("opacity", 0.8); 
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
        .attr("class", function(d,i){ return d.source.index + " " +d.source.subindex + " " + "chord"; })
        .style("fill", function(d){ return(colors[d.source.index]) }) // colors depend on the source group. Change to target otherwise.
        .style("opacity",0.7)
        .style("stroke", function(d){ return(colors[d.source.index]) })
        .on('mousemove', function (d) {
            
            d3.selectAll("path")
            .style("opacity", 0.1);
            d3.selectAll("#segment")
            .style("opacity", 1);
            d3.select(this)
              .style("opacity", 1); 

        })
          .on("mouseover", function() {
           // updateInfo(d, x, y);
            d3.selectAll("path")
            .style("opacity", 0.1);
            d3.selectAll("#segment")
            .style("opacity", 1);
              d3.select(this)
              .style("opacity", 1);
          })
          .on("mouseout", function(d) {

            d3.selectAll("path")
              .style("opacity", 0.7);
          });
        }
}