var width = 1850;
var height = 1600;
var data;

// Create an SVG for us to add to
var svg = d3.select('#pointsSVG')
    .append('svg')
    .attr("width", width)
    .attr("height", height);

// Use URL that has been mapped to Python function
var getGraphURL = '/getKanji/' + grade;
d3.json(getGraphURL, function(error, graphData) {
    data = graphData;

    // Create an object mapping id's (kanji) to the actual node objects
    var kanjiNodeById = {};
    var kanjiNodeI;
    for (var i = 0; i < data['kanjiNodes'].length; i++) {
        kanjiNodeI = data['kanjiNodes'][i];
        kanjiNodeById[kanjiNodeI['id']] = kanjiNodeI;
    }
    //and now for radicals
    var radNodeById = {};
    var radNodeI;
    for (var i = 0; i < data['radNodes'].length; i++) {
        radNodeI = data['radNodes'][i];
        radNodeById[radNodeI['id']] = radNodeI;
    }
    

    // Replace data['links'] source and target attributes (strings) with the actual nodes the strings are representing
    var linkI;
    for (var j = 0; j < data['links'].length; j++) {
        linkI = data['links'][j];
        linkI['source'] = kanjiNodeById[linkI['source']];
        linkI['target'] = radNodeById[linkI['target']];
        linkI['selected'] = false;
    }

  // Create a bunch of lines as links
    var link = svg.selectAll(".link")
        .data(data.links)
            .enter().append("line")
        .attr("class", ".lineLink")
        .style("stroke", "rgb(70,70,70)")
        .style("opacity", 0.8);
        //.style('stroke', 'rgb(232,232,232)');

    // Create a superclass so that text can be appended to a node
    var knodes = svg.selectAll('g.knode')
        .data(data.kanjiNodes)
        .enter()
        .append('g')
        .attr("id", function(d){
            return d.id + '_knode';
        })
        .classed('knode', true);
    // Create a bunch of circles to act as nodes
    var kanjiNode = knodes.append("circle")
        .attr("class", "kanjiNode")
        .attr("r", 12)
        .style('stroke', 'rgb(0,128,238)')
        .style('stroke-width', 2)
        .style("fill", "rgb(0,0,150)")
    knodes.append("text")
            .style("fill", "white")
            .attr("text-anchor", "middle")
            .attr('dx', 0)
            .attr('dy', 5)
            .attr("cursor", "pointer")
            .text(function(d){
                return d.id;
        });
    
    var rnodes = svg.selectAll('g.rnode')
        .data(data.radNodes)
        .enter()
        .append('g')
        .classed('rnode', true)
        .attr("id", function(d){
            return d.id + '_rnode';
        });
    var radNode = rnodes.append("rect")
        .attr("class", "radNode")
        .attr("width", 20)
        .attr("height", 20)
        .style('stroke', 'rgb(0,187,85)')
        .style('stroke-width', 2)
        .style("fill", "rgb(0,102,0)");
    rnodes.append("text")
            .style("fill", "white")
            .attr("text-anchor", "middle")
            //.attr("dominant_baseline", "middle")
            .attr('dx', 10)
            .attr("cursor", "pointer")
            .attr('dy', 14)
            .text(function(d){
                return d.id;
            });
    
    rnodes.on("click", function(d){
        //reset nodes back to default stroke color
        d3.selectAll(radNode[0])
            .style("stroke", 'rgb(0,187,85)');
        d3.selectAll(kanjiNode[0])
            .style("stroke", 'rgb(0,128,238)');
        
        d3.select(this.firstChild)
            .style("stroke", "red");
        
        var myText = d.id;
        
        d3.selectAll("line")
            .style("stroke", "rgb(70,70,70)")
            .filter(function(d){
                d.selected = false;
                return (d.target.id == myText);
            })
            .style("stroke", function(d){
                var myKanji = d.source.id;
                d3.select('#' + myKanji + '_knode')
                    .select('circle')
                        .style("stroke", function(d){
                            return "red";
                });
                d.selected = true;
                return "#FF6363";
        });
        
        force.linkStrength(function(d){
            if (d.selected) {
                console.log("red");
                return 0.95;
            };
            return 0.1;
        })
        .start();
    });
        
        knodes.on("click", function(d){
        //reset nodes back to default stroke color
        d3.selectAll(radNode[0])
            .style("stroke", 'rgb(0,187,85)');
        d3.selectAll(kanjiNode[0])
            .style("stroke", 'rgb(0,128,238)');
        
        d3.select(this.firstChild)
            .style("stroke", "red");
        
        var myText = d.id;
        
        d3.selectAll("line")
            .style("stroke", "rgb(70,70,70)")
            .filter(function(d){
                d.selected = false;
                return (d.source.id == myText);
            })
            .style("stroke", function(d){
                var myKanji = d.target.id;
                d3.select('#' + myKanji + '_rnode')
                    .select('rect')
                        .style("stroke", function(d){
                            return "red";
                });
                d.selected = true;
                return "#FF6363";
        });
        
        force.linkStrength(function(d){
            //console.log(d);
            if (d.selected) {
                return 0.95;
            };
            return 0.1;
        })
        .start();

    });

  // Create the D3 force-directed layout object.
  // This will run a simulation and update the positions of the nodes and links.
  var force = d3.layout.force()
      .gravity(0.2)
      .linkDistance(1)
      .linkStrength(.1)
      .charge(-280)
      .size([width, height])
      .nodes(data.radNodes.concat(data.kanjiNodes))
      .links(data.links);
    
    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
        //10 added to source in order to link to center of rect
            .attr("x2", function(d) { return d.target.x + 10; })
            .attr("y2", function(d) { return d.target.y + 10; });

//        kanjiNode.attr("cx", function(d) { return d.x; })
//            .attr("cy", function(d) { return d.y; });
        knodes.attr("transform", function(d) {
            return 'translate(' + [Math.max(12, Math.min(width - 12, d.x)), Math.max(12, Math.min(height - 12, d.y))] + ')';
            //return 'translate(' + [d.x, d.y] + ')'
        })
          
        rnodes.attr("transform", function(d) {
            return 'translate(' + [Math.max(0, Math.min(width - 20, d.x)), Math.max(0, Math.min(height - 20, d.y))] + ')';
            //return 'translate(' + [d.x, d.y] + ')';
        })
      })
      .start();
});