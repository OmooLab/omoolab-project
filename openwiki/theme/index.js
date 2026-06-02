import DefaultTheme from "vitepress/theme-without-fonts";
import { installMermaid } from "v-beautiful-mermaid/client";
import Viewer from "./components/Viewer.vue";
import Layout from "./Layout.vue";
import "v-beautiful-mermaid/style.css";
import "./fonts.css";

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    installMermaid(app);
    app.component("Viewer", Viewer);
  },
};
