const subscriptions = {
  data: [],
  listeners: [],

  add(item) {
    this.data.push(item);

    this.listeners.forEach((handler) => handler(item));
  },

  listen(handler) {
    this.listeners.push(handler);
  },

  getAll() {
    return this.data;
  },
};

module.exports = subscriptions;
