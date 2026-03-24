---
title: "USACO 搜索专题精选解题报告"
subtitle: "🐂 31 道经典搜索题目的分析方法、解题思路与核心代码"
order: 7
icon: "🐂"
---

# USACO 搜索专题精选解题报告

> 来源：精选自 [USACO (USA Computing Olympiad)](http://usaco.org/) 的搜索类题目
>
> 本报告针对 31 道精选搜索题目，逐题给出**题意概述 → 分析方法 → 搜索策略 → 核心代码 → 复杂度**，按难度分组（Bronze/Silver → Gold → Platinum），最后做整体总结。

---

## 1 - Bucket Brigade（BFS / 最短路）

### 题意

$10 \times 10$ 农场网格，有谷仓（`B`）、湖泊（`L`）和一块岩石（`R`，不可通过）。求从谷仓到湖泊的最短路径长度。

### 分析

标准 BFS，跳过岩石格子。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 四方向
- **答案**：从 `B` 到 `L` 的 BFS 距离 $- 1$（不计首尾）

### 核心代码

```cpp
// USACO file I/O
freopen("buckets.in", "r", stdin);
freopen("buckets.out", "w", stdout);
int dist[10][10]; memset(dist, -1, sizeof dist);
// BFS from barn, skip rock
```

### 复杂度

$O(100) = O(1)$。

---

## 2 - Milk Pails（BFS / 搜索）

### 题意

两个水桶容量 $X$ 和 $Y$，操作 $K$ 次（装满、倒空、从一个倒到另一个）。求能得到的最接近 $M$ 升水的总水量。

### 分析

状态 $(a, b, k)$。$K \le 100$，$X, Y \le 100$，BFS 搜索所有可达状态。

### 搜索策略

- **状态**：$(a, b)$，$a \le X, b \le Y$
- **搜索方式**：BFS，$6$ 种操作
- **答案**：所有 $\le K$ 步可达状态中 $|a + b - M|$ 最小的

### 核心代码

```cpp
bool vis[101][101];
queue<tuple<int,int,int>> q; q.push({0, 0, 0});
vis[0][0] = true;
int best = M; // worst case: 0 total
while (!q.empty()) {
    auto [a, b, k] = q.front(); q.pop();
    best = min(best, abs(a + b - M));
    if (k >= K) continue;
    // 6 operations: fill X, fill Y, empty X, empty Y, X→Y, Y→X
    for (each next state (na, nb)) {
        if (!vis[na][nb]) { vis[na][nb] = true; q.push({na, nb, k+1}); }
    }
}
```

### 复杂度

$O(XYK)$。

---

## 3 - Cow Gymnastics（枚举 / 搜索）

### 题意

$K$ 场比赛，$N$ 头牛。对 $(a, b)$ 如果在**所有**比赛中 $a$ 排名都高于 $b$，则构成一致对。求一致对数。

### 分析

枚举所有 $\binom{N}{2}$ 对，检查是否在所有比赛中排名一致。

### 搜索策略

- **搜索方式**：双重循环枚举 + 检查 $K$ 场比赛
- **答案**：一致对数

### 核心代码

```cpp
int rank[K][N]; // rank[k][cow] = position in contest k
int ans = 0;
for (int a = 0; a < n; a++)
    for (int b = a+1; b < n; b++) {
        bool consistent = true;
        int dir = 0;
        for (int k = 0; k < K; k++) {
            int d = (rank[k][a] < rank[k][b]) ? 1 : -1;
            if (dir == 0) dir = d;
            else if (dir != d) { consistent = false; break; }
        }
        if (consistent) ans++;
    }
```

### 复杂度

$O(N^2 K)$。

---

## 4 - Comfortable Cows（Flood Fill）

### 题意

$N$ 头牛依次加入网格。一头牛"舒适"当且仅当四个邻居都有牛。每加入一头牛后，输出当前舒适牛的数量。加入牛可能使别的牛变舒适，需链式检查。

### 分析

维护每个格子的邻居数。加入一头牛时更新邻居计数，检查自身和四邻居是否变为/不再舒适。

### 搜索策略

- **状态**：网格中每格邻居数
- **搜索方式**：直接维护，无需搜索
- **答案**：每步后的舒适牛数

### 核心代码

```cpp
int neighbor_cnt[1001][1001];
bool has_cow[1001][1001];
int comfortable = 0;
void addCow(int r, int c) {
    has_cow[r][c] = true;
    if (neighbor_cnt[r][c] == 4) comfortable++;
    for (4 dirs) {
        if (has_cow[nr][nc]) {
            neighbor_cnt[nr][nc]++;
            if (neighbor_cnt[nr][nc] == 4) comfortable++;
        }
        neighbor_cnt[r][c] += has_cow[nr][nc];
    }
}
```

### 复杂度

$O(N)$。

---

## 5 - Where Am I?（枚举 / 搜索）

### 题意

长为 $N$ 的字符串（$N \le 100$）。求最小的 $K$ 使得所有长为 $K$ 的子串互不相同。

### 分析

枚举 $K$ 从 $1$ 开始，用集合检查是否有重复子串。

### 搜索策略

- **搜索方式**：枚举 $K$，哈希或集合检查
- **答案**：最小的无重复子串长度

### 核心代码

```cpp
for (int k = 1; k <= n; k++) {
    set<string> seen;
    bool dup = false;
    for (int i = 0; i + k <= n; i++) {
        string sub = s.substr(i, k);
        if (seen.count(sub)) { dup = true; break; }
        seen.insert(sub);
    }
    if (!dup) { cout << k; return; }
}
```

### 复杂度

$O(N^3)$。

---

## 6 - Maze Tac Toe（BFS / 状态搜索）

### 题意

迷宫中有些格子标记了 `X` 或 `O`。走路径时记录经过的标记序列。若序列中出现井字棋的三连（行/列/对角线），则该路径不合法。求从起点到终点的合法最短路径。

### 分析

BFS，状态需包含位置和井字棋棋盘（最多 $9$ 格的状态）。

### 搜索策略

- **状态**：$(r, c, \text{board\_state})$
- **搜索方式**：BFS
- **剪枝**：检测到三连时停止扩展
- **答案**：最短合法路径

### 核心代码

```cpp
// BFS with state (r, c, tic-tac-toe board state)
// board_state encoded as bitmask or small integer
// Skip states where any player has 3-in-a-row
```

### 复杂度

$O(NM \times 3^9)$，但大量剪枝。

---

## 7 - Icy Perimeter（BFS / Flood Fill）

### 题意

$N \times N$ 网格（$N \le 1000$），`#` 为冰淇淋像素。求面积最大的连通块，相同面积时取周长最小的。

### 分析

BFS Flood Fill 求每个连通块面积和周长。周长 = 每个 `#` 格子的四方向中不是 `#` 的方向数之和。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 四方向
- **答案**：面积最大（周长最小）的连通块

### 核心代码

```cpp
for (each unvisited '#') {
    int area = 0, perim = 0;
    queue<pair<int,int>> q; q.push({r, c});
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        area++;
        for (4 dirs) {
            if (out of bounds || grid[nr][nc] == '.') perim++;
            else if (!vis[nr][nc]) { vis[nr][nc] = true; q.push({nr, nc}); }
        }
    }
    // update best
}
```

### 复杂度

$O(N^2)$。

---

## 8 - Wormhole Sort（DFS + 二分）

### 题意

$N$ 头牛在 $N$ 个位置，$M$ 个虫洞（双向通道，有宽度 $w_i$）。牛 $i$ 需要回到位置 $i$。交换只能通过虫洞。求路径中最小宽度的最大值。

### 分析

二分答案 $W$。只保留宽度 $\ge W$ 的虫洞，DFS/并查集检查每头牛是否能到达目标位置（同一连通分量内）。

### 搜索策略

- **搜索方式**：二分答案 + 并查集/DFS 检查连通性
- **答案**：最大的 $W$ 使所有牛可到达目标

### 核心代码

```cpp
sort(wormholes by width desc);
// Binary search on answer W
bool check(int W) {
    // Union-Find: only add edges with width >= W
    for (auto& [w, u, v] : wormholes) {
        if (w < W) break;
        unite(u, v);
    }
    for (int i = 1; i <= n; i++)
        if (find(i) != find(cow[i])) return false;
    return true;
}
```

### 复杂度

$O((N + M) \log W)$。

---

## 9 - Why Did the Cow Cross the Road III（DFS / 连通性）

### 题意

$N \times N$ 网格农场，每格有字母。相邻格子（四方向）字母不同则不能直接通过（需要道路）。求需要建多少条道路使所有同字母区域连通。

### 分析

DFS 找每种字母的连通分量数。答案 = $\sum (\text{components}_c - 1)$。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：对每种字母分别 DFS/Flood Fill
- **答案**：每种字母的连通分量数 $-1$ 之和

### 核心代码

```cpp
for (char c = 'A'; c <= 'Z'; c++) {
    int components = 0;
    for (all (r, c_col) with grid[r][c_col] == c && !vis) {
        dfs(r, c_col, c); components++;
    }
    ans += max(0, components - 1);
}
```

### 复杂度

$O(26 \cdot N^2)$。

---

## 10 - Snow Boots（BFS / 搜索优化）

### 题意

$N$ 个格子每个有积雪深度 $f_i$。$B$ 双靴子，第 $j$ 双最大可走积雪 $s_j$、最大步幅 $d_j$。对每双靴子判断能否从格子 $1$ 走到格子 $N$。

### 分析

离线排序：将格子按雪深降序、靴子按 $s_j$ 降序处理。用链表维护可走格子，逐步删除过深的格子。

### 搜索策略

- **离线搜索**：排序后用链表 / 跳表维护可达格子间距
- **答案**：最大间距 $\le d_j$ 时可达

### 核心代码

```cpp
// Sort tiles by depth (desc), boots by max_depth (desc)
// Linked list of walkable tiles
// For each boot (in decreasing s_j order):
//   remove tiles with depth > s_j
//   check if max gap in linked list <= d_j
```

### 复杂度

$O(N \log N + B \log B)$。

---

## 11 - Switching on the Lights（BFS + DFS）

### 题意

$N \times N$ 网格暗房间。起点 $(1,1)$ 亮着。每个房间有开关可以点亮其他房间。只能走到从已亮房间可达的亮房间。求最多能点亮几个房间。

### 分析

BFS：每到一个新房间，打开其开关点亮其他房间。新亮的房间如果与已访问区域相邻则加入队列。需要反复检查。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS + 当新灯打开时检查是否与已访问区域相邻
- **答案**：最终亮着的房间数

### 核心代码

```cpp
bool lit[101][101], vis[101][101];
lit[1][1] = true;
queue<pair<int,int>> q; q.push({1, 1}); vis[1][1] = true;
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    for (auto [lr, lc] : switches[r][c]) {
        if (!lit[lr][lc]) {
            lit[lr][lc] = true;
            // check if any neighbor is visited
            for (4 dirs) if (vis[nr][nc]) { vis[lr][lc] = true; q.push({lr, lc}); }
        }
    }
    for (4 dirs) {
        if (lit[nr][nc] && !vis[nr][nc]) { vis[nr][nc] = true; q.push({nr, nc}); }
    }
}
```

### 复杂度

$O(N^2 + \text{switches})$。

---

## 12 - Lights Out（DFS / 搜索）

### 题意

多边形房间内有 $N$ 个角点。站在某个角看，灯灭后只能靠触摸墙壁沿一个方向走。求每个角点最坏情况下需要多走多少额外距离（相比灯亮时的最短路径）。

### 分析

对每个角点，模拟灯灭后沿两个方向走的距离，与最短路比较取最坏情况。

### 搜索策略

- **搜索方式**：枚举起点，模拟沿墙走
- **答案**：额外距离的最大值

### 核心代码

```cpp
// For each vertex, simulate walking CW and CCW along walls
// Compare with shortest distance (when lights are on)
// Answer for each vertex = min(CW_dist, CCW_dist) - shortest
```

### 复杂度

$O(N^2)$。

---

## 13 - Cow At Large（DFS / 树的距离）

### 题意

$N$ 个节点的树，叶子有农民。牛在节点 $K$。牛和农民同时移动（牛走一步，农民走一步）。牛到达叶子则逃脱。求最少需要多少农民能堵住牛。

### 分析

对每个节点 $v$：若牛到 $v$ 的距离 $\ge$ 最近叶子到 $v$ 的距离，则农民可以在 $v$ 处拦截。答案 = 子树边界上需要拦截的节点数。

### 搜索策略

- **预处理**：① DFS 求每个节点到最近叶子的距离；② DFS 求节点 $K$ 到每个节点的距离
- **答案**：满足"最近叶子距离 $\le$ 牛到此处距离"的边界节点数

### 核心代码

```cpp
int leaf_dist[100001], cow_dist[100001];
// BFS from all leaves → leaf_dist[]
// BFS from K → cow_dist[]
int ans = 0;
void dfs(int u, int p) {
    if (leaf_dist[u] <= cow_dist[u]) { ans++; return; } // intercept here
    for (int v : adj[u]) if (v != p) dfs(v, u);
}
dfs(K, -1);
```

### 复杂度

$O(N)$。

---

## 14 - Closing the Farm（DFS / 连通性维护）

### 题意

$N$ 个农场 $M$ 条道路。按给定顺序逐一关闭农场。每次关闭后判断剩余农场是否仍然连通。

### 分析

反向处理：逐一**添加**农场（逆序），用并查集维护连通性。

### 搜索策略

- **搜索方式**：反向添加 + 并查集
- **答案**：逆序每步的连通性判断

### 核心代码

```cpp
int order[N]; // closing order
bool active[N];
// Process in reverse
for (int i = n - 1; i >= 0; i--) {
    int u = order[i];
    active[u] = true;
    for (int v : adj[u])
        if (active[v]) unite(u, v);
    result[i] = (components == count_active);
}
```

### 复杂度

$O(N \cdot \alpha(N))$。

---

## 15 - Milking Order（DFS / 拓扑排序）

### 题意

$N$ 头牛，$M$ 条偏序关系（某些牛必须在另一些之前）。求字典序最小的合法排列。

### 分析

最小字典序拓扑排序：用最小堆代替普通队列。

### 搜索策略

- **状态**：节点入度
- **搜索方式**：BFS（最小堆）
- **答案**：字典序最小的拓扑序

### 核心代码

```cpp
priority_queue<int, vector<int>, greater<>> pq;
for (int i = 1; i <= n; i++) if (indeg[i] == 0) pq.push(i);
while (!pq.empty()) {
    int u = pq.top(); pq.pop();
    order.push_back(u);
    for (int v : adj[u])
        if (--indeg[v] == 0) pq.push(v);
}
```

### 复杂度

$O(N \log N + M)$。

---

## 16 - Redistribute Hay（DFS / 贪心）

### 题意

$N$ 个节点的树，每个节点有草垛数 $h_i$。每次操作可沿边移动一个草垛。使所有节点草垛数相等的最小移动总数。

### 分析

目标值 $= \text{sum} / N$。DFS 后序遍历，每条边的流量 $=$ 子树总草垛与目标差的绝对值。

### 搜索策略

- **搜索方式**：DFS 后序遍历
- **答案**：所有边流量之和

### 核心代码

```cpp
long long ans = 0;
long long dfs(int u, int p) {
    long long excess = h[u] - target;
    for (int v : adj[u]) if (v != p) excess += dfs(v, u);
    ans += abs(excess);
    return excess;
}
```

### 复杂度

$O(N)$。

---

## 17 - Lasers and Mirrors（BFS / 最短路）

### 题意

$N$ 个围栏柱（水平或垂直对齐）。激光从源到目标，只能沿水平/垂直方向传播，遇到柱子可以 $90°$ 转向。求最少使用多少面镜子（转弯次数）。

### 分析

将同一行/列的柱子连边。BFS 计算从源到目标的最少转弯数。

### 搜索策略

- **预处理**：同行/列的柱子连边
- **状态**：柱子编号
- **搜索方式**：BFS
- **答案**：最少转弯数 $- 1$（转弯处需要镜子）

### 核心代码

```cpp
// Build graph: for each row/column, connect posts in same row/col
// BFS from source to target
// Edge = one mirror used (one turn)
```

### 复杂度

$O(N \log N)$（排序）。

---

## 18 - Dream（BFS / 状态搜索）

### 题意

$N \times M$ 网格有 $5$ 种格子。某种格子会改变"嗅觉状态"（橙色），影响能否穿过紫色格子。求从 $(1,1)$ 到 $(N,M)$ 的最短路径。

### 分析

BFS 状态需包含嗅觉标志。$(r, c, \text{smell})$，$\text{smell} \in \{0, 1\}$。

### 搜索策略

- **状态**：$(r, c, \text{smell})$
- **搜索方式**：BFS
- **答案**：到达 $(N,M)$ 的最短步数

### 核心代码

```cpp
int dist[N][M][2]; memset(dist, -1, sizeof dist);
dist[0][0][0] = 0;
queue<tuple<int,int,int>> q; q.push({0, 0, 0});
while (!q.empty()) {
    auto [r, c, sm] = q.front(); q.pop();
    for (4 dirs) {
        int nsm = sm;
        if (grid[nr][nc] == ORANGE) nsm = 1;
        if (grid[nr][nc] == PURPLE && !nsm) continue;
        if (grid[nr][nc] != ORANGE && nsm) nsm = 0;
        if (dist[nr][nc][nsm] == -1) {
            dist[nr][nc][nsm] = dist[r][c][sm] + 1;
            q.push({nr, nc, nsm});
        }
    }
}
```

### 复杂度

$O(NM)$。

---

## 19 - Radio Contact（多状态 BFS / DP）

### 题意

FJ 和 Bessie 各有固定路径（FJ 走 $N$ 步，Bessie 走 $M$ 步）。每个时刻 FJ 或 Bessie（或都）可以走一步。求使两人总距离之和最小的调度方案。

### 分析

$dp[i][j]$ = FJ 走了 $i$ 步、Bessie 走了 $j$ 步时的最小累积距离。三种转移（只 FJ 走、只 Bessie 走、都走）。

### 搜索策略

- **状态**：$(i, j)$
- **搜索方式**：DP / 记忆化搜索
- **转移**：$dp[i][j] = \text{dist}(F_i, B_j) + \min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])$
- **答案**：$dp[N][M]$

