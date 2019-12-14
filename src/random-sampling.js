class RandomSampling {
  constructor (epsilon = 0.1, counts = [], values = []) {
    this.epsilon = epsilon
    this.counts = counts
    this.values = values
  }

  initialize (nArms = 0) {
    this.counts = Array(nArms).fill(0)
    this.values = Array(nArms).fill(0.0)
  }

  selectArm (randomIndexFn = (n) => Math.floor(Math.random() * n)) {
    return randomIndexFn(this.values.length)
  }

  update (chosenArm, reward) {
    this.counts[chosenArm] += 1
    const value = this.values[chosenArm]
    this.values[chosenArm] = value + reward
  }
}

module.exports = RandomSampling
