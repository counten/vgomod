// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as cmd from './cmd';

let graph = `
	graph LR 
	0["demo root"] --> 1["demo dep1"]
	0 --> 2["demo dep2"] 
	2 --> 3["demo dep3"]
`;
let title = "undefined";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let currentPanel: vscode.WebviewPanel | undefined = undefined;

	let disposable = vscode.commands.registerCommand('vgomod.graph', () => {
		// 创建并显示新的webview
		currentPanel = vscode.window.createWebviewPanel(
			'goModGraph', // 只供内部使用，这个webview的标识
			'Go Mod Graph', // 给用户显示的面板标题
			vscode.ViewColumn.One, // 给新的webview面板一个编辑器视图
			{
				// 在webview中启用脚本
				enableScripts: true
			} // Webview选项。
		);
		updateView(currentPanel);
	});

	context.subscriptions.push(disposable);
}


async function updateView(panel: vscode.WebviewPanel) {
	const activeTextEditor = vscode.window.activeTextEditor;
	if (activeTextEditor === undefined) {
		vscode.window.showErrorMessage("[vgomod] please open a file first.");
		return;
	}
	const document = activeTextEditor.document;
	const documentDir = path.dirname(document.fileName);
	await goModGraphCmd(documentDir);
	// TODO 此处将获取 go mod graph 转为同步调用，因为 mermaid 异步渲染没有测试成功。
	panel.webview.html = getWebviewContent();
}

// call go mod graph cmd
async function goModGraphCmd(dir: string): Promise<void> {
	console.log("[vgomod] run go mod graph in:", dir);
	try {
		const [exitCode, stdout, stderr] = await cmd.runChildProcess(
			"go",
			["mod", "graph"],
			dir,
			"",
			undefined
		);
		if (exitCode !== 0) {
			throw new Error(stderr.trim());
		}

		const splitted = stdout.split("\n");
		// map mod dep to node name
		let nodeMap = new Map();
		let newGraph = `graph LR`;
		let id = 0;
		splitted.forEach(li => {
			if (li && li.includes(" ") && li.includes("@") && !li.includes(":")) {
				const mods = li.split(" ");
				let from = mods[0];
				if (id===0){
					title = "mod graph of: "+from;
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
		graph = newGraph;
	} catch (error: any) {
		if (error.code === "ENOENT") {
			vscode.window.showErrorMessage("[vgomod] ENOENT error");
		} else {
			throw error;
		}
	}
}

function getWebviewContent() {
	return `
		  <!DOCTYPE html>
		  <html lang="en">
		  <head>
			  <meta charset="UTF-8">
			  <meta name="viewport" content="width=device-width, initial-scale=1.0">
			  <title>Go Mod Graph</title>
			  <style type="text/css">
				.mermaid {
					overflow: hidden;
				}
			</style>
		  </head>
		  <body>
			<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
			<script src="https://d3js.org/d3.v6.min.js"></script>
			<script>
				mermaid.initialize({ startOnLoad: true });
				window.addEventListener('load', function () {
					var svgs = d3.selectAll(".mermaid svg");
					svgs.each(function() {
					  var svg = d3.select(this);
					  svg.html("<g>" + svg.html() + "</g>");
					  var inner = svg.select("g");
					  var zoom = d3.zoom().on("zoom", function(event) {
						inner.attr("transform", event.transform);
					  });
					  svg.call(zoom);
					});
				  });
			</script>
	
			<h1 id="title-area">`+title+`</h1>
			<div class="mermaid" id="graph-area">
				`+ graph + `
			</div>
		  </body>
		  </html>
 `;
}

// this method is called when your extension is deactivated
export function deactivate() { }
