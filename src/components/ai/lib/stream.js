const handleStream = async (
    stream, processor,
    onFirstChunk = null,
    onError = null,
    onEnd = null) => {

    if (!stream || !stream.getReader) {
        throw new Error("无效的流对象");
    }

    try {
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let isFirstChunk = true;

        while (!processor.isStopped) {
            await processor.checkPause();

            const {done, value} = await reader.read();
            if (done) break;

            // 当收到第一个分片数据时触发回调
            if (isFirstChunk && onFirstChunk) {
                onFirstChunk(value);
                isFirstChunk = false;
            }

            buffer += decoder.decode(value, {stream: true});
            let lines = buffer.split("\n");
            buffer = lines.pop(); // 保留最后一个可能不完整的行

            for (const line of lines) {
                if (processor.isStopped) {
                    return;
                }

                await processor.checkPause();

                if (line.trim() === "") continue;

                try {
                    const data = JSON.parse(line);
                    // 确保cmds字段存在
                    if (!data.cmds) {
                        data.cmds = [];
                    }

                    await processor.process(data);

                    if (!processor.isStopped) {
                        await processor.delay(1); // 微小延迟，防止过快处理
                    }
                } catch (e) {
                    if (!processor.isStopped) {
                        console.error("解析消息失败", e, line);
                    }
                }
            }
        }

        // 处理可能留在缓冲区的最后一行
        if (buffer.trim() !== "") {
            try {
                const data = JSON.parse(buffer);
                if (!data.cmds) {
                    data.cmds = [];
                }
                await processor.process(data);
            } catch (e) {
                if (!processor.isStopped) {
                    console.error("解析最后一条消息失败", e, buffer);
                }
            }
        }

        // 流处理完成时调用onEnd回调
        if (onEnd) {
            onEnd();
        }
    } catch (err) {
        if (onError) {
            onError(err);
        }
        if (processor.isStopped) {
            console.log("流处理已停止");
        } else if (err.name === "AbortError") {
            console.log("流处理被取消");
        } else {
            console.error("流处理出错", err);
            throw err;
        }
    } finally {
        // 确保在任何情况下（包括错误情况）都调用onEnd回调
        if (onEnd && !onEnd.called) {
            onEnd();
            onEnd.called = true; // 标记已调用，防止重复调用
        }
    }
}

export default handleStream;
