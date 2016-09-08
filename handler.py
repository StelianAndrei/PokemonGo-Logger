# -*- coding: utf-8 -*-
from pokemongo_bot.event_manager import EventHandler
from time import strftime, localtime
import csv

class PokemonLoggerHandler(EventHandler):
    def __init__(self, bot, config):
        self.bot = bot
        self.whoami = "PokemonLoggerHandler"
        self.config = config

    def handle_event(self, event, sender, level, formatted_msg, data):
        output_file = self.config.get('datafile', 'pokemon-file-output.csv')

        if event == 'pokemon_appeared':
            with open(output_file, 'ab') as csvfile:
                csvwriter = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
                csvwriter.writerow([strftime('%Y-%m-%d %H:%M:%S', localtime()), data['pokemon_id'], data['latitude'], data['longitude'], data['iv'], data['iv_display'], data['cp'], data['pokemon']])