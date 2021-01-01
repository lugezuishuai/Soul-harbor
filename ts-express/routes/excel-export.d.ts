// excel-export 的声明文件
declare module 'excel-export' {
  export function execute(config: Config): void;
  export interface Config {
    cols: { caption: string; type: string }[];
    rows: any[];
  }
}