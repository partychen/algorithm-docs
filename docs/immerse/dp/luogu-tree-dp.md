---
title: "洛谷 树形DP专题精选解题报告"
subtitle: "🌿 从树的经典量到换根与树上背包的树形 DP 主线"
order: 13
icon: "🌿"
---

# 洛谷 树形DP专题精选解题报告

这一组题从树的直径、重心与树心一路走到换根、树上背包和覆盖类状态，几乎把树形 DP 的主干套路全走了一遍。它们的共同点不在 DFS，而在于你能否把整棵树拆成若干子树答案，再把来自父侧和子侧的贡献严丝合缝地接起来。

# 一、树的经典量：直径、重心与中心

树形 DP 最基础的一类题，是把“整棵树的全局性质”拆成每个点的局部信息，再在一次或两次 DFS 中拼起来。直径关注两条最长向下链，重心关注最大连通块，树心与深度和则常常借助换根完成全局转移。

## 1. [U104609 【模板】树的重心](https://www.luogu.com.cn/problem/U104609)

`DP` `树形DP` `图论` `树形数据结构`

### 题意

给定一个 n 个节点的无根树，节点按照 1∼n 编号，并且无自环和重边。求它的重心，如果有多个重心，按照编号从小到大的顺序依次输出。

### 分析

删去一个点后，若所有连通块大小的最大值最小，那么这个点就是重心。做一次 DFS 统计子树大小，同时记录删点后最大的那块即可。

### 核心代码

```cpp
const int N = 200005;
int n, siz[N], best = 1e9, ans;
vector<int> g[N];

void dfs(int u, int fa) {
    siz[u] = 1;
    int mx = 0;
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        siz[u] += siz[v];
        mx = max(mx, siz[v]);
    }
    mx = max(mx, n - siz[u]);
    if (mx < best) best = mx, ans = u;
}
```

### 复杂度

$O(n)$。

---

## 2. [P1395 会议](https://www.luogu.com.cn/problem/P1395)

`DP` `树形DP` `树的重心` `福建省历届夏令营`

### 题意

有一个村庄居住着 n 个村民，有 n−1 条路径使得这 n 个村民的家联通，每条路径的长度都为 1。

### 分析

会议点本质上也是在树上找“最平衡”的位置。先用子树大小刻画每个点删去后的最大连通块，再按题目要求处理答案的字典序或附加统计。

### 核心代码

```cpp
const int N = 200005;
int n, siz[N], best = 1e9, ans;
vector<int> g[N];

void dfs(int u, int fa) {
    siz[u] = 1;
    int mx = 0;
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        siz[u] += siz[v];
        mx = max(mx, siz[v]);
    }
    mx = max(mx, n - siz[u]);
    if (mx < best) best = mx, ans = u;
}
```

### 复杂度

$O(n)$。

---

## 3. [CF685B Kay and Snowflake](https://www.luogu.com.cn/problem/CF685B)

`DP` `树形DP` `深度优先搜索 DFS` `树的重心`

### 题意

当魔镜碎片击中凯的眼睛后，他对玫瑰的美再也不感兴趣了。现在他喜欢观察雪花。 有一天，他发现了一片巨大的雪花，这片雪花的结构是一棵有 n 个结点的树（即连通无环图）。

### 分析

对子树查询重心时，重心一定沿着重儿子链移动。先求出每棵子树大小，再从重儿子的重心出发向上调整，就能在线性预处理后回答所有点。

### 核心代码

```cpp
int siz[N], son[N], cen[N];
vector<int> g[N];

void dfs(int u) {
    siz[u] = 1, cen[u] = u;
    for (int v : g[u]) {
        dfs(v);
        siz[u] += siz[v];
        if (siz[v] > siz[son[u]]) son[u] = v;
    }
    int x = cen[son[u]];
    while (x && max(siz[son[x]], siz[u] - siz[x]) * 2 > siz[u]) x = fa[x];
    cen[u] = x ? x : u;
}
```

### 复杂度

$O(n)$ 预处理，单点查询 $O(1)$。

---

## 4. [U81904 【模板】树的直径](https://www.luogu.com.cn/problem/U81904)

`DP` `树形DP`

### 题意

给定一棵树，树中每条边都有一个权值， 树中两点之间的距离定义为连接两点的路径边权之和。

### 分析

树的直径要么完全落在某个子树里，要么经过当前点由两条最长向下链拼出。后序 DFS 维护每个点向下的最长距离即可。

### 核心代码

```cpp
long long down[N], ans;
vector<pair<int,int>> g[N];

void dfs(int u, int fa) {
    for (auto [v, w] : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        ans = max(ans, down[u] + down[v] + w);
        down[u] = max(down[u], down[v] + w);
    }
}
```

### 复杂度

$O(n)$。

---

## 5. [B4016 树的直径](https://www.luogu.com.cn/problem/B4016)

`DP` `树形DP` `深度优先搜索 DFS` `树形 DP`

### 题意

给定一棵 n 个结点的树，树没有边权。请求出树的直径是多少，即树上最长的不重复经过一个点的路径长度是多少。

### 分析

和模板直径题完全同构：枚举每条边只会在父子合并时被用一次，因此维护“最长链 + 次长链”就能在遍历中更新全局答案。

### 核心代码

```cpp
long long down[N], ans;
vector<pair<int,int>> g[N];

void dfs(int u, int fa) {
    for (auto [v, w] : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        ans = max(ans, down[u] + down[v] + w);
        down[u] = max(down[u], down[v] + w);
    }
}
```

### 复杂度

$O(n)$。

---

## 6. [U392706 【模板】树的中心](https://www.luogu.com.cn/problem/U392706)

`DP` `树形DP`

### 题意

给定一棵 n 个节点的树，求树的所有中心。

### 分析

树心可以看作“到最远点距离最小”的点。先算每个点向下最长路，再把父侧最优通过换根传给儿子，最后比较 $\max(向下, 向上)$。

### 核心代码

```cpp
long long d1[N], d2[N], up[N];
int son[N];

void dfs1(int u, int fa) {
    for (auto [v, w] : g[u]) {
        if (v == fa) continue;
        dfs1(v, u);
        long long t = d1[v] + w;
        if (t > d1[u]) d2[u] = d1[u], d1[u] = t, son[u] = v;
        else if (t > d2[u]) d2[u] = t;
    }
}

void dfs2(int u, int fa) {
    for (auto [v, w] : g[u]) {
        if (v == fa) continue;
        up[v] = max(up[u], son[u] == v ? d2[u] : d1[u]) + w;
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

## 7. [U261056 树的中心](https://www.luogu.com.cn/problem/U261056)

`DP` `树形DP`

### 题意

给定一棵树，树中有n个结点（结点编号为1~n），请求出该树的中心结点的编号。树的中心指的是，该结点离树中的其他结点，最远距离最近。

### 分析

这题与树心模板一致。难点不在状态数量，而在分清“经过父亲的最优链”和“经过自己儿子的最优链”不能混用。

### 核心代码

```cpp
long long d1[N], d2[N], up[N];
int son[N];

