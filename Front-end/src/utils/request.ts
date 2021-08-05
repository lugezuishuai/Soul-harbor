import originAxios, { AxiosRequestConfig, Canceler, CancelTokenSource } from 'axios';
import Cookies from 'js-cookie';
import { noop } from '@/utils/noop';
import { handleErrorMsg } from './handleErrorMsg';
import Qs from 'qs';

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

// 存储要发送请求的键值对
const pendingRequest = new Map<string, Canceler>();

// 根据请求信息生成请求Key
function generateReqKey(config: AxiosRequestConfig) {
  const { method, url, params, data } = config;
  return [method, url, Qs.stringify(params), Qs.stringify(data)].join('&');
}

// 用于把当前请求信息添加到pendingRequest对象中
function addPendingRequest(config: AxiosRequestConfig) {
  const requestKey = generateReqKey(config);
  config.cancelToken =
    config.cancelToken ||
    new originAxios.CancelToken((cancel) => {
      if (!pendingRequest.has(requestKey)) {
        pendingRequest.set(requestKey, cancel);
      }
    });
}

// 检查是否存在重复请求，若存在则取消已发送的请求
function removePendingRequest(config: AxiosRequestConfig) {
  const requestKey = generateReqKey(config);
  if (pendingRequest.has(requestKey)) {
    const cancelToken = pendingRequest.get(requestKey);
    if (!cancelToken) {
      return;
    }
    cancelToken(requestKey);
    pendingRequest.delete(requestKey);
  }
}

// 请求拦截器
axios.interceptors.request.use(
  function (config) {
    const { headers } = config;
    headers.Authorization = Cookies.get('token')?.replace('%20', ' '); // 每个请求头带上Authorization

    removePendingRequest(config); // 检查是否存在重复请求，若存在则取消已发送的请求
    addPendingRequest(config); // 把当前请求信息添加到pendingRequest对象中

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 响应拦截器
axios.interceptors.response.use(
  function (response) {
    removePendingRequest(response.config); // 从pendingRequest对象中移除请求
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
    removePendingRequest(error.config || {}); // 从pendingRequest对象中移除请求
    if (originAxios.isCancel(error)) {
      // 主动原因取消的请求
      console.log(`Request canceled by ${error.message || ''}`);
      return Promise.reject(error);
    } else {
      const errorStatus = error?.response?.status;
      const errorData = error?.response?.data;
      const errorMsg = error?.response?.data?.msg;
      if (errorStatus && errorStatus !== 401) {
        handleErrorMsg(errorMsg || '请求出错，请重新尝试');
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
      return Promise.reject(errorData || error);
    }
  }
);

//get请求
export function apiGet(url: string, data?: any, headers = {}, config: GetConfigProps = {}): Promise<any> {
  const { source } = config;
  return axios.get(url, {
    headers,
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
    headers,
    onDownloadProgress,
    onUploadProgress,
    cancelToken: source?.token,
  });
}

export default axios;
