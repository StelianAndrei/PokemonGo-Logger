# -*- coding: utf-8 -*-
from pokemongo_bot.base_task import BaseTask
from handler import PokemonLoggerHandler

class PokemonLogger(BaseTask):
    SUPPORTED_TASK_API_VERSION = 1

    def initialize(self):
        self.bot.event_manager.add_handler(PokemonLoggerHandler(self.bot, self.config))

    def work(self):
        return 'PokemonLogger'