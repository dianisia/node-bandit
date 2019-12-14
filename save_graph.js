const output = require("d3node-output");
const d3nLine = require('d3node-linechart');

function formAndSaveGraph(firstResult, secondResult, fileName, horizon, label) {
    let data = [firstResult, secondResult];
    let allKeys = [];

    for (let i = 0; i < horizon; ++i) {
        allKeys.push(i);
    }

    data.allKeys = allKeys;
    const container = `<div id="container"><h2>${label}</h2><div id="chart"></div></div>`
    // create output files
    output(
        fileName,
        d3nLine({
            data: data,
            container: container,
            lineColors: ["steelblue", "darkorange"],
            width: 800,
            height: 570
        })
    );
}

module.exports = {
    formAndSaveGraph
}
