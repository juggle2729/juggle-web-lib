import appCode from './openAppCode';
import { ios, android } from './openAppUrl';
function isIOS() {
    var u = navigator.userAgent;
    var IsIos = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    return IsIos;
}
function getList() {
    if (isIOS()) {
        return ios
    } else {
        return android
    }
}
function getUrl(code) {
    for (let item in appCode) {
        if (code == appCode[item]) {
            return getList()[item];
        }
    }
}

export default {
    isIOS, getUrl
};