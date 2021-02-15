import PLimit from 'p-limit'
import fs from 'fs'
import { join } from 'path'
import { downImg, getPages } from './util';
async function downJpg(imgUrls: { msg: string, href: string }[], dir: string) {
  
    const limit = PLimit(15);
    const input = [];
    for (const { msg, href } of imgUrls) {
        fs.mkdirSync(join(__dirname, `../commic/${dir}/${msg}`), { recursive: true });
        const data = await getPages(href);
        
        for (let i in data) {
                (global as any).data[data[i]]=0;
            input.push(limit(async () => await downImg(data[i], Number(i) + 1, `${dir}/${msg}`)))
        }
    }
    return await Promise.all(input);
    // process.exit();
}


process.on('message', async param => {
    if(!(global as any).data){
        (global as any).data ={a:1};
    }
    setInterval(()=>{
        // console.log('pid',process.pid, Object.keys((global as any).data).length);
        if(Object.keys((global as any).data).length===0){
            console.log(process.pid,'退出');
            process.exit();
        }
        delete (global as any).data['a'];
    },3000)
    const { imgUrls, dir } = param;
    await downJpg(imgUrls, dir);
})