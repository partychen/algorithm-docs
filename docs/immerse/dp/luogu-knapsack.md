---
title: "洛谷 背包DP专题精选解题报告"
subtitle: "🎒 从选或不选到树上分配的背包 DP 主线"
order: 11
icon: "🎒"
---

# 洛谷 背包DP专题精选解题报告

这一组题从最基本的选或不选一路走到分组、依赖、方案数和树上背包，几乎把“容量分配”这件事能长出的变体都走了一遍。表面上每题的约束不同，但本质都在问：有限资源该如何在若干互斥、可重复或带依赖的决策之间分配。

# 一、01 背包基础

01 背包是所有背包问题的根基：每件物品只能选一次，内层循环逆序枚举容量。本章通过六道题巩固 01 背包的模板和常见变体。

## 1. [P1048 [NOIP 2005 普及组] 采药](https://www.luogu.com.cn/problem/P1048)

`01背包` `动态规划 DP` `NOIP 普及组` `2005`

### 题意

有 $n$ 株草药和总时间 $T$，采每株草药需要一定时间并有一定价值，每株最多采一次。求在时间限制内能获得的最大总价值。

### 分析

最经典的 01 背包模板题。定义 $f[j]$ 为时间为 $j$ 时的最大总价值。对每株草药，逆序枚举时间 $j$ 从 $T$ 到 $t_i$，转移 $f[j] = \max(f[j],\; f[j - t_i] + v_i)$。逆序保证每株草药只被选一次。

### 核心代码

```cpp
int n, T;
int f[1005];
scanf("%d%d", &T, &n);
for (int i = 1; i <= n; i++) {
    int t, v;
    scanf("%d%d", &t, &v);
    for (int j = T; j >= t; j--)
        f[j] = max(f[j], f[j - t] + v);
}
printf("%d\n", f[T]);
```

### 复杂度

时间 $O(nT)$，空间 $O(T)$。

---

## 2. [P1049 [NOIP 2001 普及组] 装箱问题](https://www.luogu.com.cn/problem/P1049)

`01背包` `动态规划 DP` `NOIP 普及组` `2001`

### 题意

箱子容量为 $V$，有 $n$ 个物品各有体积，任取若干个装入箱内使剩余空间最小。

### 分析

等价于求能装下的最大总体积。把每个物品的"价值"设为它的体积，做标准 01 背包，$f[j]$ 表示容量 $j$ 下能装的最大体积，最终答案为 $V - f[V]$。

### 核心代码

```cpp
int n, V;
int f[20005];
scanf("%d%d", &V, &n);
for (int i = 1; i <= n; i++) {
    int v;
    scanf("%d", &v);
    for (int j = V; j >= v; j--)
        f[j] = max(f[j], f[j - v] + v);
}
printf("%d\n", V - f[V]);
```

### 复杂度

时间 $O(nV)$，空间 $O(V)$。

---

## 3. [P1060 [NOIP 2006 普及组] 开心的金明](https://www.luogu.com.cn/problem/P1060)

`01背包` `动态规划 DP` `NOIP 普及组` `2006`

### 题意

金明有 $n$ 元预算，想买 $m$ 件物品，每件物品有价格 $v_j$ 和重要度 $w_j$（1~5），求在预算内使 $\sum v_j \times w_j$ 最大。

### 分析

标准的 01 背包，只需将每件物品的"价值"定义为 $v_j \times w_j$ 即可。逆序枚举预算进行转移。

### 核心代码

```cpp
int n, m;
int f[30005];
scanf("%d%d", &n, &m);
for (int i = 1; i <= m; i++) {
    int v, w;
    scanf("%d%d", &v, &w);
    for (int j = n; j >= v; j--)
        f[j] = max(f[j], f[j - v] + v * w);
}
printf("%d\n", f[n]);
```

### 复杂度

时间 $O(mn)$，空间 $O(n)$。

---

## 4. [P2871 [USACO07DEC] Charm Bracelet S](https://www.luogu.com.cn/problem/P2871)

`01背包` `动态规划 DP` `USACO` `2007`

### 题意

有 $N$ 件物品和容量为 $M$ 的背包，第 $i$ 件物品重量 $W_i$、价值 $D_i$，每件最多选一次，求最大价值。

### 分析

纯粹的 01 背包模板。注意数据范围 $N \le 3402,\; M \le 12880$，直接一维数组逆序枚举即可。

### 核心代码

```cpp
int N, M;
int f[12885];
scanf("%d%d", &N, &M);
for (int i = 1; i <= N; i++) {
    int w, d;
    scanf("%d%d", &w, &d);
    for (int j = M; j >= w; j--)
        f[j] = max(f[j], f[j - w] + d);
}
printf("%d\n", f[M]);
```

### 复杂度

时间 $O(NM)$，空间 $O(M)$。

---

## 5. [P2639 [USACO09OCT] Bessie's Weight Problem G](https://www.luogu.com.cn/problem/P2639)

`01背包` `动态规划 DP` `USACO` `2009`

### 题意

Bessie 每天最多吃 $H$ 公斤干草，有 $N$ 捆干草各有重量，每捆最多吃一次，求不超过 $H$ 的前提下最多能吃多少干草。

### 分析

与装箱问题类似，等价于体积即价值的 01 背包。$f[j]$ 表示容量 $j$ 下能吃的最大重量，答案为 $f[H]$。

