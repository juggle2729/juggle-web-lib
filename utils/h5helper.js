const ip = '118.31.62.224';
const defPort = '30021';
const hostMap = {
  [ip]: ip,
};
const portMap = {
  30022: '30021',
  30008: '30007',
  32008: '32007',
  30418: '30416',
};

// h5环境地址
// 开发：https://m-dev.jugglecars.com.cn/#/cms/activity/601
// 测试：https://m-test.jugglecars.com.cn/#/cms/activity/601
// uat：https://m-uat.jugglecars.com.cn/#/cms/activity/601
// 预发布：https://m-pre.jugglecars.com.cn/#/cms/activity/601
// 正式：https://m.jugglecars.com.cn/#/cms/activity/601

const env = [
  'https://m.jugglecars.com.cn/#',
  'https://m-pre.jugglecars.com.cn/#',
  'https://m-uat.jugglecars.com.cn/#',
  'https://m-test.jugglecars.com.cn/#',
  'https://m-dev.jugglecars.com.cn/#',
];

// lcms环境地址
// 118.31.62.224:30022   开发环境
// 118.31.62.224:30008   测试环境
// 118.31.62.224:32008   uat环境
// 118.31.62.224:30506   预发环境

// pc/h5 域名印射
const portMapEnv = {
  30022: env[4], // 开发环境
  30008: env[3], // 测试环境
  32008: env[2], // uat环境
  30506: env[1], // 预发环境
};

const hostPrefix = (() => {
  let { protocol, hostname, port } = window.location;

  if (hostname == 'lcms.jugglecars.com.cn') {
    return 'https://m.jugglecars.com.cn/#';
  }

  // h5访问直接返回相应的域名地址
  const currentEnv = env.filter(url => new URL(url).hostname == hostname);

  if (currentEnv.length == 1) {
    return currentEnv[0];
  }

  // 根据端口号h5/pc进行域名印射
  if (portMapEnv[port]) {
    return portMapEnv[port];
  }

  let temp = hostMap[hostname];
  port = portMap[port];
  if (!temp) {
    temp = ip;
    port = defPort;
  }
  return `${protocol}//${temp}:${port}/#`;
})();

/**
 * 取得h5host
 * dev http://118.31.62.224:30003/
 * test http://118.31.62.224:30008/
 * prev http://118.31.62.224:30506/
 */
export function getH5UrlHost() {
  return hostPrefix;
}

/** 全屏显示 */
export function openFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullScreen();
  }
}
