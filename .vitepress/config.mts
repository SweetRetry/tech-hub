import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Tech Hub",
  description: "技术知识库",
  themeConfig: {
    sidebar: {
      "/": [
        {
          text: "浏览器原理",
          collapsed: false,
          items: [
            { text: "多进程架构", link: "/browser/multi-process" },
            { text: "渲染机制", link: "/browser/rendering" },
            { text: "工作原理", link: "/browser/working-principle" },
          ],
        },
        {
          text: "工程化实践",
          collapsed: false,
          items: [
            { text: "Monorepo架构", link: "/engineering/monorepo" },
            { text: "设计模式", link: "/engineering/patterns" },
          ],
        },
        {
          text: "基础设施",
          collapsed: false,
          items: [
            { text: "CDN", link: "/infra/cdn" },
            { text: "Nginx配置指南", link: "/infra/nginx" },
            { text: "OAuth认证", link: "/infra/oauth" },
          ],
        },
        {
          text: "编程语言",
          collapsed: false,
          items: [
            { text: "SQL", link: "/language/sql" },
            { text: "TypeScript", link: "/language/typescript" },
          ],
        },
        {
          text: "Web 笔记",
          link: "/web-note",
        },
      ],
    },
    nav: [
      { text: "首页", link: "/" },
      {
        text: "浏览器",
        items: [
          { text: "多进程架构", link: "/browser/multi-process" },
          { text: "渲染机制", link: "/browser/rendering" },
          { text: "工作原理", link: "/browser/working-principle" },
        ],
      },
      {
        text: "工程化",
        items: [
          { text: "Monorepo架构", link: "/engineering/monorepo" },
          { text: "设计模式", link: "/engineering/patterns" },
        ],
      },
      {
        text: "基础设施",
        items: [
          { text: "CDN", link: "/infra/cdn" },
          { text: "Nginx", link: "/infra/nginx" },
          { text: "OAuth", link: "/infra/oauth" },
        ],
      },
      {
        text: "Web 笔记",
        link: "/web-note",
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/your-username/tech-hub" },
    ],
  },
});