### 核心代码

```cpp
long long dp[1001][1001];
for (int i = 0; i <= N; i++)
    for (int j = 0; j <= M; j++) {
        dp[i][j] = LLONG_MAX;
        long long d = dist(F[i], B[j]);
        if (i > 0) dp[i][j] = min(dp[i][j], dp[i-1][j] + d);
        if (j > 0) dp[i][j] = min(dp[i][j], dp[i][j-1] + d);
        if (i > 0 && j > 0) dp[i][j] = min(dp[i][j], dp[i-1][j-1] + d);
        if (i == 0 && j == 0) dp[i][j] = d;
    }
```

### 复杂度

$O(NM)$。

---

## 20 - Fine Dining（BFS / 最短路变形）

### 题意

$N$ 个牧场 $M$ 条无向带权道路。牧场 $N$ 为谷仓。某些牧场有餐厅（"停留代价"为负）。每头牛从各自牧场到谷仓，若绕道去餐厅不增加总距离则会去。求哪些牛会绕道。

### 分析

反向 Dijkstra 从谷仓出发。额外用分层图：$(v, 0)$ 表示未吃饭，$(v, 1)$ 表示已吃饭。餐厅处可转换。

### 搜索策略

- **状态**：$(v, \text{ate})$
- **搜索方式**：反向 Dijkstra（分层图）
- **答案**：$\text{dist}[v][1] \le \text{dist}[v][0]$ 的牛会绕道

