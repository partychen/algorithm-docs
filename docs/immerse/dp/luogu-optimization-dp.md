---

title: "洛谷 DP优化专题精选解题报告"

subtitle: "⚙️ 从决策单调性到单调队列的 DP 优化主线"

order: 15

icon: "⚙️"

---

# 洛谷 DP优化专题精选解题报告

这一组题从分治优化、斜率优化一路走到单调队列与二维滑窗，做的都是同一件事：把原本要枚举的一大段决策压成单调性、凸性或窗口最值。比起背模板，更重要的是先认出“朴素转移慢在哪里”，再决定该借数学性质还是数据结构砍掉枚举。

# 一、分治决策与区间代价

这一章先把“代价可快速维护、最优断点会顺着终点移动”这一类基础优化建立起来。

## 1. [CF868F Yet Another Minimization Problem](https://www.luogu.com.cn/problem/CF868F)

`分治优化` `区间代价` `决策单调性`

### 题意

把序列划成 `k` 段，每段费用是段内相同元素形成的数对数，求最小总代价。

### 分析

设 `dp[t][i]` 表示前 `i` 个数分成 `t` 段的最小代价，转移为 `dp[t][i]=min(dp[t-1][j]+cost(j+1,i))`。区间费用可以用双指针维护当前窗口中相同数对个数，而最优断点对右端点具有单调性，所以每一层都能用分治优化整行 DP。

### 核心代码

```cpp
long long cost;
void add(int x){ cost += cnt[a[x]]; cnt[a[x]]++; }
void del(int x){ cnt[a[x]]--; cost -= cnt[a[x]]; }
void solve(int l, int r, int ql, int qr, int t) {
    int mid = (l + r) >> 1, best = -1;
    pair<long long, int> res = {INF, -1};
    for (int j = ql; j <= min(mid - 1, qr); j++) {
        move_window(j + 1, mid);
        res = min(res, {pre[j] + cost, j});
    }
    dp[t][mid] = res.first; best = res.second;
    if (l < mid) solve(l, mid - 1, ql, best, t);
    if (mid < r) solve(mid + 1, r, best, qr, t);
}
```

### 复杂度

用可移动区间费用配合分治优化后，常见实现复杂度为 `O(k n log n)`，空间复杂度 `O(n)`。

---

## 2. [P4767 [IOI 2000] 邮局 加强版](https://www.luogu.com.cn/problem/P4767)

`四边形不等式` `区间代价` `决策单调性`

### 题意

有序村庄上建立若干邮局，使每个村庄到最近邮局的距离和最小。

### 分析

先把村庄坐标排序，并预处理 `w[l][r]` 表示一段村庄由一个邮局服务的最小代价，中位数位置就是最优邮局。之后做 `dp[p][i]=min(dp[p-1][j]+w[j+1][i])`，因为代价满足四边形不等式，最优决策点可单调推进。

### 核心代码

```cpp
for (int l = 1; l <= n; l++)
    for (int r = l; r <= n; r++) {
        int mid = (l + r) >> 1;
        w[l][r] = pre[r] - pre[mid] - x[mid] * (r - mid)
                + x[mid] * (mid - l + 1) - (pre[mid] - pre[l - 1]);
    }
for (int p = 1; p <= m; p++) {
    opt[p][n + 1] = n - 1;
    for (int i = n; i >= 1; i--) {
        dp[p][i] = INF;
        for (int j = opt[p - 1][i]; j <= opt[p][i + 1]; j++) {
            long long v = dp[p - 1][j] + w[j + 1][i];
            if (v < dp[p][i]) dp[p][i] = v, opt[p][i] = j;
        }
    }
}
```

### 复杂度

预处理区间代价为 `O(n^2)`，Knuth 型优化后的 DP 为 `O(mn)`，空间复杂度 `O(mn)`。

---

## 3. [P1880 [NOI1995] 石子合并](https://www.luogu.com.cn/problem/P1880)

`区间 DP` `环形展开` `四边形不等式`

### 题意

环上石子只能合并相邻两堆，要求同时求出最小得分和最大得分。

### 分析

把环复制成长度 `2n` 的链，再枚举区间长度做区间 DP。最小值部分仍是 `f[l][r]=min(f[l][k]+f[k+1][r]+sum(l,r))`，并且可借助决策单调性缩小断点范围；最大值则保留普通转移即可。

### 核心代码

```cpp
for (int len = 2; len <= n; len++) {
    for (int l = 1; l + len - 1 <= 2 * n; l++) {
        int r = l + len - 1;
        mn[l][r] = INF, mx[l][r] = -INF;
        for (int k = opt[l][r - 1]; k <= opt[l + 1][r]; k++) {
            long long s = pre[r] - pre[l - 1];
            long long v = mn[l][k] + mn[k + 1][r] + s;
            if (v < mn[l][r]) mn[l][r] = v, opt[l][r] = k;
        }
        for (int k = l; k < r; k++)
            mx[l][r] = max(mx[l][r], mx[l][k] + mx[k + 1][r] + pre[r] - pre[l - 1]);
    }
}
```

### 复杂度

最小值部分可做到 `O(n^2)`，若最大值保留朴素区间转移则总体为 `O(n^3)`，空间复杂度 `O(n^2)`。

---

# 二、斜率优化的线性决策

当转移式能展开成“截距 + 斜率 × 横坐标”时，就可以把 DP 决策变成凸包上的直线查询。

## 4. [CF311B Cats Transport](https://www.luogu.com.cn/problem/CF311B)

`斜率优化` `前缀和` `分段 DP`

### 题意

把所有猫按有效等待时间排序后分给 `p` 位饲养员，最小化总等待时间。

### 分析

先把每只猫的时刻减去所在山丘到起点的路程，得到只与排序相关的一维序列。设 `dp[t][i]` 表示前 `i` 只猫交给 `t` 位饲养员时的最小等待和，转移展开后正好是前缀和上的线性函数最小值查询，用凸包维护即可。

### 核心代码

