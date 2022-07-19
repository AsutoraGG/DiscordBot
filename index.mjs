#!/usr/bin/env node
import { readFile } from 'fs/promises';
import fs from 'fs';
import setTitle from 'node-bash-title';
import chalkAnimation from 'chalk-animation';
import { Channel, Client, Intents, Message, MessageActionRow, MessageButton, MessageEmbed, Presence } from 'discord.js';
import RustPlus from '@liamcottle/rustplus.js';
import print from './tool/print.mjs';
import keypress from 'keypress';
import chalk from 'chalk';
import * as url from 'url';
import request from 'request';
import SteamAPI from 'steamapi';
import r6 from 'r6s-stats-api';
import corn from 'node-cron';


//#region const
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const shock = JSON.parse(await readFile(new URL('./resource/shock.json', import.meta.url)));
const C = JSON.parse(await readFile(new URL('./config.json', import.meta.url)));
var rustplus = new RustPlus(C.rp.ip, C.rp.port, C.rp.id, C.rp.token);
const sleep = (ms = C.js.waittime) => new Promise((r) => setTimeout(r, ms));
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"] });
const steamapi = new SteamAPI(C.steam.token);
const option1 = { //case.json(961話~最新話まで)
    url: "https://www.ytv.co.jp/conan/data/case.json",
    method: 'GET',
    accept: 'application/json'
};
const t = new Date();
keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

//#endregion

/**
 * 
 * @param {string} unix 
 * @param {boolean} t 
 * @returns Unixをデータにします
 */
function UnixtoDate(unix, t) {
    var date = new Date(unix * 1000);
    var hours = date.getHours();
    let year = date.getFullYear();
    var minutes = "0" + date.getMinutes();
    var ampm = hours >= 12 ? '午後' : '午前';
    var ampme = hours >= 12? 'AM' : 'PM';
    var formattedTime = year + "/" + date.toLocaleDateString('ja-JP').slice(5) + " " + ampm + ':' + hours + '時' + minutes.substr(-2) + '分';
    var hourmin = ampme + hours + ":" + minutes;
    return formattedTime;
}

function mintohour(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + "時間" + rminutes + "分"
}

async function title() {
    console.clear();
    setTitle('Loading..');
    console.log(chalk.white.underline("このプログラムを使用する場合Terminalで使用することをお勧めします"));
    const RainbowTitle = chalkAnimation.rainbow(`${C.js.welcometext}`);
    await sleep();
    RainbowTitle.stop();
};

if(C.js.title === true) {
    await title();
};

client.on('ready', () => {
    console.clear();
    setTitle('😅 Bot Console');
    print('NONE', `📃 プログラムを終了するには"${C.js.exitkey}"を押してください`, false);
    print('NONE', '🥺 getconanは現在開発途中です', false);
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
    commands?.create({
        name: "getconan",
        description: "コナンのエピソード情報を取得",
        options: [
            {
                name: "count",
                description: "数字を入力してください(1~129以下)",
                type: "NUMBER",
                require: true
            }
        ]
    });
    commands?.create({
        name: "spammer",
        description: "スパムを開始!(4000ミリ秒ごとに)",
        options: [
            {
                name: "message",
                description: "スパムしたい内容を入力してください",
                type: "STRING",
                require: true
            },
            {
                name: "count",
                description: "スパムしたい回数を入力してください",
                type: "NUMBER",
                require: true
            }
        ]
    });
});

