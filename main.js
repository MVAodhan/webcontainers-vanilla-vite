import "./style.css";
import "xterm/css/xterm.css";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

document.querySelector("#app").innerHTML = `
  <div class="container">
    <div class="editor">
      <textarea class='editor-one'>I am a textarea</textarea>
    </div>
    <div class="preview">
      <iframe class="output"></iframe>
    </div>
  </div>
  <div class="terminal-container">
  	<div class="terminal"></div>
  </div>
`;

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

window.addEventListener("load", async () => {
	textareaEl.value = files["index.html"].file.contents;

	textareaEl.addEventListener("input", (e) => {
		writeIndexJS(e.target.value);
	});
	const fitAddon = new FitAddon();
	const terminal = new Terminal({
		convertEol: true,
	});
	terminal.loadAddon(fitAddon);
	terminal.open(terminalEl);
	// Call only once
	webcontainerInstance = await WebContainer.boot();
	await webcontainerInstance.mount(files);

	// Wait for `server-ready` event
	webcontainerInstance.on("server-ready", (port, url) => {
		iframeEl.src = url;
		console.log(url, port);
	});

	const shellProcess = await startShell(terminal);
	window.addEventListener("resize", () => {
		fitAddon.fit();
		shellProcess.resize({
			cols: terminal.cols,
			rows: terminal.rows,
		});
	});
});

/**
 * @param {Terminal} terminal
 */
async function startShell(terminal) {
	const shellProcess = await webcontainerInstance.spawn("jsh", {
		terminal: {
			cols: terminal.cols,
			rows: terminal.rows,
		},
	});
	shellProcess.output.pipeTo(
		new WritableStream({
			write(data) {
				terminal.write(data);
			},
		})
	);
	const input = shellProcess.input.getWriter();
	terminal.onData((data) => {
		input.write(data);
	});

	return shellProcess;
}

/** @param {string} content*/

async function writeIndexJS(content) {
	await webcontainerInstance.fs.writeFile("/index.html", content);
}

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector("iframe");

/** @type {HTMLTextAreaElement | null} */
const textareaEl = document.querySelector(".editor-one");

/** @type {HTMLTextAreaElement | null} */
const textareaElTwo = document.querySelector(".second-editor");

/** @type {HTMLTextAreaElement | null} */
const terminalEl = document.querySelector(".terminal");

const btns = document.querySelectorAll(".btn");
