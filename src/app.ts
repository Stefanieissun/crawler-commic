import PLimit from 'p-limit'
import fs from 'fs'
import {join} from 'path'
import { downImg, getPages } from './util';
async function downJpg(imgUrls:{msg:string,href:string}[],dir:string){
    const limit  = PLimit(15);
    const input = [];
    for(const {msg, href} of imgUrls){
        fs.mkdirSync(join(__dirname,`../commic/${dir}/${msg}`),{recursive:true});
        const data = await getPages(href);
        for(let i in data){
            input.push(limit(async()=>await downImg(data[i],Number(i)+1,`${dir}/${msg}`)))
        }
    }
   return await Promise.all(input);
    // process.exit();
}


process.on('message',async param=>{
    const {imgUrls,dir} = param;
   await downJpg(imgUrls,dir);
})