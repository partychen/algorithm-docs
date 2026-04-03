---
title: "洛谷 数位与概率DP专题精选解题报告"
subtitle: "🔢 从数位约束到随机过程方程的 DP 主线"
order: 14
icon: "🔢"
---

# 洛谷 数位与概率DP专题精选解题报告

这一组题从数位限制计数一路走到随机过程、概率转移与期望方程，表面上分成数位 DP 和概率 DP 两派，底层逻辑却很接近：都在用状态把“不确定的后续”压缩成可递推的信息。前半段是按位卡限制，后半段则是把随机行为写成方程或转移。

# 一、数位 DP

数位 DP 的核心思路是：把数字逐位枚举，用"是否贴上界"分类讨论，预处理各位数字在特定约束下的方案数。

## 1. [P2657 [SCOI2009] windy 数](https://www.luogu.com.cn/problem/P2657)

`DP` `数位DP` `记忆化搜索`

### 题意

不含前导零且相邻两个数字之差至少为 $2$ 的正整数称为 windy 数。求 $[a, b]$ 中 windy 数的个数。

### 分析

经典数位 DP。用记忆化搜索从高位到低位枚举每一位数字，维护三个状态：当前位 $pos$、上一位数字 $last$、是否贴上界 $limit$、是否已填过非零前导 $lead$。转移时检查当前位与上一位的差是否 $\ge 2$。答案用 $f(b) - f(a-1)$ 的差分求解。

### 核心代码

```cpp
int a[20], dp[20][10];

int dfs(int pos, int last, bool limit, bool lead) {
    if (pos < 0) return 1;
    if (!limit && !lead && dp[pos][last] != -1) return dp[pos][last];
    int up = limit ? a[pos] : 9, res = 0;
    for (int d = 0; d <= up; d++) {
        if (!lead && abs(d - last) < 2) continue;
        if (lead && d == 0)
            res += dfs(pos - 1, -2, limit && d == up, true);
        else
            res += dfs(pos - 1, d, limit && d == up, false);
    }
    if (!limit && !lead) dp[pos][last] = res;
    return res;
}

int solve(int x) {
    int len = 0;
    while (x) a[len++] = x % 10, x /= 10;
    memset(dp, -1, sizeof dp);
    return dfs(len - 1, -2, true, true);
}
// ans = solve(b) - solve(a - 1)
```

### 复杂度

时间复杂度 $O(\log^2 n \cdot 10)$，空间复杂度 $O(\log n \cdot 10)$。

---

## 2. [P2602 [ZJOI2010] 数字计数](https://www.luogu.com.cn/problem/P2602)

`DP` `数位DP` `递推`

### 题意

给定两个正整数 $a$ 和 $b$，求 $[a, b]$ 中所有整数中，每个数码（$0 \sim 9$）各出现了多少次。

### 分析

对每个数码 $d$ 分别做数位 DP。逐位枚举，维护当前位 $pos$、已累计的 $d$ 出现次数 $cnt$、是否贴上界 $limit$、是否前导零 $lead$。前导零时 $0$ 不应被计入。用差分 $f(b) - f(a-1)$ 得到答案。

### 核心代码

```cpp
int a[15];
long long dp[15][15]; // dp[pos][cnt]: 从pos往低位填完后d的出现次数

long long dfs(int pos, int cnt, bool limit, bool lead, int d) {
    if (pos < 0) return cnt;
    if (!limit && !lead && dp[pos][cnt] != -1) return dp[pos][cnt];
    int up = limit ? a[pos] : 9;
    long long res = 0;
    for (int i = 0; i <= up; i++) {
        int nc = cnt;
        if (!(lead && i == 0) && i == d) nc++;
        // 如果当前是前导零区域且i==0,不计入
        res += dfs(pos - 1, nc, limit && i == up, lead && i == 0, d);
    }
    if (!limit && !lead) dp[pos][cnt] = res;
    return res;
}

long long solve(long long x, int d) {
    int len = 0;
    while (x) a[len++] = x % 10, x /= 10;
    memset(dp, -1, sizeof dp);
    return dfs(len - 1, 0, true, true, d);
}
```

