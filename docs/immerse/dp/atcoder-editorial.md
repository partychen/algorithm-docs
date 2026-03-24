---
title: "AtCoder 经典 DP 解题报告"
subtitle: "🏆 26 道经典 DP 题目的分析方法、解题思路与核心代码"
order: 1
icon: "🏆"
---

# AtCoder Educational DP Contest 解题报告

> 来源：[AtCoder DP Contest](https://atcoder.jp/contests/dp/tasks)
>
> 本报告针对 EDPC 全部 26 题 (A–Z)，逐题给出**题意概述 → 分析方法 → 状态设计 → 转移方程 → 核心代码 → 复杂度**，最后做整体总结。

---

## A - Frog 1（线性 DP 入门）

### 题意

$N$ 块石头排成一排，第 $i$ 块高度为 $h_i$。青蛙从第 1 块出发，每次可跳 1 或 2 步，代价为落差绝对值。求到达第 $N$ 块的最小代价。

### 分析

最经典的线性 DP 入门题。当前状态只依赖前 1~2 个状态，天然适合递推。

### 状态与转移

- **状态**：$dp[i]$ = 到达第 $i$ 块石头的最小代价
- **转移**：$dp[i] = \min(dp[i-1] + |h_i - h_{i-1}|, dp[i-2] + |h_i - h_{i-2}|)$
- **初始**：$dp[0] = 0$
- **答案**：$dp[N-1]$

### 核心代码

```cpp
dp[0] = 0;
for (int i = 1; i < n; i++) {
    dp[i] = dp[i-1] + abs(h[i] - h[i-1]);
    if (i >= 2)
        dp[i] = min(dp[i], dp[i-2] + abs(h[i] - h[i-2]));
}
```

### 复杂度

$O(N)$ 时间，$O(N)$ 空间（可滚动优化至 $O(1)$）。

---

## B - Frog 2（线性 DP 扩展）

### 题意

与 A 题相同，但每次可跳 $1 \sim K$ 步。

### 分析

A 题的自然推广。转移时需枚举跳跃步数 $1 \sim K$。

### 状态与转移

- **状态**：$dp[i]$ = 到达第 $i$ 块石头的最小代价
- **转移**：$dp[i] = \min_{j=1}^{\min(i,K)} \big(dp[i-j] + |h_i - h_{i-j}|\big)$

### 核心代码

```cpp
dp[0] = 0;
for (int i = 1; i < n; i++) {
    dp[i] = INF;
    for (int j = 1; j <= k && j <= i; j++)
        dp[i] = min(dp[i], dp[i-j] + abs(h[i] - h[i-j]));
}
```

### 复杂度

$O(NK)$ 时间。

---

## C - Vacation（多状态线性 DP）

### 题意

$N$ 天假期，每天可选三种活动之一（得分 $a_i, b_i, c_i$），**相邻两天不能选同一种**。求最大总得分。

### 分析

经典的"不能连续选同一个"问题。给 DP 加上"上一次选了什么"维度即可。

### 状态与转移

- **状态**：$dp[i][j]$ = 前 $i$ 天、第 $i$ 天选活动 $j$ 的最大得分
- **转移**：$dp[i][j] = \max_{k \neq j} dp[i-1][k] + v[i][j]$

### 核心代码

```cpp
for (int i = 1; i <= n; i++)
    for (int j = 0; j < 3; j++)
        for (int k = 0; k < 3; k++)
            if (j != k)
                dp[i][j] = max(dp[i][j], dp[i-1][k] + v[i][j]);
```

### 复杂度

$O(N)$ 时间（状态数 $3N$，转移 $O(1)$）。

---

## D - Knapsack 1（经典 0/1 背包）

### 题意

$N$ 件物品，重量 $w_i$、价值 $v_i$，背包容量 $W$（$W \le 10^5$）。求最大价值。

### 分析

标准 0/1 背包。$W$ 不大，直接以重量为 DP 维度。

### 状态与转移

- **状态**：$dp[j]$ = 容量恰好为 $j$ 时的最大价值
- **转移**：$dp[j] = \max(dp[j],\; dp[j - w_i] + v_i)$（倒序枚举 $j$）

### 核心代码

```cpp
for (int i = 0; i < n; i++)
    for (int j = W; j >= w[i]; j--)
        dp[j] = max(dp[j], dp[j - w[i]] + v[i]);
```

### 复杂度

$O(NW)$ 时间，$O(W)$ 空间。

---

## E - Knapsack 2（值域优化背包）

### 题意

与 D 相同，但 $W \le 10^9$，$v_i \le 10^3$，$N \le 100$。

### 分析

$W$ 过大无法以重量为维度。但总价值上界 $V = N \cdot \max(v_i) = 10^5$，因此**交换 DP 维度**：以"价值"为下标，记录达到该价值的最小重量。

### 状态与转移

- **状态**：$dp[j]$ = 恰好获得价值 $j$ 时所需的最小重量
- **转移**：$dp[j] = \min(dp[j],\; dp[j - v_i] + w_i)$（倒序枚举 $j$）
- **答案**：满足 $dp[j] \le W$ 的最大 $j$

### 核心代码

```cpp
fill(dp, dp + V + 1, INF);
dp[0] = 0;
for (int i = 0; i < n; i++)
    for (int j = V; j >= v[i]; j--)
        dp[j] = min(dp[j], dp[j - v[i]] + w[i]);
int ans = 0;
for (int j = V; j >= 0; j--)
    if (dp[j] <= W) { ans = j; break; }
```

### 复杂度

$O(N \cdot V)$，其中 $V = N \cdot \max(v_i) \le 10^5$。

---

## F - LCS（最长公共子序列）

### 题意

给两个字符串 $s, t$，求它们的**最长公共子序列**（需输出方案）。

### 分析

经典 LCS + 回溯路径。先求长度，再从 $(|s|, |t|)$ 沿 DP 表回溯构造方案。

### 状态与转移

- **状态**：$dp[i][j]$ = $s[0..i-1]$ 与 $t[0..j-1]$ 的 LCS 长度
- **转移**：
  - $s_i = t_j$：$dp[i][j] = dp[i-1][j-1] + 1$
  - 否则：$dp[i][j] = \max(dp[i-1][j],\; dp[i][j-1])$

### 核心代码

```cpp
// 构造 DP 表
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        if (s[i-1] == t[j-1]) dp[i][j] = dp[i-1][j-1] + 1;
        else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);

// 回溯输出
string res;
int i = n, j = m;
while (i > 0 && j > 0) {
    if (s[i-1] == t[j-1]) { res += s[i-1]; i--; j--; }
    else if (dp[i-1][j] > dp[i][j-1]) i--;
    else j--;
}
reverse(res.begin(), res.end());
```

### 复杂度

$O(|s| \cdot |t|)$。

---

## G - Longest Path（DAG 最长路）

### 题意

给一个 $N$ 点 $M$ 边的有向无环图 (DAG)，求最长路径长度（边数）。

### 分析

DAG 上 DP 经典题。可以用拓扑排序后递推，也可以用记忆化搜索。

### 状态与转移

- **状态**：$dp[v]$ = 从 $v$ 出发的最长路径长度
- **转移**：$dp[v] = \max_{(v,u) \in E} (dp[u] + 1)$

### 核心代码

```cpp
int dfs(int v) {
    if (dp[v] != -1) return dp[v];
    dp[v] = 0;
    for (int u : adj[v])
        dp[v] = max(dp[v], dfs(u) + 1);
    return dp[v];
}
// 答案：max(dp[v]) for all v
```

### 复杂度

$O(N + M)$。

---

## H - Grid 1（网格路径 DP）

### 题意

$H \times W$ 网格，部分格子是墙壁（`#`）。只能向右或向下走，求从 $(1,1)$ 到 $(H,W)$ 的路径数（模 $10^9+7$）。

### 分析

基础网格 DP，遇到墙壁置 0 即可。

### 状态与转移

- **状态**：$dp[i][j]$ = 到达 $(i,j)$ 的路径数
- **转移**：若 $(i,j)$ 不是墙，$dp[i][j] = dp[i-1][j] + dp[i][j-1]$；否则 $dp[i][j] = 0$

### 核心代码

```cpp
dp[0][0] = 1;
for (int i = 0; i < H; i++)
    for (int j = 0; j < W; j++) {
        if (grid[i][j] == '#') { dp[i][j] = 0; continue; }
        if (i > 0) dp[i][j] += dp[i-1][j];
        if (j > 0) dp[i][j] += dp[i][j-1];
        dp[i][j] %= MOD;
    }
```

### 复杂度

$O(HW)$。

---

## I - Coins（概率 DP）

### 题意

$N$ 枚硬币，第 $i$ 枚正面朝上概率为 $p_i$。求正面朝上的硬币数**超过一半**的概率。

### 分析

经典概率 DP。逐枚硬币考虑，维护"当前正面数"的概率分布。

### 状态与转移

- **状态**：$dp[i][j]$ = 前 $i$ 枚硬币中恰好 $j$ 枚正面的概率
- **转移**：$dp[i][j] = dp[i-1][j-1] \cdot p_i + dp[i-1][j] \cdot (1 - p_i)$
- **答案**：$\sum_{j > N/2} dp[N][j]$

### 核心代码

```cpp
dp[0][0] = 1.0;
for (int i = 1; i <= n; i++)
    for (int j = i; j >= 0; j--) {
        dp[i][j] = dp[i-1][j] * (1 - p[i]);
        if (j > 0) dp[i][j] += dp[i-1][j-1] * p[i];
    }
double ans = 0;
for (int j = n/2 + 1; j <= n; j++) ans += dp[n][j];
```

### 复杂度

$O(N^2)$。

---

## J - Sushi（期望 DP）

### 题意

$N$ 个盘子，第 $i$ 个盘子上有 $1 \sim 3$ 个寿司。每次随机选一个盘子，若有寿司则吃一个。求吃完所有寿司的期望操作次数。

### 分析

**关键观察**：盘子的排列顺序无关，只需关注"有 1/2/3 个寿司的盘子各有多少个"。

**状态压缩**：用 $(i, j, k)$ 表示有 $i$ 个 1 寿司盘、$j$ 个 2 寿司盘、$k$ 个 3 寿司盘。

**处理空盘**：选到空盘不改变状态但消耗操作。通过移项消去自环。

### 状态与转移

- **状态**：$dp[i][j][k]$ = 从状态 $(i,j,k)$ 到全部吃完的期望步数
- **转移**（移项后）：

$$dp[i][j][k] = \frac{N + i \cdot dp[i-1][j][k] + j \cdot dp[i+1][j-1][k] + k \cdot dp[i][j+1][k-1]}{i + j + k}$$

### 核心代码

```cpp
for (int k = 0; k <= n; k++)
    for (int j = 0; j + k <= n; j++)
        for (int i = 0; i + j + k <= n; i++) {
            if (i + j + k == 0) continue;
            double s = i + j + k;
            dp[i][j][k] = (double)n / s;
            if (i) dp[i][j][k] += (double)i / s * dp[i-1][j][k];
            if (j) dp[i][j][k] += (double)j / s * dp[i+1][j-1][k];
            if (k) dp[i][j][k] += (double)k / s * dp[i][j+1][k-1];
        }
```

### 复杂度

$O(N^3)$。

---

## K - Stones（博弈 DP）

### 题意

石子堆有 $K$ 个，每次可取集合 $A$ 中的某个数量。不能取者负。问先手是否必胜。

### 分析

经典 Nim 类博弈。枚举剩余石子数，若存在某种取法使对手进入必败态，则当前为必胜态。

### 状态与转移

- **状态**：$dp[i]$ = 剩 $i$ 个石子时，当前玩家是否必胜
- **转移**：$dp[i] = \bigvee_{a \in A,\; a \le i} \neg dp[i - a]$

### 核心代码

```cpp
dp[0] = false; // 无石子可取，当前玩家输
for (int i = 1; i <= K; i++)
    for (int a : A)
        if (a <= i && !dp[i - a])
            dp[i] = true;
```

### 复杂度

$O(K \cdot |A|)$。

---

## L - Deque（区间博弈 DP）

### 题意

长度为 $N$ 的序列，两人轮流从两端取数，各自取到的数之和为得分。双方最优策略下，求先手得分减去后手得分。

### 分析

经典区间博弈模型。定义当前玩家在剩余区间上的"相对优势"来统一先后手。

### 状态与转移

- **状态**：$dp[l][r]$ = 剩余 $[l, r]$ 时，**当前玩家**得分减去对手得分的最大值
- **转移**：$dp[l][r] = \max(a[l] - dp[l+1][r],\; a[r] - dp[l][r-1])$
- **初始**：$dp[i][i] = a[i]$

### 核心代码

```cpp
for (int i = 0; i < n; i++) dp[i][i] = a[i];
for (int len = 2; len <= n; len++)
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        dp[l][r] = max(a[l] - dp[l+1][r], a[r] - dp[l][r-1]);
    }
// 答案：dp[0][n-1]（X 的得分 - Y 的得分）
```

### 复杂度

$O(N^2)$。

---

## M - Candies（前缀和优化 DP）

### 题意

$N$ 个孩子，第 $i$ 个最多分 $a_i$ 颗糖，总共 $K$ 颗糖全部分完。求方案数。

### 分析

朴素转移是 $dp[i][j] = \sum_{x=0}^{a_i} dp[i-1][j-x]$，即连续一段的和 → **前缀和优化**。

### 状态与转移

- **状态**：$dp[i][j]$ = 前 $i$ 个孩子分了 $j$ 颗糖的方案数
- **优化后转移**：$dp[i][j] = S[j] - S[j - a_i - 1]$，其中 $S$ 是 $dp[i-1]$ 的前缀和

### 核心代码

```cpp
dp[0][0] = 1;
for (int i = 1; i <= n; i++) {
    // 建立 dp[i-1] 的前缀和
    vector<long long> pre(K + 2, 0);
    for (int j = 0; j <= K; j++)
        pre[j+1] = (pre[j] + dp[i-1][j]) % MOD;
    for (int j = 0; j <= K; j++) {
        int lo = max(0, j - a[i]);
        dp[i][j] = (pre[j+1] - pre[lo] + MOD) % MOD;
    }
}
```

### 复杂度

$O(NK)$（从 $O(NK \cdot \max a_i)$ 优化而来）。

---

## N - Slimes（区间 DP）

### 题意

$N$ 只史莱姆排成一排，合并相邻两只的代价为二者质量之和，最终合并成一只。求最小总代价。

### 分析

经典区间 DP（石子合并问题）。枚举区间长度和分割点。

### 状态与转移

- **状态**：$dp[l][r]$ = 将 $[l, r]$ 合并成一个的最小代价
- **转移**：$dp[l][r] = \min_{l \le k < r} \big(dp[l][k] + dp[k+1][r] + \text{sum}(l, r)\big)$
- **初始**：$dp[i][i] = 0$

### 核心代码

```cpp
for (int len = 2; len <= n; len++)
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        dp[l][r] = INF;
        for (int k = l; k < r; k++)
            dp[l][r] = min(dp[l][r], dp[l][k] + dp[k+1][r] + pre[r+1] - pre[l]);
    }
```

### 复杂度

$O(N^3)$。

---

## O - Matching（状压 DP）

### 题意

$N$ 个男生和 $N$ 个女生（$N \le 21$），给出兼容矩阵。求完美匹配方案数。

### 分析

用**位掩码**表示已被匹配的女生集合。逐个为男生匹配女生。

### 状态与转移

- **状态**：$dp[S]$ = 前 $\text{popcount}(S)$ 个男生匹配了集合 $S$ 中的女生的方案数
- **转移**：设当前男生编号 $i = \text{popcount}(S)$，枚举 $S$ 中的每一位 $j$：
  - 若 $\text{compatible}[i][j]$：$dp[S] \mathrel{+}= dp[S \setminus \{j\}]$

### 核心代码

```cpp
dp[0] = 1;
for (int S = 1; S < (1 << n); S++) {
    int i = __builtin_popcount(S) - 1; // 当前男生
    for (int j = 0; j < n; j++)
        if ((S >> j & 1) && a[i][j])
            dp[S] = (dp[S] + dp[S ^ (1 << j)]) % MOD;
}
// 答案：dp[(1 << n) - 1]
```

### 复杂度

$O(N \cdot 2^N)$。

---

## P - Independent Set（树形 DP）

### 题意

$N$ 个节点的树，每个节点涂黑或白，相邻节点不能同时为黑。求方案数。

### 分析

经典树形 DP。每个节点维护"涂黑"和"涂白"两种状态。

### 状态与转移

- **状态**：$dp[v][0]$ = $v$ 涂白的方案数，$dp[v][1]$ = $v$ 涂黑的方案数
- **转移**：
  - $dp[v][0] = \prod_c (dp[c][0] + dp[c][1])$（白色时子节点随意）
  - $dp[v][1] = \prod_c dp[c][0]$（黑色时子节点只能白）

### 核心代码

```cpp
void dfs(int v, int par) {
    dp[v][0] = dp[v][1] = 1;
    for (int c : adj[v]) {
        if (c == par) continue;
        dfs(c, v);
        dp[v][0] = dp[v][0] * (dp[c][0] + dp[c][1]) % MOD;
        dp[v][1] = dp[v][1] * dp[c][0] % MOD;
    }
}
// 答案：dp[root][0] + dp[root][1]
```

### 复杂度

$O(N)$。

---

## Q - Flowers（BIT/线段树优化 DP）

### 题意

$N$ 朵花排成一排，第 $i$ 朵高度 $h_i$、美丽值 $a_i$（$h$ 是 $1 \sim N$ 的排列）。从中选出若干朵花，要求高度严格递增，求美丽值之和的最大值。

### 分析

本质是**带权 LIS**。朴素 $O(N^2)$，用 BIT（树状数组）维护"前缀最大值"优化到 $O(N \log N)$。

### 状态与转移

- **状态**：$dp[i]$ = 以第 $i$ 朵结尾的最大美丽值和
- **转移**：$dp[i] = \max_{h_j < h_i} dp[j] + a_i$
- **优化**：BIT 以 $h$ 为下标维护 $dp$ 的前缀最大值

### 核心代码

```cpp
for (int i = 0; i < n; i++) {
    long long best = bit.query(h[i] - 1); // 高度 < h[i] 的最大 dp 值
    dp[i] = best + a[i];
    bit.update(h[i], dp[i]);
}
// 答案：max(dp[i])
```

### 复杂度

$O(N \log N)$。

---

## R - Walk（矩阵快速幂）

### 题意

$N$ 个节点的有向图（$N \le 50$），求长度恰为 $K$（$K \le 10^{18}$）的路径数。

### 分析

经典结论：邻接矩阵 $A$ 的 $K$ 次幂 $A^K$ 中 $(i,j)$ 即为从 $i$ 到 $j$ 长度为 $K$ 的路径数。用**矩阵快速幂**在 $O(N^3 \log K)$ 内完成。

### 核心代码

```cpp
Matrix A = read_adjacency_matrix();
Matrix res = matrix_power(A, K); // 快速幂
long long ans = 0;
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        ans = (ans + res[i][j]) % MOD;
```

### 复杂度

$O(N^3 \log K)$。

---

## S - Digit Sum（数位 DP）

### 题意

给整数 $K$（最多 $10^{10000}$ 位）和 $D$，求 $[1, K]$ 中各位数字之和能被 $D$ 整除的数的个数。

### 分析

经典数位 DP。从高位到低位逐位填写，维护：
- 当前是否仍受上界限制（`tight`）
- 当前数位和对 $D$ 取模的余数

### 状态与转移

- **状态**：$dp[pos][rem][tight]$
  - $pos$：当前处理到第几位
  - $rem$：数位和 $\bmod D$ 的余数
  - $tight$：是否仍紧贴上界
- **转移**：枚举当前位填 $0 \sim 9$（紧贴时上界为 $K$ 的对应位）

### 核心代码

```cpp
long long solve(int pos, int rem, bool tight) {
    if (pos == n) return rem == 0 ? 1 : 0;
    if (memo[pos][rem][tight] != -1) return memo[pos][rem][tight];
    int limit = tight ? (K[pos] - '0') : 9;
    long long res = 0;
    for (int d = 0; d <= limit; d++)
        res += solve(pos + 1, (rem + d) % D, tight && (d == limit));
    return memo[pos][rem][tight] = res % MOD;
}
// 答案：solve(0, 0, true) - 1（减去 0）
```

### 复杂度

$O(|K| \cdot D \cdot 10)$。

---

## T - Permutation（排列计数 DP）

### 题意

给长度 $N-1$ 的由 `<` 和 `>` 组成的字符串 $s$。求满足 $s_i =$ `<` 时 $p_i < p_{i+1}$、$s_i =$ `>` 时 $p_i > p_{i+1}$ 的排列 $p$ 的个数。

### 分析

**插入法 DP**：考虑将 $1 \sim N$ 依次"插入"序列。$dp[i][j]$ 表示前 $i$ 个位置中，第 $i$ 个位置是第 $j$ 小的方案数。用**前缀和**优化转移。

### 状态与转移

- **状态**：$dp[i][j]$ = 长 $i$ 的排列中第 $i$ 位排第 $j$ 小（0-indexed）的方案数
- **转移**：
  - $s_{i-1} =$ `<`：$dp[i][j] = \sum_{k=0}^{j-1} dp[i-1][k]$（前缀和）
  - $s_{i-1} =$ `>`：$dp[i][j] = \sum_{k=j}^{i-2} dp[i-1][k]$（后缀和）

### 核心代码

```cpp
dp[1][0] = 1;
for (int i = 2; i <= n; i++) {
    // 构造前缀和
    vector<long long> pre(i + 1, 0);
    for (int j = 0; j < i - 1; j++)
        pre[j+1] = (pre[j] + dp[i-1][j]) % MOD;
    for (int j = 0; j < i; j++) {
        if (s[i-2] == '<')
            dp[i][j] = (j > 0 ? pre[j] : 0);
        else
            dp[i][j] = (pre[i-1] - (j > 0 ? pre[j] : 0) + MOD) % MOD;
    }
}
```

### 复杂度

$O(N^2)$。

---

## U - Grouping（子集枚举 DP）

### 题意

$N$ 个兔子（$N \le 16$），任意两只有一个亲和分数。将兔子分成若干组，组内所有对的亲和分数之和最大化。

### 分析

**两层状压**：先预处理每个子集 $S$ 的组内得分 $\text{cost}(S)$，然后用"枚举子集的子集"做分组 DP。

### 状态与转移

- **预处理**：$\text{cost}(S) = \sum_{\{i,j\} \subseteq S} a[i][j]$
- **状态**：$dp[S]$ = 集合 $S$ 的最大分组得分
- **转移**：$dp[S] = \max_{T \subset S, T \neq \emptyset} \big(\text{cost}(T) + dp[S \setminus T]\big)$

### 核心代码

```cpp
// 枚举子集的子集
for (int S = 1; S < (1 << n); S++) {
    dp[S] = cost[S]; // 全部放一组
    for (int T = (S - 1) & S; T > 0; T = (T - 1) & S)
        dp[S] = max(dp[S], dp[T] + dp[S ^ T]);
}
```

### 复杂度

$O(3^N)$（枚举子集的子集的经典复杂度）。

---

## V - Subtree（换根 DP）

### 题意

$N$ 个节点的树，对每个节点 $v$，求有多少种黑白染色方案使得 $v$ 为黑且所有黑色节点连通（模 $M$）。

### 分析

**两遍 DFS**：
1. **第一遍（自底向上）**：计算以 $v$ 为根的子树中的方案数 $dp[v]$。
2. **第二遍（自顶向下，换根）**：将"父亲方向"的贡献也考虑进来，得到以 $v$ 为全局根的答案。

**关键技巧**：换根时需要"去掉某个子节点贡献"，用**前缀积 × 后缀积**高效实现。

> **注意**：本题模数 $M$ 不保证是质数，不能用逆元，因此必须用前后缀积。

### 状态与转移

- **自底向上**：$dp[v] = \prod_c (dp[c] + 1)$（$+1$ 表示子树全白的方案）
- **换根**：用前缀积和后缀积，将父亲方向的贡献传递给子节点

### 核心代码

```cpp
// 第一遍 DFS：自底向上
void dfs1(int v, int par) {
    dp[v] = 1;
    for (int c : adj[v]) {
        if (c == par) continue;
        dfs1(c, v);
        dp[v] = dp[v] * (dp[c] + 1) % M;
    }
}

// 第二遍 DFS：换根（前后缀积技巧）
void dfs2(int v, int par, long long from_par) {
    ans[v] = from_par * dp[v] % M;
    vector<long long> children_val;
    for (int c : adj[v])
        if (c != par) children_val.push_back(dp[c] + 1);
    int sz = children_val.size();
    vector<long long> pre(sz + 1, 1), suf(sz + 1, 1);
    for (int i = 0; i < sz; i++) pre[i+1] = pre[i] * children_val[i] % M;
    for (int i = sz - 1; i >= 0; i--) suf[i] = suf[i+1] * children_val[i] % M;
    int idx = 0;
    for (int c : adj[v]) {
        if (c == par) continue;
        long long without_c = from_par * pre[idx] % M * suf[idx+1] % M;
        dfs2(c, v, without_c + 1);
        idx++;
    }
}
```

### 复杂度

$O(N)$。

---

## W - Intervals（线段树优化 DP）

### 题意

长度为 $N$ 的 01 串，$M$ 条规则 $(l_i, r_i, a_i)$：若 $[l_i, r_i]$ 中至少有一个 1 则得 $a_i$ 分。求最大总分。

### 分析

设 $dp[i]$ = 前 $i$ 位中、最后一个 1 在位置 $i$ 的最大得分。转移需要考虑所有右端点为 $i$ 的区间。

**关键观察**：对于区间 $[l, r]$，如果最后一个 1 在 $j$（$l \le j \le r$），则该区间得分被激活。因此转移时，对所有右端点为 $i$ 的区间 $[l_k, i]$，需给 $dp[0..l_k-1]$ 的所有转移值加上 $a_k$。

用**线段树（区间加 + 查全局最大值）**维护。

### 核心代码

```cpp
// 按右端点分组区间
for (int i = 1; i <= n; i++) {
    // 对所有右端点为 i 的区间 [l, i, a]，给线段树 [0, l-1] 区间加 a
    for (auto [l, a] : intervals_ending_at[i])
        seg.range_add(0, l - 1, a);
    dp[i] = seg.query_max(0, i - 1); // 查询 [0, i-1] 最大值
    seg.point_update(i, dp[i]);      // 将 dp[i] 插入线段树位置 i
}
// 答案：max(dp[0], dp[1], ..., dp[n])，其中 dp[0] = 0（全 0 串）
```

### 复杂度

$O((N + M) \log N)$。

---

## X - Tower（贪心排序 + 背包 DP）

### 题意

$N$ 个积木，第 $i$ 个重 $w_i$、可承受 $s_i$、价值 $v_i$。叠成一摞塔，每个积木上方总重不超过 $s_i$。求最大价值。

### 分析

**关键**：先确定积木顺序。直觉上，承受能力强且自身重的放下面。排序准则为 **$w_i + s_i$ 升序**（经典贪心证明：交换相邻两个积木，发现按此顺序不会更差）。

排序后做标准 0/1 背包（以"上方总重"为容量）。

### 核心代码

```cpp
// 贪心排序
sort(blocks.begin(), blocks.end(), [](auto& a, auto& b) {
    return a.w + a.s < b.w + b.s;
});
// 0/1 背包，dp[j] = 上方总重为 j 时的最大价值
for (auto& [w, s, v] : blocks)
    for (int j = s; j >= 0; j--)
        dp[j + w] = max(dp[j + w], dp[j] + v);
// 答案：max(dp[j])
```

### 复杂度

$O(N \cdot \max(w_i + s_i))$。

---

## Y - Grid 2（容斥 + DP）

### 题意

$H \times W$ 网格（$H, W \le 10^5$），有 $N$（$N \le 3000$）个障碍。只能向右或向下走，求从 $(1,1)$ 到 $(H,W)$ 不经过障碍的路径数。

### 分析

网格太大无法逐格 DP，但障碍数很少。用**容斥原理**：

对于每个障碍 $i$，定义 $dp[i]$ = 从起点到障碍 $i$ 的**不经过更靠前障碍**的路径数。最终答案 = 总路径数 - 经过至少一个障碍的路径数。

### 状态与转移

- 将障碍按 $(r, c)$ 排序，终点也当作"障碍"
- **总路径**：$\binom{r+c-2}{r-1}$
- **转移**：$dp[i] = C(\text{start} \to i) - \sum_{j < i,\; r_j \le r_i,\; c_j \le c_i} dp[j] \cdot C(j \to i)$

### 核心代码

```cpp
// 预处理阶乘和逆元
// 障碍按 (r, c) 排序，终点加入末尾
for (int i = 0; i <= n; i++) {
    dp[i] = C(r[i] + c[i] - 2, r[i] - 1); // 起点到 i 的总路径
    for (int j = 0; j < i; j++)
        if (r[j] <= r[i] && c[j] <= c[i])
            dp[i] = (dp[i] - dp[j] * C(r[i]-r[j] + c[i]-c[j], r[i]-r[j])) % MOD;
}
// 答案：dp[n]（终点对应的值）
```

### 复杂度

$O(N^2 + (H+W))$（$N^2$ 容斥 + 预处理组合数）。

---

## Z - Frog 3（斜率优化 DP / CHT）

### 题意

$N$ 块石头，高度 $h_i$，从 $i$ 跳到 $j$（$j > i$）的代价为 $(h_i - h_j)^2 + C$。求从 1 到 $N$ 的最小代价。

### 分析

朴素转移 $dp[j] = \min_i \{dp[i] + (h_j - h_i)^2 + C\}$ 为 $O(N^2)$。

展开平方：$dp[j] = h_j^2 + C + \min_i \{dp[i] + h_i^2 - 2h_i \cdot h_j\}$

令 $y_i = dp[i] + h_i^2$，$k_i = 2h_i$，$x = h_j$，则 $\min_i (y_i - k_i \cdot x)$ 正是**凸包技巧 (Convex Hull Trick)** 的标准形式。

由于 $h_i$ 单调递增，直接用单调栈维护下凸壳即可。

### 核心代码

```cpp
// 用 deque 维护凸壳（斜率递增）
deque<pair<long long, long long>> hull; // (斜率 k, 截距 b)
auto bad = [](auto& a, auto& b, auto& c) {
    // 判断 b 是否被 a 和 c 覆盖
    return (__int128)(c.second - a.second) * (a.first - b.first)
        <= (__int128)(b.second - a.second) * (a.first - c.first);
};

dp[0] = 0;
hull.push_back({2 * h[0], dp[0] + h[0] * h[0]}); // y = kx - b → b = dp+h^2, k = 2h
for (int i = 1; i < n; i++) {
    // 查询最小值：弹出队首
    while (hull.size() > 1) {
        auto [k1, b1] = hull[0];
        auto [k2, b2] = hull[1];
        if (b1 - k1 * h[i] <= b2 - k2 * h[i]) break;
        hull.pop_front();
    }
    dp[i] = hull[0].second - hull[0].first * h[i] + h[i] * h[i] + C;
    // 插入新直线
    pair<long long, long long> line = {2 * h[i], dp[i] + h[i] * h[i]};
    while (hull.size() > 1 && bad(hull[hull.size()-2], hull.back(), line))
        hull.pop_back();
    hull.push_back(line);
}
```

### 复杂度

$O(N)$（每条直线最多入队出队一次）。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **线性 DP** | A, B, C | 基础递推、多状态 |
| **背包 DP** | D, E, X | 经典背包、值域优化、贪心排序 |
| **区间 DP** | N, L | 合并型、博弈型 |
| **树形 DP** | P, V | 独立集计数、换根（前后缀积） |
| **数位 DP** | S | 逐位枚举、tight 标记 |
| **状压 DP** | O, U | 二分图匹配计数、子集枚举 $O(3^n)$ |
| **概率/期望** | I, J | 概率分布递推、状态压缩消环 |
| **博弈论** | K, L | 必胜/必败态、区间博弈 |
| **图上 DP** | G, R | DAG 最长路、矩阵快速幂 |
| **网格 DP** | H, Y | 基础路径计数、容斥原理 |
| **数据结构优化** | M, Q, W | 前缀和、BIT、线段树 |
| **斜率优化** | Z | 凸包技巧 (CHT) |
| **排列计数** | T | 插入式 DP + 前缀和 |
| **LCS** | F | 经典双串 DP + 回溯 |

## 学习路线建议

```
入门：A → B → C → D → E → F → H
        ↓
基础进阶：G → K → L → N → I
        ↓
中级：J → P → S → T → M → Q
        ↓
高级：O → U → R → V → W → X → Y → Z
```

## 解题方法论

1. **明确状态**：DP 的核心是找到"用什么描述子问题"。维度越少越好，但要能完整表达子问题。
2. **写出转移**：先写出朴素转移方程，确认正确性。
3. **优化复杂度**：
   - 前缀和优化（M, T）
   - 数据结构优化（Q, W）
   - 斜率优化 / 凸包技巧（Z）
   - 交换维度（E）
   - 矩阵快速幂（R）
4. **特殊技巧**：
   - 贪心确定顺序后 DP（X）
   - 容斥消除约束（Y）
   - 换根复用子问题（V）
   - 枚举子集的子集 $O(3^n)$（U）
   - 消除自环依赖（J）

> 💡 **记住**：DP 不是一种算法，而是一种**思维框架**。每道题的关键在于如何定义状态和转移，这也是这 26 题最大的训练价值。