void dfs1(int u, int fa) {
    for (auto [v, w] : g[u]) {
        if (v == fa) continue;
        dfs1(v, u);
        long long t = d1[v] + w;
        if (t > d1[u]) d2[u] = d1[u], d1[u] = t, son[u] = v;
        else if (t > d2[u]) d2[u] = t;
    }
}

void dfs2(int u, int fa) {
    for (auto [v, w] : g[u]) {
        if (v == fa) continue;
        up[v] = max(up[u], son[u] == v ? d2[u] : d1[u]) + w;
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

# 二、换根 DP 与全局贡献转移

这一组题的共同点，是“以某点为根”的答案可以从父亲向儿子递推得到。先在子树内做一次聚合，再把父侧贡献二次下传，就能把每个点都当作根来计算答案。

## 8. [AT_dp_v Subtree](https://www.luogu.com.cn/problem/AT_dp_v)

`DP` `树形 DP`

### 题意

有一棵包含 N 个顶点的树。顶点编号为 1,2,…,N。对于每个 i（1≤i≤N−1），第 i 条边连接顶点 x i ​ 和 y i ​ 。

### 分析

设 $down[u]$ 表示只看 $u$ 子树、且必须选到 $u$ 的合法方案数。换根时利用前缀积和后缀积，把“去掉某个儿子后的其余贡献”在线性时间内传给它。

### 核心代码

```cpp
long long down[N], up[N], pre[N], suf[N];

void dfs1(int u, int fa) {
    down[u] = 1;
    for (int v : g[u]) if (v != fa) {
        dfs1(v, u);
        down[u] = down[u] * (down[v] + 1) % mod;
    }
}

void dfs2(int u, int fa) {
    int m = g[u].size();
    pre[0] = suf[m + 1] = 1;
    for (int i = 1; i <= m; i++) {
        int v = g[u][i - 1];
        long long cur = (v == fa ? up[u] : down[v]) + 1;
        pre[i] = pre[i - 1] * cur % mod;
    }
    for (int i = m; i >= 1; i--) {
        int v = g[u][i - 1];
        long long cur = (v == fa ? up[u] : down[v]) + 1;
        suf[i] = suf[i + 1] * cur % mod;
    }
    for (int i = 1; i <= m; i++) {
        int v = g[u][i - 1];
        if (v == fa) continue;
        up[v] = pre[i - 1] * suf[i + 1] % mod;
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

## 9. [CF1187E Tree Painting](https://www.luogu.com.cn/problem/CF1187E)

`DP` `动态规划 DP` `树形 DP`

### 题意

给定一棵包含 n 个顶点的树（无向连通无环图）。你要在这棵树上玩一个游戏。 最开始所有顶点都是白色的。

### 分析

第一次 DFS 计算以 1 为根时的总得分和子树大小；第二次 DFS 令根从父亲移到儿子，答案变化量正好是 $n-2\cdot siz[v]$。这是换根 DP 的经典式子。

### 核心代码

```cpp
long long siz[N], f[N];

void dfs1(int u, int fa, int dep) {
    siz[u] = 1;
    f[1] += dep;
    for (int v : g[u]) if (v != fa) {
        dfs1(v, u, dep + 1);
        siz[u] += siz[v];
    }
}

void dfs2(int u, int fa) {
    for (int v : g[u]) if (v != fa) {
        f[v] = f[u] + n - 2 * siz[v];
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

## 10. [CF1324F Maximum White Subtree](https://www.luogu.com.cn/problem/CF1324F)

`DP` `深度优先搜索 DFS` `树形 DP`

### 题意

给定一棵包含 n 个顶点的树。树是一个包含 n−1 条边的连通无向图。树上的每个顶点 v 都被赋予了一种颜色（如果顶点 v 是白色，则 a v ​ =1，如果顶点 v 是黑色，则 a v ​ =0）。

### 分析

把白点看作 $+1$、黑点看作 $-1$。先在子树内保留所有正贡献，再把父侧的正贡献向下传，最终每个点都能得到“必须包含它”的最优连通子树值。

### 核心代码

```cpp
long long down[N], up[N], val[N];

void dfs1(int u, int fa) {
    down[u] = val[u];
    for (int v : g[u]) if (v != fa) {
        dfs1(v, u);
        down[u] += max(0LL, down[v]);
    }
}

void dfs2(int u, int fa) {
    for (int v : g[u]) if (v != fa) {
        up[v] = max(0LL, up[u] + down[u] - max(0LL, down[v]));
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

## 11. [P2986 [USACO10MAR] Great Cow Gathering G](https://www.luogu.com.cn/problem/P2986)

`DP` `动态规划 DP` `树形 DP` `USACO`

### 题意

Bessie 正在计划一年一度的奶牛大集会，来自全国各地的奶牛将来参加这一次集会。

### 分析

先固定一个根求出“所有奶牛到根的总代价”，同时维护每个子树中的奶牛数。换根到儿子时，只需把这条边两侧的牛群整体平移即可完成转移。

### 核心代码

```cpp
long long siz[N], w[N], f[N], tot;

void dfs1(int u, int fa, long long dep) {
    siz[u] = w[u];
    f[1] += dep * w[u];
    for (auto [v, c] : g[u]) if (v != fa) {
        dfs1(v, u, dep + c);
        siz[u] += siz[v];
    }
}

void dfs2(int u, int fa) {
    for (auto [v, c] : g[u]) if (v != fa) {
        f[v] = f[u] + (tot - 2 * siz[v]) * c;
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

## 12. [P3478 [POI 2008] STA-Station](https://www.luogu.com.cn/problem/P3478)

`DP` `动态规划 DP` `树形数据结构` `树形 DP`

### 题意

给定一个 n 个点的树，请求出一个结点，使得以这个结点为根时，所有结点的深度之和最大。 一个结点的深度之定义为该节点到根的简单路径上边的数量。

### 分析

深度和最大值本质也是换根：根从 $u$ 移到 $v$ 时，$v$ 子树内点深度减一，其余点深度加一，所以答案变化仍是 $n-2\cdot siz[v]$。

### 核心代码

```cpp
long long siz[N], f[N];

void dfs1(int u, int fa, int dep) {
    siz[u] = 1;
    f[1] += dep;
    for (int v : g[u]) if (v != fa) {
        dfs1(v, u, dep + 1);
        siz[u] += siz[v];
    }
}

void dfs2(int u, int fa) {
    for (int v : g[u]) if (v != fa) {
        f[v] = f[u] + n - 2 * siz[v];
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

## 13. [CF219D Choosing Capital for Treeland](https://www.luogu.com.cn/problem/CF219D)

`DP` `动态规划 DP` `树形 DP`

### 题意

Treeland 国有 n 个城市，有些城市间存在 单向 道路。这个国家一共有 n−1 条路。

### 分析

先把每条边按原方向赋代价：顺着走不用翻转，逆着走代价为 1。第一次 DFS 求以 1 为首都时需要翻转多少条边，再通过换根把代价转移到所有点。

### 核心代码

```cpp
int down[N], ans[N];
vector<pair<int,int>> g[N]; // cost=0 means correct, 1 means need reverse

void dfs1(int u, int fa) {
    for (auto [v, c] : g[u]) if (v != fa) {
        dfs1(v, u);
        down[u] += down[v] + c;
    }
}

void dfs2(int u, int fa) {
    for (auto [v, c] : g[u]) if (v != fa) {
        ans[v] = ans[u] + (c == 0 ? 1 : -1);
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

## 14. [P3047 [USACO12FEB] Nearby Cows G](https://www.luogu.com.cn/problem/P3047)

`DP` `动态规划 DP` `树形 DP` `USACO`

### 题意

FJ 注意到了他的奶牛经常在附近的田地移动。考虑到这个事情，他想要在每个田地里种足够的草，不仅是为了最初在那块地里的奶牛，也是为了从附近田地来的奶牛。

### 分析

把“距离不超过 K 的奶牛数”拆成按深度统计的 DP。子树内先做一遍深度卷积，再根据父侧贡献或换根关系补足来自树外的部分。

### 核心代码

```cpp
for (int u = 1; u <= n; u++) f[u][0] = cow[u];
for (int d = 1; d <= K; d++)
    for (int u = 1; u <= n; u++)
        for (int v : g[u])
            f[u][d] += f[v][d - 1];
```

### 复杂度

$O(nK)$。

---

## 15. [P4084 [USACO17DEC] Barn Painting G](https://www.luogu.com.cn/problem/P4084)

`DP` `树形DP` `动态规划 DP` `树形 DP`

### 题意

Farmer John 有一个大农场，农场上有 N 个谷仓（1≤N≤10 5 ），其中一些已经涂色，另一些尚未涂色。

### 分析

这是树上染色计数题。定义 $dp[u][c]$ 表示 $u$ 染成颜色 $c$ 的方案数，合并儿子时只允许不同颜色配对即可。固定颜色的点直接把非法状态置零。

### 核心代码

```cpp
long long dp[N][3];

void dfs(int u, int fa) {
    for (int c = 0; c < 3; c++) dp[u][c] = (fix[u] == -1 || fix[u] == c);
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        long long ndp[3] = {};
        for (int cu = 0; cu < 3; cu++)
            for (int cv = 0; cv < 3; cv++) if (cu != cv)
                ndp[cu] = (ndp[cu] + dp[u][cu] * dp[v][cv]) % mod;
        memcpy(dp[u], ndp, sizeof ndp);
    }
}
```

### 复杂度

$O(3^2 n)$。

---

## 16. [P10974 Accumulation Degree](https://www.luogu.com.cn/problem/P10974)

`DP` `树形DP` `动态规划 DP` `树形 DP`

### 题意

树在许多世界神话中也扮演着亲密的角色。许多学者对树的一些特殊属性感兴趣，例如树的中心、树的计数、树的着色等。

### 分析

累积度数本质是对每条边取“继续深入”还是“在此回收”的较小代价。先自底向上算子树最优，再自顶向下补充父侧路径贡献。

### 核心代码

```cpp
long long down[N], up[N];

void dfs1(int u, int fa) {
    for (auto [v, w] : g[u]) if (v != fa) {
        dfs1(v, u);
        down[u] += min((long long)w, down[v]);
    }
}

void dfs2(int u, int fa) {
    for (auto [v, w] : g[u]) if (v != fa) {
        up[v] = down[v] + min((long long)w, up[u] + down[u] - min((long long)w, down[v]));
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

## 17. [P6419 [COCI 2014/2015 #1] Kamp](https://www.luogu.com.cn/problem/P6419)

`DP` `动态规划 DP` `树形 DP` `COCI（克罗地亚）`

### 题意

一棵树 n 个点，n−1 条边，经过每条边都要花费一定的时间，任意两个点都是联通的。

### 分析

先把所有需要接送的人缩成一棵 Steiner 树，往返部分的贡献固定；剩下只需为每个点求出到关键点集的最远距离，再用换根维护最长链。

### 核心代码

```cpp
long long need[N], dist1[N], dist2[N], up[N];

void dfs1(int u, int fa) {
    for (auto [v, w] : g[u]) if (v != fa) {
        dfs1(v, u);
        if (need[v]) need[u] += need[v], dist1[u] += dist1[v] + 2 * w;
    }
}

void dfs2(int u, int fa) {
    for (auto [v, w] : g[u]) if (v != fa) {
        up[v] = max(up[u], dist2[u] == dist2[v] + w ? alt[u] : dist2[u]) + w;
        dfs2(v, u);
    }
}
```

### 复杂度

$O(n)$。

---

## 18. [P8625 [蓝桥杯 2015 省 B] 生命之树](https://www.luogu.com.cn/problem/P8625)

`DP` `树形DP` `树形 DP` `蓝桥杯省赛`

### 题意

在 X 森林里，上帝创建了生命之树。 他给每棵树的每个节点（叶子也称为一个节点）上，都标了一个整数，代表这个点的和谐值。

### 分析

把点权树看成“可选正贡献子树”的并。后序 DFS 先把所有正收益儿子累加起来，任何负贡献都直接舍弃，答案就是全局最大连通子树和。

### 核心代码

```cpp
long long f[N], val[N], ans = -(1LL << 60);

void dfs(int u, int fa) {
    f[u] = val[u];
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        f[u] += max(0LL, f[v]);
    }
    ans = max(ans, f[u]);
}
```

### 复杂度

$O(n)$。

---

## 19. [P1122 最大子树和](https://www.luogu.com.cn/problem/P1122)

`DP` `树形DP` `动态规划 DP` `树形 DP`

### 题意

小明对数学饱有兴趣，并且是个勤奋好学的学生，总是在课后留在教室向老师请教一些问题。

### 分析

最大子树和与生命之树是同一模型：父亲只吸收儿子带来的正贡献，所以转移就是 $f[u]=a[u]+\sum\max(0,f[v])$。

### 核心代码

```cpp
long long f[N], val[N], ans = -(1LL << 60);

void dfs(int u, int fa) {
    f[u] = val[u];
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        f[u] += max(0LL, f[v]);
    }
    ans = max(ans, f[u]);
}
```

### 复杂度

$O(n)$。

---

## 20. [P1131 [ZJOI2007] 时态同步](https://www.luogu.com.cn/problem/P1131)

`DP` `树形DP` `动态规划 DP` `树形 DP`

### 题意

小 Q 在电子工艺实习课上学习焊接电路板。一块电路板由若干个元件组成，我们不妨称之为节点，并将其用数字 1,2,3⋯ 进行标号。

### 分析

要把所有叶子的“到根距离”同步到同一个最大值。对子树先求出最长路径长度，再把较短分支补齐，缺多少就往答案里加多少。

### 核心代码

```cpp
long long f[N];

void dfs(int u, int fa) {
    long long mx = 0;
    for (auto [v, w] : g[u]) if (v != fa) {
        dfs(v, u);
        mx = max(mx, f[v] + w);
    }
    for (auto [v, w] : g[u]) if (v != fa)
        f[u] += mx - (f[v] + w);
}
```

### 复杂度

$O(n)$。

---

# 三、树上背包与依赖选择

树上背包的核心是“子树合并”。每个儿子提供一组可选状态，父节点像分组背包一样逐个合并，就能处理课程依赖、连通块选择、容量限制、边数限制等经典模型。

## 21. [P2515 [HAOI2010] 软件安装](https://www.luogu.com.cn/problem/P2515)

`背包` `Tarjan` `缩点` `动态规划 DP`

### 题意

现在我们的手头有 N 个软件，对于一个软件 i，它要占用 W i ​ 的磁盘空间，它的价值为 V i ​ 。

### 分析

依赖关系形成的是“每个点至多一个父亲”的图，先用 Tarjan 缩点把环压成 DAG，再挂超级根转成树。之后就是带体积和价值的树上背包。

### 核心代码

```cpp
tarjan();
for (int u = 1; u <= scc_cnt; u++)
    for (int v : dag[u]) {
        dfs(v);
        for (int i = cap[u]; i >= 0; i--)
            for (int j = 0; j <= i; j++)
                dp[u][i] = max(dp[u][i], dp[u][i - j] + dp[v][j]);
    }
for (int i = W[u]; i <= m; i++) dp[u][i] = max(dp[u][i], dp[u][i - W[u]] + V[u]);
```

### 复杂度

$O(nm)$。

---

## 22. [P1642 规划](https://www.luogu.com.cn/problem/P1642)

`背包` `动态规划 DP` `二分` `树形 DP`

### 题意

某地方有 N 个工厂，有 N−1 条路连接它们，且它们两两都可达。每个工厂都有一个产量值和一个污染值。

### 分析

“产量 / 污染”最大化通常转成二分答案。把每个点权改为 $a_i-\lambda b_i$ 后，问题变成选一个大小固定且连通的子树使权值和非负，再用树上背包判定。

### 核心代码

```cpp
bool check(double mid) {
    for (int u = 1; u <= n; u++) val[u] = prod[u] - mid * cost[u];
    dfs(1, 0);
    return *max_element(dp[1], dp[1] + n - m + 1) >= 0;
}
```

### 复杂度

$O(n^2\log V)$。

---

## 23. [P6478 [NOI Online #2 提高组] 游戏](https://www.luogu.com.cn/problem/P6478)

`背包` `动态规划 DP` `数学` `树形 DP`

### 题意

小 A 和小 B 正在玩一个游戏：有一棵包含 n=2m 个点的有根树（点从 1∼n 编号），它的根是 1 号点，初始时两人各拥有 m 个点。

### 分析

题目要求统计第一次非平局出现的位置，核心是把每棵子树的选择方案写成按回合数分类的多项式。合并儿子时做背包卷积，再结合容斥提取第一次发生的时刻。

### 核心代码

```cpp
dp[u][0][0] = 1;
for (int v : g[u]) {
    dfs(v, u);
    for (int i = 0; i <= lim; i++)
        for (int j = 0; i + j <= lim; j++)
            ndp[i + j] = (ndp[i + j] + dp[u][i] * dp[v][j]) % mod;
    memcpy(dp[u], ndp, sizeof ndp);
}
```

### 复杂度

$O(nm^2)$。

---

## 24. [P4516 [JSOI2018] 潜入行动](https://www.luogu.com.cn/problem/P4516)

`背包` `背包 DP` `树形 DP` `各省省选`

### 题意

外星人又双叒叕要攻打地球了，外星母舰已经向地球航行！这一次，JYY 已经联系好了黄金舰队，打算联合所有 JSOIer 抵御外星人的进攻。

### 分析

设状态表示“当前点是否放设备、是否已被覆盖、已用多少设备”。每个儿子合并时像分组背包一样卷起来，最后只保留能覆盖整棵树且恰好用完 $k$ 个设备的状态。

### 核心代码

```cpp
dp[u][0][0] = 1;
for (int v : g[u]) {
    dfs(v, u);
    for (int i = 0; i <= lim; i++)
        for (int j = 0; i + j <= lim; j++)
            ndp[i + j] = (ndp[i + j] + dp[u][i] * dp[v][j]) % mod;
    memcpy(dp[u], ndp, sizeof ndp);
}
```

### 复杂度

$O(nk^2)$。

---

## 25. [P1270 “访问”美术馆](https://www.luogu.com.cn/problem/P1270)

`背包` `动态规划 DP` `搜索` `树形数据结构`

### 题意

经过数月的精心准备，Peer Brelstet，一个出了名的盗画者，准备开始他的下一个行动。

### 分析

这题的树是天然二叉结构，时间限制就是背包容量。递归求左右子树后，用二叉树背包合并两边时间分配，再加上走廊和拿画时间即可。

### 核心代码

```cpp
void dfs(int u) {
    if (leaf[u]) {
        for (int t = cost[u]; t <= T; t++) dp[u][t] = value[u];
        return;
    }
    dfs(ls[u]), dfs(rs[u]);
    for (int t = 0; t <= T; t++)
        for (int k = 0; k <= t; k++)
            dp[u][t] = max(dp[u][t], dp[ls[u]][k] + dp[rs[u]][t - k]);
}
```

### 复杂度

$O(nT^2)$。

---

## 26. [P3360 偷天换日](https://www.luogu.com.cn/problem/P3360)

`背包` `动态规划 DP` `背包 DP` `树形 DP`

### 题意

艺术馆由若干个展览厅和若干条走廊组成。每一条走廊的尽头不是通向一个展览厅，就是分为两个走廊。

### 分析

和“访问美术馆”同型，只是价值定义换成画作总价值。关键仍然是把每个分叉点视作一个合并节点，在总时间限制下做二叉树背包。

### 核心代码

```cpp
void dfs(int u) {
    if (leaf[u]) {
        for (int t = cost[u]; t <= T; t++) dp[u][t] = value[u];
        return;
    }
    dfs(ls[u]), dfs(rs[u]);
    for (int t = 0; t <= T; t++)
        for (int k = 0; k <= t; k++)
            dp[u][t] = max(dp[u][t], dp[ls[u]][k] + dp[rs[u]][t - k]);
}
```

### 复杂度

$O(nT^2)$。

---

## 27. [P1273 [CHCI 2002 Final Exam #2] 有线电视网](https://www.luogu.com.cn/problem/P1273)

`背包` `动态规划 DP` `树形数据结构` `递归`

### 题意

某收费有线电视网计划转播一场重要的足球比赛。他们的转播网和用户终端构成一棵树状结构，这棵树的根结点位于足球比赛的现场，树叶为各个用户终端，其他中转站为该树的内部节点。

### 分析

叶子表示用户，内部点表示转播站。对子树维护“服务 j 个用户时的最大利润”，合并儿子时扣去边权费用，最后找不亏本的最大 j。

### 核心代码

```cpp
void dfs(int u) {
    dp[u][0] = 0;
    if (leaf[u]) dp[u][1] = pay[u];
    for (auto [v, w] : g[u]) {
        dfs(v);
        for (int i = siz[u]; i >= 0; i--)
            for (int j = 1; j <= siz[v]; j++)
                dp[u][i + j] = max(dp[u][i + j], dp[u][i] + dp[v][j] - w);
        siz[u] += siz[v];
    }
}
```

### 复杂度

$O(n^2)$。

---

## 28. [P1272 [USACO02FEB] 重建道路](https://www.luogu.com.cn/problem/P1272)

`背包` `动态规划 DP` `树形 DP` `USACO`

### 题意

一场可怕的地震后，人们用 N 个牲口棚（编号 1∼N）重建了农夫 John 的牧场。

### 分析

设 $dp[u][k]$ 为在 $u$ 子树里保留恰好 $k$ 个点所需切掉的最少边数。合并儿子时像最小化版本的树上背包，根外连边最终单独补 1。

### 核心代码

```cpp
const int INF = 1e9;
void dfs(int u, int fa) {
    dp[u][1] = deg[u] - (fa != 0);
    siz[u] = 1;
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        for (int i = siz[u]; i >= 1; i--)
            for (int j = 1; j <= siz[v]; j++)
                dp[u][i + j] = min(dp[u][i + j], dp[u][i] + dp[v][j] - 2);
        siz[u] += siz[v];
    }
}
```

### 复杂度

$O(n^2)$。

---

## 29. [P2015 二叉苹果树](https://www.luogu.com.cn/problem/P2015)

`背包` `动态规划 DP` `树形数据结构` `背包 DP`

### 题意

有一棵苹果树，如果树枝有分叉，一定是分二叉（就是说没有只有一个儿子的结点） 这棵树共有 N 个结点（叶子点或者树枝分叉点），编号为 1∼N，树根编号一定是 1。

### 分析

保留若干条边等价于在每棵子树中分配“还剩多少条边可选”。转移时枚举分给儿子的边数，再把该儿子连接边上的苹果数加进来。

### 核心代码

```cpp
void dfs(int u, int fa) {
    for (auto [v, w] : g[u]) if (v != fa) {
        dfs(v, u);
        for (int i = q; i >= 1; i--)
            for (int j = 0; j < i; j++)
                dp[u][i] = max(dp[u][i], dp[u][i - j - 1] + dp[v][j] + w);
    }
}
```

### 复杂度

$O(nq^2)$。

---

## 30. [P3177 [HAOI2015] 树上染色](https://www.luogu.com.cn/problem/P3177)

`DP` `树形DP` `动态规划 DP` `树形 DP`

### 题意

有一棵点数为 n 的树，树边有边权。给你一个在 0∼n 之内的正整数 k ，你要在这棵树中选择 k 个点，将其染成黑色，并将其他的 n−k 个点染成白色。

### 分析

染黑点数固定时，某条边的贡献只和它两侧黑白点数量有关。树上背包维护子树中选了多少个点，再把跨边贡献按组合数公式加入。

### 核心代码

```cpp
void dfs(int u, int fa) {
    siz[u] = 1;
    for (auto [v, w] : g[u]) if (v != fa) {
        dfs(v, u);
        for (int i = min(siz[u], k); i >= 0; i--)
            for (int j = 1; i + j <= k; j++)
                dp[u][i + j] = max(dp[u][i + j], dp[u][i] + dp[v][j] + 1LL * j * (k - j) * w);
        siz[u] += siz[v];
    }
}
```

### 复杂度

$O(nk^2)$。

---

## 31. [P8677 [蓝桥杯 2018 国 A] 采油](https://www.luogu.com.cn/problem/P8677)

`DP` `树形DP` `树形 DP` `蓝桥杯国赛`

### 题意

LQ 公司是世界著名的石油公司，为世界供应优质石油。 最近，LQ 公司又在森林里发现了一大片区域的油田，可以在这个油田中开采 n 个油井。

### 分析

采油问题本质也是多子树资源分配：每个儿子提供若干“取多少”的收益，父节点在总限制下逐个合并，典型树上背包。

### 核心代码

```cpp
void dfs(int u, int fa) {
    siz[u] = 1;
    dp[u][0] = 0;
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        for (int i = siz[u]; i >= 0; i--)
            for (int j = 1; j <= siz[v]; j++)
                dp[u][i + j] = max(dp[u][i + j], dp[u][i] + dp[v][j]);
        siz[u] += siz[v];
    }
}
```

### 复杂度

$O(nm^2)$。

---

## 32. [P2014 [CTSC1997] 选课](https://www.luogu.com.cn/problem/P2014)

`背包` `动态规划 DP` `搜索` `背包 DP`

### 题意

在大学里每个学生，为了达到一定的学分，必须从很多课程里选择一些课程来学习，在课程里有些课程必须在某些课程之前学习，如高等数学总是在其它课程之前学习。

### 分析

课程依赖形成一棵先修树。选某门课必须先选祖先，所以在 DFS 序上做依赖树背包，枚举每个儿子贡献多少门课程即可。

### 核心代码

```cpp
void dfs(int u, int fa) {
    siz[u] = 1;
    dp[u][0] = 0;
    for (int v : g[u]) {
        if (v == fa) continue;
        dfs(v, u);
        for (int i = siz[u]; i >= 0; i--)
            for (int j = 1; j <= siz[v]; j++)
                dp[u][i + j] = max(dp[u][i + j], dp[u][i] + dp[v][j]);
        siz[u] += siz[v];
    }
}
```

### 复杂度

$O(nm^2)$。

---

# 四、覆盖、染色与局部状态设计

这类题往往不是单纯求和，而是要设计“选或不选、被覆盖或未覆盖、能否向父亲转移”的有限状态。状态虽小，但合法性约束强，转移时一定要先想清父子之间的信息边界。

## 33. [P2899 [USACO08JAN] Cell Phone Network G](https://www.luogu.com.cn/problem/P2899)

`DP` `树形DP` `排序` `树形 DP`

### 题意

Farmer John 想让他的所有牛用上手机以便相互交流。他需要建立几座信号塔在 N 块草地中。

### 分析

手机基站覆盖题需要区分“本点放站、已被子节点覆盖、等待父节点覆盖”等状态。状态数虽小，但每个状态的合法儿子组合不同，设计时要先列清语义。

### 核心代码

```cpp
const int INF = 1e9;
void dfs(int u, int fa) {
    dp[u][0] = 1; dp[u][1] = dp[u][2] = 0;
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        ndp0 = min({dp[v][0], dp[v][1], dp[v][2]});
        ndp1 = min(dp[v][0], dp[v][2]);
        ndp2 = dp[v][1];
    }
}
```

### 复杂度

$O(n)$。

---

## 34. [P2458 [SDOI2006] 保安站岗](https://www.luogu.com.cn/problem/P2458)

`DP` `树形DP` `动态规划 DP` `树形数据结构`

### 题意

五一来临，某地下超市为了便于疏通和指挥密集的人员和车辆，以免造成超市内的混乱和拥挤，准备临时从外单位调用部分保安来维持交通秩序。

### 分析

保安站岗是带点权的最小支配集。三态 DP：本点放保安、被儿子覆盖、等待父亲覆盖；其中“被儿子覆盖”要额外枚举哪个儿子来负责覆盖它。

### 核心代码

```cpp
const long long INF = 4e18;
void dfs(int u, int fa) {
    f[u][0] = cost[u];
    f[u][1] = 0;
    f[u][2] = 0;
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        f[u][0] += min({f[v][0], f[v][1], f[v][2]});
        f[u][2] += min(f[v][0], f[v][1]);
    }
    f[u][1] = INF;
    for (int v : g[u]) if (v != fa)
        f[u][1] = min(f[u][1], f[u][2] - min(f[v][0], f[v][1]) + f[v][0]);
}
```

### 复杂度

$O(n)$。

---

## 35. [P2016 [SEERC 2000] 战略游戏](https://www.luogu.com.cn/problem/P2016)

`DP` `树形DP` `动态规划 DP` `贪心`

### 题意

他要建立一个古城堡，城堡中的路形成一棵无根树。他要在这棵树的结点上放置最少数目的士兵，使得这些士兵能瞭望到所有的路。

### 分析

战略游戏就是树上的最小点覆盖。边必须被至少一个端点选中，所以若父亲不选，儿子必须全选；若父亲选了，儿子可自由取较优状态。

### 核心代码

```cpp
void dfs(int u, int fa) {
    dp[u][1] = 1;
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        dp[u][0] += dp[v][1];
        dp[u][1] += min(dp[v][0], dp[v][1]);
    }
}
```

### 复杂度

$O(n)$。

---

## 36. [UVA1292 Strategic game](https://www.luogu.com.cn/problem/UVA1292)

`DP` `树形DP` `动态规划 DP` `贪心`

### 题意

题目翻译 给定一棵 n 个节点的树。你需要让这棵树上的每条边都被看守。当一条边的端点上至少有一个士兵时，我们就说这条边被看守。求出看守这棵树最少用的士兵数量。

### 分析

Strategic game 与 P2016 同模：把监控点看成覆盖所有边的顶点集合，直接套树上最小点覆盖 DP 即可。

### 核心代码

```cpp
void dfs(int u, int fa) {
    dp[u][1] = 1;
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        dp[u][0] += dp[v][1];
        dp[u][1] += min(dp[v][0], dp[v][1]);
    }
}
```

### 复杂度

$O(n)$。

---

## 37. [P1352 没有上司的舞会](https://www.luogu.com.cn/problem/P1352)

`DP` `树形DP` `动态规划 DP` `树形 DP`

### 题意

某大学有 n 个职员，编号为 1…n。 他们之间有从属关系，也就是说他们的关系就像一棵以校长为根的树，父结点就是子结点的直接上司。

### 分析

没有上司的舞会是树上最大独立集。若选当前员工，所有孩子都不能选；若不选当前员工，则每个孩子都可以独立地取最优。

### 核心代码

```cpp
void dfs(int u) {
    dp[u][1] = val[u];
    for (int v : son[u]) {
        dfs(v);
        dp[u][0] += max(dp[v][0], dp[v][1]);
        dp[u][1] += dp[v][0];
    }
}
```

### 复杂度

$O(n)$。

---

## 38. [P3523 [POI 2011] DYN-Dynamite](https://www.luogu.com.cn/problem/P3523)

`DP` `树形DP` `二分` `动态规划 DP`

### 题意

Byteotian 洞穴由 n 个房间和连接它们的 n−1 条走廊组成。对于每一对房间，有一条唯一的路径可以在不离开洞穴的情况下从一个房间移动到另一个房间。

### 分析

把“最少炸药数”或“最远影响范围”转成判定问题后，可以二分答案。DFS 中维护最近未处理关键点到当前点的距离，超过阈值时就必须在某处放置设施。

### 核心代码

```cpp
bool check(int lim) {
    dfs(1, 0);
    return need[1] <= m;
}

