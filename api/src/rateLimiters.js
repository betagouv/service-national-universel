class RateLimiter {
  constructor(limitPerSecond = 10) {
    this.limit = limitPerSecond;
    this.calls = 0;
    this.queue = [];
    setInterval(() => this._release(), 1000);
  }

  _release() {
    this.calls = 0;
    while (this.calls < this.limit && this.queue.length) {
      const nextCall = this.queue.shift();
      this.calls += 1;
      nextCall();
    }
  }

  async call(fn) {
    return new Promise((resolve, reject) => {
      const tryCall = () => {
        if (this.calls < this.limit) {
          this.calls += 1;
          resolve(fn());
        } else {
          this.queue.push(tryCall);
        }
      };
      tryCall();
    });
  }
}

const rateLimiterContactSIB = new RateLimiter(10);

module.exports = {
  rateLimiterContactSIB,
};
