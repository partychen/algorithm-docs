---
title: "CSES 高级图论专题精选解题报告"
subtitle: "⚡ 从定向构造到支配树、块割树与图上综合建模"
order: 6
icon: "🚦"
---

# CSES 高级图论专题精选解题报告

这一页不打算把这些题拆成一堆互不相干的模板名词。更自然的读法是：有些题在问你怎样给图一个方向，有些题在问你怎样识别一条边到底是“可选”还是“必换”，还有些题表面是路径查询，骨子里却要先把原图压成 DAG、块割树、Steiner 子树或支配树。题面很散，但真正反复出现的，是“先换视角，再下手”。

# 一、先把图的骨架搭出来

这一章先处理几类“看似杂、实则都在塑形”的题：有的要从编码还原树，有的要给无向边定方向，有的则是把多个源头同时灌进整张图里。真正的关键，不是技巧名词，而是先把原图整理成一份好操作的结构。

## 1. [Nearest Shops](https://cses.fi/problemset/task/3303)

`多源 BFS` `次短源维护`

### 题意

给定无向图和若干有动漫店的城市。对每个城市，求到“别的城市里的动漫店”的最短距离；如果不存在这样的店，就输出 `-1`。

### 分析

如果只做一次普通多源 BFS，每个点只会记住最近的店，但这题对“本城也有店”的点还要避开自己，所以必须再往前走半步：对每个点维护来自**两个不同店源**的最短状态。BFS 扩展时，只要新状态的源点和已有源点不同，且距离更优，就把它塞进队列。这样最后每个点都拿到了“最近店”和“次近且源点不同的店”。没有店的点直接取第一名；本身有店的点，则跳过源点等于自己的那一份。

### 核心代码

```cpp
struct State { int d, s, u; };
int best1[N], src1[N], best2[N], src2[N];
queue<State> q;
bool relax(int u, int d, int s){
    if(src1[u] == s){
        if(d >= best1[u]) return false;
        best1[u] = d;
        return true;
    }
    if(d < best1[u]){
        best2[u] = best1[u], src2[u] = src1[u];
        best1[u] = d, src1[u] = s;
        return true;
    }
    if(src2[u] == s){
        if(d >= best2[u]) return false;
        best2[u] = d;
        return true;
    }
    if(d < best2[u]) return best2[u] = d, src2[u] = s, true;
    return false;
}
while(!q.empty()){
    auto [d, s, u] = q.front(); q.pop();
    if((src1[u] == s && d != best1[u]) || (src2[u] == s && d != best2[u])) continue;
    for(int v : g[u]) if(relax(v, d + 1, s)) q.push({d + 1, s, v});
}
```

### 复杂度

时间 `O(n+m)`，空间 `O(n+m)`。

---

## 2. [Prüfer Code](https://cses.fi/problemset/task/1134)

`Prüfer 序列` `最小叶子`

### 题意

给出一棵 `n` 个点树的 Prüfer 编码，要求还原原树的 `n-1` 条边。

### 分析

Prüfer 序列的逆过程本质上就是反复拿出“当前编号最小、且度数为 `1` 的叶子”，把它连到当前编码值上，然后把这条编码值的度数减一。于是只要先统计每个点在编码里出现了几次，令 `deg[i]=1+出现次数`，再用小根堆维护所有 `deg=1` 的点，就能逐个恢复前 `n-2` 条边。最后堆里会剩下两个点，把它们连起来即可。

### 核心代码