void dfs(int u, int fa) {
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        if (dis[v] == lim - 1) need[u]++, dis[u] = max(dis[u], -1);
        else dis[u] = max(dis[u], dis[v] + 1);
    }
}
```

### 复杂度

$O(n\log n)$。

---

## 39. [P3554 [POI 2013] LUK-Triumphal arch](https://www.luogu.com.cn/problem/P3554)

`DP` `树形DP` `二分` `动态规划 DP`

### 题意

给一颗 n 个节点的树，初始时 1 号节点被染黑，其余是白的。两个人轮流操作，一开始 B 在 1 号节点。

### 分析

这题同样是“二分阈值 + 树上贪心 / DP 判定”。后序遍历时让子树尽量在内部消化超限需求，只把必要的信息向父亲上传。

### 核心代码

```cpp
bool check(int lim) {
    dfs(1, 0);
    return need[1] <= m;
}

void dfs(int u, int fa) {
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        if (dis[v] == lim - 1) need[u]++, dis[u] = max(dis[u], -1);
        else dis[u] = max(dis[u], dis[v] + 1);
    }
}
```

### 复杂度

$O(n\log n)$。

---

## 40. [CF767C Garland](https://www.luogu.com.cn/problem/CF767C)

`DP` `树形DP` `动态规划 DP` `剪枝`

### 题意

新年时，Dima 做了一个梦，梦中他收到了一串神奇的彩灯。这串彩灯由若干个灯泡组成，其中一些灯泡两两之间由导线直接相连。

### 分析

若总权值不能被 3 整除则无解；否则 DFS 求子树和，只要找到两个非根子树的和都等于总和的三分之一，就能切成三块。

### 核心代码

```cpp
int cnt = 0, a = -1, b = -1;

