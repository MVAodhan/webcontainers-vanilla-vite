import "./style.css";
import "xterm/css/xterm.css";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

document.querySelector("#app").innerHTML = `
  <div class="container">
    <div class="editor">
      <textarea>I am a textarea</textarea>
    </div>
    <div class="preview">
      <iframe class="output"></iframe>
    </div>
  </div>
  <button class="btn">index.js</button>
  <button class="btn">package.json</button>
  <div class="terminal-container">
  	<div class="terminal"></div>
  </div>
  
`;

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

window.addEventListener("load", async () => {
	textareaEl.value = files["index.js"].file.contents;

	textareaEl.addEventListener("input", () => {
		writeIndexJS(files["index.js"].file.contents);
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
	await webcontainerInstance.fs.writeFile("/index.js", content);
}

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector("iframe");

/** @type {HTMLTextAreaElement | null} */
const textareaEl = document.querySelector("textarea");

/** @type {HTMLTextAreaElement | null} */
const terminalEl = document.querySelector(".terminal");

const btns = document.querySelectorAll(".btn");

btns.forEach((btn) => {
	btn.addEventListener("click", (e) => {
		textareaEl.value = files[e.target.innerHTML].file.contents;
	});
});
