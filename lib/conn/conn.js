/**
 * 控制台统一输出的脚本
 * @class conn
 * @module global
 * @author chauvetxiao
 * @date  2018-02-28
 */

export let conn = {};

// 默认开启，关闭请调用enableConsole方法进行关闭
let showConsole = true;
let methods = ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'];

/**
 * 获取当前日志时间戳
 * @return {String} 时间戳字符串
 */
let _getTimeStamp = function () {
    return '[' + date2Str(new Date(), '%Y-%M-%d %h:%m:%s', true) + ']';
};

let date2Str = function(date, p, isFill) {
    let Y = date.getFullYear(),
        M = date.getMonth() + 1,
        d = date.getDate(),
        h = date.getHours(),
        m = date.getMinutes(),
        s = date.getSeconds();

    if (isFill) {
        M = (M < 10) ? ('0' + M) : M;
        d = (d < 10) ? ('0' + d) : d;
        h = (h < 10) ? ('0' + h) : h;
        m = (m < 10) ? ('0' + m) : m;
        s = (s < 10) ? ('0' + s) : s;
    }
    p = p || '%Y-%M-%d %h:%m:%s';
    p = p.replace(/%Y/g, Y).replace(/%M/g, M).replace(/%d/g, d).replace(/%h/g, h).replace(/%m/g, m).replace(/%s/g, s);
    return p;
};

methods.forEach(function (method) {
    conn[method] = function () {
        let args = '';
        if (showConsole) {
            args = arguments;

            if (args.length > 0) {
                args[0] = _getTimeStamp() + JSON.stringify(args[0]);
            }

            console[method].apply(console, args);
        }
    };
}, Function.prototype.bind);

// 关闭或者开启控制台
conn.enableConsole = function (isEnable) {
    showConsole = !!isEnable;
};

module.exports = conn;