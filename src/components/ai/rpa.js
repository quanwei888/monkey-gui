import userEvent from '@testing-library/user-event';

/**
 * RPA 类 - 用于在 React 应用中进行自动化操作
 */
class Rpa {
    constructor() {
        this.user = userEvent.setup();
        this._unblockFn = null;
    }

    // 改进版：只阻止真实用户事件，允许程序模拟事件
    block() {
        // 判断是否已经启动 block
        if (this._unblockFn !== null) {
            console.warn('已经处于阻止状态，无需重复调用 block()');
            return this._unblockFn;
        }

        const startTime = performance.now();
        console.time('block-execution');

        // 创建覆盖层
        const overlay = document.createElement('div');
        overlay.id = 'test-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.01)';
        overlay.style.zIndex = '99999';
        overlay.style.cursor = 'not-allowed';
        document.body.appendChild(overlay);

        // 标记是否为真实用户事件
        const isRealUserEvent = function (event) {
            // 真实用户事件通常有 isTrusted = true
            return event.isTrusted === true;
        };

        // 只阻止真实用户事件
        const handleEvent = function (event) {
            if (isRealUserEvent(event)) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
            // 允许程序触发的事件（如userEvent）通过
            return true;
        };

        // 添加事件监听器，仅拦截真实用户事件
        const events = ['mousedown', 'mouseup', 'click', 'dblclick',
            'mousemove', 'mouseover', 'mouseout',
            'mouseenter', 'mouseleave', 'contextmenu'];

        events.forEach(eventType => {
            document.addEventListener(eventType, handleEvent, true);
            // 覆盖层也需要单独处理
            overlay.addEventListener(eventType, function (e) {
                if (isRealUserEvent(e)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);
        });

        // 存储清理函数
        this._unblockFn = function unblockUserInteraction() {
            // 移除覆盖层
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }

            // 移除事件监听器
            events.forEach(eventType => {
                document.removeEventListener(eventType, handleEvent, true);
            });
        };

        const endTime = performance.now();
        console.timeEnd('block-execution');
        console.log(`原始版本执行时间: ${(endTime - startTime).toFixed(3)}ms`);

        return this._unblockFn;
    }

    unblock() {
        if (this._unblockFn) {
            this._unblockFn();
            this._unblockFn = null;
        }
    }

    async centerBlock(element) {
        // 获取元素的当前位置
        const elementRect = element.getBoundingClientRect();
        const elementCenterX = elementRect.x + elementRect.width / 2;
        const elementCenterY = elementRect.y + elementRect.height / 2;
        return this.center(elementCenterX, elementCenterY)
    }

    async center(x, y) {
        this.block();
        // 创建用户事件实例
        const svgCanvas = document.querySelector('.blocklyWorkspace');
        //用 div 来计算bbox
        const svgContainer = document.querySelector('.injectionDiv');
        const user = userEvent.setup();

        // 获取画布的中心点
        const canvasRect = svgContainer.getBoundingClientRect();
        const canvasCenterX = canvasRect.x + (canvasRect.width - 300) / 2 + 300;
        const canvasCenterY = canvasRect.y + canvasRect.height / 2;

        // 计算需要平移的距离
        const deltaX = canvasCenterX - x;
        const deltaY = canvasCenterY - y;

        console.log(`移动距离: X = ${deltaX}, Y = ${deltaY}`);

        // 使用多个小增量来模拟平滑滚动
        const STEPS = 10;
        var stepX = deltaX / STEPS;
        var stepY = deltaY / STEPS;

        if (y == -1) {
            stepY = 0;
        }
        if (x == -1) {
            stepX = 0;
        }

        for (let i = 0; i < STEPS; i++) {
            // 组合水平和垂直滚动为一个事件
            // 这样可以更自然地模拟用户同时在两个方向上的滚动
            const wheelEvent = new WheelEvent('wheel', {
                deltaX: -stepX, // 注意符号：负值向左移动内容，正值向右移动内容
                deltaY: -stepY, // 注意符号：负值向上移动内容，正值向下移动内容
                deltaMode: 0,   // 0表示像素单位
            });

            svgCanvas.dispatchEvent(wheelEvent);

            // 短暂等待使滚动更自然
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // 等待所有滚动完成
        await new Promise(resolve => setTimeout(resolve, 100));
        this.unblock();
    }

    /**
     * 通过 data-id 查找元素
     * @param {string} dataId - 元素的 data-id 属性值
     * @returns {Element|null} - 找到的元素或 null
     */
    findElementByDataId(dataId) {
        const element = document.querySelector(`[data-id="${dataId}"]`);
        if (!element) {
            console.log(`未找到 data-id 为 "${dataId}" 的元素`);
            return null;
        }

        // 查找元素内的第一个 path
        const path = element.querySelector('path');
        if (!path) {
            console.log(`在 data-id 为 "${dataId}" 的元素中未找到 path`);
            return null;
        }

        return path;
    }


    /**
     * 点击指定元素
     * @param {string|Element} selector - 要点击的元素或选择器
     * @returns {Promise<boolean>} - 操作是否成功
     */
    async click(element) {
        try {
            this.block();

            await this.user.click(element);
            console.log('点击成功');

            this.unblock(); // 操作完成后解除阻止
            return true;
        } catch (error) {
            console.error('点击操作失败:', error);
            this.unblock(); // 发生错误时也要解除阻止
            return false;
        }
    }

    /**
     * 模拟多步拖动以使动作更自然
     * @param {number} startX - 起始X坐标
     * @param {number} startY - 起始Y坐标
     * @param {number} endX - 结束X坐标
     * @param {number} endY - 结束Y坐标
     * @param {Object} user - 用户对象，包含pointer方法
     * @param {number} steps - 拖动步数，默认为50
     * @param {number} delay - 每步延迟时间(毫秒)，默认为10
     * @returns {Promise<void>}
     */
    async smoothDrag(startX, startY, endX, endY, steps = 50, delay = 10) {
        for (let i = 1; i <= steps; i++) {
            const stepX = startX + ((endX - startX) * i / steps);
            const stepY = startY + ((endY - startY) * i / steps);

            await this.user.pointer({
                target: document.body,
                coords: {clientX: stepX, clientY: stepY}
            });

            // 添加小延迟使拖动更自然
            await new Promise(r => setTimeout(r, delay));
        }
    }

    /**
     * 将元素拖动到指定坐标
     * @param {string|Element} element - 要拖动的元素
     * @param {number} targetX - 目标 X 坐标
     * @param {number} targetY - 目标 Y 坐标
     * @returns {Promise<boolean>} - 操作是否成功
     */
    async drag(element, targetX, targetY, newId = null) {
        try {
            this.block();

            // 获取元素位置
            const rect = element.getBoundingClientRect();

            // 计算起始坐标（元素中心点）
            const startX = rect.left + 10;
            const startY = rect.top + 10;

            // 使用传入的目标坐标
            const endX = targetX;
            const endY = targetY;

            console.log(`开始拖动: 从 (${startX}, ${startY}) 到 (${endX}, ${endY})`);

            // 执行拖动 - 鼠标按下
            await this.user.pointer({
                target: element,
                keys: '[MouseLeft>]',
                coords: {clientX: startX, clientY: startY}
            });

            // 第一步：先拖动一点
            await this.smoothDrag(startX, startY, startX + 30, startY - 30, 5);

            //修改 data-id
            var oldId = null;
            if (newId != null) {
                const domDragging = document.querySelector(".blocklyDragging");
                oldId = domDragging.getAttribute("data-id");
                //domDragging.setAttribute("data-id", newId);
            }

            await this.smoothDrag(startX + 30, startY - 30, 300, startY - 30, 5);
            await this.smoothDrag(300, startY - 30, 300, endY, 10);
            await this.smoothDrag(300, endY, endX, endY, 10);

            // 鼠标释放
            await this.user.pointer('[/MouseLeft]');

            console.log(`拖动完成: 到达目标位置 (${endX}, ${endY})`);

            this.unblock(); // 操作完成后解除阻止
            return oldId;
        } catch (error) {
            console.error('拖动操作失败:', error);
            this.unblock(); // 发生错误时也要解除阻止
            window.opcodeToId = {}
            return false;
        }
    }

    /**
     * 输入文本到指定元素
     * @param {string|Element} selector - 目标元素或选择器
     * @param {string} text - 要输入的文本
     * @returns {Promise<boolean>} - 操作是否成功
     */
    async type(element, text) {
        try {
            this.block(); // 开始操作前阻止用户交互
            await this.user.click(element);
            await this.user.keyboard(text);
            console.log(`文本输入成功: "${text}"`);

            this.unblock(); // 操作完成后解除阻止
            return true;
        } catch (error) {
            console.error('文本输入失败:', error);
            this.unblock(); // 发生错误时也要解除阻止
            return false;
        }
    }

    /**
     * 等待指定时间
     * @param {number} ms - 等待的毫秒数
     * @returns {Promise<void>}
     */
    async wait(ms) {
        console.log(`等待 ${ms} 毫秒`);
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 创建并导出单例实例
const rpa = new Rpa();
export default rpa;
