Component({
  properties: {
    question: { type: Object, value: null },
    selectedKeys: { type: Array, value: [] },
    submitted: { type: Boolean, value: false },
    result: { type: Object, value: null },
  },
  data: {
    options: [] as any[],
    materialExpanded: false,
    currentQuestionId: '',
  },
  observers: {
    'question, selectedKeys, submitted, result': function (question: any, selectedKeys: string[], submitted: boolean, result: any) {
      const selected = new Set(selectedKeys || []);
      const correct = new Set(result?.correctKeys || []);
      const options = (question?.options || []).map((item: any) => ({
        ...item,
        selected: selected.has(item.key),
        correct: submitted && correct.has(item.key),
        wrong: submitted && selected.has(item.key) && !correct.has(item.key),
      }));
      const questionChanged = Boolean(question?.id && question.id !== this.data.currentQuestionId);
      this.setData({
        options,
        currentQuestionId: question?.id || '',
        materialExpanded: questionChanged ? false : this.data.materialExpanded,
      });
    },
  },
  methods: {
    choose(event: any) {
      if (this.properties.submitted) return;
      this.triggerEvent('select', { key: event.currentTarget.dataset.key });
    },
    toggleMaterial() {
      this.setData({ materialExpanded: !this.data.materialExpanded });
    },
  },
});
