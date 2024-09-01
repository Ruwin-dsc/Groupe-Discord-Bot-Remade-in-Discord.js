const {
  Client,
  Intents
} = require("discord.js");
const config = require("./config.json");
const db = require("./db.json");
const fs = require('fs');
const messageRefs = [];
const client = new Client({
  'intents': [Intents.FLAGS.DIRECT_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.MESSAGE_CONTENT, Intents.FLAGS.GUILD_MEMBERS],
  'presence': {
    'status': "online"
  }
});
client.on("ready", () => {
  db.users.forEach(async _0x22149f => {
    const _0xf89245 = await client.users.fetch(_0x22149f);
    if (!_0xf89245) {
      return db.removeUser(_0x22149f);
    }
    _0xf89245.createDM();
  });
  console.log("Ready!");
});
const sendMessage = async (_0x49e18e, _0xb32e8a, _0x5defc6) => {
  for (const _0x171e94 of db.users) {
    if (_0x5defc6 && _0x171e94 === _0x5defc6.id) {
      continue;
    }
    const _0x3c67c1 = await client.users.fetch(_0x171e94);
    if (!_0x3c67c1) {
      return db.removeUser(_0x171e94);
    }
    const _0x507432 = await _0x3c67c1.createDM();
    _0x507432.send(_0x49e18e).then(_0xac36af => {
      if (!_0xb32e8a) {
        return;
      }
      messageRefs.push({
        'user': _0x3c67c1.id,
        'originalMessage': _0xb32e8a.id,
        'embedMessage': _0xac36af.id
      });
    });
  }
};
const sendTyping = async () => {
  for (const _0x1f11d7 of db.users) {
    const _0x276d7e = await client.users.fetch(_0x1f11d7);
    if (!_0x276d7e) {
      return db.removeUser(_0x1f11d7);
    }
    const _0x3d34ad = await _0x276d7e.createDM();
    _0x3d34ad.sendTyping();
  }
};
const editMessages = async (_0x100561, _0x5f06de) => {
  let _0x60c549 = {
    'author': {
      'iconURL': _0x100561.author.avatarURL(),
      'name': _0x100561.author.username
    },
    'color': "PURPLE"
  };
  if (_0x100561.content) {
    _0x60c549.description = _0x100561.content;
  }
  if (_0x100561.attachments.size > 0x0) {
    _0x60c549.image = {
      'url': _0x100561.attachments.first().url
    };
  }
  for (const _0x801a16 of db.users) {
    const _0x36d601 = await client.users.fetch(_0x801a16);
    if (!_0x36d601) {
      return db.removeUser(_0x801a16);
    }
    if (_0x100561.author.id === _0x36d601.id) {
      continue;
    }
    const _0x3e6800 = await _0x36d601.createDM();
    const _0x25f29f = messageRefs.find(_0x20625e => _0x20625e.originalMessage === _0x100561.id);
    if (!_0x25f29f) {
      return;
    }
    const _0x2f61bf = await _0x3e6800.messages.edit(_0x25f29f.embedMessage, {
      'embeds': [_0x60c549]
    });
    _0x25f29f.embedMessage = _0x2f61bf.id;
  }
};
db.addUser = (_0x3698cd, _0x39652b) => {
  if (db.users.includes(_0x3698cd.id)) {
    return;
  }
  db.users.push(_0x3698cd.id);
  _0x3698cd.createDM().then(_0x203e73 => {
    _0x203e73.send({
      'embeds': [{
        'description': "You have been added to the group by **" + _0x39652b.tag + '**',
        'color': "PURPLE"
      }]
    });
  });
  sendMessage({
    'embeds': [{
      'color': "PURPLE",
      'description': "The user **" + _0x3698cd.tag + "** has been added to the group by **" + _0x39652b.tag + '**'
    }]
  });
  fs.writeFileSync("./db.json", JSON.stringify(db, null, 0x4));
};
db.removeUser = async (_0x2105a8, _0x29c77f) => {
  db.users = db.users.filter(_0xdf0be1 => _0xdf0be1 !== _0x2105a8.id);
  _0x2105a8.createDM().then(_0x25ffd6 => {
    _0x25ffd6.send({
      'embeds': [{
        'description': "You have been removed from the group by **" + _0x29c77f.tag + '**',
        'color': "PURPLE"
      }]
    });
  });
  fs.writeFileSync("./db.json", JSON.stringify(db, null, 0x4));
  sendMessage({
    'embeds': [{
      'description': "The user **" + _0x2105a8.tag + "** has been removed from the group by **" + _0x29c77f.tag + '**',
      'color': "PURPLE"
    }]
  });
};
client.on("messageCreate", async _0x232987 => {
  if (_0x232987.author.bot) {
    return;
  }
  if (_0x232987.channel.type !== "GUILD_TEXT") {
    return;
  }
  if (!config.owners.includes(_0x232987.author.id)) {
    return;
  }
  if (!_0x232987.content.startsWith(config.prefix)) {
    return;
  }
  const _0x499483 = _0x232987.content.slice(config.prefix.length).trim().split(/ +/g);
  const _0x2733b7 = _0x499483.shift().toLowerCase();
  if (_0x2733b7 === "group") {
    if (!_0x499483[0x0]) {
      return _0x232987.channel.send("You need to specify an action!");
    }
    if (!_0x499483[0x1]) {
      return _0x232987.channel.send("You need to specify a user!");
    }
    const _0x5ab7ea = _0x499483[0x1].replace(/<@!?/, '').replace('>', '');
    const _0x1b9903 = await client.users.fetch(_0x5ab7ea);
    if (!_0x1b9903) {
      return _0x232987.channel.send("The user was not found!");
    }
    switch (_0x499483[0x0]) {
      case "add":
        db.addUser(_0x1b9903, _0x232987.author);
        _0x232987.channel.send("The user has been added to the group!");
        break;
      case "remove":
        db.removeUser(_0x1b9903, _0x232987.author);
        _0x232987.channel.send("The user has been removed from the group!");
        break;
      default:
        break;
    }
  }
});
client.on("messageUpdate", async (_0x5eb3c0, _0x38411e) => {
  if (_0x38411e.author.bot) {
    return;
  }
  if (_0x38411e.channel.type !== 'DM') {
    return;
  }
  if (!db.users.includes(_0x5eb3c0.author.id)) {
    return;
  }
  editMessages(_0x38411e, _0x5eb3c0);
});
client.on("messageCreate", _0x2958d0 => {
  if (_0x2958d0.author.bot) {
    return;
  }
  if (_0x2958d0.channel.type !== 'DM') {
    return;
  }
  if (!db.users.includes(_0x2958d0.author.id)) {
    return;
  }
  let _0x42ab6d = {
    'author': {
      'iconURL': _0x2958d0.author.avatarURL(),
      'name': _0x2958d0.author.username
    },
    'color': "PURPLE"
  };
  if (_0x2958d0.content) {
    _0x42ab6d.description = _0x2958d0.content;
  }
  if (_0x2958d0.attachments.size > 0x0) {
    _0x42ab6d.image = {
      'url': _0x2958d0.attachments.first().url
    };
  }
  sendMessage({
    'embeds': [_0x42ab6d]
  }, _0x2958d0, _0x2958d0.author);
});
client.on("typingStart", (_0x818ea8, _0xfc46c5) => {
  if (_0x818ea8.type !== 'DM') {
    return;
  }
  if (!db.users.includes(_0xfc46c5.id)) {
    return;
  }
  sendTyping();
});
client.login(config.token);
