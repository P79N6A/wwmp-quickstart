/**
 * @author chauvetxiao
 * @date 2019-01-21
 *
 * 企业微信的身份session接口
 */

const storage = require('../storage/storage');
const conn    = require('../conn/conn');
const config  = require('../../config/app.config');

const setSession = function (session) {
    storage.setStorage('session', session, false);
};

const getSession = function () {
    return storage.getStorage('session', false) || {};
};

const checkSessionExpire = function (session) {
    let now = parseInt((+new Date()) / 1000);
    let tmpSession = getSession();

    if (tmpSession.updateTime && now - tmpSession.updateTime < config.session.expire) {
        return false;
    }

    conn.log('session expired');
    return true;
};

export {
    setSession,
    getSession,
    checkSessionExpire
};