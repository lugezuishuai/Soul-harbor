import { CancelTokenSource } from 'axios';
export const CHUNK_SIZE = 1 * 1024 * 1024; // 分片大小是1M
export const axiosList: CancelTokenSource[] = []; // 存放的是source