```cpp
for (int t = 1; t <= p; t++) {
    int hh = 1, tt = 0;
    q[++tt] = 0;
    for (int i = 1; i <= m; i++) {
        while (hh < tt && slope(q[hh], q[hh + 1]) <= a[i]) hh++;
        int j = q[hh];
        dp[t][i] = dp[t - 1][j] + 1LL * a[i] * (i - j) - (pre[i] - pre[j]);
        while (hh < tt && bad(q[tt - 1], q[tt], i)) tt--;
        q[++tt] = i;
    }
}
```

### 复杂度

排序后每层 DP 都是线性凸包，整体复杂度 `O(pm)`，空间复杂度 `O(m)`。

---

## 5. [P4072 [SDOI2016] 征途](https://www.luogu.com.cn/problem/P4072)

`斜率优化` `前缀和` `方差转化`

### 题意

把道路分成 `m` 天行走，希望每天路程尽量平均，从而最小化方差。

### 分析

把方差乘上 `m^2` 后，可以转成最小化每段长度与平均值偏差平方和。令 `s[i]` 为前缀和，就得到形如 `dp[t][i]=min(dp[t-1][j]+(s[i]-s[j]-avg)^2)` 的经典二次式转移，展开后直接做斜率优化。

### 核心代码

```cpp
for (int t = 1; t <= m; t++) {
    int hh = 1, tt = 0;
    q[++tt] = t - 1;
    for (int i = t; i <= n; i++) {
        while (hh < tt && slope(q[hh], q[hh + 1]) <= 2.0 * (s[i] - avg)) hh++;
        int j = q[hh];
        dp[t][i] = dp[t - 1][j] + sqr(s[i] - s[j] - avg);
        while (hh < tt && bad(q[tt - 1], q[tt], i, avg)) tt--;
        q[++tt] = i;
    }
}
```

### 复杂度

每一层用单调凸包线性转移，整体复杂度 `O(mn)`，空间复杂度 `O(n)`。

---

## 6. [P2120 [ZJOI2007] 仓库建设](https://www.luogu.com.cn/problem/P2120)

`斜率优化` `前缀和` `建仓决策`

### 题意

产品只能向山下运输，要求决定哪些工厂建仓库，使建仓费与运输费总和最小。

### 分析

设 `P[i]` 为产品数前缀和，`Q[i]` 为 `x[i]*p[i]` 前缀和，则把第 `j+1..i` 段交给 `i` 建仓的代价能展开成一条关于 `x[i]` 的直线。于是 `dp[i]=c[i]+x[i]P[i]-Q[i]+min(dp[j]+Q[j]-x[i]P[j])`，直接维护下凸包即可。

### 核心代码

```cpp
int hh = 1, tt = 0;
q[++tt] = 0;
for (int i = 1; i <= n; i++) {
    while (hh < tt && slope(q[hh], q[hh + 1]) <= x[i]) hh++;
    int j = q[hh];
    dp[i] = dp[j] + c[i] + x[i] * (P[i] - P[j]) - (Q[i] - Q[j]);
    while (hh < tt && bad(q[tt - 1], q[tt], i)) tt--;
    q[++tt] = i;
}
```

### 复杂度

