import cheerio from 'cheerio'
import { downImg, getHtml, getPages } from './util';
import fs from 'fs';

import PLimit from 'p-limit'




const host = `https://www.leyuman.com`;

const huoyin = {url:`https://www.leyuman.com/comic/16784.html`,dir:'火影忍者'};
const diyu = {url:`https://www.leyuman.com/comic/13960.html`,dir:'地狱老师'};
const test = {url:`https://www.leyuman.com/comic/16812.html`,dir:'test'};
async function startDown(url:string,dir:string){
    let html = await getHtml(url);
    const $ = cheerio.load(html);
    const cheerioArrs: any[] = Array.from(($(`body > div.wrapper > div.comic-content > div.comic-content-list.clearfix > ul`)).children());
    const imgUrl = cheerioArrs.map(x => {
        const href = host + x.children[0].attribs.href;
        const msg = x.children[0].children[0].data;
        return {msg,href};
    });
    const imgUrls = imgUrl.reverse();
    const limit = PLimit(15);
    const input:any[] = [];
    for(const {msg,href} of imgUrls){
        fs.mkdirSync(`commic/${dir}/${msg}`,{recursive:true});  
        const data = await getPages(href);
        for(let i in data ){
            input.push(limit(()=>downImg(url,Number(i)+1,`${dir}/${msg}`)))
        }
    };
     console.log('over');
}

startDown(diyu.url,diyu.dir);