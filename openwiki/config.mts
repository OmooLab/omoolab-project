import { defineConfig } from "vitepress";
import { vitepressBeautifulMermaid } from "v-beautiful-mermaid";
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";
import { load } from "js-yaml";

const siteConfig = load(
  readFileSync(join(__dirname, "../config.yaml"), "utf8"),
) as {
  title?: string;
  description?: string;
  logo?: string;
  siteTitle?: false;
  appearance?: false;
  nav?: { text: string; link: string }[];
  footer?: { message: string; copyright: string };
};

interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
}

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function buildSidebarTree(root: string, basePath: string = ""): SidebarItem[] {
  const items: SidebarItem[] = [];
  const entries = readdirSync(root);

  // Separate files and directories
  const files: string[] = [];
  const dirs: string[] = [];

  for (const entry of entries) {
    if (entry === "index.md") continue;
    const fullPath = join(root, entry);
    if (isDirectory(fullPath)) {
      dirs.push(entry);
    } else if (entry.endsWith(".md")) {
      files.push(entry);
    }
  }

  // Add files first
  for (const f of files.sort()) {
    const name = f.replace(/\.md$/, "");
    const linkPath = `/${root}/${name}`;
    items.push({
      text: name,
      link: linkPath,
    });
  }

  // Add directories as submenus
  for (const d of dirs.sort()) {
    const subRoot = join(root, d);
    const subBasePath = basePath ? `${basePath}/${d}` : d;
    const subItems = buildSidebarTree(subRoot, subBasePath);
    if (subItems.length > 0) {
      items.push({
        text: d,
        items: subItems,
      });
    }
  }

  return items;
}

function buildSidebarItems(root: string): SidebarItem[] {
  return buildSidebarTree(root);
}

const sidebar = {
  "/": [
    {
      items: [
        {
          text: "主页",
          link: "/",
        },
        {
          text: "概览",
          link: "/overview",
        },
        {
          text: "变更日志",
          link: "/log",
        },
      ],
    },
    {
      items: [{}],
    },
  ],
  "/docs/": [
    {
      text: "记录",
      items: [{}],
    },
    {
      text: "工作空间",
      items: [{}],
    },
  ],
  "/sources/": [
    {
      items: [{}],
    },
  ],
};

sidebar["/docs/"][0].items = buildSidebarItems("docs/notes");
sidebar["/docs/"][1].items = buildSidebarItems("docs/subspaces");
sidebar["/sources/"][0].items = buildSidebarItems("sources");
sidebar["/"][1].items = buildSidebarItems("nodes");

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: siteConfig.title,
  description: siteConfig.description,
  lang: "zh-CN",
  base: "/", // Replace with your repository name if deploying to GitHub Pages
  srcDir: ".",
  ignoreDeadLinks: true,
  appearance: siteConfig.appearance,
  themeConfig: {
    logo: siteConfig.logo,
    siteTitle: siteConfig.siteTitle,
    nav: [
      { text: "知识库", link: "/overview" },
      { text: "资料库", link: "/sources/" },
      { text: "文档", link: "/docs/" },
    ],
    sidebar,
    footer: siteConfig.footer,
    search: {
      provider: "local",
    },
  },
  markdown: {
    config: (md) => {
      md.use(vitepressBeautifulMermaid, {
        colorMode: "auto",
        renderOptions: {
          font: "LXGW WenKai Mono",
        },
      });
    },
  },
});