### 复杂度

时间复杂度 $O(10 \cdot \log^2 n \cdot 10)$，空间复杂度 $O(\log n \cdot \log n)$。

---

# 二、概率 DP — 求概率

概率 DP 直接计算某个事件发生的概率，状态通常是"当前还剩多少资源"，转移对应各种随机事件。

## 3. [CF148D Bag of mice](https://www.luogu.com.cn/problem/CF148D)

`DP` `记忆化搜索` `期望`

### 题意

袋中有 $w$ 只白鼠和 $b$ 只黑鼠。公主和龙轮流抓鼠，公主先手。每次公主抓一只；龙抓一只后，还有一只鼠会受惊跳出。先抓到白鼠者胜，都抓完了算龙胜。求公主获胜的概率。

### 分析

设 $f(i, j)$ 为袋中还有 $i$ 只白鼠、$j$ 只黑鼠、轮到公主抓时公主获胜的概率。转移：

- 公主抓到白鼠：概率 $i/(i+j)$，公主直接胜。
- 公主抓到黑鼠，龙也抓到黑鼠，跳出黑鼠：$f(i, j-3)$。
- 公主抓到黑鼠，龙也抓到黑鼠，跳出白鼠：$f(i-1, j-2)$。
- 公主抓到黑鼠，龙抓到白鼠：龙胜，贡献 $0$。

### 核心代码

```cpp
double f[1005][1005];

double dp(int w, int b) {
    if (w <= 0) return 0;
    if (b <= 0) return 1;
    if (f[w][b] >= 0) return f[w][b];
    double tot = w + b, res = w / tot; // 公主直接抓到白鼠
    if (b >= 3)
        res += (double)b/tot * (b-1)/(tot-1) * (b-2)/(tot-2) * dp(w, b-3);
    if (b >= 2 && w >= 1)
        res += (double)b/tot * (b-1)/(tot-1) * w/(tot-2) * dp(w-1, b-2);
    return f[w][b] = res;
}
```

### 复杂度

时间复杂度 $O(wb)$，空间复杂度 $O(wb)$。

---

## 4. [CF768D Jon and Orbs](https://www.luogu.com.cn/problem/CF768D)

`DP`

### 题意

有 $k$ 种宝珠，每天等概率生成一种。给定多个询问 $p_i$，求最少等多少天，使得收集齐 $k$ 种宝珠的概率不小于 $p_i / 2000$。

### 分析

设 $f[d][j]$ 为 $d$ 天后恰好收集了 $j$ 种宝珠的概率。初始 $f[0][0] = 1$。转移：第 $d$ 天，若已有 $j$ 种，以 $j/k$ 概率抽到已有种类（仍为 $j$ 种），以 $(k-j)/k$ 概率抽到新种类（变为 $j+1$ 种）。

对每个询问 $p_i$，找到最小的 $d$ 使得 $f[d][k] \ge p_i / 2000$。

### 核心代码

```cpp
int k, q;
double f[10005][25]; // f[d][j]: d天后有j种的概率

f[0][0] = 1.0;
for (int d = 0; d < 10000; d++)
    for (int j = 0; j <= k; j++) if (f[d][j] > 1e-15) {
        f[d+1][j] += f[d][j] * j / k;       // 抽到旧种
        if (j < k)
            f[d+1][j+1] += f[d][j] * (k-j) / k; // 抽到新种
    }

// 查询: 对每个 p, 找最小 d 使 f[d][k] >= p/2000.0
```

### 复杂度

时间复杂度 $O(D \cdot k + q)$（$D$ 为天数上界），空间复杂度 $O(D \cdot k)$。

---

# 三、期望 DP — 随机游走与高斯消元

期望 DP 求"达到某状态的期望步数/期望代价"。当转移图有环（随机游走）时，需要列方程用高斯消元求解。

