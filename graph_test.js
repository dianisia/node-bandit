const output = require("d3node-output");
const d3nLine = require('d3node-linechart');
const {NormalDistribution} = require('normal-distribution');
const ss = require('simple-statistics');
const { jStat } = require('jstat');
const program = require('commander');

const {
  testAlgorithm,
  getBestArmStats,
  getCumRewardStats,
  getHorizonForSignificanse,
  writeToFile
} = require('./index');

const {formAndSaveGraph} = require('./save_graph');

const BanditFactory = require('./src');
const ThompsonSampling = BanditFactory('thompson');
const RandomSampling = BanditFactory('random');
const BernoulliArm = require('./src/bernoulli-arm');

program
    .option('-h, --horizon <number>', 'number of trials play the arm')
    .option('-m, --means <number>', 'array of arms probabilities')
    .parse(process.argv);

const horizon = parseInt(program.horizon);
const numSims = horizon * 3;

const means = JSON.parse(program.means);
const nArms = means.length;
const arms = means.map((p) => new BernoulliArm(p));

const thompsonAlgo = new ThompsonSampling([], []);
thompsonAlgo.initialize(nArms);
const thompsonResults = testAlgorithm(thompsonAlgo, arms, numSims, horizon);
const thompsonArm = getBestArmStats(thompsonResults, numSims, horizon);
const thompsonCumReward = getCumRewardStats(thompsonResults, numSims, horizon);
writeToFile('./examples/thompson', thompsonResults, numSims);

const randomAlgo = new RandomSampling([], []);
randomAlgo.initialize(nArms);
const randomResults = testAlgorithm(randomAlgo, arms, numSims, horizon);
const randomArm = getBestArmStats(randomResults, numSims, horizon);
const randomCumReward = getCumRewardStats(randomResults, numSims, horizon);
writeToFile('./examples/random', thompsonResults, numSims);

const sign = getHorizonForSignificanse(0.05, thompsonCumReward, randomCumReward, horizon);
//console.log(sign);

console.log(`For horizon = ${horizon} significance got on ${sign} trials`);

/*formAndSaveGraph(
    thompsonArm,
    randomArm,
    "./examples/chosenArm",
    horizon,
    `Probability of selecting best arm for time, simulations number=${numSims}, horizon=${horizon}, number of arms=${nArms}`
);*/
formAndSaveGraph(
    thompsonCumReward,
    randomCumReward,
    "./examples/cumReward",
    horizon,
    `Number of cumulative reward for time, numSims=${numSims}, horizon=${horizon}, number of arms=${nArms}`,
    sign);