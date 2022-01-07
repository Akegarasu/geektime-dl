import { random, sleep } from './utils';

import * as path from 'path';
import * as utils from './utils'
import * as requests from './requests';


interface Intro {
    column_title: string;
    column_subtitle: string;
    column_intro: string;
    article_total_count: string;
}
interface Article {
    id: string;
    article_title: string;
    chapter_id: string;
    article_cover: string;
    article_content: string;
}
interface Pagination {
    count: number;
    more: boolean;
}


const [columnId, DIST = 'dist'] = process.argv.slice(2);
if (!columnId) {
    throw new Error('required `columnId` in arguments');
}

const API_ROOT = 'https://time.geekbang.org';
const API_INTRO = `${API_ROOT}/serv/v1/column/intro`;
const API_ARTICLES = `${API_ROOT}/serv/v1/column/articles`;
const API_ARTICLE = `${API_ROOT}/serv/v1/article`;


async function getIntroduce(columnId: string): Promise<string> {
    const {
        column_title: title,
        column_subtitle: summary,
        column_intro: introduce,
    } = await requests.post<Intro>(API_INTRO, {
        cid: columnId,
    });
    const dir = path.join(DIST, title);
    await utils.ensureDir(dir);
    await utils.writeFile(
        path.join(dir, `Introduce.md`),
        [`# ${title}\n`, `> ${summary}\n`, utils.html2md(`${introduce}`)].join('\n',),
    );
    console.log(`Write Introduce.md in ${dir}`);
    return dir;
}

async function downloadChapters(columnId: string, dir: string) {
    const { list: articles } = await requests.post<{ list: Article[]; page: Pagination }>(API_ARTICLES, {
        cid: columnId,
        order: 'earliest',
        prev: 0,
        sample: false,
        size: 500,
    });
    let markdown = '# Chapters\n\n';
    for (let { id, article_title: title } of articles) {
        title = title.replace(/\s/g, '');
        markdown += `- [${title}](./${utils.winPath(title)}.md)\n`;
        await getArticle(id, title, dir);
        await sleep(random(3000, 5000));
    }
    await utils.writeFile(
        path.join(dir, `Chapters.md`),
        markdown,
    );
}

async function getArticle(id: string, title: string, dir: string) {
    try {
        const article = await requests.post<Article>(API_ARTICLE, {
            id,
            include_neighbors: true,
            is_freelyread: true,
        });
        const preappend = `<h1>${title}</h1>` + `<img src="${article.article_cover}" />\n`;
        const markdown = utils.html2md(preappend + article.article_content);
        await utils.writeFile(
            path.join(
                dir,
                `${utils.winPath(title)}.md`,
            ),
            markdown,
        );
        console.log(`下载 ${title}.md`);
    } catch (error) {
        console.error(`下载 ${title} 失败: ${error}`);
    }
}


(async function main() {
    const dir = await getIntroduce(columnId);
    await downloadChapters(columnId, dir);
})();
