---
title: "CSES 树算法专题精选解题报告"
subtitle: "🌲 从子树统计到树剖、点分治的树论主线"
order: 5
icon: "🌲"
---

# CSES 树算法专题精选解题报告

这一组题从公司层级里的子树统计一路走到点分治计数，表面上有祖先查询、路径贡献、动态维护、颜色合并等不同外衣，核心始终是把树上关系落成可累加、可跳跃或可分解的信息。前半段先把 DFS 汇总、最远路与换根手感打牢，后半段再进入 LCA、欧拉序、树剖和点分治。

# 一、先把树看清：子树、最远路与重心

这一章先练最基础的树上观察力：哪些量可以直接靠一遍 DFS 汇总，哪些最远路信息其实只和少数关键点有关，哪些“平衡位置”能由子树规模反推出。把这些直觉立起来，后面的换根、查询和分治才会顺。

## 1. [Subordinates](https://cses.fi/problemset/task/1674)

`DFS` `子树大小`

### 题意

给定一棵以 $1$ 号员工为总经理的公司层级树。对每个员工，求他的下属总数，也就是他的整棵子树里除自己外还有多少节点。

### 分析

这题几乎就是“子树大小”最直接的一次落地。既然输入给出的就是每个员工的直属上司，那么树天然已经按根定向好了：从上司连向下属即可。

设 `sz[u]` 表示以 `u` 为根的子树节点数，那么 `u` 的下属数就是 `sz[u]-1`。做一遍后序 DFS，把所有孩子的子树大小加回来，最后统一减掉自己即可。

### 核心代码