### 核心代码

```cpp
long long dist[N][2]; // [node][ate?]
// Reverse Dijkstra from N
// At restaurant: can transition from layer 0 to layer 1 (subtract yummy value)
for (int i = 1; i < n; i++)
    cout << (dist[i][1] <= dist[i][0] ? 1 : 0) << "\n";
```

### 复杂度

$O((N + M) \log N)$。

---

## 21 - Telephone（BFS / 分层图）

### 题意

$N$ 头牛 $M$ 条道路。每头牛有品种 $b_i$。$K \times K$ 的矩阵表示品种 $i$ 能否传电话给品种 $j$。从牛 $1$ 到牛 $N$ 的最短传话路径。

### 分析

Dijkstra，边的合法性取决于两端品种的通话矩阵。

### 搜索策略

- **状态**：节点编号
- **搜索方式**：Dijkstra
- **约束**：边 $(u,v)$ 合法当且仅当 $\text{can}[b_u][b_v] = 1$
- **答案**：`dist[N]`

### 核心代码

```cpp
// Dijkstra, only relax edge (u,v) if can[breed[u]][breed[v]]
```

### 复杂度

$O((N + M) \log N)$。

---

## 22 - Guard Mark（DFS + 剪枝 / 状压）

### 题意

$N$ 头牛（$N \le 20$）叠罗汉。每头牛有高度 $h$、重量 $w$、承重 $s$。选一些牛叠到总高度 $\ge H$，且每头牛上面的总重量 $\le$ 其承重。求最大安全余量。

