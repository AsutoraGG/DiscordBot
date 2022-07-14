#!/usr/bin/env node
/*
* Player = 1;
* Explosion = 2;
* VendingMachine = 3;
* CH47 = 4;
* CargoShip = 5;
* Crate = 6;
* GenericRadius = 7;
* PatrolHelicopter = 8;
*/
import { readFile } from 'fs/promises';
import fs, { read } from 'fs';
import {createAudioPlayer, joinVoiceChannel, createAudioResource } from '@discordjs/voice'
import setTitle from 'node-bash-title';
import chalkAnimation from 'chalk-animation';
import { Client, Intents, Message, MessageActionRow, MessageButton, MessageEmbed, Presence } from 'discord.js';
import RustPlus from '@liamcottle/rustplus.js';
import print from './tool/print.mjs';
import keypress from 'keypress';
import chalk from 'chalk';
import * as url from 'url';
import request from 'request';
import SteamAPI from 'steamapi';
import discordrpc from 'discord-rpc';
import FacepunchCommits from 'facepunch-commits';
import r6 from 'r6s-stats-api';


//#region const
const commits = new FacepunchCommits({interval: 5000});
const RPC = new discordrpc.Client({ transport: 'ipc' });
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const C = JSON.parse(await readFile(new URL('./config.json', import.meta.url)));
var rustplus = new RustPlus(C.rp.ip, C.rp.port, C.rp.id, C.rp.token);
const sleep = (ms = C.js.waittime) => new Promise((r) => setTimeout(r, ms));
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });
const steamapi = new SteamAPI(C.steam.token);
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

//#endregion

discordrpc.register(C.discord.clientid);

async function setActivity() {
    if (!RPC) return;
    RPC.setActivity({
        details: `EZ`,
        state: `BOT is Online`,
        startTimestamp: Date.now(),
        largeImageKey: 'large',
        largeImageText: "😶",
        buttons: [
            {
                label: ".",
                url: 'https://is.gd/vPuymF'
            }
        ]
    })
};

function UnixtoDate(unix) {
    var date = new Date(unix * 1000);
    var hours = date.getHours();
    let year = date.getFullYear();
    var minutes = "0" + date.getMinutes();
    var ampm = hours >= 12 ? '午後' : '午前';
    var formattedTime = year + "/" + date.toLocaleDateString('ja-JP').slice(5) + " " + ampm + ':' + hours + '時' + minutes.substr(-2) + '分';
    return formattedTime;
}

async function title() {
    setTitle('Loading..');
    console.clear();
    console.log(chalk.white.underline("このプログラムを使用する場合Terminalで使用することをお勧めします"));
    const RainbowTitle = chalkAnimation.neon(`${C.js.welcometext}`);
    await sleep();
    RainbowTitle.stop();
};

if(C.js.title === true) {
    await title();
};