单次扫描即可完成，时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 7. [P3628 [APIO2010] 特别行动队](https://www.luogu.com.cn/problem/P3628)

`斜率优化` `二次函数` `前缀和`

### 题意

把士兵划成若干连续小队，每队收益是区间和代入二次函数后的结果，求最大总收益。

### 分析

记前缀和为 `s[i]`，则一段 `j+1..i` 的贡献是 `a(s[i]-s[j])^2+b(s[i]-s[j])+c`。展开后得到 `dp[i]=A(s[i])+max(B(j)+K(j)*s[i])`，由于 `s[i]` 单调，维护上凸包即可在线求最大值。

### 核心代码

```cpp
int hh = 1, tt = 0;
q[++tt] = 0;
for (int i = 1; i <= n; i++) {
    while (hh < tt && slope(q[hh], q[hh + 1]) >= 2.0 * a * s[i]) hh++;
    int j = q[hh];
    dp[i] = dp[j] + a * sqr(s[i] - s[j]) + b * (s[i] - s[j]) + c;
    while (hh < tt && bad_max(q[tt - 1], q[tt], i)) tt--;
    q[++tt] = i;
}
```

### 复杂度

前缀和单调时凸包可线性维护，时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 8. [P5504 [JSOI2011] 柠檬](https://www.luogu.com.cn/problem/P5504)

`斜率优化` `按值分类` `分段 DP`

### 题意

把贝壳序列切成若干段，每段选一种大小贡献 `s0*t^2`，要求总贡献最大。

### 分析

固定某个大小 `v` 时，只需要关注它的出现位置序列；若当前位置是第 `k` 次出现，则以它作为段内主值的转移只和更早的同值出现有关。把平方项展开后，每个值都能独立维护一套凸包，查询当前位置时再与全局 `dp` 合并。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) {
    int v = a[i], k = ++cnt[v];
    auto &q = hull[v];
    while (q.size() > 1 && value(q[0], k) <= value(q[1], k)) q.pop_front();
    dp[i] = max(dp[i - 1], value(q.front(), k) + 1LL * v * k * k);
    Line cur = make_line(dp[i - 1], k, v);
    while (q.size() > 1 && bad(q[q.size() - 2], q.back(), cur)) q.pop_back();
    q.push_back(cur);
}
```

### 复杂度

每个值的凸包都只会进出一次，整体复杂度 `O(n)` 到 `O(n log V)`，空间复杂度 `O(n)`。

---

## 9. [P4027 [NOI2007] 货币兑换](https://www.luogu.com.cn/problem/P4027)

`CDQ 分治` `斜率优化` `凸包`

### 题意

每天都能按给定比例把资产在两种券之间转换，要求最大化最终资金。

### 分析

把第 `i` 天结束后的最优资产写成平面上的一个点，下一天的最优值就是用直线 `A_i x + B_i y` 去查询之前所有可达点的最大值。状态之间既有时间先后又有斜率比较，因此常见做法是 CDQ 分治配合凸包，在归并时完成跨区间转移。

### 核心代码

```cpp
void cdq(int l, int r) {
    if (l == r) return;
    int mid = (l + r) >> 1;
    cdq(l, mid);
    build_hull(l, mid);
    for (int i = mid + 1; i <= r; i++) {
        int j = query_best(line[i]);
        dp[i] = max(dp[i], A[i] * X[j] + B[i] * Y[j]);
    }
    inplace_merge(id + l, id + mid + 1, id + r + 1, cmp_k);
    cdq(mid + 1, r);
}
```

### 复杂度

CDQ 每层做一次凸包归并，时间复杂度 `O(n log n)`，空间复杂度 `O(n)`。

---

## 10. [P6302 [NOI2019] 回家路线 加强版](https://www.luogu.com.cn/problem/P6302)

`斜率优化` `按站点建凸包` `最短路式 DP`

### 题意

列车之间可以按到站时刻换乘，等待会产生二次烦躁值，要求最小化总烦躁。

### 分析

把每班列车看成一条带着出发时刻和到达时刻的状态边，若在同一站等待 `w` 时间再上下一班车，就会产生一项关于 `w` 的二次函数。将式子展开后，对每个站点维护“到站时刻”为横坐标的下凸包，就能在处理下一班车时快速得到最佳前驱。

### 核心代码

```cpp
sort(train + 1, train + m + 1, cmp_depart);
for (int i = 1; i <= m; i++) {
    int x = train[i].from, y = train[i].to;
    while (hull[x].size() > 1 && hull[x][0].value(train[i].p) >= hull[x][1].value(train[i].p))
        hull[x].pop_front();
    dp[i] = hull[x].front().value(train[i].p);
    Line cur = make_line(train[i].q, dp[i]);
    while (hull[y].size() > 1 && bad(hull[y][hull[y].size() - 2], hull[y].back(), cur))
        hull[y].pop_back();
    hull[y].push_back(cur);
}
```

### 复杂度

若每个站点的查询顺序单调，整体可做到 `O(m)` 到 `O(m log m)`，空间复杂度 `O(m)`。

---

# 三、凸包转移的高阶模型

这一章开始把斜率优化搬到树、分治、在线结构等更复杂的状态空间里。

## 11. [P1721 [NOI2016] 国王饮水记](https://www.luogu.com.cn/problem/P1721)

`斜率优化` `平均值模型` `前缀和`

### 题意

最多使用 `k` 次联通操作，希望把首都水位尽量抬高。

### 分析

把所有水位按高低排序后，问题会转成若干前缀做平均的最优合并。设 `dp[t][i]` 表示用 `t` 次操作处理到第 `i` 个高度层时首都能达到的最优值，平均值公式展开后依旧是前缀和上的线性决策比较，因此可以用凸包维护候选断点。

### 核心代码

```cpp
for (int t = 1; t <= k; t++) {
    int hh = 1, tt = 0;
    q[++tt] = 0;
    for (int i = 1; i <= n; i++) {
        while (hh < tt && slope(q[hh], q[hh + 1]) <= h[i]) hh++;
        int j = q[hh];
        dp[t][i] = trans(dp[t - 1][j], j, i);
        while (hh < tt && bad(q[tt - 1], q[tt], i)) tt--;
        q[++tt] = i;
    }
}
```

### 复杂度

按高度顺序转移时，每层都是单调凸包，常见复杂度为 `O(kn)`，空间复杂度 `O(n)`。

---

## 12. [P2305 [NOI2014] 购票](https://www.luogu.com.cn/problem/P2305)

`树形 DP` `李超线段树` `斜率优化`

### 题意

每个城市可以买一张票跳到某个满足距离限制的祖先，要求各城市到根的最小总票价。

### 分析

对城市 `u` 而言，合法前驱只可能是距离差不超过 `l[u]` 的祖先，费用可写成 `dp[v]-p[u]*dist[v] + p[u]*dist[u] + q[u]`。在 DFS 过程中，把祖先状态视作直线插入一棵可回滚的李超线段树，查询当前 `dist[u]` 即可。

### 核心代码

```cpp
void dfs(int u) {
    long long best = query(1, 0, maxd, dist[u]);
    dp[u] = best + 1LL * p[u] * dist[u] + q[u];
    auto bak = snapshot();
    insert(1, 0, maxd, Line(-p[u], dp[u]));
    for (auto [v, w] : g[u]) {
        dist[v] = dist[u] + w;
        dfs(v);
    }
    rollback(bak);
}
```

### 复杂度

每个节点做一次插入和查询，复杂度通常为 `O(n log D)`，空间复杂度 `O(n log D)`。

---

## 13. [P2497 [SDOI2012] 基站建设](https://www.luogu.com.cn/problem/P2497)

`CDQ 分治` `斜率优化` `区间限制`

### 题意

在线上启用若干基站并支付接收半径代价，使信号最终传到终点且总费用最小。

### 分析

按坐标排序后，每个基站能接收哪些前驱会形成一个合法区间，转移本质上是“区间内取一条线的最小值再加常数”。先把无效状态剪掉，再用 CDQ 或分治套凸包批量处理这些受区间约束的线性查询。

### 核心代码

```cpp
void cdq(int l, int r) {
    if (l == r) return;
    int mid = (l + r) >> 1;
    cdq(l, mid);
    build_hull(l, mid);
    for (int i = mid + 1; i <= r; i++)
        if (L[i] <= mid)
            dp[i] = min(dp[i], query(x[i], max(L[i], l), min(R[i], mid)) + add[i]);
    cdq(mid + 1, r);
}
```

### 复杂度

分治每层处理一次候选直线，时间复杂度约为 `O(n log n)`，空间复杂度 `O(n)`。

---

## 14. [P2900 [USACO08MAR] Land Acquisition G](https://www.luogu.com.cn/problem/P2900)

`斜率优化` `去劣矩形` `凸包`

### 题意

把矩形分组购买，组费用是组内最大长乘最大宽，要求总费用最小。

### 分析

先按长排序、宽逆序并删除被完全支配的矩形，这样剩下的宽度单调下降。令 `dp[i]` 表示前 `i` 个矩形的最小代价，就有 `dp[i]=min(dp[j]+w[i]*h[j+1])`，这恰好是斜率单调、查询点单调的凸包模板。

### 核心代码

```cpp
int hh = 1, tt = 0;
q[++tt] = 0;
for (int i = 1; i <= m; i++) {
    while (hh < tt && slope(q[hh], q[hh + 1]) <= w[i]) hh++;
    int j = q[hh];
    dp[i] = dp[j] + 1LL * w[i] * h[j + 1];
    while (hh < tt && bad(q[tt - 1], q[tt], i)) tt--;
    q[++tt] = i;
}
```

### 复杂度

去劣后线性扫一遍即可，时间复杂度 `O(n log n)`（排序）加 `O(n)`（DP），空间复杂度 `O(n)`。

---

## 15. [P5017 [NOIP 2018 普及组] 摆渡车](https://www.luogu.com.cn/problem/P5017)

`斜率优化` `前缀和` `分批调度`

### 题意

一辆摆渡车往返运送所有同学，要求最小化所有人的等待时间总和。

### 分析

把到达时刻排序后，枚举最后一趟车带走的是哪一段学生。前缀和可以把一段人的等待总和展开成 `dp[j] + k * t[i] + b(j)` 这种线性形式，于是断点 `j` 能用下凸包维护，整题就从二重枚举降成单调扫描。

### 核心代码

```cpp
int hh = 1, tt = 0;
q[++tt] = 0;
for (int i = 1; i <= n; i++) {
    while (hh < tt && slope(q[hh], q[hh + 1]) <= t[i] + m) hh++;
    int j = q[hh];
    dp[i] = dp[j] + 1LL * (i - j) * (t[i] + m) - (pre[i] - pre[j]);
    while (hh < tt && bad(q[tt - 1], q[tt], i)) tt--;
    q[++tt] = i;
}
```

### 复杂度

排序后做一次凸包 DP，时间复杂度 `O(n log n)`，空间复杂度 `O(n)`。

---

## 16. [P3195 [HNOI2008] 玩具装箱](https://www.luogu.com.cn/problem/P3195)

`斜率优化` `二次 DP` `前缀和`

### 题意

把玩具顺序装进若干容器，每个容器长度偏离 `L` 的平方会产生代价，求最小总代价。

### 分析

记 `s[i]` 为玩具长度前缀和，并把间隔的 `1` 也并入前缀中，则一段 `j+1..i` 的代价是 `(s[i]-s[j]-L)^2`。展开后得到标准的二次函数 DP，查询点和候选斜率都单调，因此可直接用单调队列维护下凸包。

### 核心代码

```cpp
int hh = 1, tt = 0;
q[++tt] = 0;
for (int i = 1; i <= n; i++) {
    while (hh < tt && slope(q[hh], q[hh + 1]) <= 2.0 * x[i]) hh++;
    int j = q[hh];
    dp[i] = dp[j] + sqr(x[i] - x[j] - L);
    while (hh < tt && bad(q[tt - 1], q[tt], i)) tt--;
    q[++tt] = i;
}
```

### 复杂度

单调凸包优化后是 `O(n)`，空间复杂度 `O(n)`。

---

## 17. [P2365 [IOI 2002] 任务安排](https://www.luogu.com.cn/problem/P2365)

`斜率优化` `任务分批` `前缀和`

### 题意

顺序任务要切成若干批处理，每批有固定启动时间，要求总费用最小。

### 分析

设 `T[i]` 和 `F[i]` 分别是时间与费用系数前缀和，则把 `j+1..i` 放成一批的转移能整理为 `dp[j] + (T[i]-T[j]+s) * (F[n]-F[j])`。候选状态对 `T[i]` 的贡献是直线，且查询顺序单调，所以这一版可以用普通单调凸包。

### 核心代码

```cpp
int hh = 1, tt = 0;
q[++tt] = 0;
for (int i = 1; i <= n; i++) {
    while (hh < tt && slope(q[hh], q[hh + 1]) <= T[i]) hh++;
    int j = q[hh];
    dp[i] = dp[j] + (T[i] - T[j] + s) * (F[n] - F[j]);
    while (hh < tt && bad(q[tt - 1], q[tt], i)) tt--;
    q[++tt] = i;
}
```

### 复杂度

利用单调性后时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 18. [P5785 [SDOI2012] 任务安排](https://www.luogu.com.cn/problem/P5785)

`李超线段树` `斜率优化` `在线查询`

### 题意

仍是任务分批模型，但数据范围更强，不能再依赖完全单调的凸包顺序。

### 分析

转移式与上一题同源，核心仍是“在若干条直线里查询一点的最小值”。区别在于候选线和查询点不再同时单调，所以要把凸包换成李超线段树或平衡树维护，才能支持任意次序的插入与查询。

### 核心代码

```cpp
insert(1, xmin, xmax, Line(0, 0));
for (int i = 1; i <= n; i++) {
    long long best = query(1, xmin, xmax, T[i]);
    dp[i] = best + T[i] * F[i] + s * (F[n] - F[i]);
    Line cur(-F[i], dp[i] + T[i] * F[i] - s * F[i]);
    insert(1, xmin, xmax, cur);
}
```

### 复杂度

每次操作 `O(log X)`，总复杂度 `O(n log X)`，空间复杂度 `O(n log X)`。

---

# 四、单调队列优化状态转移

如果合法决策只会落在一个滑动窗口里，单调队列往往就是把枚举压到线性的关键。

## 19. [P2569 [SCOI2010] 股票交易](https://www.luogu.com.cn/problem/P2569)

`单调队列` `状态压缩` `多阶段转移`

### 题意

已知未来 `T` 天的买卖价格、单日上限和冷却期，求最大利润。

### 分析

设 `dp[i][j]` 表示第 `i` 天结束时手里持有 `j` 股的最大收益。买入和卖出都只会从第 `i-W-1` 天的一段连续股数转移而来，把式子整理成“当前股数加一个窗口最值”后，就能在每一天用两次单调队列完成所有状态更新。

### 核心代码

```cpp
for (int i = 1; i <= T; i++) {
    copy(dp[i - 1], dp[i - 1] + MaxP + 1, dp[i]);
    deque<int> q;
    for (int j = 0; j <= MaxP; j++) {
        while (!q.empty() && q.front() < j - AS[i]) q.pop_front();
        while (!q.empty() && base_buy(i, q.back()) <= base_buy(i, j)) q.pop_back();
        q.push_back(j);
        dp[i][j] = max(dp[i][j], base_buy(i, q.front()) - 1LL * j * AP[i]);
    }
}
```

### 复杂度

每一天对股数做常数次线性扫描，总复杂度 `O(T * MaxP)`，空间复杂度 `O(T * MaxP)` 或滚动到 `O(MaxP)`。

---

## 20. [P2564 [SCOI2009] 生日礼物](https://www.luogu.com.cn/problem/P2564)

`双指针` `覆盖计数` `最短区间`

### 题意

彩带上有 `K` 种彩珠，要求截出一段最短区间，使它覆盖全部种类。

### 分析

把彩珠按坐标排序后，本质就是经典的最短覆盖子段。右端点不断右移补齐种类，左端点在仍然覆盖所有颜色时尽量右缩，整个过程每个位置只进出窗口一次。

### 核心代码

```cpp
int kind = 0, ans = INF;
for (int l = 1, r = 0; l <= n; l++) {
    while (r < n && kind < K) {
        ++r;
        if (++cnt[col[r]] == 1) kind++;
    }
    if (kind == K) ans = min(ans, x[r] - x[l]);
    if (--cnt[col[l]] == 0) kind--;
}
```

### 复杂度

双指针线性推进，时间复杂度 `O(n)`，空间复杂度 `O(K)`。

---

## 21. [P2219 [HAOI2007] 修筑绿化带](https://www.luogu.com.cn/problem/P2219)

`二维单调队列` `子矩形最值` `前缀和`

### 题意

在大矩形中套一个固定大小的小矩形，要求绿化带肥沃度最大。

### 分析

外层矩形和内层花坛都能用二维前缀和快速求和，问题转成：对每个 `A×B` 外框，找一个合法 `C×D` 内框使内框和最小。先按行、再按列做二维单调队列，就能在线维护每个外框可选内框中的最小和。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) {
    deque<int> q;
    for (int j = 1; j <= m; j++) {
        while (!q.empty() && q.front() < j - (B - D)) q.pop_front();
        while (!q.empty() && inner[i][q.back()] >= inner[i][j]) q.pop_back();
        q.push_back(j);
        rowMin[i][j] = inner[i][q.front()];
    }
}
for (int j = 1; j <= m; j++)
    solve_col(j);
```

### 复杂度

两次二维滑窗后总复杂度 `O(nm)`，空间复杂度 `O(nm)`。

---

## 22. [P3957 [NOIP 2017 普及组] 跳房子](https://www.luogu.com.cn/problem/P3957)

`二分答案` `单调队列` `可行性检查`

### 题意

机器人每次跳跃距离允许在 `[d-g,d+g]` 内变化，问最少花多少金币才能拿到至少 `k` 分。

### 分析

答案对金币数 `g` 具有单调性，可以二分。固定 `g` 后，设 `dp[i]` 为跳到第 `i` 个格子的最大得分，则前驱必须落在距离窗口 `[d-g,d+g]` 内，用单调队列维护这个窗口内 `dp` 最大值即可完成 `check`。

### 核心代码

```cpp
bool check(int g) {
    int L = max(1, d - g), R = d + g, p = 1;
    deque<int> q;
    fill(dp, dp + n + 1, -INF);
    for (int i = 1; i <= n; i++) {
        while (p < i && x[p] <= x[i] - L) {
            while (!q.empty() && dp[q.back()] <= dp[p]) q.pop_back();
            q.push_back(p++);
        }
        while (!q.empty() && x[q.front()] < x[i] - R) q.pop_front();
        if (!q.empty()) dp[i] = dp[q.front()] + score[i];
        if (dp[i] >= k) return true;
    }
    return false;
}
```

### 复杂度

二分外层是 `O(log V)`，每次检查线性，整体复杂度 `O(n log V)`，空间复杂度 `O(n)`。

---

## 23. [P3229 [HNOI2013] 旅行](https://www.luogu.com.cn/problem/P3229)

`单调队列` `分段 DP` `前缀和`

### 题意

旅行路线固定，要在恰好 `m` 个月内完成，并使总快乐值尽可能大。

### 分析

把“有景点/无景点”的收益先写成前缀和，再枚举每个月的结束位置。月末转移只会从一段连续的起点中选最优，而评价函数可以拆成“与当前终点无关的断点值 + 当前前缀收益”，因此可用队列维护候选起点的最优顺序。

### 核心代码

```cpp
for (int t = 1; t <= m; t++) {
    deque<int> q;
    for (int i = t; i <= n; i++) {
        int j = i - 1;
        while (!q.empty() && key(t - 1, q.back()) <= key(t - 1, j)) q.pop_back();
        q.push_back(j);
        while (!q.empty() && q.front() < t - 1) q.pop_front();
        dp[t][i] = val(i) + key(t - 1, q.front());
    }
}
```

### 复杂度

每层状态都只做一次入队和出队，时间复杂度 `O(mn)`，空间复杂度 `O(n)`。

---

## 24. [P2254 [NOI2005] 瑰丽华尔兹](https://www.luogu.com.cn/problem/P2254)

`单调队列` `网格 DP` `分方向处理`

### 题意

钢琴会按给定方向序列在网格中滑动，施法可以让它原地停留，要求总滑行距离最大。

### 分析

按时间段分块处理，每一段方向固定，于是每行或每列都能独立做一次“限定步数的最远可达”转移。把 `dp[pos]-offset` 放进单调队列，就能在扫描一条直线时同时完成障碍判定与最优值更新。

### 核心代码

```cpp
void work_line(vector<int> cells) {
    deque<int> q;
    for (int i = 0; i < (int)cells.size(); i++) {
        if (block[cells[i]]) { q.clear(); continue; }
        while (!q.empty() && q.front() < i - len) q.pop_front();
        while (!q.empty() && f[cells[q.back()]] - q.back() <= g[cells[i]] - i) q.pop_back();
        q.push_back(i);
        f[cells[i]] = max(f[cells[i]], g[cells[q.front()]] + i - q.front());
    }
}
```

### 复杂度

每个时间段只会遍历全部格子一次，整体复杂度 `O(KNM)` 中的常数被队列优化压到线性，空间复杂度 `O(NM)`。

---

## 25. [CF372C Watching Fireworks is Fun](https://www.luogu.com.cn/problem/CF372C)

`单调队列` `分层 DP` `滑动窗口最大值`

### 题意

按时间顺序观看烟花，相邻两次之间移动距离受限，求最大幸福值。

### 分析

设 `dp[i][x]` 表示处理到第 `i` 场烟花时站在位置 `x` 的最大幸福值。相邻两场之间最多移动 `d * Δt`，因此新状态只需在旧数组的一个滑动窗口里取最大值，再加上本场的 `b_i-|a_i-x|`。

### 核心代码

```cpp
for (int i = 1; i <= m; i++) {
    int lim = d * (t[i] - t[i - 1]);
    deque<int> q;
    for (int x = 1; x <= n; x++) {
        while (!q.empty() && q.front() < x - lim) q.pop_front();
        while (!q.empty() && pre[q.back()] <= pre[x]) q.pop_back();
        q.push_back(x);
        cur[x] = pre[q.front()] + b[i] - abs(a[i] - x);
    }
    swap(pre, cur);
}
```

### 复杂度

每场烟花做一次线性滑窗，时间复杂度 `O(mn)`，空间复杂度 `O(n)`。

---

# 五、环形前缀与判定型队列

当题目转成前缀和、环形展开或二分判定时，队列维护的通常是窗口内的最值或可行性边界。

## 26. [U230380 [POI2004] 旅行问题](https://www.luogu.com.cn/problem/U230380)

`环形前缀和` `单调队列` `最小前缀`

### 题意

环形公路上每站都有油，要求判断哪些起点能顺时针或逆时针完整绕行一圈。

### 分析

把环复制成链后，顺时针可行当且仅当从起点开始的长度 `n` 区间内，前缀和始终不低于起点前一个位置的前缀和。于是只要在长度为 `n` 的窗口里维护前缀和最小值即可，逆时针同理反向再做一遍。

### 核心代码

```cpp
for (int i = 1; i <= 2 * n; i++) pre[i] = pre[i - 1] + gas[i] - dist[i];
deque<int> q;
for (int i = 1; i <= 2 * n; i++) {
    while (!q.empty() && q.front() < i - n) q.pop_front();
    while (!q.empty() && pre[q.back()] >= pre[i]) q.pop_back();
    q.push_back(i);
    if (i >= n) ok[i - n + 1] |= pre[q.front()] - pre[i - n] >= 0;
}
```

### 复杂度

顺逆两个方向各一次线性扫描，总复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 27. [U126668 【一本通 5.5 例 4】 旅行问题](https://www.luogu.com.cn/problem/U126668)

`环形展开` `单调队列` `可行起点`

### 题意

同样是旅行问题，但题面更直接，仍然要求找出所有能完整跑一圈的起点。

### 分析

做法与上一题完全一致：先把油量减去路程得到净增量，再对复制后的前缀和做区间最小值判断。由于每个起点只关心后面恰好 `n` 个位置，所以一个单调递增队列就足够完成整圈判定。

### 核心代码

```cpp
for (int i = 1; i <= 2 * n; i++) sum[i] = sum[i - 1] + a[i] - b[i];
deque<int> q;
for (int i = 1; i <= 2 * n; i++) {
    while (!q.empty() && q.front() < i - n) q.pop_front();
    while (!q.empty() && sum[q.back()] >= sum[i]) q.pop_back();
    q.push_back(i);
    if (i >= n) ans[i - n + 1] = (sum[q.front()] >= sum[i - n]);
}
```

### 复杂度

时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 28. [P1725 琪露诺](https://www.luogu.com.cn/problem/P1725)

`单调队列` `线性 DP` `窗口最大值`

### 题意

从格子 `0` 出发，每次可跳到 `[i+L,i+R]`，求过河前能拿到的最大冰冻指数。

### 分析

令 `dp[i]` 表示落到格子 `i` 的最大收益，那么它只会从区间 `[i-R,i-L]` 里的最优状态转移而来。随着 `i` 增大，合法前驱窗口整体右移，因此直接用单调队列维护该窗口内 `dp` 最大值即可。

### 核心代码

```cpp
deque<int> q;
dp[0] = 0;
for (int i = 1; i <= n; i++) {
    int p = i - L;
    if (p >= 0) {
        while (!q.empty() && dp[q.back()] <= dp[p]) q.pop_back();
        q.push_back(p);
    }
    while (!q.empty() && q.front() < i - R) q.pop_front();
    if (!q.empty()) dp[i] = dp[q.front()] + a[i];
}
```

### 复杂度

每个位置只进出队一次，时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 29. [U301134 绿色通道](https://www.luogu.com.cn/problem/U301134)

`二分答案` `单调队列` `最小代价 DP`

### 题意

在总耗时不超过 `t` 的前提下，最小化最长连续空题段的长度。

### 分析

设答案为允许的最长空段长度 `x`，则任意两个被抄写的题号之间最多隔 `x+1`。固定 `x` 后，令 `dp[i]` 为抄到第 `i` 题且第 `i` 题必须写时的最小耗时，转移只会从最近 `x+1` 个位置取最小值，用递增队列即可完成可行性判断。

### 核心代码

```cpp
bool check(int x) {
    deque<int> q;
    dp[0] = 0; q.push_back(0);
    for (int i = 1; i <= n; i++) {
        while (!q.empty() && q.front() < i - x - 1) q.pop_front();
        dp[i] = dp[q.front()] + a[i];
        while (!q.empty() && dp[q.back()] >= dp[i]) q.pop_back();
        q.push_back(i);
    }
    return *min_element(dp + max(1, n - x), dp + n + 1) <= T;
}
```

### 复杂度

外层二分 `O(log n)`，每次检查线性，整体复杂度 `O(n log n)`，空间复杂度 `O(n)`。

---

## 30. [P2627 [USACO11OPEN] Mowing the Lawn G](https://www.luogu.com.cn/problem/P2627)

`单调队列` `线性 DP` `前缀和`

### 题意

选择若干奶牛使得连续被选中的奶牛不超过 `K` 只，最大化总效率。

### 分析

把 `f[i]` 设为前 `i` 头奶牛里、并且第 `i` 头不选时的最优值，那么若最后一段连续被选长度为 `len`，转移只会从 `i-len-1` 这一批前驱而来。整理后可写成 `f[i]=pre[i]+max(f[j-1]-pre[j])` 的窗口最值形式，用队列维护即可。

### 核心代码

```cpp
deque<int> q;
q.push_back(0);
for (int i = 1; i <= n; i++) {
    while (!q.empty() && q.front() < i - K) q.pop_front();
    f[i] = pre[i] + g[q.front()];
    g[i] = f[i - 1] - pre[i];
    while (!q.empty() && g[q.back()] <= g[i]) q.pop_back();
    q.push_back(i);
}
```

### 复杂度

时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 31. [T557186 烽火传递](https://www.luogu.com.cn/problem/T557186)

`单调队列` `线性 DP` `滑动窗口最小值`

### 题意

一排共有 `n` 座烽火台，第 `i` 座被点亮的代价是 `a[i]`。要求任意连续 `m` 座烽火台里都至少有一座被点亮，求满足条件时的最小总代价。

### 分析

这题最关键的是把“连续 `m` 个里至少选一个”改写成“相邻两座被点亮的烽火台之间，空着的位置不能超过 `m-1` 个”。于是如果最后一个点亮的位置是 `i`，那么上一个点亮的位置 `j` 只能落在区间 `[i-m, i-1]`。

设 `f[i]` 表示“点亮第 `i` 座烽火台，且前 `i` 个位置已经全部合法”时的最小代价，就有

`f[i] = a[i] + min(f[j]) (i-m <= j < i)`。

这已经是标准的滑动窗口最小值模型：随着 `i` 从左往右扫描，候选决策区间始终是一个长度为 `m` 的窗口。用单调递增队列维护窗口内 `f[j]` 最小的位置，就能把每次转移从 `O(m)` 降到均摊 `O(1)`。最后答案不是 `f[n]`，而是最后一段长度不足 `m` 的后缀里任选一个点亮位置，因此取 `i in [n-m+1, n]` 的最小 `f[i]`。

### 核心代码

```cpp
deque<int> q;
q.push_back(0);
for (int i = 1; i <= n; i++) {
    while (!q.empty() && q.front() < i - m) q.pop_front();
    f[i] = f[q.front()] + a[i];
    while (!q.empty() && f[q.back()] >= f[i]) q.pop_back();
    q.push_back(i);
}
int ans = INF;
for (int i = max(1, n - m + 1); i <= n; i++)
    ans = min(ans, f[i]);
```

### 复杂度

每个下标至多进出队一次，时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 32. [U162981 最大连续和](https://www.luogu.com.cn/problem/U162981)

`前缀和` `单调队列` `最长度限制`

### 题意

求长度不超过 `m` 的连续子段最大和。

### 分析

前缀和记为 `pre[i]` 后，答案就是最大化 `pre[i]-pre[j]`，其中 `i-j<=m` 且 `j<i`。因此对每个右端点 `i`，只要知道最近 `m` 个前缀和中的最小值，直接用递增队列维护即可。

### 核心代码

```cpp
deque<int> q;
q.push_back(0);
for (int i = 1; i <= n; i++) {
    while (!q.empty() && q.front() < i - m) q.pop_front();
    ans = max(ans, pre[i] - pre[q.front()]);
    while (!q.empty() && pre[q.back()] >= pre[i]) q.pop_back();
    q.push_back(i);
}
```

### 复杂度

时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

# 六、滑动窗口模板与二维扩展

最后一章把一维窗口最值模板收束到二维矩阵，形成最常见也最通用的单调队列套路。

## 33. [P1714 切蛋糕](https://www.luogu.com.cn/problem/P1714)

`前缀和` `单调队列` `最大子段和`

### 题意

从连续蛋糕块里选一段长度不超过 `m` 的区间，使幸运值和最大。

### 分析

把蛋糕幸运值做成前缀和后，模型与“长度限制的最大子段和”完全一致。右端点固定时，只需知道左侧最近 `m` 个位置中最小的前缀和，因此维护一个递增队列即可一遍完成。

### 核心代码

```cpp
deque<int> q;
q.push_back(0);
for (int i = 1; i <= n; i++) {
    while (!q.empty() && q.front() < i - m) q.pop_front();
    ans = max(ans, pre[i] - pre[q.front()]);
    while (!q.empty() && pre[q.back()] >= pre[i]) q.pop_back();
    q.push_back(i);
}
```

### 复杂度

时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 34. [P2629 好消息，坏消息](https://www.luogu.com.cn/problem/P2629)

`环形前缀和` `单调队列` `区间最小值`

### 题意

把消息序列做一次循环移位，要求整个通报过程中老板心情始终不为负。

### 分析

复制数组后做前缀和，若以 `k` 为起点，则必须保证区间 `[k,k+n-1]` 内的最小前缀和不小于 `pre[k-1]`。于是枚举右端点时，用一个递增队列维护长度为 `n` 的窗口最小值，就能判断每个起点是否合法。

### 核心代码

```cpp
deque<int> q;
for (int i = 1; i <= 2 * n; i++) {
    while (!q.empty() && q.front() < i - n + 1) q.pop_front();
    while (!q.empty() && pre[q.back()] >= pre[i]) q.pop_back();
    q.push_back(i);
    if (i >= n) ok[i - n + 1] = pre[q.front()] >= pre[i - n];
}
```

### 复杂度

时间复杂度 `O(n)`，空间复杂度 `O(n)`。

---

## 35. [P1886 【模板】单调队列 / 滑动窗口](https://www.luogu.com.cn/problem/P1886)

`单调队列` `滑动窗口` `模板`

### 题意

给定窗口大小 `k`，要求输出每个窗口中的最小值和最大值。

### 分析

最标准的单调队列模板：最小值队列保持下标对应数值递增，最大值队列保持递减。窗口右移时先弹出过期下标，再把新位置按单调性插入，队头就是当前答案。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) {
    while (!qmin.empty() && qmin.front() <= i - k) qmin.pop_front();
    while (!qmax.empty() && qmax.front() <= i - k) qmax.pop_front();
    while (!qmin.empty() && a[qmin.back()] >= a[i]) qmin.pop_back();
    while (!qmax.empty() && a[qmax.back()] <= a[i]) qmax.pop_back();
    qmin.push_back(i), qmax.push_back(i);
    if (i >= k) mn.push_back(a[qmin.front()]), mx.push_back(a[qmax.front()]);
}
```

### 复杂度

每个下标只会进出队一次，时间复杂度 `O(n)`，空间复杂度 `O(k)`。

---

## 36. [P2698 [USACO12MAR] Flowerpot S](https://www.luogu.com.cn/problem/P2698)

`单调队列` `双指针` `窗口极差`

### 题意

把花盆放在 `x` 轴上，要求窗口内接到的最早和最晚水滴时间差至少为 `D`，并使花盆宽度最小。

### 分析

按 `x` 排序后，用双指针维护当前横坐标窗口；窗口内只需要知道 `y` 的最大值和最小值，就能判断时间差是否达到 `D`。因此同时维护一个递减队列和一个递增队列，边扩右端点边尽量缩左端点即可。

### 核心代码

```cpp
for (int l = 1, r = 0; l <= n; l++) {
    while (r < n && maxY - minY < D) {
        ++r;
        push_max(r); push_min(r);
    }
    if (maxY - minY >= D) ans = min(ans, x[r] - x[l]);
    if (qmax.front() == l) qmax.pop_front();
    if (qmin.front() == l) qmin.pop_front();
    maxY = qmax.empty() ? -INF : y[qmax.front()];
    minY = qmin.empty() ? INF : y[qmin.front()];
}
```

### 复杂度

排序后双指针线性推进，时间复杂度 `O(n log n)`，空间复杂度 `O(n)`。

---

## 37. [P1440 求m区间内的最小值](https://www.luogu.com.cn/problem/P1440)

`单调队列` `滑动窗口最小值` `在线输出`

### 题意

对每个位置输出它前面最近 `m` 个数中的最小值，不足 `m` 个就全取。

### 分析

这是滑动窗口最小值的在线版，只不过查询发生在把当前元素放入窗口之前。维护一个按数值递增的下标队列，先删过期元素、输出队头，再插入当前位置即可。

### 核心代码

```cpp
deque<int> q;
for (int i = 1; i <= n; i++) {
    while (!q.empty() && q.front() < i - m) q.pop_front();
    cout << (q.empty() ? 0 : a[q.front()]) << '\n';
    while (!q.empty() && a[q.back()] >= a[i]) q.pop_back();
    q.push_back(i);
}
```

### 复杂度

时间复杂度 `O(n)`，空间复杂度 `O(m)`。

---

## 38. [P2032 扫描](https://www.luogu.com.cn/problem/P2032)

`单调队列` `滑动窗口最大值` `模板应用`

### 题意

木板覆盖长度为 `k` 的连续区间，要求输出每次覆盖到的最大值。

### 分析

直接套滑动窗口最大值模板即可：队列里存下标，保证对应数值严格递减。每向右移动一步，队头就是当前木板覆盖区间的最大元素位置。

### 核心代码

```cpp
deque<int> q;
for (int i = 1; i <= n; i++) {
    while (!q.empty() && q.front() <= i - k) q.pop_front();
    while (!q.empty() && a[q.back()] <= a[i]) q.pop_back();
    q.push_back(i);
    if (i >= k) cout << a[q.front()] << '\n';
}
```

### 复杂度

时间复杂度 `O(n)`，空间复杂度 `O(k)`。

---

## 39. [P2216 [HAOI2007] 理想的正方形](https://www.luogu.com.cn/problem/P2216)

`二维单调队列` `窗口最值` `矩阵处理`

### 题意

在矩阵中找一个 `n×n` 子矩阵，使其中最大值与最小值的差最小。

### 分析

先对每一行做长度为 `n` 的滑窗，得到所有横向窗口的最小值和最大值；再对这两张中间表按列做一次同样的滑窗。这样每个 `n×n` 正方形的最值都能在 `O(1)` 时间取到，最终枚举答案即可。

### 核心代码

```cpp
for (int i = 1; i <= a; i++) {
    solve_row_min(i, rowMin[i]);
    solve_row_max(i, rowMax[i]);
}
for (int j = 1; j + n - 1 <= b; j++) {
    solve_col_min(j, rowMin, mn);
    solve_col_max(j, rowMax, mx);
}
for (int i = n; i <= a; i++)
    for (int j = n; j <= b; j++)
        ans = min(ans, mx[i][j] - mn[i][j]);
```

### 复杂度

两次二维滑窗后总体复杂度 `O(ab)`，空间复杂度 `O(ab)`。