int dfs(int u, int fa) {
    int sum = val[u];
    for (int v : g[u]) if (v != fa) sum += dfs(v, u);
    if (sum == target && cnt < 2) {
        if (cnt == 0) a = u;
        else b = u;
        cnt++;
        return 0;
    }
    return sum;
}
```

### 复杂度

$O(n)$。

---

## 41. [P8744 [蓝桥杯 2021 省 A] 左孩子右兄弟](https://www.luogu.com.cn/problem/P8744)

`DP` `树形DP` `树形 DP` `蓝桥杯省赛`

### 题意

对于一棵多叉树，我们可以通过“左孩子右兄弟”表示法，将其转化成一棵二叉树。 如果我们认为每个结点的子结点是无序的，那么得到的二叉树可能不唯一。

### 分析

左孩子右兄弟模型把任意树转成二叉树视角后，答案通常等于“最深子树高度 + 儿子个数”。DFS 递归每个儿子的最优值即可。

### 核心代码

```cpp
int dfs(int u) {
    int mx = 0;
    for (int v : son[u]) mx = max(mx, dfs(v));
    return mx + (int)son[u].size();
}
```

### 复杂度

$O(n)$。

---

## 42. [P3174 [HAOI2009] 毛毛虫](https://www.luogu.com.cn/problem/P3174)

`DP` `树形DP` `动态规划 DP` `树形 DP`

### 题意

对于一棵树，我们可以将某条链和与该链相连的边抽出来，看上去就象成一个毛毛虫，点数越多，毛毛虫就越大。例如下图左边的树（图 1）抽出一部分就变成了右边的一个毛毛虫了（图 2）。

### 分析

毛毛虫要求主链尽量长，且沿途还能从分叉中额外获得收益。可以把每个点向下延伸的最优值看成“最长链 + 分叉奖励”，再像直径那样合并。

### 核心代码

```cpp
int down[N], ans;
void dfs(int u, int fa) {
    int best1 = 0, best2 = 0;
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        int cur = down[v] + (deg[v] > 1);
        if (cur > best1) best2 = best1, best1 = cur;
        else best2 = max(best2, cur);
    }
    down[u] = best1;
    ans = max(ans, best1 + best2 + (deg[u] > 1));
}
```

### 复杂度

$O(n)$。

---

## 43. [P3574 [POI 2014] FAR-FarmCraft](https://www.luogu.com.cn/problem/P3574)

`DP` `树形DP` `贪心` `动态规划 DP`

### 题意

在一个叫做比特村的小村庄中，有 n−1 条路连接着这个村庄中的全部 n 个房子。 每两个房子之间都有一条唯一的通路。

### 分析

FarmCraft 要安排访问儿子的顺序，属于“树形 DP + 儿子排序”的经典组合。先求每个儿子子树的耗时特征，再按交换论证导出的关键字排序合并。

### 核心代码

```cpp
void dfs(int u, int fa) {
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        child.push_back({2 * siz[v] - f[v], v});
    }
    sort(child.begin(), child.end());
    for (auto [_, v] : child) f[u] = max(f[u], cur + f[v] + 1), cur += 2 * siz[v];
}
```

### 复杂度

$O(n\log n)$。

---

# 五、高阶结构与综合树形 DP

最后这一组是更综合的树形 DP：有的要把树的经典量与构造结合，有的要在树上维护多条链、多种组合计数，或者把结构压缩、哈希、贪心与 DP 交织在一起。做这类题时，先拆清“状态表达的对象”最关键。

## 44. [P10794 『SpOI - R1』架子鼓可以站 C](https://www.luogu.com.cn/problem/P10794)

`DP` `树形DP` `树形 DP` `树的直径`

### 题意

现在有一棵 n 个点的树，树根是节点 1。 可以对这棵树做任意次站 C 操作，每次站 C 操作为：选择树上的一个叶子结点 x，再选择根节点到 x 路径上的一条边，删除它；然后添加一条连接 x 和根节点的边。

### 分析

允许把叶子重新连到根，本质是在比较“原树两条最长链”和“改造后额外拉长的一条链”之间的最优组合。DP 维护多条候选最长链，再枚举改造落点更新答案。

### 核心代码

```cpp
long long d1[N], d2[N], up[N], ans;

