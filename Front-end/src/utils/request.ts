import originAxios from 'axios';
import { message } from 'antd';

const axios = originAxios.create({
  timeout: 20000          //设置请求的最大时延是20s
});

axios.interceptors.response.use(
  function(response) {
    if(response.data && response.data.code === 1) {
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
    return Promise.reject(error);
  }
);

//get请求
export function get(url: string, data: any) {
  return axios.get(url, {
      params: data
  })
}

//post请求
export function post(url: string, data: any) {
  return axios({
    method: 'post',
    url,
    data
  });
}

export default axios;