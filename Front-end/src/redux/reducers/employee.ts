import _ from 'lodash';
import { department, level } from '../../constants/options';
import {
  GET_EMPLOYEE,
  CREATE_EMPLOYEE,
  DELETE_EMPLOYEE,
  UPDATE_EMPLOYEE,
} from '../actions/action_types'
import {
  EmployeeInfo,
  UpdateRequest,
} from '../../interface/employee';
import { initialEmployeeState } from './state';
import { Action } from '../actions/index';

export default function(state = initialEmployeeState, action: Action) {
  switch (action.type) {
    case GET_EMPLOYEE:
      return {
        ...state,
        employeeList: action.payload
      }
    case CREATE_EMPLOYEE:
      let newList = [action.payload, ...(state.employeeList as EmployeeInfo[])]
      return {
        ...state,
        employeeList: newList
      }
    case DELETE_EMPLOYEE:
      let reducedList = [...(state.employeeList as EmployeeInfo[])];
      _.remove(reducedList, (item: EmployeeInfo) => {
        return item.id === action.payload
      });
      return {
        ...state,
        employeeList: reducedList
      }
    case UPDATE_EMPLOYEE:
      let updatedList = [...(state.employeeList as EmployeeInfo[])];
      let item: UpdateRequest = action.payload;
      let index = _.findIndex(updatedList, {
        id: item.id
      });
      updatedList[index] = {
        id: item.id,
        key: item.id,
        name: item.name,
        department: department[item.departmentId],
        departmentId: item.departmentId,
        hiredate: item.hiredate,
        level: level[item.levelId],
        levelId: item.levelId
      }
      return {
        ...state,
        employeeList: updatedList
      }
    default:
      return state
  }
}