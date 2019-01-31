let conn = require('../conn/conn');
let __notices = [];

/**
 * addNotification
 * 注册通知对象方法
 *
 * 参数:
 * name： 注册名，一般let在公共类中
 * selector： 对应的通知方法，接受到通知后进行的动作
 * observer: 注册对象，指Page对象
 */
function add(name, selector, observer) {
    if (name && selector) {
        if (!observer) {
            conn.log("addNotification Warning: no observer will can't remove notice");
        }
        let newNotice = {
            name: name,
            selector: selector,
            observer: observer
        };

        addNotices(newNotice);
    }
}

/**
 * 仅添加一次监听
 *
 * 参数:
 * name： 注册名，一般在公共类中
 * selector： 对应的通知方法，接受到通知后进行的动作
 * observer: 注册对象，指Page对象
 */
function addOnce(name, selector, observer) {
    if (__notices.length > 0) {
        for (let i = 0; i < __notices.length; i++) {
            let notice = __notices[i];
            if (notice.name === name) {
                if (notice.observer === observer) {
                    return;
                }
            }
        }
    }
    this.add(name, selector, observer);
}

function addNotices(newNotice) {
    __notices.push(newNotice);
}

/**
 * removeNotification
 * 移除通知方法
 *
 * 参数:
 * name: 已经注册了的通知
 * observer: 移除的通知所在的Page对象
 */

function remove(name, observer) {
    for (let i = 0; i < __notices.length; i++) {
        let notice = __notices[i];
        if (notice.name === name) {
            if (notice.observer === observer) {
                __notices.splice(i, 1);
                return;
            }
        }
    }
}

/**
 * postNotify
 * 发送通知方法
 *
 * 参数:
 * name: 已经注册了的通知
 * info: 携带的参数
 */

function postNotify(name, info) {
    if (__notices.length == 0) {
        return;
    }

    for (let i = 0; i < __notices.length; i++) {
        let notice = __notices[i];
        if (notice.name === name) {
            notice.selector(info);
        }
    }
}

module.exports = {
    add,
    addOnce,
    remove,
    postNotify
};
