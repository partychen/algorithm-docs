---
title: "CSES 高阶技巧专题精选解题报告"
subtitle: "⚙️ 从折半搜索到离线连通、DP 优化与费用流建模的技巧主线"
order: 7
icon: "🛠️"
---

# CSES 高阶技巧专题精选解题报告

这一组题从折半搜索一路走到费用流与离线连通，真正考的不是某个模板背得多熟，而是你能不能在原模型卡住时及时换坐标系：指数状态切一半，动态图倒着做，路径问题翻成流，DP 转成一组可查询的直线。

# 一、复杂度转身：折半、位压与位集交

这几题的共同点是原始枚举太大，但状态本身很薄。把集合切成两半、把整行压进 bitset，或者把出现位置改写成列对，复杂度就会突然从不可做掉到可做。

## 1. [Meet in the Middle](https://cses.fi/problemset/task/1628)

`折半搜索` `子集和`

### 题意

给定一个数组和目标和 $x$，询问有多少个子集的元素和恰好等于 $x$。

### 分析

$n$ 到 $40$ 时，直接枚举全部子集要跑到 $2^{40}$，肯定不行；但切成两半后，每边只需枚举 $2^{20}$ 级别，就已经能落到可接受范围。

具体做法是分别列出左右两半所有子集和，把右半部分排序。对于左半的每个和 $s$，去右半中二分统计有多少个值等于 $x-s$，全部累加就是答案。

### 核心代码

```cpp
void gen(int l, int r, vector<long long>& v){
    int m = r - l;
    for(int mask = 0; mask < (1 << m); ++mask){
        long long s = 0;
        for(int i = 0; i < m; ++i) if(mask >> i & 1) s += a[l + i];
        if(s <= x) v.push_back(s);
    }
}
gen(0, m, L); gen(m, n, R); sort(R.begin(), R.end());
for(long long s : L){ auto rg = equal_range(R.begin(), R.end(), x - s); ans += rg.second - rg.first; }
```

### 复杂度

时间复杂度 $O(2^{n/2}\cdot n)$，排序后查询部分是 $O(2^{n/2}\log 2^{n/2})$，空间复杂度 $O(2^{n/2})$。

---

## 2. [Hamming Distance](https://cses.fi/problemset/task/2136)

`位压缩` `汉明距离`

### 题意

给定若干长度相同的二进制串，求两串之间最小的汉明距离。

### 分析

关键条件是串长 $k\le 30$，所以每个串都能直接压成一个 `int`。两串的汉明距离就是异或后 `popcount` 的结果，求最小值时不需要更复杂的数据结构。

这题的技巧点不在于神奇优化，而在于看懂“位数很短”这个信号。把字符串处理成本位运算后，$O(n^2)$ 枚举两两比较的常数会非常小。

### 核心代码

