import cheerio from 'cheerio'
import { getHtml } from './util';
import {cpus} from 'os'
import  { join } from 'path'

import {fork} from 'child_process'



const host = `https://www.leyuman.com`;
const cpusNum = cpus().length;
const huoyin = {url:`https://www.leyuman.com/comic/16784.html`,dir:'火影忍者'};
const diyu = {url:`https://www.leyuman.com/comic/13960.html`,dir:'地狱老师'};
const test = {url:`https://www.leyuman.com/comic/16812.html`,dir:'test'};
async function startDown(url:string,dir:string){
    let html = await getHtml(url);
    const $ = cheerio.load(html);
    const cheerioArrs: any[] = Array.from(($(`body > div.wrapper > div.comic-content > div.comic-content-list.clearfix > ul`)).children());
    const imgUrl = cheerioArrs.map(x => {
        const href = host + x.children[0].attribs.href;
        const msg:string = x.children[0].children[0].data;
        return {msg,href};
    });
    const imgUrls = imgUrl.reverse();
    const num = Math.ceil(imgUrls.length/3);
    console.log('num',num,'img',imgUrls.length);
    for(let i=0;i<cpusNum;i++){
        const p = fork(join(__dirname,'./app.ts'));
        const t = imgUrls.splice(0,num);
        p.stderr?.on('data',t=>console.log(t))
        p.send({imgUrls:t,dir});
    }
}

startDown(huoyin.url,huoyin.dir);