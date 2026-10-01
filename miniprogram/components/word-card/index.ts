Component({
  properties: {
    word: { type: Object, value: null },
    revealed: { type: Boolean, value: false },
  },
  methods: {
    reveal() { this.triggerEvent('reveal'); },
    speak() { this.triggerEvent('speak'); },
    favorite() { this.triggerEvent('favorite'); },
  },
});
