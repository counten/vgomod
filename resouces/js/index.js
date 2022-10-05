var input = document.getElementById("input");
var title = document.getElementById("title-area");
var highlightNode = document.getElementById("highlight-node");
var output = document.getElementById("output");
var renderBtn = document.getElementById("render");

mermaid.initialize({ startOnLoad: false });
renderBtn.onclick = function () {
    let res = parseStdOut(input.value);
    title.innerHTML = res.title;
    // render picture
    mermaid.render('theGraph', res.graph, function (svgCode) {
        output.innerHTML = svgCode;
    });
    // zoom feature
    var svgs = d3.selectAll(".mermaid svg");
    svgs.each(function () {
        var svg = d3.select(this);
        svg.html("<g>" + svg.html() + "</g>");
        var inner = svg.select("g");
        var zoom = d3.zoom().on("zoom", function (event) {
            inner.attr("transform", event.transform);
        });
        svg.call(zoom);
    });
};

// Handle the message inside the webview
window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent

    switch (message.command) {
        case 'refresh':
            input.value = message.graph;
            title.innerHTML = message.title;
            break;
    }
});


function parseStdOut(stdout) {
    const splitted = stdout.split("\n");
    // map mod dep to node name
    let nodeMap = new Map();
    let newGraph = `graph LR`;
    let title = "root: ";
    let id = 0;
    splitted.forEach(li => {
        if (li && li.includes(" ") && li.includes("@") && !li.includes(":")) {
            const mods = li.split(" ");
            let from = mods[0];
            if (id === 0) {
                title = title + from;
            }
            if (nodeMap.has(from)) {
                from = nodeMap.get(from);
            } else {
                from = `N` + id + `["` + from + `"]`;
                nodeMap.set(mods[0], `N` + id);
                id++;
            }
            let to = mods[1];
            if (nodeMap.has(to)) {
                to = nodeMap.get(to);
            } else {
                to = `N` + id + `["` + to + `"]`;
                nodeMap.set(mods[1], `N` + id);
                id++;
            }
            // console.log("[vgomod] :", from, " --> ", to);
            newGraph += "\n " + from + " --> " + to;
        }
    });
    return {
        graph: newGraph,
        title: title
    };
}