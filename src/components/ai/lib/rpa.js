import userEvent from '@testing-library/user-event';

/**
 * RPA 类 - 用于在 React 应用中进行自动化操作
 */
class Rpa {
    constructor() {
        this.user = userEvent.setup({delay: 100});
        this.fast_user = userEvent.setup(); // 默认无延迟

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
        overlay.style.zIndex = '999';
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

    async center(svgCanvas, x, y) {
        this.block();
        //用 div 来计算bbox
        const svgContainer = document.querySelector('.injectionDiv');

        // 获取画布的中心点
        const canvasRect = svgContainer.getBoundingClientRect();
        const canvasCenterX = canvasRect.x + (canvasRect.width - 300) / 2 + 300;
        const canvasCenterY = canvasRect.y + canvasRect.height / 2;

        // 计算需要平移的距离
        const deltaX = canvasCenterX - x;
        const deltaY = canvasCenterY - y;

        console.log(`移动距离: X = ${deltaX}, Y = ${deltaY}`);

        // 使用多个小增量来模拟平滑滚动
        const STEPS = 2;
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

    moveTo = async (element) => {

    }


    /**
     * 点击指定元素
     * @param {string|Element} selector - 要点击的元素或选择器
     * @returns {Promise<boolean>} - 操作是否成功
     */
    async click(element, button = 0) {
        try {
            this.block();

            let key = 'MouseLeft'
            if (button === 2) {
                key = 'MouseRight'
            }

            const rect = element.getBoundingClientRect();
            await this.user.pointer([
                { target: document.body, coords: { clientX: rect.left + 10, clientY: rect.top+10 } }
            ]);
            await this.user.pointer([
                // touch the screen at element1
                {keys: `[${key}]`, target: element},
            ])

            //await this.user.click(element, {button: button});
            console.log('点击成功');

            this.unblock(); // 操作完成后解除阻止
            return true;
        } catch (error) {
            console.error('点击操作失败:', error);
            this.unblock(); // 发生错误时也要解除阻止
            return false;
        }
    }

    async smoothDrag(element, startX, startY, endX, endY, steps = 50, delay = 10) {
        for (let i = 1; i <= steps; i++) {
            const stepX = startX + ((endX - startX) * i / steps);
            const stepY = startY + ((endY - startY) * i / steps);
            await this.fast_user.pointer({
                target: element,
                coords: {clientX: stepX, clientY: stepY},
            });

            // 添加小延迟使拖动更自然
            await new Promise(r => setTimeout(r, delay));
        }
    }
    getElementCoords = (element, relativeToPage = true) => {
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
    async drag(element, targetX, targetY) {
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
            await this.fast_user.pointer({
                target: element,
                keys: '[MouseLeft>]',
                coords: {clientX: startX, clientY: startY}
            });

            const rectWorkspace = this.getElementCoords(document.querySelector(".injectionDiv"));
            const rectToolBox = this.getElementCoords(document.querySelector(".blocklyFlyout"));
            // 第一步：先拖动一点
            await this.smoothDrag(element, startX, startY, rectWorkspace[0] + rectToolBox[2] + 50, startY, 2);
            await this.smoothDrag(element, rectWorkspace[0] + rectToolBox[2] + 50, startY, rectWorkspace[0] + rectToolBox[2] + 50, endY, 5);
            await this.smoothDrag(element, rectWorkspace[0] + rectToolBox[2] + 50, endY, endX, endY, 5);

            // 鼠标释放
            await this.fast_user.pointer('[/MouseLeft]');

            console.log(`拖动完成: 到达目标位置 (${endX}, ${endY})`);

            this.unblock(); // 操作完成后解除阻止
            return true;
        } catch (error) {
            console.error('拖动操作失败:', error);
            this.unblock(); // 发生错误时也要解除阻止
            window.opcodeToId = {}
            return false;
        }
    }

    type = async (element, text) => {
        try {
            this.block();

            // 1. 检查元素状态
            if (!element || element.disabled || element.readOnly) {
                throw new Error('元素不可输入');
            }

            // 2. 确保元素可见
            element.scrollIntoView({behavior: 'smooth', block: 'center'});
            await new Promise(resolve => setTimeout(resolve, 100));

            // 3. 点击并确保焦点
            await this.user.click(element);
            if (document.activeElement !== element) {
                element.focus();
            }

            // 4. 等待焦点稳定
            await new Promise(resolve => setTimeout(resolve, 100));

            // 5. 清空现有内容并输入
            await this.user.clear(element);
            await this.user.type(element, text);
            element.value = text;
            await this.user.keyboard('{Escape}');

            // 6. 验证输入结果
            if (element.value !== text) {
                console.warn(`输入值不匹配: 期望"${text}", 实际"${element.value}"`);
            }

            console.log(`文本输入成功: "${text}"`);
            this.unblock();
            return true;
        } catch (error) {
            console.error('文本输入失败:', error, {
                elementType: element?.tagName,
                elementDisabled: element?.disabled,
                elementReadOnly: element?.readOnly,
                elementValue: element?.value
            });
            this.unblock();
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

    async selectCategory(name) {
        const el = document.querySelector(`[class*="${name}"]`);
        if (!el) {
            throw new Error(`Category "${name}" not found`);
        }
        //await this.click(el);
        //await this.wait(500);
    }

    highlightCategory(name) {
        const el = document.querySelector(`[class*="${name}"]`);
        this.highlightElement(el);
    }

    highlightElement(element) {
        if (!(element instanceof Element)) return;

        // 移除旧的高亮遮罩（如果存在）
        const oldMask = document.getElementById('__highlight-mask');
        if (oldMask) oldMask.remove();

        const rect = element.getBoundingClientRect();
        const padding = 3;

        const mask = document.createElement('div');
        mask.id = '__highlight-mask';
        mask.style.position = 'fixed';
        mask.style.top = `${rect.top + window.scrollY - padding}px`;
        mask.style.left = `${rect.left + window.scrollX - padding}px`;
        mask.style.width = `${rect.width + padding * 2}px`;
        mask.style.height = `${rect.height + padding * 2}px`;
        mask.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        mask.style.border = '4px solid rgba(255, 0, 0, 0.5)';
        mask.style.pointerEvents = 'none';
        mask.style.zIndex = '9999';
        mask.style.boxSizing = 'border-box';
        mask.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
        mask.style.transition = 'opacity 0.3s ease';
        mask.style.opacity = '0';

        document.body.appendChild(mask);

        // 淡入出现
        requestAnimationFrame(() => {
            mask.style.opacity = '1';
        });

        // 实现闪烁效果：渐隐、渐现，重复几次
        let flashes = 3;
        let visible = true;
        let count = 0;

        const interval = setInterval(() => {
            visible = !visible;
            mask.style.opacity = visible ? '1' : '0.2';
            count++;

            if (count >= flashes * 2) {
                clearInterval(interval);

                // 最后淡出并移除遮罩
                mask.style.opacity = '0';
                setTimeout(() => {
                    mask.remove();
                }, 300);
            }
        }, 300);
    }

}

// 创建并导出单例实例
const rpa = new Rpa();
export default rpa;