void dfs1(int u, int fa) {
    for (int v : g[u]) if (v != fa) {
        dfs1(v, u);
        long long t = d1[v] + 1;
        if (t > d1[u]) d2[u] = d1[u], d1[u] = t;
        else d2[u] = max(d2[u], t);
    }
}

void dfs2(int u, int fa) {
    ans = max(ans, d1[u] + d2[u] + up[u]);
    for (int v : g[u]) if (v != fa) dfs2(v, u);
}
```

### 复杂度

$O(n)$。

---

## 45. [P5666 [CSP-S 2019] 树的重心](https://www.luogu.com.cn/problem/P5666)

`倍增` `DP` `树上启发式合并` `树形 DP`

### 题意

小简单正在学习离散数学，今天的内容是图论基础，在课上他做了如下两条笔记： 一个大小为 n 的树由 n 个结点与 n−1 条无向边构成，且满足任意两个结点间有且仅有一条简单路径。

### 分析

删去每条边后要分别讨论两侧子树的重心。先预处理子树大小与候选重心，再借助重心沿重儿子单调移动的性质，快速求出分裂后两棵树的重心编号和。

### 核心代码

```cpp
void dfs_siz(int u, int fa) {
    siz[u] = 1;
    for (int v : g[u]) if (v != fa) dfs_siz(v, u), siz[u] += siz[v];
}

