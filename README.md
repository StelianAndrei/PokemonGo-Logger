# What's this?
This is a plugin for [PokemonGo-Bot](https://github.com/PokemonGoF/PokemonGo-Bot) that logs every pokemon encountered in the wild. Aditionally it plots the caught Pokemon on a map and allows you to filter them.

Using this you can map where certain pokemontypes are encountered and maybe find a nest that you didn't know existed.

## What it does

When a Pokemon is encountered in the wild, it's stats and position will be stored inside the PokemonGo-Bot folder, in a file named ``pokemon-file-output.csv`` by default. An entry will look something like this (but without a header and comma separated):

    Date                | Pokemon ID  | Latitude  | Longitude | IV   | IV Display | CPs | Name
    --------------------+-------------+-----------+-----------+------+------------+-----+------
    2016-09-08 16:22:25 |          97 | 47.000000 | 27.000000 | 0.47 |     7/0/14 |  28 | Hypno
    2016-09-08 16:24:18 |          19 | 47.000000 | 27.000000 | 0.53 |     6/7/11 |  10 | Rattata

## Installation

In the PokemonGo-Bot configs/config.json file, initialize the plugin by adding it to the **plugins** array:

    "plugins: [
        "<path to the plugin>" 
    ]

The path can be either a local path (if the plugin is downloaded locally, for development) or a GitHub url (including exact commit)

To use the plugin, create a new task in your config file similar to the one below. A good place to put this is before the **CatchPokemon** task. The ``datafile`` is the file where the found Pokemon will be saved.

    {
        "type": "pgbot-logging.PokemonLogger"
        "config": {
            "datafile": "pokemon-file-output.csv"
        }
    }

## How to use it

Inside the plugin's folder there is a folder named ``web``. You can copy the output file from the bot's directory to the ``data`` directory inside this ``web``folder. Also copy the data/config.json.example to data/config.json and add your configuration settings (including your own Google Maps API key).

After all this the structure will look something like:

    /pgbot-logging
        /web
            /css
            /data
                config.json
                pokemon-file-output.csv
            /images
            /js

Alternatively, you can create a symlink to the data file and have the bot run  and collecting data.

Then all you need to do is start a web-server from the ``web`` directory. We'll use port *8001* as we might already have the **OpenPoGoWeb UI** already running on port *8000*.

    python -m SimpleHTTPServer 8001

## TODO

+ Improve configuration setup and simplify it
+ Improve and enhance the web interface. It's pretty basic right now
+ Find a better way to store the data and to retrieve it
+ Autorefresh the map - add new markers if needed
+ Maybe some statistics or at least counters for found pokemon
+ Filtering by date?
