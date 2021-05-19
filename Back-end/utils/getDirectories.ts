import fse from 'fs-extra';
import path from 'path';

export const isDirectory = (source: string) => fse.lstatSync(source).isDirectory();
export const getDirectories = (source: string) =>
  fse
    .readdirSync(source)
    .map((name) => path.join(source, name))
    .filter(isDirectory);
