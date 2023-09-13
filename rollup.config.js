import { nodeResolve } from "@rollup/plugin-node-resolve";
import ts from "rollup-plugin-typescript2";
import serve from "rollup-plugin-serve";
import clear from "rollup-plugin-clear";
import { terser } from "rollup-plugin-terser";
import path from "path";

const formats = [
	"amd",
	"amd.min",
	"cjs",
	"es",
	"iife",
	"iife.min",
	"umd",
	"umd.min",
];

export default {
	input: "src/index.ts",
	output: formats.map((format) => {
		return {
			name: require("./package.json").name,
			file: path.resolve(
				__dirname,
				`dist/index${
					format.includes("iife") ? format.replace("iife", "") : `.${format}`
				}.js`
			),
			format: format.replace(".min", ""),
			sourcemap: true, // ts中的sourcemap也得变为true
			plugins: format.indexOf(".min") > -1 ? [terser()] : [],
		};
	}),
	plugins: [
		// 这个插件是有执行顺序的
		clear({
			targets: ["dist"],
		}),
		nodeResolve({
			extensions: [".js", ".ts"],
		}),
		ts({
			tsconfig: path.resolve(__dirname, "tsconfig.json"),
		}),
		process.env.NODE_ENV === "development" &&
			serve({
				port: 3000,
				contentBase: "", // 表示起的服务是在根目录下
				openPage: "/public/index.html", // 打开的是哪个文件
				open: true, // 默认打开浏览器
			}),
	].filter(Boolean),
};