## 5. [P4316 绿豆蛙的归宿](https://www.luogu.com.cn/problem/P4316)

`DP` `拓扑排序` `期望`

### 题意

给出 $n$ 个点 $m$ 条边的有向无环图，起点 $1$，终点 $n$。到达每个点时等概率选择一条出边，求从 $1$ 到 $n$ 的期望路径长度。

### 分析

DAG 上的期望 DP，从终点往起点逆推。设 $f[u]$ 为从 $u$ 到 $n$ 的期望距离。$f[n] = 0$，对其他点 $f[u] = \frac{1}{out_u} \sum_{(u,v,w)} (f[v] + w)$。按拓扑逆序（或反向图上拓扑序）转移。

### 核心代码

```cpp
int n, m, out[N];
double f[N];
vector<pair<int,int>> rg[N]; // 反向图

// 反向图上拓扑排序
queue<int> q;
q.push(n); f[n] = 0;
// in-degree on reverse graph
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (auto [v, w] : rg[u]) { // (v,u,w) 是原图的边
        f[v] += (f[u] + w) / out[v];
        if (--rin[v] == 0) q.push(v);
    }
}
// ans = f[1]
```

### 复杂度

时间复杂度 $O(n + m)$，空间复杂度 $O(n + m)$。

---

## 6. [P3232 [HNOI2013 / JSOI2013] 游走](https://www.luogu.com.cn/problem/P3232)

`DP` `高斯消元` `期望`

### 题意

$n$ 个点 $m$ 条边的无向连通图，从 $1$ 号点随机游走到 $n$ 号点。每步等概率选当前点的一条边，获得等于该边编号的分数。你可以对边重新编号，使期望总分最小。

### 分析

设 $E_i$ 为节点 $i$ 的期望经过次数。列方程：$E_1 = 1 + \sum_{j \ne n} E_j / d_j \cdot [j \text{ 与 } 1 \text{ 相邻}]$，对 $i \ne 1, n$：$E_i = \sum_{j \ne n} E_j / d_j \cdot [j \text{ 与 } i \text{ 相邻}]$，$E_n = 0$。

用高斯消元解出 $E_i$。每条边 $(u,v)$ 的期望经过次数为 $E_u / d_u + E_v / d_v$。贪心地将编号 $1$ 分配给期望经过次数最大的边，编号 $m$ 分配给最小的边。

### 核心代码

```cpp
double E[N]; // 节点期望经过次数
double a[N][N]; // 高斯消元系数矩阵

// 建方程: E[i] - sum(E[j]/d[j]) = [i==1]
for (int i = 1; i < n; i++) {
    a[i][i] = 1;
    for (int j : adj[i]) if (j != n)
        a[i][j] -= 1.0 / deg[j];
    a[i][n] = (i == 1) ? 1 : 0;
}
gauss(n - 1); // 高斯消元

// 计算每条边的期望经过次数
vector<double> edge_exp;
for (auto [u, v] : edges)
    edge_exp.push_back(E[u] / deg[u] + E[v] / deg[v]);

sort(edge_exp.rbegin(), edge_exp.rend());
double ans = 0;
for (int i = 0; i < m; i++)
    ans += edge_exp[i] * (i + 1);
```

### 复杂度

时间复杂度 $O(n^3 + m \log m)$，空间复杂度 $O(n^2)$。

---

## 7. [CF24D Broken robot](https://www.luogu.com.cn/problem/CF24D)

`DP` `高斯消元` `期望`

### 题意

$n \times m$ 的矩阵，机器人在 $(x, y)$，每步等概率向左、右、下走或原地不动（不能走出矩阵），求走到最后一行的期望步数。

### 分析

设 $f[i][j]$ 为从 $(i, j)$ 到最后一行的期望步数。最后一行 $f[n][j] = 0$。对每一行 $i$，$f[i][j]$ 之间形成一组方程（因为同行可以左右走），需要用高斯消元对每行独立求解。

