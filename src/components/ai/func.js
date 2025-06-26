/**
 * 获取元素的位置和尺寸信息
 * @param {Element|string} element - DOM元素或元素ID
 * @param {boolean} [relativeToPage=true] - 是否相对于整个页面（包括滚动部分）
 * @returns {Array} - 返回 [x, y, width, height] 数组
 */
export function getElementCoords(element, relativeToPage = true) {
    // 如果传入的是字符串ID，获取对应的DOM元素
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }

    // 如果找不到元素，返回 [0, 0, 0, 0]
    if (!element) {
        console.warn('Element not found');
        return [0, 0, 0, 0];
    }

    const rect = element.getBoundingClientRect();

    let x, y;

    if (relativeToPage) {
        // 相对于整个页面（包括滚动部分）的坐标
        x = rect.left + window.scrollX;
        y = rect.top + window.scrollY;
    } else {
        // 相对于视口的坐标
        x = rect.left;
        y = rect.top;
    }

    const width = rect.width;
    const height = rect.height;

    return [x, y, width, height];
}
