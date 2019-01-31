let config  = require('../../config/app.config');
let request = require('../request/request');
let session = require('../session/session');
let conn    = require('../conn/conn');

/**
 * @param {统计对象} 统计参数对象
 */
function logStat(params) {
    var tmpSession = session.getSession();

    var params = {
        key: config.stat.key,
        itemname: params.itemname,
        vid: tmpSession.vid || 0,
        gid: tmpSession.gid || 0,
        corpid: tmpSession.corpid || 0,
        strid: tmpSession.openid || ''
    };

    request.get(config.stat.url, params, {
        authrize: false
    }).then((res) => {
        conn.log('stat success');
    }).catch((error) => {
        conn.log('stat error');
    });
}

export {
    logStat
};