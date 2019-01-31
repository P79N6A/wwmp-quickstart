/**
 *
 * @param {当前版本} v1
 * @param {对比版本} v2
 *
 * @return
 * true: 当前版本更大
 * false: 对比版本更大
 */
function compareAppVersion(v1, v2) {
    v1 = v1.split('.');
    v2 = v2.split('.');
    let len = Math.max(v1.length, v2.length);

    while (v1.length < len) {
        v1.push('0');
    }
    while (v2.length < len) {
        v2.push('0');
    }

    for (let i = 0; i < len; i++) {
        let num1 = parseInt(v1[i]);
        let num2 = parseInt(v2[i]);

        if (num1 > num2) {
            return true;
        } else if (num1 < num2) {
            return false;
        }
    }
    return false;
}
export {
    compareAppVersion,
}