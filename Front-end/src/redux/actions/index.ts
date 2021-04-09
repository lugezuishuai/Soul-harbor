import { Dispatch } from 'redux';
import { apiGet, apiPost } from '../../utils/request';
import { department, level } from '../../constants/options';

import {
  GET_EMPLOYEE_URL,
  CREATE_EMPLOYEE_URL,
  DELETE_EMPLOYEE_URL,
  UPDATE_EMPLOYEE_URL,
} from '../../constants/urls';

import {
    GET_EMPLOYEE,
    CREATE_EMPLOYEE,
    DELETE_EMPLOYEE,
    UPDATE_EMPLOYEE,
} from './action_types';

import {
    EmployeeRequest,
    CreateRequest,
    DeleteRequest,
    UpdateRequest
} from '../../interface/employee';

export type Action = {
  type: string;
  payload: any;
}

const actions = {
  getEmployee: function(param: EmployeeRequest, callback: () => void) {
    return (dispatch: Dispatch) => {
      apiGet(GET_EMPLOYEE_URL, param).then(res => {
        dispatch({
          type: GET_EMPLOYEE,
          payload: res.data
        });
        callback();
      });
    }
  },
  createEmployee: function(param: CreateRequest, callback: () => void) {
    return (dispatch: Dispatch) => {
      apiPost(CREATE_EMPLOYEE_URL, param).then(res => {
        dispatch({
          type: CREATE_EMPLOYEE,
          payload: {
            name: param.name,
            department: department[param.departmentId],
            departmentId: param.departmentId,
            hiredate: param.hiredate,
            level: level[param.levelId],
            levelId: param.levelId,
            ...res.data
          }
        });
        callback();
      });
    }
  },
  deleteEmployee: function(param: DeleteRequest) {
    return (dispatch: Dispatch) => {
      apiPost(DELETE_EMPLOYEE_URL, param).then(() => {
        dispatch({
          type: DELETE_EMPLOYEE,
          payload: param.id
        })
      });
    }
  },
  updateEmployee: function(param: UpdateRequest, callback: () => void) {
    return (dispatch: Dispatch) => {
      apiPost(UPDATE_EMPLOYEE_URL, param).then(() => {
        dispatch({
          type: UPDATE_EMPLOYEE,
          payload: param
        });
        callback();
      });
    }
  },
}

export default actions;