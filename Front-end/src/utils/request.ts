import originAxios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';

interface MethodsProps {
  requestObj: Promise<any>;
  abort: (reason?: string) => void;
}

const axios = originAxios.create({
  timeout: 20000          //设置请求的最大时延是20s
});

axios.interceptors.response.use(
  function(response) {
    if(response.data && response.data.code !== 0) {
      /*
      successful response: 
      { "code": 0, "data": "" }

      unsuccessful response: 
      { "code": 1, "msg": "server error" }
      */
      const errorMsg = response.data.msg;
      message.error(errorMsg);
      return Promise.reject(errorMsg);
    }
    return response.data;
  },
  function(error) {
    if (originAxios.isCancel(error)) {
      // 主动原因取消的请求
      return Promise.reject(`Request canceled: ${error.message}`);
    } else {
      return error?.response?.data ? Promise.reject(error.response.data) : Promise.reject();
    }
  }
);

//get请求
export function get(url: string, data?: any, headers = {}): MethodsProps {
  const CancelToken = originAxios.CancelToken;
  const source = CancelToken.source();
  return {
    requestObj: axios.get(url, {
      headers: {
        Authorization: Cookies.get('token')?.replace('%20', ' '),
        ...headers,
      },
      params: data,
      cancelToken: source.token,
    }),
    abort: (reason = '') => source.cancel(reason),
  }
}

//post请求
export function post(url: string, data: any, headers = {}): MethodsProps {
  const CancelToken = originAxios.CancelToken;
  const source = CancelToken.source();
  return {
    requestObj: axios({
      method: 'post',
      url,
      data,
      headers: {
        Authorization: Cookies.get('token')?.replace('%20', ' '),
        ...headers,
      },
      cancelToken: source.token,
    }),
    abort: (reason = '') => source.cancel(reason),
  };
}

export default axios;