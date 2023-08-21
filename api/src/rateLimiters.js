class RateLimiter {
  constructor(limitPerSecond = 10) {
    this.limit = limitPerSecond;
    this.calls = 0;
    this.queue = [];
    this.interval = null;
  }

  _startInterval() {
    if (!this.interval) {
      this.interval = setInterval(() => this._release(), 1000);
    }
  }

  _stopInterval() {
    if (this.interval && !this.hasPendingTasks()) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  _release() {
    this.calls = 0;
    while (this.calls < this.limit && this.queue.length) {
      const nextCall = this.queue.shift();
      this.calls += 1;
      nextCall();
    }
    this._stopInterval(); // Check if interval should be stopped after processing the queue
  }

  async call(fn) {
    return new Promise((resolve, reject) => {
      const tryCall = () => {
        if (this.calls < this.limit) {
          this.calls += 1;
          resolve(fn());
        } else {
          this.queue.push(tryCall);
          this._startInterval(); // Start the interval when there are tasks in the queue
        }
      };
      tryCall();
    });
  }

  hasPendingTasks() {
    return this.queue.length > 0 || this.calls > 0;
  }

  stop() {
    // Not needed anymore, but keep it for manual stopping if required
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

const rateLimiterContactSIB = new RateLimiter(10);

module.exports = {
  rateLimiterContactSIB,
};