client.on('ready', () => {
    console.clear();
    setActivity();
    setTitle('😅 Bot Console');
    print('NONE', `📃 プログラムを終了するには"${C.js.exitkey}"を押してください`, false);
    print("SUCCESS", `Loginに成功→${client.user.tag}`, false);
    client.user.setActivity(`*help`, { type: "WATCHING" })
    const gg = client.guilds.cache.get(C.discord.guildid);
    let commands;
    if(gg) {
        commands = C.discord.guild.commands;
    } else {
        commands = client.application?.commands
    }; // Slash Commandを設定
    commands?.create({
        name: 'help',
        description: 'Help Commands?',
    });
    commands?.create({
        name: 'clear',
        description: '指定した数のメッセージを削除するよ!',
        options: [
            {
                name: "amount",
                description: "削除する数を指定してください(100個未満まで)",
                type: "NUMBER",
                required: true
            }
        ]
    });
    commands?.create({
        name: 'sendteammessage',
        description: 'Rust内のチームチャットにメッセージを送信するよ!',
        options: [
            {
                name: "message",
                description: "送信する内容",
                type: "STRING",
                required: true
            }
        ]
    });
    commands?.create({
        name: 'getteaminfo',
        description: "チームの情報を取得",
    });
    commands?.create({
        name: "getmap",
        description: "マップを取得"
    });
    commands?.create({
        name: "getserverinfo",
        description: "サーバーの情報を取得",
    });
    commands?.create({
        name: 'getgamedetail',
        description: "ゲームの詳細をSteamから取得します",
        options: [
            {
                name: "appid",
                description: "appidを入力してください。分からない場合は*appidをチャットに入力してください",
                type: "STRING",
                require: true
            }
        ]
    });
    commands?.create({
        name: "getrustscore",
        description: "あなたがRustで行ってきたことを取得😧",
        options: [
            {
                name: "steamid",
                description: "SteamIDを入力してください。Steamプロフィールのリンクの中にある数字9桁がSteamIDです",
                type: "STRING",
                require: true
            }
        ]
    });
    commands?.create({
        name: "getr6info",
        description: "R6Sでのプレイヤー情報を取得",
        options: [
            {
                name: "playername",
                description: "PlayerNameを入力してください",
                require: true,
                type: "STRING"
            },
            {
                name: "platform",
                description: "pc,xbox,psn",
                type: "STRING",
                require: true,
            }
        ]
    });
    commands?.create({
        name: "getsteamplayerinfo",
        description: "入力されたIDの情報を取得",
        options: [
            {
                name: "steamid",
                description: "SteamIDを入力してください",
                type: "STRING",
                require: true
            }
        ]
    });
});

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(C.discord.PREFIX)) return;
    let args = msg.content.substring(C.discord.PREFIX.length).split(" ");


    rustplus.getMapMarkers((message) => {
        let cargo = false;
        if(cargo === false) {
        for(let marker of message.response.mapMarkers.markers) {
            if (marker.type === 5) {
                cargo = true;
                print('INFO', "Cargoを確認。cargoをtrueにしました", false)
                break;
            };
            if(cargo === true) {
                if(C.rp.notification.cargo === true) {
                    print('INFO', "Cargoシップがスポーンしました", true);
                } else {
                    print('INFO', "Cargoシップがスポーンしました", false);
                }
            };
        };       
        } else {
            let nocargo = true;
            for(let marker of message.response.mapMarkers.markers) {
                if (marker.type === 5) {
                    nocargo = false;
                    print('INFO', "Cargoは見えなくなりました。nocargoをfalseに切り替え", false);
                    break;
                }
            };
            if(nocargo === false) {
                nocargo = false;
                if(C.rp.notification.cargo === true) {
                    print('INFO', "Cargoシップはマップから消えました", true);
                } else {
                    print('INFO', "Cargoシップはマップから消えました", false);
                }
            };
        }

    })

    switch (args[0]) {
        case "appid":
            const appidembed = new MessageEmbed()
             .setColor('RED')
             .setTitle('**appidを見つける方法**')
             .setDescription(`1.[steamストア](https://store.steampowered.com)からappidを確認したいゲームを選択します\n2.サイトのURLの**/app/○○○○**がappidです`)
             .addFields(
                {name: "Rustのappid", value: "252490"}
             );
            msg.channel.send({ embeds: [ appidembed ]});
        break;
        case "ez":
            if (!msg.member.voice?.channel) {
                print('ERROR', "Voiceチャンネルに接続してください", false);
                msg.channel.send("😨 Error: ボイスチャンネルに接続してください");
                console.log(msg.member.voice.channelId + "\n" + msg.guild + "\n" + msg.guild.voiceAdapterCreator);
            };
            const connection = joinVoiceChannel({
                channelId: msg.member.voice.channel.id,
                guildId: msg.guild.id,
                adapterCreator: msg.guild.voiceAdapterCreator
            });

            const player = createAudioPlayer();
            const resource = createAudioResource('./resource/mp3/ez.mp3');
            player.play(resource);
            connection.subscribe(player);
            print('INFO', `ez.mp3を再生`, false);
        break;
    };

    commits.subscribeToAll(commit => {
        const testcommit = new MessageEmbed()
         .setColor("RED")
         .setTimestamp(`${commit.created}`)
         .setTitle(`🥳 **Commitに更新がありました**`)
         .setURL(`https://commits.facepunch.com/r/${commit.repo}`)
         .setThumbnail(`${commit.user.avatar}`)
         .setDescription(`🪄 **コミットした人**: ${commit.user.name}\n🔑 **場所**: ${commit.repo}\n`)
         .addFields(
           { name: `**コミット内容**`, value: `${commit.message}`}
         )
       print('INFO', `Facepunch Commitに更新がありました。by: ${commit.user.name}`, false);
       msg.channel.send({ embeds: [testcommit], content: "@everyone"});
    });
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName, options, channel } = interaction;
    if(commandName == 'help') {
        const helpembed = new MessageEmbed()
        .setColor('AQUA')
        .setTitle('😀 **Command List**')
        .setDescription(`🔑 Prefix → "**${C.discord.PREFIX}**"`)
        .setTimestamp(Date.now())
        .setImage('https://media.discordapp.net/attachments/500590906399784960/981454909700456508/852305877083619399.gif')
        .addFields(
          { name: "clear", value: "指定した数だけメッセージが削除されます"},
          { name: "sendteammessage", value: "ゲーム内チームチャットにメッセージを送信します"},
          { name: "getteaminfo", value: "チームメンバー(オンライン、生きているか)などを確認できます"},
          { name: "getmap", value: "現在登録中のマップを取得+送信"},
          { name: "getserverinfo", value: "現在登録中のサーバー情報を取得(url,map,サーバー人数,人数待ち,マップ画像)"},
          { name: "getgamedetail", value: "Steamからゲームの情報を取得(値段、画像、開発元、プレイ中の人数)"},
          { name: "getr6info", value: "R6Sのプレイヤー情報を取得(プレイ時間、レベル、マッチ回数等々)"},
          { name: "getsteamplayerinfo", value: "SteamIDを入力しSteam情報を取得します"}
        )
        const button = new MessageActionRow().addComponents(
            new MessageButton()
             .setLabel("SourceCode")
             .setStyle("LINK")
             .setURL('https://github.com/AsutoraGG/DiscordBot')
        );
        interaction.reply({embeds: [helpembed], components: [button]});
    };
    if(commandName == 'clear') {
        const Amount = options.getNumber("amount");
        if(Amount === null) {
            print('ERROR', "amountが入力されていません。入力し直してから実行してください", false);
            process.exit[1];
        };
        const Response = new MessageEmbed()
         .setColor("RANDOM");

        channel.bulkDelete(Amount, true).then(messages => {
                Response.setDescription(`🛒 メッセージを削除しました!  数:**${messages.size}**`);
                print('INFO', `🛒メッセージを削除しました! ${messages.size}個`, false);
                interaction.reply({ embeds: [Response], content: "このメッセージは3秒後削除されます"});
                print("DISCORD", "メッセージを送信しました(Resoponse)", false);
                setTimeout(() => interaction.deleteReply(), 3000);
        });
    };
    if(commandName == 'sendteammessage') {
        const Message = options.getString("message");
        const sendMessageEmbed = new MessageEmbed()
         .setColor("GOLD")
         .setDescription(`メッセージを送信: ${Message}`);
        
        print('INFO', `受け取ったメッセージ: ${Message}`, false);
        rustplus.sendTeamMessage(`${Message}`);
        interaction.reply({embeds: [sendMessageEmbed]});
        print("DISCORD", "メッセージを送信しました(sendMessageEmbed)", false)
    };
    if(commandName === 'getteaminfo') {
        print('INFO', "チーム情報を取得", false);
        rustplus.getTeamInfo((msg) => {
            const getteaminfoembeds = new MessageEmbed()
             .setColor("WHITE")
             .setTitle('チーム情報を取得')
            
            for(let member of msg.response.teamInfo.members) {
                let description = "\n"; 
                let f = `**${member.name} \n (${C.steam.baseurl}${member.steamId})**`;
                let str = "**オンライン?:** " + member.isOnline + "\n" +
                    "**生きている?:** " + member.isAlive;
                description += f + "\n" + str + "\n";
                getteaminfoembeds.addField(f, str);
            };
            interaction.reply({embeds: [ getteaminfoembeds ]});
            print("DISCORD", "メッセージを送信しました(getteaminfoembeds)", false)
        });
    };
    if(commandName === 'getmap') {
        rustplus.getMap((msg) => {
            const mapjpg = 'map.jpg';
            var filepath = `${__dirname}${mapjpg}`;
            if(fs.existsSync(`${filepath}`)) {
                print('INFO', "map.jpgが見つかりました再度保存し直します", false);
                fs.unlinkSync(filepath);
                print('INFO', `🛒${mapjpg}を削除しました`, false);
                fs.writeFileSync(mapjpg, msg.response.map.jpgImage);
                print('INFO', `📠${mapjpg}を保存しました`, false);
                interaction.reply({ files: [`${mapjpg}`], content: "マップを取得しました(ちっちゃくてごめん😁)"});
                print("DISCORD", "メッセージを送信しました(map.jpg)", false)
            } else {
                print("INFO", `😑${mapjpg}は見つかりませんでした`, false);
                fs.writeFileSync(`${mapjpg}`, msg.response.map.jpgImage);
                print('INFO', `📠${mapjpg}を保存しました`, false);
                interaction.reply({ files: [`${mapjpg}`], content: "マップを取得しました(ちっちゃくてごめん😁)"});
                print("DISCORD", "メッセージを送信しました(map.jpg)", false)
            };
        });
    };
    if(commandName === 'getserverinfo') {
        rustplus.getInfo((msg) => {
            let info = msg.response.info;
            var options = {
                url: `https://rustmaps.com/api/v2/maps/${info.seed}/${info.mapSize}?staging=false`,
                method: 'GET',
                accept: 'application/json',
                headers: {'X-API-Key': `${C.js.rustmapapi}`}
            };
            request(options, function(error, response) {
                //console.log(response);
                const data = JSON.parse(response.body);
                print('INFO', `ID:${data.id} | Size:${info.mapSize} | Seed:${info.seed}`, false);
                const getInfoEmbed = new MessageEmbed()
                .setColor("LUMINOUS_VIVID_PINK")
                .setTitle("現在登録中のサーバー情報")
                .setImage(`https://files.rustmaps.com/img/225/${data.id}/FullMap.png`)
                .setDescription(`**サーバー名**:${info.name}\n**リンク**:${info.url}\n**マップ**:${info.map}\n**最終ワイプ**:${info.wipeTime}\n**サーバー人数**:${info.players}/${info.maxPlayers}\n**人数待ち**:${info.queuedPlayers}`)
                .addFields(
                    { name: `サーバーに接続`, value: `steam://connect/${C.rp.ip}:${C.rp.port}`}
                )
                interaction.reply({embeds: [getInfoEmbed]});
                print("DISCORD", `メッセージを送信しました(getInfoEmbed)`, false);
            });
            });
    };
    if(commandName === 'getgamedetail') {
        const appid = options.getString("appid");
        if(appid === null) {
            print('ERROR', "appidが入力されていません。入力し直してから実行してください", false);
            interaction.reply({content: `appidが入力されていません。プログラムは一度終了します`});
            process.exit[1];
        };
        steamapi.getGameDetails(appid, true, 'jp').then(gamedetail => {
            steamapi.getGamePlayers(appid).then(a => {
                const gamedetailembed = new MessageEmbed()
                .setImage(gamedetail.header_image)
                .setTimestamp(Date.now())
                .setTitle(`**${gamedetail.name}**の情報`)
                .setURL(`https://store.steampowered.com/app/${gamedetail.steam_appid}`)
                .setDescription("**開発元**" + `: ${gamedetail.developers}\n` + "**現在のゲームの値段**" + `:${gamedetail.price_overview.final_formatted}\n` + `**現在${gamedetail.name}をプレイしている人数**: ${a}人`)
               if(gamedetail.required_age > 0) {
                   gamedetailembed.addFields({
                       name: `このゲームは年齢制限があります`, value: `${gamedetail.required_age}歳以下はプレイが禁じられています`
                   }).setColor("RED")
               } else if(gamedetail.required_age === 0) {
                   gamedetailembed.addFields({
                       name: `このゲームには年齢制限はありません`, value: `このゲームは誰でもプレイ可能です`
                   }).setColor("YELLOW")
               };
               interaction.reply({embeds: [gamedetailembed]});
               print("DISCORD", `メッセージを送信しました(gamedetailembed: ${appid})`, false);
            })
            //console.log(gamedetail);
            //console.log(gamedetail.price_overview.final_formatted);
        });
    };   
    if(commandName === 'getrustscore') {
        const sID = options.getString("steamid")
        steamapi.getUserStats(sID, C.steam.rust).then(u => {
            steamapi.getUserSummary(sID).then(s => {
            const userstateembed = new MessageEmbed()
             .setColor('DARK_BLUE')
             .setTitle(`**${s.nickname}**の実績`)
             .setURL(C.steam.baseurl + `${sID}`)
             .setDescription(`💀  **死亡した回数**: ${u.stats.deaths}回\n😼  **ロケットを発射した回数**: ${u.stats.rocket_fired}回\n📖  **BPを覚えた回数**: ${u.stats.blueprint_studied}回\n😨  **貴方は何人殺した..**: ${u.stats.kill_player}人\n🗡️  **ドラム缶を壊した回数**: ${u.stats.destroyed_barrels}回\n🎭  **NPCを殺した回数**: ${u.stats.kill_scientist}回`)
             .setTimestamp(Date.now())
             
            interaction.reply({ embeds: [userstateembed], content:"**これは公式サーバーでの実績のみです**公式サーバー以外の実績はこの数字に追加されていません"});
            print('DISCORD', `メッセージを送信(userstateembed: ${sID})`, false);
            })
        });
    };
    if(commandName === 'getr6info') {
        const username = options.getString("playername");
        const platform = options.getString("platform")

        const general = await r6.general(platform, username);
        console.log(chalk.blue.italic(`PlayerName: ${username} | PlatForm: ${platform}`));
        //console.log(`${general.url}`)

        const r6infoembed = new MessageEmbed()
         .setColor("RANDOM")
         .setURL(`${general.url}`)
         .setThumbnail(general.header)
         .setTitle("**" + general.name + "**" + "の実績")
         .setTimestamp(Date.now())
         .setDescription("⏱️ " + "**プレイ時間**: " + general.time_played + '\n' + "🥇 " + "**レベル**: " + general.level + "lv" + '\n' + "💻 " + "**マッチ回数**: " + general.matches_played + "回")
         .addFields(
            {
                name: "勝敗", value: "**勝ち**:" + general.wins + "回" + '\n' + "**負け**:" + general.losses + "回",
                name: "Kills/Deaths", value: "**キル**: " + general.kills + "回\n" + "**デス**:" + general.deaths + "回||😂||",
                name: "詳細", value: "**KD**: " + general.kd + '\n' + "**勝率**: " + general.win_ + '\n' + "**ヘッショ率**: " + general.headshot_ + '\n' + "**殴り殺した**🥺: " + general.melee_kills + "回"
            } 
         )
        interaction.reply({embeds: [r6infoembed]});
        print('DISCORD', `メッセージを送信(r6infoembed: ${username})`, false);
    };
    if(commandName === 'getsteamplayerinfo') {
        const steamid = options.getString("steamid");
        
        steamapi.getUserSummary(steamid).then(s => {
            const steamplayerinfoembed = new MessageEmbed()
             .setColor('RANDOM')
             .setThumbnail(s.avatar.large)
             .setTitle("**" + s.nickname + "**の情報")
             .setURL(s.url)
             .setDescription("**SteamID**: " + s.steamID + "\n**アカウントを作成した日**: " + UnixtoDate(s.created) + "\n**最終ログイン時間**: " + UnixtoDate(s.lastLogOff))

            if(s.personaState === 1) { 
                steamplayerinfoembed.addFields({
                    name: "現在のステータス", value: "🟢 Online", inline: true
                }) 
                print('INFO', "現在" + s.nickname + "はオンラインです", false)
            } else if(s.personaState === 0) {
                steamplayerinfoembed.addFields({
                    name: "現在のステータス", value: "⚫ Offline", inline: true
                })
                print('INFO', "現在" + s.nickname + "はオフラインです", false)
            } else if(s.personaState === 2 | s.personaState === 3) {
                steamplayerinfoembed.addFields({
                    name: "現在のステータス", value: "🟠 退席中", inline: true
                })
                print('INFO', "現在" + s.nickname + "はオフラインです", false)
            } else if(s.personaState === 4) {
                steamplayerinfoembed.addFields({
                    name: "現在のステータス", value: "😴 放置中", inline: true
                })
                print('INFO', "現在" + s.nickname + "は放置中です", false)
            } else if(s.personaState === 5) {
                steamplayerinfoembed.addFields({
                    name: "現在のステータス", value: "📨 トレード中", inline: true
                })
                print('INFO', "現在" + s.nickname + "はトレード中です", false)
            } else if(s.personaState === 6) {
                steamplayerinfoembed.addFields({
                    name: "現在のステータス", value: "🟢 ゲームをプレイ中", inline: true
                })
                print('INFO', "現在" + s.nickname + "はゲームをプレイ中です", false)
            };
            steamapi.getUserBans(steamid).then(b => {
                if(b.vacBans += 0) {
                    steamplayerinfoembed.addField('VACBAN情報', 'VACBANされているのを確認しました😩: ' + b.vacBans + '回', true);
                    print('INFO', "VACBANをされているのを確認:" + b.vacBans + "回", false)
                } else if(b.vacBans === 0) {
                    steamplayerinfoembed.addField('VACBAN情報', 'VACBANされていないのを確認しました🥳', true)
                    print('INFO', "VACBANをされていないのを確認", false)
                };
                if(b.gameBans += 0) {
                    steamplayerinfoembed.addField('GAMEBAN情報', 'GAMEBANされているのを確認しました😩: ' + b.gameBans + '回', true)
                    print('INFO', "GAMEBANをされているのを確認:" + b.daysSinceLastBan + "日前", false)
                } else if(b.gameBans === 0) {
                    steamplayerinfoembed.addField('GAMEBAN情報', 'GAMEBANされていないのを確認しました🥳', true)
                    print('INFO', "GAMEBANをされていないのを確認", false)
                };
            });
            
            interaction.reply({ embeds: [steamplayerinfoembed] });
            print('INFO', `メッセージを送信しました(steamplayerinfoembed:` + s.nickname + ")", false);
        });
    };
});

process.stdin.on('keypress', function (ch, key) {
    if(key.name == C.js.exitkey) {
        console.clear();
        process.exit(1);
    }
});

if(C.rp.connect === true) {
    rustplus.connect();
};

RPC.login({ clientId: C.discord.clientid });
client.login(C.discord.BOTTOKEN);