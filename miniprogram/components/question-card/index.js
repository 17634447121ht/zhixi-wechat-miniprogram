Component({
    properties: {
        question: { type: Object, value: null },
        selectedKeys: { type: Array, value: [] },
        submitted: { type: Boolean, value: false },
        result: { type: Object, value: null },
    },
    data: {
        options: [],
        materialExpanded: false,
        currentQuestionId: '',
    },
    observers: {
        'question, selectedKeys, submitted, result': function (question, selectedKeys, submitted, result) {
            const selected = new Set(selectedKeys || []);
            const correct = new Set((result === null || result === void 0 ? void 0 : result.correctKeys) || []);
            const options = ((question === null || question === void 0 ? void 0 : question.options) || []).map((item) => ({
                ...item,
                selected: selected.has(item.key),
                correct: submitted && correct.has(item.key),
                wrong: submitted && selected.has(item.key) && !correct.has(item.key),
            }));
            const questionChanged = Boolean((question === null || question === void 0 ? void 0 : question.id) && question.id !== this.data.currentQuestionId);
            this.setData({
                options,
                currentQuestionId: (question === null || question === void 0 ? void 0 : question.id) || '',
                materialExpanded: questionChanged ? false : this.data.materialExpanded,
            });
        },
    },
    methods: {
        choose(event) {
            if (this.properties.submitted)
                return;
            this.triggerEvent('select', { key: event.currentTarget.dataset.key });
        },
        toggleMaterial() {
            this.setData({ materialExpanded: !this.data.materialExpanded });
        },
    },
});