int get_centroid(int u, int fa, int all) {
    for (int v : g[u]) if (v != fa && siz[v] * 2 > all) return get_centroid(v, u, all);
    return u;
}
```

### 复杂度

$O(n\log n)$。

---

## 46. [P3647 [APIO2014] 连珠线](https://www.luogu.com.cn/problem/P3647)

`DP` `动态规划 DP` `枚举` `树形 DP`

### 题意

在达芬奇时代，有一个流行的儿童游戏称为连珠线。当然，这个游戏是关于珠子和线的。线是红色或蓝色的，珠子被编号为 1 到 n。

### 分析

连珠线要同时判断“某条边保留为红边”与“在哪个位置切开改成蓝边”两种收益。设 DP 维护当前子树作为一条链时的最优值，再和“在内部已经完成一次插入”的状态做合并。

### 核心代码

```cpp
void dfs(int u, int fa) {
    dp[u][0] = 0;
    for (auto [v, w] : g[u]) if (v != fa) {
        dfs(v, u);
        long long keep = dp[v][0] + red[w];
        long long cut  = best[v] + blue[w];
        best[u] = max(best[u], dp[u][0] + cut);
        dp[u][0] += keep;
    }
}
```

### 复杂度

$O(n)$。

---

## 47. [CF708C Centroids](https://www.luogu.com.cn/problem/CF708C)

`DP` `树形 DP` `树的重心`

### 题意

树 是一种连通的无环图。假设给定一棵由 n 个顶点组成的树。如果移除该顶点后，树中每个连通分量的大小均不超过 2 n ​ ，则该顶点被称为重心。

### 分析

判断一个点能否通过一次换边成为重心，关键是知道每个连通块里是否存在一个足够大的可拆部分。先求每个子树内最大的“安全块”，再结合父侧块判断。

### 核心代码

```cpp
int siz[N], mx[N], best[N];