```cpp
priority_queue<int, vector<int>, greater<int>> pq;
for(int i = 1; i <= n; i++) if(deg[i] == 1) pq.push(i);
for(int x : code){
    int leaf = pq.top(); pq.pop();
    ans.push_back({leaf, x});
    if(--deg[x] == 1) pq.push(x);
}
int a = pq.top(); pq.pop();
int b = pq.top(); pq.pop();
ans.push_back({a, b});
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

## 3. [Tree Traversals](https://cses.fi/problemset/task/1702)

`二叉树重建` `递归分治`

### 题意

给出一棵二叉树的先序遍历和中序遍历，要求输出它的后序遍历。

### 分析

先序的第一个点一定是当前子树的根；中序里根左边整段是左子树，右边整段是右子树。于是用一个 `pos[val]` 数组记录每个值在中序中的位置后，就能在 `O(1)` 时间切出左右子树的规模。递归时先处理左段，再处理右段，最后把根压入答案，自然得到后序。整题的难点其实只有一个：不要真的建树，直接按区间递归输出，空间更省。

### 核心代码

```cpp
int pos[N];
vector<int> post;
void build(int pl, int pr, int il, int ir){
    if(pl > pr) return;
    int root = pre[pl];
    int k = pos[root], left = k - il;
    build(pl + 1, pl + left, il, k - 1);
    build(pl + left + 1, pr, k + 1, ir);
    post.push_back(root);
}
```

### 复杂度

时间 `O(n)`，空间 `O(n)`。

---

## 4. [Course Schedule II](https://cses.fi/problemset/task/1757)

`拓扑排序` `字典序最小`

### 题意

给定课程先修关系，要求输出一种合法修课顺序，并且要让课程 `1` 尽量早、再让课程 `2` 尽量早，依此类推。

### 分析

这句话翻译成图论就是：在所有拓扑序里，求字典序最小的一种。做法很直接——每次都从当前入度为 `0` 的点里，拿编号最小的那个出来。小根堆正好完成这个动作。因为任何时刻能提前的最小编号课程都被提前了，所以整个序列在第一个分歧位置也一定更优。

### 核心代码

```cpp
priority_queue<int, vector<int>, greater<int>> pq;
for(int i = 1; i <= n; i++) if(indeg[i] == 0) pq.push(i);
while(!pq.empty()){
    int u = pq.top(); pq.pop();
    ord.push_back(u);
    for(int v : g[u]) if(--indeg[v] == 0) pq.push(v);
}
```

### 复杂度

时间 `O((n+m) log n)`，空间 `O(n+m)`。

---

## 5. [Acyclic Graph Edges](https://cses.fi/problemset/task/1756)

`DAG 定向` `全序构造`

### 题意

给定无向图，要求给每条边定向，使得到的有向图无环。

### 分析

这题最容易被题面吓到，其实条件非常宽：只要先给所有点排一个全序，再把每条边统一从“前面”指向“后面”，环就不可能存在，因为沿着任意有向边序号都严格增加。最省事的全序就是点编号本身，于是直接把边 `(u,v)` 定成 `min(u,v) -> max(u,v)` 就行。

### 核心代码

```cpp
for(auto [u, v] : edges){
    if(u > v) swap(u, v);
    ans.push_back({u, v});
}
```

### 复杂度

时间 `O(m)`，空间 `O(1)`（不计输出）。

---

## 6. [Strongly Connected Edges](https://cses.fi/problemset/task/2177)

`桥` `Robbins 定理` `DFS 定向`

### 题意

给定简单无向图，要求给每条边定向，使整张图强连通；如果做不到，输出 `IMPOSSIBLE`。

### 分析

Robbins 定理告诉我们：无向图存在强连通定向，当且仅当它连通且没有桥。所以先 DFS 跑 `tin/low`。树边统一先定成父到子；返祖边定成深点到浅点。这样一来，每条非桥树边都能借返祖边绕回祖先，整张图就能形成双向可达。如果 DFS 过程中发现 `low[v] > tin[u]`，说明 `(u,v)` 是桥，答案立刻不存在。

### 核心代码

```cpp
void dfs(int u, int pe){
    tin[u] = low[u] = ++timer;
    for(auto [v, id] : g[u]) if(id != pe){
        if(!tin[v]){
            dir[id] = {u, v};
            dfs(v, id);
            low[u] = min(low[u], low[v]);
            if(low[v] > tin[u]) bad = true;
        }else if(tin[v] < tin[u]){
            dir[id] = {u, v};
            low[u] = min(low[u], tin[v]);
        }
    }
}
```

### 复杂度

时间 `O(n+m)`，空间 `O(n+m)`。

---

## 7. [Even Outdegree Edges](https://cses.fi/problemset/task/2179)

`DFS 构造` `出度奇偶`

### 题意

给定无向图，要求给每条边定向，使每个点的出度都是偶数；若无解则输出 `IMPOSSIBLE`。

### 分析

总出度之和等于边数，所以每个连通块的边数必须是偶数，这是必要条件。构造时先把所有返祖边都从深点指向浅点，这会确定一部分出度奇偶；然后树边在回溯时再补：若子树根 `v` 当前出度为奇数，就把树边定成 `v -> u`，顺手把它修成偶数；否则定成 `u -> v`，把这一次“奇偶翻转”留给父亲继续处理。最终每个连通块的根也必须是偶数，否则无解。

### 核心代码

```cpp
void dfs(int u, int pe){
    vis[u] = 1;
    for(auto [v, id] : g[u]) if(id != pe){
        if(!vis[v]){
            dfs(v, id);
            if(out[v] & 1) dir[id] = {v, u}, out[v]++;
            else dir[id] = {u, v}, out[u]++;
        }else if(depth[v] < depth[u]){
            dir[id] = {u, v};
            out[u]++;
        }
    }
}
```

### 复杂度

时间 `O(n+m)`，空间 `O(n+m)`。

---

# 二、环、步数与生成树的边界感

到了这里，题目开始逼你分辨“哪条边只是能用，哪条边必须替换，哪一步只是可达，哪一步还卡着奇偶”。这类题最怕一把梭模板，最需要对图上结构边界有手感。

## 8. [Graph Girth](https://cses.fi/problemset/task/1707)

`最短环` `多次 BFS`

### 题意

给定无向图，求最短环长度；如果图中没有环，输出 `-1`。

### 分析

点数只有 `2500`，可以直接把每个点都当成 BFS 起点。对源点 `s` 跑 BFS 时，`dist[u]` 表示从 `s` 到 `u` 的最短路；若扫描到一条边 `u-v`，并且 `v` 已访问且 `v` 不是 `u` 的父亲，那么就找到了一条经过 `s` 的环，长度为 `dist[u]+dist[v]+1`。对所有源点取最小值即可。这里 BFS 的意义不是找最短路本身，而是利用它保证第一次相遇给出的就是围绕当前源点的最短环。

### 核心代码

```cpp
int ans = INF;
for(int s = 1; s <= n; s++){
    fill(dist + 1, dist + n + 1, INF);
    queue<int> q;
    dist[s] = 0; q.push(s);
    while(!q.empty()){
        int u = q.front(); q.pop();
        for(int v : g[u]){
            if(dist[v] == INF) dist[v] = dist[u] + 1, par[v] = u, q.push(v);
            else if(par[u] != v) ans = min(ans, dist[u] + dist[v] + 1);
        }
    }
}
```

### 复杂度

时间 `O(n(n+m))`，空间 `O(n+m)`。

---

## 9. [Fixed Length Walk Queries](https://cses.fi/problemset/task/3357)

`奇偶分层图` `可达性查询`

### 题意

在连通无向图上回答多次询问：能否从 `a` 出发，恰好走 `x` 步后到达 `b`。

### 分析

“恰好走 `x` 步”最难的不是长短，而是奇偶。把每个点拆成 `(u,0)` 和 `(u,1)` 两层，表示当前走了偶数步或奇数步；原图每走一条边，奇偶就翻转一次，于是分层图上每条边都是 `(u,p) -> (v,p^1)`。从 `a` 在这个分层图上 BFS，就能同时得到到 `b` 的最短偶长走法和最短奇长走法。若与 `x` 同奇偶的最短长度不超过 `x`，多出来的部分总能靠来回走两步补齐。

### 核心代码

```cpp
void bfs(int s){
    for(int i = 1; i <= n; i++) d[s][i][0] = d[s][i][1] = INF;
    queue<pair<int,int>> q;
    d[s][s][0] = 0;
    q.push({s, 0});
    while(!q.empty()){
        auto [u, p] = q.front(); q.pop();
        for(int v : g[u]) if(d[s][v][p ^ 1] == INF){
            d[s][v][p ^ 1] = d[s][u][p] + 1;
            q.push({v, p ^ 1});
        }
    }
}
// 查询时判断 d[a][b][x & 1] <= x
```

### 复杂度

预处理时间 `O(n(n+m))`，空间 `O(n^2)`。

---

## 10. [Transfer Speeds Sum](https://cses.fi/problemset/task/3111)

`Kruskal 反向` `并查集计数`

### 题意

给定一棵带权树，定义两点之间的传输速度为路径上最小边权，要求所有点对传输速度之和。

### 分析

把边按权值从大到小加入并查集。当前加入一条权值为 `w` 的边，若它连接了两个大小分别为 `sx`、`sy` 的连通块，那么这两个块里的任意点对第一次连通时，路径上的最小边权恰好就是 `w`。于是这条边对答案的贡献就是 `sx * sy * w`。这和 Kruskal 求最小生成树的想法很像，只不过这里是在统计“某个权值第一次成为瓶颈”的点对数量。

### 核心代码

```cpp
sort(edges.begin(), edges.end(), [&](auto &a, auto &b){ return a.w > b.w; });
for(auto &e : edges){
    int x = find(e.u), y = find(e.v);
    ans += 1LL * sz[x] * sz[y] * e.w;
    fa[x] = y;
    sz[y] += sz[x];
}
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

