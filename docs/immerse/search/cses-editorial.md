---
title: "CSES 搜索专题精选解题报告"
subtitle: "🎯 30 道经典搜索题目的分析方法、解题思路与核心代码"
order: 2
icon: "🎯"
---

# CSES 搜索专题精选解题报告

> 来源：[CSES Problem Set](https://cses.fi/problemset/)
>
> 本报告从 CSES 的 Introductory Problems、Graph Algorithms、Tree Algorithms、Advanced Techniques 等分类中精选 30 道搜索类题目，逐题给出**题意概述 → 分析方法 → 搜索策略 → 核心代码 → 复杂度**，按技术分组，最后做整体总结。

---

## 1 - Creating Strings（回溯 / 全排列）

### 题意

给定一个长度为 $n$（$n \le 8$）的字符串，按字典序输出它的所有**不同排列**。

### 分析

先将字符串排序，然后通过回溯生成全排列。关键在于同一层递归中跳过重复字符，避免生成重复排列。也可直接用 `next_permutation`。

### 搜索策略

- **状态**：当前已选字符序列
- **搜索方式**：DFS 回溯，每层从可选字符中选一个
- **关键剪枝**：同一层中跳过与前一个相同且前一个未使用的字符
- **答案**：所有不同的排列

### 核心代码

```cpp
string s; // 已排序
bool used[8];
string cur;
void dfs(int dep) {
    if (dep == (int)s.size()) { cout << cur << "\n"; return; }
    for (int i = 0; i < (int)s.size(); i++) {
        if (used[i]) continue;
        if (i > 0 && s[i] == s[i-1] && !used[i-1]) continue;
        used[i] = true;
        cur += s[i];
        dfs(dep + 1);
        cur.pop_back();
        used[i] = false;
    }
}
```

### 复杂度

$O(n! \times n)$ 时间（最坏情况下全不同），$O(n)$ 递归栈。

---

## 2 - Apple Division（子集回溯）

### 题意

$n$（$n \le 20$）个苹果，第 $i$ 个重量为 $p_i$。将苹果分成两组，使两组重量之差最小。

### 分析

$n \le 20$，$2^{20} \approx 10^6$，直接 DFS 枚举每个苹果放入第一组还是第二组即可。

### 搜索策略

- **状态**：$(i,\,\text{sum})$ — 正在决定第 $i$ 个苹果，当前第一组总重为 $\text{sum}$
- **搜索方式**：DFS，每个苹果两种选择（放入 / 不放入第一组）
- **答案**：$\min |2 \times \text{sum} - \text{total}|$

### 核心代码

```cpp
long long ans = LLONG_MAX, total;
void dfs(int i, long long sum) {
    if (i == n) {
        ans = min(ans, abs(2 * sum - total));
        return;
    }
    dfs(i + 1, sum + p[i]);
    dfs(i + 1, sum);
}
```

### 复杂度

$O(2^n)$ 时间，$O(n)$ 递归栈。

---

## 3 - Chessboard and Queens（N 皇后回溯）

### 题意

$8 \times 8$ 棋盘，部分格子标为 `*`（禁止放置皇后）。求放置 $8$ 个互不攻击的皇后的方案数。

### 分析

经典 N 皇后回溯。逐行放置，用数组记录列、主对角线、副对角线的占用情况，并跳过被禁格子。

### 搜索策略

- **状态**：当前行号 $r$
- **搜索方式**：DFS 逐行搜索，每行尝试每列
- **关键剪枝**：列、主对角线 ($r-c$)、副对角线 ($r+c$) 冲突时跳过；`*` 格跳过
- **答案**：成功放满 $8$ 行的方案数

### 核心代码

```cpp
bool col[8], d1[15], d2[15];
char g[8][8];
int ans = 0;
void dfs(int r) {
    if (r == 8) { ans++; return; }
    for (int c = 0; c < 8; c++) {
        if (g[r][c] == '*' || col[c] || d1[r-c+7] || d2[r+c]) continue;
        col[c] = d1[r-c+7] = d2[r+c] = true;
        dfs(r + 1);
        col[c] = d1[r-c+7] = d2[r+c] = false;
    }
}
```

### 复杂度

$O(8!)$（带剪枝），实际搜索量远小于此。

---

## 4 - Grid Paths（网格路径回溯 + 剪枝）

### 题意

$7 \times 7$ 网格，从左上角 $(0,0)$ 走到左下角 $(6,0)$，必须恰好经过每个格子一次。路径长度 $48$ 步，用方向字符串描述（`U/D/L/R`），部分步可能已固定（`?` 表示自由选择）。求满足条件的路径数。

### 分析

纯暴力 $O(3^{48})$ 不可行，需要强力剪枝：(1) 如果当前格将未访问区域分割为不连通的两部分，立即剪枝；(2) 若走到边界且前方是墙，而左右恰好一边可走，则可强制方向。

### 搜索策略

- **状态**：$(r, c, \text{step})$
- **搜索方式**：DFS，按路径字符串约束方向
- **关键剪枝**：连通性剪枝——若当前格的前方被访问且左右两侧都未访问，则路径会割断网格，立即剪枝
- **答案**：合法完整路径数

### 核心代码

```cpp
bool vis[9][9];
int ans = 0;
char path[49];
int dr[] = {-1,1,0,0}, dc[] = {0,0,-1,1};
void dfs(int r, int c, int step) {
    if (r == 6 && c == 0) { if (step == 48) ans++; return; }
    if (step == 48) return;
    // 连通性剪枝：对面已访问而两侧都未访问 → 会断开
    if (vis[r-1+1][c+1] && vis[r+1+1][c+1] && !vis[r][c-1+1] && !vis[r][c+1+1]) return;
    if (vis[r][c-1+1] && vis[r][c+1+1] && !vis[r-1+1][c+1] && !vis[r+1+1][c+1]) return;
    auto tryDir = [&](int d) {
        int nr = r+dr[d], nc = c+dc[d];
        if (nr<0||nr>6||nc<0||nc>6||vis[nr+1][nc+1]) return;
        vis[nr+1][nc+1] = true;
        dfs(nr, nc, step+1);
        vis[nr+1][nc+1] = false;
    };
    if (path[step] != '?') tryDir(string("UDLR").find(path[step]));
    else for (int d = 0; d < 4; d++) tryDir(d);
}
```

### 复杂度

理论 $O(3^{48})$，实际剪枝后约 $10^7$ 级别，可在数秒内完成。

---

## 5 - Counting Rooms（DFS / Flood Fill）

### 题意

$N \times M$（$N,M \le 1000$）的网格地图，`.` 表示地板，`#` 表示墙壁。求地板的**连通区域数**。

### 分析

对每个未访问的 `.` 格子启动一次 DFS/BFS（Flood Fill），每次启动计数器加 $1$。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS 四方向扩展
- **答案**：DFS 启动次数

### 核心代码

```cpp
bool vis[1000][1000];
void dfs(int r, int c) {
    if (r < 0 || r >= N || c < 0 || c >= M) return;
    if (vis[r][c] || grid[r][c] == '#') return;
    vis[r][c] = true;
    for (int d = 0; d < 4; d++)
        dfs(r + dr[d], c + dc[d]);
}
int ans = 0;
for (int i = 0; i < N; i++)
    for (int j = 0; j < M; j++)
        if (!vis[i][j] && grid[i][j] == '.') { dfs(i, j); ans++; }
```

### 复杂度

$O(NM)$ 时间与空间。

---

## 6 - Labyrinth（BFS 最短路径）

### 题意

$N \times M$ 的网格迷宫，`A` 为起点，`B` 为终点，`.` 可通行，`#` 为墙。求从 `A` 到 `B` 的最短路径并输出方向字符串，不可达输出 `NO`。

### 分析

BFS 求无权图最短路。记录每个格子是从哪个方向到达的，从终点回溯即可还原路径。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 四方向扩展
- **关键技巧**：`from[r][c]` 记录来路方向字符，从 `B` 回溯到 `A` 得到路径
- **答案**：最短路径方向字符串

### 核心代码

```cpp
char from[N][M];
int dist[N][M];
memset(dist, -1, sizeof dist);
queue<pair<int,int>> q;
dist[sr][sc] = 0; q.push({sr, sc});
string dirs = "DURL";
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    for (int d = 0; d < 4; d++) {
        int nr = r + dr[d], nc = c + dc[d];
        if (nr<0||nr>=N||nc<0||nc>=M) continue;
        if (grid[nr][nc]=='#'||dist[nr][nc]!=-1) continue;
        dist[nr][nc] = dist[r][c] + 1;
        from[nr][nc] = dirs[d];
        q.push({nr, nc});
    }
}
// 从 B 沿 from[][] 回溯得到路径并翻转
```

### 复杂度

$O(NM)$。

---

## 7 - Monsters（多源 BFS）

### 题意

$N \times M$ 网格，玩家在 `A`，怪物在若干 `M` 位置。所有角色每步同时移动（四方向）。玩家需要在怪物到达前抵达边界格子才能逃出。输出逃生路径或 `NO`。

### 分析

两次 BFS。第一次从所有怪物同时出发（多源 BFS），求出每个格子怪物最早到达的时间 `mt[r][c]`。第二次从玩家出发 BFS，只能走 `pt[r][c] < mt[r][c]` 的格子（玩家先于怪物到达）。到达边界即成功。

### 搜索策略

- **状态**：$(r, c, \text{time})$
- **搜索方式**：先多源 BFS 求怪物到达时间，再单源 BFS 求玩家路径
- **关键技巧**：玩家只能走自己到达时间严格小于怪物到达时间的格子
- **答案**：到达边界的路径方向串

### 核心代码

```cpp
// 1. 多源 BFS：所有怪物同时入队
for (auto [r,c] : monsters) { mt[r][c] = 0; q.push({r,c}); }
while (!q.empty()) {
    auto [r,c] = q.front(); q.pop();
    for (int d = 0; d < 4; d++) {
        int nr = r+dr[d], nc = c+dc[d];
        if (ok(nr,nc) && mt[nr][nc] == -1) {
            mt[nr][nc] = mt[r][c] + 1;
            q.push({nr,nc});
        }
    }
}
// 2. 玩家 BFS，仅当 pt < mt 时可进入
pt[ar][ac] = 0; q.push({ar, ac});
while (!q.empty()) {
    auto [r,c] = q.front(); q.pop();
    if (r==0||r==N-1||c==0||c==M-1) { /* 输出路径 */ }
    for (int d = 0; d < 4; d++) {
        int nr = r+dr[d], nc = c+dc[d];
        if (!ok(nr,nc) || pt[nr][nc]!=-1) continue;
        if (mt[nr][nc]!=-1 && pt[r][c]+1 >= mt[nr][nc]) continue;
        pt[nr][nc] = pt[r][c]+1;
        q.push({nr,nc});
    }
}
```

### 复杂度

$O(NM)$。

---

## 8 - Building Roads（DFS 连通分量）

### 题意

$N$ 个城市，$M$ 条道路（无向图）。求最少需要新建几条道路才能使所有城市连通，并输出新建道路的两端。

### 分析

DFS 求连通分量数 $k$。答案为 $k - 1$ 条新边，将各连通分量的代表节点依次相连。

### 搜索策略

- **状态**：节点编号
- **搜索方式**：DFS 遍历
- **答案**：$k - 1$ 条边，连接相邻连通分量的代表

### 核心代码

```cpp
vector<int> rep;
bool vis[N];
void dfs(int u) {
    vis[u] = true;
    for (int v : adj[u])
        if (!vis[v]) dfs(v);
}
for (int i = 1; i <= n; i++)
    if (!vis[i]) { rep.push_back(i); dfs(i); }
cout << rep.size() - 1 << "\n";
for (int i = 1; i < (int)rep.size(); i++)
    cout << rep[0] << " " << rep[i] << "\n";
```

### 复杂度

$O(N + M)$。

---

## 9 - Message Route（BFS 最短路）

### 题意

$N$ 台电脑，$M$ 条连接（无向图）。求从 $1$ 到 $N$ 的最短路径（边数最少），不可达输出 `IMPOSSIBLE`。

### 分析

BFS 从节点 $1$ 出发，记录 `parent[]` 用于路径还原。

### 搜索策略

- **状态**：节点编号
- **搜索方式**：BFS
- **答案**：$1 \to N$ 的最短路径节点序列

### 核心代码

```cpp
int parent[N+1];
memset(parent, -1, sizeof parent);
queue<int> q;
parent[1] = 0; q.push(1);
while (!q.empty()) {
    int u = q.front(); q.pop();
    for (int v : adj[u]) {
        if (parent[v] != -1) continue;
        parent[v] = u;
        q.push(v);
    }
}
if (parent[n] == -1) { cout << "IMPOSSIBLE"; return; }
vector<int> path;
for (int v = n; v != 0; v = parent[v]) path.push_back(v);
reverse(path.begin(), path.end());
```

### 复杂度

$O(N + M)$。

---

## 10 - Building Teams（BFS 二分图判定）

### 题意

$N$ 名学生，$M$ 对朋友关系。将所有学生分为两队，使得同队中没有朋友。不可能则输出 `IMPOSSIBLE`。

### 分析

等价于二分图判定。BFS 染色：给每个节点染上 $1$ 或 $2$ 色，相邻节点必须不同色。若发现冲突则存在奇环，不可二分。

### 搜索策略

- **状态**：$(v,\,\text{color})$
- **搜索方式**：BFS 二染色
- **关键判断**：若相邻节点同色则 `IMPOSSIBLE`
- **答案**：每个节点的队伍编号

### 核心代码

```cpp
int color[N+1];
memset(color, 0, sizeof color);
bool ok = true;
for (int i = 1; i <= n && ok; i++) {
    if (color[i]) continue;
    queue<int> q; color[i] = 1; q.push(i);
    while (!q.empty() && ok) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!color[v]) { color[v] = 3 - color[u]; q.push(v); }
            else if (color[v] == color[u]) ok = false;
        }
    }
}
```

### 复杂度

$O(N + M)$。

---

## 11 - Round Trip（DFS 无向图找环）

### 题意

$N$ 个城市，$M$ 条道路（无向图）。找一条环路（至少 $3$ 个城市），不存在则输出 `IMPOSSIBLE`。

### 分析

DFS 遍历无向图。当发现一条后向边 $(u, v)$（$v$ 已访问且不是 $u$ 的父亲），即找到了环。从 $u$ 沿 `parent[]` 回溯到 $v$ 即为环路。

### 搜索策略

- **状态**：$(v,\,\text{parent})$
- **搜索方式**：DFS，记录父节点
- **关键技巧**：遇到已访问的非父节点 → 找到环
- **答案**：环上的节点序列

### 核心代码

```cpp
int par[N+1], st = -1, en = -1;
bool vis[N+1];
void dfs(int u, int p) {
    vis[u] = true; par[u] = p;
    for (int v : adj[u]) {
        if (v == p) continue;
        if (vis[v]) { st = v; en = u; return; }
        dfs(v, u);
        if (st != -1) return;
    }
}
// 找到环后从 en 沿 par[] 回溯到 st
```

### 复杂度

$O(N + M)$。

---

## 12 - Round Trip II（DFS 有向图找环）

### 题意

$N$ 个城市，$M$ 条单向航线。找一条有向环路，不存在则输出 `IMPOSSIBLE`。

### 分析

有向图找环需用三色 DFS：白色（未访问）、灰色（递归栈中）、黑色（已完成）。遇到灰色节点即发现有向环。

### 搜索策略

- **状态**：$(v,\,\text{color})$
- **搜索方式**：DFS 三色标记法
- **关键技巧**：灰色节点 → 在栈中 → 形成有向环
- **答案**：环上节点序列

### 核心代码

```cpp
int state[N+1], par[N+1]; // 0=白, 1=灰, 2=黑
int st = -1, en = -1;
void dfs(int u) {
    state[u] = 1;
    for (int v : adj[u]) {
        if (state[v] == 1) { st = v; en = u; return; }
        if (state[v] == 0) { par[v] = u; dfs(v); }
        if (st != -1) return;
    }
    state[u] = 2;
}
// 从 en 沿 par[] 回溯到 st 得到环
```

### 复杂度

$O(N + M)$。

---

## 13 - Shortest Routes I（Dijkstra）

### 题意

$N$ 个节点，$M$ 条有向带权边。求节点 $1$ 到所有其他节点的最短距离。

### 分析

标准 Dijkstra 算法，优先队列实现。所有边权非负。

### 搜索策略

- **状态**：$(v,\,d)$ — 节点及当前最短距离
- **搜索方式**：优先队列 BFS（Dijkstra）
- **关键技巧**：松弛操作，弹出即最优
- **答案**：$\text{dist}[]$ 数组

### 核心代码

```cpp
vector<long long> dist(n+1, LLONG_MAX);
priority_queue<pair<long long,int>, vector<pair<long long,int>>, greater<>> pq;
dist[1] = 0; pq.push({0, 1});
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;
    for (auto [v, w] : adj[u]) {
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            pq.push({dist[v], v});
        }
    }
}
```

### 复杂度

$O((N + M) \log N)$。

---

## 14 - High Score（Bellman-Ford + 负环检测）

### 题意

$N$ 个节点，$M$ 条有向带权边（可为负）。求从 $1$ 到 $N$ 的**最长路径**。若可以无限长，输出 $-1$。

### 分析

最长路等价于取反后求最短路。用 Bellman-Ford 松弛 $N-1$ 轮。第 $N$ 轮若仍能松弛某节点，且该节点可达 $N$，则说明存在从 $1$ 到 $N$ 路径上的正环，答案为 $-1$。

### 搜索策略

- **状态**：$(v,\,\text{dist})$
- **搜索方式**：Bellman-Ford 松弛 $N-1$ 轮
- **关键技巧**：第 $N$ 轮仍可松弛 → 存在负环（取反后为正环）；检查该环是否在 $1 \to N$ 路径上
- **答案**：最长路值或 $-1$

### 核心代码

```cpp
vector<long long> dist(n+1, LLONG_MIN);
dist[1] = 0;
for (int i = 0; i < n - 1; i++)
    for (auto [u, v, w] : edges)
        if (dist[u] != LLONG_MIN)
            dist[v] = max(dist[v], dist[u] + w);
// 再跑 N 轮检测正环
for (int i = 0; i < n; i++)
    for (auto [u, v, w] : edges)
        if (dist[u] != LLONG_MIN && dist[u] + w > dist[v]) {
            dist[v] = LLONG_MAX; // 标记为无穷
        }
if (dist[n] == LLONG_MAX) cout << -1;
else cout << dist[n];
```

### 复杂度

$O(NM)$。

---

## 15 - Cycle Finding（Bellman-Ford 找负环）

### 题意

$N$ 个节点，$M$ 条有向带权边。检测是否存在负环。若存在，输出环上的节点序列。

### 分析

Bellman-Ford 跑 $N$ 轮。若第 $N$ 轮仍有松弛发生，记录被松弛的节点 $x$。沿 `parent[]` 向上回溯 $N$ 步（确保进入环内），再沿环走一圈输出。

### 搜索策略

- **状态**：$(v,\,\text{dist})$
- **搜索方式**：Bellman-Ford $N$ 轮松弛
- **关键技巧**：从第 $N$ 轮松弛的节点回溯 $N$ 步必在环上
- **答案**：负环上的节点序列

### 核心代码

```cpp
vector<long long> dist(n+1, 0);
vector<int> par(n+1, -1);
int last = -1;
for (int i = 0; i < n; i++) {
    last = -1;
    for (auto [u, v, w] : edges)
        if (dist[u] + w < dist[v]) {
            dist[v] = dist[u] + w;
            par[v] = u; last = v;
        }
}
if (last == -1) { cout << "NO\n"; return; }
int x = last;
for (int i = 0; i < n; i++) x = par[x];
vector<int> cycle;
for (int v = x; ; v = par[v]) {
    cycle.push_back(v);
    if (v == x && cycle.size() > 1) break;
}
reverse(cycle.begin(), cycle.end());
```

### 复杂度

$O(NM)$。

---

## 16 - Flight Discount（分层图 Dijkstra）

### 题意

$N$ 个城市，$M$ 条航线，每条有费用。可以选择**一条**航线将费用减半。求 $1 \to N$ 的最小总费用。

### 分析

分层图思想：将状态扩展为 $(v, k)$，$k \in \{0, 1\}$ 表示是否已使用折扣。建立 $2N$ 个节点的图，在 $k=0$ 层可以以半价走某条边并转移到 $k=1$ 层。在扩展图上跑 Dijkstra。

### 搜索策略

- **状态**：$(v,\,k)$ — 节点 $v$，是否已用折扣 $k$
- **搜索方式**：Dijkstra 在分层图上搜索
- **关键技巧**：$k=0$ 层可转移到 $k=1$ 层（使用折扣）
- **答案**：$\min(\text{dist}[N][0],\,\text{dist}[N][1])$

### 核心代码

```cpp
long long dist[N+1][2];
memset(dist, 0x3f, sizeof dist);
priority_queue<tuple<long long,int,int>,
    vector<tuple<long long,int,int>>, greater<>> pq;
dist[1][0] = 0; pq.push({0, 1, 0});
while (!pq.empty()) {
    auto [d, u, k] = pq.top(); pq.pop();
    if (d > dist[u][k]) continue;
    for (auto [v, w] : adj[u]) {
        if (d+w < dist[v][k]) { dist[v][k] = d+w; pq.push({dist[v][k],v,k}); }
        if (k==0 && d+w/2 < dist[v][1]) { dist[v][1] = d+w/2; pq.push({dist[v][1],v,1}); }
    }
}
cout << min(dist[n][0], dist[n][1]);
```

### 复杂度

$O((N + M) \log N)$。

---

## 17 - Flight Routes（K 短路搜索）

### 题意

$N$ 个城市，$M$ 条航线带费用。求从 $1$ 到 $N$ 的前 $k$ 短路径长度。

### 分析

扩展 Dijkstra：允许每个节点被弹出至多 $k$ 次。第 $k$ 次弹出节点 $N$ 时的距离即第 $k$ 短路。

### 搜索策略

- **状态**：$(v,\,d)$
- **搜索方式**：Dijkstra，允许每节点弹出 $k$ 次
- **关键技巧**：`cnt[v]` 记录弹出次数，$\text{cnt}[v] > k$ 时跳过
- **答案**：节点 $N$ 被弹出的前 $k$ 次距离

### 核心代码

```cpp
vector<int> cnt(n+1, 0);
vector<long long> res;
priority_queue<pair<long long,int>,
    vector<pair<long long,int>>, greater<>> pq;
pq.push({0, 1});
while (!pq.empty() && (int)res.size() < k) {
    auto [d, u] = pq.top(); pq.pop();
    cnt[u]++;
    if (cnt[u] > k) continue;
    if (u == n) res.push_back(d);
    for (auto [v, w] : adj[u])
        if (cnt[v] < k) pq.push({d + w, v});
}
```

### 复杂度

$O(kM \log(kM))$。

---

## 18 - Investigation（Dijkstra + 计数 / 统计）

### 题意

$N$ 个城市，$M$ 条航线。求：(1) $1 \to N$ 最短距离；(2) 最短路径条数（模 $10^9+7$）；(3) 最短路中最少航班数；(4) 最短路中最多航班数。

### 分析

Dijkstra 松弛时同步维护路径数 `cnt[]`、最少边数 `minE[]`、最多边数 `maxE[]`。松弛出更短距离时重置，等距时累加/更新。

### 搜索策略

- **状态**：$(v,\,d)$
- **搜索方式**：Dijkstra + 辅助数组
- **关键技巧**：松弛时同步更新 $\text{cnt}$、$\text{minE}$、$\text{maxE}$
- **答案**：$\text{dist}[N]$、$\text{cnt}[N]$、$\text{minE}[N]$、$\text{maxE}[N]$

### 核心代码

```cpp
dist[1] = 0; cnt[1] = 1; minE[1] = maxE[1] = 0;
while (!pq.empty()) {
    auto [d, u] = pq.top(); pq.pop();
    if (d > dist[u]) continue;
    for (auto [v, w] : adj[u]) {
        long long nd = d + w;
        if (nd < dist[v]) {
            dist[v] = nd;
            cnt[v] = cnt[u];
            minE[v] = minE[u] + 1;
            maxE[v] = maxE[u] + 1;
            pq.push({nd, v});
        } else if (nd == dist[v]) {
            cnt[v] = (cnt[v] + cnt[u]) % MOD;
            minE[v] = min(minE[v], minE[u] + 1);
            maxE[v] = max(maxE[v], maxE[u] + 1);
        }
    }
}
```

### 复杂度

$O((N + M) \log N)$。

---

## 19 - Course Schedule（拓扑排序 / BFS Kahn）

### 题意

$N$ 门课程，$M$ 条先修关系（$a$ 必须先于 $b$）。求一个合法的修读顺序，不可能则输出 `IMPOSSIBLE`。

### 分析

经典拓扑排序。Kahn 算法：维护入度数组，将入度为 $0$ 的节点入队，每次出队一个节点并将其邻接节点入度减 $1$。若最终处理节点数 $< N$，则存在环。

### 搜索策略

- **状态**：$(v,\,\text{in-degree})$
- **搜索方式**：BFS，每次取入度为 $0$ 的节点
- **关键判断**：处理完节点数 $< N$ → 有环 → `IMPOSSIBLE`
- **答案**：拓扑序列

### 核心代码

```cpp
vector<int> indeg(n+1, 0), order;
for (int v = 1; v <= n; v++)
    for (int u : adj[v]) indeg[u]++;
queue<int> q;
for (int v = 1; v <= n; v++)
    if (indeg[v] == 0) q.push(v);
while (!q.empty()) {
    int u = q.front(); q.pop();
    order.push_back(u);
    for (int v : adj[u])
        if (--indeg[v] == 0) q.push(v);
}
if ((int)order.size() < n) cout << "IMPOSSIBLE";
```

### 复杂度

$O(N + M)$。

---

## 20 - Longest Flight Route（DAG 最长路）

### 题意

$N$ 个城市，$M$ 条单向航线（有向无环图）。求从 $1$ 到 $N$ 经过城市最多的路线，不可达输出 `IMPOSSIBLE`。

### 分析

先拓扑排序，再按拓扑序在 DAG 上做 DP：$\text{dp}[v] = \max(\text{dp}[u] + 1)$（对所有 $u \to v$ 的边），并记录前驱用于路径还原。

### 搜索策略

- **状态**：$\text{dp}[v]$ = 从 $1$ 到 $v$ 的最长路径长度
- **搜索方式**：拓扑排序后按序线性扫描
- **关键技巧**：拓扑序保证处理 $v$ 时所有前驱已处理
- **答案**：$\text{dp}[N]$ 及路径还原

### 核心代码

```cpp
vector<int> dp(n+1, -1), par(n+1, -1);
dp[1] = 1;
for (int u : topo_order) {
    if (dp[u] == -1) continue;
    for (int v : adj[u]) {
        if (dp[u] + 1 > dp[v]) {
            dp[v] = dp[u] + 1;
            par[v] = u;
        }
    }
}
if (dp[n] == -1) { cout << "IMPOSSIBLE"; return; }
// 从 n 沿 par[] 回溯到 1
```

### 复杂度

$O(N + M)$。

---

## 21 - Game Routes（DAG 路径计数）

### 题意

$N$ 个节点，$M$ 条有向边（DAG）。求从 $1$ 到 $N$ 的路径总数，对 $10^9 + 7$ 取模。

### 分析

拓扑排序后线性 DP：$\text{dp}[v] = \sum_{u \to v} \text{dp}[u]$，初始 $\text{dp}[1] = 1$。

### 搜索策略

- **状态**：$\text{dp}[v]$ = 从 $1$ 到 $v$ 的路径数
- **搜索方式**：拓扑排序后线性扫描
- **答案**：$\text{dp}[N] \bmod (10^9 + 7)$

### 核心代码

```cpp
vector<long long> dp(n+1, 0);
dp[1] = 1;
for (int u : topo_order)
    for (int v : adj[u])
        dp[v] = (dp[v] + dp[u]) % MOD;
cout << dp[n];
```

### 复杂度

$O(N + M)$。

---

## 22 - Flight Routes Check（双向搜索连通性）

### 题意

$N$ 个城市，$M$ 条单向航线。判断是否从每个城市都能到达其他所有城市。若不能，输出一对不可达的 $(a, b)$。

### 分析

从节点 $1$ 在原图 DFS 检查可达性；在反图 DFS 检查反向可达性。若两次 DFS 都访问了所有节点，则图强连通；否则找到未被访问的节点，构造不可达对。

### 搜索策略

- **状态**：$(v,\,\text{visited})$
- **搜索方式**：两次 DFS（原图 + 反图），均从节点 $1$ 出发
- **关键技巧**：原图正搜 + 反图反搜都到达所有点 $\Leftrightarrow$ 强连通
- **答案**：`YES` 或不可达对

### 核心代码

```cpp
void dfs(int u, vector<vector<int>>& g, vector<bool>& vis) {
    vis[u] = true;
    for (int v : g[u]) if (!vis[v]) dfs(v, g, vis);
}
dfs(1, adj, vis1);
dfs(1, radj, vis2);
for (int i = 1; i <= n; i++) {
    if (!vis1[i]) { cout << "NO\n" << 1 << " " << i; return; }
    if (!vis2[i]) { cout << "NO\n" << i << " " << 1; return; }
}
cout << "YES";
```

### 复杂度

$O(N + M)$。

---

## 23 - Planets and Kingdoms（Kosaraju SCC）

### 题意

$N$ 个城市，$M$ 条传送门（有向图）。将城市划分为若干"王国"（强连通分量），输出王国数和每个城市所属王国。

### 分析

Kosaraju 算法：(1) 在原图上 DFS 求出完成时间序（后序）；(2) 按完成时间逆序在反图上 DFS，每次 DFS 启动产生一个 SCC。

### 搜索策略

- **状态**：$(v,\,\text{component\_id})$
- **搜索方式**：两次 DFS（Kosaraju 算法）
- **关键技巧**：第一次 DFS 求完成时间序，第二次按逆序在反图上识别 SCC
- **答案**：SCC 分组

### 核心代码

```cpp
vector<int> order;
void dfs1(int u) {
    vis[u] = true;
    for (int v : adj[u]) if (!vis[v]) dfs1(v);
    order.push_back(u);
}
void dfs2(int u, int id) {
    comp[u] = id;
    for (int v : radj[u]) if (!comp[v]) dfs2(v, id);
}
for (int i = 1; i <= n; i++) if (!vis[i]) dfs1(i);
int cnt = 0;
for (int i = (int)order.size()-1; i >= 0; i--)
    if (!comp[order[i]]) dfs2(order[i], ++cnt);
```

### 复杂度

$O(N + M)$。

---

## 24 - Tree Diameter（两次 BFS 求直径）

### 题意

$N$ 个节点的树，求**直径**（最长路径的边数）。

### 分析

两次 BFS：从任意节点出发找到最远节点 $u$，再从 $u$ 出发找到最远节点 $v$。$u \to v$ 的距离即为直径。

### 搜索策略

- **状态**：$(v,\,\text{dist})$
- **搜索方式**：两次 BFS
- **关键技巧**：任意起点的最远点必为直径端点
- **答案**：直径长度

### 核心代码

```cpp
auto bfs = [&](int src) -> pair<int,int> {
    vector<int> dist(n+1, -1);
    queue<int> q; dist[src] = 0; q.push(src);
    int far = src;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) if (dist[v]==-1) {
            dist[v] = dist[u]+1; q.push(v);
            if (dist[v] > dist[far]) far = v;
        }
    }
    return {far, dist[far]};
};
auto [u, _] = bfs(1);
auto [v, diam] = bfs(u);
cout << diam;
```

### 复杂度

$O(N)$。

---

## 25 - Tree Distances I（三次 BFS 求每点最远距离）

### 题意

$N$ 个节点的树。对每个节点，求它到最远节点的距离。

### 分析

找到直径的两个端点 $a$ 和 $b$（两次 BFS）。对每个节点 $v$，答案为 $\max(\text{dist}(v, a),\,\text{dist}(v, b))$。再做一次从 $b$ 出发的 BFS 即可。

### 搜索策略

- **状态**：$(v,\,\text{dist\_a},\,\text{dist\_b})$
- **搜索方式**：三次 BFS（找端点 $a$、从 $a$ 找端点 $b$ 并记录距离、从 $b$ 记录距离）
- **答案**：$\max(\text{dist\_a}[v],\,\text{dist\_b}[v])$ 对每个 $v$

### 核心代码

```cpp
auto bfs = [&](int src, vector<int>& dist) {
    fill(dist.begin(), dist.end(), -1);
    queue<int> q; dist[src] = 0; q.push(src);
    int far = src;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) if (dist[v]==-1) {
            dist[v] = dist[u]+1; q.push(v);
            if (dist[v] > dist[far]) far = v;
        }
    }
    return far;
};
int a = bfs(1, da);
int b = bfs(a, da);
bfs(b, db);
for (int i = 1; i <= n; i++)
    cout << max(da[i], db[i]) << " \n"[i==n];
```

### 复杂度

$O(N)$。

---

## 26 - Download Speed（最大流 / BFS 增广路）

### 题意

$N$ 台电脑，$M$ 条网络连接，每条有容量。求电脑 $1$ 到电脑 $N$ 的最大数据传输速率（最大流）。

### 分析

Edmonds-Karp 算法：在残余图上反复用 BFS 找最短增广路，沿路径推送流量，直到无增广路。

### 搜索策略

- **状态**：$(v,\,\text{remaining\_cap})$
- **搜索方式**：反复 BFS 在残余图中搜索增广路
- **关键技巧**：BFS 保证最短增广路，总轮数 $O(VE)$
- **答案**：最大流量

### 核心代码

```cpp
struct Edge { int to, rev; long long cap; };
vector<Edge> graph[N];
void addEdge(int u, int v, long long c) {
    graph[u].push_back({v,(int)graph[v].size(),c});
    graph[v].push_back({u,(int)graph[u].size()-1,0});
}
long long maxflow(int s, int t) {
    long long flow = 0;
    while (true) {
        vector<int> par(n+1,-1), pe(n+1);
        queue<int> q; par[s]=s; q.push(s);
        while (!q.empty() && par[t]==-1) {
            int u = q.front(); q.pop();
            for (int i = 0; i < (int)graph[u].size(); i++) {
                auto& e = graph[u][i];
                if (par[e.to]==-1 && e.cap>0) { par[e.to]=u; pe[e.to]=i; q.push(e.to); }
            }
        }
        if (par[t]==-1) break;
        long long aug = LLONG_MAX;
        for (int v=t;v!=s;v=par[v]) aug=min(aug,graph[par[v]][pe[v]].cap);
        for (int v=t;v!=s;v=par[v]) {
            graph[par[v]][pe[v]].cap -= aug;
            graph[v][graph[par[v]][pe[v]].rev].cap += aug;
        }
        flow += aug;
    }
    return flow;
}
```

### 复杂度

$O(VE^2)$。

---

## 27 - School Dance（二分匹配 / DFS 增广路）

### 题意

$N$ 个男生，$M$ 个女生，$K$ 对可能的舞伴关系。求最大匹配数并输出配对方案。

### 分析

二分图最大匹配。匈牙利算法：对每个男生用 DFS 尝试找增广路——如果目标女生未匹配则直接配对，如果已匹配则递归尝试重新匹配她的伴侣。

### 搜索策略

- **状态**：$(boy,\,girl,\,\text{matched})$
- **搜索方式**：对每个男生 DFS 搜索增广路
- **关键技巧**：已匹配女生的伴侣递归尝试换人
- **答案**：最大匹配数与配对

### 核心代码

```cpp
int matchG[M+1];
bool vis[M+1];
bool dfs(int u) {
    for (int v : adj[u]) {
        if (vis[v]) continue;
        vis[v] = true;
        if (matchG[v] == 0 || dfs(matchG[v])) {
            matchG[v] = u;
            return true;
        }
    }
    return false;
}
int ans = 0;
for (int u = 1; u <= n; u++) {
    memset(vis, false, sizeof vis);
    if (dfs(u)) ans++;
}
```

### 复杂度

$O(V \times E)$。

---

## 28 - Distinct Routes（最大流 + 路径分解）

### 题意

$N$ 个城市，$M$ 条航线。求 $1 \to N$ 的最大边不相交路径数，并输出每条路径。

### 分析

将每条边容量设为 $1$，用最大流求出 $1 \to N$ 的最大流量即为路径数。然后在有流的边上 DFS 分解出各条路径。

### 搜索策略

- **状态**：$(v,\,\text{flow})$
- **搜索方式**：Edmonds-Karp 求最大流 + DFS 分解路径
- **关键技巧**：路径分解时每次从 $1$ 出发沿有流的边 DFS 到 $N$，走过的边流量减 $1$
- **答案**：路径数和各路径

### 核心代码

```cpp
// 最大流同第 26 题（边容量均为 1）
int f = maxflow(1, n);
cout << f << "\n";
for (int i = 0; i < f; i++) {
    vector<int> path = {1};
    int u = 1;
    while (u != n) {
        for (auto& e : graph[u]) {
            if (e.to != 0 && e.cap == 0) { // 原边已用
                e.cap = 1; // 恢复
                graph[e.to][e.rev].cap = 0;
                u = e.to; path.push_back(u);
                break;
            }
        }
    }
    cout << path.size() << "\n";
    for (int v : path) cout << v << " ";
    cout << "\n";
}
```

### 复杂度

最大流 $O(VE^2)$，路径分解 $O(f \times N)$。

---

## 29 - Knight's Tour（DFS + 启发式搜索）

### 题意

$8 \times 8$ 棋盘，给定骑士起始位置，要求访问所有 $64$ 个格子恰好一次（骑士巡游）。输出访问顺序。

### 分析

DFS 回溯搜索。直接暴搜太慢，使用 **Warnsdorff 启发式**：每步优先走可达未访问格子数最少的方向，大幅减少搜索量。

### 搜索策略

- **状态**：$(r,\,c,\,\text{step})$
- **搜索方式**：DFS + Warnsdorff 启发式排序
- **关键优化**：按可达未访问格子数从小到大排序候选步
- **答案**：完整的 $64$ 步巡游路径

### 核心代码

```cpp
int board[8][8];
int dx[]={-2,-2,-1,-1,1,1,2,2}, dy[]={-1,1,-2,2,-2,2,-1,1};
int degree(int r, int c) {
    int cnt = 0;
    for (int d = 0; d < 8; d++) {
        int nr=r+dx[d], nc=c+dy[d];
        if (nr>=0&&nr<8&&nc>=0&&nc<8&&!board[nr][nc]) cnt++;
    }
    return cnt;
}
bool dfs(int r, int c, int step) {
    board[r][c] = step;
    if (step == 64) return true;
    vector<tuple<int,int,int>> moves;
    for (int d = 0; d < 8; d++) {
        int nr=r+dx[d], nc=c+dy[d];
        if (nr>=0&&nr<8&&nc>=0&&nc<8&&!board[nr][nc])
            moves.push_back({degree(nr,nc), nr, nc});
    }
    sort(moves.begin(), moves.end());
    for (auto [_, nr, nc] : moves)
        if (dfs(nr, nc, step+1)) return true;
    board[r][c] = 0;
    return false;
}
```

### 复杂度

Warnsdorff 启发式下实际近乎线性，$O(64)$ 步即完成。

---

## 30 - Meet in the Middle（折半搜索）

### 题意

$N$（$N \le 40$）个整数，求有多少个子集的元素和恰好等于 $x$。

### 分析

$2^{40}$ 太大，但 $2^{20} \approx 10^6$ 可以接受。将数组分成前后两半，分别枚举所有子集和。对前半部分每个和 $s$，在后半部分中二分查找值为 $x - s$ 的个数。

### 搜索策略

- **状态**：$(i,\,\text{partial\_sum})$
- **搜索方式**：折半枚举 + 排序后二分查找合并
- **关键技巧**：将 $O(2^{40})$ 暴力降为 $O(2 \times 2^{20})$ 枚举 + $O(2^{20} \log 2^{20})$ 合并
- **答案**：子集和等于 $x$ 的方案数

### 核心代码

```cpp
vector<long long> A, B;
int h1 = n / 2, h2 = n - h1;
for (int mask = 0; mask < (1 << h1); mask++) {
    long long s = 0;
    for (int i = 0; i < h1; i++)
        if (mask >> i & 1) s += a[i];
    A.push_back(s);
}
for (int mask = 0; mask < (1 << h2); mask++) {
    long long s = 0;
    for (int i = 0; i < h2; i++)
        if (mask >> i & 1) s += a[h1 + i];
    B.push_back(s);
}
sort(B.begin(), B.end());
long long ans = 0;
for (long long s : A)
    ans += upper_bound(B.begin(),B.end(),x-s) - lower_bound(B.begin(),B.end(),x-s);
```

### 复杂度

$O(2^{N/2} \log 2^{N/2})$，即 $O(2^{N/2} \cdot N)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **回溯搜索** | 1, 2, 3, 4 | 全排列、子集枚举、N皇后、网格路径+剪枝 |
| **Flood Fill / 网格搜索** | 5, 6, 7 | DFS 连通块、BFS 最短路、多源 BFS |
| **图遍历** | 8, 9, 10, 11, 12 | 连通分量、最短路、二分图、无向/有向找环 |
| **最短路搜索** | 13, 14, 15, 16, 17, 18 | Dijkstra、Bellman-Ford、分层图、K 短路 |
| **拓扑排序 / DAG** | 19, 20, 21 | Kahn BFS、DAG 最长路、路径计数 |
| **强连通分量** | 22, 23 | 双向搜索、Kosaraju 两次 DFS |
| **树上搜索** | 24, 25 | 直径（两次 BFS）、最远距离（三次 BFS） |
| **网络流 / 匹配** | 26, 27, 28 | Edmonds-Karp 增广、匈牙利 DFS、路径分解 |
| **综合搜索** | 29, 30 | Warnsdorff 启发式、折半搜索 |

## 学习路线建议

```
回溯入门：1 → 2 → 3 → 4
       ↓
网格搜索：5 → 6 → 7
       ↓
图遍历：8 → 9 → 10 → 11 → 12
       ↓
最短路：13 → 14 → 15 → 16 → 17 → 18
       ↓
拓扑排序 / DAG：19 → 20 → 21
       ↓
强连通分量：22 → 23
       ↓
树上搜索：24 → 25
       ↓
网络流 / 匹配：26 → 27 → 28
       ↓
综合搜索：29 → 30
```

## 解题方法论

1. **DFS/BFS 是根基**：从回溯（全排列、子集）到图遍历（连通分量、环检测），DFS 和 BFS 是所有搜索的出发点。
2. **最短路 = 搜索的推广**：Dijkstra 是带权 BFS，Bellman-Ford 是全局松弛搜索。分层图和 K 短路是状态空间扩展后的搜索。
3. **拓扑排序是 DAG 上的 BFS**：Kahn 算法本质是按入度逐层 BFS，拓扑序为 DAG 上的 DP 提供了天然的计算顺序。
4. **树上搜索自成体系**：两次 BFS 求直径、三次 BFS 求每点最远距离，是树上搜索的经典应用。
5. **网络流 = 搜索增广路**：最大流、二分匹配的核心都是在残余图上反复 BFS/DFS 寻找增广路，搜索驱动了整个算法。

> 💡 **记住**：CSES 的搜索题体系性极强——从入门回溯到高级网络流，每道题都是搜索思想在不同模型上的应用。扎实掌握 DFS/BFS 模板后，重点理解**搜索如何驱动算法**（Dijkstra 是优先队列 BFS、拓扑排序是入度 BFS、最大流是增广路 BFS），搜索能力将质变提升。
