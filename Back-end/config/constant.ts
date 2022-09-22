export const isDevelopment = process.env.NODE_ENV === 'development';
export const ENV_PATH = isDevelopment ? '.env.development' : '.env';