```cpp
vector<int> g[N];
int sz[N];
void dfs(int u){
  sz[u] = 1;
  for(int v : g[u]){
    dfs(v);
    sz[u] += sz[v];
  }
}
// answer[u] = sz[u] - 1;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 2. [Tree Diameter](https://cses.fi/problemset/task/1131)

`树的直径` `DFS`

### 题意

给一棵无权树，求树上两点间最远距离，也就是树的直径长度。

### 分析

无权树的直径有个很好用的性质：从任意点出发跑一遍 DFS 或 BFS，走到的最远点一定是某条直径的端点；再从这个端点出发跑第二遍，得到的最远距离就是直径。

这里不需要设计复杂状态，因为题目只问一个全局最远路。真正关键的是把“最远路会落在端点上”这个性质认出来，于是两次搜索就把问题压平了。

### 核心代码

```cpp
int bestNode, bestDist;
void dfs(int u, int p, int d){
  if(d > bestDist) bestDist = d, bestNode = u;
  for(int v : g[u]) if(v != p) dfs(v, u, d + 1);
}
bestDist = -1; dfs(1, 0, 0);
int a = bestNode;
bestDist = -1; dfs(a, 0, 0);
int diameter = bestDist;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 3. [Tree Distances I](https://cses.fi/problemset/task/1132)

`树的直径` `最远点`

### 题意

对树上的每个点，求它到其他所有点中的最远距离。

### 分析

如果对每个点都单独跑一遍 DFS，显然会超时。这题要抓住的还是直径端点：对任意节点 `u`，离它最远的点一定是某条直径的一个端点。于是只要求出一条直径的两个端点 `a,b`，再分别计算 `dist(a,u)` 和 `dist(b,u)`。

最终答案就是 `max(dist(a,u), dist(b,u))`。因为 `u` 的最远点不可能跑到这两个端点之外，所以整题被压成三次树上遍历：先找端点，再从两个端点各跑一遍距离。

### 核心代码

```cpp
int da[N], db[N];
void dfs_dist(int u, int p, int d, int dis[]){
  dis[u] = d;
  for(int v : g[u]) if(v != p) dfs_dist(v, u, d + 1, dis);
}
int a = farthest(1), b = farthest(a);
dfs_dist(a, 0, 0, da);
dfs_dist(b, 0, 0, db);
for(int u = 1; u <= n; u++) ans[u] = max(da[u], db[u]);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 4. [Finding a Centroid](https://cses.fi/problemset/task/2079)

`树的重心` `DFS`

### 题意

给一棵树，要求找出一个重心：把它当作根后，每棵子树的节点数都不超过 $\lfloor n/2 \rfloor$。

### 分析

先随便把树根定在 $1$，求出所有子树大小。若当前节点 `u` 存在某个孩子 `v` 满足 `sz[v] > n/2`，说明真正的重心一定还在这棵过大的子树里，因为只要留在 `u`，这一块就永远压不进一半。

于是从根开始不断往“过半”的那个孩子走，直到不存在这样的孩子为止，当前位置就是一个合法重心。这个过程本质上是在利用重心定义里的“最大连通块不超过一半”。

### 核心代码

```cpp
int sz[N];
void getsz(int u, int p){
  sz[u] = 1;
  for(int v : g[u]) if(v != p){
    getsz(v, u);
    sz[u] += sz[v];
  }
}
int find_centroid(int u, int p){
  for(int v : g[u]) if(v != p && sz[v] > n / 2)
    return find_centroid(v, u);
  return u;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

# 二、信息会流动：换根 DP、匹配与颜色合并

这一章开始处理“答案不只在一个局部里”的情况。有的题需要把根从父亲推到儿子，有的题要在子树之间做最优取舍，有的题则要把不同子树里的信息合并成一个整体，手感明显比纯 DFS 再深一层。

## 5. [Tree Distances II](https://cses.fi/problemset/task/1133)

`换根 DP` `树上距离和`

### 题意

对树上的每个点，求它到所有其他点的距离之和。

### 分析

直接对每个点做一遍搜索是 $O(n^2)$，但距离和这种量非常适合换根。先以 $1$ 为根，做第一遍 DFS：求出每个子树大小 `sz[u]`，同时把根到所有点的深度和记成 `ans[1]`。

接着考虑把根从 `u` 挪到儿子 `v`。`v` 子树里的 `sz[v]` 个点都会离新根更近 $1$，其余 `n-sz[v]` 个点都会更远 $1$，所以有转移
$ans[v]=ans[u]+n-2\cdot sz[v]$。

这就是换根 DP 最典型的姿势：先在固定根下收一遍全局信息，再沿树边把答案推给儿子。

### 核心代码

```cpp
int sz[N];
long long ans[N];
void dfs1(int u, int p, int d){
  sz[u] = 1;
  ans[1] += d;
  for(int v : g[u]) if(v != p){
    dfs1(v, u, d + 1);
    sz[u] += sz[v];
  }
}
void dfs2(int u, int p){
  for(int v : g[u]) if(v != p){
    ans[v] = ans[u] + n - 2LL * sz[v];
    dfs2(v, u);
  }
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 6. [Tree Matching](https://cses.fi/problemset/task/1130)

`树形 DP` `最大匹配`

### 题意

在树上选尽量多的边，使得每个点至多被选中的一条边覆盖。输出最大匹配的边数。

### 分析

树上匹配的关键冲突只发生在“一个点不能同时连两条匹配边”。因此可以把状态挂在点上，记录 `u` 是否已经和某个儿子匹配。

设 `dp[u][0]` 表示在 `u` 子树内选边，且 `u` 不和任何儿子匹配时的最大值；`dp[u][1]` 表示 `u` 和恰好一个儿子匹配时的最大值。先把所有儿子当作“不强制和 `u` 连边”，得到基准和 `sum`。如果让 `u` 改成和某个儿子 `v` 匹配，就把 `v` 的贡献从 `max(dp[v][0],dp[v][1])` 改成 `dp[v][0]+1`，枚举哪个儿子最划算即可。

### 核心代码

```cpp
int dp[N][2];
void dfs(int u, int p){
  int sum = 0;
  for(int v : g[u]) if(v != p){
    dfs(v, u);
    sum += max(dp[v][0], dp[v][1]);
  }
  dp[u][0] = sum;
  for(int v : g[u]) if(v != p){
    dp[u][1] = max(dp[u][1],
      sum - max(dp[v][0], dp[v][1]) + dp[v][0] + 1);
  }
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 7. [Distinct Colors](https://cses.fi/problemset/task/1139)

`DSU on Tree` `子树统计`

### 题意

树上每个点有一个颜色。对每个点，求它的子树里一共出现了多少种不同颜色。

### 分析

如果每个点都把整棵子树颜色集合暴力合并一遍，会反复搬运很多元素。这里更自然的思路是 DSU on Tree：先保留重儿子的统计结果，再把所有轻儿子的贡献临时加进去，读出当前答案后视情况清空。

这样做的关键，是让“大集合尽量被复用，小集合只在需要时短暂加入”。当我们处理 `u` 时，重儿子的颜色频次已经留在桶里，再把轻儿子整棵子树的点扫一遍加入，当前桶里就正好是 `u` 子树的颜色分布，`distinct` 也就是答案。

### 核心代码

```cpp
int sz[N], son[N], col[N], ans[N], cnt[N], distinct, ban;
void add(int u, int p, int x){
  if((cnt[col[u]] += x) == 1 && x == 1) distinct++;
  if(cnt[col[u]] == 0 && x == -1) distinct--;
  for(int v : g[u]) if(v != p && v != ban) add(v, u, x);
}
void dfs(int u, int p, bool keep){
  for(int v : g[u]) if(v != p && v != son[u]) dfs(v, u, false);
  if(son[u]) dfs(son[u], u, true), ban = son[u];
  add(u, p, 1); ans[u] = distinct; ban = 0;
  if(!keep) add(u, p, -1), distinct = 0;
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

# 三、先找到公共祖先：倍增、LCA 与路径贡献

当题目开始反复询问祖先关系、两点距离、路径覆盖次数时，真正的骨架就变成了“先把路径拆成到 LCA 的两段”。这一章几乎每题都围着这个支点转，只是最后落到的答案形态不同。

## 8. [Company Queries I](https://cses.fi/problemset/task/1687)

`倍增` `k 级祖先`

### 题意

公司层级是一棵根为 $1$ 的树。每次询问员工 `x` 往上跳 `k` 级之后是谁；如果不存在这样的祖先，输出 `-1`。

### 分析

单次一层层往上爬显然太慢，因为 $q$ 和 $n$ 都到 $2\times 10^5$。标准做法是倍增：`up[x][j]` 记录 `x` 的第 $2^j$ 个祖先。

查询时把 `k` 按二进制拆开。若第 `j` 位为 $1$，就让 `x` 直接跳到 `up[x][j]`。这题的本质就是把很多次“重复向上走”预处理成跳表。

### 核心代码

```cpp
const int LOG = 20;
int up[N][LOG];
int kth(int x, int k){
  for(int j = 0; j < LOG && x; j++)
    if(k >> j & 1) x = up[x][j];
  return x ? x : -1;
}
for(int j = 1; j < LOG; j++)
  for(int i = 1; i <= n; i++)
    up[i][j] = up[up[i][j - 1]][j - 1];
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(\log n)$，空间复杂度 $O(n\log n)$。

---

## 9. [Company Queries II](https://cses.fi/problemset/task/1688)

`LCA` `倍增`

### 题意

同样是一棵公司层级树。每次给出两个员工 `a,b`，求他们共同的最低上司，也就是最近公共祖先。

### 分析

LCA 的套路分两步：先把较深的点抬到和另一个点同深，再从高位到低位同时往上跳，直到它们的父亲即将相同为止。最后那个共同父亲就是答案。

和上一题相比，这里不再只问“往上跳多少级”，而是要把两条祖先链对齐。可一旦有了 `up` 表和深度数组，过程本质上还是同一套二进制跳跃。

### 核心代码

```cpp
int lift(int x, int k){
  for(int j = 0; j < LOG && x; j++)
    if(k >> j & 1) x = up[x][j];
  return x;
}
int lca(int a, int b){
  if(dep[a] < dep[b]) swap(a, b);
  a = lift(a, dep[a] - dep[b]);
  if(a == b) return a;
  for(int j = LOG - 1; j >= 0; j--)
    if(up[a][j] != up[b][j]) a = up[a][j], b = up[b][j];
  return up[a][0];
}
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(\log n)$，空间复杂度 $O(n\log n)$。

---

## 10. [Distance Queries](https://cses.fi/problemset/task/1135)

`LCA` `树上距离`

### 题意

多次询问树上两点 `a,b` 之间的距离。

### 分析

一旦 LCA 会求了，这题几乎就是公式题。设 `dep[u]` 是根到 `u` 的边数，那么从根走到 `a` 与 `b` 的两段里，公共部分正好是根到 `lca(a,b)` 的那一截。

所以距离直接写成
$dist(a,b)=dep[a]+dep[b]-2\cdot dep[lca(a,b)]$。
真正需要记住的是：树上两点距离，往往都可以先折回最近公共祖先再算。

### 核心代码

```cpp
int dist(int a, int b){
  int p = lca(a, b);
  return dep[a] + dep[b] - 2 * dep[p];
}
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(\log n)$，空间复杂度 $O(n\log n)$。

---

## 11. [Counting Paths](https://cses.fi/problemset/task/1136)

`树上差分` `LCA`

### 题意

给出树上 $m$ 条路径。对每个点，求有多少条给定路径经过它。

### 分析

如果把每条路径都真的在树上走一遍，复杂度会炸掉。这题的关键是把“路径覆盖”变成树上差分。对一条路径 `(a,b)`，设 `l=lca(a,b)`，那么可以做
`tag[a]++`，`tag[b]++`，`tag[l]--`，`tag[parent[l]]--`。

随后做一遍后序 DFS，把儿子的 `tag` 往父亲累加。这样每个点最终留下来的值，正好就是经过它的路径条数。这里减 `parent[l]` 而不是只减 `l`，原因在于我们统计的是“点经过次数”，需要让从 `l` 往上的部分完全抵消掉。

### 核心代码

```cpp
long long tag[N];
void add_path(int a, int b){
  int l = lca(a, b);
  tag[a]++, tag[b]++, tag[l]--;
  if(up[l][0]) tag[up[l][0]]--;
}
void dfs(int u, int p){
  for(int v : g[u]) if(v != p){
    dfs(v, u);
    tag[u] += tag[v];
  }
  ans[u] = tag[u];
}
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，总查询与统计时间复杂度 $O((n+m)\log n)$，空间复杂度 $O(n\log n)$。

---

# 四、把树压成序列：欧拉序、树剖与在线维护

到了这一章，树不再只是“拿来搜”，而是要被压平成可以在线维护的一维结构。子树会变成连续区间，根到点路径可以变成若干链段，更新和查询都要依赖这种压平后的坐标系。

## 12. [Subtree Queries](https://cses.fi/problemset/task/1137)

`欧拉序` `树状数组`

### 题意

根固定为 $1$。每个点有点权，支持单点修改，以及查询某个点整棵子树的点权和。

### 分析

只要做一遍 DFS 序，`u` 的整棵子树就会对应到欧拉序上的一个连续区间 `[tin[u], tout[u]]`。于是树上子树求和立刻变成区间求和。

因为修改只有“单点改值”，所以把每个节点的当前权值放到 `tin[u]` 的位置上，用树状数组或线段树维护前缀和就够了。树题在这里第一次明显体现出“压平以后就是数组题”。

### 核心代码

```cpp
int tin[N], tout[N], clk;
long long bit[N], val[N];
void dfs(int u, int p){
  tin[u] = ++clk;
  for(int v : g[u]) if(v != p) dfs(v, u);
  tout[u] = clk;
}
void update(int u, long long x){ add(tin[u], x - val[u]); val[u] = x; }
long long query_subtree(int u){ return sum(tout[u]) - sum(tin[u] - 1); }
```

### 复杂度

预处理时间复杂度 $O(n)$，单次操作时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 13. [Path Queries](https://cses.fi/problemset/task/1138)

`欧拉序` `差分思想`

### 题意

根固定为 $1$。每个点有点权，支持单点修改，以及查询从根到某个点 `s` 的路径权值和。

### 分析

这题最妙的地方在于，它并不需要真的把任意路径拆成很多段。因为路径一端固定在根上，所以可以反着想：如果把节点 `u` 的权值加到它整棵子树区间 `[tin[u],tout[u]]` 上，那么某个点 `x` 在 DFS 序位置 `tin[x]` 处看到的总和，恰好就是所有祖先对它的贡献，也就是根到 `x` 的路径和。

于是题目变成“子树区间加、单点查询”。节点改值时，令差值 `delta=x-old`，给 `u` 的整棵子树区间都加上 `delta`；查询时直接读 `tin[s]` 的点值即可。这种把祖先关系转成区间覆盖的想法很值得记住。

### 核心代码

```cpp
int tin[N], tout[N], clk;
long long bit[N], val[N];
void range_add(int l, int r, long long x){
  add(l, x);
  add(r + 1, -x);
}
void build_node(int u){ range_add(tin[u], tout[u], val[u]); }
void update(int u, long long x){
  long long d = x - val[u];
  val[u] = x;
  range_add(tin[u], tout[u], d);
}
long long query_path(int u){ return sum(tin[u]); }
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，单次操作时间复杂度 $O(\log n)$，空间复杂度 $O(n)$。

---

## 14. [Path Queries II](https://cses.fi/problemset/task/2134)

`树链剖分` `线段树`

### 题意

树上每个点有点权，支持单点修改，以及查询两点路径上的最大点权。

### 分析

这次路径不再固定经过根，所以“一个欧拉区间”已经装不下整条路径了。常见做法是树链剖分：把树拆成若干条重链，使任意一条路径都能被分成 $O(\log n)$ 段链上连续区间。

在线段树上按 DFS 序维护每个点的权值后，查询 `(a,b)` 时不断把较深链头所在的一段拿出来取最大值，直到两点落到同一条链上。最后再处理同链区间即可。整题的难点不是线段树，而是先把树路由成少量区间。

### 核心代码

```cpp
int query_path(int a, int b){
  int res = 0;
  while(head[a] != head[b]){
    if(dep[head[a]] < dep[head[b]]) swap(a, b);
    res = max(res, seg.query(pos[head[a]], pos[a]));
    a = fa[head[a]];
  }
  if(dep[a] > dep[b]) swap(a, b);
  return max(res, seg.query(pos[a], pos[b]));
}
void modify_node(int u, int x){ seg.modify(pos[u], x); }
```

### 复杂度

预处理时间复杂度 $O(n)$，单次操作时间复杂度 $O(\log^2 n)$，空间复杂度 $O(n)$。

---

# 五、把路径拆开数：点分治下的长度计数

最后两题开始问“有多少条路径长度满足条件”。这类题一旦试图从每个点出发暴力扩展，路径就会成倍重叠；真正高效的办法是站在分治中心上，把一条路径拆成穿过当前重心的两半，再把不同子树里的深度信息拼起来。

## 15. [Fixed-Length Paths I](https://cses.fi/problemset/task/2080)

`点分治` `路径计数`

### 题意

给一棵树和整数 $k$，求边数恰好等于 $k$ 的不同简单路径条数。

### 分析

点分治的视角很自然：任选当前子树的重心 `c`，所有经过 `c` 的合法路径，都可以拆成“某个子树里一条深度为 `d` 的链”与“之前若干子树里一条深度为 `k-d` 的链”的组合。

因此处理重心时，按子树逐个扫描：先收集该子树所有到 `c` 的深度 `d`，用频次数组统计之前子树里有多少个深度能和它凑成 `k`；统计完再把这一批深度加入桶里。这样就不会把同一子树内的路径重复配对。处理完穿过当前重心的答案后，递归做各个分治子树即可。

### 核心代码

```cpp
long long ans;
int cnt[N], k;
void decompose(int u){
  int c = get_centroid(u);
  dead[c] = 1;
  vector<int> used = {0};
  cnt[0] = 1;
  for(int v : g[c]) if(!dead[v]){
    vector<int> dep; collect(v, c, 1, dep);
    for(int d : dep) if(d <= k) ans += cnt[k - d];
    for(int d : dep) if(d <= k){
      if(!cnt[d]) used.push_back(d);
      cnt[d]++;
    }
  }
  for(int d : used) cnt[d] = 0;
  for(int v : g[c]) if(!dead[v]) decompose(v);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 16. [Fixed-Length Paths II](https://cses.fi/problemset/task/2081)

`点分治` `树状数组`

### 题意

给一棵树，以及长度范围 $[k_1,k_2]$。求边数落在这个区间内的不同简单路径条数。

### 分析

与上一题相比，变化只在“恰好等于某个长度”变成“落在一个区间内”。最顺手的处理方式是定义 `F(K)` 表示长度至多为 $K$ 的路径条数，那么答案就是 $F(k_2)-F(k_1-1)$。

如何求 `F(K)`？仍然在点分治里做。处理重心 `c` 时，枚举某个子树里到 `c` 的深度 `d`，需要知道之前子树里有多少深度 `t` 满足 $t+d\le K$。这就把“凑恰好值”换成了“查前缀个数”，用树状数组或前缀桶维护深度频次即可。区间计数题常见的思路，正是把“区间”拆成两个前缀。

### 核心代码

```cpp
long long solve_limit(int c, int K){
  if(K < 0) return 0;
  long long ret = 0;
  vector<int> used = {1};
  bit.add(1, 1);
  for(int v : g[c]) if(!dead[v]){
    vector<int> dep; collect(v, c, 1, dep);
    for(int d : dep) if(d <= K) ret += bit.sum(K - d + 1);
    for(int d : dep) if(d <= K){
      bit.add(d + 1, 1);
      used.push_back(d + 1);
    }
  }
  for(int x : used) bit.add(x, -1);
  return ret;
}
// answer += solve_limit(c, k2) - solve_limit(c, k1 - 1);
```

### 复杂度

时间复杂度 $O(n\log^2 n)$，空间复杂度 $O(n)$。
