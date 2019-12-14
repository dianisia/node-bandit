const fs = require('fs');

const BernoulliArm = require('./src/bernoulli-arm');

function writeToFile (Algo, fileName, callback) {
  const means = [0.1, 0.2, 0.2, 0.6, 0.1];
  const nArms = means.length;
  const numSims = 5000;
  const horizons = 250;
  const arms = means.map((p) => new BernoulliArm(p));

  const header = ['simNums', 'times', 'chosenArms', 'rewards', 'cumulativeRewards'];
  const output = [header];

  const algo = new Algo([], []);
  algo.initialize(nArms);

  const results = testAlgorithm(algo, arms, numSims, horizons);

  Array(numSims).fill(0).forEach((_, i) => {
    const out = results.map((_, j) => results[j][i]).join(',');
    output.push(out)
  });

  const text = output.join('\n');
  const bestArmText = bestArmResult.join('\n');
  fs.writeFileSync(`${fileName}.csv`, text, 'utf-8');
  fs.writeFileSync(`${fileName}_best_arm.csv`, bestArmText, 'utf-8');
}

function getBestArmStats(results, numSims, horizons) {
  let bestArmCount = [];
  let bestArmResult = [];
  const count = Math.round(numSims/horizons);

  for(let i = 0; i < horizons; i++) {
    bestArmCount[i] = 0;
    for (let j = i; j < numSims; j += horizons) {
        bestArmCount[i] += results[3][j];
    }
    bestArmResult.push({key: i, value: bestArmCount[i]/count});
  }
  return bestArmResult;
}

function getCumRewardStats(results, numSims, horizons) {
  let cumRewardCount = [];
  let cumRewardResult = [];
  const count = Math.round(numSims/horizons);

  for(let i = 0; i < horizons; i++) {
    cumRewardCount[i] = 0;
    for (let j = i; j < numSims; j += horizons) {
        cumRewardCount[i] += results[4][j];
    }
    cumRewardResult.push({key: i, value: Math.round(cumRewardCount[i]/count)});
  }
  return cumRewardResult;
}

function testAlgorithm (algo, arms, numSims, horizon) {
  const chosenArms = Array(numSims * horizon).fill(0.0);
  const rewards = Array(numSims * horizon).fill(0.0);
  const cumulativeRewards = Array(numSims * horizon).fill(0.0);
  const simNums = Array(numSims * horizon).fill(0.0);
  const times = Array(numSims * horizon).fill(0.0);

  for (let i = 0, armsLen = arms.length; i < numSims; i += 1) {
    const sim = i + 1;
    algo.initialize(armsLen);

    for (let j = 0; j < horizon; j += 1) {
      const t = j + 1;
      const index = (sim - 1) * horizon + t - 1;
      simNums[index] = sim;
      times[index] = t;

      const chosenArm = algo.selectArm();
      chosenArms[index] = chosenArm;

      const reward = arms[chosenArms[index]].draw();
      rewards[index] = reward;

      if (t === 1) {
        cumulativeRewards[index] = reward;
      } else {
        cumulativeRewards[index] = cumulativeRewards[index - 1] + reward;
      }

      algo.update(chosenArm, reward);
    }
  }
  return [simNums, times, chosenArms, rewards, cumulativeRewards];
}

module.exports = {
  writeToFile,
  testAlgorithm,
  getBestArmStats,
  getCumRewardStats
};
