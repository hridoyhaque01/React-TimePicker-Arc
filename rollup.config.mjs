import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";

const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
        exports: "named",
      },
    ],
    plugins: [
      resolve({
        preferBuiltins: false,
      }),
      commonjs(),
      // Extract CSS for manual import
      postcss({
        extract: "TimePicker.css",
        minimize: true,
        sourceMap: false,
        use: ["sass"],
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
        rootDir: "src",
      }),
    ],
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  // Second build with injected CSS for easier consumption
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.with-css.esm.js",
      format: "esm",
      sourcemap: true,
      exports: "named",
    },
    plugins: [
      resolve({
        preferBuiltins: false,
      }),
      commonjs(),
      // Inject CSS for automatic styling
      postcss({
        inject: true,
        minimize: true,
        sourceMap: false,
        use: ["sass"],
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false, // Don't generate declarations for this build
        rootDir: "src",
      }),
    ],
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
    ],
  },
  {
    input: "dist/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
    external: [/\.css$/, "react", "react-dom", "react/jsx-runtime"],
  },
];
