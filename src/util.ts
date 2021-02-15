import { get, request } from 'https'
import fs from 'fs'
import path from 'path'
import qs from 'querystring'
import cheerio from 'cheerio';

export function getHtml(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        get(url, res => {
            let data: Buffer[] = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
                let html = Buffer.concat(data).toString();
                resolve(html);
            }).on('error', err => reject(err));
        })
    })

}

export async function getPages(url: string): Promise<string[]> {
    const data = await getHtml(url);
    const imgs = eval(data.split(`z_img='`)[1].split(`';`)[0]);
    return imgs.map((x: string) => `https://img.xinxing111.com/` + x);
}

export function downImg(url: string, n: number, dest: string): Promise<string> {
    // console.log('dest',dest);
    return new Promise((resolve, reject) => {
        get(url, res => {
            // console.log(`开始下载,${dest}第${n}页`);
            res.pipe(fs.createWriteStream(path.join(__dirname, `../commic/${dest}/${n}.jpg`))).on('finish', () => {
                console.log(`${dest}第${n}页下载完成`);
                resolve(`${url}第${n}页下载完成`);
            }).on('error', err => {delete (global as any).data[url];});
        }).on('error', err => {delete (global as any).data[url];}).on('timeout', () => {delete (global as any).data[url];})
        .on('finish',()=>{
            delete (global as any).data[url];
        });
    })
}

/**
 * 
 * @param keyword 漫画关键词搜索
 */
export function searchCommic(keyword: string): Promise<{ href: string, title: string }[]> {
    const options = {
        "method": "POST",
        "hostname": "www.leyuman.com",
        "port": 443,
        "path": "/search.html",
        "headers": {
            "content-type": "application/x-www-form-urlencoded"
        }
    };
    return new Promise((resolve, reject) => {
        const req = request(options, res => {
            const chunks: Buffer[] = [];
            res.on('data', (chunk: Buffer) => chunks.push(chunk)).on('error', err => reject(err));
            res.on('end', () => {
                const body = Buffer.concat(chunks);
                const $ = cheerio.load(body.toString());
                const t = Array.from($(`body > div.wrapper.clearfix > div.clearfix > div`).children());
                const data = t.map(x => {
                    let a = $(x).children('a');
                    const href = a.attr().href;
                    const title = a.children('.title').text();
                    return { href, title };
                });
                resolve(data);
            })
        });
        req.write(qs.stringify({ keyword }));
        req.end();
    })
}