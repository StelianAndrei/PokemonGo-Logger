# -*- coding: utf-8 -*-
from pokemongo_bot.event_manager import EventHandler
from pokemongo_bot.base_task import BaseTask

import os
import json

class PokemonLogger(BaseTask):
    SUPPORTED_TASK_API_VERSION = 1

    def initialize(self):
        self.bot.event_manager.add_handler(PokemonLoggerHandler(self.bot, self.config))

    def work(self):
        return 'PokemonLogger'

class PokemonLoggerHandler(EventHandler):
    def __init__(self, bot, config):
        self.bot = bot
        self.whoami = "PokemonLoggerHandler"
        self.config = config

    def handle_event(self, event, sender, level, formatted_msg, data):
        output_file = 'pokemon-file-output.json'

        if event == 'pokemon_appeared':
            if not os.path.isfile(output_file):
                items = []
            else:
                with open(output_file) as itemsjson:
                    items = json.load(itemsjson)

            del data['msg']
            del data['encounter_id']
            del data['ncp']

            items.append(data)
            with open(output_file, mode='w') as f:
                f.write(json.dumps(items, indent=2))
