const output = require("d3node-output");
const d3nLine = require('d3node-linechart');

function formAndSaveGraph(firstResult, secondResult, thirdResult, fileName, keys, label, sign) {
    let data = sign && sign > 0 ? [
        firstResult, secondResult, thirdResult,  [{key: sign, value: 0}, {key: sign, value: 100}]] :
        [firstResult, secondResult, thirdResult];

    data.allKeys = keys;
    const container = `
        <div id="container"><h3>${label}</h3>
        <div id="chart"></div>
        <h3 style="color:steelblue">———— Thompson sampling</h3>
        <h3 style="color:darkorange"> ———— Random sampling</h3>
        <h3 style="color:red"> ———— Epsilon-greedy with eps=0.1</h3>
        </div>`;
    // create output files
    output(
        fileName,
        d3nLine({
            data: data,
            container: container,
            lineColors: ["steelblue", "darkorange", "red"],
            width: 1200,
            height: 570
        })
    );
}

module.exports = {
    formAndSaveGraph
}
