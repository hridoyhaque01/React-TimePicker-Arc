import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { readFileSync } from "fs";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";

const packageJson = JSON.parse(readFileSync("./package.json", "utf8"));

export default [
  // Build with injected CSS (default - automatic styling)
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
      // Inject CSS automatically - no manual import needed
      postcss({
        inject: true,
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
  // Additional build to extract CSS file (for advanced users who want manual control)
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.no-css.esm.js",
      format: "esm",
      sourcemap: true,
      exports: "named",
    },
    plugins: [
      resolve({
        preferBuiltins: false,
      }),
      commonjs(),
      // Extract CSS to separate file
      postcss({
        extract: "TimePicker.css",
        minimize: true,
        sourceMap: false,
        use: ["sass"],
      }),
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: false,
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
