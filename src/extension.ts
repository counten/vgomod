// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as cmd from './cmd';
import * as fs from 'fs';

let graph = `undefined`;
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
				enableScripts: true,
				// 隐匿时保存上下文
				retainContextWhenHidden: true
			} // Webview选项。
		);
		updateView(currentPanel);

		currentPanel.webview.html = getWebViewContent(context.extensionPath, "src/view/index.html");
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
	panel.webview.postMessage({
		command: 'refresh',
		graph: graph,
		title: title,
	});
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
		graph = parseStdOut(stdout);
	} catch (error: any) {
		if (error.code === "ENOENT") {
			vscode.window.showErrorMessage("[vgomod] ENOENT error");
		} else {
			throw error;
		}
	}
}

function parseStdOut(stdout: string): string {
	const splitted = stdout.split("\n");
	// map mod dep to node name
	let nodeMap = new Map();
	let newGraph = `graph LR`;
	let id = 0;
	splitted.forEach(li => {
		if (li && li.includes(" ") && li.includes("@") && !li.includes(":")) {
			const mods = li.split(" ");
			let from = mods[0];
			if (id === 0) {
				title = "root: " + from;
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
	return newGraph;
}

function getWebViewContent(extentionPath: string, templatePath: string) {
	const resourcePath = path.join(extentionPath, templatePath);
	const dirPath = path.dirname(resourcePath);
	let html = fs.readFileSync(resourcePath, 'utf-8');
	// vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
	html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
		return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
	});
	return html;
}

// this method is called when your extension is deactivated
export function deactivate() { }