## 11. [MST Edge Check](https://cses.fi/problemset/task/3407)

`Kruskal 分组` `MST 可选边`

### 题意

对每条边判断：它是否可能出现在某一棵最小生成树中。

### 分析

把边按权值分组。处理某一组权值 `w` 时，只看所有更小权值的边形成的并查集。如果当前边两端已经在同一连通块里，那它一定会和更轻的边形成环，不可能再进 MST；反之，它跨越了某个由更轻边切开的割，因此总可以在一棵最小生成树里选它。注意这一组边要先统一判断、再统一合并，不能边判断边合并，否则会错误地把同权边互相压掉。

### 核心代码

```cpp
for(auto &bucket : groups){
    for(int id : bucket){
        int u = find(e[id].u), v = find(e[id].v);
        ok[id] = (u != v);
    }
    for(int id : bucket) unite(e[id].u, e[id].v);
}
```

### 复杂度

时间 `O(m log m)`，空间 `O(n)`。

---

## 12. [MST Edge Set Check](https://cses.fi/problemset/task/3408)

`离线 Kruskal` `临时并查集`

### 题意

给出若干边集，判断每个边集里的所有边能否同时出现在某一棵最小生成树中。

### 分析

单条边能不能进 MST 只看它是否跨越更小边形成的连通块；一整个边集则还要防止**同一权值层内部自己成环**。所以仍然按权值升序处理：全局并查集维护所有更小权值的连通块；对某个询问在当前权值层挑出的边，先把端点映射到全局并查集根上，再用一套只对本层生效的临时并查集检查是否成环。若映射后出现自环，或临时并查集里合并失败，这个询问就是 `NO`。当前层检查完，最后再把这一层的原始边并入全局并查集。

