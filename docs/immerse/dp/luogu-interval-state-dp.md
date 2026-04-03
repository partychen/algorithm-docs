---
title: "洛谷 区间与状压DP专题精选解题报告"
subtitle: "🧩 从集合状态到区间合并与轮廓线的 DP 主线"
order: 12
icon: "🧩"
---

# 洛谷 区间与状压DP专题精选解题报告

这一组题从棋盘状压一路走到轮廓线、石子合并和区间博弈，看起来一半在枚举集合、一半在枚举断点，但共同核心都是“把局部边界状态压紧”。状压 DP 压的是可行摆放，区间 DP 压的是左右端点与中间合并方式，真正决定难度的是状态能不能既完整又不爆炸。

# 一、状压 DP — 棋盘放置

用一个整数的二进制位表示一行中哪些位置被选中，行间转移时检查相邻行的兼容性。

## 1. [P1896 [SCOI2005] 互不侵犯](https://www.luogu.com.cn/problem/P1896)

`DP` `状压 DP` `轮廓线 DP`

### 题意

在 $N \times N$（$N \le 9$）的棋盘里放 $K$ 个国王，使它们互不攻击（国王攻击周围 $8$ 格），求方案数。

### 分析

按行枚举状态。设 $f[i][S][k]$ 为前 $i$ 行、第 $i$ 行状态为 $S$、已放 $k$ 个国王的方案数。状态 $S$ 合法要求没有相邻的 $1$（同行不攻击），行间要求 $S$ 与 $S'$ 满足 $(S \mathbin{\&} S') = 0$、$(S | S')$ 无相邻 $1$（八方向不攻击）。

预处理合法行状态和行间兼容关系，复杂度大幅降低。

### 核心代码

```cpp
int n, K;
long long f[10][1 << 9][82];
vector<int> valid; // 合法行状态
int cnt[1 << 9];   // 每个状态的1的个数

// 预处理合法状态
for (int S = 0; S < (1 << n); S++)
    if (!(S & (S >> 1))) valid.push_back(S), cnt[S] = __builtin_popcount(S);

f[0][0][0] = 1;
for (int i = 1; i <= n; i++)
    for (int S : valid)
        for (int S2 : valid) {
            if (S & S2) continue;            // 正上方冲突
            if ((S >> 1) & S2) continue;     // 左上冲突
            if ((S << 1) & S2) continue;     // 右上冲突
            for (int k = cnt[S]; k <= K; k++)
                f[i][S][k] += f[i - 1][S2][k - cnt[S]];
        }
// ans = sum of f[n][S][K] for all valid S
```

### 复杂度

时间复杂度 $O(n \cdot V^2 \cdot K)$（$V$ 为合法状态数），空间复杂度 $O(n \cdot V \cdot K)$。

---

## 2. [P1879 [USACO06NOV] Corn Fields G](https://www.luogu.com.cn/problem/P1879)

`DP` `状压 DP` `轮廓线 DP`

### 题意

$M \times N$（$M, N \le 12$）的牧场，部分格子贫瘠不能种草。选若干格子种草，要求没有两块草地相邻（四方向），求方案数对 $10^8$ 取模。

### 分析

按行状压。设 $f[i][S]$ 为前 $i$ 行、第 $i$ 行种草状态为 $S$ 的方案数。状态合法要求：$S$ 没有相邻的 $1$、$S$ 不种贫瘠格子（$S \mathbin{\&} \text{bad}_i = 0$），行间要求 $S \mathbin{\&} S' = 0$（上下不相邻）。

### 核心代码

```cpp
int n, m, bad[13];
long long f[13][1 << 12];

f[0][0] = 1;
for (int i = 1; i <= n; i++)
    for (int S = 0; S < (1 << m); S++) {
        if (S & (S >> 1)) continue;   // 同行相邻
        if (S & bad[i]) continue;     // 贫瘠格子
        for (int S2 = 0; S2 < (1 << m); S2++) {
            if (S2 & (S2 >> 1)) continue;
            if (S2 & bad[i - 1]) continue;
            if (S & S2) continue;     // 上下相邻
            f[i][S] = (f[i][S] + f[i - 1][S2]) % MOD;
        }
    }
// ans = sum of f[n][S]
```

### 复杂度

时间复杂度 $O(n \cdot V^2)$（$V$ 为合法状态数），空间复杂度 $O(n \cdot 2^m)$。

---

## 3. [P2704 [NOI2001] 炮兵阵地](https://www.luogu.com.cn/problem/P2704)

`DP` `状压 DP` `NOI`

### 题意

$N \times M$（$M \le 10$）地图上部署炮兵，炮兵攻击上下左右各两格。山地不能部署，两两不能互相攻击。求最多摆放数。

### 分析

需记录前两行的状态。设 $f[i][S_1][S_2]$ 为第 $i$ 行状态为 $S_1$、第 $i-1$ 行为 $S_2$ 时的最多炮兵数。合法状态要求行内没有间距 $\le 2$ 的两个 $1$，行间要求 $S_1 \mathbin{\&} S_2 = 0$、$S_1 \mathbin{\&} S_3 = 0$（$S_3$ 为 $i-2$ 行状态）。

### 核心代码

```cpp
int n, m;
int f[2][V][V]; // 滚动数组, V为合法状态数
vector<int> valid;

for (int S = 0; S < (1 << m); S++)
    if (!(S & (S >> 1)) && !(S & (S >> 2))) valid.push_back(S);

for (int i = 1; i <= n; i++)
    for (int a : valid) {          // 第i行
        if (a & bad[i]) continue;
        for (int b : valid) {      // 第i-1行
            if (b & bad[i-1]) continue;
            if (a & b) continue;
            for (int c : valid) {  // 第i-2行
                if (a & c) continue;
                f[i&1][a][b] = max(f[i&1][a][b],
                    f[(i-1)&1][b][c] + __builtin_popcount(a));
            }
        }
    }
```

### 复杂度

时间复杂度 $O(n \cdot V^3)$（$V$ 远小于 $2^{10}$），空间复杂度 $O(V^2)$。

---

# 二、轮廓线 DP

轮廓线 DP 逐格转移而非逐行，适合用 $1 \times 2$ 骨牌覆盖棋盘等"精确覆盖"问题。

## 4. [P10975 Mondriaan's Dream / 蒙德里安的梦想](https://www.luogu.com.cn/problem/P10975)

`DP` `轮廓线 DP` `状压 DP`

### 题意

用 $1 \times 2$ 的骨牌完全覆盖 $n \times m$ 的矩形，求方案数。

### 分析

按列枚举，轮廓线记录当前列哪些行被上一列的横放骨牌"伸出"占据。设 $f[j][S]$ 为处理完前 $j$ 列、第 $j$ 列的"伸出"状态为 $S$ 的方案数。转移时，第 $j+1$ 列的每个格子要么接受上一列伸出的横放骨牌、要么自己横放伸到下一列、要么与上下格子竖放。要求所有格子都被恰好覆盖一次。

### 核心代码

```cpp
long long f[N][1 << N]; // f[col][state]

f[0][0] = 1;
for (int j = 0; j < m; j++)
    for (int S = 0; S < (1 << n); S++) if (f[j][S]) {
        // DFS 填第 j+1 列, 结合状态 S 转移
        // S 的第 i 位=1 表示第 j 列横放伸入第 j+1 列的第 i 行
        dfs(j, S, 0, 0, f[j][S]);
    }

void dfs(int j, int S, int row, int nS, long long val) {
    if (row == n) { f[j + 1][nS] += val; return; }
    if (S >> row & 1) // 被上一列横放占据
        dfs(j, S, row + 1, nS, val);
    else {
        // 横放伸到下一列
        dfs(j, S, row + 1, nS | (1 << row), val);
        // 竖放(需要下一行也空闲)
        if (row + 1 < n && !(S >> (row + 1) & 1))
            dfs(j, S, row + 2, nS, val);
    }
}
// ans = f[m][0]
```

### 复杂度

时间复杂度 $O(m \cdot 2^n \cdot 2^n)$，空间复杂度 $O(m \cdot 2^n)$。

---

# 三、区间 DP — 合并类

区间 DP 的经典场景：合并相邻元素，枚举断点将区间分成两半，取最优。

## 5. [P1775 石子合并（弱化版）](https://www.luogu.com.cn/problem/P1775)

`DP` `区间 DP`

### 题意

$N$（$N \le 300$）堆石子排成一排，每次合并相邻两堆，代价为两堆质量之和。求合并成一堆的最小总代价。

### 分析

经典区间 DP。设 $f[l][r]$ 为合并 $[l, r]$ 的最小代价。$f[l][r] = \min_{k=l}^{r-1} (f[l][k] + f[k+1][r]) + \text{sum}(l, r)$。用前缀和预处理 $\text{sum}$。

### 核心代码

```cpp
int n, a[N], s[N], f[N][N];

for (int i = 1; i <= n; i++) s[i] = s[i-1] + a[i];

memset(f, 0x3f, sizeof f);
for (int i = 1; i <= n; i++) f[i][i] = 0;

for (int len = 2; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++)
        for (int k = l; k < r; k++)
            f[l][r] = min(f[l][r], f[l][k] + f[k+1][r] + s[r] - s[l-1]);
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 6. [P5569 [SDOI2008] 石子合并](https://www.luogu.com.cn/problem/P5569)

`DP` `区间DP` `贪心`

### 题意

与上题类似，但 $N$ 可达 $40000$，仍求最小合并代价。

### 分析

$N$ 很大时 $O(n^3)$ 区间 DP 不可行。使用 GarsiaWachs 算法：贪心地找满足 $a[k-1] \le a[k+1]$ 的最小 $a[k]$，合并 $a[k-1]$ 和 $a[k]$，将合并结果向前插入到合适位置。可以证明这样得到最优解。

### 核心代码

```cpp
int n, ans;
vector<int> a;

void combine(int k) {
    int val = a[k - 1] + a[k];
    ans += val;
    a.erase(a.begin() + k);
    a.erase(a.begin() + k - 1);
    // 向前找第一个 >= val 的位置插入
    int pos = k - 1;
    while (pos > 0 && a[pos - 1] < val) pos--;
    a.insert(a.begin() + pos, val);
    // 检查 pos 处是否可以继续合并
    while (pos >= 2 && a[pos - 2] <= a[pos])
        combine(pos - 1), pos--;
}

// 从左到右扫描
for (int i = 1; i < (int)a.size(); ) {
    if (i >= 2 && a[i - 2] <= a[i])
        combine(i - 1), i--;
    else i++;
}
while (a.size() > 1) combine(a.size() - 1);
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 7. [P1063 [NOIP 2006 提高组] 能量项链](https://www.luogu.com.cn/problem/P1063)

`DP` `区间DP` `NOIP 提高组`

### 题意

$N$ 颗能量珠排成环，每颗有头标记和尾标记。相邻两颗 $(m, r)$ 和 $(r, n)$ 合并释放能量 $m \times r \times n$，得到 $(m, n)$。求最大总能量。

### 分析

环形区间 DP：将序列复制一倍破环为链。设 $f[l][r]$ 为合并 $[l, r]$ 的最大能量。$f[l][r] = \max_{k=l}^{r-1} (f[l][k] + f[k+1][r] + a_l \times a_{k+1} \times a_{r+1})$。

### 核心代码

```cpp
int n, a[2 * N]; // 破环为链,长度2n
long long f[2 * N][2 * N];

for (int len = 2; len <= n; len++)
    for (int l = 1; l + len - 1 <= 2 * n; l++) {
        int r = l + len - 1;
        for (int k = l; k < r; k++)
            f[l][r] = max(f[l][r],
                f[l][k] + f[k+1][r] + (long long)a[l] * a[k+1] * a[r+1]);
    }

long long ans = 0;
for (int l = 1; l <= n; l++)
    ans = max(ans, f[l][l + n - 1]);
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 8. [P3146 [USACO16OPEN] 248 G](https://www.luogu.com.cn/problem/P3146)

`DP` `区间DP` `USACO`

### 题意

$N$（$N \le 248$）个正整数，每个在 $[1, 40]$。每次可合并两个相邻且相等的数 $x$ 为一个 $x+1$。求最终序列中最大值。

### 分析

设 $f[l][r]$ 为区间 $[l, r]$ 能合并成的值（若不能合并成单个数则为 $0$）。$f[l][r] = f[l][k] + 1$ 当存在 $k$ 使得 $f[l][k] = f[k+1][r] > 0$ 时。答案取所有 $f[l][r]$ 的最大值。

### 核心代码

```cpp
int n, a[N], f[N][N];
int ans = 0;

for (int i = 1; i <= n; i++) f[i][i] = a[i];

for (int len = 2; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++)
        for (int k = l; k < r; k++)
            if (f[l][k] && f[l][k] == f[k + 1][r])
                f[l][r] = max(f[l][r], f[l][k] + 1);

for (int l = 1; l <= n; l++)
    for (int r = l; r <= n; r++)
        ans = max(ans, f[l][r]);
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 9. [P4805 [CCC 2016] 合并饭团](https://www.luogu.com.cn/problem/P4805)

`DP` `区间DP` `双指针 two-pointer`

### 题意

$N$ 个饭团排成一行。两个相邻且大小相同的饭团可以合并（大小相加）；两个大小相同但中间隔一个饭团的也可以三合一（大小全加）。求能得到的最大单个饭团。

### 分析

区间 DP，设 $f[l][r]$ 为 $[l, r]$ 能合并成的值（不能合并则为 $0$）。转移分两种：

1. 存在 $k$ 使 $f[l][k] = f[k+1][r] > 0$，则 $f[l][r] = 2 \times f[l][k]$。
2. 存在 $k_1 < k_2$ 使 $f[l][k_1] = f[k_2+1][r] > 0$ 且 $f[k_1+1][k_2] > 0$，则三合一。

用双指针或枚举优化。

### 核心代码

```cpp
int n, a[N], f[N][N];
int ans = 0;

for (int i = 1; i <= n; i++) f[i][i] = a[i], ans = max(ans, a[i]);

for (int len = 2; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++) {
        for (int k = l; k < r; k++)
            if (f[l][k] && f[l][k] == f[k+1][r])
                f[l][r] = max(f[l][r], f[l][k] * 2);
        for (int k1 = l; k1 < r - 1; k1++)
            if (f[l][k1])
                for (int k2 = k1 + 1; k2 < r; k2++)
                    if (f[k1+1][k2] && f[l][k1] == f[k2+1][r])
                        f[l][r] = max(f[l][r], f[l][k1]*2 + f[k1+1][k2]);
        ans = max(ans, f[l][r]);
    }
```

### 复杂度

时间复杂度 $O(n^4)$（可优化至 $O(n^3)$），空间复杂度 $O(n^2)$。

---

# 四、区间 DP — 两端取数与字符串

从区间两端操作或在字符串上做回文/匹配相关的区间 DP。

## 10. [P2858 [USACO06FEB] Treats for the Cows G/S](https://www.luogu.com.cn/problem/P2858)

`DP` `区间DP` `USACO`

### 题意

$N$（$N \le 2000$）份零食排成一列，第 $i$ 份初始价值 $V_i$。每天从两端取一份，第 $a$ 天取出的零食售价为 $V_i \times a$。求最大总收益。

### 分析

设 $f[l][r]$ 为区间 $[l, r]$ 还没取时能获得的最大收益。已取了 $n - (r - l + 1)$ 天，当前天数为 $n - (r - l + 1) + 1$。从两端取：

$f[l][r] = \max(f[l+1][r] + V_l \times d, \ f[l][r-1] + V_r \times d)$

其中 $d = n - (r - l)$。

### 核心代码

```cpp
int n, v[N];
long long f[N][N];

for (int i = 1; i <= n; i++) f[i][i] = (long long)v[i] * n;

for (int len = 2; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++) {
        int d = n - (r - l); // 当前是第几天取
        f[l][r] = max(f[l + 1][r] + (long long)v[l] * d,
                      f[l][r - 1] + (long long)v[r] * d);
    }
// ans = f[1][n]
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 11. [P1005 [NOIP 2007 提高组] 矩阵取数游戏](https://www.luogu.com.cn/problem/P1005)

`DP` `区间DP` `高精度`

### 题意

$n \times m$ 的矩阵，每次从每行取行首或行尾元素，第 $i$ 次取数得分为元素值 $\times 2^i$。求 $m$ 次取完后的最大总分。

### 分析

每行独立做区间 DP。设 $f[l][r]$ 为行中剩余 $[l, r]$ 时已获得的最大分。已取次数 $t = m - (r - l + 1)$，下次取是第 $t + 1$ 次。取左端 $f[l+1][r] + a_l \times 2^{t+1}$ 或取右端。因为 $2^m$ 可能很大，需高精度。

### 核心代码

```cpp
// 每行独立, 高精度或 __int128
__int128 f[N][N];
int a[N];

for (int l = m; l >= 1; l--)
    for (int r = l; r <= m; r++) {
        int t = m - (r - l + 1);
        __int128 pw = (__int128)1 << (t + 1);
        f[l][r] = max(f[l + 1][r] + a[l] * pw,
                      f[l][r - 1] + a[r] * pw);
    }
// 每行贡献 f[1][m], 累加
```

### 复杂度

时间复杂度 $O(n \cdot m^2)$，空间复杂度 $O(m^2)$（高精度额外开销）。

---

## 12. [P1435 [IOI 2000] 回文字串](https://www.luogu.com.cn/problem/P1435)

`DP` `区间DP` `IOI`

### 题意

给定字符串，通过插入最少字符使其变为回文串。

### 分析

等价于求最长回文子序列 $L$，答案 = $n - L$。设 $f[l][r]$ 为 $[l, r]$ 的最长回文子序列。若 $s_l = s_r$，$f[l][r] = f[l+1][r-1] + 2$；否则 $f[l][r] = \max(f[l+1][r], f[l][r-1])$。

### 核心代码

```cpp
int n, f[N][N];
char s[N];

for (int i = 1; i <= n; i++) f[i][i] = 1;

for (int len = 2; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++) {
        if (s[l] == s[r]) f[l][r] = f[l + 1][r - 1] + 2;
        else f[l][r] = max(f[l + 1][r], f[l][r - 1]);
    }
// ans = n - f[1][n]
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 13. [P3847 [TJOI2007] 调整队形](https://www.luogu.com.cn/problem/P3847)

`DP` `区间DP` `各省省选`

### 题意

一列人穿不同颜色衣服，可以在两端或中间插入人、删除人、改变颜色，使队列成为回文。求最少操作次数。

### 分析

区间 DP。设 $f[l][r]$ 为将 $[l, r]$ 调整为回文的最少操作。若 $s_l = s_r$，$f[l][r] = f[l+1][r-1]$；否则 $f[l][r] = \min(f[l+1][r], f[l][r-1], f[l+1][r-1]) + 1$（分别对应插入/删除/换色）。

### 核心代码

```cpp
int n, a[N], f[N][N];

for (int len = 2; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++) {
        if (a[l] == a[r])
            f[l][r] = f[l + 1][r - 1];
        else
            f[l][r] = min({f[l+1][r], f[l][r-1], f[l+1][r-1]}) + 1;
    }
// ans = f[1][n]
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

# 五、区间 DP — 计数与进阶

本章包含更复杂的区间 DP 应用：三角剖分、DP 套 DP、NOI 级别的区间计数问题等。

## 14. [CF1140D Minimum Triangulation](https://www.luogu.com.cn/problem/CF1140D)

`DP` `区间DP` `贪心`

### 题意

正 $n$ 边形，顶点编号 $1 \sim n$，三角剖分使得所有三角形的三顶点编号乘积之和最小。

### 分析

贪心/区间 DP。固定顶点 $1$，将多边形分为 $n-2$ 个三角形 $(1, i, i+1)$（$i = 2, \ldots, n-1$），每个三角形代价 $1 \times i \times (i+1)$。可以证明这是最优的。

### 核心代码

```cpp
long long ans = 0;
for (int i = 2; i < n; i++)
    ans += (long long)i * (i + 1);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 15. [U522972 三角剖分](https://www.luogu.com.cn/problem/U522972)

`DP` `区间DP`

### 题意

凸 $n$ 边形每个顶点有权值 $a_i$，三角剖分为 $n-2$ 个三角形，每个三角形代价为三顶点权值之积。求最小总代价。

### 分析

区间 DP。设 $f[l][r]$ 为将由边 $(l, r)$ 和中间的顶点构成的子多边形三角剖分的最小代价。枚举断点 $k \in (l, r)$：$f[l][r] = \min_k (f[l][k] + f[k][r] + a_l \times a_k \times a_r)$。

### 核心代码

```cpp
int n, a[N];
long long f[N][N];

memset(f, 0x3f, sizeof f);
for (int i = 1; i < n; i++) f[i][i + 1] = 0;

for (int len = 3; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++)
        for (int k = l + 1; k < r; k++)
            f[l][r] = min(f[l][r],
                f[l][k] + f[k][r] + (long long)a[l] * a[k] * a[r]);
// ans = f[1][n]
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 16. [UVA10304 Optimal Binary Search Tree](https://www.luogu.com.cn/problem/UVA10304)

`DP` `区间 DP`

### 题意

$n$ 个有序关键字，频率分别为 $f_1, \ldots, f_n$。构造一棵二叉搜索树使得查询期望代价（$\sum f_i \times \text{depth}_i$）最小。

### 分析

区间 DP。设 $g[l][r]$ 为用关键字 $l \sim r$ 构成最优 BST 的最小代价。枚举根 $k$：$g[l][r] = \min_k (g[l][k-1] + g[k+1][r] + \text{sum}(l,r) - f_k)$（子树深度加 $1$ 带来的额外代价为 $\text{sum}(l,r) - f_k$）。

### 核心代码

```cpp
int n, f[N], s[N];
int g[N][N];

for (int i = 1; i <= n; i++) s[i] = s[i-1] + f[i];

for (int len = 2; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++) {
        g[l][r] = INT_MAX;
        for (int k = l; k <= r; k++)
            g[l][r] = min(g[l][r],
                g[l][k-1] + g[k+1][r] + s[r] - s[l-1] - f[k]);
    }
// ans = g[1][n]
```

### 复杂度

时间复杂度 $O(n^3)$（可用 Knuth 优化到 $O(n^2)$），空间复杂度 $O(n^2)$。

---

## 17. [P2308 添加括号](https://www.luogu.com.cn/problem/P2308)

`DP` `区间DP` `Special Judge`

### 题意

$n$ 个数字，添 $n-1$ 对括号决定加法顺序，得到 $n-1$ 个中间和。求使中间和之和最小的方案。

### 分析

设 $f[l][r]$ 为区间 $[l,r]$ 的最小中间和之和。枚举最后一次加法的位置 $k$：$f[l][r] = \min_k (f[l][k] + f[k+1][r] + \text{sum}(l,r))$（每次加法产生的中间和恰好是 $\text{sum}(l,r)$）。需记录方案以输出括号。

### 核心代码

```cpp
long long f[N][N], s[N];
int cut[N][N]; // 记录断点

for (int i = 1; i <= n; i++) f[i][i] = 0;
for (int len = 2; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++) {
        f[l][r] = LLONG_MAX;
        for (int k = l; k < r; k++) {
            long long val = f[l][k] + f[k+1][r] + s[r] - s[l-1];
            if (val < f[l][r]) f[l][r] = val, cut[l][r] = k;
        }
    }
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 18. [P1388 算式](https://www.luogu.com.cn/problem/P1388)

`DP` `区间DP`

### 题意

$n$ 个数字间放 $k$ 个乘号和 $n-k-1$ 个加号，括号随便加，使结果最大。

### 分析

先用区间 DP 求出每段连续数字只用加法得到的和 $\text{sum}[l][r]$。然后在 $n$ 个数字间放 $k$ 个乘号，等价于把序列分为 $k+1$ 段，每段内部加法求和后各段相乘。用分段 DP：设 $g[i][j]$ 为前 $i$ 个数分成 $j$ 段的最大乘积。

### 核心代码

```cpp
long long sum[N][N]; // sum[l][r] = a[l]+...+a[r]
long long g[N][N];   // g[i][j]: 前i个数分成j段的最大乘积

for (int i = 1; i <= n; i++) g[i][1] = sum[1][i];

for (int j = 2; j <= k + 1; j++)
    for (int i = j; i <= n; i++)
        for (int p = j - 1; p < i; p++)
            g[i][j] = max(g[i][j], g[p][j - 1] * sum[p + 1][i]);

// ans = g[n][k + 1]
```

### 复杂度

时间复杂度 $O(n^2 k)$，空间复杂度 $O(nk)$。

---

## 19. [P9325 [CCC 2023 S2] Symmetric Mountains](https://www.luogu.com.cn/problem/P9325)

`DP` `区间DP` `双指针 two-pointer`

### 题意

$N$ 座山高度 $h_1, \ldots, h_N$。对每个长度 $w = 1, 2, \ldots, N$，求所有长度为 $w$ 的连续子段中不对称值 $\sum_{i=0}^{\lfloor(w-1)/2\rfloor} |h_{l+i} - h_{r-i}|$ 的最小值。

### 分析

设 $f[l][r] = \sum |h_{l+i} - h_{r-i}|$ 为区间 $[l,r]$ 的不对称值。递推：$f[l][r] = f[l+1][r-1] + |h_l - h_r|$。对每个长度取所有同长度区间的最小值。

### 核心代码

```cpp
int n, h[N];
long long f[N][N], ans[N];

memset(ans, 0x3f, sizeof ans);
for (int i = 1; i <= n; i++) f[i][i] = 0, ans[1] = 0;
for (int i = 1; i < n; i++)
    f[i][i + 1] = abs(h[i] - h[i + 1]), ans[2] = min(ans[2], f[i][i+1]);

for (int len = 3; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++) {
        f[l][r] = f[l + 1][r - 1] + abs(h[l] - h[r]);
        ans[len] = min(ans[len], f[l][r]);
    }
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 20. [P6006 [USACO20JAN] Farmer John Solves 3SUM G](https://www.luogu.com.cn/problem/P6006)

`DP` `区间DP` `前缀和`

### 题意

$N$（$N \le 5000$）个整数，$Q$ 次询问 $[l, r]$ 中满足 $s_i + s_j + s_k = 0$（$i < j < k$）的三元组数。

### 分析

预处理：设 $f[l][r]$ 为区间 $[l, r]$ 中的 3SUM 计数。递推：$f[l][r] = f[l][r-1] + g[l][r]$，其中 $g[l][r]$ 是包含 $s_r$ 的三元组数（即 $s_r$ 作为最大下标参与的三元组，$s_i + s_j = -s_r$，在 $[l, r-1]$ 中两指针计数）。

进一步优化：固定 $r$，$g[l][r] = g[l+1][r] + h[l][r]$，其中 $h[l][r]$ 是 $s_l + s_j + s_r = 0$ 的 $j$ 数量，可通过桶统计。

### 核心代码

```cpp
int n, s[N];
long long f[N][N]; // f[l][r]: [l,r]中3SUM计数
int cnt[2 * V + 1]; // 值域桶

for (int r = 1; r <= n; r++) {
    memset(cnt, 0, sizeof cnt);
    for (int l = r; l >= 1; l--) {
        // s[l] 加入桶
        // 检查 -(s[l] + s[r]) 是否在桶中
        int need = -s[l] - s[r];
        f[l][r] = f[l + 1][r] + cnt[need + V];
        cnt[s[l] + V]++;
    }
    // 加上不含 s[r] 的部分
    // f[l][r] += f[l][r-1] 的逻辑需要调整
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 21. [P3102 [USACO14FEB] Secret Code S](https://www.luogu.com.cn/problem/P3102)

`DP` `区间DP` `字符串`

### 题意

给定字符串 $S$，每次操作可以截取 $S$ 的一个真前缀或真后缀（非空、非全串），然后将原串 $S$ 拼在截取结果的前面或后面。求从某个初始串经过若干次操作可以得到 $S$ 的初始串数量。

### 分析

反向思考：从 $S$ 出发，每次操作是删去 $S$ 的一个前缀或后缀（与原串的某前缀或后缀匹配），得到更短的子串。用区间 DP 设 $f[l][r]$ 为子串 $S[l..r]$ 能否作为初始串。$S[l..r]$ 可以转移到 $f[l'][r']$（更短子串），如果 $S[l..r]$ 的某前缀或后缀与 $S[l'..r']$ 匹配。

### 核心代码

```cpp
int n;
long long f[N][N]; // f[l][r]: S[l..r]可作初始串的方案数

// 预处理:哪些前缀/后缀匹配
for (int len = 1; len < n; len++)
    for (int l = 1, r = len; r <= n; l++, r++)
        f[l][r] = 0;

f[1][n] = 1; // 原串本身
for (int len = n; len >= 2; len--)
    for (int l = 1, r = l + len - 1; r <= n; l++, r++) if (f[l][r]) {
        // 尝试去掉前缀(匹配 S[l..l+k-1] == S[1..k])
        for (int k = 1; k < len; k++)
            if (S[l..l+k-1] matches S[1..k])
                f[l + k][r] = (f[l + k][r] + f[l][r]) % MOD;
        // 尝试去掉后缀
        // ...
    }
// ans = sum of f[l][r] for len < n, minus 重复
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 22. [P11676 [USACO25JAN] DFS Order P](https://www.luogu.com.cn/problem/P11676)

`DP` `区间DP` `USACO`

### 题意

给定 $n$ 个点的无向图（可修改边），求修改代价最小的图使得存在某种 DFS 序为 $1, 2, \ldots, n$。

### 分析

DFS 序为 $1, 2, \ldots, n$ 要求：从 $1$ 出发，每次优先访问编号最小的邻居。这对应一个特定的 DFS 树结构。用区间 DP 描述子树结构：$f[l][r]$ 表示将节点 $l, l+1, \ldots, r$ 构成以 $l$ 为根的子树的最小代价。枚举 $l$ 的第一个子树 $[l+1, k]$，剩余 $[k+1, r]$ 是 $l$ 的后续子树。

### 核心代码

```cpp
int n, a[N][N]; // a[i][j]: 边(i,j)的修改代价
long long f[N][N]; // f[l][r]: 节点[l..r]以l为根的子树的最小代价

// 预处理: 边的添加/删除代价
for (int l = n; l >= 1; l--)
    for (int r = l; r <= n; r++) {
        if (l == r) { f[l][r] = 0; continue; }
        f[l][r] = INF;
        // l 连向 l+1 (第一个孩子)
        // 枚举第一子树范围 [l+1, k]
        for (int k = l + 1; k <= r; k++) {
            long long cost = f[l + 1][k] + f[k + 1][r]
                           + /* 添加/保留边(l, l+1) 的代价 */
                           + /* 删除不需要的边的代价 */;
            f[l][r] = min(f[l][r], cost);
        }
    }
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 23. [P5469 [NOI2019] 机器人](https://www.luogu.com.cn/problem/P5469)

`DP` `区间DP` `NOI`

### 题意

$n$ 个柱子高度各不相同。选取起点 $s$，P 型机器人向左走到第一个比 $s$ 更高的柱子停下，Q 型机器人向右走到第一个 $\ge h_s$ 的柱子停下。选取所有合法高度序列使得恰好有 $A$ 个不同的"好的起点"，求方案数。

### 分析

对柱子高度离散化后，问题转化为：有多少种 $n$ 的排列满足特定约束。观察到一个起点 $s$ 是"好的"当且仅当 $s$ 是区间 $[L_s, R_s]$ 的最大值，且 $R_s - L_s$ 满足奇偶性条件。

用区间 DP：设 $f[l][r]$ 为 $[l, r]$ 的高度填充方案数，满足约束。转移枚举最大值的位置 $k$（只能放在满足奇偶性的位置），分为左右两部分递归求解。值域很大时用多项式插值优化。

### 核心代码

```cpp
// 区间 DP + 插值优化
long long f[N][N]; // f[l][r]: [l,r] 的合法方案数

for (int len = 1; len <= n; len++)
    for (int l = 1, r = len; r <= n; l++, r++) {
        f[l][r] = 0;
        for (int k = l; k <= r; k++) {
            // k 是 [l,r] 中最大值的位置
            int left = k - l, right = r - k;
            // 奇偶性约束: left 和 right 的奇偶性
            if (/* 不满足约束 */) continue;
            f[l][r] = (f[l][r] + C(r-l, left)
                       * f[l][k-1] % MOD * f[k+1][r]) % MOD;
        }
    }
// 值域大时用拉格朗日插值代替暴力
```

### 复杂度

时间复杂度 $O(n^3)$（暴力）或 $O(n^2 \log n)$（插值优化），空间复杂度 $O(n^2)$。
