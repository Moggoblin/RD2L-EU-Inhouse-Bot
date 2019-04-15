<h1 align="center">
    <img width="100" src="assets/logo.png">
    <br>
    dota-ihl-bot
</h1>

<p align="center">
    <a href="https://nodejs.org">
        <img alt="node" src="https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen.svg">
    </a>
    <a href="https://travis-ci.org/devilesk/dota-ihl-bot">
        <img alt="Travis (.org)" src="https://img.shields.io/travis/devilesk/dota-ihl-bot.svg">
    </a>
    <a href="https://coveralls.io/github/devilesk/dota-ihl-bot">
        <img alt="Coveralls github" src="https://img.shields.io/coveralls/github/devilesk/dota-ihl-bot.svg">
    </a>
    <a href="https://david-dm.org/devilesk/dota-ihl-bot">
        <img alt="David" src="https://img.shields.io/david/devilesk/dota-ihl-bot.svg">
    </a>
    <a href="LICENSE">
        <img alt="GitHub" src="https://img.shields.io/github/license/devilesk/dota-ihl-bot.svg">
    </a>
    <a href="https://discord.gg/gAkvEmF">
        <img alt="Discord" src="https://img.shields.io/discord/422549177151782925.svg?label=discord&logo=discord">
    </a>
</p>
<h4 align="center">A Discord bot for hosting Dota 2 inhouse leagues.</h4>
<p align="center">Need help? Check the <a href="https://github.com/devilesk/dota-ihl-bot/wiki">wiki</a>
or <a href="https://github.com/devilesk/dota-ihl-bot/issues/new">create an issue</a>.</p>

## Table of Contents
* [Features](#features)
* [Requirements](#requirements)
* [Getting Started](#getting-started)
* [API Documentation](#api-documentation)
* [Tests](#tests)
* [Built With](#built-with)
* [Acknowledgements](#acknowledgements)
* [License](#license)

## Features

* Matchmaking Discord bot
* League settings customization
* Multiple lobby queue options
  * Player Draft - Automatically selected captains take turns picking teams
  * Autobalanced - Automatically created teams based on badge or inhouse Elo rating
  * Challenge - Players challenge each other to captain—followed by player draft
* Dota 2 lobby hosting
* Match stats tracking
  * Leaderboard
  * Inhouse Elo rating

## Requirements

* [Node.js](https://nodejs.org/en/download/) 10+ (Tested with 10.9.0)
* [PostgreSQL](https://www.postgresql.org/download/) 9.5+ (Tested with 9.5.14)
 
## Getting Started

To clone and run the bot, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/devilesk/dota-ihl-bot

# Go into the repository
$ cd dota-ihl-bot

# Install dependencies
$ npm install

# Create PostgreSQL database and run migrations
$ npm run db:init
```

Before you run the bot, you'll need to create a `.env` file in the root directory.

```bash
DB_NAME=ihl
DB_USERNAME=postgres
DB_PASSWORD=password
DB_HOST=127.0.0.1
TOKEN=
COMMAND_PREFIX=!
OWNER_DISCORD_ID=
MATCH_POLL_INTERVAL=5000
INVITE_URL=
CLIENT_ID=
CLIENT_SECRET=
CALLBACK_URL=
STEAM_API_KEY=
LOGGER_LOG_SQL=false
LOGGER_SILENT=false
LOGGER_LEVEL=debug
LOGGER_EXCEPTIONLOGFILE=exceptions.log
LOGGER_DIRNAME=logs
LOGGER_FILENAME=application-%DATE%.log
LOGGER_DATEPATTERN=YYYY-MM-DD-HH
LOGGER_ZIPPEDARCHIVE=true
LOGGER_MAXSIZE=20m
LOGGER_MAXFILES=14d
```

```bash
# Run the bot
$ npm start
```

## API Documentation

[View the docs here.](https://devilesk.github.io/dota-ihl-bot/)

```bash
# Generate docs
$ npm run docs
```

## Tests

```bash
$ npm test
```

## Built With

Major dependencies:

- [discord.js](https://github.com/discordjs/discord.js/tree/stable) - Discord API library
- [Commando](https://github.com/discordjs/Commando/tree/djs-v11) - discord.js command framework
- [node-dota2](https://github.com/Arcana/node-dota2) - Dota 2 bot library
- [Sequelize](https://github.com/sequelize/sequelize) - SQL ORM
- [winston](https://github.com/winstonjs/winston) - Logging

Testing:

- [Mocha](https://github.com/mochajs/mocha)
- [Chai](https://github.com/chaijs/chai)
- [Sinon](https://github.com/sinonjs/sinon)
- [Nock](https://github.com/nock/nock)

## Acknowledgements

Thanks to the [Reddit Dota 2 League](https://rd2l.gg/) for support and testing!

## License
* [ISC License](https://opensource.org/licenses/ISC)
* Copyright 2019 © [devilesk](https://github.com/devilesk/)