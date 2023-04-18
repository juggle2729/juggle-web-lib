import { isTypeModule } from '../base.js';
import { convertModules } from '../pack.js';
import service from './request.js';
import { resolve } from './pyurl';

const TIMEOUT_DEF = 15000;

function recursive(paramsData) {
  //数据转换方法
  let outPut = paramsData;
  if (typeof outPut === 'object' && outPut !== null) {
    for (let key in outPut) {
      if (Array.isArray(outPut[key])) {
        outPut[key] = outPut[key].join(',');
      } else if (outPut[key] instanceof Object) {
        recursive(outPut[key]);
      }
    }
  }
  return outPut;
}

function convert2Service(data, conf) {
  let method = 'get';
  let url = data;
  let catchFlag = false;
  let timeout = TIMEOUT_DEF;
  const splits = data.split(' ');
  if (splits.length > 1) {
    [method, timeout = TIMEOUT_DEF] = splits[0].split(',');
    url = splits[1];
  }
  if (splits.length > 2) {
    catchFlag = splits[2] === 'true' ? true : false
  }
  method = method.toLowerCase();

  /**
   * otherConfig: {
   *   closeGlobeToast: false, //关闭全局错误提示
   * }
   */
  return (params, headerParams, otherConfig = {}) => {
    const isUrlVariable = method === 'get' || method === 'delete';
    let pyData = resolve(url, params, isUrlVariable);
    const { url: pyurl, data: pydata } = pyData;
    let options = { url: pyurl, method, catchFlag, ...otherConfig };
    if (isUrlVariable) {
      options.params = recursive(pydata);
    } else {
      options.data = pydata;
    }
    if (conf && conf.baseURL) {
      options.baseURL = conf.baseURL;
    }
    options.timeout = +timeout;
    if (headerParams) {
      options.headers = headerParams;
    }
    return service(options);
  };
}

const registerConf = (apiConf, conf) => {
  const handler = {
    get(target, propKey) {
      let fnServicePropKey = `${propKey}-service`;
      let fnService = Reflect.get(target, fnServicePropKey);
      if (!fnService) {
        let result = Reflect.get(target, propKey);
        fnService = convert2Service(result, conf);
        Reflect.set(target, `${propKey}-service`, fnService);
      }
      return fnService;
    },
  };
  return new Proxy(apiConf, handler);
};

const proxyModules = modules => {
  const handler = {
    get(target, propKey) {
      let result = Reflect.get(target, propKey);
      if (typeof propKey == 'string' && propKey.startsWith('_')) return result;

      if (result == undefined) throw new ReferenceError('Prop name "' + propKey + '" does not exist.');
      if (isTypeModule(result)) {
        if (result.default == undefined) throw new Error(`api配置对应路径${result._path}文件没有导出default对象`);

        if (!result._register) {
          result._register = registerConf(result.default, result._conf);
        }
        return result._register;
      }
      if (!result._proxy) {
        result._proxy = proxyModules(result);
      }
      return result._proxy;

    },
  };
  return new Proxy(modules, handler);
};

export function init(context, options = {}) {
  const { ignoreFiles, toast } = options;
  service.toast = toast
  let modules = convertModules(context, ignoreFiles);

  // 处理一级模块下的CONF
  resolveCONF(modules);

  let proxy = proxyModules(modules);
  return {
    modules,
    apis: proxy,
    install: app => {
      app.config.globalProperties.$apis = proxy;
    },
  };
}


function resolveCONF(modules) {
  for (let key in modules) {
    if (modules[key].CONF) {
      const conf = modules[key].CONF.default;
      delete modules[key].CONF;
      injectCONF(modules[key], conf);
    }
  }
}

function injectCONF(module, conf) {
  const keys = Object.keys(module);
  for (let i = 0; i < keys.length; i++) {
    const tmp = module[keys[i]];
    if (isTypeModule(tmp)) {
      tmp._conf = conf;
    } else {
      injectCONF(tmp, conf);
    }
  }
}

