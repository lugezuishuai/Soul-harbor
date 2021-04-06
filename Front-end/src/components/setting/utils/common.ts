import { CancelTokenSource } from 'axios';
export const CHUNK_SIZE = 5 * 1024 * 1024;
export const axiosList: CancelTokenSource[] = [];