### 核心代码

```cpp
int N, H;
int f[45005];
scanf("%d%d", &H, &N);
for (int i = 1; i <= N; i++) {
    int s;
    scanf("%d", &s);
    for (int j = H; j >= s; j--)
        f[j] = max(f[j], f[j - s] + s);
}
printf("%d\n", f[H]);
```

### 复杂度

时间 $O(NH)$，空间 $O(H)$。

---

## 6. [P7223 [RC-04] 01 背包](https://www.luogu.com.cn/problem/P7223)

`01背包` `数学` `快速幂`

### 题意

有 $n$ 个物品，第 $i$ 个体积为 $a_i$。背包容积无限。幸运数字为 $p$，若放入物品体积和为 $k$，收益为 $p^k$。求所有 $2^n$ 种方案的收益之和，对 $998244353$ 取模。

### 分析

展开 $2^n$ 种方案的收益和：每个物品要么选要么不选，选了物品 $i$ 就在指数上加 $a_i$。总贡献为 $\prod_{i=1}^{n}(1 + p^{a_i})$。直接逐个乘即可，每次用快速幂算 $p^{a_i}$。注意 $p = 0$ 时特判：只有体积和为 0（即一个都不选）时收益为 $0^0 = 1$，其余方案收益为 0，答案为 1。

### 核心代码

```cpp
long long n, p, ans = 1;
const long long MOD = 998244353;
scanf("%lld%lld", &n, &p);
auto qpow = [&](long long a, long long b) -> long long {
    long long r = 1; a %= MOD;
    for (; b; b >>= 1, a = a * a % MOD)
        if (b & 1) r = r * a % MOD;
    return r;
};
if (p == 0) { printf("1\n"); return 0; }
for (int i = 1; i <= n; i++) {
    long long a;
    scanf("%lld", &a);
    ans = ans % MOD * ((1 + qpow(p, a)) % MOD) % MOD;
}
printf("%lld\n", ans);
```

### 复杂度

时间 $O(n \log a_{\max})$，空间 $O(1)$。

---

# 二、完全背包与多重背包

完全背包允许每种物品选无限次，与 01 背包的唯一区别是内层循环改为正序枚举。多重背包限制每种物品最多选若干次，常用二进制拆分转化为 01 背包处理。本章还包含贪心与二维约束的混合题型。

## 7. [U227266 完全背包问题](https://www.luogu.com.cn/problem/U227266)

`完全背包` `滚动数组`

### 题意

有 $N$ 种物品和容量为 $V$ 的背包，每种物品有体积和价值且可选无限次，求最大总价值。

### 分析

完全背包模板。定义 $f[j]$ 为容量 $j$ 下的最大价值。对每种物品正序枚举 $j$ 从 $v_i$ 到 $V$，此时 $f[j - v_i]$ 可能已经包含当前物品，恰好允许重复选取。

### 核心代码

```cpp
int N, V;
long long f[10000005];
scanf("%d%d", &V, &N);
for (int i = 1; i <= N; i++) {
    int v, w;
    scanf("%d%d", &v, &w);
    for (int j = v; j <= V; j++)
        f[j] = max(f[j], f[j - v] + w);
}
printf("%lld\n", f[V]);
```

### 复杂度

时间 $O(NV)$，空间 $O(V)$。

---

## 8. [P1616 疯狂的采药](https://www.luogu.com.cn/problem/P1616)

`完全背包` `动态规划 DP` `洛谷原创`

### 题意

与采药题类似，但每种草药可以无限制地采摘。给定总时间 $T$ 和 $n$ 种草药的采摘时间与价值，求最大总价值。

### 分析

完全背包模板的直接应用。注意数据范围 $T$ 和 $n$ 都很大（$T \le 10^7$），需要用 `long long` 存储答案。

### 核心代码

```cpp
int T, n;
long long f[10000005];
scanf("%d%d", &T, &n);
for (int i = 1; i <= n; i++) {
    int t, v;
    scanf("%d%d", &t, &v);
    for (int j = t; j <= T; j++)
        f[j] = max(f[j], f[j - t] + v);
}
printf("%lld\n", f[T]);
```

### 复杂度

时间 $O(nT)$，空间 $O(T)$。

---

## 9. [P2722 [USACO3.1] 总分 Score Inflation](https://www.luogu.com.cn/problem/P2722)

`完全背包` `动态规划 DP` `USACO`

### 题意

竞赛有多个种类的题目，每个种类有固定的分数和耗时，每种可选任意多道。给定总时间上限，求最大总分。

### 分析

典型的完全背包。将每种题目的耗时看作体积、分数看作价值，正序枚举即可。

### 核心代码

```cpp
int M, n; // M:总时间, n:种类数
int f[10005];
scanf("%d%d", &M, &n);
for (int i = 1; i <= n; i++) {
    int s, t; // s:分数, t:耗时
    scanf("%d%d", &s, &t);
    for (int j = t; j <= M; j++)
        f[j] = max(f[j], f[j - t] + s);
}
printf("%d\n", f[M]);
```

### 复杂度

时间 $O(nM)$，空间 $O(M)$。

---

## 10. [T343317 多重背包](https://www.luogu.com.cn/problem/T343317)

`多重背包` `二进制拆分`

### 题意

