
var homeIcon = L.icon({
    iconUrl: 'img/star.png',

    iconSize:     [150/4, 150/4],
    iconAnchor:   [150/8, 150/8],
    popupAnchor:  [1, 1]
});

var mapCenters = [{case: "vargas", zoom: 12, lat: 33.797979374698, lon: -117.84793853759764},
	{case: "jackson", zoom: 12, lat: 33.7934144111874, lon: -117.8788375854492},
	{case: "estepp", zoom: 12, lat: 33.794555674887555, lon: -117.89154052734375},
	{case: "anaya", zoom: 12, lat: 33.803114667648735, lon: -117.89703369140625},
	{case: "unknown", zoom: 12,lat: 33.803114667648735, lon: -117.89703369140625},
	{case: "gordon", zoom: 12, lat: 33.804541083228784, lon: -117.894287109375},
	{case: "cano", zoom: 12, lat: 33.804541083228784, lon: -117.894287109375}];



var layer = new L.StamenTileLayer("toner");
var map = new L.Map("map", {
    center: new L.LatLng(33.846725, -117.940349),
    zoom: 11
});
map.addLayer(layer);

var susColor = "#d90000";

markers = new L.FeatureGroup();
map.addLayer(markers);

var home = L.marker([33.85515, -117.84627], {icon: homeIcon}).bindPopup("Cano/Gordon home and work").addTo(map);

L.circle([33.8472089, -117.9179817], 100, {color: "#000", fillOpacity: .8, opacity: .3})
				.bindPopup("Dumpster location")
				.addTo(map);


//console.log( $('.vic-select img').css('border', "5px solid red" );

$('.vic-select img').map(function (i,d){ $(d).css('border-bottom', '5px solid ' + getColor($(d).prev()[0].defaultValue)) })


// $.getJSON("points.json", function (data){
// 	data.forEach(function (d){
// 		L.circle([d.lat + Math.random() * .001, d.lon + Math.random() * .001], 100, {color: getColor(d.slide), fillOpacity: 0, opacity: 1}).addTo(map)
// 			.bindPopup(d.description)
// 			.addTo(map);
// 	});
// });

var jacksonLine;
$.getJSON("json/cano-a.geojson", function (data){
	jacksonLine = L.geoJson(data, {style: getLineStyle("jackson")});
});

var vargasLine;
$.getJSON("json/cano-c.geojson", function (data){
	vargasLine = L.geoJson(data, {style: getLineStyle("vargas")});
});

var anayaLine;
$.getJSON("json/cano-f.geojson", function (data){
	anayaLine = L.geoJson(data, {style: getLineStyle("anaya")});
});

var esteppLine;
$.getJSON("json/cano-i.geojson", function (data){
	esteppLine = L.geoJson(data, {style: getLineStyle("estepp")});
});


d3.csv("csv/events-combined.csv", function (data){

	var currentCase = $("input:radio[name=case]:checked")[0].defaultValue;
	var currentIndex = 0;

	$.each( $('.bio'), function (i,d){ (d.id === currentCase) ? $(d).css('visibility','visible') : $(d).css('visibility','hidden')} );

	data.forEach(function (d){

		if(d.case === currentCase){
			L.circle([d.lat, d.lon], 100, {color: (d.marker === "cg") ? susColor : getColor(d.case), fillOpacity: .8, opacity: .3}).addTo(map)
				.bindPopup(d.desc + " " + d.time)
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

	$("input:radio[name=case]").click(function() {
		currentCase = $(this).val();

		$.each( $('.bio'), function (i,d){ (d.id === currentCase) ? $(d).css('visibility','visible') : $(d).css('visibility','hidden')} );

		$('label img').addClass('grey');
		$($(this).parent().children()[1]).removeClass('grey');
    	
    	redraw();
	});

	function redraw(){
		map.removeLayer(anayaLine);
		map.removeLayer(esteppLine);
		map.removeLayer(jacksonLine);
		map.removeLayer(vargasLine);

		var center = mapCenters.filter(function (d){ return d.case === currentCase})[0];
		map.setView([center.lat,center.lon], center.zoom);

		switch(currentCase){
			case "jackson":
				//canoA.addTo(map);
				//gordonA.addTo(map);
				$('#map_date').html('10/06/2013');
				$('#map_date').css('visibility', 'visible');
			break;
			case "vargas":
				//canoC.addTo(map);
				//gordonC.addTo(map);
				$('#map_date').html('10/24/2013');
				$('#map_date').css('visibility', 'visible');
			break;
			case "anaya":
				//canoF.addTo(map);
				$('#map_date').html('11/12/2013');
				$('#map_date').css('visibility', 'visible');
			break;
			case "estepp":
				$('#map_date').html('03/13/2014');
				$('#map_date').css('visibility', 'visible');
			break;
			case "unknown":
				$('#map_date').css('visibility', 'hidden');
			break;
			case "cano":
				anayaLine.addTo(map);
				esteppLine.addTo(map);
				jacksonLine.addTo(map);
				vargasLine.addTo(map);
				$('#map_date').css('visibility', 'hidden');
			break;
			case "gordon":
				anayaLine.addTo(map);
				esteppLine.addTo(map);
				jacksonLine.addTo(map);
				vargasLine.addTo(map);
				$('#map_date').css('visibility', 'hidden');
			break;
		}


		map.removeLayer(markers);
		markers = new L.FeatureGroup();
		map.addLayer(markers);

		data.forEach(function (d){

			if(d.case === currentCase){
				L.circle([d.lat, d.lon], 100, {color: (d.marker === "cg") ? susColor : getColor(d.case), fillOpacity: .8, opacity: .3}).addTo(map)
					.bindPopup(d.desc + " " + d.time)
					.addTo(markers);
			};
		
		});


	};




});
function updateInfoPanel(data){
	$('#person').html(data.desc);
	$('#time').html(data.time);
	$('#date').html(data.date);
};

function getLineStyle(vic){

	return {
	    "color": getColor(vic),
	    "weight": 5,
	    "opacity": 0.95
	};
};

function getColor(slide){


	var p = ["#377eb8","#4daf4a","#984ea3","#ff7f00", "#a65628"];
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
		case "unknown":
			return p[4];
		break;
		case "cano":
			return susColor;
		break;
		case "gordon":
			return susColor;
		break;
		default:
			return "#000";
		break;
	}
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}