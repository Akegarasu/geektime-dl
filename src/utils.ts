import * as fs from 'fs';
import TurndownService from 'turndown'

export function html2md(html: string): string {
    const service = new TurndownService();
    const markdown = service.turndown(html);
    return markdown;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function random(min: number, max: number) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

export async function ensureDir(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export async function writeFile(filePath: string, content: string): Promise<void> {
    fs.writeFile(filePath, content, err => {
        if (err) {
            console.log(err);
        }
    });
}

// windows文件名特殊符号
export function winPath(name: string): string {
    return name.replace(/<|>|\||&|\/|\\|\?|\*|\:/g, " ")
}