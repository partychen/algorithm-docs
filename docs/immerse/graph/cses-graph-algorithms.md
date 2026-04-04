---
title: "CSES 图算法专题精选解题报告"
subtitle: "🕸️ 从连通搜索到函数图、强连通与流模型的图论主线"
order: 4
icon: "🕸️"
---

# CSES 图算法专题精选解题报告

图论专题最迷人的地方，从来不是模板本身，而是你站在题面门口时，究竟先看见什么：是一块块互不相连的地面，是一条必须追回来的最短路，是一个会反复把人卷回环上的传送器，还是一张表面在讲配对、骨子里却在讲流量的网。把这组题重新排开之后，会更清楚地看见一条主线：同样是“走”，有时是在扩展边界，有时是在压缩结构，有时则是在残量网络里反向理解答案。

这一组题刻意不按平台原顺序讲，而是让相近的图感靠在一起。先从最容易摸到的连通、搜路、染色开始，再走进权值传播与 DAG，随后进入功能图、强连通与逻辑建模，最后把欧拉路、哈密顿路、网络流这些更“结构化”的问题收束到一起。你会发现，很多题真正的分界线，不在代码长短，而在于是否愿意先把原图变成更适合回答问题的那张图。

# 一、先看见连通块，再看见路

这一章里的图还很“朴素”：房间就是连通块，朋友关系就是二分图，迷宫的出口就是 BFS 波纹最先触到的边界。题面都像在问路线，但真正决定做法的，往往是你先把图当成了“区域”，还是当成了“路径”。

## 1. [Counting Rooms](https://cses.fi/problemset/task/1192)

`网格图` `DFS` `连通块`

### 题意

给定一张由地板和墙组成的建筑平面图，只能上下左右移动，要求统计一共有多少个互不连通的房间。

### 分析

这题本质上不是在“走迷宫”，而是在数四连通块。每当扫到一个还没访问过的 `.`，就说明一个新房间的入口被看见了；从这里出发把整块地板全部淹没，后面再遇到这块区域时就不会重复计数。

网格题里最容易多想成最短路，但这里只需要知道“能不能互相到达”，不需要知道路径长度，所以 DFS 和 BFS 都够用。关键是把每个地板格恰好访问一次。

### 核心代码

```cpp
int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
void dfs(int x, int y){
    vis[x][y] = 1;
    for (int k = 0; k < 4; k++){
        int nx = x + dx[k], ny = y + dy[k];
        if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;
        if (g[nx][ny] == '#' || vis[nx][ny]) continue;
        dfs(nx, ny);
    }
}
for (int i = 0; i < n; i++)
    for (int j = 0; j < m; j++)
        if (g[i][j] == '.' && !vis[i][j]) ans++, dfs(i, j);
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 2. [Labyrinth](https://cses.fi/problemset/task/1193)

`网格图` `BFS` `路径还原`

### 题意

在迷宫中给出起点 `A` 和终点 `B`，只能四方向移动，要求判断能否到达；如果能，要输出一条最短路径及其方向串。

### 分析

无权网格里，“最短步数”直接对应 BFS 的层次。只要从 `A` 开始做 BFS，第一次到达某个格子时所用的步数就是最短步数，因此第一次碰到 `B` 就已经拿到了最短答案。

这题真正要补的一刀是路径还原。除了记录是否访问过，还要记下每个格子是从哪个前驱、用哪个方向走过来的；最后从 `B` 逆着前驱回到 `A`，把方向倒过来即可。

### 核心代码

```cpp
int dx[4] = {1, -1, 0, 0}, dy[4] = {0, 0, 1, -1};
char dc[4] = {'D', 'U', 'R', 'L'};
queue<pair<int,int>> q;
q.push(A), vis[A.first][A.second] = 1;
while (!q.empty()){
    auto [x, y] = q.front(); q.pop();
    for (int k = 0; k < 4; k++){
        int nx = x + dx[k], ny = y + dy[k];
        if (nx < 0 || nx >= n || ny < 0 || ny >= m) continue;
        if (g[nx][ny] == '#' || vis[nx][ny]) continue;
        vis[nx][ny] = 1;
        pre[nx][ny] = {x, y};
        step[nx][ny] = dc[k];
        q.push({nx, ny});
    }
}
for (auto cur = B; cur != A; cur = pre[cur.first][cur.second])
    path.push_back(step[cur.first][cur.second]);
