import {get} from 'https'
import fs from 'fs'
export function getHtml(url:string):Promise<string>{
    return new Promise((resolve,reject)=>{
        get(url,res=>{
            let data:Buffer[] = [];
            res.on('data',chunk=>data.push(chunk));
            res.on('end',()=>{
                let html = Buffer.concat(data).toString();
                resolve(html);
            }).on('error',err=>reject(err));
        })
    })
   
}

export async function getPages(url:string):Promise<string[]>{
    const data = await getHtml(url);
    const imgs = eval(data.split(`z_img='`)[1].split(`';`)[0]);
    return imgs.map((x:string)=>`https://img.xinxing111.com/`+x);
}

export function downImg(url:string,n:number,dest:string):Promise<string>{
    // console.log('dest',dest);
    return new Promise((resolve,reject)=>{
        get(url,res=>{
            console.log(`开始下载,${dest}第${n}页`);
            res.pipe(fs.createWriteStream(`commic/${dest}/${n}.jpg`)).on('finish',()=>{
                console.log(`${dest}第${n}页下载完成`);
                resolve(`${url}第${n}页下载完成`);}).on('error',err=>resolve(err.message));
        }).on('error',err=>console.error(err)).on('timeout',()=>downImg(url,n,dest));
    })   
}