### 分析

$N \le 20$，状压 DP。$dp[\text{mask}]$ = 已选牛集合的最大安全余量。

### 搜索策略

- **状态**：选牛的位掩码
- **搜索方式**：状压枚举 / DFS + 剪枝
- **答案**：高度 $\ge H$ 的状态中最大安全余量

### 核心代码

```cpp
int dp[1 << 20]; memset(dp, -1, sizeof dp);
dp[0] = INF;
for (int mask = 0; mask < (1 << n); mask++) {
    if (dp[mask] < 0) continue;
    for (int i = 0; i < n; i++) {
        if (mask >> i & 1) continue;
        int nmask = mask | (1 << i);
        int safety = min(dp[mask], cows[i].s - weight_above(mask, i));
        dp[nmask] = max(dp[nmask], safety);
    }
}
```

### 复杂度

$O(2^N \cdot N)$。

---

## 23 - Cow Poetry（DFS + 记忆化 / DP）

### 题意

$N$ 个单词（有长度和韵脚类）。一行长度恰好为 $K$。$M$ 行的诗，某些行押韵。求合法诗歌数。

### 分析

先 DP 求"长度恰好 $K$ 的一行中，最后一个词韵脚为 $c$ 的方案数"。然后对每个韵组用乘法原理计算。

