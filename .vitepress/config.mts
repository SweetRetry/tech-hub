import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Retry's Tech Hub",
  description: "持续探索技术本质",

  themeConfig: {
    siteTitle: "🛠️ Retry's Tech Hub",

    nav: [
      {
        text: "语言基石",
        items: [
          { text: "TypeScript", link: "/language/typescript" },
          { text: "SQL", link: "/language/sql" },
        ],
      },
      {
        text: "核心原理",
        items: [
          { text: "多进程结构", link: "/browser/multi-process" },
          { text: "渲染原理", link: "/browser/rendering" },
          { text: "V8机制", link: "/browser/v8" },
          {
            text: "浏览器缓存",
            link: "/browser/cache",
          },
        ],
      },
      {
        text: "工程方法论",
        items: [
          { text: "设计模式", link: "/engineering/patterns" },
          { text: "重构实践", link: "/engineering/refactoring" },
        ],
      },
      {
        text: "网络架构",
        items: [
          { text: "Nginx", link: "/infra/nginx" },
          {
            text: "CDN",
            link: "/infra/cdn",
          },
          { text: "OAuth", link: "/infra/oauth" },
        ],
      },
      {
        text: "技术成长",
        items: [
          { text: "面试题库", link: "/career/interview" },
          { text: "架构设计", link: "/career/architecture" },
        ],
      },
    ],

    sidebar: {
      "/language/": [
        {
          text: "语言基石",
          items: [
            { text: "TypeScript类型系统", link: "/language/typescript" },
            { text: "SQL原理", link: "/language/sql" },
          ],
        },
      ],
      "/browser/": [
        {
          text: "浏览器生态",
          items: [
            { text: "多进程结构", link: "/browser/multi-process" },
            { text: "渲染管线解析", link: "/browser/rendering" },
            { text: "V8执行机制", link: "/browser/v8" },
          ],
        },
      ],
      "/engineering/": [
        {
          text: "工程方法论",
          items: [
            { text: "设计模式实战", link: "/engineering/patterns" },
            { text: "代码重构艺术", link: "/engineering/refactoring" },
          ],
        },
      ],
      "/infra/": [
        {
          text: "服务端架构",
          items: [
            { text: "Nginx配置指南", link: "/infra/nginx" },
            { text: "OAuth协议详解", link: "/infra/oauth" },
          ],
        },
      ],
      "/career/": [
        {
          text: "技术成长",
          items: [
            { text: "面试题库解析", link: "/career/interview" },
            { text: "架构设计实践", link: "/career/architecture" },
          ],
        },
      ],
    },

    socialLinks: [{ icon: "github", link: "https://github.com/your-account" }],

    footer: {
      message: "Keep Coding, Keep Thinking",
      copyright: "Copyright © 2025 Retry",
    },

    // editLink: {
    //   pattern: "https://github.com/your-account/your-repo/edit/main/docs/:path",
    //   text: "在GitHub上编辑此页",
    // },

    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },
  },
});
