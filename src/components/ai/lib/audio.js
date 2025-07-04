import {fetchTextToAudio} from "./api";

class AudioManager {
    constructor() {
        // 存储文本到base64音频的映射
        this.audioCache = new Map();
    }

    addAudio(text, base64Audio) {
        this.audioCache.set(text, base64Audio);
        return this;
    }

    getAudio(text) {
        return this.audioCache.get(text) || null;
    }

    hasAudio(text) {
        return this.audioCache.has(text);
    }

    async getOrFetchAudio(text) {
        // 检查缓存中是否已有此音频
        if (this.hasAudio(text)) {
            return this.getAudio(text);
        }

        if (!text) {
            return null;
        }

        // 从API获取音频
        const audioData = await fetchTextToAudio(text);
        if (audioData) {
            // 添加到缓存
            this.addAudio(text, audioData);
            return audioData;
        }

        return null;
    }
}

const audioMgr = new AudioManager();
export default audioMgr;