void dfs1(int u, int fa) {
    siz[u] = 1;
    for (int v : g[u]) if (v != fa) {
        dfs1(v, u);
        siz[u] += siz[v];
        mx[u] = max(mx[u], siz[v]);
        best[u] = max(best[u], best[v]);
    }
    mx[u] = max(mx[u], n - siz[u]);
}
```

### 复杂度

$O(n)$。

---

## 48. [P4657 [CEOI 2017] Chase](https://www.luogu.com.cn/problem/P4657)

`DP` `树形DP` `动态规划 DP` `CEOI（中欧）`

### 题意

在逃亡者的面前有一个迷宫，这个迷宫由 n 个房间和 n−1 条双向走廊构成，每条走廊会链接不同的两个房间，所有的房间都可以通过走廊互相到达。

### 分析

Chase 需要在树上维护多条互相制约的最优链。常见做法是把“经过当前点的最优答案”和“向下延伸的最优答案”拆开，儿子合并时更新全局最优。

### 核心代码

```cpp
void dfs(int u, int fa) {
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        ans = max(ans, best1[u] + best1[v] + w(u, v));
        best1[u] = max(best1[u], best2[v] + w(u, v));
        best2[u] = max(best2[u], best1[v]);
    }
}
```

### 复杂度

$O(n)$。

---

## 49. [P3565 [POI 2014] HOT-Hotels](https://www.luogu.com.cn/problem/P3565)

`DP` `树形DP` `动态规划 DP` `树形 DP`

### 题意

在 Byteotia 有 n 个城镇，通过 n−1 条道路连接。 每条道路直接连接两个城镇。

### 分析

酒店计数要统计满足等距关系的点组三元组。DFS 时按深度维护点数和点对数，逐个把儿子并到当前点，就能在线性或线性对数时间内完成计数。

### 核心代码

```cpp
void dfs(int u, int fa) {
    cnt[u][0] = 1;
    for (int v : g[u]) if (v != fa) {
        dfs(v, u);
        for (int i = 0; i <= dep[v]; i++) ans += 1LL * cnt[u][i + 1] * pair_cnt[v][i];
        for (int i = 0; i <= dep[v]; i++) pair_cnt[u][i + 1] += pair_cnt[v][i] + cnt[u][i + 1] * cnt[v][i];
        for (int i = 0; i <= dep[v]; i++) cnt[u][i + 1] += cnt[v][i];
    }
}
```

### 复杂度

$O(n^2)$ 或结合优化做到 $O(n\log n)$。

---

## 50. [P3237 [HNOI2014] 米特运输](https://www.luogu.com.cn/problem/P3237)

`DP` `树形DP` `数学` `树形 DP`

### 题意

米特是 D 星球上一种非常神秘的物质，蕴含着巨大的能量。在以米特为主要能源的 D 星上，这种米特能源的运输和储存一直是一个大问题。

### 分析

米特运输这类“结构是否相同”的题，常见套路是对子树做哈希，再把相同结构压成同类状态。DP 的重点是先把结构判同，再在同类结构上做最优转移。

### 核心代码

```cpp
unsigned long long hs[N];

