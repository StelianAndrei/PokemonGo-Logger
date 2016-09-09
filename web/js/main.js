/* globals $, google, console */
"use strict";
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
    sort_by: 'name', // the default sorting 
    sort_direction: 'asc', // the default sorting direction

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
        self.refreshPokemonFilters();
        self.registerSortingEvents();
        self.registerCheckboxEvents();
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
                title: data.name + ' [CP: ' + data.cp + '] [IV: ' + data.iv + '] [Stats: ' + data.iv_display + ']\nSeen: ' + data.date,
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
    refreshPokemonFilters: function() {
        var self = this,
            singles = { ids: [], names: [] };

        // sort the pokemon array based on the sorting criteria
        self.sortPokemonArray();

        // get the single/individual items
        for (var i = 0; i < self.pokemonArray.length; i++) {
            // if we have't stored this type of pokemon
            if (singles.ids.indexOf(self.pokemonArray[i].pokemon_id) === -1) {
                // store it in the singles array
                singles.ids.push(self.pokemonArray[i].pokemon_id);
                singles.names.push(self.pokemonArray[i].name);
            }
        }

        // create the HTML
        self.createPokemonListHTML(singles);
    },

    /**
     * Determine the sorting type and apply it accordingly
     */
    sortPokemonArray: function() {
        var self = this;

        switch (self.sort_by) {
            case 'name':
                self.sortPokemonArrayByName();
                break;
            case 'id':
                /* falls through */
            default:
                self.sortPokemonArrayByID();
        }
    },

    /**
     * Sort the Pokemon array by name
     */
    sortPokemonArrayByName: function() {
        var self = this,
            direction = self.sort_direction === 'asc' ? 1 : -1;

        // sort pokemonArray by name
        self.pokemonArray.sort(function(a, b) {
            return (a.name > b.name) ? direction : ((b.name > a.name) ? -direction : 0);
        });
    },

    /**
     * Sort the Pokemon array by ID
     */
    sortPokemonArrayByID: function() {
        var self = this,
            direction = self.sort_direction === 'asc' ? 1 : -1;

        // sort pokemonArray by ID
        self.pokemonArray.sort(function(a, b) {
            return (parseInt(a.pokemon_id) > parseInt(b.pokemon_id)) ? direction : ((parseInt(b.pokemon_id) > parseInt(a.pokemon_id)) ? -direction : 0);
        });
    },

    /**
     * Create the HTML for the filters
     * @param  {Object} items An object that contains 2 arrays: ids[] and names[]
     */
    createPokemonListHTML: function(items) {
        var controlsContainer = $('ul#pokemon-list'),
            i, id, name, html;

        // empty the container
        controlsContainer.html('');

        // add all the list items
        for (i = 0; i < items.ids.length; i++) {
            // get the ID and the name
            id = items.ids[i];
            name = items.names[i];

            // create the list item
            html = '<li>';
            html += '<input type="checkbox" value="' + id + '" id="pokemon_checkbox_' + id + '">';
            html += '<label for="pokemon_checkbox_' + id + '">' + name + ' (#' + id + ')</label>';
            html += '</li>';

            // add the html
            controlsContainer.append(html);
        }
    },

    /**
     * Register the click events on the pokemon sorting buttons
     */
    registerSortingEvents: function() {
        var self = this,
            sortBy;

        $('#pokemon-sorter').on('click', 'a', function(evt) {
            evt.preventDefault();
            sortBy = $(this).data('by');

            // set the sorting direction
            if (sortBy === self.sort_by) {
                self.sort_direction = (self.sort_direction === 'asc') ? 'desc' : 'asc';
            } else {
                self.sort_direction = 'asc';
            }

            // set the sorting criteria
            self.sort_by = sortBy;

            // update the interface
            $('#pokemon-sorter a').removeClass('active desc asc');
            $(this).addClass('active ' + self.sort_direction);
            self.refreshPokemonFilters();
        });
    },

    /**
     * Register the filters for the UI
     */
    registerCheckboxEvents: function() {
        var self = this;

        // for the change of a checkbox
        $('ul#pokemon-list').on('change', 'input[type="checkbox"]', function() {
            var id = $(this).val(),
                isChecked = $(this).is(':checked');
            // go through all the markers
            for (var i = 0; i < self.markers.length; i++) {
                // if this marker matches
                if (self.markers[i].pokemon_id == id) {
                    self.markers[i].setVisible(isChecked);
                }
            }
        });
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
                });
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
        window.alert('There was an error. Check the console for more details.');
    }
};

// once everything is loaded
$(document).ready(function() {
    // initialize the map
    PokemonLoggerMapView.init();
});