reverse(path.begin(), path.end());
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 3. [Building Roads](https://cses.fi/problemset/task/1666)

`无向图` `连通块` `构造`

### 题意

给出若干城市和已有道路，要求添加尽量少的新路，使得任意两座城市之间都可以互相到达，并输出一种可行的修路方案。

### 分析

如果原图有 `k` 个连通块，那么至少要修 `k-1` 条路，这个下界也总能达到。做法很直接：先找出每个连通块随便一个代表点，再把这些代表点按顺序连起来，就把所有块串成了一整块。

这题的重点不在“最优算法”，而在看出“最少新边数 = 连通块数减一”。一旦这个结构关系看清，输出方案只是把代表点排成链。

### 核心代码

```cpp
void dfs(int u){
    vis[u] = 1;
    for (int v : adj[u]) if (!vis[v]) dfs(v);
}
for (int i = 1; i <= n; i++){
    if (!vis[i]){
        rep.push_back(i);
        dfs(i);
    }
}
for (int i = 1; i < (int)rep.size(); i++)
    add.push_back({rep[i - 1], rep[i]});
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 4. [Message Route](https://cses.fi/problemset/task/1667)

`无权图` `BFS` `最短路`

### 题意

在无向图中，电脑 `1` 想把消息传到电脑 `n`。如果可达，要求输出经过电脑数最少的一条路线；否则输出无解。

### 分析

边权全都一样时，BFS 就是最短路。题目要最少经过多少台电脑，本质上等价于最少经过多少条边，只是在输出时把起点也算进去而已。

和迷宫题的差别只在图从网格换成了邻接表，但方法完全一致：BFS 扩层，记录每个点的前驱，最终从 `n` 倒着还原到 `1`。若 `n` 从未被访问到，就不存在路线。

### 核心代码

```cpp
queue<int> q;
q.push(1), vis[1] = 1, pre[1] = 0;
while (!q.empty()){
    int u = q.front(); q.pop();
    for (int v : adj[u]) if (!vis[v]){
        vis[v] = 1;
        pre[v] = u;
        q.push(v);
    }
}
for (int x = n; x; x = pre[x]) path.push_back(x);
reverse(path.begin(), path.end());
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 5. [Building Teams](https://cses.fi/problemset/task/1668)

`二分图` `染色` `DFS`

### 题意

给出同学之间的友谊关系，要求把所有人分成两个队，使得任意一条友谊边的两个端点不在同一队；如果做不到，输出无解。

### 分析

“朋友不能分到同一组”就是标准二分图判定。对每个尚未染色的连通块任选一个点染成 `1`，沿边把相邻点染成另一种颜色；如果某条边两端最终需要同色，就说明图中存在奇环，题目无解。

因为图可能不连通，所以必须从每个未访问点重新开一次搜索。所有块都能稳定二染色时，颜色数组本身就是答案。

### 核心代码

```cpp
bool dfs(int u, int c){
    col[u] = c;
    for (int v : adj[u]){
        if (!col[v]){
            if (!dfs(v, 3 - c)) return false;
        } else if (col[v] == c) return false;
    }
    return true;
}
for (int i = 1; i <= n; i++)
    if (!col[i] && !dfs(i, 1)) ok = false;
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 6. [Round Trip](https://cses.fi/problemset/task/1669)

`无向图` `找环` `DFS`

### 题意

在无向图中寻找一个简单环，要求起点和终点相同，中间经过的其他城市互不重复；若不存在这样的环，输出无解。

### 分析

无向图找一个环，最自然的方法是 DFS 时记录父节点。若从当前点 `u` 扫到一个已访问过、且不是父亲的点 `v`，就说明搜到了一条返祖边，环已经闭合。此时从 `u` 沿着父链回溯到 `v`，再把 `v` 补到末尾，就能把整个环恢复出来。

这题的细节在于：无向图中每条树边会被看到两次，所以只有“访问过且不是父亲”的邻点才能真正触发成环，而不是简单地看到访问标记就判环。

### 核心代码

```cpp
bool dfs(int u, int p){
    vis[u] = 1;
    for (int v : adj[u]){
        if (v == p) continue;
        if (!vis[v]){
            fa[v] = u;
            if (dfs(v, u)) return true;
        } else {
            cyc.push_back(v);
            for (int x = u; x != v; x = fa[x]) cyc.push_back(x);
            cyc.push_back(v);
            return true;
        }
    }
    return false;
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 7. [Monsters](https://cses.fi/problemset/task/1194)

`网格图` `多源BFS` `最短路`

### 题意

迷宫里除了你之外还有怪物。你和所有怪物每一步都会同时移动，要求判断能否从起点 `A` 走到某个边界格，并且在任何时刻都不会和怪物占到同一格；如果能，要输出一条可行路径。

### 分析

“怪物先到或同时到，这格就不安全”是这题的核心。于是第一层 BFS 不是从人出发，而是把所有怪物一起丢进队列，预处理每个格子最早会在第几步被怪物占领。这个时间表一旦算出，人的移动就不再和怪物纠缠，而是变成了一次带约束的 BFS：只有当 `distA[nx][ny] + 1 < distM[nx][ny]` 时，这步才真的安全。

因为边界就是出口，所以人在第二次 BFS 中第一次走到边界，得到的就是最短逃生路线。路径还原仍然和普通迷宫 BFS 一样做。

### 核心代码

```cpp
queue<pair<int,int>> q;
for (auto [x, y] : mons) q.push({x, y}), dm[x][y] = 0;
while (!q.empty()){
    auto [x, y] = q.front(); q.pop();
    for (int k = 0; k < 4; k++){
        int nx = x + dx[k], ny = y + dy[k];
        if (!inside(nx, ny) || g[nx][ny] == '#') continue;
        if (dm[nx][ny] > dm[x][y] + 1)
            dm[nx][ny] = dm[x][y] + 1, q.push({nx, ny});
    }
}
q.push(A), da[A.first][A.second] = 0;
while (!q.empty()){
    auto [x, y] = q.front(); q.pop();
    for (int k = 0; k < 4; k++){
        int nx = x + dx[k], ny = y + dy[k];
        if (!inside(nx, ny) || g[nx][ny] == '#' || da[nx][ny] != INF) continue;
        if (da[x][y] + 1 >= dm[nx][ny]) continue;
        da[nx][ny] = da[x][y] + 1, pre[nx][ny] = {x, y}, step[nx][ny] = dc[k];
        q.push({nx, ny});
    }
}
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

# 二、权值开始流动，结构开始收缩

当图有了代价，搜索就不再只靠层次；当图承诺自己无环，很多问题又会突然变得干净。这里会先遇见 Dijkstra、Floyd、Bellman-Ford，再遇见拓扑序上的路径计数与状态传播。图还是那张图，但提问方式已经从“能不能到”变成了“以什么代价到、以多少种方式到”。

## 8. [Shortest Routes I](https://cses.fi/problemset/task/1671)

`最短路` `Dijkstra` `单源`

### 题意

给定一张带正权的有向图，要求求出从城市 `1` 到每个城市的最短距离。

### 分析

边权全为正时，单源最短路的标准答案就是 Dijkstra。每次从优先队列里取出当前距离最小且尚未过期的点，用它去松弛出边，最终所有点的最短距离都会稳定下来。

这题没有陷阱，关键只有一个：距离必须用 `long long`。因为路径长度可能累加到很大，若仍然用 `int`，会在最短路还没结束前先把答案溢掉。

### 核心代码

```cpp
priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> pq;
fill(dist + 1, dist + n + 1, INF);
dist[1] = 0, pq.push({0, 1});
while (!pq.empty()){
    auto [d, u] = pq.top(); pq.pop();
    if (d != dist[u]) continue;
    for (auto [v, w] : adj[u]){
        if (dist[v] > d + w){
            dist[v] = d + w;
            pq.push({dist[v], v});
        }
    }
}
```

### 复杂度

时间复杂度 $O((n+m)\log n)$，空间复杂度 $O(n+m)$。

---

## 9. [Shortest Routes II](https://cses.fi/problemset/task/1672)

`最短路` `Floyd` `多源查询`

### 题意

给定一张带权无向图，并给出很多次两点间最短路查询。若两点之间不连通，输出 `-1`。

### 分析

这里的关键不是边数，而是点数只有 `500`。这意味着可以直接做 Floyd，把任意两点之间的最短距离一次性全部算出来，之后每个询问都只是查表。

Floyd 的含义是逐步允许更多中转点参与路径更新：当枚举到中转点 `k` 时，尝试用 `i -> k -> j` 改善 `i -> j`。因为图是无向图，初始化时要对称更新；若输入中同一对点有多条边，也只保留最小权值。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) dist[i][i] = 0;
for (auto [a, b, c] : edges){
    dist[a][b] = min(dist[a][b], c);
    dist[b][a] = min(dist[b][a], c);
}
for (int k = 1; k <= n; k++)
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= n; j++)
            if (dist[i][k] < INF && dist[k][j] < INF)
                dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]);
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 10. [High Score](https://cses.fi/problemset/task/1673)

`Bellman-Ford` `负环判定` `可达性`

### 题意

在有向图中，从房间 `1` 走到房间 `n`，每条边会让分数增加或减少。要求求最大得分；若能通过某种走法把得分无限增大，输出 `-1`。

### 分析

最大得分不好直接做，就把边权全部取反，转成从 `1` 到 `n` 的最短路问题。若某个负环既能从 `1` 到达，又能够继续走到 `n`，那在原题里就等价于一个可以无限刷分的正环，答案应为 `-1`。

因此做 Bellman-Ford 时，不只看第 `n` 轮还有没有松弛，还要判断这些被继续改善的点是否真的处在 `1 -> ... -> n` 的有效通路上。通常会再做两次 DFS/BFS：一次从 `1` 出发，一次在反图上从 `n` 出发，只有两边都可达的点才值得关心。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) dist[i] = INF;
dist[1] = 0;
for (int i = 1; i <= n; i++){
    x = 0;
    for (auto [u, v, w] : edges){
        long long c = -w;
        if (dist[u] == INF) continue;
        if (dist[v] > dist[u] + c){
            dist[v] = dist[u] + c;
            x = v;
        }
    }
}
if (x && from1[x] && ton[x]) inf = true;
ans = -dist[n];
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(n+m)$。

---

## 11. [Flight Discount](https://cses.fi/problemset/task/1195)

`最短路` `状态图` `Dijkstra`

### 题意

在带正权的有向图中，从城市 `1` 到城市 `n`，途中可以把恰好一条航线的价格减半一次，要求求最便宜路线的总价格。

### 分析

优惠券只能用一次，所以天然要多开一维状态：`dist[u][0]` 表示还没用过优惠券到达 `u` 的最小代价，`dist[u][1]` 表示已经用过优惠券到达 `u` 的最小代价。对一条边 `(u,v,w)`，若当前还没用券，可以选择原价走到 `dist[v][0]`，也可以现在把它半价掉，转移到 `dist[v][1]`。

这其实就是把原图拆成两层。第一层表示“券还在”，第二层表示“券已用”；所有边都在层内保留一条原价边，并额外从第一层向第二层连一条半价边。然后在这张状态图上跑一次 Dijkstra 即可。

### 核心代码

```cpp
priority_queue<Node, vector<Node>, greater<Node>> pq;
fill(&dist[0][0], &dist[0][0] + 2 * MAXN, INF);
dist[1][0] = 0, pq.push({0, 1, 0});
while (!pq.empty()){
    auto [d, u, used] = pq.top(); pq.pop();
    if (d != dist[u][used]) continue;
    for (auto [v, w] : adj[u]){
        if (dist[v][used] > d + w)
            dist[v][used] = d + w, pq.push({dist[v][used], v, used});
        if (!used && dist[v][1] > d + w / 2)
            dist[v][1] = d + w / 2, pq.push({dist[v][1], v, 1});
    }
}
```

### 复杂度

时间复杂度 $O((n+m)\log n)$，空间复杂度 $O(n+m)$。

---

## 12. [Cycle Finding](https://cses.fi/problemset/task/1197)

`Bellman-Ford` `负环` `路径还原`

### 题意

给定一张有向带权图，要求判断图中是否存在负环；如果存在，要输出一个负环上的点序列。

### 分析

要找“任意位置”的负环，最方便的写法是把所有点的初始距离都设成 `0`，等价于从一个超级源向所有点连零边。随后跑 `n` 轮 Bellman-Ford：若第 `n` 轮仍然发生松弛，就说明图中存在负环。

真正难的是把环捞出来。设最后一次被松弛的点是 `x`，先顺着前驱走 `n` 次，把它强行推进到环里；此后再从这个点继续沿前驱走，直到再次回到起点，中间经过的点就是一整个负环。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) dist[i] = 0;
for (int i = 1; i <= n; i++){
    x = 0;
    for (auto [u, v, w] : edges)
        if (dist[v] > dist[u] + w)
            dist[v] = dist[u] + w, pre[v] = u, x = v;
}
if (x){
    for (int i = 1; i <= n; i++) x = pre[x];
    int y = x;
    do cyc.push_back(y), y = pre[y]; while (y != x);
    cyc.push_back(x);
    reverse(cyc.begin(), cyc.end());
}
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(n+m)$。

---

## 13. [Flight Routes](https://cses.fi/problemset/task/1196)

`最短路` `K短路` `优先队列`

### 题意

在有向带权图中，要求输出从城市 `1` 到城市 `n` 的前 `k` 小路线代价。路线允许重复经过同一个城市。

### 分析

因为允许重复点，这题不是 DAG DP，而是经典的“弹出 `k` 次终点”的 Dijkstra 变体。对于每个点，记录它已经从优先队列中以最短路身份弹出过多少次；某个点第 `t` 次弹出时，对应的就是到它的第 `t` 小路径代价。

于是只要继续扩展，直到终点 `n` 被弹出 `k` 次为止，依次收集这些代价即可。这个做法成立，是因为所有边权为正，优先队列保证了全局代价按从小到大展开。

### 核心代码

```cpp
priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<pair<long long,int>>> pq;
pq.push({0, 1});
while (!pq.empty()){
    auto [d, u] = pq.top(); pq.pop();
    if (cnt[u] == k) continue;
    cnt[u]++;
    if (u == n) ans.push_back(d);
    for (auto [v, w] : adj[u])
        if (cnt[v] < k) pq.push({d + w, v});
}
```

### 复杂度

时间复杂度 $O(km\log(km))$，空间复杂度 $O(km)$。

---

## 14. [Round Trip II](https://cses.fi/problemset/task/1678)

`有向图` `找环` `DFS染色`

### 题意

在有向图中寻找一个有向环，要求输出经过的城市序列；如果图中没有有向环，输出无解。

### 分析

有向图里，真正危险的不是“访问过”，而是“仍在当前递归栈中”。因此常用三色标记：`0` 未访问，`1` 正在递归栈中，`2` 已经处理完成。若从 `u` 走到一个颜色仍为 `1` 的点 `v`，说明找到了一条回边，这个回边和递归栈上的一段路径拼起来就是一个有向环。

和无向图不同，这里不能用“不是父亲就成环”来判断，因为边有方向。环的恢复方式也改成沿前驱从 `u` 回溯到 `v`。

### 核心代码

```cpp
bool dfs(int u){
    col[u] = 1;
    for (int v : adj[u]){
        if (!col[v]){
            pre[v] = u;
            if (dfs(v)) return true;
        } else if (col[v] == 1){
            cyc.push_back(v);
            for (int x = u; x != v; x = pre[x]) cyc.push_back(x);
            cyc.push_back(v);
            reverse(cyc.begin(), cyc.end());
            return true;
        }
    }
    col[u] = 2;
    return false;
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 15. [Course Schedule](https://cses.fi/problemset/task/1679)

`拓扑排序` `DAG` `Kahn`

### 题意

给出若干先修关系 `a -> b`，要求输出一个完成全部课程的合法顺序；如果不存在这样的顺序，输出无解。

### 分析

这题就是拓扑排序的原型。把每门课程的入度算出来，把所有入度为 `0` 的点先放进队列；每弹出一门课，就等于把它对后继课程的限制解除一层。最终若能弹出全部课程，得到的顺序就是一个合法学习顺序。

如果最后只弹出了部分点，说明剩下的点之间互相卡成了环，先修关系自相矛盾，因此不存在可行顺序。

### 核心代码

```cpp
queue<int> q;
for (int i = 1; i <= n; i++) if (indeg[i] == 0) q.push(i);
while (!q.empty()){
    int u = q.front(); q.pop();
    ord.push_back(u);
    for (int v : adj[u])
        if (--indeg[v] == 0) q.push(v);
}
ok = ((int)ord.size() == n);
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 16. [Longest Flight Route](https://cses.fi/problemset/task/1680)

`DAG` `最长路` `路径还原`

### 题意

在一张保证无有向环的航线图中，从城市 `1` 飞到城市 `n`，要求经过尽量多的城市，并输出一条达到最大长度的路线；若无法到达，输出无解。

### 分析

一般图里的最长路很难，但 DAG 里的最长路可以沿拓扑序做 DP。设 `dp[v]` 表示从 `1` 到 `v` 最多能经过多少个点，那么在拓扑序里处理边 `u -> v` 时，只要尝试用 `dp[u] + 1` 更新 `dp[v]`，并顺手记录前驱即可。

这题和最短路最大的区别，是“不可达”必须单独表示成负无穷，而不能默认成 `0`，否则那些本来压根到不了 `1` 的点也会错误参与转移。

### 核心代码

```cpp
fill(dp + 1, dp + n + 1, -INF);
dp[1] = 1;
for (int u : topo){
    if (dp[u] < 0) continue;
    for (int v : adj[u]){
        if (dp[v] < dp[u] + 1){
            dp[v] = dp[u] + 1;
            pre[v] = u;
        }
    }
}
for (int x = n; x; x = pre[x]) path.push_back(x);
reverse(path.begin(), path.end());
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 17. [Game Routes](https://cses.fi/problemset/task/1681)

`DAG` `路径计数` `拓扑DP`

### 题意

在一张无环有向图中，要求计算从关卡 `1` 到关卡 `n` 一共有多少条不同路线，答案对 `10^9+7` 取模。

### 分析

只要图是 DAG，路径计数就可以沿拓扑序传播。设 `dp[u]` 表示从 `1` 到 `u` 的路线数，那么每条边 `u -> v` 都会把 `dp[u]` 贡献给 `dp[v]`。因为不存在环，某个点的所有前驱都会在它之前被处理完，状态不会反复打架。

这题的核心手感是：拓扑序不仅能判环、排顺序，也是一种“把所有依赖一次性排平”的 DP 处理顺序。

### 核心代码

```cpp
const int MOD = 1000000007;
dp[1] = 1;
for (int u : topo){
    for (int v : adj[u]){
        dp[v] += dp[u];
        if (dp[v] >= MOD) dp[v] -= MOD;
    }
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 18. [Investigation](https://cses.fi/problemset/task/1202)

`最短路` `Dijkstra` `计数DP`

### 题意

从城市 `1` 飞到城市 `n`，要求同时回答四件事：最小花费、最小花费路线条数、最少航班数、最多航班数。

### 分析

四个问题看似不同，其实都绑在“最短路 DAG”上。跑 Dijkstra 时，若发现更短的路，就直接覆盖 `dist[v]`，同时把路径条数、最少边数、最多边数都继承自 `u`；若发现一条与当前最短路等长的新路线，则不是覆盖，而是把计数累加、最少边数取更小、最多边数取更大。

换句话说，`dist` 决定是否允许转移，而其余三个数组只是跟着最短路条件同步维护的附加信息。真正不能做错的，是“等长更新”这一个分支。

### 核心代码

```cpp
dist[1] = 0, ways[1] = 1;
priority_queue<Node, vector<Node>, greater<Node>> pq;
pq.push({0, 1});
while (!pq.empty()){
    auto [d, u] = pq.top(); pq.pop();
    if (d != dist[u]) continue;
    for (auto [v, w] : adj[u]){
        if (dist[v] > d + w){
            dist[v] = d + w;
            ways[v] = ways[u];
            mn[v] = mn[u] + 1;
            mx[v] = mx[u] + 1;
            pq.push({dist[v], v});
        } else if (dist[v] == d + w){
            ways[v] = (ways[v] + ways[u]) % MOD;
            mn[v] = min(mn[v], mn[u] + 1);
            mx[v] = max(mx[v], mx[u] + 1);
        }
    }
}
```

### 复杂度

时间复杂度 $O((n+m)\log n)$，空间复杂度 $O(n+m)$。

# 三、把图压成更稳的骨架

这一章开始，原图经常已经不是最终要做题的那张图了。功能图要拆成“树指向环”，强连通分量要缩成 DAG，二元选择要改写成蕴含图。你越早接受“先改造结构再求答案”这件事，后面的题会越顺。

## 19. [Planets Queries I](https://cses.fi/problemset/task/1750)

`功能图` `倍增` `跳跃`

### 题意

每个星球都有一条传送门指向某个星球。多次询问：从星球 `x` 出发，连续走 `k` 次传送门后会到达哪里。

### 分析

这是最标准的倍增跳跃。设 `up[j][u]` 表示从 `u` 出发走 `2^j` 步后会到达的点，那么有递推 `up[j][u] = up[j-1][ up[j-1][u] ]`。查询时把 `k` 按二进制拆开，哪一位为 `1` 就跳对应的幂次。

功能图里虽然有环，但这里根本不需要显式找环，因为问题只问“第 `k` 步落在哪”，倍增本身就把长链和大环统一处理掉了。

### 核心代码

```cpp
for (int u = 1; u <= n; u++) up[0][u] = to[u];
for (int j = 1; j < LOG; j++)
    for (int u = 1; u <= n; u++)
        up[j][u] = up[j - 1][up[j - 1][u]];
int jump(int u, long long k){
    for (int j = 0; j < LOG; j++)
        if (k >> j & 1) u = up[j][u];
    return u;
}
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(\log n)$，空间复杂度 $O(n\log n)$。

---

## 20. [Planets Queries II](https://cses.fi/problemset/task/1160)

`功能图` `环树分解` `倍增`

### 题意

每个星球有且只有一条传送门。多次询问：从星球 `a` 出发，最少传送多少次可以到达星球 `b`；若无法到达，输出 `-1`。

### 分析

功能图的形状是“若干棵反向树挂在一个环上”。因此可达性只有三种：树上节点向上追祖先，树节点先爬到环再沿环转，或者环上节点沿环转；而从环走回树里则永远不可能。

做法是先把所有环找出来，给每个点记录所属环、到环的距离 `dep`、环上位置 `pos` 与环长 `len`，同时保留倍增表便于向前跳。若 `b` 在树上，就只能要求 `a` 比 `b` 更深且跳上去正好等于 `b`；若 `b` 在环上，就让 `a` 先跳到环，再按环上的位置差补上步数。

### 核心代码

```cpp
int jump(int u, int k){
    for (int j = 0; j < LOG; j++) if (k >> j & 1) u = up[j][u];
    return u;
}
int query(int a, int b){
    if (comp[a] != comp[b]) return -1;
    if (dep[b] > 0){
        if (dep[a] < dep[b]) return -1;
        int d = dep[a] - dep[b];
        return jump(a, d) == b ? d : -1;
    }
    int c = jump(a, dep[a]);
    int cyc = (pos[b] - pos[c] + len[comp[a]]) % len[comp[a]];
    return dep[a] + cyc;
}
```

### 复杂度

预处理时间复杂度 $O(n\log n)$，单次查询时间复杂度 $O(\log n)$，空间复杂度 $O(n\log n)$。

---

## 21. [Planets Cycles](https://cses.fi/problemset/task/1751)

`功能图` `拓扑剥叶` `反图DP`

### 题意

从每个星球出发不断沿传送门前进，直到第一次走到已经访问过的星球。要求对每个起点，输出总共会经历多少次传送。

### 分析

功能图里，答案等于“先走到所属环的距离 + 该环长度”。因此先用入度拓扑剥掉所有不在环上的点，剩下的点全是各个环；每个环上的点答案都等于环长。

接着沿反图从环向外做 DFS 或 BFS。若 `u -> v`，且我们已经知道 `v` 的答案，那么 `u` 的答案就是 `ans[v] + 1`。于是树上的答案会一层一层向外传开。

### 核心代码

```cpp
queue<int> q;
for (int i = 1; i <= n; i++) if (indeg[i] == 0) q.push(i);
while (!q.empty()){
    int u = q.front(); q.pop();
    removed[u] = 1;
    if (--indeg[to[u]] == 0) q.push(to[u]);
}
for (int i = 1; i <= n; i++) if (!removed[i] && !ans[i]){
    vector<int> cyc;
    for (int u = i; !vis[u]; u = to[u]) vis[u] = 1, cyc.push_back(u);
    for (int u : cyc) ans[u] = cyc.size(), dfs_rev(u);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 22. [Road Reparation](https://cses.fi/problemset/task/1675)

`最小生成树` `Kruskal` `并查集`

### 题意

给定若干城市和每条道路的修复费用，要求选择一些道路修复，使任意两城连通且总费用最小；若无法做到，输出无解。

### 分析

这是最小生成树原题，Kruskal 足够直接。先按边权从小到大排序，依次尝试加入边；若这条边连接了两个尚未连通的并查集，就把它纳入答案，否则跳过。这样拿到的是总权值最小的生成森林。

最后若成功加入了 `n-1` 条边，说明整张图被拉成了一棵树；否则原图本身就不连通，再怎么选也无法让所有城市互通。

### 核心代码

```cpp
sort(edges.begin(), edges.end());
for (auto [w, u, v] : edges){
    u = find(u), v = find(v);
    if (u == v) continue;
    fa[u] = v;
    ans += w;
    cnt++;
}
ok = (cnt == n - 1);
```

### 复杂度

时间复杂度 $O(m\log m)$，空间复杂度 $O(n)$。

---

## 23. [Road Construction](https://cses.fi/problemset/task/1676)

`并查集` `动态连通块` `维护答案`

### 题意

初始时没有道路，之后每天加入一条新路。每次加入之后，都要输出当前连通块数量，以及最大连通块的大小。

### 分析

边只会新增，不会删除，所以并查集是最自然的在线维护结构。初始时每个点自成一个连通块，数量为 `n`，最大块大小为 `1`。每来一条新边，只要看两端是否属于不同集合：若是，就把两个集合合并，连通块数减一，同时更新新集合大小和历史最大值。

这题的关键是意识到它根本不是“重新做一遍 DFS”的动态图题，而只是并查集的两个量的维护。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) fa[i] = i, sz[i] = 1;
comp = n, best = 1;
for (auto [u, v] : add){
    u = find(u), v = find(v);
    if (u != v){
        if (sz[u] < sz[v]) swap(u, v);
        fa[v] = u;
        sz[u] += sz[v];
        comp--;
        best = max(best, sz[u]);
    }
}
```

### 复杂度

均摊时间复杂度 $O(mlpha(n))$，空间复杂度 $O(n)$。

---

## 24. [Flight Routes Check](https://cses.fi/problemset/task/1682)

`强连通` `正反图DFS` `构造反例`

### 题意

给定一张有向图，要求判断是否任意城市都能到任意城市；若不能，需要给出一对 `a,b`，使得无法从 `a` 走到 `b`。

### 分析

要判断整张图是否强连通，只需任选一个基准点，例如 `1`。若从 `1` 在原图里无法到某个点 `x`，那就有 `1 -> x` 不可达；若在反图里从 `1` 无法到某个点 `x`，等价于原图里 `x -> 1` 不可达。只要这两个检查都通过，整张图就是强连通的。

这题很妙的地方在于，不需要真正跑 SCC。因为题目只要求 YES/NO 和一组反例，而强连通的定义恰好能被“一次正图 + 一次反图”完全刻画。

### 核心代码

```cpp
dfs1(1);
for (int i = 1; i <= n; i++)
    if (!vis1[i]){ a = 1, b = i; ok = false; }
dfs2(1);
for (int i = 1; i <= n; i++)
    if (!vis2[i]){ a = i, b = 1; ok = false; }
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 25. [Planets and Kingdoms](https://cses.fi/problemset/task/1683)

`强连通分量` `Kosaraju` `缩点`

### 题意

给定一张有向图，要求把所有点划分到若干个 kingdom 中，满足同一个 kingdom 内任意两点互相可达，并输出总数与每个点所属编号。

### 分析

这就是强连通分量分解。Kosaraju 的思路很干净：第一次 DFS 按离开时间压栈，第二次在反图上按这个逆序重新 DFS，每次扩出的整块就是一个 SCC。

因为题目只要求分组编号，不需要再在缩点 DAG 上做别的事情，所以做到给每个点打上 SCC 号即可。但从结构上看，输出的这些 kingdom，本质上就是把原图压成了一张 DAG 之后的节点。

### 核心代码

```cpp
void dfs1(int u){
    vis[u] = 1;
    for (int v : g[u]) if (!vis[v]) dfs1(v);
    ord.push_back(u);
}
void dfs2(int u, int c){
    comp[u] = c;
    for (int v : rg[u]) if (!comp[v]) dfs2(v, c);
}
for (int i = 1; i <= n; i++) if (!vis[i]) dfs1(i);
reverse(ord.begin(), ord.end());
for (int u : ord) if (!comp[u]) dfs2(u, ++scc);
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 26. [Giant Pizza](https://cses.fi/problemset/task/1684)

`2-SAT` `蕴含图` `强连通分量`

### 题意

每位家庭成员会给出两个关于配料的愿望，每个人只要求这两个愿望里至少有一个为真。需要判断能否给每种配料决定“放”或“不放”，使所有人满意；若能，输出一种方案。

### 分析

每种配料只有两种状态，天然对应布尔变量。一个愿望对 `(x \lor y)` 的要求，可以翻译成两条蕴含：`
eg x -> y` 与 `
eg y -> x`。把所有约束都丢进蕴含图后，若某个变量和它的否定落在同一个 SCC 里，就出现了逻辑自相矛盾，无解。

若可行，则按 SCC 的拓扑后序赋值：通常编号更靠后的 SCC 代表更“先被确定”的真值，把变量所在 SCC 与否定所在 SCC 比较大小，就能构造出一组满足所有子句的答案。

### 核心代码

```cpp
auto add_or = [&](int x, int y){
    add_edge(x ^ 1, y);
    add_edge(y ^ 1, x);
};
for (auto [a, b] : clause) add_or(a, b);
tarjan();
for (int i = 0; i < m; i++){
    if (scc[i << 1] == scc[i << 1 | 1]) ok = false;
    ans[i] = (scc[i << 1] < scc[i << 1 | 1]);
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 27. [Coin Collector](https://cses.fi/problemset/task/1686)

`强连通分量` `缩点DAG` `DP`

### 题意

有向图的每个房间里有若干金币，可以自由选择起点和终点，沿有向边移动时收集经过房间的金币。要求最大化能收集到的金币总数。

### 分析

同一个 SCC 内部可以互相到达，所以只要进入这个 SCC，就能把里面所有金币都拿干净；因此第一步是缩点，把每个 SCC 的金币总和压成一个新点权。缩点之后得到 DAG，问题就变成：在 DAG 上任选起点终点，求最大路径点权和。

DAG 上的最大路径和直接做拓扑 DP 即可。设 `dp[c]` 表示走到 SCC `c` 能拿到的最多金币，那么遍历 DAG 边 `c -> d` 时，用 `dp[c] + sum[d]` 更新 `dp[d]`。

### 核心代码

```cpp
tarjan();
for (int u = 1; u <= n; u++){
    sum[scc[u]] += coin[u];
    for (int v : adj[u]) if (scc[u] != scc[v]) dag[scc[u]].push_back(scc[v]);
}
for (int c = 1; c <= scc_cnt; c++) dp[c] = sum[c];
for (int c : topo)
    for (int d : dag[c])
        dp[d] = max(dp[d], dp[c] + sum[d]);
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

# 四、把边走完，把状态走满

这里开始，题目会明显更“构造化”。有些题要求每条边恰好经过一次，于是欧拉路登场；有些题要求每个点只经过一次，于是状态压缩和启发式搜索接管舞台。你会发现，图论做到这里，已经越来越像在和结构条件做交易：一旦条件满足，答案就可以被整齐地拉出来。

## 28. [Mail Delivery](https://cses.fi/problemset/task/1691)

`欧拉回路` `Hierholzer` `无向图`

### 题意

在无向图中，邮差要从路口 `1` 出发并回到 `1`，且每条街道都恰好走一次。要求输出一条这样的路线；若不存在，输出无解。

### 分析

无向图存在欧拉回路的条件有两个：所有非零度点都在同一个连通块里，且每个点度数都是偶数。题目还要求从 `1` 出发并回到 `1`，所以所有实际用到的边也必须和 `1` 处在同一块里。

条件满足后，用 Hierholzer 算法沿未使用边不断往前走，走不动了就回退并把点压进答案。最后得到的逆序点列就是欧拉回路。若答案长度不是 `m+1`，说明仍有边没被走到，也应判无解。

### 核心代码

```cpp
void dfs(int u){
    while (ptr[u] < (int)adj[u].size()){
        auto [v, id] = adj[u][ptr[u]++];
        if (used[id]) continue;
        used[id] = 1;
        dfs(v);
    }
    path.push_back(u);
}
for (int i = 1; i <= n; i++) if (deg[i] & 1) ok = false;
dfs(1);
reverse(path.begin(), path.end());
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 29. [De Bruijn Sequence](https://cses.fi/problemset/task/1692)

`欧拉回路` `构造` `状态图`

### 题意

给定整数 `n`，要求构造一个尽量短的二进制串，使所有长度为 `n` 的二进制串都作为子串出现至少一次。

### 分析

把长度为 `n-1` 的二进制串看成图上的点。若一个点后面接上 `0` 或 `1`，就会得到一条长度为 `n` 的串，这条串对应一条有向边，边的终点是去掉最高位后的后 `n-1` 位。这样，每条边恰好对应一个长度为 `n` 的串，而题目要求每种长度为 `n` 的串都出现一次，正好就是要求在这张图上走一条欧拉回路。

因此构造过程变成在这张每点出度为 `2` 的图上跑 Hierholzer。最后答案由起始的 `n-1` 个 `0`，再加上欧拉回路经过边时附带的最后一位字符拼起来。

### 核心代码

```cpp
void dfs(int u){
    for (int b = 0; b < 2; b++) if (!used[u][b]){
        used[u][b] = 1;
        int v = ((u << 1) & mask) | b;
        dfs(v);
        seq.push_back(char('0' + b));
    }
}
if (n == 1) ans = "01";
else dfs(0), reverse(seq.begin(), seq.end()), ans = string(n - 1, '0') + seq;
```

### 复杂度

时间复杂度 $O(2^n)$，空间复杂度 $O(2^n)$。

---

## 30. [Teleporters Path](https://cses.fi/problemset/task/1693)

`欧拉路径` `有向图` `Hierholzer`

### 题意

在有向图中，要求从关卡 `1` 出发到关卡 `n` 结束，并且每条传送门都恰好使用一次；若无法做到，输出无解。

### 分析

这是有向图欧拉路径。存在条件是：起点 `1` 满足 `out-in=1`，终点 `n` 满足 `in-out=1`，其余所有点入度等于出度；同时所有实际会用到的边必须在忽略方向后与主路径连通。条件不满足时，无论怎么走都不可能刚好从 `1` 开到 `n`。

满足条件后照样用 Hierholzer。只是最终得到的路径必须长度恰好为 `m+1` 且首尾分别是 `1` 和 `n`，否则说明图里还有别的边块没有被纳入主路径。

### 核心代码

```cpp
void dfs(int u){
    while (ptr[u] < (int)adj[u].size()){
        int v = adj[u][ptr[u]++];
        dfs(v);
    }
    path.push_back(u);
}
if (out[1] != in[1] + 1 || in[n] != out[n] + 1) ok = false;
for (int i = 2; i < n; i++) if (in[i] != out[i]) ok = false;
dfs(1);
reverse(path.begin(), path.end());
ok &= ((int)path.size() == m + 1 && path.front() == 1 && path.back() == n);
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---

## 31. [Hamiltonian Flights](https://cses.fi/problemset/task/1690)

`状态压缩DP` `哈密顿路径` `DAG式转移`

### 题意

在有向图中，从城市 `1` 到城市 `n`，要求恰好访问每座城市一次，问这样的路线有多少条，答案对 `10^9+7` 取模。

### 分析

点数只有 `20`，明显是在向状态压缩招手。设 `dp[mask][u]` 表示已经访问了 `mask` 中这些点，并且最后停在 `u` 的方案数。若 `u -> v` 有边，且 `v` 尚未访问，就能转移到 `dp[mask | (1<<v)][v]`。

由于起点固定是 `1`、终点固定是 `n`，可以做一点剪枝：中途不必把 `n` 当作普通点提前扩展，否则会产生很多无意义状态。最终答案就是访问了所有点且停在 `n` 的那一格。

### 核心代码

```cpp
const int MOD = 1000000007;
dp[1][0] = 1;
for (int mask = 1; mask < (1 << n); mask++){
    if (!(mask & 1)) continue;
    if ((mask & (1 << (n - 1))) && mask != (1 << n) - 1) continue;
    for (int u = 0; u < n; u++) if (mask >> u & 1)
        for (int v : radj[u]) if (mask >> v & 1)
            dp[mask][u] = (dp[mask][u] + dp[mask ^ (1 << u)][v]) % MOD;
}
ans = dp[(1 << n) - 1][n - 1];
```

### 复杂度

时间复杂度 $O(2^n n^2)$，空间复杂度 $O(2^n n)$。

---

## 32. [Knight's Tour](https://cses.fi/problemset/task/1689)

`搜索` `Warnsdorff` `构造`

### 题意

给定骑士在 $8\times 8$ 棋盘上的起点，要求输出一种骑士巡游方案，使骑士恰好访问每个格子一次。

### 分析

裸 DFS 虽然理论上能搜，但分支太大，很容易在局部卡死。经典做法是 Warnsdorff 启发式：每一步优先走向“后续可选步数最少”的格子。直觉上，这是在尽量先处理窄门，避免把只剩少数入口的位置留到最后。

在 $8\times 8$ 的固定棋盘上，这个启发式几乎就是模板。实现时每次把候选下一步按“下一层可行度数”排序，再递归尝试，通常很快就能构造出完整方案。

### 核心代码

```cpp
bool dfs(int x, int y, int step){
    ord[x][y] = step;
    if (step == 64) return true;
    vector<array<int,3>> cand;
    for (auto [dx, dy] : mv){
        int nx = x + dx, ny = y + dy;
        if (!inside(nx, ny) || ord[nx][ny]) continue;
        cand.push_back({deg(nx, ny), nx, ny});
    }
    sort(cand.begin(), cand.end());
    for (auto [_, nx, ny] : cand) if (dfs(nx, ny, step + 1)) return true;
    ord[x][y] = 0;
    return false;
}
```

### 复杂度

最坏时间复杂度难以精确界定，实践中在固定棋盘上可很快找到解，空间复杂度 $O(64)$。

# 五、让流量替你说出答案

最后这一章里，很多题表面问的是“最大速度”“最少封路”“最多配对”“能走几天”，但这些问法都会在某个瞬间统一变成网络流。真正的关键不是背 Dinic，而是识别：什么时候题目已经在偷偷描述一张容量网络，什么时候最小割本身就是要输出的结构。

## 33. [Download Speed](https://cses.fi/problemset/task/1694)

`最大流` `Dinic` `容量网络`

### 题意

给定一张有向网络，每条连接都有传输速度上限。服务器在点 `1`，下载端在点 `n`，要求求最大下载速度。

### 分析

这就是最大流原型：每条边的速度上限就是容量，要求从源点 `1` 向汇点 `n` 能送出的最大流量。Dinic 的分层图会先用 BFS 找出所有可能参与当前增广的最短层次，再用 DFS 在分层图里尽量多地送流。

因为容量可能很大，阻塞流一次不一定只增广一条路径；而 Dinic 恰好擅长把同一层次结构里的大量可送流量一起处理掉。

### 核心代码

```cpp
bool bfs(){
    fill(level + 1, level + n + 1, -1);
    queue<int> q; q.push(1), level[1] = 0;
    while (!q.empty()){
        int u = q.front(); q.pop();
        for (auto &e : g[u]) if (e.cap && level[e.to] == -1)
            level[e.to] = level[u] + 1, q.push(e.to);
    }
    return level[n] != -1;
}
long long dfs(int u, long long f){
    if (u == n) return f;
    for (int &i = ptr[u]; i < (int)g[u].size(); i++){
        auto &e = g[u][i];
        if (!e.cap || level[e.to] != level[u] + 1) continue;
        long long got = dfs(e.to, min(f, e.cap));
        if (got) return e.cap -= got, g[e.to][e.rev].cap += got, got;
    }
    return 0;
}
```

### 复杂度

时间复杂度在本题规模下可视为 $O(n^2 m)$ 量级，空间复杂度 $O(n+m)$。

---

## 34. [Police Chase](https://cses.fi/problemset/task/1695)

`最小割` `最大流` `残量网络`

### 题意

在无向图中，银行在点 `1`，港口在点 `n`。要求封锁尽量少的街道，使得从银行无法到达港口，并输出这些街道。

### 分析

每条街道都只算封一次，因此把无向边看成容量为 `1` 的双向边后，题目就变成 `1` 到 `n` 的最小割。先跑最大流求出最小割值，再在残量网络里从源点出发做一次 DFS：能到的点属于割的一侧，不能到的点属于另一侧。所有横跨这道边界的原图边，就是一组最小割边。

这题最妙的地方在于，答案不只是一个数。残量网络会直接把“哪一些边恰好卡住了连通性”显影出来。

### 核心代码

```cpp
maxflow();
dfs_res(1);
for (auto [u, v] : edges){
    if (vis[u] && !vis[v]) cut.push_back({u, v});
    else if (vis[v] && !vis[u]) cut.push_back({v, u});
}
```

### 复杂度

时间复杂度与最大流相同，在本题规模下可视为 $O(n^2 m)$ 量级，空间复杂度 $O(n+m)$。

---

## 35. [School Dance](https://cses.fi/problemset/task/1696)

`二分图匹配` `最大流` `构造答案`

### 题意

给定若干男生、女生以及允许配对的关系，要求求出最多能组成多少对舞伴，并输出一种达到最大值的配对方案。

### 分析

二分图最大匹配可以直接转成最大流：源点连所有男生、所有女生连汇点，容量都设为 `1`；男生到女生之间若允许配对，就连一条容量为 `1` 的边。这样每条单位流都恰好对应一对舞伴。

跑完最大流后，只要检查“男生层到女生层”的这些边中，哪些容量被完全用掉了，就能把实际匹配边恢复出来。这也是网络流在构造方案时很顺手的一类题。

### 核心代码

```cpp
for (int i = 1; i <= n; i++) add_edge(S, i, 1);
for (int j = 1; j <= m; j++) add_edge(n + j, T, 1);
for (auto [a, b] : pairable) add_edge(a, n + b, 1);
maxflow();
for (int a = 1; a <= n; a++)
    for (auto &e : g[a])
        if (1 <= e.to - n && e.to - n <= m && e.cap == 0)
            match.push_back({a, e.to - n});
```

### 复杂度

时间复杂度与最大流相同，在本题规模下可视为 $O(V^2 E)$，空间复杂度 $O(V+E)$。

---

## 36. [Distinct Routes](https://cses.fi/problemset/task/1711)

`最大流` `边不相交路径` `路径分解`

### 题意

在有向图中，每条传送门每天至多使用一次。每天都要从房间 `1` 走到房间 `n`，要求求最多能玩多少天，并输出这些路线。

### 分析

“每条边最多用一次，尽量找更多条 `1 -> n` 路线”正是边不相交路径最大数，等价于把每条边容量设为 `1` 后求最大流。最大流值就是能玩的天数。

难点在于把具体路线拆出来。流跑完后，只沿那些流量为 `1` 的边从 `1` 继续 DFS，每找到一条到 `n` 的路，就把这条路上的流量扣掉一次。重复这个过程，直到把全部单位流分解完，得到的就是题目要求的所有路线。

### 核心代码

```cpp
maxflow();
bool extract(int u){
    path.push_back(u);
    if (u == n) return true;
    for (auto &e : g[u]) if (e.flow > 0){
        e.flow--;
        if (extract(e.to)) return true;
        e.flow++;
    }
    path.pop_back();
    return false;
}
for (int i = 0; i < flow; i++){
    path.clear();
    extract(1);
    routes.push_back(path);
}
```

### 复杂度

时间复杂度由最大流主导，在本题规模下可视为 $O(n^2 m)$ 量级；路径分解额外花费 $O(\text{总边数})$，空间复杂度 $O(n+m)$。
