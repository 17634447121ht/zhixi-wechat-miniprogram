"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./services/api");
App({
    globalData: {
        user: null,
    },
    async onLaunch() {
        await api_1.api.initialize();
        this.globalData.user = await api_1.api.getProfile();
    },
});
