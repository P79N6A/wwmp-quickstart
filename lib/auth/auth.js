/**
 * @author chauvetxiao
 * @date 2019-01-21
 *
 * 企业微信身份鉴权中间件
 * 请求时序： 鉴权 -> 前置请求封装 -> 请求 -> 后置相应的统一处理 -> 回调业务逻辑
 *
 * 两种特殊情况：
 * 1、连续并发多次请求都没有身份态的时候排队处理
 * 2、并发出现过期的情况
 */

const wxRequest = require('../request/request');
const conn      = require('../conn/conn');
const config    = require('../../config/app.config');
const session   = require('../session/session');
const errcode   = require('../../config/error.config');
const storage   = require('../storage/storage');
const notify    = require('../notify/notify');
const appType   = config.request.appType;

import { event } from '../../config/constant.config';

// 和企业微信相关的基础处理方法
const wxLogin = function () {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: resolve,
            fail: reject,
        });
    });
};

const checkLogin = function () {
    return new Promise(function (resolve, reject) {
        var tmpSession = session.getSession();

        if (tmpSession.skey && !session.checkSessionExpire(tmpSession)) {
            resolve();
        } else {
            reject();
        }
    });
};

// 登录接口读取以下参数写入缓存
const getSessionParams = function (res) {
    return {
        gid: res.gid,
        skey: res.skey,
        vid: res.vid,
        corp_name: res.corp_name,
        type: appType,
        updateTime: parseInt((+new Date()) / 1000)
    };
};

// 参数附加在所有需要auth的接口参数中，同时需要注意这部分参数需要作为协议保留字
const getGlobalSession = function () {
    let tmpSession = session.getSession();

    return {
        vid: tmpSession.vid,
        skey: tmpSession.skey,
        type: tmpSession.type
    };
};

const doLogin = function () {
    return new Promise((resolve, reject) => {
        wxLogin().then((codeInfo) => {
            wxRequest.post(config.request.api_prefix + config.request.login_url, {
                type: appType,
                code: codeInfo.code
            }, {
                authrize: false
            }).then((res) => {
                let tmpData = res.data.data || {};

                conn.log('data:%o', tmpData);

                if ('skey' in tmpData) {
                    session.setSession(getSessionParams(tmpData));
                    resolve(tmpData);
                } else {
                    reject();
                }
            }).catch((res) => {
                reject();
            });
        }).catch(() => {
            reject();
        });
    });
};


// 中间件的成员方法
let authrize = function () {
    return new Promise(function (resolve, reject) {
        checkLogin().then(() => {
            resolve();
        }).catch((error) => {
            doLogin().then(() => {
                resolve();
            }).catch((error) => {
                reject();
            });
        });
    });
};

let authrizeFail = function () {
    conn.error('登录接口异常');
    notify.postNotify(event.LOGIN_FAIL);
};

// 请求开始前，增加响应的header，以及身份参数等
let requestBefore = function (config) {
    let freego = storage.getStorage('freego', false) || {};
    let headerSession = getGlobalSession();

    config.headers = {
        'freego': freego.cookie || '',
        'Content-Type': config.method == 'POST' ? 'application/x-www-form-urlencoded' : 'application/json',
    };

    for (let key in headerSession) {
        config.headers[key] = headerSession[key];
    }

    config.url = /^http/g.test(config.url) ? config.url : config.request.api_prefix + config.url;

    return config;
};

let requestBeforeFail = function () {
    conn.error('请求数据预处理异常');
};

/**
 * 对一些全局性的错误码进行处理
 * @return
 * true: 进入业务逻辑的reject  false: 正常resolve
 */
let responseAfter = function (res, req) {
    let result = res.data.result;
    let data = res.data.data;

    if (!result && !data) {
        return true;
    }

    if (result && result.errCode == errcode.login.EXPIRE) {
        doLogin().then((res) => {
            conn.log('静默续期成功');
        }).catch((errpr) => {
            conn.log('静默续期失败');
        });

        notify.postNotify(event.SESSION_EXPIRE, req);
        return true;
    }

    return false;
};

module.exports = {
    authrize,
    authrizeFail,
    requestBefore,
    requestBeforeFail,
    responseAfter
};
