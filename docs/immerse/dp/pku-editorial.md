---
title: "POJ 经典DP专题精选解题报告"
subtitle: "📚 36 道 POJ 经典 DP 题目的分析方法、解题思路与核心代码"
order: 6
icon: "📚"
---

# POJ 经典DP专题精选解题报告

> 来源：[POJ (PKU Online Judge)](http://poj.org/)
>
> 本报告针对 POJ 经典 DP 36 题，逐题给出**题意概述 → 分析方法 → 状态设计 → 转移方程 → 核心代码 → 复杂度**，最后做整体总结。

---

## 1. POJ 2229 - Sumsets（计数 DP）

### 题意

将正整数 $N$ 表示为若干个 2 的幂之和，求方案数。

### 分析

$N$ 为奇数时只有一种拆法（在偶数方案加一个 1）；$N$ 为偶数时可以选择加两个 1 或把所有项除以 2。

### 状态与转移

- **状态**：$dp[n]$ = 将 $n$ 拆为 2 的幂之和的方案数
- **转移**：
  - $n$ 为奇数：$dp[n] = dp[n-1]$
  - $n$ 为偶数：$dp[n] = dp[n-1] + dp[n/2]$

### 核心代码

```cpp
dp[0] = 1;
for (int i = 1; i <= n; i++) {
    dp[i] = dp[i-1];
    if (i % 2 == 0) dp[i] += dp[i/2];
    dp[i] %= MOD;
}
```

### 复杂度

$O(N)$。

---

## 2. POJ 3666 - Making the Grade（单调 DP）

### 题意

$N$ 个海拔值，将序列调整为单调不增或不减，修改代价为 $\sum |a_i - b_i|$。求最小代价。

### 分析

关键观察：最优解中 $b_i$ 一定取自原数组的值。离散化后做 DP。

### 状态与转移

- **状态**：$dp[i][j]$ = 前 $i$ 个数、第 $i$ 个取离散化后第 $j$ 个值的最小代价
- **转移**：$dp[i][j] = \min_{k \le j} dp[i-1][k] + |a[i] - v[j]|$（前缀最小值优化）

### 核心代码

```cpp
// 离散化值数组 v[]
for (int i = 1; i <= n; i++) {
    long long mn = dp[i-1][0];
    for (int j = 0; j < m; j++) {
        mn = min(mn, dp[i-1][j]);
        dp[i][j] = mn + abs(a[i] - v[j]);
    }
}
```

### 复杂度

$O(N^2)$（离散化后 $m = N$）。

---

## 3. POJ 1065 - Wooden Sticks（Dilworth 定理）

### 题意

$N$ 根木棍有长度 $l_i$ 和重量 $w_i$。加工时如果当前木棍 $l, w$ 都 $\ge$ 前一根则无额外代价，否则需 1 分钟设置。求最小设置次数。

### 分析

按 $l$ 升序（$l$ 相同按 $w$ 升序）排序后，问题等价于求 $w$ 序列的最长严格递减子序列长度（Dilworth 定理）。

### 状态与转移

- 排序后求 LIS（以 $w$ 严格递减为条件）的长度

### 核心代码

```cpp
sort(sticks, sticks + n, [](auto& a, auto& b) {
    return a.l < b.l || (a.l == b.l && a.w < b.w);
});
// 求 w 序列中最长严格递减子序列 = 需要的链数
vector<int> tails; // 维护各链末尾的最小 w
for (int i = 0; i < n; i++) {
    auto it = upper_bound(tails.begin(), tails.end(), sticks[i].w, greater<int>());
    if (it == tails.end()) tails.push_back(sticks[i].w);
    else *it = sticks[i].w;
}
printf("%d\n", (int)tails.size());
```

### 复杂度

$O(N \log N)$。

---

## 4. POJ 1050 - To the Max（最大子矩阵和）

### 题意

$N \times N$ 矩阵，求最大子矩阵和。

### 分析

枚举上下边界，压成一维后做最大子段和（Kadane）。

### 状态与转移

- 枚举行范围 $[r_1, r_2]$，列前缀和压缩为一维数组
- 对一维数组做最大子段和

### 核心代码

```cpp
int ans = -INF;
for (int r1 = 0; r1 < n; r1++) {
    memset(col, 0, sizeof(col));
    for (int r2 = r1; r2 < n; r2++) {
        for (int j = 0; j < n; j++) col[j] += mat[r2][j];
        int cur = 0;
        for (int j = 0; j < n; j++) {
            cur = max(col[j], cur + col[j]);
            ans = max(ans, cur);
        }
    }
}
```

### 复杂度

$O(N^3)$。

---

## 5. POJ 2479 - Maximum sum（两段最大子段和）

### 题意

将数组分成两段（非空），求两段各自最大子段和之和的最大值。

### 分析

预处理 $L[i]$ = $[0, i]$ 的最大子段和，$R[i]$ = $[i, N-1]$ 的最大子段和。答案 = $\max_i (L[i] + R[i+1])$。

### 状态与转移

- $L[i] = \max(L[i-1],\; \text{Kadane ending at } i)$
- $R[i] = \max(R[i+1],\; \text{Kadane starting at } i)$

### 核心代码

```cpp
// L[i]: max subarray sum in [0..i]
int cur = a[0]; L[0] = a[0];
for (int i = 1; i < n; i++) {
    cur = max(a[i], cur + a[i]);
    L[i] = max(L[i-1], cur);
}
// R[i]: max subarray sum in [i..n-1]
cur = a[n-1]; R[n-1] = a[n-1];
for (int i = n-2; i >= 0; i--) {
    cur = max(a[i], cur + a[i]);
    R[i] = max(R[i+1], cur);
}
int ans = -INF;
for (int i = 0; i < n - 1; i++) ans = max(ans, L[i] + R[i+1]);
```

### 复杂度

$O(N)$。

---

## 6. POJ 2593 - Max Sequence（同 5）

### 题意

与 POJ 2479 相同。

### 分析

同上，两段最大子段和。

### 复杂度

$O(N)$。

---

## 7. POJ 1742 - Coins（多重背包优化）

### 题意

$N$ 种硬币，面值 $a_i$、数量 $c_i$。求 $[1, M]$ 中有多少值能凑出。

### 分析

多重背包可达性问题。用"$\text{used}[j]$"优化：$\text{used}[j]$ 记录凑出 $j$ 时第 $i$ 种硬币已用了几枚。

### 状态与转移

- 对每种硬币 $i$，正序扫描 $j$：若 $dp[j]$ 已可达则 $\text{used}[j] = 0$；否则若 $dp[j - a_i]$ 可达且 $\text{used}[j - a_i] < c_i$，则设 $dp[j] = \text{true}$，$\text{used}[j] = \text{used}[j - a_i] + 1$

### 核心代码

```cpp
dp[0] = true;
for (int i = 0; i < n; i++) {
    memset(used, 0, sizeof(used));
    for (int j = a[i]; j <= M; j++) {
        if (dp[j]) { used[j] = 0; continue; }
        if (dp[j - a[i]] && used[j - a[i]] < c[i]) {
            dp[j] = true;
            used[j] = used[j - a[i]] + 1;
        }
    }
}
int ans = 0;
for (int j = 1; j <= M; j++) ans += dp[j];
```

### 复杂度

$O(NM)$。

---

## 8. POJ 1276 - Cash Machine（多重背包）

### 题意

ATM 中有 $N$ 种面额纸币各 $n_i$ 张。求不超过现金需求 $M$ 的最大取款额。

### 分析

多重背包（二进制拆分）求最大值。

### 状态与转移

- 二进制拆分后 01 背包

### 核心代码

```cpp
dp[0] = true;
for (int i = 0; i < N; i++) {
    int num = n[i], val = d[i];
    for (int k = 1; num > 0; k <<= 1) {
        int take = min(k, num); num -= take;
        int v = take * val;
        for (int j = M; j >= v; j--)
            dp[j] = dp[j] || dp[j - v];
    }
}
for (int j = M; j >= 0; j--)
    if (dp[j]) { printf("%d\n", j); break; }
```

### 复杂度

$O(NM \log C)$。

---

## 9. POJ 1014 - Dividing（多重背包均分）

### 题意

6 种价值 1~6 的弹珠各 $n_i$ 个，判断能否平分为两堆使价值相等。

### 分析

总价值为奇数则不可能。否则多重背包判断能否凑出 $\text{sum}/2$。

### 核心代码

```cpp
int sum = 0;
for (int i = 1; i <= 6; i++) sum += i * n[i];
if (sum & 1) { puts("Can't be divided."); return; }
int half = sum / 2;
// 多重背包可达性
```

### 复杂度

$O(6 \cdot \text{sum}/2 \cdot \log C)$。

---

## 10. POJ 1837 - Balance（背包变形）

### 题意

天平上有 $C$ 个挂钩（位置可正可负），$G$ 个砝码。将所有砝码挂上使天平平衡。求方案数。

### 分析

力矩背包。$dp[\text{torque}]$ = 达到该力矩的方案数。力矩可为负，用偏移量处理。

### 状态与转移

- **状态**：$dp[j]$ = 当前力矩为 $j$ 的方案数（$j$ 有偏移）
- **转移**：$dp[j + w_k \cdot \text{pos}[c]] \mathrel{+}= dp[j]$

### 核心代码

```cpp
const int OFFSET = 7500;
dp[OFFSET] = 1; // 初始力矩 0
for (int k = 0; k < G; k++) {
    for (int j = 15000; j >= 0; j--) { // 倒序或另开数组
        if (dp[j] == 0) continue;
        for (int c = 0; c < C; c++) {
            int nj = j + w[k] * pos[c];
            if (nj >= 0 && nj <= 15000)
                ndp[nj] += dp[j];
        }
    }
    swap(dp, ndp);
}
printf("%lld\n", dp[OFFSET]);
```

### 复杂度

$O(G \cdot C \cdot \text{range})$。

---

## 11. POJ 2392 - Space Elevator（多重背包 + 排序）

### 题意

$K$ 种积木，高度 $h_i$、高度上限 $a_i$（该种积木必须在高度 $\le a_i$ 处）、数量 $c_i$。求最高电梯高度。

### 分析

按 $a_i$ 升序排序（贪心：上限小的先放），然后做多重背包。

### 状态与转移

- 排序后多重背包，$dp[j]$ = 高度 $j$ 是否可达
- 答案 = 可达的最大 $j$

### 核心代码

```cpp
sort(blocks, blocks + K, [](auto& a, auto& b) { return a.a < b.a; });
dp[0] = true;
for (int i = 0; i < K; i++) {
    memset(used, 0, sizeof(used));
    for (int j = blocks[i].h; j <= blocks[i].a; j++) {
        if (dp[j]) continue;
        if (dp[j - blocks[i].h] && used[j - blocks[i].h] < blocks[i].c) {
            dp[j] = true;
            used[j] = used[j - blocks[i].h] + 1;
        }
    }
}
```

### 复杂度

$O(K \cdot A_{\max})$。

---

## 12. POJ 3211 - Washing Clothes（背包均分）

### 题意

$M$ 件衣服各有颜色和清洗时间。两人同时洗，同色必须全洗完再洗下一种颜色。每种颜色下两人分工最小化时间。求总最少时间。

### 分析

按颜色分组。每组独立做 01 背包均分（最优分配使两人时间的最大值最小）。

### 核心代码

```cpp
int total_time = 0;
for (each color group) {
    int sum = sum of wash times;
    // 01 背包求最大的 j <= sum/2 使 dp[j] = true
    dp[0] = true;
    for (int t : times_in_group)
        for (int j = sum/2; j >= t; j--)
            dp[j] = dp[j] || dp[j - t];
    int best = 0;
    for (int j = sum/2; j >= 0; j--)
        if (dp[j]) { best = j; break; }
    total_time += sum - best; // max(best, sum - best)
}
```

### 复杂度

$O(\text{colors} \cdot \text{sum}^2)$。

---

## 13. POJ 1141 - Brackets Sequence（区间 DP + 路径）

### 题意

给括号序列，添加最少括号使其合法。输出合法序列。

### 分析

区间 DP 求最少添加数，然后回溯构造方案。

### 状态与转移

- **状态**：$dp[i][j]$ = 使 $s[i..j]$ 合法的最少添加数
- **转移**：
  - 若 $s[i], s[j]$ 匹配：$dp[i][j] = dp[i+1][j-1]$
  - $dp[i][j] = \min_{i \le k < j} (dp[i][k] + dp[k+1][j])$

### 核心代码

```cpp
for (int i = 0; i < n; i++) dp[i][i] = 1;
for (int len = 2; len <= n; len++)
    for (int i = 0; i + len - 1 < n; i++) {
        int j = i + len - 1;
        dp[i][j] = INF;
        if (match(s[i], s[j]))
            dp[i][j] = (i+1 <= j-1) ? dp[i+1][j-1] : 0;
        for (int k = i; k < j; k++)
            if (dp[i][k] + dp[k+1][j] < dp[i][j]) {
                dp[i][j] = dp[i][k] + dp[k+1][j];
                split[i][j] = k;
            }
    }
// 回溯构造
```

### 复杂度

$O(N^3)$。

---

## 14. POJ 2955 - Brackets（区间 DP）

### 题意

给括号序列，求最长合法括号子序列长度。

### 分析

区间 DP。

### 状态与转移

- $s[i], s[j]$ 匹配：$dp[i][j] = dp[i+1][j-1] + 2$
- $dp[i][j] = \max_{i \le k < j} (dp[i][k] + dp[k+1][j])$

### 核心代码

```cpp
for (int len = 2; len <= n; len++)
    for (int i = 0; i + len - 1 < n; i++) {
        int j = i + len - 1;
        if (match(s[i], s[j]))
            dp[i][j] = dp[i+1][j-1] + 2;
        for (int k = i; k < j; k++)
            dp[i][j] = max(dp[i][j], dp[i][k] + dp[k+1][j]);
    }
```

### 复杂度

$O(N^3)$。

---

## 15. POJ 1651 - Multiplication Puzzle（区间 DP）

### 题意

一排 $N$ 张牌，每次取走一张（非首尾），得分为该牌与左右邻牌之积。求最小总得分。

### 分析

区间 DP，类似矩阵链乘。

### 状态与转移

- $dp[i][j] = \min_{i < k < j} (dp[i][k] + dp[k][j] + a[i] \cdot a[k] \cdot a[j])$

### 核心代码

```cpp
for (int len = 3; len <= n; len++)
    for (int i = 0; i + len - 1 < n; i++) {
        int j = i + len - 1;
        dp[i][j] = INF;
        for (int k = i + 1; k < j; k++)
            dp[i][j] = min(dp[i][j], dp[i][k] + dp[k][j] + a[i]*a[k]*a[j]);
    }
```

### 复杂度

$O(N^3)$。

---

## 16. POJ 3280 - Cheapest Palindrome（回文补全）

### 题意

长度 $M$ 的字符串，含 $N$ 种字符。可以插入或删除字符（各有代价），使其变为回文。求最小代价。

### 分析

区间 DP。$dp[i][j]$ = 使 $s[i..j]$ 变为回文的最小代价。

### 状态与转移

- $s[i] = s[j]$：$dp[i][j] = dp[i+1][j-1]$
- 否则：$dp[i][j] = \min(dp[i+1][j] + \text{cost}[s[i]],\; dp[i][j-1] + \text{cost}[s[j]])$
  - $\text{cost}[c] = \min(\text{ins}[c], \text{del}[c])$

### 核心代码

```cpp
for (int len = 2; len <= M; len++)
    for (int i = 0; i + len - 1 < M; i++) {
        int j = i + len - 1;
        dp[i][j] = min(dp[i+1][j] + cost[s[i]], dp[i][j-1] + cost[s[j]]);
        if (s[i] == s[j]) dp[i][j] = min(dp[i][j], dp[i+1][j-1]);
    }
```

### 复杂度

$O(M^2)$。

---

## 17. POJ 1160 - Post Office（邮局选址）

### 题意

$V$ 个村庄在数轴上，建 $P$ 个邮局使村庄到最近邮局距离之和最小。

### 分析

$dp[i][j]$ = 前 $i$ 个村庄建 $j$ 个邮局的最小代价。预处理 $w[l][r]$ = 区间 $[l, r]$ 只建一个邮局的最小代价（在中位数处）。

### 状态与转移

- $dp[i][j] = \min_{k < i} (dp[k][j-1] + w[k+1][i])$

### 核心代码

```cpp
// 预处理 w[l][r]
for (int l = 0; l < V; l++)
    for (int r = l; r < V; r++) {
        int mid = pos[(l + r) / 2];
        w[l][r] = 0;
        for (int i = l; i <= r; i++) w[l][r] += abs(pos[i] - mid);
    }
for (int i = 0; i < V; i++) dp[i][1] = w[0][i];
for (int j = 2; j <= P; j++)
    for (int i = j - 1; i < V; i++) {
        dp[i][j] = INF;
        for (int k = j - 2; k < i; k++)
            dp[i][j] = min(dp[i][j], dp[k][j-1] + w[k+1][i]);
    }
```

### 复杂度

$O(V^2 P)$。

---

## 18. POJ 1088 - 滑雪（记忆化搜索）

### 题意

$R \times C$ 网格，每格有高度。只能向四邻域更低的格子滑。求最长下降路径。

### 分析

DAG 上最长路，记忆化 DFS。

### 状态与转移

- $dp[i][j]$ = 从 $(i, j)$ 出发的最长路径
- $dp[i][j] = 1 + \max_{(i', j') \text{ adjacent}, h[i'][j'] < h[i][j]} dp[i'][j']$

### 核心代码

```cpp
int dfs(int i, int j) {
    if (dp[i][j]) return dp[i][j];
    dp[i][j] = 1;
    int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
    for (int d = 0; d < 4; d++) {
        int ni = i + dx[d], nj = j + dy[d];
        if (ni >= 0 && ni < R && nj >= 0 && nj < C && h[ni][nj] < h[i][j])
            dp[i][j] = max(dp[i][j], dfs(ni, nj) + 1);
    }
    return dp[i][j];
}
```

### 复杂度

$O(RC)$。

---

## 19. POJ 3186 - Treats for the Cows（区间 DP）

### 题意

$N$ 份零食排成一行，可从首或尾取。第 $k$ 次取得零食价值 $\times k$。求最大总价值。

### 分析

区间 DP。$dp[l][r]$ = 剩余 $[l, r]$ 时继续取的最大价值。

### 状态与转移

- **状态**：$dp[l][r]$ = 剩余 $[l, r]$ 的最大总价值
- **转移**：设已取 $t = N - (r - l)$ 次
  - $dp[l][r] = \max(a[l-1] \cdot t + dp[l+1][r],\; a[r+1] \cdot t + dp[l][r-1])$（逆向思考）

或用另一种方式：$dp[l][r]$ = 从 $[l, r]$ 中按顺序取的最大值。

### 核心代码

```cpp
// 逆序：dp[l][r] = 剩下 [l,r] 还没取时的最大后续得分
for (int len = 1; len <= n; len++)
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        int turn = n - len + 1;
        dp[l][r] = max(a[l] * turn + (l+1 <= r ? dp[l+1][r] : 0),
                       a[r] * turn + (l <= r-1 ? dp[l][r-1] : 0));
    }
printf("%d\n", dp[0][n-1]);
```

### 复杂度

$O(N^2)$。

---

## 20. POJ 1952 - BUY LOW, BUY LOWER（LIS 计数去重）

### 题意

求最长严格递减子序列长度和去重方案数。

### 分析

LIS（递减版本）+ 计数。去重：若 $a[i] = a[j]$ 且 $j < i$ 且 $dp[i] = dp[j]$，则不重复计数。

### 状态与转移

- $dp[i]$ = 以 $i$ 结尾的最长递减子序列长度
- $cnt[i]$ = 去重方案数

### 核心代码

```cpp
for (int i = 0; i < n; i++) {
    dp[i] = 1; cnt[i] = 1;
    for (int j = 0; j < i; j++)
        if (a[j] > a[i]) {
            if (dp[j] + 1 > dp[i]) { dp[i] = dp[j] + 1; cnt[i] = cnt[j]; }
            else if (dp[j] + 1 == dp[i]) cnt[i] += cnt[j];
        }
    // 去重：如果前面有相同值且同样长度，减去
    for (int j = 0; j < i; j++)
        if (a[j] == a[i] && dp[j] == dp[i]) cnt[i] -= cnt[j];
}
```

### 复杂度

$O(N^2)$。

---

## 21. POJ 2411 - Mondriaan's Dream（状压 DP）

### 题意

$H \times W$（$H, W \le 11$）网格用 $1 \times 2$ 或 $2 \times 1$ 骨牌完全覆盖。求方案数。

### 分析

逐行状压。位掩码表示哪些列被上一行的竖放骨牌"占住"。

### 状态与转移

- **状态**：$dp[i][S]$ = 第 $i$ 行、向下突出状态为 $S$ 的方案数
- **转移**：枚举当前行的放法，检查合法性（无冲突、横放必须成对）

### 核心代码

```cpp
// 预处理合法转移
void generate(int col, int prevS, int curS, int newS) {
    if (col == W) { trans[prevS].push_back(newS); return; }
    if (prevS >> col & 1) { // 上一行向下突出，当前行被占
        generate(col + 1, prevS, curS, newS);
    } else {
        // 竖放（向下突出）
        generate(col + 1, prevS, curS, newS | (1 << col));
        // 横放
        if (col + 1 < W && !(prevS >> (col+1) & 1))
            generate(col + 2, prevS, curS, newS);
    }
}
```

### 复杂度

$O(H \cdot 2^W \cdot \text{transitions})$。

---

## 22. POJ 1185 - 炮兵阵地（状压 DP）

### 题意

$N \times M$（$M \le 10$）网格，放炮兵使得同行同列间距 $\ge 3$ 且不在障碍上。求最多放多少炮兵。

### 分析

逐行状压。需记录前两行的状态（因为炮兵影响两行）。

### 状态与转移

- **状态**：$dp[i][S_1][S_2]$ = 第 $i$ 行状态 $S_1$、第 $i-1$ 行状态 $S_2$ 的最大炮兵数
- **合法性**：$S$ 无相邻两位间距 $< 3$，$S$ 不与地形冲突，$S_1 \mathbin{\&} S_2 = 0$，$S_1 \mathbin{\&} S_0 = 0$

### 核心代码

```cpp
// 预处理合法状态（行内间距 >= 3）
for (int S = 0; S < (1 << M); S++)
    if (!(S & (S << 1)) && !(S & (S << 2)))
        valid.push_back(S);
// 三层转移
for (int i = 0; i < N; i++)
    for (int s1 : valid)
        if (!(s1 & terrain[i]))
            for (int s2 : valid)
                if (!(s1 & s2))
                    for (int s0 : valid)
                        if (!(s1 & s0) && !(s2 & s0))
                            dp[i][s1][s2] = max(...);
```

### 复杂度

$O(N \cdot V^3)$，$V$ 约 60。

---

## 23. POJ 3254 - Corn Fields（状压 DP 入门）

### 题意

$M \times N$（$N \le 12$）网格，某些格子不可选。选的格子不相邻。求方案数。

### 分析

标准逐行状压 DP。

### 状态与转移

- $dp[i][S]$ = 第 $i$ 行状态 $S$ 的方案数
- 合法：$(S \mathbin{\&} (S \ll 1)) = 0$ 且 $(S \mathbin{\&} \text{terrain}[i]) = 0$ 且 $(S \mathbin{\&} S') = 0$

### 核心代码

```cpp
dp[0][0] = 1;
for (int S : valid)
    if (!(S & ~fertile[0])) dp[0][S] = 1;
for (int i = 1; i < M; i++)
    for (int S : valid)
        if (!(S & ~fertile[i]))
            for (int S2 : valid)
                if (!(S & S2))
                    dp[i][S] = (dp[i][S] + dp[i-1][S2]) % MOD;
```

### 复杂度

$O(M \cdot V^2)$。

---

## 24. POJ 2836 - Rectangular Covering（状压 DP + 枚举）

### 题意

$N$（$\le 15$）个点，用若干矩形覆盖所有点，矩形面积之和最小。矩形边平行坐标轴。

### 分析

枚举所有点对定义的矩形，每个矩形覆盖的点集用位掩码表示。然后做集合覆盖 DP。

### 状态与转移

- 预处理每个矩形的覆盖掩码和面积
- $dp[S]$ = 覆盖集合 $S$ 的最小面积
- $dp[S | \text{mask}[r]] = \min(dp[S] + \text{area}[r])$

### 核心代码

```cpp
memset(dp, 0x3f, sizeof(dp));
dp[0] = 0;
for (int S = 0; S < (1 << n); S++) {
    if (dp[S] >= INF) continue;
    for (each rectangle r)
        dp[S | mask[r]] = min(dp[S | mask[r]], dp[S] + area[r]);
}
printf("%d\n", dp[(1 << n) - 1]);
```

### 复杂度

$O(N^2 \cdot 2^N)$。

---

## 25. POJ 1795 - DNA Laboratory（TSP + 字符串拼接）

### 题意

$N$（$\le 15$）个 DNA 片段，找最短超串包含所有片段。多解输出字典序最小的。

### 分析

先去重（被其他片段包含的可删除），然后预处理重叠长度。状压 DP（TSP 变形）。回溯构造字典序最小的方案。

### 状态与转移

- $dp[S][i]$ = 已拼接集合 $S$、最后一个是 $i$ 的最短长度
- 回溯构造时按字典序选择

### 核心代码

```cpp
// 预处理 overlap[i][j]
for (int S = 1; S < (1 << n); S++)
    for (int i = 0; i < n; i++) {
        if (!(S >> i & 1)) continue;
        for (int j = 0; j < n; j++) {
            if (j == i || !(S >> j & 1)) continue;
            int prev = S ^ (1 << i);
            dp[S][i] = min(dp[S][i], dp[prev][j] + len[i] - overlap[j][i]);
        }
    }
```

### 复杂度

$O(N^2 \cdot 2^N)$。

---

## 26. POJ 2486 - Apple Tree（树形背包）

### 题意

$N$ 个节点的苹果树，每个节点有苹果数。从节点 1 出发，走 $K$ 步（可回头）。求最多吃多少苹果。

### 分析

树形背包。$dp[v][j][0/1]$ = 在 $v$ 子树、走了 $j$ 步、是否返回 $v$ 的最大苹果数。

### 状态与转移

- $dp[v][j][1]$ = 走 $j$ 步回到 $v$ 的最大苹果
- $dp[v][j][0]$ = 走 $j$ 步不回来的最大苹果
- 合并子树时讨论"进子树并返回"和"进子树不返回"

### 核心代码

```cpp
void dfs(int v, int par) {
    dp[v][0][0] = dp[v][0][1] = apple[v];
    for (int u : adj[v]) {
        if (u == par) continue;
        dfs(u, v);
        for (int j = K; j >= 0; j--) {
            for (int t = 0; t <= j; t++) {
                // 返回：dp[v][j][1] = max(dp[v][j-t][1] + dp[u][t-2][1])
                if (t >= 2)
                    dp[v][j][1] = max(dp[v][j][1], dp[v][j-t][1] + dp[u][t-2][1]);
                // 不返回两种情况
                if (t >= 1)
                    dp[v][j][0] = max(dp[v][j][0], dp[v][j-t][1] + dp[u][t-1][0]);
                if (t >= 2)
                    dp[v][j][0] = max(dp[v][j][0], dp[v][j-t][0] + dp[u][t-2][1]);
            }
        }
    }
}
```

### 复杂度

$O(NK^2)$。

---

## 27. POJ 1947 - Rebuilding Roads（树形背包）

### 题意

$N$ 个节点的树，删除最少边使某棵子树恰好有 $P$ 个节点。

### 分析

树形背包。$dp[v][j]$ = $v$ 的子树保留 $j$ 个节点需要删的最少边数。

### 状态与转移

- **状态**：$dp[v][j]$ = 保留 $j$ 个节点的最少删边数
- **转移**：合并子树时像分组背包
- 删除整个子树 $u$ 需断 1 条边

### 核心代码

```cpp
void dfs(int v, int par) {
    dp[v][1] = adj[v].size() - (par != -1 ? 1 : 0); // 删所有子边
    // 实际上：dp[v][1] = children count (断开所有子树)
    for (int u : adj[v]) {
        if (u == par) continue;
        dfs(u, v);
        for (int j = sz[v]; j >= 1; j--)
            for (int k = 1; k <= sz[u]; k++)
                dp[v][j + k] = min(dp[v][j + k], dp[v][j] + dp[u][k] - 1);
    }
}
// 答案：min over all v of dp[v][P] + (v != root ? 1 : 0)
```

### 复杂度

$O(NP^2)$。

---

## 28. POJ 2385 - Apple Catching（线性 DP）

### 题意

两棵苹果树交替掉苹果（$T$ 分钟），Bessie 初始在树 1 下，最多移动 $W$ 次（在两棵树间切换）。求最多接几个苹果。

### 分析

$dp[i][j]$ = 前 $i$ 分钟移动了 $j$ 次时接到的最多苹果。当前位置由 $j$ 的奇偶性决定。

### 状态与转移

- **状态**：$dp[i][j]$ = 前 $i$ 分钟、移动 $j$ 次的最多苹果
- **转移**：
  - 不移动：$dp[i][j] = dp[i-1][j]$
  - 移动：$dp[i][j] = \max(dp[i][j],\; dp[i-1][j-1])$
  - 加上当前位置（$j$ 偶在树1，奇在树2）是否有苹果

### 核心代码

```cpp
for (int i = 1; i <= T; i++)
    for (int j = 0; j <= W; j++) {
        dp[i][j] = dp[i-1][j];
        if (j > 0) dp[i][j] = max(dp[i][j], dp[i-1][j-1]);
        int pos = (j % 2 == 0) ? 1 : 2;
        if (tree[i] == pos) dp[i][j]++;
    }
int ans = 0;
for (int j = 0; j <= W; j++) ans = max(ans, dp[T][j]);
```

### 复杂度

$O(TW)$。

---

## 29. POJ 1155 - TELE（树形背包）

### 题意

电视转播树，根为发射站，叶子为用户（愿付费 $c_i$）。内部边有费用。求在不亏本的前提下最多服务的用户数。

### 分析

树形背包。$dp[v][j]$ = 从 $v$ 出发服务 $j$ 个用户的最大净利润。

### 状态与转移

- 叶子节点 $v$：$dp[v][1] = c_v$，$dp[v][0] = 0$
- 非叶子节点：合并子树时扣除边费用

### 核心代码

```cpp
void dfs(int v) {
    if (isLeaf[v]) { dp[v][0] = 0; dp[v][1] = pay[v]; sz[v] = 1; return; }
    dp[v][0] = 0; sz[v] = 0;
    for (auto [u, cost] : children[v]) {
        dfs(u);
        for (int j = sz[v]; j >= 0; j--)
            for (int k = 1; k <= sz[u]; k++)
                dp[v][j + k] = max(dp[v][j + k], dp[v][j] + dp[u][k] - cost);
        sz[v] += sz[u];
    }
}
// 答案：max j where dp[root][j] >= 0
```

### 复杂度

$O(N^2)$。

---

## 30. POJ 3252 - Round Numbers（数位 DP）

### 题意

$[a, b]$ 中"Round Number"的个数。Round Number = 二进制中 0 的个数 $\ge$ 1 的个数。

### 分析

数位 DP，二进制逐位枚举，维护 0 和 1 的个数差。

### 状态与转移

- **状态**：$dp[pos][\text{diff}][tight][leading\_zero]$
- 终态：$\text{diff} \ge 0$

### 核心代码

```cpp
int dfs(int pos, int diff, bool tight, bool lead) {
    if (pos < 0) return lead ? 0 : (diff >= 0);
    if (memo[pos][diff+32][tight][lead] != -1) return memo[...];
    int limit = tight ? bits[pos] : 1;
    int res = 0;
    for (int d = 0; d <= limit; d++) {
        if (lead && d == 0)
            res += dfs(pos-1, 0, tight && d == limit, true);
        else
            res += dfs(pos-1, diff + (d == 0 ? 1 : -1), tight && d == limit, false);
    }
    return memo[...] = res;
}
```

### 复杂度

$O(\log^2 b)$。

---

## 31. POJ 2151 - Check the difficulty of problems（概率 DP）

### 题意

$M$ 道题、$T$ 支队伍。第 $i$ 支队伍做对第 $j$ 道题的概率 $p[i][j]$。求"每队至少做对 1 题、且至少 1 队做对 $\ge N$ 题"的概率。

### 分析

$P(\text{all solve} \ge 1 \text{ and } \exists \text{solve} \ge N) = P(\text{all} \ge 1) - P(\text{all} \ge 1 \text{ and all} < N)$

对每队做背包 DP 求"恰好做对 $k$ 题"的概率分布。

### 状态与转移

- 对每队 $i$：$f[i][k]$ = 做对恰好 $k$ 题的概率
- $P_i(\ge 1) = 1 - f[i][0]$
- $P_i([1, N-1]) = \sum_{k=1}^{N-1} f[i][k]$

### 核心代码

```cpp
for (int i = 0; i < T; i++) {
    f[0] = 1.0;
    for (int j = 0; j < M; j++)
        for (int k = j + 1; k >= 1; k--)
            f[k] = f[k] * (1 - p[i][j]) + f[k-1] * p[i][j];
    f[0] *= (1 - p[i][j]);
    // ...
}
```

### 复杂度

$O(TM^2)$。

---

## 32. POJ 1015 - Jury Compromise（DP + 路径）

### 题意

$N$ 个候选人，每人有辩方评分 $d_i$ 和控方评分 $p_i$。选 $M$ 人使 $|D - P|$ 最小，$D + P$ 最大。

### 分析

令 $\text{diff}_i = d_i - p_i$。问题转为选 $M$ 人使 $|\sum \text{diff}|$ 最小、$\sum(d + p)$ 最大。

### 状态与转移

- **状态**：$dp[j][\text{off}]$ = 选了 $j$ 人、差值偏移为 $\text{off}$ 时的最大 $\sum(d+p)$
- **转移**：01 背包

### 核心代码

```cpp
const int OFFSET = 400;
dp[0][OFFSET] = 0;
for (int i = 0; i < N; i++)
    for (int j = min(i+1, M); j >= 1; j--)
        for (int off = 0; off <= 2 * OFFSET; off++)
            if (dp[j-1][off] >= 0) {
                int noff = off + diff[i];
                dp[j][noff] = max(dp[j][noff], dp[j-1][off] + sum[i]);
            }
// 在 dp[M][off] 中找 off 最接近 OFFSET 的最大 dp 值
```

### 复杂度

$O(NM \cdot \text{range})$。

---

## 33. POJ 1636 - Prison rearrangement（树形 DP / 背包）

### 题意

两个监狱各 $M$ 人，某些跨监狱的人对有仇。交换 $R$ 对人使得无仇人同狱。求最大 $R$。

### 分析

建立连通分量。每个连通分量中两边人数为 $(a, b)$，交换意味着选若干连通分量使总交换人数合法。01 背包。

### 核心代码

```cpp
// 对每个连通分量计算两边人数 (a_i, b_i)
dp[0] = true;
for (each component (a, b)) {
    for (int j = M/2; j >= max(a, b); j--)
        dp[j] = dp[j] || dp[j - a]; // 或 dp[j - b]（需要更精细的处理）
}
// 最大的 j 使 dp[j] = true
```

### 复杂度

$O(\text{components} \cdot M)$。

---

## 34. POJ 3345 - Bribing FIPA（树形背包）

### 题意

$N$ 个国家构成树（控制关系），贿赂国家 $i$ 花费 $c_i$。贿赂一个国家则其所有下属自动被控制。求控制至少 $M$ 个国家的最小花费。

### 分析

树形背包。$dp[v][j]$ = 在 $v$ 子树中控制 $j$ 个国家的最小花费。

### 状态与转移

- 直接贿赂 $v$：$dp[v][sz[v]] = c[v]$
- 不贿赂 $v$：子树合并背包

### 核心代码

```cpp
void dfs(int v) {
    dp[v][0] = 0;
    for (int u : children[v]) {
        dfs(u);
        for (int j = sz[v]; j >= 0; j--)
            for (int k = 0; k <= sz[u]; k++)
                dp[v][j + k] = min(dp[v][j + k], dp[v][j] + dp[u][k]);
    }
    dp[v][sz[v]] = min(dp[v][sz[v]], (long long)c[v]); // 直接贿赂 v
}
```

### 复杂度

$O(NM^2)$。

---

## 35. POJ 1722 - STAMPS（DP / 贪心搜索）

### 题意

给定 $K$ 种邮票面值，用不超过 $N$ 张邮票。求最大连续可凑范围 $[1, \text{max}]$。

### 分析

完全背包变形。$dp[j]$ = 凑出面值 $j$ 的最少邮票数。所有 $dp[j] \le N$ 的 $j$ 构成连续范围。

### 状态与转移

- $dp[j] = \min_{c_i \le j} dp[j - c_i] + 1$

### 核心代码

```cpp
fill(dp, dp + MAXV, INF);
dp[0] = 0;
for (int j = 1; j < MAXV; j++)
    for (int i = 0; i < K; i++)
        if (j >= stamps[i] && dp[j - stamps[i]] + 1 < dp[j])
            dp[j] = dp[j - stamps[i]] + 1;
int ans = 0;
for (int j = 1; j < MAXV; j++)
    if (dp[j] <= N) ans = j;
    else break;
```

### 复杂度

$O(V \cdot K)$。

---

## 36. POJ 2228 - Naptime（环形 DP）

### 题意

$N$ 个时段（组成环），选 $B$ 个时段睡觉。只有连续睡觉段的非首个时段才获得收益 $u_i$。求最大收益。

### 分析

环形 DP。枚举是否在时段 1 睡觉，转化为线性 DP。$dp[i][j][0/1]$ = 前 $i$ 个时段选了 $j$ 个、第 $i$ 个是否睡的最大收益。

### 状态与转移

- $dp[i][j][1] = \max(dp[i-1][j-1][1] + u[i],\; dp[i-1][j-1][0])$（连续睡有 $u[i]$，新开始无）
- $dp[i][j][0] = \max(dp[i-1][j][0],\; dp[i-1][j][1])$

### 核心代码

```cpp
// Case 1: 时段 1 不睡
memset(dp, -INF, sizeof(dp));
dp[1][0][0] = 0;
for (int i = 2; i <= N; i++)
    for (int j = 0; j <= min(i, B); j++) {
        dp[i][j][0] = max(dp[i-1][j][0], dp[i-1][j][1]);
        if (j > 0)
            dp[i][j][1] = max(dp[i-1][j-1][0], dp[i-1][j-1][1] + u[i]);
    }
int ans = max(dp[N][B][0], dp[N][B][1]);

// Case 2: 时段 1 睡
memset(dp, -INF, sizeof(dp));
dp[1][1][1] = 0;
for (int i = 2; i <= N; i++)
    // 同上转移
// 时段 N 睡且时段 1 睡时，时段 1 能获得 u[1]
ans = max(ans, dp[N][B][1] + u[1]);
```

### 复杂度

$O(NB)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **线性/序列 DP** | 1, 2, 3, 4, 5, 6, 20 | 计数DP、单调DP、Dilworth、最大子段和、LIS去重 |
| **背包 DP** | 7, 8, 9, 10, 11, 12 | 多重背包优化、均分、二进制拆分、排序 |
| **区间 DP** | 13, 14, 15, 16, 17, 19 | 括号序列、矩阵链乘、回文补全、邮局选址 |
| **网格/记忆化** | 18 | 滑雪（DAG 最长路） |
| **状压 DP** | 21, 22, 23, 24, 25 | 骨牌覆盖、炮兵阵地、Corn Fields、集合覆盖、TSP |
| **树形 DP** | 26, 27, 28, 29, 34 | 树形背包、苹果接取DP、电视转播 |
| **数位 DP** | 30 | Round Numbers |
| **概率 DP** | 31 | 概率分布背包 |
| **经典模型** | 32, 33, 35, 36 | 差值背包、连通分量背包、环形DP |

## 学习路线建议

```
线性基础：1 → 4 → 5 → 6 → 20 → 2 → 3
    ↓
背包系列：7 → 8 → 9 → 10 → 11 → 12
    ↓
区间 DP：14 → 15 → 13 → 16 → 17 → 19
    ↓
记忆化/网格：18
    ↓
状压 DP：23 → 21 → 22 → 24 → 25
    ↓
树形 DP：28 → 27 → 29 → 26 → 34
    ↓
数位/概率：30 → 31
    ↓
经典模型：32 → 33 → 35 → 36
```

## 解题方法论

1. **多重背包三种优化**：二进制拆分 $O(NM \log C)$、used 数组 $O(NM)$、单调队列 $O(NM)$。POJ 7 是 used 数组优化的经典。
2. **Dilworth 定理**：最少不升链覆盖 = 最长严格递增子序列长度。用于 POJ 3 等"最少分组"问题。
3. **区间 DP 三大范式**：合并型（石子归并）、匹配型（括号序列）、分割型（邮局选址）。
4. **树形背包的合并**：合并子树时注意枚举顺序。对于"可回头"的路径问题（如 Apple Tree），需额外维度记录是否返回。
5. **状压 DP 的状态数控制**：通过预处理合法状态大幅减少枚举量（如炮兵阵地中 $M=10$ 但合法状态仅约 60 个）。
6. **环形 DP 处理**：断环为链 + 枚举首尾状态（如 Naptime）。

> **记住**：POJ 的经典题目代表了 ACM-ICPC 时代的 DP 训练体系。这 36 题覆盖了从入门到进阶的核心 DP 类型，是竞赛训练的必经之路。
