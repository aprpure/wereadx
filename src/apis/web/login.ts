import {get, postJSON} from "../../utils/request.ts";
import {checkErrCode} from "../err-code.ts";

/**
 * 获取uid
 */
export async function web_login_getuid() {
  const resp = await postJSON("https://weread.qq.com/web/login/getuid");
  return resp.json();
}

/**
 * 生成登录链接
 * @param uid
 */
export function web_confirm(uid: string) {
  return `https://weread.qq.com/web/confirm?pf=2&uid=${uid}`;
}

/**
 * 查询用户扫码信息
 * @param uid
 */
export async function web_login_getinfo(uid: string) {
  const resp = await postJSON("https://weread.qq.com/web/login/getinfo", {
    uid,
  });
  return resp.json();
}

/**
 * 使用扫码信息进行登录
 * @param info
 */
export async function web_login_weblogin(info: Record<string, any> = {}) {
  delete info.redirect_uri;
  delete info.expireMode;
  delete info.pf;

  info.fp = "";
  const resp = await postJSON("https://weread.qq.com/web/login/weblogin", info);
  return resp.json();
}

/**
 * 初始化会话
 * @param info
 */
export async function web_login_session_init(info: Record<string, any> = {}) {
  const params = {
    vid: info.vid,
    pf: 0,
    skey: info.accessToken,
    rt: info.refreshToken,
  };
  const resp = await postJSON(
    "https://weread.qq.com/web/login/session/init",
    params,
  );
  return resp.json();
}

/**
 * 刷新skey
 * @param url 原请求路径
 * @param cookie
 */
export async function web_login_renewal(url: string = "/web/book/read", cookie = "") {  
  const resp = await postJSON("https://weread.qq.com/web/login/renewal", {  
    rq: encodeURIComponent(url),  
  }, {  
    cookie,  
  });  
  
  await checkErrCode(resp, cookie)  
  
  const data = await resp.json();  
  if (data.succ === 1) {  
    // 参考Python脚本，直接从Set-Cookie字符串解析  
    const setCookieHeader = resp.headers.get('Set-Cookie') || '';  
    const result: Record<string, string> = {};  
      
    // 提取wr_skey并只取前8位  
    const skeyMatch = setCookieHeader.match(/wr_skey=([^;]+)/);  
    if (skeyMatch) {  
      result.accessToken = skeyMatch[1].substring(0, 8);  
    }  
      
    // 提取其他cookie值  
    const vidMatch = setCookieHeader.match(/wr_vid=([^;]+)/);  
    if (vidMatch) {  
      result.vid = vidMatch[1];  
    }  
      
    const rtMatch = setCookieHeader.match(/wr_rt=([^;]+)/);  
    if (rtMatch) {  
      result.refreshToken = rtMatch[1];  
    }  
      
    return result;  
  } else {  
    // 错误处理保持不变  
    if (data.errCode !== -12013) {  
      console.warn('/web/login/renewal接口失败', data, cookie)  
    }  
    throw Error(data.errMsg);  
  }  
}

/**
 * 通知后台前端已登录
 */
export async function web_login_notify(cookie = "") {
  const resp = await get("https://weread.qq.com/web/login/notify", {}, {cookie})
  await checkErrCode(resp, cookie)
  return resp.json()
}
