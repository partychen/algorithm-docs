---
title: "洛谷 经典DP综合专题精选解题报告"
subtitle: "🧠 把计数、图论、树形与结构优化揉在一起的综合 DP"
order: 16
icon: "🧠"
---

# 洛谷 经典DP综合专题精选解题报告

这一组题从排列计数一路走到缩点后树形 DP、区间结构优化和杨表模型，题面跨度很大，但共通点是：单一 DP 视角已经不够，必须把计数、图论、数据结构或组合数学一起揉进状态设计里。它更像一组“组合拳”练习，重点是识别哪几种工具需要同时上场。

# 一、排列操作与计数 DP

本章聚焦"对排列执行某种区间操作后，能产生多少种不同结果"这类计数问题，核心在于分析操作的等价条件并建立 DP 模型。

## 1. [P10741 [SEERC 2020] Fence Job](https://www.luogu.com.cn/problem/P10741)

`DP` `动态规划 DP` `ICPC` `2020` `SEERC`

### 题意

给定一个长度为 $n$ 的排列 $h$，每次操作可以选择一段区间 $[l,r]$，令 $h_i = \min_{j=l}^{r} h_j$（$i \in [l,r]$）。问经过若干次操作（可以为 $0$ 次）后不同的数组数量，对 $10^9+7$ 取模。

### 分析

操作本质是把一段区间全部覆盖为区间最小值。最终每个位置的值一定是原排列中某个元素，且合法的最终数组等价于：对每个位置 $i$，其最终值 $v_i$ 满足 $v_i \le h_i$，并且 $v_i$ 在原排列中的位置能通过取 min 操作"覆盖"到位置 $i$。

用单调栈找出每个元素作为最小值能控制的区间 $[L_j, R_j]$。设 $f[i]$ 为前 $i$ 个位置的合法方案数，枚举位置 $i$ 的值来自哪个原始元素，转移时利用单调栈维护的区间信息。位置 $i$ 可以取值 $h_j$ 当且仅当 $i \in [L_j, R_j]$。

### 核心代码

```cpp
int n, h[N], f[N];
int L[N], R[N], stk[N], top;

// 单调栈求每个元素作为最小值的控制区间
top = 0;
for (int i = 1; i <= n; i++) {
    while (top && h[stk[top]] >= h[i]) top--;
    L[i] = top ? stk[top] + 1 : 1;
    stk[++top] = i;
}
top = 0;
for (int i = n; i >= 1; i--) {
    while (top && h[stk[top]] >= h[i]) top--;
    R[i] = top ? stk[top] - 1 : n;
    stk[++top] = i;
}

f[0] = 1;
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= n; j++)
        if (L[j] <= i && i <= R[j])
            f[i] = (f[i] + f[L[j] - 1]) % MOD;
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

---

## 2. [AT_agc058_b [AGC058B] Adjacent Chmax](https://www.luogu.com.cn/problem/AT_agc058_b)

`DP` `动态规划 DP` `单调队列`

### 题意

给定一个 $1 \sim n$ 的排列 $P$，可以进行若干次操作：选择 $i$（$1 \le i \le n-1$），令 $v = \max(P_i, P_{i+1})$，然后将 $P_i$ 和 $P_{i+1}$ 都改为 $v$。求最后可能得到多少种不同的结果，对 $998244353$ 取模。

### 分析

操作把相邻两个位置都变成它们的较大值。最终数组中，每个值一定是原排列中某个元素"向左或向右扩展"的结果。从大到小考虑排列中的值，每个值要么保持在原位，要么向左右扩展覆盖一段连续区间。

关键观察：从大到小处理值时，用 DP 维护当前已处理的值把序列分成若干"段"的状态。设 $f[i]$ 为处理完前 $i$ 大的值时的方案数，转移时考虑第 $i$ 大的值是独立成段、合并到左边段、合并到右边段、还是连接左右两段。

### 核心代码

```cpp
int n, pos[N];
long long f[N]; // f[i]: 从大到小处理了i个值后的方案数

