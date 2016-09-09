/**
 * This is out main object. All the functionality is contained whithin
 * @type {Object}
 */
var PokemonLoggerMapView = {
    // the default configuration
    config: {
        "latitude": 40.000000, // the initial map center latitude
        "longitude": 20.000000, // the initial map center longitude
        "zoom": 14, // the initial zoom
        "datafile": "pokemon-file-output.csv" // where to load the data from
    },
    pokemonArray: [], // the pokemon data, loaded from file
    map: null, // the map
    markers: [], // the markers array

    /**
     * Initialize everything. This is the main entry point
     */
    init: function() {
        var self = this;

        // start loading the configuration file and the data file
        self.loadJSON('./data/config.json', function(data) {
            // import the config once the file has been fetched
            self.config = $.extend(self.config, data);
            // if the key API was not set
            if (typeof self.config.gmapkey === 'undefined' || self.config.gmapkey === '') {
                self.errorFunc('The "gmapkey" is missing from the config file!');
                return false;
            }

            // load the script for the Google Maps API
            $.getScript('https://maps.googleapis.com/maps/api/js?key=' + self.config.gmapkey + '&libraries=drawing', function() {
                // load the Pokemon data file
                self.loadPokemonCSV('./data/' + self.config.datafile, function(data) {
                    // store the pokemon
                    self.pokemonArray = data;

                    // generate the map
                    self.initMap();
                }, self.errorFunc);
            });
        }, self.errorFunc);
    },

    /**
     * Initialize the map with all the styles and the config
     */
    initMap: function() {
        var self = this;

        self.map = new google.maps.Map(document.getElementById('map'), {
            center: {
                lat: self.config.latitude,
                lng: self.config.longitude
            },
            zoom: self.config.zoom,
            mapTypeId: 'roadmap',
            styles: [
                { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#4f9f92" }, { "visibility": "on" }] },
                { "featureType": "water", "elementType": "geometry.stroke", "stylers": [{ "color": "#feff95" }, { "visibility": "on" }, { "weight": 1.2 }] },
                { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#adff9d" }, { "visibility": "on" }] },
                { "featureType": "water", "stylers": [{ "visibility": "on" }, { "color": "#147dd9" }] },
                { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "color": "#d3ffcc" }] }, { "elementType": "labels", "stylers": [{ "visibility": "off" }] }
            ]
        });

        self.placeMarkers();
        self.createUI()
    },

    /**
     * Place the markers on the map
     */
    placeMarkers: function() {
        var self = this,
            marker;

        for (var i = 0; i < self.pokemonArray.length; i++) {
            var data = self.pokemonArray[i];
            // create a new map marker
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
            // hide it by default
            marker.setVisible(false);
            // push it in the array
            self.markers.push(marker);
        }
    },

    /**
     * Create the interface
     */
    createUI: function() {
        var self = this,
            controlsContainer = $('ul#pokemon-list'),
            singles = [],
            data,
            html;

        // create the list items
        for (var i = 0; i < self.pokemonArray.length; i++) {
            data = self.pokemonArray[i];
            // if we have't created an item for this type of pokemon
            if (singles.indexOf(data.pokemon_id) === -1) {
                // create the list item
                html = '<li>';
                html += '<input type="checkbox" value="' + data.pokemon_id + '" id="pokemon_checkbox_' + data.pokemon_id + '">';
                html += '<label for="pokemon_checkbox_' + data.pokemon_id + '">' + data.name + '</label>';
                html += '</li>';

                // add the html
                controlsContainer.append(html);
                // store it in the singles array
                singles.push(data.pokemon_id);
            }
        }

        self.registerCheckboxEvents();
    },

    /**
     * Register the filters for the UI
     */
    registerCheckboxEvents: function() {
        var self = this;

        // for the change of a checkbox
        $('ul#pokemon-list input[type="checkbox"]').change(function(evt) {
            var id = $(this).val(),
                isChecked = $(this).is(':checked');
            // go through all the markers
            for (var i = 0; i < self.markers.length; i++) {
                // if this marker matches
                if (self.markers[i].pokemon_id == id) {
                    self.markers[i].setVisible(isChecked);
                }
            }
        })
    },

    /**
     * Load a JSON file
     * @param  {string}   path        The path to the JSON file
     * @param  {function} success     The success callback
     * @param  {function} error       The error callback
     */
    loadJSON: function(path, success, error) {
        var self = this;

        self.loadLocalFile(path, function(data) {
            success(JSON.parse(data.replace(/\bNaN\b/g, 'null')));
        }, error);
    },

    /**
     * Load the Pokemon data from a CSV file
     * @param  {string}   path        The path to the CSV file
     * @param  {function} success     The success callback
     * @param  {function} error       The error callback
     */
    loadPokemonCSV: function(path, success, error) {
        var self = this;

        self.loadLocalFile(path, function(data) {
            var rows = data.split("\n"),
                objects = [],
                item;

            // go from string to array of objects
            for (var i = 0; i < rows.length; i++) {
                if (rows[i] === '') continue;
                item = rows[i].split(',');
                objects.push({
                    'date': item[0],
                    'pokemon_id': item[1],
                    'latitude': item[2],
                    'longitude': item[3],
                    'iv': item[4],
                    'iv_display': item[5],
                    'cp': item[6],
                    'name': item[7],
                })
            }
            success(objects);
        }, error);
    },

    /**
     * Load a local file via an XMLHttpRequest and pass it's responseText to the success() callback
     */
    loadLocalFile: function(path, success, error) {
        // create the request
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                // if the request was successful
                if (xhr.status === 200) {
                    if (success) {
                        try {
                            success(xhr.responseText);
                        } catch (err) {
                            error(err);
                        }
                    }
                } else {
                    if (error) {
                        error(xhr);
                    }
                }
            }
        };
        // break caching
        xhr.open('GET', path + "?v=" + Date.now(), true);
        xhr.send();
    },

    /**
     * Treat errors
     * @param  {Object|String} data The error object or string
     */
    errorFunc: function(data) {
        var errorFormat = "background: red; color: yellow; font-size: x-large";

        // log the error
        if (typeof data === 'string') {
            console.error('%c' + data, errorFormat);
        } else {
            console.error('%cERROR: ' + data.statusText + ' (' + data.responseURL + ')', errorFormat);
        }
        // show an error to let the user know something went wrong
        alert('There was an error. Check the console for more details.')
    }
};

// once everything is loaded
$(document).ready(function() {
    // initialize the map
    PokemonLoggerMapView.init();
});
