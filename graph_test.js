const output = require("d3node-output");
const d3nLine = require('d3node-linechart');
const {NormalDistribution} = require('normal-distribution');
const ss = require('simple-statistics');
const { jStat } = require('jstat');
const program = require('commander');

const {
  testAlgorithm,
  getBestArmStats,
  getCumRewardStats
} = require('./index');

const {formAndSaveGraph} = require('./save_graph');

const BanditFactory = require('./src');
const ThompsonSampling = BanditFactory('thompson');
const RandomSampling = BanditFactory('random');
const BernoulliArm = require('./src/bernoulli-arm');

program
    .option('-s, --sims <number>', 'number of simulations')
    .option('-h, --horizon <number>', 'number of trials paly the arm')
    .parse(process.argv);

const numSims = parseInt(program.sims);
const horizon = parseInt(program.horizon);
const means = [0.1, 0.2, 0.2, 0.6, 0.3];
const nArms = means.length;
const arms = means.map((p) => new BernoulliArm(p));

const thompsonAlgo = new ThompsonSampling([], []);
thompsonAlgo.initialize(nArms);
const thompsonResults = testAlgorithm(thompsonAlgo, arms, numSims, horizon);
const thompsonArm = getBestArmStats(thompsonResults, numSims, horizon);
const thompsonCumReward = getCumRewardStats(thompsonResults, numSims, horizon);
const thompsonCR = thompsonCumReward[horizon-1].value/horizon;
const thompsonSE = Math.sqrt((thompsonCR*(1-thompsonCR))/horizon);

const randomAlgo = new RandomSampling([], []);
randomAlgo.initialize(nArms);
const randomResults = testAlgorithm(randomAlgo, arms, numSims, horizon);
const randomArm = getBestArmStats(randomResults, numSims, horizon);
const randomCumReward = getCumRewardStats(randomResults, numSims, horizon);
const randomCR = randomCumReward[horizon-1].value/horizon;
const randomSE = Math.sqrt((randomCR*(1-randomCR))/horizon);

const SEdif = Math.sqrt(thompsonSE*thompsonSE+randomSE*randomSE);
const Z = (thompsonCR - randomCR)/SEdif;

const significanse = 1-NORMSDIST(Z);

console.log(`For ${numSims} simulation numbers and horizon = ${horizon} p-value=${significanse}`);

function NORMSDIST(z) {
  var mean = 0, sd = 1;
  return jStat.normal.cdf(z, mean, sd);
}

formAndSaveGraph(
    thompsonArm,
    randomArm,
    "./examples/chosenArm",
    horizon,
    `Probability of selecting best arm for time, simulations number=${numSims}, horizon=${horizon}, number of arms=${nArms}`
);
formAndSaveGraph(
    thompsonCumReward,
    randomCumReward,
    "./examples/cumReward",
    horizon,
    `Number of cumulative reward for time, numSims=${numSims}, horizon=${horizon}, number of arms=${nArms}`);
