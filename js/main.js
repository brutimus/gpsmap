
var testIcon = L.icon({
    iconUrl: 'img/test-pointer.png',

    iconSize:     [148/8, 234/8],
    iconAnchor:   [72/8, 235/8],
    popupAnchor:  [-3, -76]
});



var layer = new L.StamenTileLayer("toner");
var map = new L.Map("map", {
    center: new L.LatLng(33.846725, -117.940349),
    zoom: 11
});
map.addLayer(layer);

markers = new L.FeatureGroup();
map.addLayer(markers);

var testPerson = L.marker([0, 0], {icon: testIcon});


// $.getJSON("points.json", function (data){
// 	data.forEach(function (d){
// 		L.circle([d.lat + Math.random() * .001, d.lon + Math.random() * .001], 100, {color: getColor(d.slide), fillOpacity: 0, opacity: 1}).addTo(map)
// 			.bindPopup(d.description)
// 			.addTo(map);
// 	});
// });

var canoStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

var canoA;
$.getJSON("json/cano-a.geojson", function (data){
	canoA = L.geoJson(data, {style: canoStyle});
});

var gordonA;
$.getJSON("json/gordon-a.geojson", function (data){
	gordonA = L.geoJson(data);
});

var canoC;
$.getJSON("json/cano-c.geojson", function (data){
	canoC = L.geoJson(data, {style: canoStyle}).addTo(map);
	canoC.addTo(map);
});

var gordonC;
$.getJSON("json/gordon-c.geojson", function (data){
	gordonC = L.geoJson(data).addTo(map);
	gordonC.addTo(map);
});

var canoF;
$.getJSON("json/cano-f.geojson", function (data){
	canoF = L.geoJson(data, {style: canoStyle});
});


