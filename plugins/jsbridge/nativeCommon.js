import { invoke, isH5, isWx } from './index.js';
import localStore from '../../utils/localStore.js';
import { H5_TOKEN } from '../../utils/globalConf.js';
import h5Code from './h5Code';
import nativeCode from './nativeCode';
import { MessageAspopBrowser } from '../popBrowser';
import router from '@/router';


/** 取得token */
function getToken(handle, loginParams) {
  // 处理未登录的问题
  const wapperHandle = params => {
    const { token } = params || {};
    if (token) {
      localStore.put(H5_TOKEN, token);
      handle(params);
    } else {
      // 去登录
      login(loginParams);
    }
  };

  if (isH5) {
    // 简单处理
    return wapperHandle({
      token: '',
    });
  }
  return invoke(nativeCode.GET_TOKEN, '', {
    type: h5Code.CALLTOKEN,
    handle: wapperHandle,
  });
}

/** 返回或关闭 当页面栈为1时为关闭页 */
function backOrClose() {
  return invoke(nativeCode.BACK_OR_CLOSE, '');
}
/**
 * 去分享
 */
function onShare(params) {
  getToken(() => {
    invoke(nativeCode.SHARE, params);
  });
}
/** 去登录 */
function login(params = {}) {
  if (isH5) {
    if (isWx) {
      MessageAspopBrowser();
    } else {
      router.push({ path: '/download', query: params })
    }
    console.log('h5登录目前不处理');
    return;
  } else {
    return invoke(nativeCode.LOGIN, '');
  }
}

/**获取DEVICE_ID**/
function getDeviceId(handle) {
  if (isH5) {
    return handle({
      deviceId: '',
    });
  } else {
    return invoke(nativeCode.DEVICE_ID, '', {
      type: h5Code.DEVICE_ID,
      handle: handle,
    });
  }
}

/** 显示大图 */
function showBigImg(params) {
  if (isH5) return false;
  invoke(nativeCode.SHOW_BIG_IMG, params);
  return true;
}

/** 位置导航 */
function getLocation(eleData,isAmap) {
  if (isH5) {
    // console.info(`http://api.map.baidu.com/marker?location=${eleData.lat},${eleData.lng}&title=目标地址&content=${eleData.location}&output=html&src=webapp.baidu.openAPIdemo`)
    if(isAmap){
      window.open(
        `https://uri.amap.com/marker?position=${eleData.address}&name=${eleData.location?eleData.location:'目标地址'}`
      )
    }else{
      window.open(
        `http://api.map.baidu.com/marker?location=${eleData.lat},${eleData.lng}&title=${eleData.location?eleData.location:'目标地址'}&content=${eleData.location}&output=html&src=webapp.baidu.openAPIdemo`
      );
    }
    
    return false;
  }
  let params = {
    address: eleData.address,
    location: eleData.location,
    province: eleData.province,
    city: eleData.city,
    district: eleData.district,
    street: eleData.street,
    streetNumber: eleData.streetNumber,
  };
  invoke(nativeCode.GET_LOCATION, params);
  return true;
}

/** 隐藏导航条 */
function hideNavBar() {
  if (isH5) {
    console.log('h5不需要处理');
    return;
  }
  return invoke(nativeCode.HIDE_NAV_BAR);
}
/**立即订车**/
function bookCar() {
  if (isH5) {
    console.log('H5不处理');
    return;
  }
  return invoke(nativeCode.BOOK_CAR);
}

/**立即预约**/
function appointmentCar() {
  if (isH5) {
    console.log('H5不处理');
    return;
  }
  return invoke(nativeCode.APPOINTMENT_CAR);
}

/**立即预约**/
function toActivityRegister(params) {
  if (isH5) {
    console.log('H5不处理');
    return;
  }
  return invoke(nativeCode.ACTIVITY_REGISTER, params);
}

/**滑块验证**/
function toSlideVerification(params) {
  if (isH5) {
    console.log('H5不处理');
    return;
  }
  return invoke(nativeCode.SLIDER_VERIFICATION, params);
}

export default {
  getToken,
  backOrClose,
  login,
  onShare,
  getDeviceId,
  showBigImg,
  getLocation,
  hideNavBar,
  bookCar,
  appointmentCar,
  toActivityRegister,
  toSlideVerification
};
