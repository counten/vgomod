// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vgomod" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vgomod.graph', () => {
		// 创建并显示新的webview
		const panel = vscode.window.createWebviewPanel(
			'goModGraph', // 只供内部使用，这个webview的标识
			'Go Mod Graph', // 给用户显示的面板标题
			vscode.ViewColumn.One, // 给新的webview面板一个编辑器视图
			{
				// 在webview中启用脚本
				enableScripts: true
			} // Webview选项。
		);
		// 设置HTML内容
		panel.webview.html = getWebviewContent();
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent() {
	return `
		  <!DOCTYPE html>
		  <html lang="en">
		  <head>
			  <meta charset="UTF-8">
			  <meta name="viewport" content="width=device-width, initial-scale=1.0">
			  <title>Go Mod Graph</title>
		  </head>
		  <body>
			<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
			<script>
				mermaid.initialize({ startOnLoad: true });
			</script>
	
			Mod graph of $预留名称:
			<div class="mermaid">
				graph TD 
				A["github.com/natefinch/lumberjack"] --> B["github.com/BurntSushi/toml@v0.3.1"]
				A --> C["gopkg.in/yaml.v2@v2.2.2"] 
				C --> D["gopkg.in/check.v1@v0.0.0-20161208181325-20d25e280405"]
			</div>
		  </body>
		  </html>
	  `;
}

// this method is called when your extension is deactivated
export function deactivate() { }