有 $n$ 种物品和容量为 $m$ 的背包，第 $i$ 种体积 $v_i$、价值 $w_i$、数量 $s_i$，求最大总价值。

### 分析

朴素枚举每种物品选 $0 \sim s_i$ 个太慢。二进制优化：将第 $i$ 种物品的 $s_i$ 个拆分成 $1, 2, 4, \ldots, 2^k$ 与剩余若干个"虚拟物品"，每个虚拟物品只选或不选，转化为 01 背包。拆分后物品总数从 $\sum s_i$ 降到 $\sum \log s_i$。

### 核心代码

```cpp
int n, m, num;
int v[100005], w[100005], f[40005];
scanf("%d%d", &n, &m);
for (int i = 1; i <= n; i++) {
    int v1, w1, s;
    scanf("%d%d%d", &v1, &w1, &s);
    for (int j = 1; j <= s; j <<= 1) {
        v[++num] = j * v1; w[num] = j * w1;
        s -= j;
    }
    if (s) { v[++num] = s * v1; w[num] = s * w1; }
}
for (int i = 1; i <= num; i++)
    for (int j = m; j >= v[i]; j--)
        f[j] = max(f[j], f[j - v[i]] + w[i]);
printf("%d\n", f[m]);
```

### 复杂度

时间 $O(m \sum \log s_i)$，空间 $O(m)$。

---

## 11. [P1776 宝物筛选](https://www.luogu.com.cn/problem/P1776)

`多重背包` `二进制拆分` `单调队列`

### 题意

洞穴里有 $n$ 种宝物，每种有价值 $v_i$、重量 $w_i$ 和数量 $m_i$，采集车最大载重 $W$。求在不超载的前提下最大价值和。

### 分析

与上题相同的多重背包，但数据范围更大（$n \le 100,\; W \le 40000,\; m_i \le 10^5$）。二进制拆分后物品总数约为 $100 \times 17 = 1700$，01 背包完全可行。更优的做法是单调队列按余数分组，达到 $O(nW)$，但此题二进制拆分已足够。

### 核心代码

```cpp
int n, W, num;
int v[200005], w[200005], f[40005];
scanf("%d%d", &n, &W);
for (int i = 1; i <= n; i++) {
    int vi, wi, mi;
    scanf("%d%d%d", &vi, &wi, &mi);
    for (int j = 1; j <= mi; j <<= 1) {
        v[++num] = j * vi; w[num] = j * wi;
        mi -= j;
    }
    if (mi) { v[++num] = mi * vi; w[num] = mi * wi; }
}
for (int i = 1; i <= num; i++)
    for (int j = W; j >= w[i]; j--)
        f[j] = max(f[j], f[j - w[i]] + v[i]);
printf("%d\n", f[W]);
```

### 复杂度

时间 $O(W \sum \log m_i)$，空间 $O(W)$。

---

## 12. [P1717 钓鱼](https://www.luogu.com.cn/problem/P1717)

`贪心` `枚举` `背包`

### 题意

有 $n$ 个鱼塘排成一排，从左到右编号 $1 \sim n$。从湖 1 出发向右走，最后在某个湖结束，总共有 $H$ 小时。第 $i$ 个湖第一个 5 分钟能钓 $f_i$ 条鱼，之后每 5 分钟减少 $d_i$ 条。从湖 $i$ 到湖 $i+1$ 需要 $5 \times t_i$ 分钟。求最多能钓多少鱼。

### 分析

枚举最终停在哪个湖 $k$，则路途时间固定为 $\sum_{i=1}^{k-1} t_i \times 5$，剩余时间全部分配给钓鱼。每个湖每次 5 分钟的钓鱼量是确定的（$f_i, f_i - d_i, f_i - 2d_i, \ldots$），取非负部分。贪心地每次选当前收益最大的 5 分钟时间段即可，用优先队列实现。

### 核心代码

```cpp
int n, H, ans = 0;
int f[105], d[105], t[105];
scanf("%d%d", &n, &H);
H *= 12; // 转换为5分钟为单位
for (int i = 1; i <= n; i++) scanf("%d", &f[i]);
for (int i = 1; i <= n; i++) scanf("%d", &d[i]);
for (int i = 1; i < n; i++) scanf("%d", &t[i]);
for (int k = 1; k <= n; k++) {
    int rem = H;
    for (int i = 1; i < k; i++) rem -= t[i];
    if (rem <= 0) break;
    priority_queue<pair<int,int>> pq;
    for (int i = 1; i <= k; i++) pq.push({f[i], i});
    int sum = 0;
    while (rem > 0 && !pq.empty()) {
        auto [val, idx] = pq.top(); pq.pop();
        if (val <= 0) break;
        sum += val; rem--;
        pq.push({val - d[idx], idx});
    }
    ans = max(ans, sum);
}
printf("%d\n", ans);
```

### 复杂度

时间 $O(n \cdot H \log n)$，空间 $O(n)$。

---

## 13. [P2760 科技庄园](https://www.luogu.com.cn/problem/P2760)

`多重背包` `二维费用` `动态规划 DP`

### 题意

在一个网格田地上有若干桃树，PFT 从 $(0,0)$ 出发，每次选一棵树去摘桃后返回原点。每棵树可以摘 $K$ 次，每次摘的桃数相同。移动每格耗 1 秒、1 体力。在时间和体力双重约束下求最大收获。

