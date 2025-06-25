class MouseRPA {
    constructor() {
        // 当前鼠标位置
        this.currentX = 0;
        this.currentY = 0;
        // 默认延迟时间(毫秒)
        this.defaultDelay = 100;
        // 默认移动速度
        this.moveSpeed = 10;
        // 鼠标按钮状态
        this.buttonStates = {
            left: false,
            right: false,
            middle: false
        };
        console.log('MouseRPA 实例已创建');
    }

    /**
     * 创建并分发鼠标事件
     * @param {string} type - 事件类型
     * @param {Object} options - 事件选项
     * @returns {MouseEvent}
     */
    createMouseEvent(type, options = {}) {
        const eventOptions = {
            bubbles: true,
            cancelable: true,
            view: window,
            detail: 1,
            screenX: this.currentX,
            screenY: this.currentY,
            clientX: this.currentX,
            clientY: this.currentY,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
            metaKey: false,
            button: 0,
            buttons: this.getButtonState(),
            relatedTarget: null,
            ...options
        };

        const event = new MouseEvent(type, eventOptions);
        
        // 获取当前鼠标位置下的元素
        const elementAtPoint = document.elementFromPoint(this.currentX, this.currentY);
        if (elementAtPoint) {
            elementAtPoint.dispatchEvent(event);
        } else {
            document.dispatchEvent(event);
        }

        return event;
    }

    /**
     * 获取当前按钮状态
     * @returns {number} 按钮状态值
     */
    getButtonState() {
        let state = 0;
        if (this.buttonStates.left) state |= 1;
        if (this.buttonStates.right) state |= 2;
        if (this.buttonStates.middle) state |= 4;
        return state;
    }

    /**
     * 移动鼠标到指定位置
     * @param {number} x - 目标 X 坐标
     * @param {number} y - 目标 Y 坐标
     * @param {boolean} smooth - 是否平滑移动
     * @returns {Promise<void>}
     */
    async moveTo(x, y, smooth = true) {
        if (smooth) {
            await this.smoothMove(x, y);
        } else {
            this.currentX = x;
            this.currentY = y;
            // 触发mousemove事件
            this.createMouseEvent('mousemove');
            console.log(`鼠标已移动到位置 (${x}, ${y})`);
        }
        return this;
    }

    /**
     * 平滑移动鼠标到指定位置
     * @param {number} targetX - 目标 X 坐标
     * @param {number} targetY - 目标 Y 坐标
     * @returns {Promise<void>}
     */
    async smoothMove(targetX, targetY) {
        const startX = this.currentX;
        const startY = this.currentY;
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(Math.floor(distance / this.moveSpeed), 1);

        console.log(`开始平滑移动鼠标从 (${startX}, ${startY}) 到 (${targetX}, ${targetY})`);

        for (let i = 1; i <= steps; i++) {
            const ratio = i / steps;
            this.currentX = Math.round(startX + dx * ratio);
            this.currentY = Math.round(startY + dy * ratio);
            
            // 触发mousemove事件
            this.createMouseEvent('mousemove');
            
            console.log(`鼠标移动到中间位置 (${this.currentX}, ${this.currentY})`);
            await this.delay(this.defaultDelay / steps);
        }

        // 确保最终位置准确
        this.currentX = targetX;
        this.currentY = targetY;
        this.createMouseEvent('mousemove');
        console.log(`平滑移动完成，鼠标位于 (${this.currentX}, ${this.currentY})`);
        return this;
    }

    /**
     * 执行单击操作
     * @param {string} button - 鼠标按钮 ('left', 'right', 'middle')
     * @returns {Promise<void>}
     */
    async click(button = 'left') {
        console.log(`在位置 (${this.currentX}, ${this.currentY}) 执行${button}键单击`);
        
        const buttonMap = {
            left: 0,
            middle: 1,
            right: 2
        };

        const buttonValue = buttonMap[button] || 0;

        // 触发鼠标按下事件
        this.createMouseEvent('mousedown', { button: buttonValue });
        this.buttonStates[button] = true;
        
        await this.delay(this.defaultDelay);
        
        // 触发鼠标释放事件
        this.createMouseEvent('mouseup', { button: buttonValue });
        this.buttonStates[button] = false;
        
        // 触发点击事件
        this.createMouseEvent('click', { button: buttonValue });
        
        return this;
    }

    /**
     * 点击指定属性的元素
     * @param {string} attribute - 元素属性名
     * @param {string} value - 属性值
     * @returns {Promise<void>}
     */
    async clickElementByAttribute(attribute, value) {
        console.log(`查找并点击 ${attribute}=${value} 的元素`);
        
        // 构建选择器
        const selector = `[${attribute}="${value}"]`;
        
        try {
            // 查找元素
            const element = document.querySelector(selector);
            
            if (element) {
                // 获取元素位置
                const rect = element.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                // 移动鼠标到元素中心并点击
                await this.moveTo(x, y);
                await this.click();
                console.log(`成功点击 ${attribute}=${value} 的元素`);
            } else {
                console.warn(`未找到 ${attribute}=${value} 的元素`);
            }
        } catch (error) {
            console.error(`点击元素时发生错误: ${error.message}`);
        }
        
        return this;
    }

    /**
     * 点击指定文本内容的元素
     * @param {string} text - 元素文本内容
     * @returns {Promise<void>}
     */
    async clickElementByText(text) {
        console.log(`查找并点击文本为 "${text}" 的元素`);
        
        try {
            // 查找包含指定文本的元素
            const elements = Array.from(document.querySelectorAll('*'));
            const targetElement = elements.find(el => 
                el.textContent && el.textContent.trim() === text
            );
            
            if (targetElement) {
                // 获取元素位置
                const rect = targetElement.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                
                // 移动鼠标到元素中心并点击
                await this.moveTo(x, y);
                await this.click();
                console.log(`成功点击文本为 "${text}" 的元素`);
            } else {
                console.warn(`未找到文本为 "${text}" 的元素`);
            }
        } catch (error) {
            console.error(`点击元素时发生错误: ${error.message}`);
        }
        
        return this;
    }

    /**
     * 执行双击操作
     * @returns {Promise<void>}
     */
    async doubleClick() {
        console.log(`在位置 (${this.currentX}, ${this.currentY}) 执行双击`);
        
        // 第一次点击
        await this.click();
        await this.delay(50);
        
        // 第二次点击
        await this.click();
        
        // 触发双击事件
        this.createMouseEvent('dblclick');
        
        return this;
    }

    /**
     * 执行右键单击操作
     * @returns {Promise<void>}
     */
    async rightClick() {
        return this.click('right');
    }

    /**
     * 执行鼠标按下操作
     * @param {string} button - 鼠标按钮 ('left', 'right', 'middle')
     * @returns {Promise<void>}
     */
    async mouseDown(button = 'left') {
        console.log(`在位置 (${this.currentX}, ${this.currentY}) 按下${button}键`);
        
        const buttonMap = {
            left: 0,
            middle: 1,
            right: 2
        };

        const buttonValue = buttonMap[button] || 0;
        
        this.createMouseEvent('mousedown', { button: buttonValue });
        this.buttonStates[button] = true;
        
        await this.delay(this.defaultDelay);
        return this;
    }

    /**
     * 执行鼠标释放操作
     * @param {string} button - 鼠标按钮 ('left', 'right', 'middle')
     * @returns {Promise<void>}
     */
    async mouseUp(button = 'left') {
        console.log(`在位置 (${this.currentX}, ${this.currentY}) 释放${button}键`);
        
        const buttonMap = {
            left: 0,
            middle: 1,
            right: 2
        };

        const buttonValue = buttonMap[button] || 0;
        
        this.createMouseEvent('mouseup', { button: buttonValue });
        this.buttonStates[button] = false;
        
        await this.delay(this.defaultDelay);
        return this;
    }

    /**
     * 执行拖拽操作
     * @param {number} fromX - 起始 X 坐标
     * @param {number} fromY - 起始 Y 坐标
     * @param {number} toX - 目标 X 坐标
     * @param {number} toY - 目标 Y 坐标
     * @returns {Promise<void>}
     */
    async dragAndDrop(fromX, fromY, toX, toY) {
        // 移动到起始位置
        await this.moveTo(fromX, fromY);
        
        // 按下鼠标
        await this.mouseDown();
        
        // 平滑移动到目标位置
        await this.smoothMove(toX, toY);
        
        // 释放鼠标
        await this.mouseUp();
        
        console.log(`完成从 (${fromX}, ${fromY}) 到 (${toX}, ${toY}) 的拖拽操作`);
        return this;
    }

    /**
     * 执行滚轮操作
     * @param {number} amount - 滚动量 (正数向下滚动，负数向上滚动)
     * @returns {Promise<void>}
     */
    async scroll(amount) {
        const direction = amount > 0 ? '向下' : '向上';
        console.log(`在位置 (${this.currentX}, ${this.currentY}) ${direction}滚动 ${Math.abs(amount)} 单位`);
        
        // 创建滚轮事件
        const wheelEvent = new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaY: amount,
            deltaMode: WheelEvent.DOM_DELTA_PIXEL
        });
        
        const elementAtPoint = document.elementFromPoint(this.currentX, this.currentY);
        if (elementAtPoint) {
            elementAtPoint.dispatchEvent(wheelEvent);
        }
        
        await this.delay(this.defaultDelay);
        return this;
    }

    /**
     * 执行多次点击操作
     * @param {number} times - 点击次数
     * @param {number} interval - 点击间隔时间(毫秒)
     * @returns {Promise<void>}
     */
    async multiClick(times, interval = 200) {
        console.log(`在位置 (${this.currentX}, ${this.currentY}) 开始执行 ${times} 次点击`);
        for (let i = 0; i < times; i++) {
            await this.click();
            if (i < times - 1) {
                await this.delay(interval);
            }
        }
        console.log(`多次点击操作完成`);
        return this;
    }

    /**
     * 延迟函数
     * @param {number} ms - 延迟时间(毫秒)
     * @returns {Promise<void>}
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 设置默认延迟时间
     * @param {number} ms - 延迟时间(毫秒)
     */
    setDefaultDelay(ms) {
        this.defaultDelay = ms;
        console.log(`默认延迟时间已设置为 ${ms} 毫秒`);
        return this;
    }

    /**
     * 设置移动速度
     * @param {number} speed - 移动速度
     */
    setMoveSpeed(speed) {
        this.moveSpeed = speed;
        console.log(`移动速度已设置为 ${speed}`);
        return this;
    }

    /**
     * 获取当前鼠标位置
     * @returns {Object} 包含 x 和 y 坐标的对象
     */
    getPosition() {
        return { x: this.currentX, y: this.currentY };
    }

    /**
     * 获取当前按钮状态
     * @returns {Object} 按钮状态对象
     */
    getButtonStates() {
        return { ...this.buttonStates };
    }
}

export default MouseRPA;
