import { debounce } from 'lodash-es';
import { message } from 'antd';

export const handleErrorMsg = (errorMsg: string, delay = 200) =>
  debounce((errorMsg: string) => {
    message.destroy();
    message.error(errorMsg);
  }, delay)(errorMsg);