### 分析

每棵桃树到原点的曼哈顿距离为 $d = x + y$，往返一次需花费 $2d$ 的时间和体力，且每棵树可以被摘 $K$ 次。将每棵树视为一件"多重背包物品"，体积为 $2d$（同时消耗时间和体力），价值为该树的产出，数量为 $K$。由于时间和体力是两个独立约束，本质上是二维费用的多重背包。若 $K$ 较大可以用二进制拆分优化。

### 核心代码

```cpp
int n, m, K, T, HP;
int f[505][505]; // f[t][h]: 用时t、体力h时的最大收获
scanf("%d%d%d%d%d", &n, &m, &K, &T, &HP);
for (int i = 1; i <= n; i++)
    for (int j = 1; j <= m; j++) {
        int val;
        scanf("%d", &val);
        if (!val) continue;
        int cost = 2 * (i + j);
        for (int c = 0; c < K; c++)
            for (int t = T; t >= cost; t--)
                for (int h = HP; h >= cost; h--)
                    f[t][h] = max(f[t][h], f[t - cost][h - cost] + val);
    }
printf("%d\n", f[T][HP]);
```

### 复杂度

时间 $O(nmK \cdot T \cdot HP)$，空间 $O(T \cdot HP)$。

---

# 三、混合背包与分组背包

当 01、完全、多重三类物品混在一起，或者物品分了组每组最多选一个时，需要灵活组合前面的模板。

## 14. [T627139 混合背包](https://www.luogu.com.cn/problem/T627139)

`混合背包` `二进制优化`

### 题意

有 $N$ 种物品和容量为 $V$ 的背包。物品分三类：只能用 1 次（01 背包）、可以用无限次（完全背包）、最多用 $s_i$ 次（多重背包）。求最大总价值。

### 分析

统一处理：完全背包物品视为数量很大（$\lfloor V / v_i \rfloor$ 次），多重背包物品做二进制拆分，最终所有物品都转化为 01 背包的虚拟物品，逆序枚举一遍即可。注意完全背包物品也可以单独用正序枚举处理，不做拆分以节省时间。

### 核心代码

```cpp
int N, V, num;
int vol[100005], val[100005], f[1005];
scanf("%d%d", &N, &V);
for (int i = 1; i <= N; i++) {
    int v, w, s;
    scanf("%d%d%d", &v, &w, &s);
    if (s == -1) s = 1;        // 01背包
    else if (s == 0) s = V / v; // 完全背包
    for (int j = 1; j <= s; j <<= 1) {
        vol[++num] = j * v; val[num] = j * w;
        s -= j;
    }
    if (s) { vol[++num] = s * v; val[num] = s * w; }
}
for (int i = 1; i <= num; i++)
    for (int j = V; j >= vol[i]; j--)
        f[j] = max(f[j], f[j - vol[i]] + val[i]);
printf("%d\n", f[V]);
```

### 复杂度

时间 $O(V \sum \log s_i)$，空间 $O(V)$。

---

## 15. [P1833 樱花](https://www.luogu.com.cn/problem/P1833)

`混合背包` `二进制优化` `洛谷原创`

### 题意

赏花时间从 $T_s$ 到 $T_e$，有 $n$ 棵樱花树，看第 $i$ 棵耗时 $T_i$、美学值 $C_i$、最多看 $P_i$ 遍（$P_i = 0$ 表示无限次）。求最大美学值。

### 分析

先算出总时间 $M = T_e - T_s$（注意时间格式转换），然后对每棵树：$P_i = 0$ 视为完全背包，$P_i = 1$ 为 01 背包，$P_i > 1$ 为多重背包做二进制拆分。最终统一成 01 背包。

### 核心代码

```cpp
int h1, m1, h2, m2, n, M;
int num, vol[100005], val[100005], f[1005];
scanf("%d:%d %d:%d %d", &h1, &m1, &h2, &m2, &n);
M = (h2 * 60 + m2) - (h1 * 60 + m1);
for (int i = 1; i <= n; i++) {
    int t, c, p;
    scanf("%d%d%d", &t, &c, &p);
    if (!p) p = M / t; // 完全背包
    for (int j = 1; j <= p; j <<= 1) {
        vol[++num] = j * t; val[num] = j * c;
        p -= j;
    }
    if (p) { vol[++num] = p * t; val[num] = p * c; }
}
for (int i = 1; i <= num; i++)
    for (int j = M; j >= vol[i]; j--)
        f[j] = max(f[j], f[j - vol[i]] + val[i]);
printf("%d\n", f[M]);
```

### 复杂度

时间 $O(M \sum \log p_i)$，空间 $O(M)$。

---

## 16. [P1757 通天之分组背包](https://www.luogu.com.cn/problem/P1757)

`分组背包` `动态规划 DP`

### 题意

有 $n$ 件物品和容量为 $m$ 的背包，物品分为 $k$ 组，每组中的物品互相冲突（最多选一件）。求最大总价值。

### 分析

分组背包模板。外层枚举组，中层逆序枚举容量，内层枚举组内物品。对每个容量 $j$，在当前组的所有物品中选最优的一件进行转移。

### 核心代码