d3.csv("csv/events-combined.csv", function (data){

	var currentCase = $("input:radio[name=case]:checked")[0].defaultValue;
	var currentIndex = 0;

	$.each( $('.bio'), function (i,d){ (d.id === currentCase) ? $(d).css('visibility','visible') : $(d).css('visibility','hidden')} );

	data.forEach(function (d){

		if(d.case === currentCase){
			L.circle([d.lat, d.lon], 100, {color: getColor(d.case), fillOpacity: 0, opacity: 1}).addTo(map)
				.bindPopup(d.desc)
				.addTo(markers);
		}
		
	});

	data.forEach(function (d){ 
		var ev = new Date(Date.parse(d.date));
		var ti = d.time.split(":");

		ev.setHours(ti[0]);
		ev.setMinutes(ti[1]);

		d.jstime = ev;

	});

	$("#next").click( function (e){

		var dset = nest.filter(function (d){ return d.key === currentCase})[0];

		if(currentIndex >= dset.values.length -1){
			currentIndex = 0;
		}
		else{
			currentIndex += 1;
		};

		markers.removeLayer(testPerson);

		testPerson = L.marker([dset.values[currentIndex].lat, dset.values[currentIndex].lon], {icon: testIcon});
		testPerson.addTo(markers);

		updateInfoPanel(dset.values[currentIndex]);
		matchPoint(dset.values[currentIndex]);


	});
	$("#previous").click( function (e){

		var dset = nest.filter(function (d){ return d.key === currentCase})[0];

		if(currentIndex > 0){
			currentIndex -= 1;
		}
		else{
			currentIndex = dset.values.length -1;
		};

		markers.removeLayer(testPerson);

		testPerson = L.marker([dset.values[currentIndex].lat, dset.values[currentIndex].lon], {icon: testIcon});
		testPerson.addTo(markers);

		updateInfoPanel(dset.values[currentIndex]);

	});

	$("input:radio[name=case]").click(function() {
		currentCase = $(this).val();

		$.each( $('.bio'), function (i,d){ (d.id === currentCase) ? $(d).css('visibility','visible') : $(d).css('visibility','hidden')} );

		$('label img').addClass('grey');
		$($(this).parent().children()[1]).removeClass('grey');
    	
    	redraw();
	});



	var tscale = d3.time.scale().range([20,780]);

	var nest = d3.nest()
		.key(function(d) { return d['case']; })
		.entries(data);
			
	var svg = d3.select("#chart")
		.append("svg")
		.attr("width", 800)
		.attr("height", 300);

	var timeline = svg.append("g")
		.attr("transform", "translate(0,25)" );

	timeline.append("line")
		.attr("x1", 0)
		.attr("x2", 800)
		.attr("y1", 0)
		.attr("y2", 0);

	var currentVals = nest.filter(function (d){ return d.key === currentCase})[0].values;

	tscale.domain( [d3.min(currentVals, function(d){return d.jstime}), d3.max(currentVals, function(d){return d.jstime})] );
	//console.log(d3.min(currentVals))

	timeline.selectAll("circle")
		.data( currentVals )
		.enter()
		.append("circle")
		.attr("cx", function (d){ return tscale( d.jstime ) })
		//.attr("cy", function (d,i){ return i * 2 })
		.attr("r", 5)
		.attr("fill", function(d){ return getColor(d.case)})
		.attr("opacity", 0.5)
		.on("mouseover", function (e){
			d3.select(this)
				.attr("opacity", 1)
				.attr("r", 7);
		})
		.on("mouseout", function (e){
			d3.select(this)
				.attr("opacity", 0.5)
				.attr("r", 5);
		});
	var tf = d3.time.format("%I:%M %p");

	timeline.selectAll("text")
		.data(currentVals)
		.enter()
		.append("text")
		.attr("class", "timelabel")
		.attr("y", -10)
		.attr("x", function (d){ return tscale( d.jstime ) })
		.text(function (d){ return tf(d.jstime) })

	function redraw(){
		map.removeLayer(canoA);
		map.removeLayer(gordonA);
		map.removeLayer(canoC);
		map.removeLayer(gordonC);
		map.removeLayer(canoF);

		switch(currentCase){
			case "jackson":
				canoA.addTo(map);
				gordonA.addTo(map);				
			break;
			case "vargas":
				canoC.addTo(map);
				gordonC.addTo(map);
			break;
			case "anaya":
				canoF.addTo(map);
			break;
			case "estepp":
				
			break;
		}


		map.removeLayer(markers);
		markers = new L.FeatureGroup();
		map.addLayer(markers);

		data.forEach(function (d){

			if(d.case === currentCase){
				L.circle([d.lat, d.lon], 100, {color: getColor(d.case), fillOpacity: 0, opacity: 1}).addTo(map)
					.bindPopup(d.desc)
					.addTo(markers);
			};
		
		});

		timeline.selectAll("circle").remove();
		timeline.selectAll("text").remove();

		var currentVals = nest.filter(function (d){ return d.key === currentCase})[0].values;

		tscale.domain( [d3.min(currentVals, function(d){return d.jstime}), d3.max(currentVals, function(d){return d.jstime})] )

		timeline.selectAll("circle")
			.data( currentVals )
			.enter()
			.append("circle")
			.attr("cx", function (d){ return tscale( d.jstime ) })
			//.attr("cy", function (d,i){ return i * 2 })
			.attr("r", 5)
			.attr("fill", function(d){ return getColor(d.case)})
			.attr("opacity", 0.5)
			.on("mouseover", function (e){
				d3.select(this)
					.attr("opacity", 1)
					.attr("r", 7);
			})
			.on("mouseout", function (e){
				d3.select(this)
					.attr("opacity", 0.5)
					.attr("r", 5);
			});

		timeline.selectAll("text")
			.data(currentVals)
			.enter()
			.append("text")
			.attr("class", "timelabel")
			.attr("y", -10)
			.attr("x", function (d){ return tscale( d.jstime ) })
			.text(function (d){ return tf(d.jstime) });



	};

	function matchPoint(point){
		console.log(point);

	};




	// timelines.selectAll("ticks")
	// 	.data(hourScale.ticks(8))
	// 	.enter()
	// 	.append("text")
	// 	.attr("class", "ticks")
	// 	.text(function (d){ return Math.round( d/60 )})
	// 	.attr("x", function (d){ return d});


});
function updateInfoPanel(data){
	$('#person').html(data.desc);
	$('#time').html(data.time);
	$('#date').html(data.date);
};


function getColor(slide){


	var p = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c"];
	switch(slide){
		case "jackson":
			return p[0];
		break;
		case "vargas":
			return p[1];
		break;
		case "anaya":
			return p[2];
		break;
		case "estepp":
			return p[3];
		break;
		case "Police":
			return p[4];
		break;
		default:
			return p[5];
		break;
	}
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}