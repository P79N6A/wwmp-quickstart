/**
 * 请求基础类
 * @author chauvetxiao
 * @date 2019-01-20
 *
 * <p>
 * 1、由于axios没有小程序的版本，如果改成适配版本逻辑较重，处理一个轻量的版本来封装
 *
 * 基本约定：
 * 1、鉴权串行
 * 2、请求并行
 * </p>
 */

let requestFactory = (function() {
    let reqParams = {
        url: '',
        method: 'GET',
        data: {},
        params: {},
        headers: {},
        authrize: true,
        dataType: 'json',
        interRequest: [],
        interRequestError: [],
        interResponse: [],
        interHandleAuth: null,
        interHandleAuthFail: null
    };

    let methodGroup1 = ['delete', 'head', 'options'];
    let methodGroup2 = ['put', 'post'];
    let isAuthrizing = false;
    let waitQueue = [];

    let request = function (url, config = {}) {
        let data = {};

        if (typeof url == 'string') {
            url = url.trim();
            config.params = config.params || {};
            Object.assign(data, config.params);
            Object.assign(reqParams, config, { url: url });
        } else if (typeof url == 'object') {
            url.params = url.params || {};
            Object.assign(data, url.params);
            Object.assign(reqParams, url);
        } else {
            throw new Error('参数无效');
        }

        // 请求前置的身份验证逻辑
        if (reqParams.authrize && reqParams.interHandleAuth) {
            // 鉴权串行原则，防止同时并发多个请求时造成多次重复授权登录
            if (isAuthrizing) {
                return new Promise((resolve, reject) => {
                    waitQueue.push([resolve, reject, JSON.parse(JSON.stringify(data))]);
                });
            } else {
                isAuthrizing = true;
                return reqParams.interHandleAuth().then((res) => {
                    isAuthrizing = false;

                    setTimeout(() => {
                        while (waitQueue.length > 0) {
                            let queue = waitQueue.shift();   // 将排队的promise队列取出依次执行

                            if (queue) {
                                sync(queue[2]).then((tmpRes) => {
                                    queue[1](tmpRes);
                                }).catch((tmpError) => {
                                    queue[2](tmpError);
                                });
                            }
                        }
                    }, 0);  // 延后到第一个请求到后面再触发

                    return sync(data);
                }).catch((error) => {
                    waitQueue = [];
                    isAuthrizing = false;
                    reqParams.interHandleAuthFail && reqParams.interHandleAuthFail(error);
                    return Promise.reject('authrize errror');
                });
            }
        } else {
            return sync(data);
        }
    };

    let sync = function (data) {
        // 请求前置中间件处理逻辑
        try {
            reqParams.interRequest.forEach((fn) => {
                let preHanderConfig = fn(reqParams);

                Object.assign(data, (preHanderConfig.method == 'GET' ?
                    preHanderConfig.params : preHanderConfig.data));
            });
        } catch (error) {
            reqParams.interRequestError.forEach((fn) => {
                fn && fn(error);
            });
        }

        return new Promise(function (resolve, reject) {
            let tempReq = {};
            Object.assign(tempReq, reqParams, {
                header: reqParams.headers
            });
            Object.assign(reqParams, {
                method: 'GET',
                data: {},
                url: '',
                header: {},
                headers: {},
                dataType: 'json',
                authrize: true
            });
            wx.request(Object.assign({}, tempReq, {
                data: data,
                success: function (res) {
                    // 请求后置的响应处理逻辑
                    let ignore = false;

                    reqParams.interResponse.forEach((fn) => {
                        fn && (ignore = fn(res, tempReq));
                    });

                    !ignore ? resolve(res, tempReq) : reject(res);
                },
                fail: function (err) {
                    reject(err);
                },
                complete: function () {
                    tempReq = null;
                }
            }));
        });
    };

    request.get = function (url, params, config = {}) {
        Object.assign(reqParams, {
            url: url,
            method: 'GET',
            params: params
        }, config);
        return request(reqParams);
    };

    methodGroup1.forEach((item) => {
        request[item] = function (url, config = {}) {
            Object.assign(reqParams, {
                url: url,
                method: item.toUpperCase()
            }, config);
            return request(reqParams);
        };
    });

    methodGroup2.forEach((item) => {
        request[item] = function (url, data, config = {}) {
            Object.assign(reqParams, {
                url: url,
                params: data,
                method: item.toUpperCase(),
            }, config);

            return request(reqParams);
        };
    });

    request.interceptors = {
        authrize: {
            use: function(handleAuth, handleAuthFail) {
                reqParams.interHandleAuth = handleAuth;
                reqParams.interHandleAuthFail = handleAuthFail;
            }
        },
        request: {
            use: function (handleRequest, handleError) {
                reqParams.interRequest.push(handleRequest);
                reqParams.interRequestError.push(handleError);
            }
        },
        response: {
            use: function (handle) {
                reqParams.interResponse.push(handle);
            }
        }
    };

    request.use = function (middleware) {
        request.interceptors.authrize.use(middleware.authrize, middleware.authrizeFail);
        request.interceptors.request.use(middleware.requestBefore, middleware.requestBeforeFail);
        request.interceptors.response.use(middleware.responseAfter);
    };

    return request;
})();

module.exports = requestFactory;