```cpp
int n, m, k;
int f[1005];
vector<pair<int,int>> grp[1005]; // grp[g] = {(v,w), ...}
scanf("%d%d", &m, &n);
for (int i = 1; i <= n; i++) {
    int v, w, g;
    scanf("%d%d%d", &v, &w, &g);
    grp[g].push_back({v, w});
    k = max(k, g);
}
for (int g = 1; g <= k; g++)
    for (int j = m; j >= 0; j--)
        for (auto [v, w] : grp[g])
            if (j >= v) f[j] = max(f[j], f[j - v] + w);
printf("%d\n", f[m]);
```

### 复杂度

时间 $O(km \cdot \text{max\_group\_size})$，空间 $O(m)$。

---

# 四、二维费用与依赖背包

当背包有多个费用维度、或者物品之间存在依赖关系时，需要在状态上做相应扩展。

## 17. [T426845 二维费用的背包问题](https://www.luogu.com.cn/problem/T426845)

`二维费用背包` `01背包`

### 题意

有 $N$ 件物品、背包容量 $V$、最大承重 $M$。每件物品有体积 $v_i$、重量 $m_i$ 和价值 $w_i$，每件最多使用一次。求满足体积和重量双重约束下的最大价值。

### 分析

01 背包的自然推广。定义 $f[j][k]$ 为体积不超过 $j$、重量不超过 $k$ 时的最大价值。每件物品同时逆序枚举体积和重量两个维度进行转移。

### 核心代码

```cpp
int N, V, M;
int f[105][105];
scanf("%d%d%d", &N, &V, &M);
for (int i = 1; i <= N; i++) {
    int v, m, w;
    scanf("%d%d%d", &v, &m, &w);
    for (int j = V; j >= v; j--)
        for (int k = M; k >= m; k--)
            f[j][k] = max(f[j][k], f[j - v][k - m] + w);
}
printf("%d\n", f[V][M]);
```

### 复杂度

时间 $O(NVM)$，空间 $O(VM)$。

---

## 18. [P1855 榨取kkksc03](https://www.luogu.com.cn/problem/P1855)

`二维费用背包` `动态规划 DP` `洛谷原创`

### 题意

kkksc03 有 $M$ 元钱和 $T$ 单位时间，有 $n$ 个愿望，实现第 $i$ 个需要 $m_i$ 元钱和 $t_i$ 时间。求最多能满足多少个愿望。

### 分析

二维费用的 01 背包，两个费用维度分别是金钱和时间，每个物品的"价值"都是 1（表示实现一个愿望）。

### 核心代码

```cpp
int n, M, T;
int f[205][205];
scanf("%d%d%d", &n, &M, &T);
for (int i = 1; i <= n; i++) {
    int m, t;
    scanf("%d%d", &m, &t);
    for (int j = M; j >= m; j--)
        for (int k = T; k >= t; k--)
            f[j][k] = max(f[j][k], f[j - m][k - t] + 1);
}
printf("%d\n", f[M][T]);
```

### 复杂度

时间 $O(nMT)$，空间 $O(MT)$。

---

## 19. [P1064 [NOIP 2006 提高组] 金明的预算方案](https://www.luogu.com.cn/problem/P1064)

`分组背包` `有依赖背包` `NOIP 提高组` `2006`

### 题意

金明有 $n$ 元预算，要从 $m$ 件物品中选购。物品分为主件和附件，每个主件最多有 2 个附件，选附件前必须先选主件。每件物品有价格和重要度，求 $\sum v_j \times w_j$ 的最大值。

### 分析

将每个主件及其附件看成一组，组内枚举所有合法选法（最多四种：只选主件、主件+附件 a、主件+附件 b、主件+附件 a+b），对每个预算 $j$ 在四种选法中取最优转移。本质上是分组背包。

### 核心代码

```cpp
int n, m;
int zv[65], zw[65], fv[65][3], fw[65][3], f[32005];
scanf("%d%d", &n, &m);
for (int i = 1; i <= m; i++) {
    int v, p, q;
    scanf("%d%d%d", &v, &p, &q);
    if (!q) { zv[i] = v; zw[i] = v * p; }
    else {
        ++fv[q][0];
        fv[q][fv[q][0]] = v;
        fw[q][fv[q][0]] = v * p;
    }
}
for (int i = 1; i <= m; i++) if (zv[i]) {
    for (int j = n; j >= zv[i]; j--) {
        f[j] = max(f[j], f[j - zv[i]] + zw[i]);
        if (j >= zv[i] + fv[i][1])
            f[j] = max(f[j], f[j - zv[i] - fv[i][1]] + zw[i] + fw[i][1]);
        if (j >= zv[i] + fv[i][2])
            f[j] = max(f[j], f[j - zv[i] - fv[i][2]] + zw[i] + fw[i][2]);
        if (j >= zv[i] + fv[i][1] + fv[i][2])
            f[j] = max(f[j], f[j - zv[i] - fv[i][1] - fv[i][2]] + zw[i] + fw[i][1] + fw[i][2]);
    }
}
printf("%d\n", f[n]);
```

### 复杂度

时间 $O(mn)$，空间 $O(n)$。

---

## 20. [P5365 [SNOI2017] 英雄联盟](https://www.luogu.com.cn/problem/P5365)

`背包` `乘法原理` `动态规划 DP`

### 题意

