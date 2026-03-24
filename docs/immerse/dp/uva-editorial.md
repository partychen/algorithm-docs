---
title: "UVa 经典 DP 解题报告"
subtitle: "🌐 36 道 UVa 经典 DP 题目的分析方法、解题思路与核心代码"
order: 8
icon: "🌐"
---

# UVa 经典 DP 解题报告

> 来源：[UVa Online Judge](https://onlinejudge.org/)
>
> 本报告针对 UVa 经典 DP 36 题，逐题给出**题意概述 → 分析方法 → 状态设计 → 转移方程 → 核心代码 → 复杂度**，最后做整体总结。

---

## 1. UVa 11400 - Lighting System Design（线性 DP）

### 题意

$N$ 种灯泡，每种有电压 $v_i$、费用 $k_i$（每个灯泡费用）、电源费 $c_i$、需求数 $l_i$。低电压灯可被高电压灯替代（省电源费但增加灯泡费）。求满足所有需求的最小总费用。

### 分析

按电压排序。$dp[i]$ = 满足前 $i$ 种灯泡需求的最小费用。将第 $j+1$ 到 $i$ 种全部替换为第 $i$ 种灯泡。

### 状态与转移

- **状态**：$dp[i]$ = 前 $i$ 种灯的最小总费用
- **转移**：$dp[i] = \min_{0 \le j < i} (dp[j] + c_i + k_i \cdot \text{sumL}(j+1, i))$
  - $\text{sumL}(j+1, i) = \sum_{t=j+1}^{i} l_t$

### 核心代码

```cpp
sort(bulbs, bulbs + n, by voltage);
// 前缀和
for (int i = 1; i <= n; i++) preL[i] = preL[i-1] + l[i];
dp[0] = 0;
for (int i = 1; i <= n; i++) {
    dp[i] = INF;
    for (int j = 0; j < i; j++) {
        long long cost = dp[j] + c[i] + (long long)k[i] * (preL[i] - preL[j]);
        dp[i] = min(dp[i], cost);
    }
}
```

### 复杂度

$O(N^2)$。

---

## 2. UVa 10131 - Is Bigger Smarter?（LIS 变形）

### 题意

$N$ 头大象，每头有体重 $w_i$ 和智商 $s_i$。选出最长子序列使体重严格递增且智商严格递减。输出方案。

### 分析

按体重排序后在智商上做最长严格递减子序列（LIS 变形）。需回溯路径。

### 状态与转移

- 同 HDU 1160 FatMouse's Speed

### 核心代码

```cpp
sort(elephants, by weight asc);
for (int i = 0; i < n; i++) {
    dp[i] = 1; pre[i] = -1;
    for (int j = 0; j < i; j++)
        if (e[j].w < e[i].w && e[j].s > e[i].s && dp[j] + 1 > dp[i]) {
            dp[i] = dp[j] + 1;
            pre[i] = j;
        }
}
```

### 复杂度

$O(N^2)$。

---

## 3. UVa 11790 - Murcia's Skyline（加权 LIS）

### 题意

$N$ 栋建筑有高度 $h_i$ 和宽度 $w_i$。求最长递增子序列（LIS）和最长递减子序列（LDS），长度按宽度加权。输出较大者。

### 分析

两遍 $O(N^2)$ DP：一遍求加权 LIS，一遍求加权 LDS。

### 状态与转移

- **LIS**：$dp_{\text{inc}}[i] = \max_{j < i, h_j < h_i} dp_{\text{inc}}[j] + w_i$
- **LDS**：$dp_{\text{dec}}[i] = \max_{j < i, h_j > h_i} dp_{\text{dec}}[j] + w_i$

### 核心代码

```cpp
for (int i = 0; i < n; i++) {
    dpI[i] = w[i]; dpD[i] = w[i];
    for (int j = 0; j < i; j++) {
        if (h[j] < h[i]) dpI[i] = max(dpI[i], dpI[j] + w[i]);
        if (h[j] > h[i]) dpD[i] = max(dpD[i], dpD[j] + w[i]);
    }
}
```

### 复杂度

$O(N^2)$。

---

## 4. UVa 10149 - Yahtzee（多维 DP）

### 题意

$13$ 轮投骰子（每轮 5 个），分配到 13 个计分项。每项最多用一次。求最大总分。

### 分析

$13! $ 种分配太多。用位掩码 DP：$dp[S]$ = 已使用得分项集合 $S$ 时的最大得分。

### 状态与转移

- **状态**：$dp[S]$ = 已分配集合 $S$ 的最大得分
- **转移**：对每个未使用项 $j$，$dp[S | (1 \ll j)] = \max(dp[S] + \text{score}(\text{round}[|S|], j))$

### 核心代码

```cpp
// 预处理每轮分配到每个项的得分
for (int S = 0; S < (1 << 13); S++) {
    int round = __builtin_popcount(S);
    if (round >= 13) continue;
    for (int j = 0; j < 13; j++) {
        if (S >> j & 1) continue;
        dp[S | (1 << j)] = max(dp[S | (1 << j)],
            dp[S] + score[round][j]);
    }
}
```

### 复杂度

$O(13 \cdot 2^{13})$。

---

## 5. UVa 11404 - Palindromic Subsequence（最长回文子序列 + 构造）

### 题意

给字符串，求最长回文子序列。若有多个，输出字典序最小的。

### 分析

区间 DP 求长度，同时维护字典序最小的方案。用字符串直接存方案。

### 状态与转移

- $dp[i][j]$  = $s[i..j]$ 中字典序最小的最长回文子序列（字符串表示）
- $s[i] = s[j]$：$dp[i][j] = s[i] + dp[i+1][j-1] + s[j]$（单字符时不加两次）
- 否则：取 $dp[i+1][j]$ 和 $dp[i][j-1]$ 中更长的，等长取字典序小的

### 核心代码

```cpp
for (int i = 0; i < n; i++) dp[i][i] = string(1, s[i]);
for (int len = 2; len <= n; len++)
    for (int i = 0; i + len - 1 < n; i++) {
        int j = i + len - 1;
        if (s[i] == s[j]) {
            string mid = (i + 1 <= j - 1) ? dp[i+1][j-1] : "";
            dp[i][j] = s[i] + mid + s[j];
            if (i + 1 > j - 1) dp[i][j] = string(1, s[i]); // 相邻
        } else {
            auto& a = dp[i+1][j]; auto& b = dp[i][j-1];
            dp[i][j] = a.size() > b.size() ? a : (a.size() < b.size() ? b : min(a, b));
        }
    }
```

### 复杂度

$O(N^2 \cdot N)$（字符串操作）。

---

## 6. UVa 787 - Maximum Sub-sequence Product（最大子段积）

### 题意

给整数序列，求连续子段积的最大值。数值可能很大需高精度。

### 分析

类似于最大子段和，但用乘法。需要同时维护最大积和最小积（负×负=正）。使用高精度或 Java BigInteger。

### 状态与转移

- $\text{mx}[i] = \max(a[i],\; a[i] \cdot \text{mx}[i-1],\; a[i] \cdot \text{mn}[i-1])$
- $\text{mn}[i] = \min(a[i],\; a[i] \cdot \text{mx}[i-1],\; a[i] \cdot \text{mn}[i-1])$

### 核心代码

```cpp
// 使用 __int128 或高精度
__int128 mx = a[0], mn = a[0], ans = a[0];
for (int i = 1; i < n; i++) {
    __int128 t1 = a[i] * mx, t2 = a[i] * mn;
    mx = max({(__int128)a[i], t1, t2});
    mn = min({(__int128)a[i], t1, t2});
    ans = max(ans, mx);
}
```

### 复杂度

$O(N)$（忽略高精度因子）。

---

## 7. UVa 562 - Dividing Coins（背包均分）

### 题意

$N$ 枚硬币，分成两堆使差值最小。

### 分析

01 背包，容量为 $\text{sum}/2$，求最接近的可达值。

### 核心代码

```cpp
int sum = accumulate(c, c + n, 0);
int half = sum / 2;
vector<bool> dp(half + 1, false);
dp[0] = true;
for (int i = 0; i < n; i++)
    for (int j = half; j >= c[i]; j--)
        dp[j] = dp[j] || dp[j - c[i]];
for (int j = half; j >= 0; j--)
    if (dp[j]) { printf("%d\n", sum - 2 * j); break; }
```

### 复杂度

$O(N \cdot \text{sum})$。

---

## 8. UVa 624 - CD（01 背包 + 方案输出）

### 题意

$N$ 张 CD 各有时长，总时长不超过 $T$。选若干张使总时长最大。输出选择方案。

### 分析

01 背包 + 方案回溯。

### 核心代码

```cpp
dp[0] = true;
for (int i = 0; i < n; i++)
    for (int j = T; j >= t[i]; j--)
        if (dp[j - t[i]] && !dp[j]) {
            dp[j] = true;
            from[j] = i; // 记录选择
        }
// 从最大可达 j 回溯
```

### 复杂度

$O(NT)$。

---

## 9. UVa 10337 - Flight Planner（网格 DP）

### 题意

飞机从西向东飞 $X$ 英里（每步 1 英里），高度 0~9。每步可上升、下降或平飞，消耗的燃油由风力矩阵决定。初始和终点高度为 0。求最少油耗。

### 分析

网格 DP。$dp[i][h]$ = 在第 $i$ 英里、高度 $h$ 的最小累计油耗。

### 状态与转移

- **转移**：从 $(i, h)$ 可到 $(i+1, h-1)$（上升-20）、$(i+1, h)$（平飞-30）、$(i+1, h+1)$（下降-60），加上风力值

### 核心代码

```cpp
memset(dp, 0x3f, sizeof(dp));
dp[0][0] = 0;
for (int i = 0; i < X; i++)
    for (int h = 0; h <= 9; h++) {
        if (dp[i][h] >= INF) continue;
        // 上升
        if (h + 1 <= 9)
            dp[i+1][h+1] = min(dp[i+1][h+1], dp[i][h] + 60 + wind[9-h-1][i]);
        // 平飞
        dp[i+1][h] = min(dp[i+1][h], dp[i][h] + 30 + wind[9-h][i]);
        // 下降
        if (h - 1 >= 0)
            dp[i+1][h-1] = min(dp[i+1][h-1], dp[i][h] + 20 + wind[9-h+1][i]);
    }
printf("%d\n", dp[X][0]);
```

### 复杂度

$O(10X)$。

---

## 10. UVa 10819 - Trouble of 13-Dots（背包变形）

### 题意

预算 $M$，$N$ 件物品各有价格 $p_i$ 和好感度 $f_i$。若总花费 $> 2000$ 则获得 200 额外预算。求最大好感度。

### 分析

分两种情况：花费 $\le M$ 或花费 $\in [M+1, M+200]$（仅当 $M > 1800$ 有效，因为需要超过 2000 触发奖励）。

### 核心代码

```cpp
int cap = (M > 1800) ? M + 200 : M;
vector<int> dp(cap + 1, 0);
for (int i = 0; i < n; i++)
    for (int j = cap; j >= p[i]; j--)
        dp[j] = max(dp[j], dp[j - p[i]] + f[i]);
int ans = 0;
for (int j = 0; j <= M; j++) ans = max(ans, dp[j]);
if (M > 1800)
    for (int j = 2001; j <= cap; j++) ans = max(ans, dp[j]);
```

### 复杂度

$O(N \cdot (M + 200))$。

---

## 11. UVa 11566 - Let's Yum Cha!（分组背包）

### 题意

$N+1$ 人去饮茶，菜单有 $K$ 道点心。每道点心最多点 2 份。每人对每道评分不同。总消费（含 10% 服务费）不超过预算。一份分给全桌共 $N+1$ 人，每人吃 $\frac{1}{N+1}$ 份。求最大总好感度。

### 分析

分组背包。预算除以 $1.1$ 后取整为实际可用金额。每道菜可选点 0/1/2 份（分组）。

### 核心代码

```cpp
int budget = (int)(total_money / 1.1);
// dp[j] = 花 j 元的最大好感度
for (int dish = 0; dish < K; dish++) {
    int cost = price[dish];
    for (int j = budget; j >= 0; j--) {
        // 点 1 份
        if (j >= cost)
            dp[j] = max(dp[j], dp[j - cost] + val1[dish]);
        // 点 2 份
        if (j >= 2 * cost)
            dp[j] = max(dp[j], dp[j - 2*cost] + val2[dish]);
    }
}
```

### 复杂度

$O(K \cdot \text{budget})$。

---

## 12. UVa 10032 - Tug of War（背包均分）

### 题意

$N$ 人分两队（人数差 $\le 1$），使体重差最小。

### 分析

$dp[j][k]$ = 能否选 $k$ 人且体重和为 $j$。最终在 $k = N/2$ 或 $(N+1)/2$ 中找最接近 $\text{sum}/2$ 的 $j$。

### 核心代码

```cpp
dp[0][0] = true;
for (int i = 0; i < n; i++)
    for (int j = sum; j >= w[i]; j--)
        for (int k = n/2; k >= 1; k--)
            dp[j][k] = dp[j][k] || dp[j - w[i]][k - 1];
// 找最小差
int half = n / 2;
for (int d = 0; d <= sum/2; d++)
    if (dp[sum/2 + d][half] || dp[sum/2 - d][half]) {
        printf("%d %d\n", sum/2 - d, sum - (sum/2 - d));
        break;
    }
```

### 复杂度

$O(N \cdot \text{sum} \cdot N)$。

---

## 13. UVa 10003 - Cutting Sticks（区间 DP）

### 题意

长度 $L$ 的棍子，$N$ 个切割点。每次切割代价为当前段长度。求最小总代价。

### 分析

经典区间 DP（与 AtCoder N - Slimes 等价）。

### 状态与转移

- $dp[i][j] = \min_{i < k < j} (dp[i][k] + dp[k][j]) + (c[j] - c[i])$

### 核心代码

```cpp
c[0] = 0; c[n+1] = L;
for (int len = 2; len <= n + 1; len++)
    for (int i = 0; i + len <= n + 1; i++) {
        int j = i + len;
        dp[i][j] = INF;
        for (int k = i + 1; k < j; k++)
            dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j] + c[j] - c[i]);
    }
```

### 复杂度

$O(N^3)$。

---

## 14. UVa 348 - Optimal Array Multiplication（矩阵链乘）

### 题意

$N$ 个矩阵连乘，求最少乘法次数并输出最优括号方案。

### 分析

经典矩阵链乘区间 DP。

### 状态与转移

- $dp[i][j] = \min_{i \le k < j} (dp[i][k] + dp[k+1][j] + r_i \cdot c_k \cdot c_j)$

### 核心代码

```cpp
for (int len = 2; len <= n; len++)
    for (int i = 0; i + len - 1 < n; i++) {
        int j = i + len - 1;
        dp[i][j] = INF;
        for (int k = i; k < j; k++) {
            long long cost = dp[i][k] + dp[k+1][j] + (long long)r[i] * c[k] * c[j];
            if (cost < dp[i][j]) { dp[i][j] = cost; split[i][j] = k; }
        }
    }
```

### 复杂度

$O(N^3)$。

---

## 15. UVa 10304 - Optimal Binary Search Tree（最优 BST）

### 题意

$N$ 个关键字有频率 $f_i$。构造 BST 使总搜索代价 $\sum f_i \cdot \text{depth}(i)$ 最小（Knuth 最优 BST）。

### 分析

区间 DP。$dp[i][j]$ = 关键字 $[i, j]$ 构成的最优 BST 的最小搜索代价。

### 状态与转移

- $dp[i][j] = \min_{i \le k \le j} (dp[i][k-1] + dp[k+1][j]) + \sum_{t=i}^{j} f_t$
- Knuth 优化可到 $O(N^2)$

### 核心代码

```cpp
for (int len = 1; len <= n; len++)
    for (int i = 0; i + len - 1 < n; i++) {
        int j = i + len - 1;
        dp[i][j] = INF;
        int sum = pre[j+1] - pre[i];
        for (int k = i; k <= j; k++) {
            int left = k > i ? dp[i][k-1] : 0;
            int right = k < j ? dp[k+1][j] : 0;
            dp[i][j] = min(dp[i][j], left + right + sum);
        }
    }
```

### 复杂度

$O(N^3)$（Knuth 优化后 $O(N^2)$）。

---

## 16. UVa 10163 - Storage Keepers（二分 + DP）

### 题意

$N$ 个仓库、$M$ 个看守人（能力值 $p_i$）。每人看 $k$ 个仓库则每个仓库安全值 $\lfloor p_i/k \rfloor$。总安全值 = 所有仓库安全值的最小值。先最大化安全值，再最小化费用。

### 分析

二分安全值 $S$，然后 DP 检查能否用最小费用分配。

### 状态与转移

- 二分 $S$，对每个看守人计算他最多能看几个仓库（$\lfloor p_i/S \rfloor$）
- $dp[j]$ = 覆盖 $j$ 个仓库的最小费用

### 核心代码

```cpp
for (int S = maxP; S >= 0; S--) {
    fill(dp, dp + N + 1, INF);
    dp[0] = 0;
    for (int i = 0; i < M; i++) {
        int cap = S == 0 ? N : p[i] / S;
        for (int j = N; j >= 0; j--)
            if (dp[j] < INF && j + cap <= N)
                dp[min(N, j + cap)] = min(dp[min(N, j + cap)], dp[j] + p[i]);
    }
    if (dp[N] < INF) { /* found: safety=S, cost=dp[N] */ break; }
}
```

### 复杂度

$O(P_{\max} \cdot NM)$。

---

## 17. UVa 10559 - Blocks（区间 DP 高级）

### 题意

一排有色积木，消除连续同色段得 $k^2$ 分（$k$ 为长度）。求最大总分。

### 分析

经典区间 DP 难题。$dp[l][r][k]$ = 区间 $[l, r]$ 且右边还有 $k$ 个与 $a[r]$ 同色积木时的最大得分。

### 状态与转移

- **状态**：$dp[l][r][k]$
- **转移**：
  1. 直接消除右端 $k+1$ 个同色：$dp[l][r-1][0] + (k+1)^2$
  2. 在 $[l, r-1]$ 中找颜色与 $a[r]$ 相同的位置 $m$，将 $[m+1, r-1]$ 先消除：$dp[l][m][k+1] + dp[m+1][r-1][0]$

### 核心代码

```cpp
int solve(int l, int r, int k) {
    if (l > r) return 0;
    if (memo[l][r][k] != -1) return memo[l][r][k];
    int res = solve(l, r-1, 0) + (k+1)*(k+1);
    for (int m = l; m < r; m++)
        if (a[m] == a[r])
            res = max(res, solve(l, m, k+1) + solve(m+1, r-1, 0));
    return memo[l][r][k] = res;
}
```

### 复杂度

$O(N^4)$。

---

## 18. UVa 116 - Unidirectional TSP（网格 DP + 字典序）

### 题意

$m \times n$ 网格，从最左列到最右列，每步向右可走右上/右/右下（行可循环）。求最短路径并输出字典序最小的行号序列。

### 分析

逆序 DP（从右向左），同时记录路径选择。

### 状态与转移

- $dp[i][j]$ = 从 $(i, j)$ 到右边界的最短路
- $dp[i][j] = \min_{d \in \{-1, 0, 1\}} dp[(i+d+m)\%m][j+1] + \text{grid}[i][j]$

### 核心代码

```cpp
for (int j = n - 1; j >= 0; j--)
    for (int i = 0; i < m; i++) {
        dp[i][j] = INF;
        for (int d : {-1, 0, 1}) {
            int ni = (i + d + m) % m;
            int val = (j == n-1) ? grid[i][j] : dp[ni][j+1] + grid[i][j];
            if (val < dp[i][j] || (val == dp[i][j] && ni < next[i][j]))
                { dp[i][j] = val; next[i][j] = ni; }
        }
    }
```

### 复杂度

$O(mn)$。

---

## 19. UVa 10074 - Take the Land（最大子矩阵）

### 题意

$M \times N$ 网格，某些格子是树（障碍）。求最大无障碍矩形面积。

### 分析

逐行构建直方图高度，每行用单调栈求最大矩形（同 LC 85）。

### 核心代码

```cpp
for (int i = 0; i < M; i++) {
    for (int j = 0; j < N; j++)
        h[j] = grid[i][j] ? 0 : h[j] + 1;
    ans = max(ans, largestRectInHistogram(h, N));
}
```

### 复杂度

$O(MN)$。

---

## 20. UVa 11584 - Partitioning by Palindromes（回文最少分割）

### 题意

字符串最少切成几段使每段是回文。

### 分析

预处理 $\text{isPalin}[i][j]$，然后线性 DP。

### 状态与转移

- $dp[i] = \min_{j \le i, \text{isPalin}[j][i]} dp[j-1] + 1$

### 核心代码

```cpp
for (int i = 0; i < n; i++) {
    dp[i] = i + 1; // 最坏：每个字符一段
    for (int j = 0; j <= i; j++)
        if (isPalin[j][i])
            dp[i] = min(dp[i], (j > 0 ? dp[j-1] : 0) + 1);
}
```

### 复杂度

$O(N^2)$。

---

## 21. UVa 357 - Let Me Count The Ways（完全背包方案数）

### 题意

用 1, 5, 10, 25, 50 美分凑出 $N$ 美分，求方案数。

### 分析

完全背包计数（组合数）。

### 核心代码

```cpp
long long dp[30001] = {0};
dp[0] = 1;
int coins[] = {1, 5, 10, 25, 50};
for (int c : coins)
    for (int j = c; j <= 30000; j++)
        dp[j] += dp[j - c];
```

### 复杂度

$O(5N)$。

---

## 22. UVa 10048 - Audiophobia（Floyd 变形）

### 题意

$N$ 个路口 $M$ 条路，每条路有噪音值。求两点间路径上最大噪音的最小值。多次查询。

### 分析

Floyd 变形：$dp[i][j] = \min_k \max(dp[i][k], dp[k][j])$。

### 核心代码

```cpp
for (int k = 0; k < n; k++)
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            dp[i][j] = min(dp[i][j], max(dp[i][k], dp[k][j]));
```

### 复杂度

$O(N^3)$。

---

## 23. UVa 103 - Stacking Boxes（DAG 最长路）

### 题意

$N$ 个 $K$ 维盒子，若盒子 $A$ 每维都严格小于盒子 $B$（排序后），则 $A$ 能嵌套在 $B$ 中。求最大嵌套深度。

### 分析

对每个盒子各维排序，然后建 DAG（$A \to B$ 若 $A$ 可嵌入 $B$）。求 DAG 最长路。

### 核心代码

```cpp
for (int i = 0; i < n; i++) sort(box[i], box[i] + k);
// 建 DAG
for (int i = 0; i < n; i++)
    for (int j = 0; j < n; j++)
        if (fits(box[i], box[j])) adj[i].push_back(j);
// 记忆化求最长路
int dfs(int v) {
    if (dp[v]) return dp[v];
    dp[v] = 1;
    for (int u : adj[v]) dp[v] = max(dp[v], dfs(u) + 1);
    return dp[v];
}
```

### 复杂度

$O(N^2 K)$。

---

## 24. UVa 10029 - Edit Step Ladders（编辑距离变形）

### 题意

字典序排列的单词列表，定义编辑步 = 一次插入/删除/替换。求最长序列使相邻词编辑距离为 1 且字典序递增。

### 分析

对每个单词生成所有编辑距离为 1 的变形，用 map 查找是否存在更小的前驱。

### 核心代码

```cpp
map<string, int> dp;
int ans = 0;
for (auto& w : words) {
    dp[w] = 1;
    // 枚举所有编辑距离 1 的变形（删除一个字符、替换一个字符）
    for (each variant v of w with edit distance 1) {
        if (dp.count(v) && v < w)
            dp[w] = max(dp[w], dp[v] + 1);
    }
    ans = max(ans, dp[w]);
}
```

### 复杂度

$O(N \cdot L^2 \cdot 26)$。

---

## 25. UVa 437 - The Tower of Babylon（DAG DP）

### 题意

$N$ 种长方体（$x, y, z$），每种无限个。叠成塔要求上面的长宽都严格小于下面的。每种有 3 种朝向。求最大高度。

### 分析

与 HDU 1069 Monkey and Banana 相同。

### 核心代码

```cpp
// 生成所有 3N 种摆法，排序后 LIS 式 DP
for (int i = 0; i < tot; i++) {
    dp[i] = blocks[i].h;
    for (int j = 0; j < i; j++)
        if (blocks[j].l < blocks[i].l && blocks[j].w < blocks[i].w)
            dp[i] = max(dp[i], dp[j] + blocks[i].h);
    ans = max(ans, dp[i]);
}
```

### 复杂度

$O((3N)^2)$。

---

## 26. UVa 10635 - Prince and Princess（LCS 转 LIS）

### 题意

两个排列长度分别为 $p+1$ 和 $q+1$（值域 $[1, N^2]$），求 LCS。

### 分析

$p, q$ 可达 $62500$，$O(pq)$ 太慢。经典技巧：将 LCS 转为 LIS。

将第一个排列中元素的位置作为映射，第二个排列中的元素替换为在第一排列中的位置（不存在则删除），然后求 LIS。

### 核心代码

```cpp
// pos[v] = v 在序列 A 中的位置（不存在则 -1）
vector<int> B2;
for (int i = 0; i <= q; i++)
    if (pos[B[i]] != -1) B2.push_back(pos[B[i]]);
// 对 B2 求 LIS
vector<int> tails;
for (int x : B2) {
    auto it = lower_bound(tails.begin(), tails.end(), x);
    if (it == tails.end()) tails.push_back(x);
    else *it = x;
}
printf("%d\n", (int)tails.size());
```

### 复杂度

$O(N^2 \log N)$。

---

## 27. UVa 10100 - Longest Match（LCS 变形）

### 题意

两行文本，按单词分割后求最长公共子序列（以单词为单位）。

### 分析

将每行拆分为单词序列，然后做标准 LCS。

### 核心代码

```cpp
// 拆分单词后做 LCS
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++)
        if (words1[i] == words2[j]) dp[i][j] = dp[i-1][j-1] + 1;
        else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
```

### 复杂度

$O(nm)$。

---

## 28. UVa 11137 - Ingenuous Cubrency（完全背包）

### 题意

用 $1^3, 2^3, 3^3, \ldots, 21^3$ 的面值凑出 $N$，求方案数。

### 分析

完全背包计数。

### 核心代码

```cpp
long long dp[10001] = {0};
dp[0] = 1;
for (int i = 1; i <= 21; i++) {
    int cube = i * i * i;
    for (int j = cube; j <= 10000; j++)
        dp[j] += dp[j - cube];
}
```

### 复杂度

$O(21N)$。

---

## 29. UVa 10534 - Wavio Sequence（LIS 双向 DP）

### 题意

给长 $N$ 的序列，求最长"Wavio 子序列"（先严格递增再严格递减，形如 $\wedge$，长度为奇数 $2k+1$）。

### 分析

从左到右求 LIS 长度 $L[i]$（以 $i$ 结尾），从右到左求 LIS 长度 $R[i]$（以 $i$ 开始）。答案 = $\max_i (2 \cdot \min(L[i], R[i]) - 1)$。

### 状态与转移

- **$L[i]$**：以 $i$ 结尾的 LIS 长度（耐心排序 $O(N \log N)$）
- **$R[i]$**：以 $i$ 开始的 LDS 长度

### 核心代码

```cpp
// 正向 LIS
vector<int> tails;
for (int i = 0; i < n; i++) {
    auto it = lower_bound(tails.begin(), tails.end(), a[i]);
    L[i] = it - tails.begin() + 1;
    if (it == tails.end()) tails.push_back(a[i]);
    else *it = a[i];
}
// 反向 LIS
tails.clear();
for (int i = n - 1; i >= 0; i--) {
    auto it = lower_bound(tails.begin(), tails.end(), a[i]);
    R[i] = it - tails.begin() + 1;
    if (it == tails.end()) tails.push_back(a[i]);
    else *it = a[i];
}
int ans = 1;
for (int i = 0; i < n; i++)
    ans = max(ans, 2 * min(L[i], R[i]) - 1);
```

### 复杂度

$O(N \log N)$。

---

## 30. UVa 10529 - Dumb Bones（期望 DP）

### 题意

$N$ 块多米诺骨牌排成一排。放置第 $i$ 块时，有 $p_l$ 概率向左倒（推倒左侧已放好的）、$p_r$ 概率向右倒（推倒右侧的）。被推倒的需要重放。求放完 $N$ 块的最小期望操作次数。

### 分析

$dp[n]$ = 放 $n$ 块的最小期望次数。枚举最后放的位置 $k$（左边 $k-1$ 块先放好，右边 $n-k$ 块放好，最后放第 $k$ 块）。第 $k$ 块放置期望次数为 $\frac{1}{1 - p_l - p_r}$（加上失败重试）。

### 状态与转移

- $dp[n] = \min_{1 \le k \le n} \big(dp[k-1] + dp[n-k] + E_{\text{place}}(k-1, n-k)\big)$
- $E_{\text{place}}$ 考虑左倒需重放左边 $k-1$ 块、右倒需重放右边 $n-k$ 块

### 核心代码

```cpp
dp[0] = 0; dp[1] = 1.0 / (1 - pl - pr);
for (int n = 2; n <= N; n++) {
    dp[n] = 1e18;
    for (int k = 1; k <= n; k++) {
        double left = dp[k-1], right = dp[n-k];
        double E = (1 + pl * left + pr * right) / (1 - pl - pr);
        dp[n] = min(dp[n], left + right + E);
    }
}
```

### 复杂度

$O(N^2)$。

---

## 31. UVa 11762 - Race to 1（期望 DP）

### 题意

给正整数 $N$，每次随机选一个 $\le N$ 的素数 $p$，若 $p | N$ 则 $N \to N/p$，否则不变。求 $N$ 变为 1 的期望步数。

### 分析

$dp[n]$ = 从 $n$ 到 1 的期望步数。设 $\le n$ 的素数有 $\text{cnt}$ 个，其中 $n$ 的素因子有 $k$ 个。

### 状态与转移

- $dp[n] = \frac{\text{cnt}}{k} + \frac{1}{k} \sum_{p | n, p \text{ prime}} dp[n/p]$

### 核心代码

```cpp
// 预处理素数
dp[1] = 0;
for (int n = 2; n <= MAXN; n++) {
    int cnt = pi[n]; // <= n 的素数个数
    int k = 0;
    double sum = 0;
    for (int p : primes) {
        if (p > n) break;
        if (n % p == 0) { k++; sum += dp[n / p]; }
    }
    if (k == 0) dp[n] = 0;
    else dp[n] = ((double)cnt / k + sum / k);
}
```

### 复杂度

$O(N \cdot \pi(N))$。

---

## 32. UVa 10721 - Bar Codes（计数 DP）

### 题意

用 $k$ 段组成长度 $n$ 的条码，每段宽度 $\in [1, m]$。求方案数。

### 分析

$dp[i][j]$ = 用 $j$ 段组成长度 $i$ 的方案数。

### 状态与转移

- $dp[i][j] = \sum_{w=1}^{m} dp[i - w][j - 1]$（$i - w \ge j - 1$）

### 核心代码

```cpp
dp[0][0] = 1;
for (int j = 1; j <= k; j++)
    for (int i = j; i <= n; i++)
        for (int w = 1; w <= m && w <= i; w++)
            dp[i][j] += dp[i - w][j - 1];
printf("%lld\n", dp[n][k]);
```

### 复杂度

$O(nkm)$。

---

## 33. UVa 991 - Safe Salutations（Catalan 数）

### 题意

$N$ 对人围成一圈，两两握手且不交叉。求方案数。

### 分析

经典 Catalan 数 $C_n = \frac{1}{n+1}\binom{2n}{n}$。

### 核心代码

```cpp
// 预处理 Catalan 数
cat[0] = 1;
for (int i = 1; i <= 10; i++)
    cat[i] = cat[i-1] * 2 * (2*i - 1) / (i + 1);
printf("%lld\n", cat[n]);
```

### 复杂度

$O(N)$。

---

## 34. UVa 10285 - Longest Run on a Snowboard（记忆化搜索）

### 题意

$R \times C$ 网格高度图，只能向更矮的相邻格滑行。求最长路径。

### 分析

与 POJ 1088 滑雪相同。

### 核心代码

```cpp
int dfs(int i, int j) {
    if (dp[i][j]) return dp[i][j];
    dp[i][j] = 1;
    for (int d = 0; d < 4; d++) {
        int ni = i + dx[d], nj = j + dy[d];
        if (valid(ni, nj) && h[ni][nj] < h[i][j])
            dp[i][j] = max(dp[i][j], dfs(ni, nj) + 1);
    }
    return dp[i][j];
}
```

### 复杂度

$O(RC)$。

---

## 35. UVa 10404 - Bachet's Game（博弈 DP）

### 题意

$N$ 个石子，$m$ 种合法取法。取完者胜。判断先手是否必胜。

### 分析

经典博弈 DP（与 AtCoder K - Stones 相同）。

### 状态与转移

- $dp[i] = \bigvee_{a \in A, a \le i} \neg dp[i - a]$

### 核心代码

```cpp
dp[0] = false;
for (int i = 1; i <= N; i++)
    for (int a : A)
        if (a <= i && !dp[i - a])
            dp[i] = true;
```

### 复杂度

$O(N \cdot |A|)$。

---

## 36. UVa 1220 - Party at House of Spring（树形 DP）

### 题意

公司树形层级结构，选人参加派对使没有直接上下级同时出席。求最多人数和方案是否唯一。

### 分析

经典树形 DP（与 POJ 2342 / HDU 1520 Anniversary Party 相同），额外维护唯一性。

### 状态与转移

- $dp[v][0]$ = $v$ 不参加时子树最大人数
- $dp[v][1]$ = $v$ 参加时子树最大人数
- $\text{unique}[v][0/1]$ = 方案是否唯一

### 核心代码

```cpp
void dfs(int v) {
    dp[v][1] = 1; dp[v][0] = 0;
    unique[v][0] = unique[v][1] = true;
    for (int u : children[v]) {
        dfs(u);
        dp[v][1] += dp[u][0];
        unique[v][1] &= unique[u][0];
        if (dp[u][0] > dp[u][1]) {
            dp[v][0] += dp[u][0];
            unique[v][0] &= unique[u][0];
        } else if (dp[u][1] > dp[u][0]) {
            dp[v][0] += dp[u][1];
            unique[v][0] &= unique[u][1];
        } else {
            dp[v][0] += dp[u][0];
            unique[v][0] = false; // 两个选择等价，不唯一
        }
    }
}
```

### 复杂度

$O(N)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **线性/序列 DP** | 1, 2, 3, 5, 6 | 灯泡替代DP、LIS变形、加权LIS、回文构造、最大子段积 |
| **背包 DP** | 7, 8, 9, 10, 11, 12 | 均分、方案回溯、网格背包、变形触发、分组背包 |
| **区间 DP** | 13, 14, 15, 16, 17 | 切割问题、矩阵链乘、最优BST、存储看守、积木消除 |
| **网格/路径 DP** | 18, 19, 20, 21, 34 | 字典序路径、最大矩形、回文分割、完全背包、记忆化搜索 |
| **DAG DP** | 22, 23, 24, 25 | Floyd变形、盒子嵌套、编辑步梯、巴比伦塔 |
| **字符串 DP** | 26, 27, 29 | LCS转LIS、单词LCS、Wavio双向LIS |
| **概率/期望** | 30, 31 | 放置期望、随机因子分解期望 |
| **计数 DP** | 4, 28, 32, 33 | Yahtzee状压、立方完全背包、条码计数、Catalan |
| **博弈/树形** | 35, 36 | Nim型博弈、树形独立集+唯一性 |

## 学习路线建议

```
入门背包：7 → 8 → 21 → 28 → 9
    ↓
线性/序列：2 → 3 → 6 → 1 → 5
    ↓
网格/路径：18 → 19 → 34 → 20
    ↓
区间 DP：13 → 14 → 15 → 16 → 17
    ↓
DAG DP：22 → 23 → 25 → 24
    ↓
字符串 DP：27 → 29 → 26
    ↓
背包进阶：10 → 11 → 12
    ↓
计数 DP：33 → 32 → 4
    ↓
概率/期望：31 → 30
    ↓
博弈/树形：35 → 36
```

## 解题方法论

1. **LCS 转 LIS 的技巧**：当两序列是排列时，将一个序列的值映射为另一个序列中的位置，LCS 变为 LIS，复杂度从 $O(N^2)$ 降到 $O(N \log N)$（题 26）。
2. **积木消除的区间 DP 扩展**：加第三维度 $k$ 记录"粘连"的同色积木数，是区间 DP 的高级技巧（题 17）。
3. **Floyd 变形**：将加法换为 max、最小换为最大，可求最小瓶颈路径等问题（题 22）。
4. **期望 DP 消除自环**：当操作可能"失败"导致状态不变时，通过移项解方程消除自环（题 30, 31）。
5. **背包触发条件**：花费超过阈值获得额外预算时，需考虑分段背包（题 10）。
6. **Catalan 数的识别**：非交叉匹配、合法括号序列、BST 计数等都是 Catalan 数（题 33）。

> **记住**：UVa 题目是《算法竞赛入门经典》和《算法竞赛入门经典训练指南》的配套练习，覆盖了从基础到高级的全面 DP 训练。掌握这 36 题是竞赛 DP 入门的坚实基础。