### 核心代码

```cpp
for(auto &bucket : byWeight){
    for(auto &[qid, ids] : bucket.querys){
        int snap = tmp.snapshot();
        for(int id : ids){
            int u = dsu.find(e[id].u), v = dsu.find(e[id].v);
            if(u == v || !tmp.unite(u, v)){ bad[qid] = 1; break; }
        }
        tmp.rollback(snap);
    }
    for(int id : bucket.edges) dsu.unite(e[id].u, e[id].v);
}
```

### 复杂度

时间 `O((m+\sum |S_i|) log m)`，空间 `O(n+\sum |S_i|)`。

---

## 13. [MST Edge Cost](https://cses.fi/problemset/task/3409)

`MST 替换边` `倍增`

### 题意

对每条边求：如果强制把它放进生成树，最小生成树总代价是多少。

### 分析

先求出一棵 MST，设总代价为 `base`。如果当前边本来就在 MST 里，答案就是 `base`；否则把它加入 MST 会形成唯一一个环，要想仍保持生成树，只能删掉环上某条边，而且为了总代价最小，显然删掉路径上权值最大的那条。于是答案就是 `base + w - maxEdge(u,v)`。问题于是转成树上路径最大边查询，用倍增或重链剖分都能做。

### 核心代码

```cpp
long long answer(int u, int v, int w, bool inMst){
    if(inMst) return base;
    int mx = 0;
    if(depth[u] < depth[v]) swap(u, v);
    lift(u, depth[u] - depth[v], mx);
    for(int k = LOG - 1; k >= 0; k--) if(up[u][k] != up[v][k]){
        mx = max(mx, max(mxw[u][k], mxw[v][k]));
        u = up[u][k], v = up[v][k];
    }
    if(u != v) mx = max(mx, max(mxw[u][0], mxw[v][0]));
    return base + w - mx;
}
```

### 复杂度

预处理 `O(m log m + n log n)`，单条边查询 `O(log n)`。

---

## 14. [Network Breakdown](https://cses.fi/problemset/task/1677)

`删边离线` `逆序并查集`

### 题意

网络中的若干边会依次损坏，要求在每次损坏后输出当前连通块数量。

### 分析

并查集擅长加边，不擅长删边，所以把时间倒过来。先把所有会损坏的边都删掉，用剩下的边建立初始并查集；这时图对应的是“所有损坏都发生之后”的状态。然后把损坏操作逆序回放：每加回一条边，就等价于把正序中的前一个时刻复原出来。记录每一步加边前的连通块个数，最后倒序输出，就是正序每次断边后的答案。

### 核心代码

```cpp
for(auto [u, v] : edges) if(!broken.count(key(u, v))) unite(u, v);
for(int i = k - 1; i >= 0; i--){
    ans[i] = comp;
    auto [u, v] = qry[i];
    if(find(u) != find(v)) unite(u, v), comp--;
}
```

### 复杂度

时间 `O((n+m+k) alpha(n))`，空间 `O(n+m)`。

---

# 三、树上金币、同构判定与必经城市

