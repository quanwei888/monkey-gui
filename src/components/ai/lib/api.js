import axios from 'axios';

const baseUrl = 'http://test.xiaomalong.org:3001';
const timeout = 100000; // 100秒，单位为毫秒

export default {
    submit: async (action, data) => {
        const response = await axios.post(`${baseUrl}/submit`, {
            action: action,
            data: data
        }, {
            timeout: timeout
        });
        return response.data.sid;
    },

}
export const fetchStudyMessages = async (pid) => {
    const response = await axios.get(`${baseUrl}/lecture/${pid}/study`, {
        timeout: timeout
    });
    return response.data;
}

export const fetchTextToAudio = async (text) => {
    try {
        const response = await axios.post(`${baseUrl}/tts`, {
            text: text
        }, {
            timeout: timeout
        });
        return response.data;
    } catch (error) {
        throw new Error(`API响应错误: ${error.response?.status || error.message}`);
    }
}