### 搜索策略

- **状态**：当前行已用长度
- **搜索方式**：DP（背包型）
- **答案**：乘法原理组合各行方案

### 核心代码

```cpp
long long dp[K+1] = {}; dp[0] = 1;
for (int len = 0; len < K; len++)
    for (each word w)
        if (len + w.len <= K) dp[len + w.len] += dp[len];
// count[c] = sum dp[K - w.len] for words w with rhyme c
// For each rhyme group, multiply count[c]^(group size)
```

### 复杂度

$O(NK)$。

---

## 24 - Cowmputer Science（记忆化搜索 / 数位搜索）

### 题意

给两个大整数 $A$ 和 $B$，以及运算 $+, -, \times$。$A$ 和 $B$ 以 $B$ 进制表示。求结果。

### 分析

模拟大数运算，逐位处理。搜索/递归处理进位。

### 搜索策略

- **搜索方式**：逐位递归模拟
- **答案**：运算结果

### 核心代码

```cpp
// Big number arithmetic in base B
// Handle carry/borrow with recursive simulation
```

### 复杂度

$O(\text{digits})$。

---

## 25 - Circular Barn Revisited（枚举 + 搜索）

### 题意

$N$ 个门的圆形谷仓，$K$ 扇门可以打开。$r_i$ 头牛需要进入第 $i$ 个门。打开 $K$ 扇门，每头牛从最近的开着的门进入，行走距离为圆形距离。最小总距离。