对于行 $i$：$f[i][1] = 1 + \frac{1}{3}(f[i][1] + f[i][2] + f[i+1][1])$（左边界），$f[i][j] = 1 + \frac{1}{4}(f[i][j-1] + f[i][j] + f[i][j+1] + f[i+1][j])$（中间），类似处理右边界。每行是三对角矩阵，$O(m)$ 解。

### 核心代码

```cpp
double f[1505][1505];
// 从第 n-1 行到第 1 行逆推
for (int i = n - 1; i >= x; i--) {
    // 建三对角方程组 Ax = b
    // a[j]*f[j-1] + b[j]*f[j] + c[j]*f[j+1] = d[j]
    double aa[1505], bb[1505], cc[1505], dd[1505];
    for (int j = 1; j <= m; j++) {
        int k = (j == 1 || j == m) ? 3 : 4;
        bb[j] = 1.0 - 1.0 / k; // 系数
        aa[j] = (j > 1) ? -1.0 / k : 0;
        cc[j] = (j < m) ? -1.0 / k : 0;
        dd[j] = 1.0 + f[i + 1][j] / k;
    }
    // 追赶法(Thomas algorithm)解三对角方程
    for (int j = 2; j <= m; j++) {
        double w = aa[j] / bb[j - 1];
        bb[j] -= w * cc[j - 1];
        dd[j] -= w * dd[j - 1];
    }
    f[i][m] = dd[m] / bb[m];
    for (int j = m - 1; j >= 1; j--)
        f[i][j] = (dd[j] - cc[j] * f[i][j + 1]) / bb[j];
}
// ans = f[x][y]
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 8. [P4457 [BJOI2018] 治疗之雨](https://www.luogu.com.cn/problem/P4457)

`DP` `高斯消元` `递推` `期望`

### 题意

有 $m+1$ 个数，第一个数 $p$ 的范围为 $[0, n]$。每轮操作：在不为最大值的数中等概率选一个加 $1$；然后执行 $k$ 次：在不为最小值的数中等概率选一个减 $1$。求第一个数变为 $0$ 的期望操作轮数。

### 分析

设 $f[i]$ 为第一个数当前为 $i$ 时变为 $0$ 的期望轮数。列出 $f[i]$ 关于 $f[i-1], f[i], f[i+1]$ 的方程（转移概率通过组合数计算加 $1$ 和减 $k$ 次后的概率分布）。

这是一个三对角线性方程组，可以用追赶法或一般高斯消元求解。特别注意：$p = 0$ 时已经达到目标；$p = n$ 时不能加 $1$。

### 核心代码

```cpp
double f[N];
// 对每个 i in [1,n], 概率分析:
// 加1概率 pu (如果 i < n), 不加概率 1-pu
// 然后 k 次减: 第一个数被减 t 次的概率 P(t)
// f[i] = 1 + sum over delta: prob * f[i + delta]

// 建方程 a[i]*f[i-1] + b[i]*f[i] + c[i]*f[i+1] = d[i]
// 用追赶法或高斯消元求解
double a[N], b[N], c[N], d[N];
for (int i = 1; i <= n; i++) {
    // 计算从状态 i 转移到 i-1, i, i+1 的概率
    // (具体概率涉及组合数 C(k, t) * (1/(m+1))^t * (m/(m+1))^(k-t))
    a[i] = -p_down; // 转移到 i-1 的概率
    b[i] = 1 - p_stay; // 1 - 停留概率
    c[i] = -p_up;  // 转移到 i+1 的概率
    d[i] = 1;
}
// 追赶法求解
```

### 复杂度

时间复杂度 $O(n + k)$，空间复杂度 $O(n)$。

---

# 四、期望 DP — 综合应用

本章的题目将期望/概率与其他算法结合，如最短路、状压、线段树或组合数学。

## 9. [P1850 [NOIP 2016 提高组] 换教室](https://www.luogu.com.cn/problem/P1850)

`DP` `期望` `Floyd 算法`

### 题意

$n$ 个时间段，每段在教室 $c_i$ 或 $d_i$ 上课。可以申请最多 $m$ 次换教室（把 $c_i$ 换为 $d_i$），第 $i$ 次申请通过概率为 $k_i$。最小化相邻时间段之间移动距离的期望。

### 分析

先用 Floyd 预处理所有教室对之间的最短路。设 $f[i][j][0/1]$ 为前 $i$ 段课、已申请 $j$ 次、第 $i$ 段是否申请的最小期望距离。转移时枚举第 $i-1$ 段是否申请，并根据两段各自的通过概率计算四种情况（通过/不通过）的期望距离。

### 核心代码

```cpp
double f[N][N][2]; // f[i][j][0/1]
int c[N], d[N];
double k[N];
int dis[305][305]; // Floyd 最短路

