
let request  = require('./lib/request/request');
let auth     = require('./lib/auth/auth');
let notify   = require('./lib/notify/notify');

import { event } from './config/constant.config';

App({
    onLaunch: function () {
        // 身份鉴权的中间件模块
        request.use(auth);

        // 全局的登录异常处理
        notify.add(event.LOGIN_FAIL, () => {
            wx.showModal({
                title: '提示',
                content: '登录失败',
                showCancel: false
            });
        }, this);

        // 全局的身份过期处理
        notify.add(event.SESSION_EXPIRE, (req) => {
            wx.showModal({
                title: '提示',
                content: '身份已过期',
                showCancel: false
            });
        }, this);
    },
    onShow: function (options) {},
    onHide: function () {

    },
    onError: function (msg) {
        console.log(msg);
    },
    globalData: {},
});