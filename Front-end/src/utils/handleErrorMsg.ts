import { debounce } from 'lodash';
import { message } from 'antd';

export const handleErrorMsg = (e: any, delay = 200) => (debounce((e: any) => {
  message.destroy();
  message.error(e.msg);
}, delay))(e);