export function formatDate(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  if (!date) return '-';

  if (!(date instanceof Date)) {
    date = getDateInstane(date);
  }
  if (typeof fmt != 'string') {
    fmt = 'yyyy-MM-dd hh:mm:ss';
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
  };
  for (const k in o) {
    // eslint-disable-line
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = `${o[k]}`;
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str));
    }
  }
  return fmt;
}
export function formatDateOverSea(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  if (!date) return '-';

  if (!(date instanceof Date)) {
    date = getDateInstane(date);
  }
  if (typeof fmt != 'string') {
    fmt = 'yyyy-MM-dd hh:mm:ss';
  }
  if (localStorage.getItem('$isAbroad') == 1) {
    fmt = fmt
      .split(' ')
      .map((v, i) => {
        if (i === 0) return v.split('').reverse().join('');
        return v;
      })
      .join(' ');
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
  }
  const o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
  };
  for (const k in o) {
    // eslint-disable-line
    if (new RegExp(`(${k})`).test(fmt)) {
      const str = `${o[k]}`;
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? str : padLeftZero(str));
    }
  }
  return fmt;
}

function isValidDate(date) {
  return date instanceof Date && !isNaN(date.getTime());
}

function getDateInstane(date) {
  let d = date;
  // int 时间戳
  // string 时间戳、YYYY-MM-DD日期格式
  // '2022-01-07T08:20:11.000+00:00'

  // 非时间日期格式处理
  if (!isValidDate(new Date(date))) {
    if (isNaN(+date)) {
      try {
        // 兼容safari
        d = date.split('-').join('/');
      } catch (e) {
        /* handle error */
      }
    } else {
      d = +date;
    }
  }

  return new Date(d);
}

function padLeftZero(str) {
  return `00${str}`.substr(str.length);
}

export function toTimeStamp(time) {
  return getDateInstane(time).getTime();
}

/**
 * 时间转换，主要针对是否为当前年的不同时间格式显示
 * @param {*} date 转换时间
 * @param {*} curDate 当前系统时间，若没有，则取当前时间
 * @param {*} fmt1 跨年时间格式
 * @param {*} fmt2 当前年时间格式
 * @returns
 */
export function formateBeautifulTime(date, curDate, fmt1 = 'yyyy-MM-dd', fmt2 = 'MM-dd') {
  if (!date) return '-';
  if (!(date instanceof Date)) {
    date = getDateInstane(date);
  }
  if (!curDate) {
    curDate = getDateInstane();
  } else if (!(curDate instanceof Date)) {
    curDate = getDateInstane(curDate);
  }

  let fmt = fmt2;
  if (date.getFullYear() != curDate.getFullYear()) {
    fmt = fmt1;
  }

  return formatDate(date, fmt);
}
