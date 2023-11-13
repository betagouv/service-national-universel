class StateMachine {
  constructor(model, options = {}) {
    this.model = model;
    this.key = options.key || "status";

    this.state = model[options.key] || options.initialState;
    this.states = options.states || {};
  }

  async setState(to) {
    if (!this.states.includes(to) || typeof this.states[to].isSatisfied !== "function") {
      throw new Error(`State ${to} is not defined for model ${this.model.constructor.modelName} with ID: ${this.model._id}`);
    }

    try {
      const isSatisfied = await this.states[to].isSatisfied(this.model);
      if (isSatisfied) return this.state = to;
      throw new Error(`State ${to} is not satisfied from ${this.state} for model ${this.model.constructor.modelName} with ID: ${this.model._id}`);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async nextState() {
    const currentState = this.states[this.state];
    if (!currentState) throw new Error(`State ${this.state} is not defined for model ${this.model.constructor.modelName} with ID: ${this.model._id}`);

    const next = currentState.next;
    if (!next || !this.states.includes(next) || typeof this.states[next].isSatisfied !== "function") return this.state;

    try {
      const isSatisfied = await this.states[next].isSatisfied(this.model);
      if (isSatisfied) this.state = next;
      return this.state;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

module.exports = StateMachine;
