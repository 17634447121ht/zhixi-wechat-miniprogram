"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../../../services/api");
Page({
    data: { loading: true, books: [] },
    async onShow() { this.setData({ books: await api_1.api.listWordBooks(), loading: false }); },
    open(event) { wx.navigateTo({ url: `/pkg-word/pages/book-detail/index?bookId=${event.currentTarget.dataset.id}` }); },
});
