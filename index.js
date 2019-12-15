const fs = require('fs');
const {jStat} = require('jstat');

const BernoulliArm = require('./src/bernoulli-arm');

function writeToFile(fileName, results, numSims) {
    const header = ['simNums', 'times', 'chosenArms', 'rewards', 'cumulativeRewards'];
    const output = [header];

    Array(numSims).fill(0).forEach((_, i) => {
        const out = results.map((_, j) => results[j][i]).join(',');
        output.push(out)
    });

    const text = output.join('\n');
    fs.writeFileSync(`${fileName}.csv`, text, 'utf-8');
}

function getBestArmStats(results, numSims, horizons) {
    let bestArmCount = [];
    let bestArmResult = [];
    const count = Math.round(numSims / horizons);
    bestArmResult.push({key: 0, value: 0});

    for (let i = 1; i <= horizons; i++) {
        bestArmCount[i] = 0;
        for (let j = i; j < numSims; j += horizons) {
            bestArmCount[i] += results[3][j];
        }
        bestArmResult.push({key: i, value: bestArmCount[i] / count});
    }

    return bestArmResult;
}

function getCumRewardStats(results, numSims, horizons) {
    let cumRewardCount = [];
    let cumRewardResult = [];
    const count = Math.round(numSims / horizons);
    cumRewardResult.push({key: 0, value: 0});

    for (let i = 0; i < horizons; i++) {
        cumRewardCount[i] = 0;
        for (let j = i; j < numSims; j += horizons) {
            cumRewardCount[i] += results[4][j];
        }
        cumRewardResult.push({key: i, value: Math.round(cumRewardCount[i] / count)});
    }
    return cumRewardResult;
}

function getAvarageReward(results, numSims, horizons) {
    let avRewardCount = [];
    let avRewardResult = [];
    const count = Math.round(numSims / horizons);
    avRewardResult.push({key: 0, value: 0});

    for (let i = 0; i < horizons; i++) {
        avRewardCount[i] = 0;
        for (let j = i; j < numSims; j += horizons) {
            avRewardCount[i] += results[3][j];
        }
        avRewardResult.push({key: i, value: avRewardCount[i] / count});
    }
    return avRewardResult;
}

function testAlgorithm(algo, arms, numSims, horizon) {
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

function getHorizonForSignificanse(sign, thompsonReward, randomReward, horizon) {
    for (let i = 2; i < horizon; i += 99) {
        const thompsonCR = thompsonReward[i - 1].value / i;
        const thompsonSE = Math.sqrt((thompsonCR * (1 - thompsonCR)) / i);

        const randomCR = randomReward[i - 1].value / i;
        const randomSE = Math.sqrt((randomCR * (1 - randomCR)) / i);

        const SEdif = Math.sqrt(thompsonSE * thompsonSE + randomSE * randomSE);
        const Z = (thompsonCR - randomCR) / SEdif;

        const significanse = 1 - NORMSDIST(Z);

        /*console.log("************");
        console.log(thompsonReward[i - 1].value);
        console.log(randomReward[i - 1].value);
        console.log(significanse);
        console.log("************");*/

        if (significanse < sign) {
           /* console.log("!!!!!!!!!");
            console.log(significanse);*/
            return i;
        }
    }
    return 0;
}

function NORMSDIST(z) {
    var mean = 0, sd = 1;
    return jStat.normal.cdf(z, mean, sd);
}

module.exports = {
    writeToFile,
    testAlgorithm,
    getBestArmStats,
    getCumRewardStats,
    getHorizonForSignificanse,
    getAvarageReward
};
