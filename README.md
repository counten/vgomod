# vgomod README

visulization of go mod.

## Features

- Visulization of `go mod graph`;
- Support image zoom in and zoom out

## Requirements

- go

## Extension Settings

none

## Known Issues

none

## Release Notes

### 0.0.1

Initial release of vgomod, support of `go mod graph` command, Support image zoom in and zoom out.

### 0.0.2
- retain context when hidden
- use local js file instead of cdn
- async call `go mod graph` cmd

### 0.0.3
- show `origin go mod graph result`

## Working with vgomod

While you are dev a golang project, `Ctrl + P` in vscode and type `> go mod graph`, this extention will draw a graph of the mod dependency.

## For more information

* [go-mod-graph](https://go.dev/ref/mod#go-mod-graph)
* [mermaid-js](https://mermaid-js.github.io/mermaid/#/)
* [d3js](https://d3js.org/)

**Enjoy!**