```cpp
int ans = k;
for(int i = 0; i < n; ++i){
    for(int j = i + 1; j < n; ++j) ans = min(ans, __builtin_popcount(mask[i] ^ mask[j]));
    if(ans == 1) break;
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

---

## 3. [Corner Subgrid Check](https://cses.fi/problemset/task/3360)

`位集` `重轻分治`

### 题意

给定一个字母网格，对每个字母判断是否存在一个四个角都等于它的子矩形。

### 分析

若某个字母在两行的共同出现列数至少为 $2$，这两行就能组成一个合法矩形。直接枚举行对会太慢，于是要改成“按字母、按每行出现列”处理。

一种实用做法是重轻分治：轻行枚举列对并用哈希记是否见过；重行则把出现位置做成 bitset，与所有行按位与统计共同列数。两种方法分别吃掉稀疏和稠密情况。

### 核心代码

```cpp
for(int c = 0; c < k; ++c){
    unordered_set<long long> seen;
    for(int r = 0; r < n && !ok[c]; ++r) if((int)pos[c][r].size() <= B)
        for(int i = 0; i < (int)pos[c][r].size(); ++i)
            for(int j = i + 1; j < (int)pos[c][r].size(); ++j){
                long long key = 1LL * pos[c][r][i] * n + pos[c][r][j];
                if(!seen.insert(key).second) ok[c] = 1;
            }
    for(int r : heavy[c]) for(int s = 0; s < n && !ok[c]; ++s)
        if(r != s && (bits[c][r] & bits[c][s]).count() >= 2) ok[c] = 1;
}
```

### 复杂度

重轻分治后总时间复杂度约为 $O(kn\sqrt n + k\cdot n^2 / 64)$，空间复杂度 $O(kn^2 / 64)$。

---

## 4. [Corner Subgrid Count](https://cses.fi/problemset/task/2137)

`位集` `矩形计数`

### 题意

给定黑白网格，统计四个角都是黑色的子矩形数量。

### 分析

固定两行之后，若这两行在某些列上同时为黑，那么任选其中两列就得到一个合法矩形。因此答案就是对每对行求共同黑列数 $c$，累加 $\binom{c}{2}$。

位集正好适合干这件事：每一行压成 bitset，两行按位与后数一下 `1` 的个数即可。位运算把一整段列同时处理掉，常数很小。

### 核心代码

```cpp
long long ans = 0;
for(int i = 0; i < n; ++i)
    for(int j = i + 1; j < n; ++j){
        long long c = (row[i] & row[j]).count();
        ans += c * (c - 1) / 2;
    }
