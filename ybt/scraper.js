const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://ybt.ssoier.cn:8088";
const USERNAME = "partychen";
const PASSWORD = "1986712";
const OUTPUT_DIR = path.join(__dirname, "output");

// Section 2: 算法提高篇 — group code prefix → group name
const SECTION2_GROUPS = {
  d: "提高(一)基础算法",
  e: "提高(二)字符串算法",
  f: "提高(三)图论",
  g: "提高(四)数据结构",
  h: "提高(五)动态规划",
  i: "提高(六)数学基础",
};

// Section 3: 高手训练
const SECTION3_GROUPS = {
  j: "高手(一)基础算法",
  k: "高手(二)字符串算法",
  l: "高手(三)图论",
  m: "高手(四)数据结构",
  n: "高手(五)动态规划",
  o: "高手(六)数学基础",
};

const CHAPTERS = [
  // Section 2: 算法提高篇
  { section: 2, code: "da", name: "第1章 贪心算法" },
  { section: 2, code: "db", name: "第2章 二分与三分" },
  { section: 2, code: "dc", name: "第3章 深搜的剪枝技巧" },
  { section: 2, code: "dd", name: "第4章 广搜的优化技巧" },
  { section: 2, code: "ea", name: "第1章 哈希和哈希表" },
  { section: 2, code: "eb", name: "第2章 KMP算法" },
  { section: 2, code: "ec", name: "第3章 Trie字典树" },
  { section: 2, code: "ed", name: "第4章 AC自动机" },
  { section: 2, code: "fa", name: "第1章 最小生成树" },
  { section: 2, code: "fb", name: "第2章 最短路问题" },
  { section: 2, code: "fc", name: "第3章 SPFA算法优化" },
  { section: 2, code: "fd", name: "第4章 差分约束系统" },
  { section: 2, code: "fe", name: "第5章 强联通分量" },
  { section: 2, code: "ff", name: "第6章 割点和桥" },
  { section: 2, code: "fg", name: "第7章 欧拉回路" },
  { section: 2, code: "ga", name: "第1章 树状数组" },
  { section: 2, code: "gb", name: "第2章 RMQ问题" },
  { section: 2, code: "gc", name: "第3章 线段树" },
  { section: 2, code: "gd", name: "第4章 倍增求LCA" },
  { section: 2, code: "ge", name: "第5章 树链剖分" },
  { section: 2, code: "gf", name: "第6章 平衡树Treap" },
  { section: 2, code: "ha", name: "第1章 区间类动态规划" },
  { section: 2, code: "hb", name: "第2章 树型动态规划" },
  { section: 2, code: "hc", name: "第3章 数位动态规划" },
  { section: 2, code: "hd", name: "第4章 状态压缩类动态规划" },
  { section: 2, code: "he", name: "第5章 单调队列优化动规" },
  { section: 2, code: "hf", name: "第6章 斜率优化动态规划" },
  { section: 2, code: "ia", name: "第1章 快速幂" },
  { section: 2, code: "ib", name: "第2章 质数" },
  { section: 2, code: "ic", name: "第3章 约数" },
  { section: 2, code: "id", name: "第4章 同余问题" },
  { section: 2, code: "ie", name: "第5章 矩阵乘法" },
  { section: 2, code: "if", name: "第6章 组合数学" },
  { section: 2, code: "ig", name: "第7章 博弈论" },
  // Section 3: 高手训练
  { section: 3, code: "ja", name: "第1章 贪心算法" },
  { section: 3, code: "jb", name: "第2章 二分与三分" },
  { section: 3, code: "jc", name: "第3章 深搜" },
  { section: 3, code: "jd", name: "第4章 广搜" },
  { section: 3, code: "ka", name: "第1章 哈希表" },
  { section: 3, code: "kb", name: "第2章 KMP算法" },
  { section: 3, code: "kc", name: "第3章 Trie树" },
  { section: 3, code: "kd", name: "第4章 AC自动机" },
  { section: 3, code: "la", name: "第1章 最小生成树" },
  { section: 3, code: "lb", name: "第2章 最短路径" },
  { section: 3, code: "lc", name: "第3章 SPFA算法的优化" },
  { section: 3, code: "ld", name: "第4章 差分约束系统" },
  { section: 3, code: "le", name: "第5章 强连通分量" },
  { section: 3, code: "lf", name: "第6章 割点和桥" },
  { section: 3, code: "lg", name: "第7章 欧拉回路" },
  { section: 3, code: "ma", name: "第1章 树状数组" },
  { section: 3, code: "mb", name: "第2章 RMQ问题" },
  { section: 3, code: "mc", name: "第3章 线段树" },
  { section: 3, code: "md", name: "第4章 倍增求LCA" },
  { section: 3, code: "me", name: "第5章 树链剖分" },
  { section: 3, code: "na", name: "第1章 区间类动态规划" },
  { section: 3, code: "nb", name: "第2章 树形动态规划" },
  { section: 3, code: "nc", name: "第3章 数位动态规划" },
  { section: 3, code: "nd", name: "第4章 状态压缩类动态规划" },
  { section: 3, code: "ne", name: "第5章 单调队列优化动规" },
  { section: 3, code: "nf", name: "第6章 斜率优化动态规划" },
  { section: 3, code: "oa", name: "第1章 快速幂矩乘" },
  { section: 3, code: "ob", name: "第2章 素数约数" },
  { section: 3, code: "oc", name: "第3章 同余问题" },
  { section: 3, code: "od", name: "第4章 组合数学" },
  { section: 3, code: "oe", name: "第5章 博弈论" },
];

