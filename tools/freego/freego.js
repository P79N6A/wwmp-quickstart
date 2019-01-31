/**
 * @author chauvetxiao
 * @date 2018-02-27
 *
 * 小程序freego切换工具
 * <p>
 * 如果需要新增环境，请将cookie配置填入env对象，cookie值可以从管理端抓包获取
 * </p>
*/

let app = getApp();
let storage = require('../../lib/storage/storage');

const NOT_SUPPORT_TITLE = '提示';
const NOT_SUPPORT_TEXT = '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。';

Page({
    data: {
        env: [
            {
                text: 'wwmngnjlogic_3(测试机3)',
                cookie: 'free_go_id=910649;free_go_proxy=wwappnjlogic_3',
                isChecked: false
            },
            {
                text: 'wwmngnjlogic_dev(开发机)',
                cookie: 'free_go_id=910649;free_go_proxy=wwappnjlogic_dev'
            },
            {
                text: 'online(现网)',
                cookie: '',
                isChecked: false
            }
        ],
        debug: false
    },
    onLoad: function() {
        let currentEnv = storage.getStorage('freego');
        let configEnv = this.data.env;

        if (currentEnv) {
            configEnv.forEach(function(v, k) {
                if (v.text == currentEnv.text) {
                    v.isChecked = true;
                }
            });

            this.setData({
                env: configEnv
            });
        }

        let currentDebug = storage.getStorage('debug');
        this.setData({
            debug: currentDebug
        });
    },
    onBindChangeEnv: function (e) {
        let selectEnv = e.currentTarget.dataset.text;
        let configEnv = this.data.env;
        let envItem;
        let selectItem;

        configEnv.forEach(function(v, k) {
            if (v.text == selectEnv) {
                envItem = v;
                v.isChecked = true;
            } else {
                v.isChecked = false;
            }
        });

        if (envItem) {
            selectItem = {
                text: envItem.text,
                cookie: envItem.cookie
            };

            this.setData({
                env: configEnv
            });

            storage.setStorage('freego', selectItem);  // 将freego写入当前命名空间的存储

            wx.navigateBack();
        }
    },
    onCheckboxChange: function (e) {
        var check = !!e.currentTarget.dataset.check;

        this.setData({
            debug: check
        });
        storage.setStorage('debug', check);

        if (wx.setEnableDebug) {
            wx.setEnableDebug({
                enableDebug: check
            });
        } else {
            wx.showModal({
                title: NOT_SUPPORT_TITLE,
                content: NOT_SUPPORT_TEXT
            });
        }

    }
});