### 分析

枚举第一扇门的位置，DP 求其余 $K-1$ 扇门的最优位置。

### 搜索策略

- **搜索方式**：枚举起点 + DP
- **答案**：最小总距离

### 核心代码

```cpp
// Fix first door at position i
// DP: dp[j][k] = min cost to place k doors covering first j positions
long long ans = LLONG_MAX;
for (int start = 0; start < n; start++) {
    // DP for K doors in rotated array
    ans = min(ans, dp[n][K]);
}
```

### 复杂度

$O(N^2 K)$。

---

## 26 - Delegation（DFS / 树上搜索 + 二分）

### 题意

$N$ 个节点的树，分成若干条链，每条链长度恰好为 $K$。判断是否可行。

### 分析

二分 $K$。对每个 $K$，DFS 验证：在每个节点处，将子树传上来的链长度配对（两条链长度之和 $= K$ 则匹配），剩余一条向上传递。

### 搜索策略

- **搜索方式**：二分 $K$ + DFS 贪心匹配
- **答案**：最大可行 $K$

### 核心代码

```cpp
bool check(int K) {
    // DFS from root
    // At each node, collect chain lengths from children
    // Greedily pair: sort, two-pointer to match sum == K
    // At most one unpaired chain passes up
}
```

### 复杂度

