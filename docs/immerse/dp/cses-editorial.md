---
title: "CSES Problem Set — DP 专题解题报告"
subtitle: "🎯 23 道经典 DP 题目的分析方法、解题思路与核心代码"
order: 2
icon: "🎯"
---

# CSES Problem Set — DP 专题解题报告

> 来源：[CSES Problem Set](https://cses.fi/problemset/)
>
> 本报告针对 CSES DP 专题全部 23 题，逐题给出**题意概述 → 分析方法 → 状态设计 → 转移方程 → 核心代码 → 复杂度**，最后做整体总结。

---

## 1. Dice Combinations（线性 DP 计数）

### 题意

投骰子（1~6 点），求凑出总点数恰好为 $n$ 的方案数（模 $10^9+7$）。

### 分析

经典爬楼梯问题的推广。每次可以走 1~6 步，求到达第 $n$ 阶的方案数。

### 状态与转移

- **状态**：$dp[i]$ = 凑出点数 $i$ 的方案数
- **转移**：$dp[i] = \sum_{j=1}^{6} dp[i-j]$（$i-j \ge 0$）
- **初始**：$dp[0] = 1$

### 核心代码

```cpp
dp[0] = 1;
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= 6 && j <= i; j++)
        dp[i] = (dp[i] + dp[i-j]) % MOD;
```

### 复杂度

$O(6N) = O(N)$。

---

## 2. Minimizing Coins（完全背包 — 最小值）

### 题意

$n$ 种硬币，面值为 $c_1, \ldots, c_n$，每种无限。求凑出总额 $x$ 的最少硬币数，不可能则输出 $-1$。

### 分析

经典完全背包/零钱兑换问题。与 0/1 背包不同，每种硬币可无限使用，所以正序枚举容量。

### 状态与转移

- **状态**：$dp[j]$ = 凑出金额 $j$ 的最少硬币数
- **转移**：$dp[j] = \min(dp[j],\; dp[j - c_i] + 1)$（正序枚举 $j$）
- **初始**：$dp[0] = 0$，其余 $\infty$

### 核心代码

```cpp
fill(dp, dp + x + 1, INF);
dp[0] = 0;
for (int i = 0; i < n; i++)
    for (int j = c[i]; j <= x; j++)
        dp[j] = min(dp[j], dp[j - c[i]] + 1);
cout << (dp[x] >= INF ? -1 : dp[x]);
```

### 复杂度

$O(Nx)$。

---

## 3. Coin Combinations I（完全背包 — 排列计数）

### 题意

$n$ 种硬币凑出总额 $x$，不同**排列**算不同方案（即顺序有关）。求方案数。

### 分析

与标准完全背包不同，**先枚举金额、再枚举硬币**，就能统计排列数（每个位置可以选任何硬币）。

### 状态与转移

- **状态**：$dp[j]$ = 凑出金额 $j$ 的排列方案数
- **转移**：$dp[j] = \sum_{i} dp[j - c_i]$
- **关键**：外层循环金额，内层循环硬币

### 核心代码

```cpp
dp[0] = 1;
for (int j = 1; j <= x; j++)
    for (int i = 0; i < n; i++)
        if (j >= c[i])
            dp[j] = (dp[j] + dp[j - c[i]]) % MOD;
```

### 复杂度

$O(Nx)$。

---

## 4. Coin Combinations II（完全背包 — 组合计数）

### 题意

$n$ 种硬币凑出总额 $x$，不同**组合**算不同方案（即顺序无关）。求方案数。

### 分析

标准完全背包计数。**先枚举硬币、再枚举金额**，保证每种硬币只被考虑一次，不会产生重复排列。

### 状态与转移

- **状态**：$dp[j]$ = 凑出金额 $j$ 的组合方案数
- **转移**：$dp[j] = dp[j] + dp[j - c_i]$
- **关键**：外层循环硬币，内层循环金额

### 核心代码

```cpp
dp[0] = 1;
for (int i = 0; i < n; i++)
    for (int j = c[i]; j <= x; j++)
        dp[j] = (dp[j] + dp[j - c[i]]) % MOD;
```

### 复杂度

$O(Nx)$。

### 与第 3 题的对比

| | Coin Combinations I（排列） | Coin Combinations II（组合） |
|---|---|---|
| 外层循环 | 金额 $j$ | 硬币 $i$ |
| 内层循环 | 硬币 $i$ | 金额 $j$ |
| 本质 | 每步选任意硬币 | 每种硬币处理一次 |

---

## 5. Removing Digits（线性 DP / BFS）

### 题意

给正整数 $n$，每次可减去 $n$ 的任一非零数位，求将 $n$ 变为 0 的最少步数。

### 分析

简单线性 DP（或 BFS）。对每个数字，枚举其各位非零数字作为减去的值。

### 状态与转移

- **状态**：$dp[i]$ = 将 $i$ 变为 0 的最少步数
- **转移**：$dp[i] = \min_d(dp[i - d] + 1)$，其中 $d$ 是 $i$ 的某个非零数位

### 核心代码

```cpp
dp[0] = 0;
for (int i = 1; i <= n; i++) {
    dp[i] = INF;
    for (int tmp = i; tmp > 0; tmp /= 10) {
        int d = tmp % 10;
        if (d > 0) dp[i] = min(dp[i], dp[i - d] + 1);
    }
}
```

### 复杂度

$O(N \log N)$（每个数最多 $\log_{10} N$ 位）。

---

## 6. Grid Paths I（网格路径 DP）

### 题意

$n \times n$ 网格，部分格子为障碍（`*`），只能向右或向下走。求从 $(1,1)$ 到 $(n,n)$ 的路径数（模 $10^9+7$）。

### 分析

基础网格 DP，障碍格路径数置 0。

### 状态与转移

- **状态**：$dp[i][j]$ = 到达 $(i,j)$ 的路径数
- **转移**：
  - 若 $(i,j)$ 是障碍：$dp[i][j] = 0$
  - 否则：$dp[i][j] = dp[i-1][j] + dp[i][j-1]$

### 核心代码

```cpp
dp[0][0] = (grid[0][0] == '.' ? 1 : 0);
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++) {
        if (grid[i][j] == '*') { dp[i][j] = 0; continue; }
        if (i > 0) dp[i][j] = (dp[i][j] + dp[i-1][j]) % MOD;
        if (j > 0) dp[i][j] = (dp[i][j] + dp[i][j-1]) % MOD;
    }
```

### 复杂度

$O(N^2)$。

---

## 7. Book Shop（0/1 背包）

### 题意

$n$ 本书，第 $i$ 本价格 $h_i$、页数 $s_i$，总预算 $x$。求最大可购买页数。

### 分析

标准 0/1 背包。以价格为容量，页数为价值。

### 状态与转移

- **状态**：$dp[j]$ = 预算恰为 $j$ 时的最大页数
- **转移**：$dp[j] = \max(dp[j],\; dp[j - h_i] + s_i)$（倒序枚举 $j$）

### 核心代码

```cpp
for (int i = 0; i < n; i++)
    for (int j = x; j >= h[i]; j--)
        dp[j] = max(dp[j], dp[j - h[i]] + s[i]);
```

### 复杂度

$O(Nx)$。

---

## 8. Array Description（多状态线性 DP）

### 题意

长度 $n$ 的数组，元素范围 $[1, m]$，相邻元素差 $\le 1$。某些位置已固定，其余为 0（待填）。求满足条件的数组方案数。

### 分析

经典多状态线性 DP。$dp[i][v]$ 表示第 $i$ 个位置填 $v$ 时的方案数。转移时只考虑 $v-1, v, v+1$。

### 状态与转移

- **状态**：$dp[i][v]$ = 前 $i$ 个位置、第 $i$ 位为 $v$ 的方案数
- **转移**：
  - 若 $a[i]$ 已固定为 $v_0$：只有 $dp[i][v_0]$ 非零
  - 否则：$dp[i][v] = dp[i-1][v-1] + dp[i-1][v] + dp[i-1][v+1]$

### 核心代码

```cpp
// 初始化第 0 位
if (a[0] != 0) dp[0][a[0]] = 1;
else for (int v = 1; v <= m; v++) dp[0][v] = 1;

for (int i = 1; i < n; i++) {
    int lo = 1, hi = m;
    if (a[i] != 0) lo = hi = a[i]; // 已固定
    for (int v = lo; v <= hi; v++)
        for (int dv = -1; dv <= 1; dv++)
            if (v + dv >= 1 && v + dv <= m)
                dp[i][v] = (dp[i][v] + dp[i-1][v + dv]) % MOD;
}
long long ans = 0;
for (int v = 1; v <= m; v++) ans = (ans + dp[n-1][v]) % MOD;
```

### 复杂度

$O(Nm)$。

---

## 9. Counting Towers（线性 DP 分类讨论）

### 题意

宽为 2 的塔，用宽 1 或宽 2 的积木块搭建到高 $n$。同一层的积木可以和上一层"连通"延伸。求不同的搭建方案数。

### 分析

**关键**：每一层有两种形态——"一整块（宽2）"或"两半块（各宽1）"。并且上一层可以和当前层连通或断开，需分类讨论。

### 状态与转移

- **状态**：$f[i]$ = 第 $i$ 层为一整块的方案数，$g[i]$ = 第 $i$ 层为两半块的方案数
- **转移**：
  - $f[i] = 2 \cdot f[i-1] + g[i-1]$（整块可延伸或不延伸 → 2 种；两半块到整块 → 1 种）
  - $g[i] = f[i-1] + 4 \cdot g[i-1]$（整块到两半 → 1 种；两半各自可延伸或不延伸 → $2 \times 2 = 4$ 种）
- **答案**：$f[n] + g[n]$

### 核心代码

```cpp
long long f[MAXN], g[MAXN];
f[1] = g[1] = 1;
for (int i = 2; i <= MAXN; i++) {
    f[i] = (2 * f[i-1] + g[i-1]) % MOD;
    g[i] = (f[i-1] + 4 * g[i-1]) % MOD;
}
// 多组查询 O(1) 回答：ans = (f[n] + g[n]) % MOD
```

### 复杂度

$O(N)$ 预处理，$O(1)$ 单次查询。

---

## 10. Edit Distance（编辑距离）

### 题意

给两个字符串 $s, t$，求将 $s$ 变为 $t$ 的最少操作次数（插入 / 删除 / 替换一个字符）。

### 分析

经典编辑距离 DP。

### 状态与转移

- **状态**：$dp[i][j]$ = $s[0..i-1]$ 变为 $t[0..j-1]$ 的最少操作数
- **转移**：
  - $s_i = t_j$：$dp[i][j] = dp[i-1][j-1]$
  - 否则：$dp[i][j] = 1 + \min(dp[i-1][j-1],\; dp[i-1][j],\; dp[i][j-1])$
- **初始**：$dp[i][0] = i,\; dp[0][j] = j$

### 核心代码

```cpp
for (int i = 0; i <= n; i++) dp[i][0] = i;
for (int j = 0; j <= m; j++) dp[0][j] = j;
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        if (s[i-1] == t[j-1]) dp[i][j] = dp[i-1][j-1];
        else dp[i][j] = 1 + min({dp[i-1][j-1], dp[i-1][j], dp[i][j-1]});
    }
```

### 复杂度

$O(|s| \cdot |t|)$。

---

## 11. Longest Common Subsequence（LCS）

### 题意

给两个字符串，求它们的**最长公共子序列**（需输出具体方案）。

### 分析

与 AtCoder F - LCS 完全相同。先求 LCS 长度，再回溯构造方案。

### 状态与转移

- **状态**：$dp[i][j]$ = $s[0..i-1]$ 与 $t[0..j-1]$ 的 LCS 长度
- **转移**：
  - $s_i = t_j$：$dp[i][j] = dp[i-1][j-1] + 1$
  - 否则：$dp[i][j] = \max(dp[i-1][j],\; dp[i][j-1])$

### 核心代码

```cpp
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        if (s[i-1] == t[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
        else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
// 回溯输出（同 AtCoder F 题）
```

### 复杂度

$O(|s| \cdot |t|)$。

---

## 12. Rectangle Cutting（区间 DP）

### 题意

$a \times b$ 的矩形，每次沿平行于边的直线切一刀，分成两个小矩形。求将其切为若干正方形的最小刀数。

### 分析

二维区间 DP。枚举水平和垂直的切割位置。

### 状态与转移

- **状态**：$dp[i][j]$ = 将 $i \times j$ 矩形切为正方形的最少刀数
- **转移**：
  - 若 $i = j$：$dp[i][j] = 0$（已经是正方形）
  - 水平切：$dp[i][j] = \min_{k=1}^{i-1}(dp[k][j] + dp[i-k][j] + 1)$
  - 垂直切：$dp[i][j] = \min_{k=1}^{j-1}(dp[i][k] + dp[i][j-k] + 1)$

### 核心代码

```cpp
for (int i = 1; i <= a; i++)
    for (int j = 1; j <= b; j++) {
        if (i == j) { dp[i][j] = 0; continue; }
        dp[i][j] = INF;
        for (int k = 1; k < i; k++)
            dp[i][j] = min(dp[i][j], dp[k][j] + dp[i-k][j] + 1);
        for (int k = 1; k < j; k++)
            dp[i][j] = min(dp[i][j], dp[i][k] + dp[i][j-k] + 1);
    }
```

### 复杂度

$O(ab(a+b))$。

---

## 13. Minimal Grid Path（网格路径字典序最小）

### 题意

$n \times n$ 的字母网格，只能向右或向下走，输出从 $(1,1)$ 到 $(n,n)$ 的**字典序最小**的路径字符串。

### 分析

**贪心 + BFS 分层**。不能逐格做 DP 存字符串（太慢）。关键思路：

按"层"（$i + j$ 相同的格子为一层）推进，每层只保留能产生字典序最小路径的格子集合。每层贪心选最小字符，淘汰其他。

### 状态与转移

- 维护当前层的**候选格子集合** $S$
- 下一层中，只保留字符等于 $\min$ 字符的格子
- 每步将最小字符追加到结果

### 核心代码

```cpp
set<pair<int,int>> frontier;
frontier.insert({0, 0});
string result;
result += grid[0][0];
for (int step = 1; step < 2 * n - 1; step++) {
    char best = 'z' + 1;
    set<pair<int,int>> next_frontier;
    for (auto [x, y] : frontier) {
        for (auto [dx, dy] : vector<pair<int,int>>{{1,0},{0,1}}) {
            int nx = x + dx, ny = y + dy;
            if (nx < n && ny < n) best = min(best, grid[nx][ny]);
        }
    }
    for (auto [x, y] : frontier) {
        for (auto [dx, dy] : vector<pair<int,int>>{{1,0},{0,1}}) {
            int nx = x + dx, ny = y + dy;
            if (nx < n && ny < n && grid[nx][ny] == best)
                next_frontier.insert({nx, ny});
        }
    }
    result += best;
    frontier = next_frontier;
}
```

### 复杂度

$O(N^2)$。

---

## 14. Money Sums（0/1 背包可行性）

### 题意

$n$ 个硬币，面值 $x_1, \ldots, x_n$。求所有可能凑出的不同金额。

### 分析

0/1 背包的可行性版本。用 bitset 优化或布尔数组记录可达金额。

### 状态与转移

- **状态**：$dp[j]$ = 是否能凑出金额 $j$
- **转移**：$dp[j] = dp[j] \lor dp[j - x_i]$（倒序枚举 $j$）

### 核心代码

```cpp
bitset<100001> dp;
dp[0] = 1;
for (int i = 0; i < n; i++)
    dp |= (dp << x[i]);
// 输出所有 dp[j] == 1 的 j（j > 0）
```

### 复杂度

$O(NS/64)$（bitset 优化），其中 $S = \sum x_i$。

---

## 15. Removal Game（区间 DP / 博弈）

### 题意

$n$ 个数排成一排，两人轮流从两端取数（加到自己得分）。双方最优策略下，求先手得分。

### 分析

与 AtCoder L - Deque 相同的区间博弈模型。

### 状态与转移

- **状态**：$dp[l][r]$ = 剩余 $[l,r]$ 时，当前玩家得分减去对手得分的最大值
- **转移**：$dp[l][r] = \max(a[l] - dp[l+1][r],\; a[r] - dp[l][r-1])$
- **答案**：先手得分 $= (\text{sum} + dp[0][n-1]) / 2$

### 核心代码

```cpp
for (int i = 0; i < n; i++) dp[i][i] = a[i];
for (int len = 2; len <= n; len++)
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        dp[l][r] = max(a[l] - dp[l+1][r], a[r] - dp[l][r-1]);
    }
long long ans = (sum + dp[0][n-1]) / 2;
```

### 复杂度

$O(N^2)$。

---

## 16. Two Sets II（背包计数）

### 题意

将 $\{1, 2, \ldots, n\}$ 分成两个**和相等**的子集，求方案数（模 $10^9+7$）。由于两组互换算同一种，最后除以 2。

### 分析

和为 $S = n(n+1)/2$。若 $S$ 为奇数则无解。否则转化为：从 $\{1, \ldots, n\}$ 中选子集使和为 $S/2$ 的方案数，最后除 2（去重）。

### 状态与转移

- **状态**：$dp[j]$ = 从 $\{1, \ldots, n\}$ 中选若干数使和为 $j$ 的方案数
- **转移**：标准 0/1 背包（为避免重复包含 $n$ 本身，可选择不放 $n$）

### 核心代码

```cpp
int S = n * (n + 1) / 2;
if (S % 2 != 0) { cout << 0; return; }
int target = S / 2;
dp[0] = 1;
for (int i = 1; i <= n; i++)
    for (int j = target; j >= i; j--)
        dp[j] = (dp[j] + dp[j - i]) % MOD;
// 除以 2（两组互换）
cout << dp[target] * inv2 % MOD;
```

### 复杂度

$O(N \cdot S)$，其中 $S = O(N^2)$。

---

## 17. Mountain Range（单调栈 + DP）

### 题意

$n$ 座山排成一排，从山 $a$ 可滑翔到山 $b$ 的条件是 $h_a > h_b$ 且中间所有山的高度都 $< h_a$。求最长滑翔路径（经过的山数）。

### 分析

用**单调栈**预处理每座山向左/右能"看到"的相邻山，然后按高度从大到小 DP。

### 状态与转移

- **状态**：$dp[i]$ = 以山 $i$ 为终点的最长滑翔路径长度
- **按高度降序处理**：对于当前山 $i$，向左右扩展到第一座 $\ge h_i$ 的山为止，更新沿途山的 DP 值
- **转移**：$dp[\text{neighbor}] = \max(dp[\text{neighbor}],\; dp[i] + 1)$

### 核心代码

```cpp
vector<int> dp(n, 1);
// 按高度降序处理
vector<int> order(n);
iota(order.begin(), order.end(), 0);
sort(order.begin(), order.end(), [&](int a, int b) {
    return h[a] > h[b];
});
for (int idx : order) {
    // 向右传播
    for (int j = idx + 1; j < n && h[j] < h[idx]; j++)
        dp[j] = max(dp[j], dp[idx] + 1);
    // 向左传播
    for (int j = idx - 1; j >= 0 && h[j] < h[idx]; j--)
        dp[j] = max(dp[j], dp[idx] + 1);
}
int ans = *max_element(dp.begin(), dp.end());
```

### 复杂度

$O(N \log N)$ ~ $O(N^2)$（取决于具体实现，可用跳表或单调栈优化）。

---

## 18. Increasing Subsequence（LIS — $O(N \log N)$）

### 题意

给长度 $n$ 的序列，求**最长严格递增子序列 (LIS)** 的长度。

### 分析

经典 LIS 问题。$O(N^2)$ DP 对 $N \le 2 \times 10^5$ 太慢，使用贪心 + 二分的 $O(N \log N)$ 算法。

维护一个数组 `tails`，`tails[i]` 表示长度为 $i+1$ 的递增子序列末尾的最小值。遍历每个元素，用二分查找更新。

### 核心代码

```cpp
vector<int> tails;
for (int i = 0; i < n; i++) {
    auto it = lower_bound(tails.begin(), tails.end(), a[i]);
    if (it == tails.end()) tails.push_back(a[i]);
    else *it = a[i];
}
cout << tails.size();
```

### 复杂度

$O(N \log N)$。

---

## 19. Projects（区间调度 + DP）

### 题意

$n$ 个项目，第 $i$ 个时间段为 $[a_i, b_i]$，报酬 $p_i$。同一时间不能做多个项目。求最大报酬。

### 分析

经典**带权区间调度**问题。按结束时间排序后，对每个项目二分查找最后一个不冲突的项目。

### 状态与转移

- **排序**：按 $b_i$（结束时间）升序排序
- **状态**：$dp[i]$ = 考虑前 $i$ 个项目的最大报酬
- **转移**：$dp[i] = \max(dp[i-1],\; dp[j] + p_i)$
  - 其中 $j$ 是 $b_j < a_i$ 的最大下标（二分查找）

### 核心代码

```cpp
sort(projects.begin(), projects.end(), [](auto& a, auto& b) {
    return a.end < b.end;
});
vector<long long> dp(n + 1, 0);
for (int i = 0; i < n; i++) {
    dp[i + 1] = dp[i]; // 不选第 i 个
    // 二分查找最后一个 end < projects[i].start 的项目
    int lo = 0, hi = i - 1, best = -1;
    while (lo <= hi) {
        int mid = (lo + hi) / 2;
        if (projects[mid].end < projects[i].start) {
            best = mid; lo = mid + 1;
        } else hi = mid - 1;
    }
    dp[i + 1] = max(dp[i + 1], (best >= 0 ? dp[best + 1] : 0) + projects[i].reward);
}
```

### 复杂度

$O(N \log N)$。

---

## 20. Elevator Rides（状压 DP）

### 题意

$n$ 个人（$n \le 20$），每人体重 $w_i$，电梯载重上限 $x$。求最少需要多少趟电梯。

### 分析

$n \le 20$ → 状压 DP。用位掩码表示已运送的人的集合。DP 值记录 **(趟数, 当前趟已用重量)**，双关键字取最小。

### 状态与转移

- **状态**：$dp[S] = (\text{rides},\; \text{last\_weight})$，$S$ 为已运送的人的集合
- **转移**：枚举 $S$ 中的每个人 $j$，设 $S' = S \setminus \{j\}$：
  - 若 $dp[S'].\text{last} + w_j \le x$：加到当前趟
  - 否则：新开一趟

### 核心代码

```cpp
vector<pair<int,int>> dp(1 << n, {n + 1, 0});
dp[0] = {1, 0};
for (int S = 1; S < (1 << n); S++) {
    for (int j = 0; j < n; j++) {
        if (!(S & (1 << j))) continue;
        auto [rides, last] = dp[S ^ (1 << j)];
        pair<int,int> cand;
        if (last + w[j] <= x)
            cand = {rides, last + w[j]};
        else
            cand = {rides + 1, w[j]};
        dp[S] = min(dp[S], cand);
    }
}
cout << dp[(1 << n) - 1].first;
```

### 复杂度

$O(N \cdot 2^N)$。

---

## 21. Counting Tilings（轮廓线状压 DP）

### 题意

用 $1 \times 2$ 骨牌铺满 $n \times m$ 网格（$n \le 10$，$m \le 1000$）的方案数。

### 分析

经典**轮廓线 DP（Profile DP）**。逐列处理，用 $n$ 位掩码表示当前列每行是否已被前一列的水平骨牌覆盖。

### 状态与转移

- **状态**：$dp[\text{col}][\text{mask}]$ = 前 $\text{col}$ 列已填满、第 $\text{col}$ 列的覆盖情况为 $\text{mask}$ 的方案数
- **转移**：对每个 mask，递归生成所有合法的 next\_mask：
  - 已覆盖的行（bit=1）：跳过
  - 未覆盖的行：放竖骨牌（覆盖当前行，next 列对应位标 1）；或放横骨牌（需下一行也未覆盖）

### 核心代码

```cpp
void generate(int mask, int pos, int next_mask, int col) {
    if (pos == n) { dp[col + 1][next_mask] = (dp[col + 1][next_mask] + dp[col][mask]) % MOD; return; }
    if (mask & (1 << pos)) {
        // 已被覆盖，跳过
        generate(mask, pos + 1, next_mask, col);
    } else {
        // 竖骨牌：占据当前格，下一列对应位标记
        generate(mask, pos + 1, next_mask | (1 << pos), col);
        // 横骨牌：需要 pos+1 也未被覆盖
        if (pos + 1 < n && !(mask & (1 << (pos + 1))))
            generate(mask, pos + 2, next_mask, col);
    }
}

dp[0][0] = 1;
for (int col = 0; col < m; col++)
    for (int mask = 0; mask < (1 << n); mask++)
        if (dp[col][mask])
            generate(mask, 0, 0, col);
// 答案：dp[m][0]
```

### 复杂度

$O(M \cdot 2^N \cdot \text{转移数})$，其中转移数约为 $O(2^N)$。总共约 $O(M \cdot 3^N)$。

---

## 22. Counting Numbers（数位 DP）

### 题意

给区间 $[a, b]$（$a, b \le 10^{18}$），求区间内**没有相邻相同数位**的整数个数。

### 分析

经典数位 DP，使用 $f(x) = [1, x]$ 中满足条件的数的个数，答案 $= f(b) - f(a-1)$。

### 状态与转移

- **状态**：$\text{dfs}(pos, prev, leading, tight)$
  - $pos$：当前位
  - $prev$：上一位数字（$-1$ 表示无）
  - $leading$：是否仍在前导零阶段
  - $tight$：是否紧贴上界
- **转移**：枚举当前位 $d = 0 \sim \text{limit}$，若 $d = prev$ 且非前导零则跳过

### 核心代码

```cpp
long long dfs(int pos, int prev, bool lead, bool tight) {
    if (pos == len) return 1;
    if (memo[pos][prev+1][lead][tight] != -1)
        return memo[pos][prev+1][lead][tight];
    int limit = tight ? digits[pos] : 9;
    long long res = 0;
    for (int d = 0; d <= limit; d++) {
        if (!lead && d == prev) continue; // 不允许相邻相同
        bool nlead = lead && (d == 0);
        res += dfs(pos + 1, nlead ? -1 : d, nlead, tight && (d == limit));
    }
    return memo[pos][prev+1][lead][tight] = res;
}
// 答案：solve(b) - solve(a - 1)
```

### 复杂度

$O(|digits| \times 10 \times 2 \times 2) = O(\log_{10} N)$。

---

## 23. Increasing Subsequence II（LIS 计数 + BIT）

### 题意

给长度 $n$ 的序列，求**严格递增子序列的个数**（模 $10^9+7$）。

### 分析

朴素 $O(N^2)$ 超时。用 **BIT（树状数组）+ 坐标压缩** 优化。

对每个元素 $a_i$，以它结尾的递增子序列数 = 所有比它小的元素结尾的子序列数之和 + 1（自身单独成序列）。用 BIT 维护前缀和。

### 状态与转移

- **坐标压缩**：将值域映射到 $[1, \text{unique count}]$
- **BIT** 以压缩后的值为下标，维护"以该值结尾的子序列个数"的前缀和
- **转移**：$dp[i] = 1 + \text{BIT.query}(\text{rank}(a_i) - 1)$
- **更新**：$\text{BIT.update}(\text{rank}(a_i),\; dp[i])$

### 核心代码

```cpp
// 坐标压缩
vector<int> sorted_a = a;
sort(sorted_a.begin(), sorted_a.end());
sorted_a.erase(unique(sorted_a.begin(), sorted_a.end()), sorted_a.end());
for (int& x : a)
    x = lower_bound(sorted_a.begin(), sorted_a.end(), x) - sorted_a.begin() + 1;

long long ans = 0;
BIT bit(sorted_a.size());
for (int x : a) {
    long long val = (bit.query(x - 1) + 1) % MOD;
    bit.update(x, val);
    ans = (ans + val) % MOD;
}
```

### 复杂度

$O(N \log N)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **线性 DP** | 1, 5, 8, 9 | 递推计数、多状态、分类讨论 |
| **完全背包** | 2, 3, 4 | 最小值、排列计数 vs 组合计数 |
| **0/1 背包** | 7, 14, 16 | 最大值、可行性、计数 |
| **网格 DP** | 6, 13 | 路径计数、字典序最小（BFS 分层） |
| **字符串 DP** | 10, 11 | 编辑距离、LCS |
| **区间 DP** | 12, 15 | 切割问题、博弈 |
| **子序列** | 18, 23 | LIS（贪心+二分）、LIS 计数（BIT） |
| **区间调度** | 19 | 带权区间调度（排序+二分+DP） |
| **状压 DP** | 20, 21 | 最少分组、轮廓线铺砖 |
| **数位 DP** | 22 | 相邻数位约束 |
| **其他** | 17 | 单调栈 + DP |

## CSES vs AtCoder DP 对照

| CSES 题目 | 对应 AtCoder 题目 | 差异 |
|-----------|-------------------|------|
| Grid Paths I | H - Grid 1 | 几乎相同 |
| Removal Game | L - Deque | 相同模型 |
| LCS | F - LCS | 相同 |
| Counting Numbers | S - Digit Sum | 都是数位 DP，约束不同 |
| Elevator Rides | O - Matching | 都是状压，模型不同 |
| Counting Tilings | — | CSES 特有的轮廓线 DP |
| Projects | — | CSES 特有的带权区间调度 |

## 学习路线建议

```
入门：1 → 2 → 3 → 4 → 5 → 6 → 7
       ↓
基础进阶：10 → 11 → 12 → 14 → 8
       ↓
中级：9 → 15 → 16 → 18 → 19 → 13
       ↓
高级：17 → 20 → 21 → 22 → 23
```

## 重点技巧速查

| 技巧 | 题目 | 说明 |
|------|------|------|
| 排列 vs 组合的循环顺序 | 3 vs 4 | 外层金额 → 排列；外层物品 → 组合 |
| bitset 优化背包 | 14 | 可行性背包用 bitset 加速 64 倍 |
| 双关键字状压 DP | 20 | (趟数, 当前趟重量) 字典序最小 |
| 轮廓线 DP | 21 | $n$ 小时的骨牌铺砖标准方法 |
| 坐标压缩 + BIT | 23 | LIS 计数的标准优化手段 |
| BFS 分层贪心 | 13 | 字典序最小路径不能用字符串 DP |

> 💡 **CSES 的 DP 专题是 AtCoder EDPC 的绝佳补充**：CSES 更侧重背包变种（排列/组合/可行性）和经典字符串 DP（编辑距离、LCS），而 AtCoder 更侧重高级优化技巧（斜率优化、换根 DP、线段树优化 DP）。两套题组合刷完，DP 基本功即可扎实。