有 $N$ 个英雄，第 $i$ 个有 $K_i$ 款皮肤，每款价格 $C_i$ Q 币。给英雄 $i$ 买 $x_i$（$x_i \ge 1$）款皮肤后，展示策略数为 $\prod x_i$。要求策略数至少为 $M$，求最少花费。

### 分析

"策略数"是各英雄所购买皮肤数量的乘积，这是一个"乘法背包"问题。定义 $f[j]$ 为花费 $j$ Q 币时能达到的最大展示策略数。初始 $f[0] = 1$。对每个英雄枚举购买 $1 \sim K_i$ 款皮肤，费用为 $k \times C_i$，转移时用乘法：$f[j] = \max(f[j],\; f[j - k \cdot C_i] \times k)$。由于 $M$ 可能极大，使用 `long long` 存储并在超过 $M$ 时截断即可。最终找最小的 $j$ 使 $f[j] \ge M$。

### 核心代码

```cpp
int N;
long long M;
int K[105], C[105];
long long f[500005]; // f[j] = 花费j时最大策略数
scanf("%d%lld", &N, &M);
int sumC = 0;
for (int i = 1; i <= N; i++) scanf("%d", &K[i]);
for (int i = 1; i <= N; i++) { scanf("%d", &C[i]); sumC += K[i] * C[i]; }
f[0] = 1;
for (int i = 1; i <= N; i++)
    for (int j = sumC; j >= C[i]; j--)
        for (int k = 1; k <= K[i] && k * C[i] <= j; k++)
            f[j] = max(f[j], f[j - k * C[i]] * k);
for (int j = 0; j <= sumC; j++)
    if (f[j] >= M) { printf("%d\n", j); break; }
```

### 复杂度

时间 $O(\text{sumC} \cdot \sum K_i)$，空间 $O(\text{sumC})$。

---

# 五、背包求方案与第 K 优解

求"最优解有多少种方案"和"输出一个具体最优方案"是背包问题的常见扩展，前者需要在转移时同步维护方案数，后者需要记录路径后回溯。第 K 优解则需要在每个状态下维护前 K 个最优值。

## 21. [U519807 01背包求具体方案](https://www.luogu.com.cn/problem/U519807)

`01背包` `方案输出` `Special Judge`

### 题意

有 $n$ 件物品和容量 $m$ 的背包，每件物品有体积和价值，每件最多选一次。求最大价值及选取了哪些物品（任意一种最优方案即可）。

### 分析

先正常做 01 背包得到 $f[j]$。然后从最后一件物品开始逆向回溯：若 $j \ge v_i$ 且 $f[j] == f[j - v_i] + w_i$，说明物品 $i$ 可以被选，将 $i$ 记录并令 $j -= v_i$。因为不要求字典序最小，直接逆序扫即可。

### 核心代码

```cpp
int n, m;
int v[1005], w[1005], f[1005];
int ans[1005], cnt = 0;
scanf("%d%d", &n, &m);
for (int i = 1; i <= n; i++) scanf("%d%d", &v[i], &w[i]);
for (int i = 1; i <= n; i++)
    for (int j = m; j >= v[i]; j--)
        f[j] = max(f[j], f[j - v[i]] + w[i]);
printf("%d\n", f[m]);
int j = m;
for (int i = n; i >= 1; i--)
    if (j >= v[i] && f[j] == f[j - v[i]] + w[i]) {
        ans[++cnt] = i;
        j -= v[i];
    }
for (int i = cnt; i >= 1; i--) printf("%d ", ans[i]);
```

### 复杂度

时间 $O(nm)$，空间 $O(m)$（一维滚动数组回溯法）。

---

## 22. [T573743 背包问题求具体方案](https://www.luogu.com.cn/problem/T573743)

`01背包` `方案输出` `字典序最小`

### 题意

有 $N$ 件物品和容量 $V$ 的背包，每件物品有体积和价值，每件最多选一次。求最大价值，并输出字典序最小的最优方案（物品编号构成的序列）。

### 分析

为了得到字典序最小的方案，**逆序**处理物品（从第 $N$ 件到第 1 件开始 DP），令 $f[i][j]$ 表示从物品 $i \sim N$ 中选、容量为 $j$ 时的最大价值。DP 完成后从 $f[1][V]$ 出发，依次判断物品 $1, 2, \ldots, N$ 是否被选：若选物品 $i$ 能达到最优（$f[i][j] == f[i+1][j - v_i] + w_i$），则选它并更新剩余容量。这样优先选编号小的物品，保证字典序最小。

### 核心代码

```cpp
const int MAXN = 1010;
int n, m, v[MAXN], w[MAXN];
int f[MAXN][MAXN], p[MAXN][MAXN];
scanf("%d%d", &n, &m);
for (int i = 1; i <= n; i++) scanf("%d%d", &v[i], &w[i]);
for (int i = n; i >= 1; i--)
    for (int j = 0; j <= m; j++) {
        f[i][j] = f[i + 1][j];
        p[i][j] = j; // 记录路径
        if (j >= v[i] && f[i + 1][j - v[i]] + w[i] >= f[i][j]) {
            f[i][j] = f[i + 1][j - v[i]] + w[i];
            p[i][j] = j - v[i];
        }
    }
int j = m;
for (int i = 1; i <= n; i++)
    if (p[i][j] < j) { printf("%d ", i); j = p[i][j]; }
```

### 复杂度

时间 $O(nm)$，空间 $O(nm)$。

