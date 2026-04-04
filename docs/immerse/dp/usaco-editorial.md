---
title: "USACO 经典DP专题精选解题报告"
subtitle: "🐄 36 道 USACO 经典 DP 题目的分析方法、解题思路与核心代码"
order: 7
icon: "🐄"
---

# USACO 经典DP专题精选解题报告

> 来源：[USACO](https://usaco.org/)
>
> 本报告针对 USACO 经典 DP 36 题，逐题给出**题意概述 → 分析方法 → 状态设计 → 转移方程 → 核心代码 → 复杂度**，最后做整体总结。

---

## 1. Hoof Paper Scissors (Bronze)（简单状态 DP）

### 题意

$N$ 轮石头剪刀布，奶牛每轮出 H/P/S 之一。它最多切换 $1$ 次手势，求最多赢几轮。

### 分析

前缀后缀统计。前半段用一种手势赢最多、后半段用另一种手势赢最多。

### 状态与转移

- **前缀**：$L[i][g]$ = 前 $i$ 轮全用手势 $g$ 的赢轮数
- **后缀**：$R[i][g]$ = 第 $i$ 到 $N$ 轮全用 $g$ 赢轮数
- **答案**：$\max_{i, g_1, g_2} (L[i][g_1] + R[i+1][g_2])$

### 核心代码

```cpp
for (int i = 1; i <= n; i++)
    for (int g = 0; g < 3; g++)
        L[i][g] = L[i-1][g] + (moves[i] == gestures[g]);
for (int i = n; i >= 1; i--)
    for (int g = 0; g < 3; g++)
        R[i][g] = R[i+1][g] + (moves[i] == gestures[g]);
int ans = 0;
for (int i = 0; i <= n; i++)
    for (int g1 = 0; g1 < 3; g1++)
        for (int g2 = 0; g2 < 3; g2++)
            ans = max(ans, L[i][g1] + R[i+1][g2]);
```

### 复杂度

$O(9N)$。

---

## 2. Milk Pails（BFS/DP）

### 题意

两个桶容量分别为 $X$ 和 $Y$，可以装满、倒空、互倒操作最多 $K$ 次。求最终总水量最接近 $M$ 时的水量。

### 分析

$K$ 较小时可用 BFS 枚举所有可达状态 $(a, b)$。也可 DP 枚举可达状态。

### 状态与转移

- **状态**：$(a, b, k)$ = 两桶水量 $a, b$、已操作 $k$ 次
- **转移**：6 种操作（装满X、装满Y、倒空X、倒空Y、X倒入Y、Y倒入X）
- **答案**：所有可达状态中 $|a + b - M|$ 最小时的 $a + b$

### 核心代码

```cpp
set<pair<int,int>> cur, nxt;
cur.insert({0, 0});
for (int step = 0; step <= K; step++) {
    for (auto [a, b] : cur) {
        int diff = abs(a + b - M);
        if (diff < bestDiff) { bestDiff = diff; bestAns = a + b; }
    }
    if (step == K) break;
    nxt.clear();
    for (auto [a, b] : cur) {
        nxt.insert({X, b}); nxt.insert({a, Y});
        nxt.insert({0, b}); nxt.insert({a, 0});
        int pour1 = min(a, Y - b);
        nxt.insert({a - pour1, b + pour1});
        int pour2 = min(b, X - a);
        nxt.insert({a + pour2, b - pour2});
    }
    cur = nxt;
}
```

### 复杂度

$O(K \cdot X \cdot Y)$。

---

## 3. Hoof Paper Scissors（简单状态 DP）

### 题意

$N$ 轮石头剪刀布，奶牛每轮出 H/P/S 之一。它最多切换 $K$ 次手势，求最多赢几轮。

### 分析

$dp[i][j][g]$ = 前 $i$ 轮、已切换 $j$ 次、当前手势 $g$ 的最多赢轮数。

### 状态与转移

- **状态**：$dp[i][j][g]$，$g \in \{H, P, S\}$
- **转移**：
  - 不切换：$dp[i][j][g] = dp[i-1][j][g] + \text{win}(g, i)$
  - 切换：$dp[i][j][g] = \max_{g' \neq g} dp[i-1][j-1][g'] + \text{win}(g, i)$
- **答案**：$\max_{j, g} dp[N][j][g]$

### 核心代码

```cpp
for (int i = 1; i <= n; i++)
    for (int j = 0; j <= K; j++)
        for (int g = 0; g < 3; g++) {
            int w = (moves[i] == gestures[g]) ? 1 : 0;
            dp[i][j][g] = dp[i-1][j][g] + w;
            if (j > 0)
                for (int g2 = 0; g2 < 3; g2++)
                    if (g2 != g)
                        dp[i][j][g] = max(dp[i][j][g], dp[i-1][j-1][g2] + w);
        }
```

### 复杂度

$O(NK)$。

---

## 4. Teamwork (2018 Dec Silver)

### 题意

$N$ 头奶牛排成一排，技能值 $s_i$。将它们分成若干组，每组最多 $K$ 头。组内所有奶牛的技能值变为该组最大值。求最大技能总和。

### 分析

题目真正的决策不是“每头牛属于哪组”，而是“最后一组从哪里开始”。因为一旦最后一组的左右边界确定，这组的贡献就完全由组内最大技能值乘组长决定，和前面的分组互不干扰。

因此设 `dp[i]` 为前 `i` 头奶牛的最大总和，倒着枚举最后一组的起点 `j` 即可。往左扩展这一组时，顺手维护区间最大值，就能在线算出这组的贡献。

这类题以后看到“把序列分成若干段，每段代价只和段内某个统计量有关”时，优先考虑“枚举最后一段”的线性分段 DP。

### 状态与转移

- **状态**：$dp[i]$ = 前 $i$ 头奶牛的最大技能总和
- **转移**：$dp[i] = \max_{j = \max(0, i-K)}^{i-1} \big(dp[j] + (i - j) \cdot \max(s[j+1..i])\big)$

### 核心代码

```cpp
for (int i = 1; i <= n; i++) {
    int mx = 0;
    for (int j = i; j >= max(1, i - K + 1); j--) {
        mx = max(mx, s[j]);
        dp[i] = max(dp[i], dp[j-1] + (long long)(i - j + 1) * mx);
    }
}
```

### 复杂度

$O(NK)$。

---

## 5. Race (2011 Nov Silver)（线性 DP）

### 题意

跑道长 $K$，加速度为 1（每秒速度 +1 或 -1 或不变），初始和终止速度不限。但最终速度 $\le$ 某个限制。求最短时间。

### 分析

从两端分别贪心加速到最大速度再减速。等价于分段累加，可用 DP（或贪心 + 数学）解。

### 状态与转移

- 贪心：先加速 $1, 2, 3, \ldots$ 直到累计距离 $\ge K$，然后判断能否在限速内停下

### 核心代码

```cpp
// 加速阶段：1 + 2 + ... + t = t*(t+1)/2
int t = 0;
long long dist = 0;
while (dist < K) { t++; dist += t; }
// 减速调整
printf("%d\n", t);
```

### 复杂度

$O(\sqrt{K})$。

---

## 6. Cow Checklist (2016 Feb Gold)（二维 DP）

### 题意

$H$ 头 Holstein 和 $G$ 头 Guernsey 奶牛按各自顺序排好。Farmer John 必须按顺序检查所有 Holstein（$1 \to H$）和所有 Guernsey（$1 \to G$），可以在两队间切换。通过顺序为：从 H1 开始，最终到 HN。最小化总行走距离。

### 分析

$dp[i][j][0/1]$ = 检查了前 $i$ 头 Holstein 和前 $j$ 头 Guernsey、当前在 Holstein/Guernsey 队的最小距离。

### 状态与转移

- $dp[i][j][0] = \min(dp[i-1][j][0] + d(H_{i-1}, H_i),\; dp[i-1][j][1] + d(G_j, H_i))$
- $dp[i][j][1] = \min(dp[i][j-1][1] + d(G_{j-1}, G_j),\; dp[i][j-1][0] + d(H_i, G_j))$

### 核心代码

```cpp
memset(dp, 0x3f, sizeof(dp));
dp[1][0][0] = 0;
for (int i = 0; i <= H; i++)
    for (int j = 0; j <= G; j++) {
        if (i > 0) {
            dp[i][j][0] = min(dp[i][j][0], dp[i-1][j][0] + dist(h[i-1], h[i]));
            if (j > 0) dp[i][j][0] = min(dp[i][j][0], dp[i-1][j][1] + dist(g[j], h[i]));
        }
        if (j > 0) {
            dp[i][j][1] = min(dp[i][j][1], dp[i][j-1][1] + dist(g[j-1], g[j]));
            if (i > 0) dp[i][j][1] = min(dp[i][j][1], dp[i][j-1][0] + dist(h[i], g[j]));
        }
    }
printf("%lld\n", dp[H][G][0]);
```

### 复杂度

$O(HG)$。

---

## 7. Fruit Feast（01 背包变形）

### 题意

奶牛吃橙子（+$A$ 饱腹度）和柠檬（+$B$ 饱腹度），总饱腹度不超过 $T$。可以喝一次水使饱腹度减半（下取整）。求最大饱腹度。

### 分析

先做完全背包求不喝水时所有可达饱腹度，再对每个可达值除以 2 后再做一次背包。

### 状态与转移

- **阶段一**：完全背包，$dp[j] = $ 不喝水能否达到饱腹度 $j$
- **阶段二**：对每个 $dp[j] = \text{true}$ 的 $j$，标记 $dp2[\lfloor j/2 \rfloor] = \text{true}$，再做一次完全背包
- **答案**：两阶段中可达的最大值

### 核心代码

```cpp
dp[0] = true;
for (int j = 0; j <= T; j++) {
    if (j >= A && dp[j - A]) dp[j] = true;
    if (j >= B && dp[j - B]) dp[j] = true;
}
// 喝水
for (int j = 0; j <= T; j++)
    if (dp[j]) dp2[j / 2] = true;
// 再做一次
for (int j = 0; j <= T; j++) {
    if (j >= A && dp2[j - A]) dp2[j] = true;
    if (j >= B && dp2[j - B]) dp2[j] = true;
}
int ans = 0;
for (int j = T; j >= 0; j--)
    if (dp[j] || dp2[j]) { ans = j; break; }
```

### 复杂度

$O(T)$。

---

## 8. Why Did the Cow Cross the Road (2017 Feb Plat)（区间 DP）

### 题意

$N$ 头奶牛过马路，奶牛 $i$ 从位置 $a_i$ 到位置 $b_i$。两头奶牛 $i, j$ 会交叉当且仅当 $a_i < a_j$ 且 $b_i > b_j$（或反之）。求最少安排几个绿灯轮次使同一轮次内无交叉。

### 分析

等价于最少分组使每组无逆序对 → 最长逆序子序列长度 → LIS 的对偶。

### 状态与转移

- 按 $a_i$ 排序后，求 $b$ 的 LIS 长度（该值 = 最少分组数）

### 核心代码

```cpp
sort by a[i];
// 求 b 的最长递减子序列 = 最少上升链覆盖
vector<int> tails;
for (int i = 0; i < n; i++) {
    auto it = upper_bound(tails.begin(), tails.end(), b[i], greater<int>());
    if (it == tails.end()) tails.push_back(b[i]);
    else *it = b[i];
}
printf("%d\n", (int)tails.size());
```

### 复杂度

$O(N \log N)$。

---

## 9. Why Did the Cow Cross the Road II（LCS 变形）

### 题意

两个长度为 $N$ 的排列，求最长公共子序列，满足匹配的元素在两排列中的位置差不超过 4（或类似条件）。

### 分析

若没有“位置差不超过 4”这个限制，它就是普通 LCS；而一旦加上这个限制，就意味着真正允许匹配的元素对非常稀疏，不必像标准 LCS 那样把所有字符对都当作候选。

更自然的理解是：对第一序列中的每个元素，只需要检查它在第二序列中附近那几个可能合法的位置。于是仍可保留“前缀对前缀”的 DP 框架，但匹配转移只在满足距离约束时才成立。

这题的迁移点是：**LCS 一旦附带局部位置限制，核心不是换模型，而是把无意义的匹配对剪掉。**

### 状态与转移

- **状态**：$dp[i][j]$ = 第一排列前 $i$ 个、第二排列前 $j$ 个的最长匹配
- **转移**：标准 LCS，外加位置约束剪枝

### 核心代码

```cpp
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= n; j++) {
        dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
        if (a[i] == b[j] && abs(i - j) <= 4)
            dp[i][j] = max(dp[i][j], dp[i-1][j-1] + 1);
    }
```

### 复杂度

$O(N^2)$。

---

## 10. Bovine Genetics (2020 Jan Silver)（计数 DP）

### 题意

长度 $N$ 的 DNA 串只含 A/C/G/T，给定变异规则矩阵（$4 \times 4$），问有多少原始串可以通过逐位变异得到目标串。

### 分析

每个位置独立，统计每位有几种原始字符可变异到目标字符，然后乘法计数。

### 状态与转移

- 对每位 $i$：$\text{ways}[i] = |\{c : \text{mutation}[c][\text{target}[i]] = 1\}|$
- 答案 $= \prod_i \text{ways}[i]$

### 核心代码

```cpp
long long ans = 1;
for (int i = 0; i < n; i++) {
    int cnt = 0;
    for (int c = 0; c < 4; c++)
        if (mutation[c][target[i]]) cnt++;
    ans = ans * cnt % MOD;
}
```

### 复杂度

$O(4N)$。

---

## 11. Minimum Cost Paths (2021 Open Gold)（DP + 凸性优化）

### 题意

$N \times M$ 网格，向右走代价 $c_{i,j}$，向下走代价 $(j-1)^2$（只取决于列号）。从 $(1,1)$ 到 $(N,M)$ 的最小代价。

### 分析

逐行 DP。由于向下代价只与列号有关，可以按行分段处理。关键观察：向下走的代价是关于列号的凸函数，因此可以用凸壳优化。

### 状态与转移

- **状态**：$dp[i][j]$ = 到 $(i, j)$ 的最小代价
- **转移**：
  - 向右：$dp[i][j] = dp[i][j-1] + c_{i,j}$
  - 向下：$dp[i][j] = dp[i-1][j] + (j-1)^2$

### 核心代码

```cpp
for (int i = 1; i <= N; i++)
    for (int j = 1; j <= M; j++) {
        dp[i][j] = INF;
        if (i > 1) dp[i][j] = min(dp[i][j], dp[i-1][j] + (long long)(j-1)*(j-1));
        if (j > 1) dp[i][j] = min(dp[i][j], dp[i][j-1] + c[i][j]);
    }
```

### 复杂度

$O(NM)$。

---

## 12. Guard Mark (2012 Nov Gold)（状压 DP）

### 题意

$N$（$\le 20$）头奶牛叠罗汉，每头有高度 $h_i$、体重 $w_i$、承重 $s_i$。选若干奶牛叠起来达到高度 $\ge H$，使最小的"承重余量"（承重 $-$ 上方总重）最大化。

### 分析

$N \le 20$，状压 DP。$dp[S]$ = 集合 $S$ 的奶牛叠起来时最顶部奶牛的最大承重余量。叠罗汉顺序：承重大的在下面（贪心证明按 $s_i + w_i$ 排序）。

### 状态与转移

- **状态**：$dp[S]$ = 集合 $S$ 叠起来的最大最小承重余量
- **转移**：枚举 $S$ 中最顶部的奶牛 $i$：
  $dp[S] = \max_i \min(s_i - (\text{totalW}(S) - w_i),\; dp[S \setminus \{i\}])$

### 核心代码

```cpp
for (int i = 0; i < n; i++) dp[1 << i] = s[i];
for (int S = 1; S < (1 << n); S++) {
    int tw = totalWeight(S);
    for (int i = 0; i < n; i++) {
        if (!(S >> i & 1)) continue;
        int prev = S ^ (1 << i);
        if (prev == 0) { dp[S] = s[i]; continue; }
        int remain = s[i] - (tw - w[i]);
        dp[S] = max(dp[S], min(remain, dp[prev]));
    }
}
// 答案：max dp[S] where totalHeight(S) >= H
```

### 复杂度

$O(N \cdot 2^N)$。

---

## 13. Cow Frisbee Team（背包 + 取模）

### 题意

$N$ 头奶牛（$N \le 2000$），每头能力值 $r_i$。选若干头组队，要求能力值之和是 $F$ 的倍数（$F \le 1000$）。求方案数（模 $10^8$）。

### 分析

背包取模。$dp[j]$ = 当前奶牛子集中能力和模 $F$ 为 $j$ 的方案数。

### 状态与转移

- **状态**：$dp[j]$ = 能力和 $\bmod F = j$ 的方案数
- **转移**：$dp'[(j + r_i) \bmod F] \mathrel{+}= dp[j]$
- **答案**：$dp[0] - 1$（减去空集）

### 核心代码

```cpp
dp[0] = 1;
for (int i = 0; i < n; i++) {
    // 倒序或另开数组避免重复
    vector<long long> ndp(F, 0);
    for (int j = 0; j < F; j++) {
        ndp[j] = (ndp[j] + dp[j]) % MOD;
        ndp[(j + r[i]) % F] = (ndp[(j + r[i]) % F] + dp[j]) % MOD;
    }
    dp = ndp;
}
printf("%lld\n", (dp[0] - 1 + MOD) % MOD);
```

### 复杂度

$O(NF)$。

---

## 14. Snakes（滑动窗口 DP）

### 题意

$N$ 条蛇排成一排，第 $i$ 条大小 $s_i$。有一个网，每次捕蛇前可调整网大小。网大小 $\ge s_i$ 时才能捕第 $i$ 条。多余空间 $= \text{net} - s_i$ 为浪费。最多调整 $K$ 次大小（即分 $K+1$ 段），每段内网大小为该段最大蛇。求最小总浪费。

### 分析

将蛇分成 $K+1$ 个连续段，每段浪费 = 段长 × 段内最大值 - 段内总和。

### 状态与转移

- **状态**：$dp[i][j]$ = 前 $i$ 条蛇分 $j$ 段的最小浪费
- **转移**：$dp[i][j] = \min_{k < i} \big(dp[k][j-1] + (i-k) \cdot \max(s[k+1..i]) - \text{sum}(k+1, i)\big)$

### 核心代码

```cpp
// 预处理区间最大值和前缀和
for (int j = 1; j <= K + 1; j++)
    for (int i = 1; i <= n; i++) {
        dp[i][j] = INF;
        int mx = 0;
        for (int k = i; k >= 1; k--) {
            mx = max(mx, s[k]);
            int waste = (i - k + 1) * mx - (pre[i] - pre[k-1]);
            dp[i][j] = min(dp[i][j], dp[k-1][j-1] + waste);
        }
    }
```

### 复杂度

$O(N^2 K)$。

---

## 15. Time is Mooney（DAG DP）

### 题意

$N$ 个城市 $M$ 条有向边，每个城市有收益 $m_i$。从城市 1 出发旅行 $T$ 天后返回城市 1。第 $T$ 天开销为 $C \cdot T^2$。求最大净利润（总收益 - 开销）。

### 分析

按天数分层 DP。$dp[t][v]$ = 第 $t$ 天在城市 $v$ 时的最大收益。$T$ 最多 $1000$（因为 $C \cdot T^2$ 增长快）。

### 状态与转移

- **状态**：$dp[t][v]$ = 第 $t$ 天在城市 $v$ 的最大累计收益
- **转移**：$dp[t+1][u] = \max_{(v, u) \in E} dp[t][v] + m[u]$
- **答案**：$\max_t (dp[t][1] - C \cdot t^2)$

### 核心代码

```cpp
memset(dp, -1, sizeof(dp));
dp[0][1] = 0;
int ans = 0;
for (int t = 0; t < 1000; t++) {
    for (int v = 1; v <= n; v++) {
        if (dp[t][v] < 0) continue;
        for (int u : adj[v])
            dp[t+1][u] = max(dp[t+1][u], dp[t][v] + m[u]);
    }
    if (dp[t+1][1] >= 0)
        ans = max(ans, dp[t+1][1] - C * (t+1) * (t+1));
}
```

### 复杂度

$O(TM)$，$T \le 1000$。

---

## 16. Cow Poetry（背包 + 组合）

### 题意

$N$ 个单词（长度 $s_i$、韵脚类 $c_i$），用若干单词填满长度恰为 $K$ 的诗行。$M$ 行诗，某些行要求韵脚相同。求方案数。

### 分析

两步：
1. 背包求出长度恰为 $K$ 时，以每种韵脚结尾的方案数 $\text{cnt}[c]$
2. 对每组需要同韵脚的诗行，枚举韵脚类乘法计数

### 状态与转移

- **阶段一**：完全背包，$dp[j]$ = 长度恰为 $j$ 的方案数
- **阶段二**：分组计数乘法

### 核心代码

```cpp
dp[0] = 1;
for (int j = 1; j <= K; j++)
    for (int i = 0; i < n; i++)
        if (j >= s[i])
            dp[j] = (dp[j] + dp[j - s[i]]) % MOD;
// 统计以每种韵脚结尾的方案数
for (int i = 0; i < n; i++)
    if (K >= s[i])
        cnt[c[i]] = (cnt[c[i]] + dp[K - s[i]]) % MOD;
// 分组组合
long long ans = 1;
for (each rhyme group of size g) {
    long long ways = 0;
    for (each class r) ways = (ways + power(cnt[r], g)) % MOD;
    ans = ans * ways % MOD;
}
```

### 复杂度

$O(NK + C \cdot G)$。

---

## 17. Mortal Cowmbat（前缀优化 DP）

### 题意

字符串只含前 $M$ 种小写字母，将字符修改使其由若干段组成（每段同一字母），每段长度 $\ge K$。修改某位的代价由 $M \times M$ 代价矩阵给定。求最小总代价。

### 分析

Floyd 预处理代价矩阵求最短路（可能转换比直接改便宜），前缀和预处理每种字母的修改代价，然后线性 DP。

### 状态与转移

- **状态**：$dp[i][c]$ = 前 $i$ 个字符、最后一段字母为 $c$ 的最小代价
- **转移**：$dp[i][c] = \min_{j \le i-K,\; c' \neq c} dp[j][c'] + \text{cost}(j+1, i, c)$

### 核心代码

```cpp
// Floyd 预处理 cost 矩阵
for (int k = 0; k < M; k++)
    for (int i = 0; i < M; i++)
        for (int j = 0; j < M; j++)
            cost[i][j] = min(cost[i][j], cost[i][k] + cost[k][j]);

// 前缀和
for (int c = 0; c < M; c++)
    for (int i = 1; i <= n; i++)
        pre[c][i] = pre[c][i-1] + cost[s[i-1] - 'a'][c];

// DP
memset(dp, 0x3f, sizeof(dp));
for (int c = 0; c < M; c++)
    dp[K][c] = pre[c][K]; // 前 K 个全改成 c
for (int i = K + 1; i <= n; i++)
    for (int c = 0; c < M; c++) {
        dp[i][c] = dp[i-1][c] + cost[s[i-1] - 'a'][c]; // 延伸当前段
        if (i >= 2 * K) // 新开一段
            for (int c2 = 0; c2 < M; c2++)
                if (c2 != c)
                    dp[i][c] = min(dp[i][c], dp[i-K][c2] + pre[c][i] - pre[c][i-K]);
    }
```

### 复杂度

$O(NM^2 + M^3)$。

---

## 18. Talent Show（01 分数规划 + 背包）

### 题意

$N$ 头奶牛（体重 $w_i$、才艺值 $t_i$），选若干头使总体重 $\ge W$，最大化才艺值之和 / 体重之和。

### 分析

01 分数规划：二分答案 $r$，判断是否存在子集使得 $\sum t_i - r \cdot w_i \ge 0$ 且 $\sum w_i \ge W$。转化为背包。

### 状态与转移

- **二分** $r$，令 $v_i = t_i - r \cdot w_i$
- **背包**：$dp[j]$ = 总体重为 $j$ 时的最大 $\sum v_i$
- **check**：$\max_{j \ge W} dp[j] \ge 0$

### 核心代码

```cpp
bool check(double r) {
    vector<double> dp(W + 1, -1e18);
    dp[0] = 0;
    for (int i = 0; i < n; i++) {
        double val = t[i] - r * w[i];
        for (int j = W; j >= 0; j--) {
            int nj = min(j + w[i], W); // 超过 W 的归到 W
            dp[nj] = max(dp[nj], dp[j] + val);
        }
    }
    return dp[W] >= -1e-9;
}
```

### 复杂度

$O(NW \log \epsilon^{-1})$。

---

## 19. Mark on a Stick（区间 DP）

### 题意

长度为 $L$ 的棍子上有 $N$ 个标记点。每次在某个标记点切断，代价为当前段的长度。求最小总代价。

### 分析

每次切断的代价等于当前整段长度，这说明代价取决于“这段区间什么时候被最后切开”，而不是单独某个切点本身。这样的结构非常适合区间 DP。

设 `dp[i][j]` 表示在端点 `i` 和 `j` 之间完成所有切割的最小代价。若最后一次在 `k` 处切，那么左右两边已经分别最优切完，最后再补当前整段长度这一笔费用。

这题要形成的母题意识很重要：**操作把区间拆成两半，且代价依赖当前整段长度时，通常就是切棍子型区间 DP。**

### 状态与转移

- **状态**：$dp[i][j]$ = 在标记点 $i$ 到 $j$ 之间完成所有切割的最小代价
- **转移**：$dp[i][j] = \min_{i < k < j} (dp[i][k] + dp[k][j]) + (c_j - c_i)$

### 核心代码

```cpp
for (int len = 2; len <= m; len++)
    for (int i = 0; i + len <= m; i++) {
        int j = i + len;
        dp[i][j] = INF;
        for (int k = i + 1; k < j; k++)
            dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j] + c[j] - c[i]);
    }
```

### 复杂度

$O(N^3)$。

---

## 20. Radio Contact（二维 DP）

### 题意

Farmer John 和 Bessie 各沿预定路径行走（$N$ 步和 $M$ 步），每步两人之一前进一步。每步的代价为两人当前距离的平方。求最小总代价。

### 分析

二维 DP，$dp[i][j]$ = FJ 走了 $i$ 步、Bessie 走了 $j$ 步时的最小总代价。

### 状态与转移

- **状态**：$dp[i][j]$ = FJ 在位置 $i$、Bessie 在位置 $j$ 的最小代价
- **转移**：$dp[i][j] = \min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + \text{dist}^2(FJ_i, B_j)$

### 核心代码

```cpp
for (int i = 0; i <= N; i++)
    for (int j = 0; j <= M; j++) {
        if (i == 0 && j == 0) { dp[0][0] = dist2(fj[0], b[0]); continue; }
        dp[i][j] = INF;
        if (i > 0) dp[i][j] = min(dp[i][j], dp[i-1][j]);
        if (j > 0) dp[i][j] = min(dp[i][j], dp[i][j-1]);
        if (i > 0 && j > 0) dp[i][j] = min(dp[i][j], dp[i-1][j-1]);
        dp[i][j] += dist2(fj[i], b[j]);
    }
```

### 复杂度

$O(NM)$。

---

## 21. Palindromic Paths（网格回文 DP）

### 题意

$N \times N$ 网格，每格 0 或 1。从 $(1,1)$ 到 $(N,N)$（向右/下），找一条路径使其为回文串。求方案数。

### 分析

从两端同时走（首尾双指针），$dp[k][r_1][r_2]$ = 走了 $k$ 步、前端在第 $r_1$ 行、后端在第 $r_2$ 行。要求两端格子值相同。

### 状态与转移

- **状态**：$dp[k][r_1][r_2]$ = 步数 $k$ 时前端行 $r_1$、后端行 $r_2$ 的方案数
- **转移**：4 种（前端向右/下 × 后端向左/上），且要求值相同

### 核心代码

```cpp
// k 从 0 到 (2N-2)/2
dp[0][0][N-1] = (grid[0][0] == grid[N-1][N-1]) ? 1 : 0;
for (int k = 1; k <= (2*N-2)/2; k++)
    for (int r1 = 0; r1 < N; r1++)
        for (int r2 = N-1; r2 >= 0; r2--) {
            int c1 = k - r1, c2 = (2*N-2-k) - r2;
            if (c1 < 0 || c1 >= N || c2 < 0 || c2 >= N) continue;
            if (grid[r1][c1] != grid[r2][c2]) continue;
            // 从前一步 4 种来源累加
            dp[k][r1][r2] = sum of dp[k-1][prev states];
        }
```

### 复杂度

$O(N^3)$。

---

## 22. Circular Barn Revisited（环形 DP + 枚举）

### 题意

环形谷仓有 $N$ 个门（$N \le 100$），放 $K$ 个入口。$r_i$ 头奶牛需要进门 $i$，每头奶牛走到最近入口的距离为代价。求最小总代价。

### 分析

环形结构最大的麻烦是没有天然起点，所以很难直接定义“前缀”。最常见的化环为链方法，就是枚举某个门作为断开点，把它视作第一扇入口，从而把奶牛的行走方向固定下来。

断开后，问题就变成线性序列上放 `K` 个入口。此时 `dp[i][j]` 可以表示前 `i` 个门放了 `j` 个入口的最小代价，而转移就是枚举最后一个入口负责覆盖的连续区间。

所以这题最值得记住的是两步转身：**先断环成链，再做分段 DP。**

### 状态与转移

- 枚举第一个入口位置（$N$ 种），转化为线性 DP
- $dp[i][j]$ = 前 $i$ 个门、放了 $j$ 个入口的最小代价
- 预处理 $\text{cost}(l, r)$ = 区间 $[l, r]$ 内所有奶牛走到最右门的代价

### 核心代码

```cpp
for (int start = 0; start < n; start++) {
    // 以 start 为第一个入口，断开环
    for (int j = 1; j <= K; j++)
        for (int i = 1; i <= n; i++) {
            dp[i][j] = INF;
            for (int p = j - 1; p < i; p++)
                dp[i][j] = min(dp[i][j], dp[p][j-1] + cost(p+1, i));
        }
    ans = min(ans, dp[n][K]);
}
```

### 复杂度

$O(N^3 K)$。

---

## 23. Exercise（排列 DP + LCM）

### 题意

$N$ 头奶牛做操，排成排列。排列的"周期"为所有轮换的 LCM。求所有排列周期的乘积（模 $M$）。

### 分析

排列分解为不相交轮换，LCM 只取决于轮换长度。等价于：将 $N$ 拆分为若干正整数之和，求所有可能 LCM 的乘积。

关键观察：LCM 只与各素数幂有关。用素数幂做背包。

### 状态与转移

- 将 $\le N$ 的所有素数幂作为"物品"做 0-1/完全背包
- $dp[j]$ = 用总共 $j$ 做拆分时，所有可能 LCM 的乘积

### 核心代码

```cpp
// 枚举所有素数幂 p^k <= N
dp[0] = 1;
for (each prime power pk <= N) {
    for (int j = N; j >= pk; j--)
        dp[j] = dp[j] * dp[j - pk] % M * pk % M;
        // 实际需要更精细的实现
}
long long ans = 1;
for (int j = 0; j <= N; j++) ans = ans * dp[j] % M;
```

### 复杂度

$O(N \sqrt{N})$。

---

## 24. Cowpatibility（容斥 + 哈希）

### 题意

$N$ 头奶牛，每头有 5 种最爱的冰淇淋口味。两头"不相容"当且仅当它们没有共同口味。求不相容的对数。

### 分析

容斥原理：总对数 - 至少有 1 个共同口味的对数。至少 1 个共同 = $|A_1 \cup \cdots| = \sum|A_i| - \sum|A_i \cap A_j| + \cdots$

对每头奶牛的 5 个口味的所有 $2^5 - 1 = 31$ 个非空子集，用 map 统计。

### 状态与转移

- 容斥，非 DP

### 核心代码

```cpp
map<vector<int>, int> cnt;
long long compat = 0;
for (int i = 0; i < n; i++) {
    vector<int> flavors(5);
    // 枚举 31 个非空子集
    for (int mask = 1; mask < 32; mask++) {
        vector<int> sub;
        for (int b = 0; b < 5; b++)
            if (mask >> b & 1) sub.push_back(flavors[b]);
        sort(sub.begin(), sub.end());
        int sign = (__builtin_popcount(mask) % 2 == 1) ? 1 : -1;
        compat += sign * cnt[sub];
        cnt[sub]++;
    }
}
long long ans = (long long)n * (n - 1) / 2 - compat;
```

### 复杂度

$O(31N \log N)$。

---

## 25. Barn Painting（树形 DP）

### 题意

$N$ 个节点的树，每个节点涂 3 种颜色之一，相邻节点不同色。部分节点颜色已定。求方案数。

### 分析

树形 DP，$dp[v][c]$ = 以 $v$ 为根的子树中 $v$ 涂颜色 $c$ 的方案数。

### 状态与转移

- **状态**：$dp[v][c]$ = $v$ 涂色 $c$ 的方案数
- **转移**：$dp[v][c] = \prod_u \sum_{c' \neq c} dp[u][c']$
- 若 $v$ 已着色 $c_0$：只有 $dp[v][c_0]$ 非零

### 核心代码

```cpp
void dfs(int v, int par) {
    for (int c = 0; c < 3; c++) dp[v][c] = 1;
    if (fixed[v] != -1)
        for (int c = 0; c < 3; c++)
            if (c != fixed[v]) dp[v][c] = 0;
    for (int u : adj[v]) {
        if (u == par) continue;
        dfs(u, v);
        for (int c = 0; c < 3; c++) {
            long long sum = 0;
            for (int c2 = 0; c2 < 3; c2++)
                if (c2 != c) sum += dp[u][c2];
            dp[v][c] = dp[v][c] * sum % MOD;
        }
    }
}
```

### 复杂度

$O(N)$。

---

## 26. Cow At Large（树形 DP + 贪心）

### 题意

Bessie 在树上某节点，农夫们在叶子节点。Bessie 走向叶子逃跑，农夫们同时行动拦截。求最少需多少农夫能保证抓住 Bessie。

### 分析

对 Bessie 所在根节点做树形 DP：如果 Bessie 到某个子树的叶子的距离 $\le$ 最近农夫到该叶子的距离（即该子树的叶子深度 $\le$ 子树到叶子的距离），则需要一个农夫在该子树守候。

### 状态与转移

- $d_b[v]$ = Bessie 到 $v$ 的距离（BFS 从根）
- $d_f[v]$ = 最近叶子到 $v$ 的距离（多源 BFS 从所有叶子）
- 答案 = $v$ 是叶子或 $d_f[v] \le d_b[v]$ 的子树交界节点数

### 核心代码

```cpp
// BFS from root for d_b
// Multi-source BFS from all leaves for d_f
int ans = 0;
void dfs(int v, int par) {
    if (d_f[v] <= d_b[v]) { ans++; return; } // 农夫能先到
    for (int u : adj[v])
        if (u != par) dfs(u, v);
}
dfs(root, -1);
```

### 复杂度

$O(N)$。

---

## 27. Lights Out（树形 DP）

### 题意

$N$ 个房间连成树，每个房间有灯。关灯规则：进入房间时翻转灯（开→关，关→开）。从根出发遍历所有房间回根，求最少翻转次数使所有灯关闭。

### 分析

这题难点在于一次 DFS 遍历并不只带来“访问次数”，还会因为进出子树不断翻转灯状态，所以子树处理顺序会影响最终是否需要额外补操作。

因此不能只做简单计数，而要把每个子树抽象成“处理完这棵子树后，对当前节点状态造成什么影响、最小代价是多少”。本质上是在树上合并若干子任务，并在合并时决定先后顺序。

这类题的关键建模是：**当树上遍历顺序会影响局部状态时，要把子树贡献抽象成可合并的 DP 状态，而不是只统计子树大小。**

### 状态与转移

- $dp[v]$ = 处理 $v$ 子树使所有灯关闭的最少额外翻转

### 核心代码

```cpp
void dfs(int v, int par) {
    for (int u : adj[v]) {
        if (u == par) continue;
        dfs(u, v);
    }
    // 根据子树结构和灯状态计算 dp[v]
    dp[v] = /* 子树处理的最优策略 */;
}
```

### 复杂度

$O(N)$。

---

## 28. Delegation（树形 DP + 二分）

### 题意

$N$ 个节点的树，将所有边划分为若干路径，每条路径长度恰好为 $K$。判断给定 $K$ 是否可行。

### 分析

二分 $K$，然后树形 DP 贪心验证：在每个节点，将子树中向上延伸的路径两两配对使总长 $= K$。

### 状态与转移

- 在每个节点 DFS 后，收集所有子树向上传递的路径长度
- 贪心匹配：排序后双指针/set 匹配使两条长度之和 $+ 1 = K$（加上经过当前节点的边）

### 核心代码

```cpp
int dfs(int v, int par, int K) {
    vector<int> ups;
    for (int u : adj[v]) {
        if (u == par) continue;
        int rem = dfs(u, v, K);
        if (rem < 0) return -1; // 失败
        ups.push_back(rem + 1);
    }
    sort(ups.begin(), ups.end());
    // 双指针匹配
    int lo = 0, hi = ups.size() - 1;
    int remain = -1;
    // ... 匹配逻辑：两两凑成 K
    return remain; // 未匹配的路径长度向上传递
}
```

### 复杂度

$O(N \log N)$ per check, $O(N \log^2 N)$ total。

---

## 29. Milk Pumping（双目标最短路 / DP）

### 题意

$N$ 个节点 $M$ 条边的图，每条边有距离 $d_i$ 和流量 $f_i$。从 1 到 $N$，最大化 $\frac{\min \text{flow on path}}{\text{total distance}}$。

### 分析

路径得分是 `最小流量 / 总长度`，分子分母都在变化，直接一起优化很别扭。更自然的做法是先固定瓶颈流量 `f`：如果一条路径的最小流量至少是 `f`，那么它只能使用所有流量不小于 `f` 的边。

这样原题就被拆成很多个单目标问题：在满足流量下限 `f` 的边子图里，从 `1` 到 `N` 的最短路是多少。每个 `f` 都能得到一个候选比值，最后取最大即可。

所以这题最值得记住的是“双目标分离”套路：**遇到 ratio 优化，常先枚举其中一个瓶颈量，再优化另一个。**

### 状态与转移

- 枚举流量阈值 $f$（最多 $M$ 种），Dijkstra 求最短路
- 答案：$\max_f \frac{f}{\text{dist}(1, N)}$

### 核心代码

```cpp
sort(all_flows); // 所有边的流量值
int ans = 0;
for (int f : all_flows) {
    int d = dijkstra(1, N, f); // 只用 flow >= f 的边
    if (d < INF)
        ans = max(ans, (int)(1e6 * f / d)); // 题目要求取整
}
```

### 复杂度

$O(M^2 \log N)$。

---

## 30. Gathering（树 DP + 换根）

### 题意

$N$ 个节点的有权树，每个节点有 $c_i$ 头奶牛。选一个集合点，所有奶牛走到该点的总距离最小。并判断哪些节点可以作为最优集合点。

### 分析

如果把集合点固定在某个根上，总路程就是所有奶牛到该根的距离和；而当根从父亲挪到儿子时，只有“儿子子树内的奶牛更近了、其余奶牛更远了”这件事发生变化。

这正是换根 DP 的标准场景。先在一次 DFS 中求出以某个根为基准的总距离和每棵子树的奶牛数，再把根沿边移动，利用贡献增减公式在线推出相邻节点的答案。

这题要形成的通用直觉是：**树上“把汇聚点换到每个点试一遍”的问题，常先算一个根，再通过换根递推所有答案。**

### 状态与转移

- **自底向上**：$sz[v]$ = 子树奶牛数，$d[v]$ = 子树内奶牛到 $v$ 的总距离
- **换根**：移动根从 $v$ 到 $u$ 时，距离变化为 $w \cdot (N_{\text{total}} - 2 \cdot sz[u])$

### 核心代码

```cpp
void dfs1(int v, int par) {
    sz[v] = c[v];
    for (auto [u, w] : adj[v]) {
        if (u == par) continue;
        dfs1(u, v);
        sz[v] += sz[u];
        d[v] += d[u] + (long long)sz[u] * w;
    }
}

void dfs2(int v, int par) {
    for (auto [u, w] : adj[v]) {
        if (u == par) continue;
        ans[u] = ans[v] + (long long)(total - 2 * sz[u]) * w;
        dfs2(u, v);
    }
}
// ans[1] = d[1]; dfs2(1, -1);
```

### 复杂度

$O(N)$。

---

## 31. Cowmputer Science（数位 DP）

### 题意

给定 $N$（非常大），统计满足特定数位条件的数的个数。

### 分析

数位条件题的标准起手式，就是把上界拆成十进制位，从高位到低位决定当前位填什么。因为后面的选择只会受到“前面是否已经贴着上界”和“已经积累出的特征状态”影响，所以天然适合数位 DP。

状态里最重要的是 `tight`：它表示当前前缀是否仍与上界完全相同。只要某一位填小了，后面各位就都能自由枚举 `0..9`；与此同时，用一个额外 `state` 记录题目真正关心的数位性质。

所以这题别只记 `dp[pos][state][tight]` 的形式，而要记住它的含义：**数位 DP 本质是在按位构造合法前缀。**

### 状态与转移

- **状态**：$dp[pos][state][tight]$
- **转移**：枚举当前位 $0 \sim 9$

### 核心代码

```cpp
long long dfs(int pos, int state, bool tight) {
    if (pos < 0) return /* terminal condition */;
    if (memo[pos][state][tight] != -1) return memo[pos][state][tight];
    int limit = tight ? digits[pos] : 9;
    long long res = 0;
    for (int d = 0; d <= limit; d++)
        res += dfs(pos - 1, newState(state, d), tight && d == limit);
    return memo[pos][state][tight] = res;
}
```

### 复杂度

$O(\text{digits} \times |\text{state}| \times 10)$。

---

## 32. Non-Decreasing Subsequences（计数 DP）

### 题意

给定序列，求不同的非递减子序列个数。

### 分析

$dp[i]$ = 以 $a[i]$ 结尾的不同非递减子序列数。需要用 map 或 BIT 去重。

### 状态与转移

- **状态**：$dp[i]$ = 以第 $i$ 个元素结尾的合法子序列数
- **转移**：$dp[i] = 1 + \sum_{j < i,\; a[j] \le a[i]} dp[j]$（去重）

### 核心代码

```cpp
map<int, long long> last; // 每个值最后一次的贡献
long long total = 0;
for (int i = 0; i < n; i++) {
    long long ways = 1; // 只选自己
    // 加上所有 <= a[i] 的前缀贡献（BIT 维护）
    ways += bit.query(a[i]);
    // 减去之前相同值的重复
    if (last.count(a[i])) ways -= last[a[i]];
    bit.update(a[i], ways - (last.count(a[i]) ? last[a[i]] : 0));
    last[a[i]] = ways;
}
```

### 复杂度

$O(N \log N)$。

---

## 33. Balancing Subsequences（线段树优化 DP）

### 题意

给定序列，从中选子序列使得某种平衡条件满足，并最大化长度或某值。需要线段树优化转移。

### 分析

这类题的关键不在 DP 本身，而在于朴素转移会去前面一大段位置里找“满足条件的最优前驱”，如果每次都线性扫描就会超时。

因此先把每个位置的条件转换成一个可比较的键值，再用线段树维护“到目前为止，这个键范围内的最优 DP 值”。这样 `dp[i]` 就能通过一次区间查询拿到最好前驱，再做单点更新把自己加入数据结构。

所以这题要记住的是常见升级理由：**当前驱筛选条件能转成数轴区间时，DP 往往可以用线段树/BIT 优化。**

### 状态与转移

- **状态**：$dp[i]$ 依题意定义
- **优化**：线段树区间查询最大值 + 单点更新

### 核心代码

```cpp
for (int i = 0; i < n; i++) {
    int best = seg.query(0, transform(a[i]));
    dp[i] = best + 1;
    seg.update(transform(a[i]), dp[i]);
}
```

### 复杂度

$O(N \log N)$。

---

## 34. Spaceship（矩阵快速幂 + DP）

### 题意

$N$ 个星球间有传送门，传送门有层级限制。求从起点到终点恰好 $T$ 步的方案数。

### 分析

将状态扩展为（当前星球，当前层级），构建转移矩阵后用矩阵快速幂求 $T$ 步。

### 状态与转移

- 构造 $(N \times L) \times (N \times L)$ 的转移矩阵 $A$
- 答案：$A^T$ 的对应元素

### 核心代码

```cpp
// 构建转移矩阵 A
int dim = N * L;
Matrix A(dim, dim);
for (each transition (u, l1) -> (v, l2))
    A[encode(v, l2)][encode(u, l1)] = 1;
Matrix res = matrix_power(A, T);
long long ans = res[encode(target, any_level)][encode(start, 0)];
```

### 复杂度

$O((NL)^3 \log T)$。

---

## 35. Robotic Cow Herd（背包 + 堆优化）

### 题意

$N$ 个部件，每个有 $M_i$ 种选择（代价不同）。选每个部件各一种，求第 $K$ 小的总代价。

### 分析

每个部件排序后计算增量。用堆（优先队列）依次提取第 $K$ 小和的经典做法。

### 状态与转移

- 排序每个部件的代价增量
- 用最小堆逐步展开

### 核心代码

```cpp
// 对每个部件排序，计算相对最小值的增量
// 所有增量合并排序后用堆展开
priority_queue<pair<long long, int>, vector<...>, greater<...>> pq;
pq.push({0, 0}); // (增量和, 索引)
for (int cnt = 0; cnt < K; cnt++) {
    auto [cost, idx] = pq.top(); pq.pop();
    if (cnt == K - 1) { ans = baseCost + cost; break; }
    // 展开下一步：替换当前增量为下一个 / 加入新增量
}
```

### 复杂度

$O(N \log N + K \log K)$。

---

## 36. Train Tracking（DP + 单调队列）

### 题意

火车经过 $N$ 个检查站，每 $K$ 个连续站的最小值已知。还原满足条件的最小/最大序列。

### 分析

滑动窗口最小值的逆问题。利用单调队列约束，DP 确定每个位置的值。

### 状态与转移

- 从约束出发确定每个位置的可行范围
- 单调队列维护滑动窗口约束

### 核心代码

```cpp
// 对连续的相同最小值区间，确定值的分配策略
for (int i = 0; i < n; i++) {
    // 计算位置 i 的值范围
    val[i] = maxPossible(i); // 受窗口约束
}
// 使用单调队列验证和调整
```

### 复杂度

$O(N)$ 或 $O(N \log N)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **入门/基础 DP** | 1, 2, 3, 4, 5, 6 | 前后缀DP、BFS/DP、多状态、分段DP、计数DP、二维DP |
| **简单状态 DP** | 7, 8, 9, 10, 11, 12 | 完全背包变形、LIS变形、LCS、计数、网格DP、状压DP |
| **背包 DP** | 13, 16, 18 | 背包取模、背包+组合、分数规划 |
| **线性/滑动窗口 DP** | 14, 17, 36 | 分段最优、前缀优化、单调队列 |
| **DAG / 分层 DP** | 15 | 按天分层 DP |
| **区间 DP** | 19, 20, 22 | 切割问题、二维DP、环形DP |
| **回文/网格 DP** | 21 | 双端同步 DP |
| **容斥** | 24 | 子集枚举容斥 |
| **树形 DP** | 25, 26, 27, 28, 30 | 涂色、换根、二分+树DP |
| **最短路/图 DP** | 29 | 枚举+Dijkstra |
| **数位 DP** | 31 | 逐位枚举 |
| **计数 DP** | 23, 32 | 排列LCM、去重计数 |
| **数据结构优化 DP** | 33 | 线段树优化 |
| **矩阵快速幂** | 34 | 状态矩阵 |
| **堆优化** | 35 | 第 $K$ 小背包 |

## 学习路线建议

```
Bronze 入门：1 → 2 → 3 → 4
    ↓
Silver 基础：5 → 6 → 7 → 8 → 9 → 10 → 11 → 12
    ↓
Gold 背包：13 → 16 → 18 → 14
    ↓
Gold 线性/区间：15 → 17 → 19 → 20 → 22
    ↓
Gold 树形：25 → 30 → 26 → 27 → 28 → 29
    ↓
Gold 计数/容斥：23 → 24 → 21
    ↓
Platinum：31 → 32 → 33 → 34 → 35 → 36
```

## 解题方法论

1. **USACO 特色**：问题描述生活化（奶牛、农场、围栏），但本质仍是经典算法模型。关键是快速将题意抽象为数学/图论/DP 模型。
2. **二分 + 验证**：很多 USACO 题（特别是 Silver/Gold）的正解是二分答案 + 贪心/DP 验证。看到"最大化最小值"或"最小化最大值"优先考虑二分。
3. **树形 DP 是重点**：USACO Gold 级别大量考察树形 DP（涂色、换根、路径匹配）。掌握换根 DP 模板至关重要。
4. **背包变形层出不穷**：分数规划背包、取模背包、组合背包——核心思路不变，但转化方式多样。
5. **Platinum 级别需要数据结构辅助**：线段树优化 DP、矩阵快速幂、堆优化第 $K$ 小等高级技巧。

> **记住**：USACO 的训练体系从 Bronze 到 Platinum 循序渐进。每一级别都在前一级的基础上引入新的算法技巧，是系统学习竞赛 DP 的绝佳路径。
