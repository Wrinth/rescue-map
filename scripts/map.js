$( document ).ready(function() {
    $("#viewDiv").height( $( document ).height() - ($( "nav" ).height() * 3) );

});

require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/layers/SceneLayer",
    "esri/renderers/SimpleRenderer",
    "esri/symbols/MeshSymbol3D",
    "esri/symbols/FillSymbol3DLayer",
    "esri/widgets/Popup",
    "esri/PopupTemplate",
    "dojo/domReady!"
], function(Map, SceneView, Graphic, Point, SimpleMarkerSymbol, SceneLayer, SimpleRenderer, MeshSymbol3D, FillSymbol3DLayer, PopupTemplate) {

    var map = new Map({
        basemap: "satellite",
        ground: "world-elevation"
    });

    var view = new SceneView({
        container: "viewDiv",
        map: map
    });

    view.then(function(){
        view.goTo({
            center: [-122.399945, 37.794574],
            tilt: 70,
            zoom: 14
        })
    });


    // Add 3D Buildings model
    var sceneLayer = new SceneLayer({
        url: "https://sfgis-portal.sfgov.org/srv/rest/services/Hosted/Downtown_textured3D_P2010_bldg/SceneServer/layers/0",
        popupEnabled: false
    });
    map.add(sceneLayer);
    var symbol = new MeshSymbol3D({
        symbolLayers: [ new FillSymbol3DLayer() ]
    });
    sceneLayer.renderer = new SimpleRenderer({
        symbol: symbol
    });

    // Create points
    var homePoint = new Point(
        {
            longitude: -122.386743,
            latitude: 37.775643,
            type: "home",
            phone: "6174801331",
            _id: "59bdb75b932893022bd6163b",
            is_help_request: true
        }
    );
    var homeMarkerSymbol = new SimpleMarkerSymbol({
        color: [255, 255, 255],
        style: "square",
        outline: {
            color: [0, 0, 0],
            width: 8
        }
    });
    var homePointGraphic = new Graphic({
        geometry: homePoint,
        symbol: homeMarkerSymbol
    });

    var fireMarkerSymbol = new SimpleMarkerSymbol({
        color: [226, 119, 40],
        outline: {
            color: [0, 0, 0],
            width: 1
        }
    });

    var landslideMarkerSymbol = new SimpleMarkerSymbol({
        color: [148, 62, 15],
        outline: {
            color: [0, 0, 0],
            width: 1
        }
    });

    var hurricaneMarkerSymbol = new SimpleMarkerSymbol({
        color: [211,211,211],
        outline: {
            color: [255, 255, 255],
            width: 1
        }
    });

    var earthquakeMarkerSymbol = new SimpleMarkerSymbol({
        color: [109,93,71],
        outline: {
            color: [255, 255, 255],
            width: 1
        }
    });

    var floodMarkerSymbol = new SimpleMarkerSymbol({
        color: [0,0,205],
        outline: {
            color: [255, 255, 255],
            width: 1
        }
    });

    var tempData = [];

    function updateData() {

        var haveChange = false;

        $.get( "https://uyzhap3720.execute-api.us-west-1.amazonaws.com/qa/sc/v1/getAllRequests", function( data ) {
            if(tempData.length != data.body.length) {
                haveChange = true;
            }

            if(haveChange) {

                view.graphics.removeAll();

                view.graphics.add(homePointGraphic);




                $.get("https://uyzhap3720.execute-api.us-west-1.amazonaws.com/qa/sc/v1/getAllRequests", function (data) {
                    tempData = data.body;
                    $.each(tempData, function (index, value) {

                        function setContentInfo(feature) {
                            // create a chart for example
                            var node = domConstruct.create("div", {innerHTML: "Text Element inside an HTML div element."});
                            return node;
                        }

                        var tempPoint = new Point(
                            {
                                longitude: value.longitude,
                                latitude: value.latitude,
                                type: value.type,
                                phone: value.phone,
                                _id: value._id,
                                is_help_request: value.is_help_request
                            }
                        );

                        var tempMarkerSymbol;
                        switch (value.type) {
                            case "fire": {
                                tempMarkerSymbol = fireMarkerSymbol;
                                break;
                            }
                            case "landslide": {
                                tempMarkerSymbol = landslideMarkerSymbol;
                                break;
                            }
                            case "hurricane": {
                                tempMarkerSymbol = hurricaneMarkerSymbol;
                                break;
                            }
                            case "earthquake": {
                                tempMarkerSymbol = earthquakeMarkerSymbol;
                                break;
                            }
                            case "flood": {
                                tempMarkerSymbol = floodMarkerSymbol;
                                break;
                            }
                        }

                        var routeToHereAction = {
                            title: "Get Routing",
                            id: "route-to-this"
                        };

                        var tempTemplate = {
                            title: 'Case: ' + value.type,
                            content: "Contact number: +" + value.phone,
                            actions: [routeToHereAction]
                        };

                        function routeThis() {
                            /*
                            var geom = view.popup.selectedFeature.geometry;
                            var distance = geometryEngine.geodesicLength(geom, "miles");

                            distance = parseFloat(Math.round(distance * 100) / 100).toFixed(2);
                            view.popup.content = view.popup.selectedFeature.attributes.name +
                                "<div style='background-color:DarkGray;color:white'>" + distance +
                                " miles.</div>";
                            */
                        }

                        // Event handler that fires each time an action is clicked.
                        view.popup.on("trigger-action", function(event) {
                            // Execute the measureThis() function if the measure-this action is clicked
                            if (event.action.id === "route-to-this") {
                                routeThis();
                            }
                        });


                        var tempPointGraphic = new Graphic({
                            geometry: tempPoint,
                            symbol: tempMarkerSymbol,
                            popupTemplate: tempTemplate
                        });

                        view.graphics.add(tempPointGraphic);

                        view.popup.features = tempPointGraphic;


                    });
                });

            }

        });


    }

    updateData();

    setInterval(function() {
        updateData();
    }, 3600000);
});