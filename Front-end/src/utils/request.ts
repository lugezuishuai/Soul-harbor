import originAxios, { CancelTokenSource } from 'axios';
import Cookies from 'js-cookie';
import { noop } from '@/utils/noop';
import { handleErrorMsg } from './handleErrorMsg';

export interface PostConfigProps {
  onUploadProgress?: (e: ProgressEvent) => void;
  onDownloadProgress?: (e: ProgressEvent) => void;
  source?: CancelTokenSource;
}

export interface GetConfigProps {
  source?: CancelTokenSource;
}

const axios = originAxios.create({
  timeout: 20000, //设置请求的最大时延是20s
});

axios.interceptors.response.use(
  function (response) {
    if (response.data && response.data.code !== 0) {
      /*
      successful response: 
      { code: 0, data: {}, msg: "" }

      unsuccessful response: 
      { code: 1, data: {}, msg: "server error" }
      */
      const errorMsg = response.data.msg;
      handleErrorMsg(errorMsg || '');
      return Promise.reject(errorMsg);
    }
    return response.data;
  },
  function (error) {
    if (originAxios.isCancel(error)) {
      // 主动原因取消的请求
      return Promise.reject(`Request canceled: ${error.message}`);
    } else {
      const errorStatus = error?.response?.status;
      const errorData = error?.response?.data;
      const errorMsg = error?.response?.data?.msg;
      if (errorStatus && errorStatus !== 401) {
        handleErrorMsg(errorMsg || '');
      }

      if (errorStatus) {
        switch (errorStatus) {
          case 403:
            window.location.href = '/exception/403';
            break;
          case 404:
            window.location.href = '/exception/404';
            break;
          case 500:
            window.location.href = '/exception/500';
            break;
          default:
            break;
        }
      }
      return errorData ? Promise.reject(error.response.data) : Promise.reject();
    }
  }
);

//get请求
export function apiGet(url: string, data?: any, headers = {}, config: GetConfigProps = {}): Promise<any> {
  const { source } = config;
  return axios.get(url, {
    headers: {
      Authorization: Cookies.get('token')?.replace('%20', ' '),
      ...headers,
    },
    params: data,
    cancelToken: source?.token,
  });
}

//post请求
export function apiPost(url: string, data: any, headers = {}, config: PostConfigProps = {}): Promise<any> {
  const { onUploadProgress = noop, onDownloadProgress = noop, source } = config;
  return axios({
    method: 'post',
    url,
    data,
    headers: {
      Authorization: Cookies.get('token')?.replace('%20', ' '),
      ...headers,
    },
    onDownloadProgress,
    onUploadProgress,
    cancelToken: source?.token,
  });
}

export default axios;