$O(N \log^2 N)$。

---

## 27 - New Barns（DFS / LCA + 搜索）

### 题意

动态添加节点构建森林（每次添加叶子或新树）。每次添加后查询从新节点出发的最远距离。

### 分析

每棵树维护直径端点 $(a, b)$。新增节点后最远距离必是到 $a$ 或 $b$ 的距离。用 LCA 求距离。

### 搜索策略

- **预处理**：倍增 LCA
- **维护**：每棵树的直径端点
- **查询**：$\max(\text{dist}(v, a), \text{dist}(v, b))$

### 核心代码

```cpp
// When adding node v to tree with diameter endpoints (a, b):
int da = dist(v, a), db = dist(v, b);
answer = max(da, db);
// Update diameter: check if (v, a), (v, b), or (a, b) is longest
```

### 复杂度

每次操作 $O(\log N)$。

---

## 28 - Balancing Subsequences（搜索 + 数据结构优化）

### 题意

给两个长为 $N$ 的排列。求最长公共子序列使得取出的下标在两个排列中都是"平衡的"（前缀 $A$ 数 $\ge$ 前缀 $B$ 数）。

### 分析

将问题转化为带约束的 LCS。用树状数组或线段树优化 DP。

### 搜索策略

- **搜索方式**：DP + 数据结构优化
- **答案**：最长满足约束的公共子序列

### 核心代码

```cpp
// Transformation to LIS-like problem with BIT optimization
```

### 复杂度

$O(N \log N)$。

---

## 29 - Non-Decreasing Subsequences（DFS + 计数）

### 题意

长为 $N$ 的序列，求所有非递减子序列的数目（模 $M$）。

### 分析

DP：$dp[i]$ = 以元素 $a_i$ 结尾的非递减子序列数。用 BIT 加速。

### 搜索策略

- **搜索方式**：DP + BIT 加速
- **答案**：$\sum dp[i]$

