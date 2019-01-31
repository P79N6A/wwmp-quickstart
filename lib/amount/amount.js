/**
 * 金额操作相关的接口
 * @class amount
 * @module global
 * @author chauvetxiao
 * @date  2017-10-13
 *
 */

/**
 * 将金额从分转换为元
 *
 * @method fen2Yuan
 * @param {String} val 需要进行转换的数额
 * @return {String} 转换后的金额
 */
export let fen2Yuan = function (val) {
    var result,
        re = /^[\+|-]?[0-9]+$/;

    if (typeof (val) !== 'string') {
        val = val.toString();
    }
    return (re.test(val)) ? (parseFloat(val) / 100).toFixed(2) : '0.00';
};

/**
 * 将金额从元转换为分
 *
 * @method yuan2Fen
 * @param {String} val 需要进行转换的数额
 * @return {String} 转换后的金额
 */
export let yuan2Fen = function (val) {
    var result,
        re = /^[\+|-]?\d+(\.\d+)?$/;

    if (typeof (val) !== 'string') {
        val = val.toString();
    }
    return (re.test(val)) ? (parseFloat(val) * 100).toFixed(0) : '0';
};

/**
 * 将金额进行格式化输出
 *
 * @method toCurrency
 * @requires string
 * @param {String} val 需要进行格式化的数额
 * @param {Number} bit 进行格式化的位数
 * @return {String} 格式化后字符串
 * @example
 123212 -> 123,212.00
 */
export let toCurrency = function (val, bit) {
    var str = require('../string/string');

    val = val || '';
    bit = bit || 2;

    var pattern = /^(\-?)(\d+)(\.\d+)?$/,
        macher = pattern.exec(val),
        sign = macher != null ? (RegExp.$1 || '') : '',
        integer = macher != null ? (RegExp.$2 || '0') : '0',
        decimal = macher != null ? (RegExp.$3 || '.00') : '.00',
        size = integer.length,
        mod = size > 3 ? size % 3 : 0,
        tmp = '',
        start = mod == 0 ? '' : integer.substr(0, mod) + ',',
        flag = 0;

    decimal = (decimal == '') ? '.00' : decimal;
    decimal = str.fillAfter(decimal, 0, bit + 1).substr(0, bit + 1);

    for (var i = mod; i < size; i++) {
        tmp += integer.charAt(i);
        flag++;
        if (flag % 3 == 0 && i < size - 1) {
            tmp += ',';
            flag = 0;
        }
    }
    pattern = null;

    return sign + start + tmp + decimal;
};

export default {
    toCurrency,
    fen2Yuan,
    yuan2Fen
}