---

## 23. [U224067 背包问题求方案数](https://www.luogu.com.cn/problem/U224067)

`01背包` `方案计数`

### 题意

有 $N$ 件物品和容量 $V$ 的背包，每件物品有体积和价值，每件最多选一次。求最大价值的最优选法方案数，对 $10^9 + 7$ 取模。

### 分析

在标准 01 背包的基础上，额外维护 $g[j]$ 表示达到 $f[j]$ 这个最优值时的方案数。转移时：若 $f[j - v] + w > f[j]$，则更新 $f[j]$ 且令 $g[j] = g[j - v]$；若 $f[j - v] + w = f[j]$，则 $g[j] \mathrel{+}= g[j - v]$。初始化 $g[0 \ldots V] = 1$（空背包算一种方案）。

### 核心代码

```cpp
const int MOD = 1e9 + 7;
int N, V;
int f[1005];
int g[1005]; // 方案数
scanf("%d%d", &N, &V);
for (int j = 0; j <= V; j++) g[j] = 1;
for (int i = 1; i <= N; i++) {
    int v, w;
    scanf("%d%d", &v, &w);
    for (int j = V; j >= v; j--) {
        if (f[j - v] + w > f[j]) {
            f[j] = f[j - v] + w;
            g[j] = g[j - v];
        } else if (f[j - v] + w == f[j]) {
            g[j] = (g[j] + g[j - v]) % MOD;
        }
    }
}
printf("%d\n", g[V]);
```

### 复杂度

时间 $O(NV)$，空间 $O(V)$。

---

## 24. [U636783 背包九题-背包问题求方案数](https://www.luogu.com.cn/problem/U636783)

`01背包` `方案计数` `背包 DP`

### 题意

与上题完全相同：有 $N$ 件物品和容量 $V$ 的背包，求最大价值的方案数，对 $10^9 + 7$ 取模。

### 分析

做法与上题一致。同时维护最优值数组 $f[j]$ 和方案数数组 $g[j]$。逆序枚举体积，根据是否更新 $f[j]$ 来决定替换还是累加 $g[j]$。本题可视为对方案数计数模板的进一步巩固。

### 核心代码

```cpp
const int MOD = 1e9 + 7;
int N, V;
int f[1005], g[1005];
scanf("%d%d", &N, &V);
for (int j = 0; j <= V; j++) g[j] = 1;
for (int i = 1; i <= N; i++) {
    int v, w;
    scanf("%d%d", &v, &w);
    for (int j = V; j >= v; j--) {
        if (f[j - v] + w > f[j]) {
            f[j] = f[j - v] + w;
            g[j] = g[j - v];
        } else if (f[j - v] + w == f[j]) {
            g[j] = (g[j] + g[j - v]) % MOD;
        }
    }
}
printf("%d\n", g[V]);
```

### 复杂度

时间 $O(NV)$，空间 $O(V)$。

---

## 25. [P1858 多人背包](https://www.luogu.com.cn/problem/P1858)

`01背包` `前K优解` `归并`

### 题意

$K$ 个人各有一个容量为 $V$ 的背包，有 $N$ 种物品各有体积和价值。每个包恰好装满，每个包里每种物品最多一件，任意两个包的物品清单不同。求所有包的物品总价值最大是多少。

### 分析

等价于求 01 背包恰好装满时前 $K$ 大的价值之和。定义 $f[j][k]$ 为容量恰好为 $j$ 时第 $k$ 大的价值。初始化 $f$ 全为 $-\infty$，$f[0][1] = 0$。转移时对每个容量 $j$，将"不选当前物品的前 K 大"和"选当前物品的前 K 大"两个有序序列做归并，保留前 $K$ 个。

### 核心代码

```cpp
int K, V, N, ans = 0;
int v[205], w[205];
int f[5005][55], t[55];
scanf("%d%d%d", &K, &V, &N);
for (int i = 1; i <= N; i++) scanf("%d%d", &v[i], &w[i]);
memset(f, -0x3f, sizeof(f));
f[0][1] = 0;
for (int i = 1; i <= N; i++)
    for (int j = V; j >= v[i]; j--) {
        int c1 = 1, c2 = 1, cnt = 0;
        while (cnt < K) {
            if (f[j][c1] > f[j - v[i]][c2] + w[i])
                t[++cnt] = f[j][c1++];
            else
                t[++cnt] = f[j - v[i]][c2++] + w[i];
        }
        for (int k = 1; k <= K; k++) f[j][k] = t[k];
    }
for (int i = 1; i <= K; i++) ans += f[V][i];
printf("%d\n", ans);
```

### 复杂度

时间 $O(NVK)$，空间 $O(VK)$。

---

# 六、树形背包

当物品之间的依赖关系形成树形结构时，需要在 DFS 过程中合并子树的背包。树形背包的关键在于正确枚举子树大小并分配名额，总时间复杂度为 $O(n^2)$ 而非 $O(n^3)$。本章包含两道典型的树形背包题目。

## 26. [P3354 [IOI 2005] Riv 河流](https://www.luogu.com.cn/problem/P3354)

`树形DP` `树上背包` `IOI` `2005`

### 题意

$n$ 个伐木村庄分布在河流形成的树上，根节点 Bytetown 有一个伐木场。要在其他村庄中额外建 $k$ 个伐木场。每个村庄的木料沿河运到最近的下游伐木场，运费为木料量乘以距离。求最小总运费。