### 核心代码

```cpp
// dp[i] = 1 + sum of dp[j] where j < i and a[j] <= a[i]
// Use BIT indexed by value for prefix sum queries
```

### 复杂度

$O(N \log V)$。

---

## 30 - Robotic Cow Herd（搜索 + 堆优化）

### 题意

$N$ 个零件，每种有若干选项（有代价）。选一组零件（每种选一个）。求第 $K$ 小的总代价。

### 分析

排序后用堆维护候选方案。类似 K 短路搜索的思路。

### 搜索策略

- **搜索方式**：最小堆，每步扩展一个候选方案
- **答案**：第 $K$ 次弹出的代价

### 核心代码

```cpp
// Sort each component's options by cost
// Start with cheapest combination
// Priority queue: expand by replacing one component's choice with next option
```

### 复杂度

$O(NK \log K)$。

---

## 31 - Spaceship（搜索 + 矩阵快速幂）

### 题意

$N$ 个房间，有 $K$ 层嵌套结构。从某房间到另一房间需要先"穿越"更低层的完整路径。求从 $i$ 到 $j$ 穿越 $K$ 层的路径数。

### 分析

矩阵快速幂。层间的转移可以用矩阵乘法表达。

### 搜索策略

- **搜索方式**：矩阵快速幂
- **答案**：矩阵的 $(i, j)$ 元素

### 核心代码

```cpp
// Layer 0: direct adjacency matrix
// Layer k: M_k[i][j] = sum over mid of M_{k-1}[i][mid] * M_{k-1}[mid][j]
// But with special transition rules
```

### 复杂度

$O(N^3 K)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **Bronze 入门** | 1, 2, 3, 4, 5 | BFS、枚举搜索、Flood Fill |
| **Silver 搜索** | 6, 7, 8, 9, 10, 11 | 状态 BFS、Flood Fill、DFS+二分、BFS+DFS |
| **Gold DFS** | 12, 13, 14, 15, 16 | DFS 搜索、树距离、连通性维护、拓扑排序 |
| **Gold BFS / 最短路** | 17, 18, 19, 20, 21 | BFS 最短路、状态搜索、分层图 Dijkstra |
| **Gold 记忆化 / 剪枝** | 22, 23, 24, 25, 26 | 状压搜索、记忆化 DP、枚举搜索、树上搜索 |
| **Platinum 高级搜索** | 27, 28, 29, 30, 31 | LCA 搜索、数据结构优化、堆优化搜索 |

## 学习路线建议

```
Bronze 入门：1 → 2 → 3 → 4 → 5
       ↓
Silver 搜索：6 → 7 → 8 → 9 → 10 → 11
       ↓
Gold DFS：12 → 13 → 14 → 15 → 16
       ↓
Gold BFS：17 → 18 → 19 → 20 → 21
       ↓
Gold 进阶：22 → 23 → 24 → 25 → 26
       ↓
Platinum：27 → 28 → 29 → 30 → 31
```

## 解题方法论

1. **USACO Bronze/Silver 打基础**：Flood Fill、BFS 最短路、二分图判定是入门必备技能。
2. **Gold 重点是树和图**：子树统计、LCA、换根 DP 是 Gold 的核心搜索技术。
3. **分层图/状态扩展是关键**：Flight Discount（用折扣/不用）、Dream（嗅觉状态）、Fine Dining（吃饭/没吃）都是 BFS 状态维度扩展。
4. **反向思维**：Closing the Farm（反向添加）、Fine Dining（反向 Dijkstra）展示了"倒着搜索"的威力。
5. **Platinum 的搜索融合**：搜索 + 数据结构（BIT、线段树）+ 矩阵快速幂 = Platinum 难度。

> 💡 **记住**：USACO 的分级体系正好对应搜索能力的成长阶梯——Bronze 练手感，Silver 建框架，Gold 深化树图技巧，Platinum 融合高级算法。沿着这条路线训练，搜索能力将从模板应用升级为算法设计。