```

### 复杂度

时间复杂度 $O(n^2\cdot n/64)$，空间复杂度 $O(n^2/64)$。

---

# 二、序列即平衡树：隐式 Treap 的切分与翻转

字符串和数组上的区间剪切、翻转、求和，本质上都可以看成一棵按位置中序展开的平衡树。只要会 split / merge，很多“改一段顺序”的操作就成了拼积木。

## 5. [Cut and Paste](https://cses.fi/problemset/task/2072)

`隐式 Treap` `区间剪切`

### 题意

字符串支持多次把子串 $[a,b]$ 剪下来并粘到末尾，求最终字符串。

### 分析

操作按位置切子串，天然适合用隐式平衡树维护中序序列。每个字符是一个节点，按子树大小而不是键值来 split。

一次操作只需把整棵树切成三段：前缀、目标子串、后缀。然后按“前缀 + 后缀 + 目标子串”的顺序重新 merge，整个过程都是对数级。

### 核心代码

```cpp
split(rt, a - 1, x, y);
split(y, b - a + 1, y, z);
rt = merge(x, z);
rt = merge(rt, y);
```

### 复杂度

单次操作时间复杂度 $O(\log n)$，总空间复杂度 $O(n)$。

---

## 6. [Substring Reversals](https://cses.fi/problemset/task/2073)

`隐式 Treap` `区间翻转`

### 题意

字符串支持多次把子串 $[a,b]$ 反转，求最终字符串。

### 分析

反转一段子串时，真正需要变化的是这段区间在平衡树里的左右儿子顺序。隐式 Treap 只要多加一个 `rev` 懒标记，就能延迟完成这件事。

操作流程仍然是三次 split：把目标子串单独切出来，给它打一个 `rev` 标记，再原样拼回去。最终中序遍历整棵树，就是答案字符串。

### 核心代码

```cpp
void push(Node* t){
    if(!t || !t->rev) return;
    swap(t->l, t->r);
    if(t->l) t->l->rev ^= 1;
    if(t->r) t->r->rev ^= 1;
    t->rev = 0;
}
split(rt, a - 1, x, y); split(y, b - a + 1, y, z);
y->rev ^= 1; rt = merge(x, merge(y, z));
```

### 复杂度

单次操作时间复杂度 $O(\log n)$，总空间复杂度 $O(n)$。

---

## 7. [Reversals and Sums](https://cses.fi/problemset/task/2074)

`隐式 Treap` `区间求和`

### 题意

数组支持区间翻转和区间求和两类操作。

### 分析

这题是在上一题的隐式 Treap 上再补一个“子树和”。因为翻转不会改变一段区间的元素集合，所以 `sum` 只要在旋转、合并后重新 `pull` 即可。

处理查询时同样先把 $[a,b]$ 切成独立子树。若是翻转就打标记，若是求和就直接读取该子树维护的 `sum`。区间信息和序列形态因此同时被维护住了。

### 核心代码

```cpp
void pull(Node* t){
    t->sz = sz(t->l) + sz(t->r) + 1;
    t->sum = sum(t->l) + sum(t->r) + t->v;
}
split(rt, a - 1, x, y); split(y, b - a + 1, y, z);
if(tp == 1) y->rev ^= 1; else ans = y->sum;
rt = merge(x, merge(y, z));
```

### 复杂度

单次操作时间复杂度 $O(\log n)$，总空间复杂度 $O(n)$。

---

# 三、图结构压缩：从割点桥到离线连通

图题里最常见的高阶动作，就是先把原图压成更干净的结构再做询问。强连通缩点、桥和割点判定、并查集回滚、Kruskal 重构树，都是在帮我们把“变化中的图”变成“可批量处理的树或 DAG”。

## 8. [Reachable Nodes](https://cses.fi/problemset/task/2138)

`DAG` `位集 DP`

### 题意

给定一张有向无环图，求每个点能够到达多少个点，计入自身。

### 分析

在 DAG 上，某个点能到达的集合等于它所有后继可达集合的并，再加上自己。由于点数较大，直接做集合并需要位集来压缩。

先拓扑排序，再按逆拓扑序转移。处理到点 $u$ 时，所有出边终点的答案都已经准备好，直接把这些 bitset 逐个或起来，最后给自己那一位打上标记即可。

### 核心代码

```cpp
for(int u : revTopo){
    reach[u][u] = 1;
    for(int v : g[u]) reach[u] |= reach[v];
    ans[u] = reach[u].count();
}
```

### 复杂度

时间复杂度 $O((n+m)\cdot n/64)$，空间复杂度 $O(n^2/64)$。

---

## 9. [Reachability Queries](https://cses.fi/problemset/task/2143)

`强连通分量` `缩点 DAG`

### 题意

给定有向图，多次询问能否从点 $a$ 到达点 $b$。

### 分析

原图里若存在环，直接做传递闭包会非常乱。先把强连通分量缩成一个 DAG，图结构就干净了：同一 SCC 内任意两点互达，不同 SCC 之间只剩单向关系。

之后问题就变成 DAG 上的可达性批量询问。和上一题一样，逆拓扑序做 bitset 闭包，最后只需检查 `can[comp[a]][comp[b]]` 是否为真。

### 核心代码

```cpp
for(int u = 1; u <= n; ++u)
    for(int v : g[u]) if(comp[u] != comp[v]) dag[comp[u]].push_back(comp[v]);