void dfs(int u, int fa) {
    vector<unsigned long long> child;
    for (int v : g[u]) if (v != fa) dfs(v, u), child.push_back(hs[v]);
    sort(child.begin(), child.end());
    hs[u] = 146527;
    for (auto x : child) hs[u] = hs[u] * 19260817ull ^ (x + 998244353ull);
}
```

### 复杂度

$O(n\log n)$。

---

## 51. [P12007 【MX-X10-T3】[LSOT-4] 全国联赛？](https://www.luogu.com.cn/problem/P12007)

`DP` `树形DP` `贪心` `树论`

### 题意

北宇治的吹奏部一共有 n 个学生，学生的编号为 1 到 n。在泷昇到来之前已经建立了 m 对配合关系（0≤m≤n−1），每对配合关系 u,v,w 表示在 u 或 v 演奏后另一人能在 w 单位的时间后立刻演奏完成配合。

### 分析

围绕重心做构造时，很多全局最优都能化成“先找到最平衡的中心，再在不同子树间贪心分配”。因此先用重心 / 子树大小把树结构稳定下来，再做后续安排。

### 核心代码

```cpp
int dfs(int u, int fa) {
    siz[u] = 1;
    for (int v : g[u]) if (v != fa) siz[u] += dfs(v, u);
    return siz[u];
}

int get_centroid(int u, int fa, int all) {
    for (int v : g[u]) if (v != fa && siz[v] * 2 > all) return get_centroid(v, u, all);
    return u;
}
```

### 复杂度

$O(n)$。

---