这组题把焦点挪到树与有向图的骨架上：有时要把所有金币都揉进一棵 Steiner 子树，有时要把树压成规范形态，有时则要在所有可行路线里找出“无论如何都会经过”的点。

## 15. [Tree Coin Collecting I](https://cses.fi/problemset/task/3114)

`多源 BFS` `树链剖分`

### 题意

树上多次询问：从 `a` 到 `b` 的最短路径中，允许偏离去访问至少一个金币点，问最短长度。

### 分析

树上从 `a` 到 `b` 的任何路线，若想顺路摸到一个金币点 `c`，其总代价就是 `dist(a,b) + 2 * dist(c, path(a,b))`：主干路 `a-b` 必走，偏出去再折回来才是额外代价。所以核心变成：求路径 `a-b` 上每个点到最近金币的距离最小值。这个值先用所有金币做一次多源 BFS/DFS 预处理成 `near[u]`，再借树链剖分在线段树上查询路径最小值即可。

### 核心代码

```cpp
queue<int> q;
for(int u = 1; u <= n; u++) if(coin[u]) near[u] = 0, q.push(u);
while(!q.empty()){
    int u = q.front(); q.pop();
    for(int v : g[u]) if(near[v] > near[u] + 1){
        near[v] = near[u] + 1;
        q.push(v);
    }
}
// 答案 = dist(a,b) + 2 * queryMinOnPath(a,b)
```

### 复杂度

预处理 `O(n)`，单次询问 `O(log^2 n)`。

---

## 16. [Tree Coin Collecting II](https://cses.fi/problemset/task/3149)

`Steiner 树` `树上前缀统计`

### 题意

树上多次询问：从 `a` 到 `b` 的最短路线，要经过所有金币点，问最短长度。

### 分析

把所有金币点先固定下来，它们张成一棵最小连通子树。对一次询问而言，真正必须走到的其实是 `金币集合 ∪ {a,b}` 的 Steiner 树；在树上，从 `a` 走到 `b` 覆盖整棵 Steiner 树，最短长度恒为 `2 * |E(S)| - dist(a,b)`。所以难点变成如何快速求 `|E(S)|`。任选一个金币为根，设 `coinCnt[v]` 为子树金币数：若 `0 < coinCnt[v] < K`，边 `(fa[v],v)` 必定属于金币核心；若 `coinCnt[v] = 0`，这条边只有在 `a` 或 `b` 落在该子树里时才会被额外拉进 Steiner 树。于是维护“零金币边”前缀和 `zeroPref[u]`，就能写出 `|E(S)| = base + zeroPref[a] + zeroPref[b] - zeroPref[lca(a,b)]`。

### 核心代码

```cpp
void dfs(int u, int p){
    coinCnt[u] = coin[u];
    for(int v : g[u]) if(v != p){
        dfs(v, u);
        coinCnt[u] += coinCnt[v];
        if(coinCnt[v] == 0) zeroPref[v] = zeroPref[u] + 1;
        else zeroPref[v] = zeroPref[u];
        if(0 < coinCnt[v] && coinCnt[v] < K) base++;
    }
}
long long steinerEdges(int a, int b){
    int l = lca(a, b);
    return base + zeroPref[a] + zeroPref[b] - zeroPref[l];
}
// 答案 = 2 * steinerEdges(a,b) - dist(a,b)
```

### 复杂度

预处理 `O(n log n)`，单次询问 `O(log n)`。

---

## 17. [Tree Isomorphism I](https://cses.fi/problemset/task/1700)

`树同构` `AHU 哈希`

### 题意

给定两棵根固定为 `1` 的树，判断它们是否同构。

### 分析

根已经固定，这题就是标准的 AHU 树同构。对每个点递归求出所有儿子子树的规范表示，排序后再打包成自己的表示；若两棵树根的表示相同，就同构。为了不真的拼长字符串，竞赛里常把“排序后的儿子哈希向量”离散化成一个新编号，这样整棵树只在做一轮自底向上的规范化。

### 核心代码

```cpp
map<vector<int>, int> id;
int dfs(int u, int p, vector<int> g[]){
    vector<int> son;
    for(int v : g[u]) if(v != p) son.push_back(dfs(v, u, g));
    sort(son.begin(), son.end());
    if(!id.count(son)) id[son] = id.size() + 1;
    return id[son];
}
```

### 复杂度

单组测试时间 `O(n log n)`，空间 `O(n)`。

---

## 18. [Tree Isomorphism II](https://cses.fi/problemset/task/1701)

`树中心` `无根同构`

### 题意

给定两棵无根树，判断它们是否同构。

