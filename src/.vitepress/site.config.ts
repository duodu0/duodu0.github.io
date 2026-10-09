export interface NavItem {
  title: string;
  href?: string;
  children?: NavItem[];
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface MomentConfigInput {
  covers: string[];
  displayName?: string;
  avatar?: string;
  signature?: string;
  momentBatchSize: number;
}

export interface MomentConfig {
  covers: string[];
  displayName: string;
  avatar: string;
  signature: string;
  momentBatchSize: number;
}

export interface GiscusConfig {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: "pathname" | "url" | "title" | "og:title";
  reactionsEnabled: "0" | "1";
  inputPosition: "top" | "bottom";
  lang: string;
}

export function isGiscusConfigured(value: Partial<GiscusConfig> | null | undefined): value is GiscusConfig {
  return Boolean(
    value?.repo &&
    value.repoId &&
    value.category &&
    value.categoryId &&
    value.mapping &&
    value.reactionsEnabled &&
    value.inputPosition &&
    value.lang,
  );
}

function normalizeBase(value: string | undefined) {
  if (!value || value === "/") return "/";
  return `/${value.replace(/^\/+|\/+$/g, "")}/`;
}

export function resolveMomentConfig(
  value: MomentConfigInput,
  author: { name: string; bio: string },
  favicon: string,
): MomentConfig {
  const covers = value.covers.map((cover) => cover.trim());
  if (!covers.length || covers.some((cover) => !cover)) throw new Error("动态页至少需要一张非空封面");
  if (!Number.isInteger(value.momentBatchSize) || value.momentBatchSize <= 0)
    throw new Error("动态页每批数量必须是正整数");
  return {
    covers: [...new Set(covers)],
    displayName: value.displayName?.trim() || author.name,
    avatar: value.avatar?.trim() || favicon,
    signature: value.signature?.trim() || author.bio,
    momentBatchSize: value.momentBatchSize,
  };
}

const serverEnv = typeof process === "undefined" ? undefined : process.env;
const runtimeBase = serverEnv?.SITE_BASE ?? import.meta.env?.BASE_URL;
const author = {
  name: "LittleBee",
  email: "603675760@qq.com",
  bio: "回忆是生命的第五个季节",
};
const favicon = {
  ico: "/favicon.ico",
  png: "/favicon.png",
  svg: "/favicon.svg",
};

export const siteConfig = {
  site: {
    title: "LittleBee Blog",
    name: "LittleBee Blog",
    description: "生活随心记",
    keywords: ["个人博客"],
    url: serverEnv?.SITE_URL?.replace(/\/$/, "") ?? "",
    base: normalizeBase(runtimeBase),
    locale: "zh_CN",
    language: "zh-CN",
    featuredPostsLimit: 5,
    postsPerPage: 10,
    logo: "/favicon.png",
    favicon,
    manifest: "/site.webmanifest",
    feeds: {
      rss: "/rss.xml",
      rssAlias: "/index.xml",
      atom: "/atom.xml",
      json: "/feed.json",
    },
  },
  author,
  moment: resolveMomentConfig(
    {
      covers: [
        "https://cdn.jsdelivr.net/gh/duodu0/picx-ih@master/20261009/微信图片_20261009113544_143_6.9ddqzko897.webp",
        "https://cdn.jsdelivr.net/gh/duodu0/picx-ih@master/20261009/微信图片_20261009113543_142_6.46gy6r4y4.webp",
        "https://cdn.jsdelivr.net/gh/duodu0/picx-ih@master/20261009/微信图片_20261009113541_141_6.7axybipn7y.webp",
      ],
      avatar: "/avatar.jpg",
      signature: "生活不在别处，当下即全部",
      momentBatchSize: 4,
    },
    author,
    favicon.svg,
  ),
  navigation: [
    { title: "文章", href: "/blog" },
    { title: "动态", href: "/moment" },
    {
      title: "浏览",
      children: [
        { title: "使用手册", href: "/blog/guide/getting-started" },
        { title: "标签", href: "/tags" },
        { title: "归档", href: "/archives" },
      ],
    },
  ] satisfies NavItem[],
  homeSocials: [{ label: "Email", href: "mailto:603675760@qq.com" }] satisfies SocialLink[],
  giscus: null as GiscusConfig | null,
};

export function requireSiteUrl() {
  if (!siteConfig.site.url) {
    throw new Error("生产构建需要 SITE_URL，例如：$env:SITE_URL='https://blog.example.com'; pnpm build");
  }
  return siteConfig.site.url;
}

export function withBasePath(path: string) {
  if (/^(?:[a-z]+:)?\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return `${siteConfig.site.base}${normalized}`.replace(/\/+/g, "/");
}
