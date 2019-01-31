
const weRequest = require('../../lib/request/request');
const auth = require('../../lib/auth/auth');

Page({
    data: {},

    onLoad: function (options) {
        wx.login({
            success: (res) => {
                let code = res.code;
                let url = 'https://app.work.weixin.qq.com/wework_admin/xcx/login1?age=1';
                let url2 = 'https://app.work.weixin.qq.com/wework_admin/xcx/login2';

                // weRequest.post(url, {
                //     type: 4,
                //     code: code
                // }, {
                //     authrize: true
                // }).then((res) => {

                // });

                // weRequest.post(url2, {
                //     name: 'xiao'
                // }).then((res) => {
                //     console.log(11);
                // }).catch((error) => {

                // });

                weRequest.get(url, { name: 'xiao' }, {
                    authrize: true
                }).then((res) => {

                });
            }
        });
    }
});