const dotenv = require('dotenv').config({ path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env' });
const logger = require('../../lib/logger');
const spawn = require('../../lib/util/spawn');
const Collection = require('discord.js/src/util/Collection');
const Argument = require('discord.js-commando/src/commands/argument');
Argument.validateInfo = function () {};
const Command = require('discord.js-commando/src/commands/base');
Command.validateInfo = function () {};
const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const path = require('path');
const SequelizeMocking = require('sequelize-mocking').SequelizeMocking;
const { EventEmitter } = require('events');
const { hri } = require('human-readable-ids');
const db = require('../../models');
const Mocks = require('../mocks');
const DotaBot = require('../../lib/dotaBot');
const MatchTracker = require('../../lib/matchTracker');
const IHLManager = require('../../lib/ihlManager');
const Lobby = require('../../lib/lobby');
const Db = require('../../lib/db');
const CONSTANTS = require('../../lib/constants');

sinon.stub(MatchTracker, 'createMatchEndMessageEmbed').callsFake(async match_id => {});
sinon.stub(DotaBot, 'createDotaBot').callsFake(async config => {
    return new Mocks.MockDotaBot(config);
});
sinon.stub(DotaBot, 'loadDotaBotTickets').resolves([]);

const getRandomInt = require('../../lib/util/getRandomInt');

const client = new Mocks.MockClient();
let guild;
const LeagueCreateCommand = require('../../commands/admin/league-create');
const QueueJoinCommand = require('../../commands/queue/queue-join');
const QueueReadyCommand = require('../../commands/queue/queue-ready');
const QueueLeaveCommand = require('../../commands/queue/queue-leave');
const QueueStatusCommand = require('../../commands/queue/queue-status');
const PickCommand = require('../../commands/ihl/pick');

let ihlManager;
let lobby_channel;
const leagueCreateCommand = new LeagueCreateCommand(client);
const queueJoinCommand = new QueueJoinCommand(client);
const queueReadyCommand = new QueueReadyCommand(client);
const queueLeaveCommand = new QueueLeaveCommand(client);
const queueStatusCommand = new QueueStatusCommand(client);
const pickCommand = new PickCommand(client);
const commands = new Collection([
    [1, leagueCreateCommand],
    [2, queueJoinCommand],
    [3, queueReadyCommand],
    [4, queueLeaveCommand],
    [5, queueStatusCommand],
]);

const joinLobby = async () => {
    const guild = client.guilds.first();
    lobby_channel = guild.channels.find(channel => channel.name === 'autobalanced-queue');
    let c = 0;
    for (const member of guild.members.array()) {
        if (c === 20) break;
        const msg = new Mocks.MockMessage(guild, lobby_channel, member);
        queueJoinCommand.run(msg, {});
        c++;
    }
    setTimeout(readyUp, 1000);
}

const readyUp = async () => {
    const guild = client.guilds.first();
    let c = 0;
    for (const member of guild.members.array()) {
        if (c === 20) break;
        const msg = new Mocks.MockMessage(guild, lobby_channel, member);
        queueReadyCommand.run(msg, {});
        c++;
    }
}

const randomInput = () => {
    const guild = client.guilds.first();
    const channel = guild.channels.random();
    const member = guild.members.random();
    const command = commands.random();
    const msg = new Mocks.MockMessage(guild, channel, member);
    command.run(msg, {});
    setTimeout(randomInput, Math.random() * 1000);
}

const testAutobalance = () => {
    lobby_channel = guild.channels.find(channel => channel.name === 'autobalanced-queue');
    console.log('testAutobalance START', lobby_channel.id, lobby_channel.name);
    const members = guild.members.array();
    console.log('testAutobalance JOINING QUEUE');
    for (let i = 0; i < 10; i++) {
        const member = members[i];
        const msg = new Mocks.MockMessage(guild, lobby_channel, member);
        queueJoinCommand.run(msg, {});
    }
    ihlManager.on(CONSTANTS.STATE_CHECKING_READY, () => {
        console.log('testAutobalance READYING UP', lobby_channel.id, lobby_channel.name);
        for (let i = 0; i < 10; i++) {
            const member = members[i];
            const msg = new Mocks.MockMessage(guild, lobby_channel, member);
            queueReadyCommand.run(msg, {});
        }
    });
    ihlManager.on(CONSTANTS.STATE_MATCH_IN_PROGRESS, lobbyState => {
        ihlManager.emit(CONSTANTS.EVENT_MATCH_SIGNEDOUT, lobbyState.match_id);
    });
}

const testDraft = () => {
    const guild = client.guilds.first();
    lobby_channel = guild.channels.find(channel => channel.name === 'player-draft-queue');
    const members = guild.members.array();
    for (let i = 0; i < 10; i++) {
        const member = members[i];
        const msg = new Mocks.MockMessage(guild, lobby_channel, member);
        queueJoinCommand.run(msg, {});
    }
    ihlManager.once(CONSTANTS.STATE_CHECKING_READY, () => {
        for (let i = 0; i < 10; i++) {
            const member = members[i];
            const msg = new Mocks.MockMessage(guild, lobby_channel, member);
            queueReadyCommand.run(msg, {});
        }
    });
    ihlManager.once(CONSTANTS.STATE_DRAFTING_PLAYERS, (lobbyState) => {
        randomDraft(lobbyState);
    });
}

const randomDraft = async lobbyState => {
    const lobby = await Lobby.getLobby(lobbyState);
    logger.debug(`randomDraft ${lobby.lobby_name} ${lobby.captain_1_user_id} ${lobby.captain_2_user_id}`);
    const guild = client.guilds.first();
    lobby_channel = guild.channels.find(channel => channel.name === lobby.lobby_name);
    const members = guild.members.array();
    const r = getRandomInt(2);
    let captain;
    if (r === 0) {
        captain = await Lobby.getPlayerByUserId(lobbyState)(lobby.captain_1_user_id);
    }
    else {
        captain = await Lobby.getPlayerByUserId(lobbyState)(lobby.captain_2_user_id);
    }
    logger.debug(`randomDraft captain ${captain} ${captain.discord_id}`);
    let msg;
    msg = new Mocks.MockMessage(guild, lobby_channel, guild.members.get(captain.discord_id));
    pickCommand.run(msg, { member: guild.members.random().displayName });
    if (lobby.state === CONSTANTS.STATE_DRAFTING_PLAYERS) {
        setTimeout(async () => randomDraft(lobbyState), Math.random() * 1000);
    }
}

const onReady = async () => {
    ihlManager.matchTracker.run = async () => {
        if (ihlManager.matchTracker.lobbies.length) {
            const lobbyOrState = ihlManager.matchTracker.lobbies.shift();
            const lobby = await Lobby.getLobby(lobbyOrState);
            //ihlManager.matchTracker.emit(CONSTANTS.EVENT_MATCH_ENDED, lobby);
            //ihlManager.emit(CONSTANTS.EVENT_MATCH_SIGNEDOUT, lobby.match_id);
        }
    }
    await Db.findOrCreateBot(getRandomInt(100000000).toString(), hri.random(), hri.random(), hri.random())
    await Db.findOrCreateBot(getRandomInt(100000000).toString(), hri.random(), hri.random(), hri.random())
    await Db.findOrCreateBot(getRandomInt(100000000).toString(), hri.random(), hri.random(), hri.random())
    for (let i = 0; i < 20; i++) {
        await Mocks.MockMember.Factory().toGuild(guild).toDatabase();
    }
    //await joinLobby();
    //randomInput();
    testAutobalance();
    //testDraft();
}

const run = async () => {
    await spawn('npm', ['run', 'db:init']);
    await client.initDefault();
    guild = client.guilds.first();
    await guild.toDatabase({ captain_rank_threshold: 100 });
    //const mockedSequelize = await SequelizeMocking.createAndLoadFixtureFile(db.sequelize, [], { logging: false });
    ihlManager = new IHLManager.IHLManager(process.env);
    //ihlManager.on('ready', onReady);
    //ihlManager.on(CONSTANTS.STATE_COMPLETED, joinLobby);
    await ihlManager.init(client);
    console.log('test');
    onReady();
};

run();