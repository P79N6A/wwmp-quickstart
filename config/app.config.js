/**
 * @author chauvetxiao
 *
 * 应用配置项
 * <p>
 * 请勿将和业务相关的配置项放在此配置文件中
 * </p>
 */

module.exports = {
    request: {
        api_prefix: 'https://work.weixin.qq.com/wework_admin/', // 请求的前缀
        login_url: 'xcx/login',
        app_type: 4 // 登录获取登陆态的应用类型，每个类型一个枚举值
    },
    stat: {
        url: 'xcx/stat',
        key: 79503251
    },
    session: {
        expire: 1.5 * 60 * 60  // 过期时间
    }
};