### 分析

无根树最大的问题是根不固定，所以先找树中心。任意一棵树的中心只有 `1` 个或 `2` 个，把树分别以这些中心为根做 AHU 哈希，只要存在一对根哈希相同，两棵树就同构。这里“找中心”可以用两次找直径端点，也可以用剥叶子法；实现上后者更稳定。

### 核心代码

```cpp
vector<int> center(vector<int> g[]){
    queue<int> q;
    for(int i = 1; i <= n; i++) if(deg[i] <= 1) q.push(i);
    int left = n;
    while(left > 2){
        int sz = q.size();
        left -= sz;
        while(sz--){
            int u = q.front(); q.pop();
            for(int v : g[u]) if(--deg[v] == 1) q.push(v);
        }
    }
    vector<int> c;
    while(!q.empty()) c.push_back(q.front()), q.pop();
    return c;
}
```

### 复杂度

单组测试时间 `O(n log n)`，空间 `O(n)`。

---

## 19. [Flight Route Requests](https://cses.fi/problemset/task/1699)

`SCC` `DAG 链化`

### 题意

起初没有任何航线，给出若干“必须可达”的请求，要求最少添加多少条单向航线，才能满足所有请求。

### 分析

先把请求图缩成 SCC。一个大小为 `s` 的强连通分量内部，若请求彼此成环，就至少要有 `s` 条边才能让这 `s` 个点互相可达；最省的做法就是直接连成一个有向环。缩点后得到一张 DAG，设它有 `c` 个点。对 DAG 来说，只要按某个拓扑序把这些分量串成一条链，前面的分量自然都能到后面的分量，于是所有“前到后”的请求都会被满足；这部分最少只要 `c-1` 条边。于是总答案就是“所有非平凡 SCC 的环边数”加上“缩点 DAG 串成链的边数”。

### 核心代码

```cpp
tarjan();
long long ans = 0;
for(int i = 1; i <= sccCnt; i++) if(sz[i] > 1) ans += sz[i];
vector<int> topo = topoSortDag();
if(!topo.empty()) ans += (int)topo.size() - 1;
```

### 复杂度

时间 `O(n+m)`，空间 `O(n+m)`。

---

## 20. [Critical Cities](https://cses.fi/problemset/task/1703)

`支配树` `Lengauer-Tarjan`

### 题意

在有向图中，找出所有从 `1` 到 `n` 的路径上都会经过的城市。

### 分析

这就是典型的**支配点**问题：若从起点 `1` 出发到点 `x` 的任意路径都必须经过 `u`，就说 `u` 支配 `x`。题目要找的是所有支配 `n` 的点。直接在原图上建以 `1` 为根的支配树，`n` 的所有支配点恰好就是支配树上 `1 -> n` 这条祖先链。实现上用 Lengauer-Tarjan 算法求 `idom`，再从 `n` 沿着 `idom` 往上跳到 `1`，收集并排序输出即可。

### 核心代码

```cpp
void link(int p, int v){ uf[v] = p; }
int eval(int v){
    if(uf[v] == v) return v;
    int x = eval(uf[v]);
    if(semi[best[uf[v]]] < semi[best[v]]) best[v] = best[uf[v]];
    return uf[v] = x, best[v];
}
// 按 dfs 序逆推 semi，再由 bucket 求 idom
```

### 复杂度

时间 `O((n+m) alpha(n))`，空间 `O(n+m)`。

---

## 21. [Visiting Cities](https://cses.fi/problemset/task/1203)

`最短路 DAG` `支配树`

### 题意

在所有从 `1` 到 `n` 的最便宜路线中，找出一定会经过的城市。

### 分析

先别急着找“必经点”，先把所有不在最短路上的边剔掉。跑两次 Dijkstra，得到 `dist1[u]` 和 `distn[u]`，只有满足 `dist1[u] + w + distn[v] = dist1[n]` 的边 `u -> v` 才可能出现在某条最短路里。保留下来的边构成一张最短路 DAG。此时题目就和上一题一模一样了：在这张 DAG 上，哪些点支配终点 `n`，哪些点就是所有最短路的公共必经点。

### 核心代码

```cpp
dijkstra(1, g, d1);
dijkstra(n, rg, dn);
for(auto &e : edges) if(d1[e.u] + e.w + dn[e.v] == d1[n]) dag[e.u].push_back(e.v);
buildDominatorTree(dag, 1);
for(int x = n; x; x = idom[x]) must.push_back(x);
```

### 复杂度

时间 `O(m log n + (n+m) alpha(n))`，空间 `O(n+m)`。