// Floyd
for (int k = 1; k <= V; k++)
    for (int i = 1; i <= V; i++)
        for (int j = 1; j <= V; j++)
            dis[i][j] = min(dis[i][j], dis[i][k] + dis[k][j]);

// DP
for (int i = 2; i <= n; i++)
    for (int j = 0; j <= min(i, m); j++) {
        f[i][j][0] = min(
            f[i-1][j][0] + dis[c[i-1]][c[i]],
            f[i-1][j][1] + k[i-1]*dis[d[i-1]][c[i]]
                         + (1-k[i-1])*dis[c[i-1]][c[i]]);
        if (j > 0)
            f[i][j][1] = min(
                f[i-1][j-1][0] + k[i]*dis[c[i-1]][d[i]]
                               + (1-k[i])*dis[c[i-1]][c[i]],
                f[i-1][j-1][1] + /* 四种概率组合 */);
    }
```

### 复杂度

时间复杂度 $O(V^3 + nm)$，空间复杂度 $O(nm)$。

---

## 10. [P2473 [SCOI2008] 奖励关](https://www.luogu.com.cn/problem/P2473)

`DP` `期望` `状压 DP`

### 题意

$k$ 轮抛出 $n$ 种宝物（等概率），每次可选择吃或不吃。第 $i$ 种宝物得 $p_i$ 分，但必须已吃过其前提集合 $s_i$ 中所有宝物才能吃。求最优策略下的期望得分。

### 分析

状态压缩 DP。设 $f[i][S]$ 为第 $i$ 轮、当前已吃宝物集合为 $S$ 时，从第 $i$ 轮到第 $k$ 轮的期望最大得分。**从后往前**递推：$f[k+1][S] = 0$，转移时枚举本轮抛出的宝物 $j$（概率 $1/n$），如果 $s_j \subseteq S$ 则可选择吃（得 $p_j$ 分，集合变为 $S | (1 \ll j)$）或不吃，取较大者。

### 核心代码

```cpp
int n, k, p[N], s[N];
double f[K][1 << N]; // f[i][S]: 第i轮,已吃集合S,后续期望最大得分

for (int i = k; i >= 1; i--)
    for (int S = 0; S < (1 << n); S++) {
        f[i][S] = 0;
        for (int j = 0; j < n; j++) {
            if ((S & s[j]) == s[j]) // 前提满足,可以吃
                f[i][S] += max(f[i+1][S], f[i+1][S | (1<<j)] + p[j]);
            else
                f[i][S] += f[i+1][S]; // 不能吃
        }
        f[i][S] /= n;
    }
