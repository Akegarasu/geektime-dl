import * as dotenv from 'dotenv';
import fetch from "node-fetch";

const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36';
const API_ROOT = 'https://time.geekbang.org';

dotenv.config();
const COOKIE = process.env.GEEKTIME_TOKEN ? process.env.GEEKTIME_TOKEN : '';

if (!COOKIE) {
    throw new Error('required `GEEKTIME_TOKEN`');
}

interface APIResponse {
    code: number;
    data: any;
    error: any;
    extra: any;
}

export async function post<T>(
    url: string,
    json: any,
): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            referer: API_ROOT,
            'Cookie': COOKIE,
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(json),
    });
    const { code, data, error, extra } = await response.json() as APIResponse;
    if (error.msg) {
        throw new Error(`error: ${JSON.stringify(error)}`);
    }
    if (!Object.keys(data)) {
        throw new Error(
            `data empty: ${JSON.stringify({ code, data, error, extra })}`,
        );
    }
    return data;
}