// pos[v] = v 在原排列中的位置
f[0] = 1;
int seg = 0;
for (int v = n; v >= 1; v--) {
    // 值v位于pos[v]，与左右已有段的邻接关系决定转移
    // 新值可以: 开新段, 并入左段, 并入右段, 合并左右段
    long long nf = 0;
    nf = f[seg] * (seg + 1) % MOD; // 开新段
    if (seg > 0)
        nf = (nf + f[seg] * seg) % MOD; // 合并相邻段
    f[++seg] = nf;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 3. [P3643 [APIO2016] 划艇](https://www.luogu.com.cn/problem/P3643)

`DP` `动态规划 DP` `动态规划优化` `排列组合` `前缀和`

### 题意

$N$ 个划艇学校排成一排，第 $i$ 个学校可以选择不派出划艇，或派出 $[a_i, b_i]$ 范围内的划艇。如果学校 $i$ 派出划艇，其数量必须严格大于所有编号小于它且派出划艇的学校的数量。求所有可能的参加庆典方案数（至少一艘），对 $10^9+7$ 取模。

### 分析

将所有 $a_i, b_i$ 端点离散化，得到若干不相交的值域区间段。对每个值域段，枚举哪些学校在这个段中派出了划艇，这些学校的派出数量必须严格递增且都落在同一个值域段内。

设 $f[i][j]$ 表示考虑前 $i$ 个学校、最后一个派出划艇的学校落在第 $j$ 个值域段中的方案数。对于值域段长度为 $len$，如果有 $k$ 个学校选择在这个段中派出划艇，方案数为 $\binom{len}{k}$。用前缀和优化转移。

### 核心代码

```cpp
int n, a[N], b[N];
long long f[N][N]; // f[i][j]: 前i个学校,最后派出的在第j段
vector<int> pts;

// 离散化
for (int i = 1; i <= n; i++)
    pts.push_back(a[i]), pts.push_back(b[i] + 1);
sort(pts.begin(), pts.end());
pts.erase(unique(pts.begin(), pts.end()), pts.end());
int S = pts.size() - 1;

f[0][0] = 1;
for (int j = 1; j <= S; j++) {
    int len = pts[j] - pts[j - 1];
    for (int i = 1; i <= n; i++) {
        f[i][j] = f[i][j - 1]; // 学校i不在段j
        if (/* 学校i的范围包含段j */) {
            // 枚举段j中参与的学校集合，用组合数计算
            long long sum = 0;
            for (int p = 0; p < j; p++)
                sum = (sum + f[i-1][p]) % MOD;
            f[i][j] = (f[i][j] + sum * C(len, 1)) % MOD;
        }
    }
}
```

### 复杂度

时间复杂度 $O(n^3)$（经值域离散化与前缀和优化后），空间复杂度 $O(n^2)$。

---

# 二、图论与树形 DP 综合

本章的题目将图论算法（Tarjan 缩点、边双连通分量）或矩阵快速幂与树形 DP 结合，需要在图的结构变换后再做 DP。

## 4. [P8867 [NOIP2022] 建造军营](https://www.luogu.com.cn/problem/P8867)

`DP` `树形DP` `Tarjan` `缩点` `双连通分量` `容斥原理`

### 题意

给定 $n$ 个点 $m$ 条边的无向连通图。选择若干城市建造军营（至少一座），并选择若干道路派兵看守。要求：无论敌方袭击哪条未看守的道路，任意两个军营之间仍然连通。求方案数，对 $10^9+7$ 取模。

### 分析

桥边要么被看守，要么桥边两侧最多一侧有军营。先用 Tarjan 求边双连通分量（e-BCC），缩成一棵树。每个 e-BCC 内部的边任意选择看守或不看守（$2^{\text{内部边数}}$ 种），因为内部删任意一条边都不影响连通性。

在缩点后的树上做树形 DP：设 $f[u][0/1]$ 表示以 $u$ 为根的子树内，$u$ 所在连通块中是否有军营。转移时，桥边（树边）要么被看守（$2$ 种方向），要么不被看守（两侧只能一侧有军营）。

### 核心代码

```cpp
// Tarjan 求边双缩点后得到树
// sz[u] = e-BCC 内点数, inner[u] = e-BCC 内部边数
long long f[N][2]; // f[u][0]: u侧无军营, f[u][1]: u侧有军营

void dfs(int u, int fa) {
    long long pw = qpow(2, inner[u]);
    f[u][0] = pw;
    f[u][1] = (qpow(2, sz[u]) - 1 + MOD) % MOD * pw % MOD;
    for (int v : tree[u]) {
        if (v == fa) continue;
        dfs(v, u);
        long long g0 = f[u][0], g1 = f[u][1];
        // 树边看守(2种) 或 不看守(1种,v侧不能有军营)
        f[u][0] = (g0 * (f[v][0] + f[v][1]) % MOD * 2
                 + g0 * f[v][0]) % MOD;
        f[u][1] = (g1 * (f[v][0] + f[v][1]) % MOD * 2
                 + g1 * f[v][0]) % MOD;
    }
}
// 答案 = f[root][1]
```

### 复杂度

时间复杂度 $O(n + m)$，空间复杂度 $O(n + m)$。

---

## 5. [P6803 [CEOI 2020] 星际迷航](https://www.luogu.com.cn/problem/P6803)

`DP` `矩阵` `矩阵加速` `树形 DP` `CEOI（中欧）`

### 题意

给定一棵 $N$ 个点的树，复制 $D$ 次得到 $D+1$ 棵相同的树。第 $i$ 棵选一个点 $A_i$ 与第 $i+1$ 棵的点 $B_i$ 之间建单向星门。两人从第 $0$ 棵树的节点 $1$ 开始轮流移动，不能移动者输。对所有星门连接方案，求先手必胜的方案数，对 $998244353$ 取模。

### 分析

先在单棵树上做博弈分析：对每个节点判断以它为起点先手是否必胜。通过换根 DP 可以求出以每个节点为根时的胜负。

跨树的星门 $(A_i, B_i)$ 相当于给 $A_i$ 增加一条出边到下一棵树的 $B_i$，这会改变 $A_i$ 的胜负状态。设 $W$ 为先手必胜点数、$L$ 为先手必败点数，跨树转移可以表示为 $2 \times 2$ 矩阵。用矩阵快速幂加速 $D$ 层转移。

### 核心代码

```cpp
// 换根 DP 求每个点作为根时的胜负
int f[N]; // f[u] = 0/1: 以u为根,先手必败/必胜
void dfs1(int u, int fa) {
    f[u] = 0;
    for (int v : g[u]) if (v != fa) {
        dfs1(v, u);
        if (!f[v]) f[u] = 1;
    }
}

// 换根后统计 W(必胜点数), L(必败点数)
// 跨树转移矩阵 M[2][2]:
// M[i][j] = 从当前层状态i到下一层状态j的方案数
typedef array<array<long long,2>,2> Mat;
Mat M;
M[0][0] = /* L侧连L的方案 */;
M[0][1] = /* L侧连W的方案 */;
M[1][0] = /* W侧连L的方案 */;
M[1][1] = /* W侧连W的方案 */;

Mat ans = mat_pow(M, D); // 矩阵快速幂
```

### 复杂度

时间复杂度 $O(n + \log D)$，空间复杂度 $O(n)$。

---

# 三、区间划分与线段树 DP

本章涉及序列的区间划分或子段选取问题，需要结合离散化、双指针、线段树等工具进行 DP。

## 6. [P1973 [NOI2011] NOI 嘉年华](https://www.luogu.com.cn/problem/P1973)

`DP` `动态规划 DP` `双指针 two-pointer` `NOI`

### 题意

$n$ 个活动，第 $i$ 个活动从时刻 $S_i$ 开始，持续 $T_i$。将活动分配到两个会场，要求同一时刻不能两个会场都有活动在进行。最大化活动较少的那个会场的活动数量。此外，对每个活动 $i$，回答若该活动必须举办时的最优结果。

### 分析

先将时间离散化。预处理 $cnt[l][r]$ 表示时间段 $[l,r]$ 内最多能选多少互不冲突的活动。

设 $f[i][j]$ 表示前 $i$ 个时间点、会场 A 恰好选了 $j$ 个活动时，会场 B 最多能选多少。转移时枚举一段时间全部分给 A 或 B。对于必须举办某个活动的询问，维护前缀和后缀 DP 值并合并。

### 核心代码

```cpp
int n, cnt[N][N];
int f[N][N]; // f[i][j]: 前i个时间点,A选j个,B最多选多少
int g[N][N]; // g[i][j]: 后缀DP

memset(f, -1, sizeof f);
f[0][0] = 0;
for (int i = 0; i < T; i++)
    for (int j = 0; j <= n; j++) if (f[i][j] >= 0)
        for (int k = i + 1; k <= T; k++) {
            int c = cnt[i + 1][k];
            // [i+1, k] 分给 A
            f[k][j + c] = max(f[k][j + c], f[i][j]);
            // [i+1, k] 分给 B
            f[k][j] = max(f[k][j], f[i][j] + c);
        }

int ans = 0;
for (int j = 0; j <= n; j++)
    if (f[T][j] >= 0)
        ans = max(ans, min(j, f[T][j]));
```

### 复杂度

时间复杂度 $O(T^2 n)$（$T$ 为离散化后的时间点数），空间复杂度 $O(Tn)$。

---

## 7. [P4065 [JXOI2017] 颜色](https://www.luogu.com.cn/problem/P4065)

`DP` `线段树` `枚举` `哈希 hashing` `随机化`

### 题意

给定长度为 $n$ 的正整数序列，相同正整数代表相同颜色。选择若干颜色删除（删除该颜色的所有位置），使剩余序列非空且连续。求满足条件的删除方案数。

### 分析

等价于枚举保留的连续段 $[l, r]$，要求其中出现的每种颜色的所有位置都在 $[l, r]$ 内。对每种颜色 $c$，记 $first_c$ 和 $last_c$ 为其最左和最右出现位置。则 $[l,r]$ 合法当且仅当：对所有 $l \le i \le r$，$first_{A_i} \ge l$ 且 $last_{A_i} \le r$。

固定右端点 $r$ 右移，维护合法的最小左端点 $l$。用线段树或栈维护约束：当颜色 $c$ 的 $last_c = r$ 时，$l$ 必须 $\ge first_c$；当某颜色只有部分位置在 $[l,r]$ 中时 $l$ 需右移。

### 核心代码

```cpp
int n, a[N], fc[N], lc[N];
long long ans = 0;

for (int i = 1; i <= n; i++) {
    if (!fc[a[i]]) fc[a[i]] = i;
    lc[a[i]] = i;
}

// 枚举右端点,维护最小合法左端点 lo
int lo = 1;
for (int r = 1; r <= n; r++) {
    // 颜色 a[r] 首次出现在 fc[a[r]]
    // 若 r 不是 a[r] 的最后出现,则 l 不能 <= fc[a[r]]
    // 实际通过线段树维护每个 l 的不合法颜色计数
    if (r == lc[a[r]])
        lo = max(lo, fc[a[r]]);
    // 合法的 l 在 [lo, r] 中且满足所有约束
    ans += /* 合法 l 的个数 */;
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

# 四、杨表与 LIS 进阶

本章将最长上升子序列（LIS）与代数组合工具（杨表、网络流）结合，属于 LIS 理论的深度应用。

## 8. [P4484 [BJWC2018] 最长上升子序列](https://www.luogu.com.cn/problem/P4484)

`DP` `差分` `杨表` `状压 DP`

### 题意

给定一个长度为 $n$（$n \le 28$）的随机排列，求其 LIS 长度的期望，对 $998244353$ 取模。

### 分析

由 RSK 对应，排列的 LIS 长度等于其对应标准杨表第一行长度。问题转化为：对所有 $n!$ 个排列，求对应杨表第一行长度之和。

由钩子长度公式，每种形状 $\lambda \vdash n$ 的标准杨表个数 $f_\lambda = n! / \prod_{(i,j) \in \lambda} h(i,j)$。答案为 $\sum_\lambda f_\lambda^2 \cdot \lambda_1 / n!$。

由于 $n \le 28$，枚举所有整数分拆（$p(28) = 3718$），对每种分拆计算钩子公式即可。

### 核心代码

```cpp
long long ans = 0, fac[30];

// DFS 枚举整数分拆 lambda
void dfs(vector<int>& lam, int rem, int maxv) {
    if (rem == 0) {
        // 钩子公式: f = n! / prod(hook lengths)
        long long hooks = 1;
        int rows = lam.size();
        for (int i = 0; i < rows; i++)
            for (int j = 0; j < lam[i]; j++) {
                int h = lam[i] - j;
                for (int k = i + 1; k < rows && lam[k] > j; k++) h++;
                hooks = hooks * h % MOD;
            }
        long long f = fac[n] % MOD * qpow(hooks, MOD - 2) % MOD;
        ans = (ans + f % MOD * f % MOD * lam[0]) % MOD;
        return;
    }
    for (int v = min(maxv, rem); v >= 1; v--) {
        lam.push_back(v);
        dfs(lam, rem - v, v);
        lam.pop_back();
    }
}
```

### 复杂度

时间复杂度 $O(p(n) \cdot n^2)$（$p(28) = 3718$），空间复杂度 $O(n)$。

---

## 9. [P3774 [CTSC2017] 最长上升子序列](https://www.luogu.com.cn/problem/P3774)

`DP` `网络流` `杨表` `CTSC/CTS`

### 题意

给定序列 $B = (b_1, \ldots, b_n)$，多次询问 $(m, k)$：在 $B$ 的前 $m$ 个元素中，选出最长的子序列 $C$，使得 $C$ 的 LIS 长度不超过 $k$，求 $|C|$ 的最大值。

### 分析

由 Dilworth 定理，LIS 长度不超过 $k$ 等价于序列可划分为 $k$ 条不上升链。因此问题转化为：选 $k$ 条不上升子序列能覆盖的最多元素。

这是最小路径覆盖的对偶问题，可建网络流模型求解。也可利用杨表理论：对序列做 RSK 插入，维护杨表形状，答案等于杨表前 $k$ 行长度之和。

### 核心代码

```cpp
// Patience Sorting 维护杨表形状
int shape[N], rows = 0;
vector<int> tails;

for (int i = 1; i <= n; i++) {
    int pos = upper_bound(tails.begin(), tails.end(), b[i])
              - tails.begin();
    if (pos == rows) {
        tails.push_back(b[i]);
        shape[rows++] = 1;
    } else {
        tails[pos] = b[i];
        shape[pos]++;
    }
    // 询问 (m=i, k): ans = sum(shape[0..k-1])
}

// 网络流做法:
// 每个元素拆点 in_i, out_i
// 源->in_i(cap 1), out_i->汇(cap 1), in_i->out_i(cap 1)
// 若 b_i >= b_j (i<j): out_i -> in_j (cap 1)
// 源到汇额外连 cap=k 的边, 最大流即为答案
```

### 复杂度

杨表做法：时间复杂度 $O(n \log n + qk)$，空间复杂度 $O(n)$。网络流做法：时间复杂度 $O(n^2 \sqrt{n})$。