// ans = f[1][0]
```

### 复杂度

时间复杂度 $O(k \cdot 2^n \cdot n)$，空间复杂度 $O(k \cdot 2^n)$（可滚动到 $O(2^n)$）。

---

## 11. [P2221 [HAOI2012] 高速公路](https://www.luogu.com.cn/problem/P2221)

`DP` `线段树` `期望`

### 题意

$n$ 个收费站排成一排，$n-1$ 段路初始免费。支持区间加操作（调整路段收费），以及查询：在 $[l, r]$ 中等概率选两个不同站 $a, b$，从 $a$ 到 $b$ 的期望费用。

### 分析

从 $a$ 到 $b$ 的费用是路段 $[\min(a,b), \max(a,b)-1]$ 的费用之和。期望 = 所有 $(a,b)$ 对的费用总和 $/ \binom{r-l+1}{2}$。

对于费用总和，路段 $i$（连接站 $i$ 和 $i+1$）被选中的次数等于左侧站点数 $\times$ 右侧站点数 = $(i - l + 1)(r - i)$。因此总和 = $\sum_{i=l}^{r-1} v_i \cdot (i - l + 1)(r - i)$。

展开后变为关于 $v_i \cdot i^2$、$v_i \cdot i$、$v_i$ 的线性组合，用线段树维护三个量即可支持区间加和区间查询。

### 核心代码

```cpp
// 线段树维护 sum(v[i]), sum(v[i]*i), sum(v[i]*i*i)
// 区间加: v[l..r] += d
// 查询 [l,r]: ans = sum v[i] * (i-l+1) * (r-i)
//            = (r+1-l)*sum(v[i]*i) - sum(v[i]*i*i)
//              - (l-1)*(r)*sum(v[i]) + (l-1)*sum(v[i]*i) + ...
// 除以 C(r-l+1, 2) 得期望

struct Node {
    long long s0, s1, s2, tag; // sum(v), sum(v*i), sum(v*i^2)
};

void update(int l, int r, long long d) { /* 区间加 */ }
long long query(int l, int r) {
    // 返回 sum_{i=l}^{r-1} v[i] * (i-l+1) * (r-i)
}
```

### 复杂度

时间复杂度 $O(q \log n)$，空间复杂度 $O(n)$。

---

## 12. [P4492 [HAOI2018] 苹果树](https://www.luogu.com.cn/problem/P4492)

`DP` `树形 DP` `组合数学` `排列组合` `概率论`

### 题意

一棵二叉树从 $1$ 个根节点开始，每天随机选一个空分支长出新节点。$n$ 天后，求树上所有点对距离之和的期望乘以 $n!$，对 $P$ 取模。

### 分析

等价于对所有 $n!$ 种可能的生长顺序（每种概率相同），求距离之和的总贡献。考虑每条边 $(u, \text{parent}(u))$ 的贡献：它被一个点对 $(a, b)$ 经过当且仅当 $a, b$ 分别在 $u$ 的子树内和子树外。

设 $sz_u$ 为 $u$ 的子树大小，则边 $(u, \text{parent}(u))$ 对所有点对距离的贡献为 $sz_u \cdot (n - sz_u)$。但这里子树大小是随机的，需要对所有可能的树形态求和。

利用组合恒等式：节点 $u$ 的子树大小 $sz_u$ 的分布可以通过插入顺序的组合数刻画。最终答案可以通过对每个节点的贡献求和并乘以相应的排列数得到。

### 核心代码

```cpp
long long fac[N], inv[N], ans;
int n;

// 预处理阶乘和逆元
// 对每个节点 u = 2..n:
// 节点 u 的插入时刻为 u (按编号顺序)
// 边 (u, parent(u)) 的贡献:
// 对所有树形态求和 sz_u * (n - sz_u) * (对应排列数)

// 推导: E[sz_u * (n - sz_u)] * n! 
// = n! * (E[sz_u] * n - E[sz_u^2])
// 其中 E[sz_u] 和 E[sz_u^2] 可由调和级数推导

for (int u = 2; u <= n; u++) {
    // 节点 u 在时刻 u 插入
    // 此后还有 n-u 个节点,每个有概率落在 u 的子树中
    // E[sz_u] = 1 + (n-u) * 适当概率
    long long contrib = /* 组合推导结果 */;
    ans = (ans + contrib) % MOD;
}
// ans = ans * 2 % MOD  // 无序点对变有序再除以2
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。
