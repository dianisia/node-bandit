const program = require('commander');
const path = require('path');

const {
    testAlgorithm,
    getBestArmStats,
    getCumRewardStats,
    getSignificance,
    writeToFile,
    getAvarageReward,
    getTotalReward,
    getStats
} = require('./index');

const {formAndSaveGraph} = require('./save_graph');

const BanditFactory = require('./src');
const ThompsonSampling = BanditFactory('thompson');
const RandomSampling = BanditFactory('random');
const EpsilonGreedy = BanditFactory('epsilon');
const BernoulliArm = require('./src/bernoulli-arm');

program
    .option('-h, --horizon <number>', 'number of trials play the arm')
    .option('-m, --means <number>', 'array of arms probabilities')
    .parse(process.argv);

const horizon = parseInt(program.horizon);
const numSims = horizon * 50;

const means = JSON.parse(program.means);
const nArms = means.length;
const arms = means.map((p) => new BernoulliArm(p));

const thompsonAlgo = new ThompsonSampling([], []);
thompsonAlgo.initialize(nArms);
const thompsonResults = testAlgorithm(thompsonAlgo, arms, numSims, horizon);
/*const thompsonArm = getBestArmStats(thompsonResults, numSims, horizon);
const thompsonCumReward = getCumRewardStats(thompsonResults, numSims, horizon);
const thompsonAvReward = getAvarageReward(thompsonResults, numSims, horizon);*/
const thompsonTotalReward = getTotalReward(thompsonResults, numSims, horizon);
writeToFile(path.join('examples', 'thompson'), thompsonResults, numSims);

const randomAlgo = new RandomSampling([], []);
randomAlgo.initialize(nArms);
const randomResults = testAlgorithm(randomAlgo, arms, numSims, horizon);
/*const randomArm = getBestArmStats(randomResults, numSims, horizon);
const randomCumReward = getCumRewardStats(randomResults, numSims, horizon);
const randomAvReward = getAvarageReward(randomResults, numSims, horizon);*/
const randomTotalReward = getTotalReward(randomResults, numSims, horizon);

const bestArmIndex = means.indexOf(Math.max(...means));
for (let h = 100; h <= 50000; h += 100) {
    const pullNumbers = Math.round(h / nArms);
    const stats = [];
    for (let i = 0; i < nArms; ++i) {
        const randomResultsForArm = testAlgorithm(randomAlgo, [arms[i]], 1, pullNumbers);
        stats.push(getStats(randomResultsForArm, 1, pullNumbers, 1));
    }
    if (stats.indexOf(0) > -1) {
        continue;
    }
    const indexOfMaxValue = stats.indexOf(Math.max(...stats));
    const sign = getSignificance(0.5, stats[0], stats[indexOfMaxValue], pullNumbers);
    if (indexOfMaxValue === bestArmIndex && sign >= 0.9) {
        console.log(`Variant ${means[indexOfMaxValue]} is the winner with ${(sign*100).toFixed(2)} significance for ${h} trials`);
        break;
    }
}


writeToFile(path.join('examples', 'random'), randomResults, numSims);

const epsilonAlgo = new EpsilonGreedy([], []);
epsilonAlgo.initialize(nArms);
const epsilonResults = testAlgorithm(epsilonAlgo, arms, numSims, horizon);
/*const epsilonArm = getBestArmStats(epsilonResults, numSims, horizon);
const epsilonCumReward = getCumRewardStats(epsilonResults, numSims, horizon);
const epsilonAvReward = getAvarageReward(epsilonResults, numSims, horizon);
const epsilonTotalReward = getTotalReward(epsilonResults, numSims, horizon);*/
writeToFile(path.join('examples', 'epsilon'), epsilonResults, numSims);

let numSimsKeys = [];
for (let i = 1; i <= numSims / horizon; ++i) {
    numSimsKeys.push(i);
}

/*formAndSaveGraph(
    thompsonArm,
    randomArm,
    epsilonArm,
    path.join('examples', 'chosenArm'),
    horizon,
    `Probability of selecting best arm for time, simulations number=${numSims}, horizon=${horizon}, number of arms=${nArms}`
);

formAndSaveGraph(
    thompsonCumReward,
    randomCumReward,
    epsilonCumReward,
    path.join('examples', 'cumReward'),
    horizon,
    `Number of cumulative reward for time, numSims=${numSims}, horizon=${horizon}, number of arms=${nArms}`
);*/

formAndSaveGraph(
    thompsonTotalReward,
    randomTotalReward,
    {},
    `./examples/totalReward_${horizon}`,
    numSimsKeys,
    `Average reward for time, numSims=${numSims}, horizon=${horizon}, number of arms=${nArms}`
);