---

# 四、颜色、公司与 DAG 覆盖

这里的建模味道最重：最优染色会落到子集 DP，公交公司要拆成城市层与公司层，而两条路径覆盖 DAG 则直接连到二分图最大匹配。图论的抽象层一旦选对，复杂题会突然变短。

## 22. [Graph Coloring](https://cses.fi/problemset/task/3308)

`状态压缩` `子集 DP`

### 题意

给定一个 `n<=16` 的简单图，要求用最少颜色给点染色，使每条边两端颜色不同，并给出一种方案。

### 分析

点数很小，最自然的做法就是对点集做 DP。先预处理每个子集是否是独立集；如果 `sub` 本身没有内部边，那它就能作为同一种颜色的一层。于是令 `dp[mask]` 表示给 `mask` 这批点染色所需的最少颜色数，转移就是枚举 `mask` 的独立子集 `sub`，尝试 `dp[mask ^ sub] + 1`。最后再顺着 `pre[mask]` 回溯，就能恢复每个点属于哪一种颜色。

### 核心代码

```cpp
dp[0] = 0;
for(int mask = 1; mask < (1 << n); mask++){
    dp[mask] = INF;
    for(int sub = mask; sub; sub = (sub - 1) & mask) if(ind[sub]){
        if(dp[mask ^ sub] + 1 < dp[mask]){
            dp[mask] = dp[mask ^ sub] + 1;
            pre[mask] = sub;
        }
    }
}
```

### 复杂度

预处理与 DP 总时间 `O(3^n)`，空间 `O(2^n)`。

---

## 23. [Bus Companies](https://cses.fi/problemset/task/3158)

`分层建图` `Dijkstra`

### 题意

有 `m` 家公交公司，每家公司在若干城市运营，买一张它的票后，可以在它覆盖的城市之间任意走。求从城市 `1` 到所有城市的最小花费。

### 分析

难点在于“买票一次，能在整组城市间任意移动”，这显然不是普通边。把每家公司拆成一个额外的“公司点”：从城市 `u` 进入公司 `i`，边权是票价 `c_i`；从公司点回到它覆盖的任意城市，边权是 `0`。这样“买票一次再在该公司网络里任意跳转”就被完整翻译成了“花一次钱进公司层，随后零代价落到任意覆盖城市”。整张图只有 `n+m` 个点、`2\sum k` 条边，直接 Dijkstra。

### 核心代码

```cpp
for(int i = 1; i <= m; i++) for(int u : citys[i]){
    addEdge(u, n + i, cost[i]);
    addEdge(n + i, u, 0);
}
dijkstra(1);
// dist[1..n] 就是答案
```

### 复杂度

时间 `O((n+\sum k) log (n+m))`，空间 `O(n+m+\sum k)`。

---

## 24. [Split into Two Paths](https://cses.fi/problemset/task/3358)

`DAG 最小路径覆盖` `Hopcroft-Karp`

### 题意

给定 DAG，判断能否把所有点恰好分成两条有向路径；若可以，还要输出这两条路径。

### 分析

把 DAG 左右各拆一份，原图每条边 `u -> v` 变成二分图里的 `u_L -> v_R`。这样 DAG 的最小路径覆盖数就等于 `n - 最大匹配`。题目要求覆盖数不超过 `2`，于是只要检查最大匹配是否至少为 `n-2`。若可行，所有左侧未匹配点就是路径起点，顺着“当前点匹配到的右点”一路往后追，就能把每条覆盖路径还原出来；如果只有一条路径，另一条按空路径输出即可。

### 核心代码

```cpp
hopcroftKarp();
if(matchCnt < n - 2) fail = true;
for(int u = 1; u <= n; u++) if(!matL[u]) starts.push_back(u);
for(int s : starts){
    vector<int> path;
    for(int u = s; u; u = matR[u]) path.push_back(u);
    paths.push_back(path);
}
```

### 复杂度

时间 `O(m\sqrt n)`，空间 `O(n+m)`。

---

# 五、把网络补强到删不坏、断不开

收尾几题都在做“补边”或“设点”的逆向工程：树要补到没有桥，点删掉后是否还能通要丢进块割树，定距离放办公室则是树上贪心与最近已选点查询，最后还要把整张有向图补成强连通。

## 25. [Network Renovation](https://cses.fi/problemset/task/1704)

`树补边` `叶子配对`

### 题意

给定一棵树，要求添加尽量少的新边，使得删掉任意一条边后图仍然连通。

### 分析

