var input = document.getElementById("input");
var title = document.getElementById("title-area");
var output = document.getElementById("output");
var renderBtn = document.getElementById("render");
mermaid.initialize({ startOnLoad: false });
renderBtn.onclick = function () {
    // render picture
    mermaid.render('theGraph', input.value, function (svgCode) {
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