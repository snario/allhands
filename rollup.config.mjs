import typescript from "rollup-plugin-typescript2";
import cleanup from "rollup-plugin-cleanup";
import license from "rollup-plugin-license";
import json from "@rollup/plugin-json";
import copy from "rollup-plugin-copy";
import packageJson from "./package.json" with { type: "json" };
import graphql from "@rollup/plugin-graphql";

const plugins = [
    graphql(),
    typescript(),
    json(),
    cleanup({ comments: "none", extensions: [".ts"] }),
    license({
        banner: [
            `Name: ${packageJson.name}`,
            `Version: ${packageJson.version}`,
            `Description: ${packageJson.description}`,
            `@see ${packageJson.homepage}`,
        ].join("\n"),
    }),
    copy({
        targets: [{ src: "src/**/*.html", dest: "dist" }],
    }),
];

export default {
    input: "src/index.ts",
    output: {
        file: "dist/index.js",
        format: "esm",
    },
    plugins,
    context: "this",
};