树里每条边都是桥，所以新边的任务就是尽量让这些桥都落进某个环里。经典结论是：若树有 `L` 个叶子，最少需要添加 `\lceil L/2 
ceil` 条边。构造时先按 DFS 序收集所有叶子，再把它们“前半段”和“后半段”配对连接；这样每条原树边两侧都会至少有一对被配到的叶子，因而这条边落在某个新形成的环上，不再是桥。叶子数为奇数时，让一个叶子参与两次配对即可。

### 核心代码

```cpp
dfs(1, 0);
int L = leaves.size(), half = (L + 1) / 2;
for(int i = 0; i < L / 2; i++)
    ans.push_back({leaves[i], leaves[i + half]});
if(L & 1) ans.push_back({leaves[L / 2], leaves[0]});
```

### 复杂度

时间 `O(n)`，空间 `O(n)`。

---

## 26. [Forbidden Cities](https://cses.fi/problemset/task/1705)

`块割树` `LCA` `割点`

### 题意

多次询问：在无向图中，能否从 `a` 到 `b` 走一条不经过城市 `c` 的路线。

### 分析

删除一个普通点不会改变别人的连通性，真正需要小心的是割点。所以先用 Tarjan 把原图拆成点双连通分量，并建立块割树：原图中的割点保留成点，点双分量也各自变成一个点，原点若属于某个分量就连一条边。块割树是树，删掉原图中的割点 `c`，等价于删掉块割树里的那个原点节点。于是询问就变成：`c` 是否落在表示 `a` 与 `b` 的两个节点之间的树上路径里。用 LCA 判一次路径包含即可。若 `c` 本身不是割点，那么除非 `c` 就是 `a` 或 `b`，否则答案永远是 `YES`。

### 核心代码

```cpp
bool onPath(int x, int u, int v){
    return dist(u, x) + dist(x, v) == dist(u, v);
}
bool query(int a, int b, int c){
    if(c == a || c == b) return false;
    if(!isCut[c]) return true;
    int u = idOf(a), v = idOf(b), x = cutId[c];
    return !onPath(x, u, v);
}
```

### 复杂度

预处理 `O(n+m)`，单次询问 `O(log n)`。

---

## 27. [Creating Offices](https://cses.fi/problemset/task/1752)

`树上贪心` `点分治`

### 题意

在树上选尽量多的城市建办公室，并要求任意两个办公室之间距离至少为 `d`。

### 分析

这题可以用“按深度从大到小”的贪心：越深的点越像叶端资源，一旦错过，后面很难再补回来；而若当前点到所有已选办公室的距离都至少为 `d`，立刻选它不会压缩更深层已经做出的选择。剩下的问题只有一个——如何动态维护“某个点到最近已选办公室的距离”。点分治正好适合这种静态树上的最近点查询：每个点记录自己到点分治祖先链的距离，查询时沿祖先链取 `best[centroid] + dist(u, centroid)` 的最小值，更新时反向刷新这些 `best`。

### 核心代码

```cpp
sort(ord.begin(), ord.end(), [&](int a, int b){ return dep[a] > dep[b]; });
for(int u : ord){
    if(queryNearest(u) >= d){
        pick.push_back(u);
        update(u);
    }
}
```

### 复杂度

预处理 `O(n log n)`，贪心扫描总时间 `O(n log n)`，空间 `O(n log n)`。

---

## 28. [New Flight Routes](https://cses.fi/problemset/task/1685)

`SCC` `源汇配对`

### 题意

在有向图中添加尽量少的新航线，使得任意城市都能到达任意城市，并输出一种构造。

### 分析

先缩 SCC，问题立刻变成如何把一张 DAG 补成强连通。设缩点后有若干源点分量和汇点分量，经典结论是最少需要添加 `max(srcCnt, sinkCnt)` 条边。直觉也很自然：每个源分量至少要补一条入边，每个汇分量至少要补一条出边，所以答案至少是两者较大值；而把汇点分量和源点分量按环形错位配对，就能恰好用这么多条边把整张 DAG 串成一个大环。若原图本来只有一个 SCC，答案就是 `0`。

### 核心代码

```cpp
tarjan();
if(sccCnt == 1) return;
for(int i = 1; i <= sccCnt; i++) if(indeg[i] == 0) src.push_back(i);
for(int i = 1; i <= sccCnt; i++) if(outdeg[i] == 0) sink.push_back(i);
int k = max(src.size(), sink.size());
for(int i = 0; i < k; i++)
    ans.push_back({rep[sink[i % sink.size()]], rep[src[(i + 1) % src.size()]]});
```

### 复杂度

时间 `O(n+m)`，空间 `O(n+m)`。

---
