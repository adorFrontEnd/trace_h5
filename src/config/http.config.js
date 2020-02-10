let domain = '';
let openApiDomain = '';

/**h5 trace Api ************************************************/
//俊宝
// domain = "http://192.168.20.54:9300";
// 正式
// domain = "https://gw.adorsmart.com/trace";
// 测试服务
domain = 'https://s.adorsmart.com/tta';

/**openApi *****************************************************/
// 博文
openApiDomain = "https://gw.adorsmart.com/traceUserAdmin";
// openApiDomain = 'http://sys.trace.adorsmart.com:7200';


// domain='http://sys.trace.adorsmart.com:9300'
let openApiUrlPrefix = openApiDomain + "/";
let apiUrlPrefix = domain + "/";
let picUrlPrefix = "";
let signKey = "94a7cbbf8511a288d22d4cf8705d61d0";
let commonSign = '561wd03kkr86615s1de3x45s1d';
let qrcodeSign = '00461do1156916w1141c56r2ggw2';
export {
  apiUrlPrefix,
  picUrlPrefix,
  domain,
  signKey,
  commonSign,
  qrcodeSign,
  openApiDomain,
  openApiUrlPrefix
}