for(int c : revTopo){
    can[c][c] = 1;
    for(int v : dag[c]) can[c] |= can[v];
}
```

### 复杂度

缩点后预处理时间复杂度 $O((n+m)\cdot C/64)$，单次查询时间复杂度 $O(1)$，空间复杂度 $O(C^2/64)$，其中 $C$ 是 SCC 数。

---

## 10. [Necessary Roads](https://cses.fi/problemset/task/2076)

`Tarjan` `桥`

### 题意

给定一张连通无向图，找出所有删掉后会让图不再连通的边。

### 分析

这就是桥的标准定义。DFS 树中若一条树边 $(u,v)$ 满足 `low[v] > dfn[u]`，说明从 $v$ 子树无法通过返祖边回到 $u$ 及其祖先，删掉它图就会断开。

因此整题只要老老实实跑一遍 Tarjan。注意无向图里要靠边编号区分“父边”和普通返祖边，不能简单用父节点判断。

### 核心代码

```cpp
void dfs(int u, int pe){
    dfn[u] = low[u] = ++ti;
    for(auto [v, id] : g[u]){
        if(id == pe) continue;
        if(!dfn[v]){
            dfs(v, id); low[u] = min(low[u], low[v]);
            if(low[v] > dfn[u]) bridge.push_back({u, v});
        }else low[u] = min(low[u], dfn[v]);
    }
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 11. [Necessary Cities](https://cses.fi/problemset/task/2077)

`Tarjan` `割点`

### 题意

给定一张连通无向图，找出所有删掉后会让其他城市之间失去连通性的点。

### 分析

割点和桥的判定几乎一脉相承。对于非根节点 $u$，若存在儿子 $v$ 使得 `low[v] >= dfn[u]`，说明 $v$ 子树无法绕过 $u$ 回到更高处，$u$ 就是割点。

唯一的特殊情况是 DFS 根：它必须拥有至少两个独立子树才是割点。把这个根特判加上，整题也是一次 Tarjan 扫描。

### 核心代码

```cpp
void dfs(int u, int p){
    dfn[u] = low[u] = ++ti; int child = 0;
    for(int v : g[u]){
        if(v == p) continue;
        if(!dfn[v]){
            dfs(v, u); low[u] = min(low[u], low[v]); ++child;
            if(p && low[v] >= dfn[u]) cut[u] = 1;
        }else low[u] = min(low[u], dfn[v]);
    }
    if(!p && child > 1) cut[u] = 1;
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 12. [Eulerian Subgraphs](https://cses.fi/problemset/task/2078)

`图论计数` `GF(2)`

### 题意

统计原图的欧拉子图个数，要求所有点度数都是偶数。

### 分析

选哪些边构成欧拉子图，本质是在求一个线性方程组 $Ax=0$ 的解数，其中每个点对应“ incident 边度数为偶数”的一条模 $2$ 方程。

对无向图来说，这个方程组的秩是 $n-c$，其中 $c$ 是连通块数。因此自由变量有 $m-(n-c)$ 个，答案直接就是 $2^{m-n+c}$。题目瞬间从图搜索变成了一个秩公式。

### 核心代码

```cpp
for(auto [u, v] : edges) dsu.unite(u, v);
int c = 0;
for(int i = 1; i <= n; ++i) c += dsu.find(i) == i;
long long ans = qpow(2, m - n + c);
```

### 复杂度

并查集统计连通块后，时间复杂度 $O((n+m)\alpha(n))$，空间复杂度 $O(n)$。

---

## 13. [New Roads Queries](https://cses.fi/problemset/task/2101)

`Kruskal 重构树` `LCA`

### 题意

道路按天逐条加入，多次询问两座城市最早在第几天第一次连通。

### 分析

若按加入顺序做并查集，每次合并两个连通块时新建一个父节点，权值记为当天编号，就得到一棵 Kruskal 重构树。树上一个原始点到根的路径，正是在记录它所属连通块的成长历史。

两点第一次连通，恰好发生在它们所在连通块第一次合并到一起的时候，也就是它们在重构树上的 LCA。若最后仍不在同一并查集内，答案就是 $-1$。

### 核心代码

```cpp
for(int day = 1; day <= m; ++day){
    auto [u, v] = e[day]; u = root(u); v = root(v);
    if(u == v) continue;
    val[++tot] = day; ch[tot][0] = u; ch[tot][1] = v;
    fa[u] = fa[v] = tot; unite(tot, u, v);
}
int ask(int u, int v){
    if(find(u) != find(v)) return -1;
    return val[lca(u, v)];
}
```

### 复杂度

建树与并查集时间复杂度 $O(m\alpha(n))$，预处理 LCA 时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(\log n)$。

---

## 14. [Dynamic Connectivity](https://cses.fi/problemset/task/2133)

`并查集回滚` `时间线段树`

### 题意

无向图支持加边和删边，要求输出初始状态以及每次事件后的连通块数量。

### 分析

动态删边最难在线处理，但离线以后，每条边都对应一个“存在时间区间”。把这段活跃区间丢到时间线段树上，再在树上 DFS，就能把同一时段内始终存在的边一次性加入。

由于递归进入和退出节点时都要撤销并查集操作，所以并查集必须支持回滚。进入线段树节点时合并该节点的所有边，叶子处记录当前连通块数，回溯时退回之前的状态。

### 核心代码

```cpp
void addSeg(int x, int l, int r, int L, int R, Edge e){
    if(L <= l && r <= R){ seg[x].push_back(e); return; }
    int m = (l + r) >> 1;
    if(L <= m) addSeg(x << 1, l, m, L, R, e);
    if(R > m) addSeg(x << 1 | 1, m + 1, r, L, R, e);
}
void dfs(int x, int l, int r){
    int snap = dsu.snap();
    for(auto [u, v] : seg[x]) dsu.unite(u, v);
    if(l == r) ans[l] = dsu.cc;
    else{ int m = (l + r) >> 1; dfs(x << 1, l, m); dfs(x << 1 | 1, m + 1, r); }
    dsu.rollback(snap);
}
```

### 复杂度

总时间复杂度 $O((m+k)\log k\cdot\alpha(n))$，空间复杂度 $O((m+k)\log k)$。

---

# 四、DP 优化：直线集合与单调决策

当转移写成 $dp_j + A_iB_j$ 或连续区间划分时，朴素枚举常常只差一步就能被优化掉。斜率优化负责处理直线最值，分治优化和 Knuth 优化负责处理决策单调。

## 15. [Monster Game I](https://cses.fi/problemset/task/2084)

`斜率优化` `单调队列`

### 题意

按关卡顺序前进，击杀怪物会花费 $s_i\cdot f$ 时间并把技能因子变成新的 $f_i$，要求最小总时间。

### 分析

设 `dp[i]` 表示最后一次击杀的是第 $i$ 个怪物时的最小代价，则转移形如 $dp[i]=\min_j\{dp[j]+s_i\cdot f_j\}$，其中 $j=0$ 表示沿用初始技能因子。这个式子正是“在 $x=s_i$ 处查询若干直线最小值”。

本题特别友好的地方是 $s_i$ 单调不减、$f_i$ 单调不增，插入直线斜率和查询横坐标都有序，因此可以用单调队列维护下凸壳，把斜率优化做到纯 $O(n)$。

### 核心代码

```cpp
struct Line{ long long m, b; long long f(long long x){ return m * x + b; } };
bool bad(Line a, Line b, Line c){ return (b.b - a.b) * (a.m - c.m) >= (c.b - a.b) * (a.m - b.m); }
deque<Line> q{{x, 0}};
for(int i = 1; i <= n; ++i){
    while(q.size() > 1 && q[0].f(s[i]) >= q[1].f(s[i])) q.pop_front();
    dp[i] = q[0].f(s[i]);
    Line cur{f[i], dp[i]};
    while(q.size() > 1 && bad(q[q.size() - 2], q.back(), cur)) q.pop_back();
    q.push_back(cur);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 16. [Monster Game II](https://cses.fi/problemset/task/2085)

`李超线段树` `斜率优化`

### 题意

与上一题类似，但参数不再具备单调性，仍要求最小总时间。

### 分析

转移式仍然是查询直线最小值，但这次怪物强度和新的技能因子都不单调，单调队列维护的凸壳条件彻底失效。

解决办法是换成 Li Chao Tree。它不要求插入顺序和查询顺序有序，只要横坐标范围已知，就能在值域上维护每个区间当前更优的直线。每插入一条新线或查询一个 $s_i$ 都是 $O(\log X)$。

### 核心代码

```cpp
struct Line{ long long m, b; long long f(long long x){ return m * x + b; } };
void add(Line nw, int &p, int l, int r){
    if(!p){ p = ++tot; tr[p].ln = nw; return; }
    int m = (l + r) >> 1;
    bool lef = nw.f(l) < tr[p].ln.f(l), mid = nw.f(m) < tr[p].ln.f(m);
    if(mid) swap(nw, tr[p].ln);
    if(l == r) return;
    if(lef != mid) add(nw, tr[p].lc, l, m); else add(nw, tr[p].rc, m + 1, r);
}
```

### 复杂度

时间复杂度 $O(n\log X)$，空间复杂度 $O(n\log X)$。

---

## 17. [Subarray Squares](https://cses.fi/problemset/task/2086)

`DP 优化` `斜率优化`

### 题意

把数组分成 $k$ 段，每段代价是该段元素和的平方，要求总代价最小。

### 分析

设前缀和为 $pre$，转移为 $dp[t][i]=\min_j\{dp[t-1][j]+(pre_i-pre_j)^2\}$。把平方展开后，可以改写成 $pre_i^2+\min_j\{dp[t-1][j]+pre_j^2-2pre_i pre_j\}$。

这已经变成对横坐标 $pre_i$ 查询直线最小值的问题：每个 $j$ 贡献一条斜率 $-2pre_j$ 的直线。因为原数组元素为正，前缀和单调递增，所以每一层 DP 都能用凸包优化。

### 核心代码

```cpp
for(int t = 1; t <= k; ++t){
    hull.clear();
    hull.add({-2 * pre[0], dp[t - 1][0] + pre[0] * pre[0]});
    for(int i = 1; i <= n; ++i){
        dp[t][i] = pre[i] * pre[i] + hull.query(pre[i]);
        hull.add({-2 * pre[i], dp[t - 1][i] + pre[i] * pre[i]});
    }
}
```

### 复杂度

用凸包优化后时间复杂度 $O(kn)$，空间复杂度 $O(n)$。

---

## 18. [Houses and Schools](https://cses.fi/problemset/task/2087)

`分治优化` `区间 DP`

### 题意

在一条街上建 $k$ 所学校，让每个孩子去最近的学校，求总步行距离最小值。

### 分析

若一段连续房屋共用一所学校，最优校址一定在这段房屋的带权中位数位置。先用前缀和预处理任意区间由一所学校服务的代价，问题就变成标准分段 DP。

由于这个代价函数满足四边形不等式，最优决策点具有单调性，所以可以对每层 DP 用分治优化。于是原本的 $O(kn^2)$ 转移可以压到 $O(kn\log n)$。

### 核心代码

```cpp
long long cost(int l, int r){
    int m = mid[l][r];
    return 1LL * m * (w[m] - w[l - 1]) - (wx[m] - wx[l - 1]) + (wx[r] - wx[m]) - 1LL * m * (w[r] - w[m]);
}
void solve(int t, int l, int r, int optL, int optR){
    int m = (l + r) >> 1, best = -1; dp[t][m] = INF;
    for(int j = optL; j <= min(m - 1, optR); ++j){
        long long v = dp[t - 1][j] + cost(j + 1, m);
        if(v < dp[t][m]) dp[t][m] = v, best = j;
    }
    if(l < m) solve(t, l, m - 1, optL, best);
    if(m < r) solve(t, m + 1, r, best, optR);
}
```

### 复杂度

预处理区间代价后，总时间复杂度 $O(kn\log n)$，空间复杂度 $O(kn)$。

---

## 19. [Knuth Division](https://cses.fi/problemset/task/2088)

`Knuth 优化` `区间 DP`

### 题意

反复把一个区间切成两段，每次代价等于被切区间元素和，求把数组切到单元素的最小总代价。

### 分析

这题和最优合并类似，但切分必须保持原顺序，因此状态是区间 DP：$dp[l][r]=sum(l,r)+\min_k\{dp[l][k]+dp[k+1][r]\}$。

直接枚举断点会是 $O(n^3)$。好在这个代价函数满足 Knuth 优化所需的单调性，最优断点 `opt[l][r]` 会落在 `opt[l][r-1]` 到 `opt[l+1][r]` 之间，枚举范围被大幅缩小。

### 核心代码

```cpp
for(int i = 1; i <= n; ++i) dp[i][i] = 0, opt[i][i] = i;
for(int len = 2; len <= n; ++len)
    for(int l = 1, r = l + len - 1; r <= n; ++l, ++r){
        dp[l][r] = INF;
        for(int k = opt[l][r - 1]; k <= opt[l + 1][r]; ++k){
            long long v = dp[l][k] + dp[k + 1][r] + pre[r] - pre[l - 1];
            if(v < dp[l][r]) dp[l][r] = v, opt[l][r] = k;
        }
    }
```

### 复杂度

Knuth 优化后时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

# 五、全局建模：卷积与费用流

最后一章的题表面最分散：有的在数距离，有的在搬包裹，有的在给员工派任务。但它们都要求你把局部选择提升成全局模型：序列变成卷积，路径和匹配变成最小费用流。

## 20. [Apples and Bananas](https://cses.fi/problemset/task/2111)

`卷积` `FFT`

### 题意

统计苹果和香蕉各取一个时，重量和为每个 $w\in[2,2k]$ 的方案数。

### 分析

只关心重量，不关心个体身份时，先统计每种重量出现多少次。若苹果频率数组为 $A$、香蕉频率数组为 $B$，那么重量和为 $w$ 的方案数就是卷积 $(A*B)_w$。

于是整题直接变成多项式乘法。用 FFT 或 NTT 做一次卷积，把下标 $2$ 到 $2k$ 的系数输出即可。

### 核心代码

```cpp
for(int x : apples) A[x]++;
for(int x : bananas) B[x]++;
auto C = convolution(A, B);
for(int w = 2; w <= 2 * k; ++w) cout << llround(C[w]) << ' ';
```

### 复杂度

时间复杂度 $O(k\log k)$，空间复杂度 $O(k)$。

---

## 21. [One Bit Positions](https://cses.fi/problemset/task/2112)

`卷积` `自相关`

### 题意

给定一个二进制串，对每个距离 $k$ 统计相距恰好为 $k$ 的两个 $1$ 有多少对。

### 分析

若把 $1$ 的位置看成指示数组 $A$，那么相距 $k$ 的一对 $1$，正好对应 $A_i$ 与 $A_{i+k}$ 同时为 $1$。这就是典型的自相关问题。

把一个数组反转后做卷积，卷积结果的某个系数就对应某个距离的匹配数。具体地，距离 $k$ 的答案落在下标 $n-1-k$ 的位置。

### 核心代码

```cpp
for(int i = 0; i < n; ++i) if(s[i] == '1') A[i] = B[n - 1 - i] = 1;
auto C = convolution(A, B);
for(int k = 1; k < n; ++k) cout << llround(C[n - 1 - k]) << ' ';
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 22. [Signal Processing](https://cses.fi/problemset/task/2113)

`卷积` `互相关`

### 题意

把一个掩码从左到右滑过信号，要求输出每个位置上重叠部分的乘积和。

### 分析

这正是序列互相关。若直接滑动窗口，复杂度会是 $O(nm)$；但把掩码反转后，与信号做卷积，卷积系数就恰好对应每个对齐位置的乘积和。

所以本题和上一题的差别只在“两个数组都不是 $0/1$”，本质仍然是一次 FFT/NTT 的多项式乘法。

### 核心代码

```cpp
reverse(mask.begin(), mask.end());
auto C = convolution(signal, mask);
for(int i = 0; i < n + m - 1; ++i) cout << llround(C[i]) << ' ';
```

### 复杂度

时间复杂度 $O((n+m)\log (n+m))$，空间复杂度 $O(n+m)$。

---

## 23. [Parcel Delivery](https://cses.fi/problemset/task/2121)

`最小费用流` `容量限制`

### 题意

在有容量和单位费用的有向图上，从 $1$ 到 $n$ 发送恰好 $k$ 个包裹，求最小总费用。

### 分析

每条路线有容量限制和单件费用，这正是最小费用最大流的原始模型。把每条边看成容量为 $r$、费用为 $c$ 的网络边，从源点向汇点送出 $k$ 单位流即可。

如果最大流量不足 $k$，说明不存在可行运输方案；否则最小费用流算法求出的总代价就是答案。由于 $k$ 不大，用势能优化的最短路增广完全够用。

### 核心代码

```cpp
addEdge(S, 1, k, 0); addEdge(n, T, k, 0);
for(auto [u, v, r, c] : edges) addEdge(u, v, r, c);
auto [flow, cost] = minCostMaxFlow(S, T, k);
if(flow < k) cout << -1;
else cout << cost;
```

### 复杂度

时间复杂度与增广次数和最短路复杂度有关，常写作 $O(km\log n)$，空间复杂度 $O(m)$。

---

## 24. [Task Assignment](https://cses.fi/problemset/task/2129)

`二分图匹配` `最小费用流`

### 题意

给定员工执行每个任务的费用，要求做出一个最小总代价的一一分配方案。

### 分析

这是标准的带权二分图完美匹配。把员工放左边、任务放右边，边费用就是分配代价，每个点容量都是 $1$，从源到汇跑一遍最小费用最大流即可。

流量跑满 $n$ 后，总费用就是最优值；再检查员工到任务的边中哪些被用满，就能恢复具体分配方案。

### 核心代码

```cpp
for(int i = 1; i <= n; ++i) addEdge(S, i, 1, 0), addEdge(n + i, T, 1, 0);
for(int i = 1; i <= n; ++i)
    for(int j = 1; j <= n; ++j) addEdge(i, n + j, 1, cost[i][j]);
minCostMaxFlow(S, T, n);
for(int i = 1; i <= n; ++i)
    for(auto &e : g[i]) if(n < e.to && e.to <= 2 * n && e.cap == 0) ans.push_back({i, e.to - n});
```

### 复杂度

时间复杂度与最小费用流实现有关，常用实现约为 $O(n^3\log n)$，空间复杂度 $O(n^2)$。

---

## 25. [Distinct Routes II](https://cses.fi/problemset/task/2130)

`最小费用流` `边不相交路径`

### 题意

在有向图中找恰好 $k$ 条从 $1$ 到 $n$ 的路径，每条边最多使用一次，并使总经过边数最少。

### 分析

“每条边最多一次”就是容量为 $1$；“每经过一条边付一枚硬币”就是费用为 $1$。于是问题直接落成：从 $1$ 到 $n$ 发送 $k$ 单位流，求最小费用。

若最小费用流跑不满 $k$，说明不存在这样的 $k$ 天路线。否则得到的单位流在边容量为 $1$ 的约束下天然分解成 $k$ 条边不相交路径，再沿着被使用的边 DFS 提取即可。

### 核心代码

```cpp
for(auto [u, v] : edges) addEdge(u, v, 1, 1);
auto [flow, cost] = minCostMaxFlow(1, n, k);
if(flow < k) cout << -1;
else{
    cout << cost << '\n';
    for(int i = 0; i < k; ++i) path.clear(), dfs_used(1, path), print(path);
}
```

### 复杂度

最小费用流部分时间复杂度约为 $O(km\log n)$，路径提取总时间复杂度 $O(km)$，空间复杂度 $O(m)$。
