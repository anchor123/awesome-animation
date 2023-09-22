import resolve from "@rollup/plugin-node-resolve";
import { spawn } from "child_process";
import ts from "rollup-plugin-typescript2";
import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import clear from "rollup-plugin-clear";
import { terser } from "rollup-plugin-terser";
import livereload from "rollup-plugin-livereload";
import less from "rollup-plugin-less";
import alias from "@rollup/plugin-alias";
import path from "path";
import sveltePreprocess from "svelte-preprocess";

const production = !process.env.ROLLUP_WATCH;

const formats = production
	? ["amd", "amd.min", "cjs", "es", "iife", "iife.min", "umd", "umd.min"]
	: ["iife"];

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = spawn("npm", ["run", "start", "--", "--dev"], {
				stdio: ["ignore", "inherit", "inherit"],
				shell: true,
			});

			process.on("SIGTERM", toExit);
			process.on("exit", toExit);
		},
	};
}

function getCamelCase(str) {
	let arr = str.split("-");
	return arr
		.map((item) => {
			return item.charAt(0).toUpperCase() + item.slice(1);
		})
		.join("");
}

export default {
	input: !production ? "demo/index.ts" : "src/index.ts",
	output: formats.map((format) => {
		return {
			name: getCamelCase(require("./package.json").name),
			file: path.resolve(
				process.cwd(),
				`public/dist/index${
					format.includes("iife") ? format.replace("iife", "") : `.${format}`
				}.js`
			),
			format: format.replace(".min", ""),
			sourcemap: true, // ts中的sourcemap也得变为true
			plugins: format.indexOf(".min") > -1 ? [terser()] : [],
		};
	}),
	plugins: [
		clear({
			targets: ["public/dist"],
		}),
		!production &&
			svelte({
				preprocess: sveltePreprocess({ sourceMap: !production, less: {} }),
				compilerOptions: {
					dev: !production,
				},
			}),
		alias({
			entries: [
				{ find: "src", replacement: path.resolve(process.cwd(), "src") },
			],
		}),
		less({ output: "public/dist/index.css" }),
		resolve({
			browser: true,
			extensions: [".svelte", ".js", ".ts"],
			dedupe: ["svelte"],
			exportConditions: ["svelte"],
		}),
		commonjs(),
		ts({
			tsconfig: path.resolve(process.cwd(), "tsconfig.json"),
		}),
		!production && serve(),
		!production && livereload(),
	],
	watch: {
		clearScreen: false,
	},
};