### 分析

定义 $f[u][j]$ 为以 $u$ 为根的子树中放 $j$ 个伐木场时的最小运费，同时隐含"$u$ 节点本身是否建伐木场"两种状态。DFS 时对每个节点枚举是否在此建场：不建场时，该节点木料的运费由其与最近祖先伐木场的距离 $d$ 决定；建场时运费为 0。合并子节点时做树上背包分配名额，复杂度关键在于每对 $(u, v)$ 的容量乘积只被计算一次，总体为 $O(nk^2)$。

### 核心代码

```cpp
const int N = 105;
vector<pair<int,int>> e[N]; // (child, edge_len)
int n, K, w[N];
long long f[N][N]; // f[u][j]: u子树放j个伐木场的最小费用
int sz[N];

void dfs(int u, long long dist) {
    sz[u] = 1;
    fill(f[u], f[u] + K + 2, (long long)1e18);
    f[u][0] = (long long)w[u] * dist;
    f[u][1] = 0;
    for (auto [v, d] : e[u]) {
        dfs(v, dist + d);
        static long long g[N];
        fill(g, g + sz[u] + sz[v] + 2, (long long)1e18);
        for (int j = min(sz[u], K); j >= 0; j--)
            for (int t = min(sz[v], K - j); t >= 0; t--)
                if (f[u][j] < 1e17 && f[v][t] < 1e17)
                    g[j + t] = min(g[j + t], f[u][j] + f[v][t]);
        sz[u] += sz[v];
        for (int j = 0; j <= min(sz[u], K); j++) f[u][j] = g[j];
    }
}
// 答案为 f[root][K]，根节点以距离0调用dfs
```

### 复杂度

时间 $O(nk^2)$（树上背包合并），空间 $O(nk)$。

---

## 27. [CF1830D Mex Tree](https://www.luogu.com.cn/problem/CF1830D)

`树形DP` `背包` `MEX`

### 题意

给定一棵 $n$ 个节点的树，每个节点染色为 0 或 1。路径 $(u,v)$ 的价值等于路径上颜色的 MEX（最小的不在路径颜色集合中的非负整数）。求所有路径 $(u,v)$（$u \le v$）价值之和的最大值。

### 分析

路径的 MEX 只有三种可能：0（路径上全为 1，不含 0）；1（路径上全为 0，不含 1）；2（路径上 0 和 1 均出现）。

设总路径数为 $P = \binom{n+1}{2}$，全 0 路径数为 $c_0$，全 1 路径数为 $c_1$，则：

$$\text{总价值} = 1 \cdot c_0 + 2 \cdot (P - c_0 - c_1) = 2P - c_0 - 2c_1$$

要最大化总价值，等价于最小化 $c_0 + 2c_1$。一条同色路径所属的颜色连通块大小为 $L$，则该块内同色路径有 $\dfrac{L(L+1)}{2}$ 条。对全 0 块贡献系数 1，全 1 块贡献系数 2。

用树形 DP：$f[u][j]$ 表示以 $u$ 为根的子树中，$u$ 所在的同色连通块大小为 $j$ 时，子树内已结算完毕的最小代价。合并子节点 $v$ 时：若 $v$ 与 $u$ 同色，将块合并，延迟结算；若不同色，$v$ 的块独立结算，代价为 $\dfrac{L(L+1)}{2} \times \text{系数}$。由于同色连通块大小之和等于 $n$，树上背包总复杂度 $O(n^2)$。

### 核心代码

```cpp
vector<int> e[5005];
long long f[5005][5005]; // f[u][j]: u块大小j时子树内的最小已结算代价
int sz[5005], n;
long long tri(long long x) { return x * (x + 1) / 2; }

void dfs(int u, int fa, int col) {
    // col: u的颜色(0或1)，系数为col+1
    sz[u] = 1;
    fill(f[u], f[u] + n + 1, (long long)4e18);
    f[u][1] = 0;
    for (int v : e[u]) {
        if (v == fa) continue;
        // 枚举v的颜色
        for (int vc = 0; vc <= 1; vc++) {
            dfs(v, u, vc);
            static long long g[5005];
            fill(g, g + sz[u] + sz[v] + 1, (long long)4e18);
            for (int j = 1; j <= sz[u]; j++) {
                if (f[u][j] >= (long long)4e18) continue;
                if (vc == col) { // v与u同色，合并块
                    for (int k = 1; k <= sz[v]; k++)
                        if (f[v][k] < (long long)4e18)
                            g[j + k] = min(g[j + k], f[u][j] + f[v][k]);
                } else { // v与u不同色，v块立即结算
                    long long best = (long long)4e18;
                    for (int k = 1; k <= sz[v]; k++)
                        if (f[v][k] < (long long)4e18)
                            best = min(best, f[v][k] + (long long)(vc + 1) * tri(k));
                    g[j] = min(g[j], f[u][j] + best);
                }
            }
            sz[u] += sz[v];
            copy(g, g + sz[u] + 1, f[u]);
        }
    }
}
// 枚举根节点颜色取最优，最终答案 = 2*P - min(cost)
```

### 复杂度

时间 $O(n^2)$（树上背包合并的总复杂度），空间 $O(n^2)$。