function getGroupName(section, code) {
  const prefix = code[0];
  if (section === 2) return SECTION2_GROUPS[prefix] || "未知分组";
  if (section === 3) return SECTION3_GROUPS[prefix] || "未知分组";
  return "未知分组";
}

function getSectionName(section) {
  if (section === 2) return "算法提高篇";
  if (section === 3) return "高手训练";
  return "未知";
}

function sanitizeFilename(name) {
  return name.replace(/[\/\\:*?"<>|]/g, "_").replace(/\s+/g, "_");
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function gotoSafe(page, url) {
  await page.goto(url, { timeout: 30000, waitUntil: "domcontentloaded" });
}

async function login(context, page) {
  console.log("Logging in via API...");
  // POST to login.php directly using fetch, then set cookies on the browser context
  const response = await page.request.post(`${BASE_URL}/login.php`, {
    form: { username: USERNAME, password: PASSWORD, login: "登录" },
  });
  // Extract cookies from response
  const cookies = (await context.cookies()).filter(
    (c) => c.name === "username" || c.name === "password" || c.name === "PHPSESSID"
  );
  if (cookies.find((c) => c.name === "username" && c.value === USERNAME)) {
    console.log("Login successful!");
    return true;
  }
  console.log("Login may have failed, continuing anyway...");
  return false;
}

async function getProblemList(page, context, chapter) {
  const cookieVal = `${chapter.section},${chapter.code}`;
  await context.addCookies([{
    name: "xmenu",
    value: cookieVal,
    domain: "ybt.ssoier.cn",
    path: "/",
  }]);
  await gotoSafe(page, `${BASE_URL}/index.php`);
  // Wait for the problem table to appear
  await page.waitForSelector('a[href*="problem_show"]', { timeout: 15000 }).catch(() => {});

  const problems = await page.evaluate(() => {
    const results = [];
    const links = document.querySelectorAll('a[href*="problem_show.php"]');
    const seen = new Set();
    links.forEach((a) => {
      const match = a.href.match(/pid=(\d+)/);
      if (match && !seen.has(match[1])) {
        seen.add(match[1]);
        results.push({
          pid: match[1],
          title: a.textContent.trim(),
          url: a.href,
        });
      }
    });
    // Deduplicate: keep the one with a meaningful title (not just a number)
    const byPid = {};
    results.forEach((r) => {
      if (!byPid[r.pid] || r.title.length > byPid[r.pid].title.length) {
        byPid[r.pid] = r;
      }
    });
    return Object.values(byPid);
  });

  return problems;
}

async function getProblemDetail(page, pid) {
  const url = `${BASE_URL}/problem_show.php?pid=${pid}`;
  await gotoSafe(page, url);
  // Wait for the title h3 to appear
  await page.waitForSelector("h3", { timeout: 10000 }).catch(() => {});

  const detail = await page.evaluate(() => {
    // Extract title
    const h3s = document.querySelectorAll("h3");
    let title = "";
    for (const h3 of h3s) {
      const text = h3.textContent.trim();
      if (text.match(/^\d+/)) {
        title = text;
        break;
      }
    }

    // Extract sections from the content table
    const sections = {};
    let currentSection = null;
    const contentTable = Array.from(document.querySelectorAll("table")).find(
      (t) => t.innerHTML.includes("题目描述")
    );
    if (contentTable) {
      const td = contentTable.querySelector("td");
      if (td) {
        for (const child of td.childNodes) {
          if (child.tagName === "H3") {
            currentSection = child.textContent.trim();
            if (!currentSection.match(/^\d+/)) {
              sections[currentSection] = "";
            }
          } else if (child.tagName === "SCRIPT" && currentSection) {
            const text = child.textContent;
            if (text.includes("pshow")) {
              const match = text.match(/pshow\("((?:[^"\\]|\\.)*)"\)/);
              if (match) {
                sections[currentSection] =
                  (sections[currentSection] || "") + match[1];
              }
            }
          } else if (child.tagName === "PRE" && currentSection) {
            sections[currentSection] =
              (sections[currentSection] || "") + child.textContent.trim();
          }
        }
      }
    }

    // Get time/memory limits
    const bodyText = document.body.innerText;
    const timeMatch = bodyText.match(/时间限制:\s*(\d+)\s*ms/);
    const memMatch = bodyText.match(/内存限制:\s*(\d+)\s*KB/);

    return {
      title,
      timeLimit: timeMatch ? timeMatch[1] + " ms" : "",
      memoryLimit: memMatch ? memMatch[1] + " KB" : "",
      sections,
    };
  });

  return { ...detail, url };
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Block heavy resources and external scripts that slow down page loading
  await page.route("**/*", (route) => {
    const url = route.request().url();
    const resourceType = route.request().resourceType();
    // Block images, fonts, media, stylesheets
    if (["image", "font", "media", "stylesheet"].includes(resourceType)) {
      return route.abort();
    }
    // Block external JS (MathJax CDN, etc.) - only allow scripts from ybt.ssoier.cn
    if (resourceType === "script" && !url.includes("ybt.ssoier.cn")) {
      return route.abort();
    }
    route.continue();
  });

  try {
    await login(context, page);

    for (const sectionNum of [2, 3]) {
      const sectionName = getSectionName(sectionNum);
      const sectionChapters = CHAPTERS.filter(
        (c) => c.section === sectionNum
      );

      const groups = {};
      for (const ch of sectionChapters) {
        const groupName = getGroupName(sectionNum, ch.code);
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(ch);
      }

      console.log(`\n${"=".repeat(60)}`);
      console.log(`Processing: ${sectionName}`);
      console.log(`Groups: ${Object.keys(groups).join(", ")}`);
      console.log(`${"=".repeat(60)}`);

      for (const [groupName, chapters] of Object.entries(groups)) {
        const filename =
          sanitizeFilename(`${sectionName}_${groupName}`) + ".jsonl";
        const filepath = path.join(OUTPUT_DIR, filename);
        const lines = [];

        console.log(`\n  Group: ${groupName}`);

        for (const chapter of chapters) {
          console.log(`    Chapter: ${chapter.name}`);

          const problems = await getProblemList(page, context, chapter);
          console.log(`      Found ${problems.length} problems`);

          for (const problem of problems) {
            try {
              const detail = await getProblemDetail(page, problem.pid);

              let content = "";
              const orderedKeys = [
                "【题目描述】",
                "【输入】",
                "【输出】",
                "【输入样例】",
                "【输出样例】",
              ];
              for (const key of orderedKeys) {
                if (detail.sections[key]) {
                  content += key + "\n" + detail.sections[key] + "\n\n";
                }
              }
              for (const [key, val] of Object.entries(detail.sections)) {
                if (!orderedKeys.includes(key) && val) {
                  content += key + "\n" + val + "\n\n";
                }
              }

              const record = {
                url: detail.url,
                title: detail.title || problem.title,
                content: content.trim(),
                tag: [sectionName, groupName, chapter.name].filter(Boolean),
                pid: problem.pid,
                timeLimit: detail.timeLimit,
                memoryLimit: detail.memoryLimit,
              };

              lines.push(JSON.stringify(record));
              process.stdout.write(".");
            } catch (err) {
              console.error(
                `\n      Error fetching pid=${problem.pid}: ${err.message}`
              );
            }
          }
        }

        fs.writeFileSync(filepath, lines.join("\n") + "\n", "utf-8");
        console.log(`\n    => Saved ${lines.length} problems to ${filename}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log("\nDone!");
}

main().catch(console.error);