//こなんが見れるようになったら |秒,分,時,日,月,週| (0 30 18 * * 1)
const conan = corn.schedule(`0 30 18 * * *`, () => {
    print('CONAN', "コナンの放送が終了しました。1分後最新話が無料で視聴可能になります", false);
    setTimeout(() => {
        request(option1, function(error, response) {
            const data = JSON.parse(response.body);
            const embed = new MessageEmbed()
            .setTitle('最新話: 「**' + data[1].data.episode + '話' + data[1].data.title + '**」が視聴可能になりました')
            .setColor("#00C09A")
            .setImage(`https://www.ytv.co.jp${data[1].data.thumbnail}`)
            .setDescription('**[ここ](https://www.ytv.co.jp/mydo/conan/)から視聴可能です**\n' + data[1].data.conan_story) 
            client.guilds.cache.get("815573176653709332").channels.cache.get("815603507578404894").send({ embeds: [embed] })
        });
        print('CONAN', "コナンが無料で視聴可能になりました。", false)
    }, 60000);
});

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith(C.discord.PREFIX)) return;
    let args = msg.content.substring(C.discord.PREFIX.length).split(" ");

    conan.start();

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
        case "getsherry":
            const sherryembed = new MessageEmbed()
             .setColor('AQUA')
             .setTitle('また来週～!')
             .setImage('http://www.conatsu.com/sherry/sherry-up1.JPG')

            const loadingsherryembed = new MessageEmbed()
             .setColor('BLUE')
             .setTitle('今回のお話についてシェリーさんのご意見は?')
             .setImage('http://www.conatsu.com/sherry/sherry-long.JPG')
             
            
            msg.channel.send({embeds: [loadingsherryembed]}).then(e => {
                setTimeout(function () {
                    e.edit({ embeds: [sherryembed] }).then(() => {
                     print('DISCORD', "シェリーの一言を送信!", false);
                    })
                }, 3500);

            })
        break;
        case "gore":
            const randnum = 0 + Math.floor( Math.random() * 6 );
            const count = randnum;
            console.log(count);
            //console.log(shock.shocklist[count].title);
            const embed = new MessageEmbed()
             .setColor('DARK_BUT_NOT_BLACK')
             .setTitle(`**${shock.shocklist[count].title}**`)
             .setURL(`${shock.shocklist[count].link}`)
             .setDescription(`${shock.shocklist[count].description}`)
             .addFields({
                name: "グロレベル", value: `${shock.shocklist[count].level}`
             })
            msg.channel.send({embeds: [embed]});
        break;
    };
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) {
        return;
    }
    const { commandName, options, channel} = interaction;
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
          { name: "getsteamplayerinfo", value: "SteamIDを入力しSteam情報を取得します"},
          { name: "*getsherry", value: "今週のシェリーの一言!"}
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
                //console.log(`SteamID: ${member.steamId}` + ` APPID: ${C.steam.rust}`)
                let description = "\n"; 
                let f = `**${member.name} \n (${C.steam.baseurl}${member.steamId})**`;
                let str = "**オンライン?:** " + member.isOnline + "\n" + "**生きている?:** " + member.isAlive;
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
                //debug print('INFO', `ID:${data.id} | Size:${info.mapSize} | Seed:${info.seed}`, false);
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
        //console.log(chalk.blue.italic(`PlayerName: ${username} | PlatForm: ${platform}`));
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
            steamapi.getUserOwnedGames(steamid, C.steam.rust).then(c => {
                steamapi.getUserBans(steamid).then(b => {
                    const steamplayerinfoembed = new MessageEmbed()
                     .setColor('RANDOM')
                     .setThumbnail(s.avatar.large)
                     .setTitle("**" + s.nickname + "**の情報")
                     .setURL(s.url)
                     .setDescription("**SteamID**: " + s.steamID + "\n**アカウントを作成した日**: " + UnixtoDate(s.created) + "\n**最終ログイン時間**: " + UnixtoDate(s.lastLogOff) + "\nRustプレイ時間: " + mintohour(c[0].playTime) + "時間\n過去2週間のプレイ時間: " + mintohour(c[0].playTime2) + "時間")
              
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
                    name: "現在のステータス", value: "🟢 " + s.gameExtraInfo + "をプレイ中", inline: true
                })
                print('INFO', "現在" + s.nickname + "は**" + s.gameExtraInfo + "**をプレイ中です", false)
                    };
                    if(b.vacBans += 0) {
                      steamplayerinfoembed.addField('VACBAN', '🔴 VACBANあり: ' + b.vacBans + '個', true)
                      print('INFO', "VACBANをされているのを確認:" + b.vacBans + "個", false)
                    } else if(b.vacBans === 0) {
                      steamplayerinfoembed.addField('VACBAN', '🟢 VACBANなし', true)
                      print('INFO', "VACBANをされていないのを確認", false)
                    };
                    if(b.gameBans += 0) {
                      steamplayerinfoembed.addField('GAMEBAN', '🔴 GAMEBANあり: ' + b.gameBans + '個', true)
                      print('INFO', "GAMEBANをされているのを確認:" + b.daysSinceLastBan + "日前", false)
                    } else if(b.gameBans === 0) {
                      steamplayerinfoembed.addField('GAMEBAN', '🟢 GAMEBANなし', true)
                      print('INFO', "GAMEBANをされていないのを確認", false)
                    };
                    if(c[0].playTime === '0') {
                        print('ERROR', s.nickname + "は現在プレイ時間を非公開にしています。", false)
                    };
                    interaction.reply({ embeds: [steamplayerinfoembed] });
                    print('DISCORD', `メッセージを送信しました(steamplayerinfoembed:` + s.nickname + ")", false);
            });
            })
        });
    };
    if(commandName === 'play') {
        if(!interaction.member.voice.channel){
            interaction.reply('🔊ボイスチャンネルに接続してください');
            print('ERROR', "Voiceチャンネルに接続してから実行してください", false);
        };
        const song = interaction.options.getString('song');
    };
    if(commandName === 'getconan') {
        const count = interaction.options.getNumber('count');
        const option2 = { //story.json(1話~960)
            url: "https://www.ytv.co.jp/conan/data/story.json",
            method: 'GET',
            accept: 'application/json'
        };

        if(count <= 129) {
            request(option1, function(error, response) {
                var date = JSON.parse(response.body);
                const embed = new MessageEmbed()
                 .setTitle('第' + date[count].data.episode + '話 「' + date[count].data.title + '」')
                 .setURL('https://www.ytv.co.jp/mydo/conan/')
                 .setColor('FUCHSIA')
                 .setImage(`https://www.ytv.co.jp${date[count].data.thumbnail}`)
                 .setDescription(date[count].data.conan_story)
                 .setTimestamp(Date.now())
                interaction.reply({ embeds: [embed] });
                print('DISCORD', "embedを送信(129以下)", false);
            });
        } else {
            request(option2, function(error, response){
                const data = JSON.parse(response.body);
                const embed = new MessageEmbed()
                 .setTitle("第" + data.item[count].story_num + "話 「" + data.item[count].title + "」")
                 .setColor('FUCHSIA')
                interaction.reply({ embeds: [embed] });
                print('DISCORD', "embedを送信(129以上)", false);
            });
        }
    };
    if(commandName === 'spammer') {
        const count = interaction.options.getNumber('count');
        const message = interaction.options.getString('message');
        let c = 0;
        const embed = new MessageEmbed()
         .setTitle('Spammerを起動')
         .setColor('DARK_GREY')
         .setDescription('↓このメッセージを送信します↓\n' + message);

        interaction.reply({ embeds: [embed] });
        function msg(message) {
            print('INFO', message, true);
            print('INFO', `スパムを送信(${c}/${count})`, false);
        }
        const spam = setInterval(() => {
            let num = 1;
            msg(message);
            if(++c > count) {
                clearInterval(spam);
                print('INFO', "スパムを停止", false);
            }
        }, 3000)
    }
});

process.stdin.on('keypress', function (ch, key) {
    if(key.name == C.js.exitkey) {
        process.exit(1);
    } else if(key.name == 'c') {
        console.log("Consoleをキレイさっぱりにします")
        setTimeout(() => {
            console.clear();
            print('NONE', `📃 プログラムを終了するには"${C.js.exitkey}"を押してください`, false);
            print('NONE', '🥺 getconanは現在開発途中です', false);
            print("SUCCESS", `Loginに成功→${client.user.tag}`, false);
        }, 5000)
    }
});

if(C.rp.connect === true) {
    rustplus.connect();
};

client.login(C.discord.BOTTOKEN);