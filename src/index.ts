import cheerio from 'cheerio'
import { getHtml, searchCommic } from './util';
import { cpus } from 'os'
import { join } from 'path'
import { fork } from 'child_process'
import chalk from 'chalk'
import inquirer from 'inquirer'

const host = `https://www.leyuman.com`;
const cpusNum = cpus().length;

async function startDown(url: string, dir: string) {
    let html = await getHtml(url);
    const $ = cheerio.load(html);
    const cheerioArrs: any[] = Array.from(($(`body > div.wrapper > div.comic-content > div.comic-content-list.clearfix > ul`)).children());
    const imgUrl = cheerioArrs.map(x => {
        const href = host + x.children[0].attribs.href;
        const msg: string = x.children[0].children[0].data;
        return { msg, href };
    });
    const imgUrls = imgUrl.reverse();
    const num = Math.ceil(imgUrls.length / cpusNum);
    for (let i = 0; i < cpusNum; i++) {
        const p = fork(join(__dirname, './app.ts'));
        const t = imgUrls.splice(0, num);
        p.stderr?.on('data', t => console.log(t))
        p.send({ imgUrls: t, dir });
    }
}

inquirer.prompt([{
    type: 'input',
    name: 'commic',
    message: chalk.bgCyan('please input the commic you want to search')
}]).then(async data => {
    const { commic } = data;
    const commicSearch = await searchCommic(commic);
    console.log(commicSearch);
    inquirer.prompt([{
        type: 'list',
        name: 'choicCommic',
        choices: commicSearch.map(x => x.title)
    }]).then(data => {
        const { choicCommic } = data;
        const { href, title } = commicSearch.find(x => x.title === choicCommic)!;
        startDown(host + href, title);
    });
});