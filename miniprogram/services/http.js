"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = request;
const index_1 = require("../config/index");
async function request(options) {
    const token = wx.getStorageSync('zhixi.access-token');
    return new Promise((resolve, reject) => {
        wx.request({
            url: `${index_1.API_BASE_URL}${options.path}`,
            method: options.method || 'GET',
            data: options.data,
            header: token ? { Authorization: `Bearer ${token}` } : {},
            success(response) {
                var _a, _b;
                if (response.statusCode >= 200 && response.statusCode < 300 && ((_a = response.data) === null || _a === void 0 ? void 0 : _a.code) === 200) {
                    resolve(response.data.data);
                    return;
                }
                reject(new Error(((_b = response.data) === null || _b === void 0 ? void 0 : _b.message) || '服务暂时不可用'));
            },
            fail() {
                reject(new Error('网络连接异常，请检查网络后重试'));
            },
        });
    });
}
