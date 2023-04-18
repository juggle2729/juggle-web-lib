/*
 * @Descripttion: 
 * @Author: yang fu ren
 * @version: 
 * @Date: 2022-04-19 16:13:49
 * @LastEditors: yang fu ren
 * @LastEditTime: 2023-04-18 14:44:35
 */
import { formatDate } from '../utils/date';

function formatTime(value) {
  if (!value) return '-';

  return formatDate(new Date(value));
}


export default { formatTime };
