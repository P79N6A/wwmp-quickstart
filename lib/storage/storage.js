/**
 * @author chauvetxiao
 * @date 2018-02-26
 *
 * 本地存储操作接口
 * <p>
 * 1、支持按命名空间进行存储，以及更加快速方便的数据存储检索
 * 2、当登录成功以后，存储将自动切到vid下面的命名空间下面，所以如果是在登录之前写入的存储，在登录成功以后是不能获取到的
 * </p>
 */
import conn from '../conn/conn';

const STORAGE_KEY = 'WEWORK_STORAGE_CACHE'; // 采用相同的存储键值
const CURRENT_NS_KEY = 'WEWORK_NS_KEY';
const DEFAULT_NAME_SPACE = 'default_ns';

let currentNameSpace = ''; // 当前的存储命名空间
let currentStorageData = {}; // 当前所有的存储数据
let currentNsStorageData = {}; // 当前命名空间的存储数据

/**
 * 根据大KEY读取缓存数据
 */
function initCachedDataByKey() {
    try {
        currentStorageData = wx.getStorageSync(STORAGE_KEY) || {}; // 最外层的大key的存储数据
    } catch (e) {
        currentStorageData = {};
    }
}

/**
 * 根据VID分配存储空间
 */
const initNameSpace = function (namespace = DEFAULT_NAME_SPACE, callback = null) {

    initCachedDataByKey();

    let oldNs = currentNameSpace;
    let oldNsStorageData = currentStorageData[oldNs] || {};

    // currentNameSpace = namespace;
    currentNameSpace = DEFAULT_NAME_SPACE;  // 多命名空间的支持暂时意义不大，反而容易产生问题

    if (currentStorageData[namespace]) {
        currentNsStorageData = currentStorageData[namespace];
    } else {
        currentNsStorageData = currentStorageData[namespace] = {};
        flushCacheData();
    }

    try {
        wx.setStorageSync(CURRENT_NS_KEY, currentNameSpace);
    } catch (e) {}

    callback && callback(oldNs, oldNsStorageData);
};

/**
 * 按KEY值读取指定的存储内容
 * @param {String} key "LEVAL1.LEVAL2.LEVAL3"
 */
const initNsStorageByKey = function (key) {
    let keys = key.split('.');
    let tmpData;

    if (!currentNsStorageData && keys.length > 0) {
        return '';
    }

    tmpData = currentNsStorageData;

    for (let i = 0; i < keys.length - 1; i++) {
        if (typeof (tmpData[keys[i]]) === 'undefined') {
            tmpData[keys[i]] = {};
        }

        tmpData = tmpData[keys[i]];
    }

    return tmpData;
};


/**
 * 按KEY值存储到指定的区域
 * @param {String} key "LEVAL1.LEVAL2.LEVAL3"
 */
const setStorage = function (key, value, use_ns = true, sync = true, flush = true) {
    if (use_ns) {
        let tmpData = initNsStorageByKey(key);
        let keys = key.split('.');

        tmpData[keys[keys.length - 1]] = value;
        if (flush) {
            flushCacheData(sync);
        }
    } else {
        currentStorageData[key] = value;
        flushCacheData(true);
    }
};

/**
 * 按KEY值读取指定的存储内容，获取都是从内存获取，所以不需要指定同步还是异步
 * @param {String} key "LEVAL1.LEVAL2.LEVAL3"
 */
const getStorage = function (key, use_ns = true) {
    if (use_ns) {
        let tmpData = initNsStorageByKey(key);
        let keys = key.split('.');

        return tmpData[keys[keys.length - 1]];
    }

    return currentStorageData[key];

};

// 移除本地存储数据项
const removeStorage = function (key, use_ns = true) {
    if (use_ns) {
        let tmpData = initNsStorageByKey(key);
        let keys = key.split('.');

        delete tmpData[keys[keys.length - 1]];
        flushCacheData();
    } else {
        delete currentNsStorageData[key];
        flushCacheData();
    }
};

/**
 * 清楚本地缓存
 * @param  {String} key  如果为空，则清除整个缓存区，否则清除对应key值的缓存
 */
const clearStorage = function (key) {
    let tmpData,
        keys;

    try {
        if (key) {
            tmpData = initNsStorageByKey(key);
            keys = key.split('.');

            delete tmpData[keys[keys.length - 1]];
            flushCacheData();
        } else {
            wx.clearStorageSync();
            initNameSpace(currentNameSpace);
        }
    } catch (e) {
        conn.log(e);
    }
};

/**
 * 持久化到本地存储区
 */
const flushCacheData = function (sync = true) {
    try {
        if (sync) {
            wx.setStorageSync(STORAGE_KEY, currentStorageData);
        } else {
            wx.setStorage({
                key: STORAGE_KEY,
                data: currentStorageData
            });

            conn.log('storage %o', currentStorageData);
        }
    } catch (e) {
        clearStorage();
    }
};

try {
    currentNameSpace = wx.getStorageSync(CURRENT_NS_KEY) || '';
} catch (e) {
    currentNameSpace = '';
}

initNameSpace(currentNameSpace || DEFAULT_NAME_SPACE);

export {
    initNameSpace,
    setStorage,
    getStorage,
    clearStorage,
    removeStorage,
    flushCacheData
};