import chalk, { Chalk } from 'chalk';
import { readFile } from 'fs/promises';
import RustPlus from "@liamcottle/rustplus.js";

const C = JSON.parse(await readFile(new URL('../config.json', import.meta.url)));
var rustplus = new RustPlus(C.rp.ip, C.rp.port, C.rp.id, C.rp.token);
function UnixtoDate(unix) {
    var date = new Date();
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var ampm = hours >= 12 ? '午後' : '午前';
    var hourmin = ampm + hours + ":" + minutes.substr(-2)
    return hourmin;
}

rustplus.on('connected', () => {
    null;
});

if(C.rp.connect === true) {
  rustplus.connect();
};

/**
 * error,success,none,info
 * @param {string} a 
 * @param {string} b 
 * @param {string} c 
 */
// cはRustplusを使用しゲーム内(チームチャット)にメッセージを送信するか、又dはcがtrueだった場合メッセージの内容を決める
export default function print(a, b, c) {
    if(c === true) {
            rustplus.sendTeamMessage((`[${UnixtoDate(Date.now())}] `) + `[${a}] : ${b}`);
            //console.log(chalk.blueBright.bold(`[INFO] `) + `: ゲーム内にメッセージを送信しました`);
    } else if(c === false) {
        if(a === 'INFO') {
            console.log(chalk.black.bold(`[${UnixtoDate(Date.now())}] `) + chalk.blueBright.bold(`[${a}] `) + `: ${b}`);
        } else if(a === 'ERROR') {
            console.log(chalk.black.bold(`[${UnixtoDate(Date.now())}] `) + chalk.red.bold(`[${a}] `) + `: ${b}`);
        } else if(a === 'DISCORD') {
            console.log(chalk.black.bold(`[${UnixtoDate(Date.now())}] `) + chalk.green.bold(`[${a}] `) + `: ${b}`);
        } else if(a === 'SUCCESS') {
            console.log(chalk.black.bold(`[${UnixtoDate(Date.now())}] `) + chalk.cyan.bold(`[${a}] `) + `: ${b}`);
        } else if (a === 'NONE'){
            console.log(chalk.green.underline(`${b}`));
        } else if(a === 'RUST') {
            console.log(chalk.black.bold(`[${UnixtoDate(Date.now())}]`) + chalk.yellow.bold(`[${a}] `) + `: ${b}`);
        } 
        else {
            console.log(chalk.white.bold(`[${UnixtoDate(Date.now())}] `) + `[${a}] ` + `: ${b}`);
        }
    } else {
        console.log(chalk.red.bold(`[ERROR] `) + `: print(a,b,c)のcに文字が入力されていません`);
    }
};