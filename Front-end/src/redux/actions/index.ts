import { Dispatch } from 'redux';
import { get, post } from '../../utils/request';
import { department, level } from '../../constants/options';

import {
  GET_EMPLOYEE_URL,
  CREATE_EMPLOYEE_URL,
  DELETE_EMPLOYEE_URL,
  UPDATE_EMPLOYEE_URL,
  GET_USERINFO_URL,
} from '../../constants/urls';

import {
    GET_EMPLOYEE,
    CREATE_EMPLOYEE,
    DELETE_EMPLOYEE,
    UPDATE_EMPLOYEE,
    GET_USERINFO
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
            get(GET_EMPLOYEE_URL, param).then(res => {
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
            post(CREATE_EMPLOYEE_URL, param).then(res => {
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
            post(DELETE_EMPLOYEE_URL, param).then(res => {
                dispatch({
                    type: DELETE_EMPLOYEE,
                    payload: param.id
                })
            });
        }
    },
    updateEmployee: function(param: UpdateRequest, callback: () => void) {
        return (dispatch: Dispatch) => {
            post(UPDATE_EMPLOYEE_URL, param).then(res => {
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