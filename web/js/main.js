var mapStyles = [
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#4f9f92" }, { "visibility": "on" }] },
    { "featureType": "water", "elementType": "geometry.stroke", "stylers": [{ "color": "#feff95" }, { "visibility": "on" }, { "weight": 1.2 }] },
    { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#adff9d" }, { "visibility": "on" }] },
    { "featureType": "water", "stylers": [{ "visibility": "on" }, { "color": "#147dd9" }] },
    { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "color": "#d3ffcc" }] }, { "elementType": "labels", "stylers": [{ "visibility": "off" }] }
];

var mapView = {
    config: null,
    pokemonArray: [],
    map: [],
    markers: [],

    init: function() {
        var self = this;
        self.loadJSON('/data/config.json', function(data) {
            self.config = data;

            $.getScript('https://maps.googleapis.com/maps/api/js?key=' + self.config.gmapkey + '&libraries=drawing', function() {
                self.loadJSON('/data/pokemon-file-output.json', function(data, successData) {
                    self.pokemonArray = data;
                    self.initMap();
                }, self.errorFunc, 'pokemonArray');
            });

        }, self.errorFunc, 'pokemonConfig');
    },

    initMap: function() {
        var self = this;
        self.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: self.config.latitude,
                lng: self.config.longitude
            },
            zoom: self.config.zoom,
            mapTypeId: 'roadmap',
            styles: mapStyles
        });
        self.placeMarkers();
        self.createUI()
    },

    placeMarkers: function() {
        var self = this, marker;
        for (var i = 0; i < self.pokemonArray.length; i++) {
            var data = self.pokemonArray[i];
            marker = new google.maps.Marker({
                map: self.map,
                position: {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude)
                },
                title: data.pokemon + ' [CP: ' + data.cp + '] [IV: ' + data.iv_display + ']',
                icon: {
                    url: 'images/marker.png'
                },
                pokemon_id: data.pokemon_id
            });
            self.markers.push(marker);
        }
    },

    createUI: function() {
        var self = this,
            controlsContainer = $('ul#pokemon-list'),
            singles = [],
            data;
        for (var i = 0; i < self.pokemonArray.length; i++) {
            data = self.pokemonArray[i];
            if (singles.indexOf(data.pokemon_id) === -1) {
                controlsContainer.append('<li><label><input type="checkbox" checked value="' + data.pokemon_id + '"> ' + data.pokemon + '</li>');
                singles.push(data.pokemon_id);
            }
        }

        self.registerCheckboxEvents();
    },

    registerCheckboxEvents: function(){
        var self = this;
        $('ul#pokemon-list input[type="checkbox"]').change(function(evt){
            var id = $(this).val(), 
                isChecked = $(this).is(':checked');
            for(var i = 0; i < self.markers.length; i++){
                if(self.markers[i].pokemon_id == id){
                    if(isChecked)
                        self.markers[i].setVisible(true);
                    else
                        self.markers[i].setVisible(false);
                }
            }
        })
    },

    loadJSON: function(path, success, error, successData) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (success) {
                        try {
                            success(JSON.parse(xhr.responseText.replace(/\bNaN\b/g, 'null')), successData);
                        } catch (err) {}
                    }
                } else {
                    if (error)
                        error(xhr);
                }
            }
        };
        xhr.open('GET', path + "?v=" + Date.now(), true);
        xhr.send();
    },

    errorFunc: function(xhr) {
        console.error(xhr);
    }
};

$(document).ready(function() {
    mapView.init();
});
