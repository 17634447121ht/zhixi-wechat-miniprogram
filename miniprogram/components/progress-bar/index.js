Component({
    properties: {
        value: { type: Number, value: 0 },
        tone: { type: String, value: 'green' },
        label: { type: String, value: '' },
        detail: { type: String, value: '' },
    },
    data: { safeValue: 0 },
    observers: {
        value(value) {
            this.setData({ safeValue: Math.max(0, Math.min(100, Number(value) || 0)) });
        },
    },
});
