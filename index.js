/*

Teste para o grupo {ZC} Community

*/

const { Client } = require('discord.js')
const { token } = require('./config.json')
const SimplDB = require('simpl.db');
const db = new SimplDB();
const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
    'GUILDS',
    'GUILD_PRESENCES',
    'GUILD_EMOJIS_AND_STICKERS',
    'DIRECT_MESSAGE_REACTIONS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS'
]
})

client.on('ready', () => {
    console.log('O bot está online e pronto para ser usado!')
})
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.emoji.name !== '✅') return
    if (db.has(`ticketplayer${user.id}`)) return;
    !db.has('counts') ? db.set('counts', 1) : db.add('counts', 1)
    db.save()
    const message = reaction.message
    message.guild.channels.create(`ticket-${db.get('counts') <= 9 ? `0${db.get('counts')}`:db.get('counts')}`, {
        type: "text",
        permissionOverwrites: [
            {
                id: message.guild.id,
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
            },
            {
                id: user.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
            }
        ],
    }).then(async canal => {
        canal.setTopic(user.id)
        let msg = await canal.send('Apenas uma mensagem qualquer. So clicar ai pra fechar')
        msg.react('❌')
        db.set(`ticketplayer${user.id}`, { idc: canal.id, idm: msg.id })
        const filter = (reaction, user) => {
            return reaction.emoji.name === '❌' && !user.bot;
        };

        const collector = msg.createReactionCollector({ filter });

        collector.on('collect', (reaction, user) => {
            db.delete(`ticketplayer${canal.topic}`)
            canal.delete()
        });
    })
})
client.login(token)