---
title: "Codeforces 搜索专题精选解题报告"
subtitle: "🔵 30 道经典搜索题目的分析方法、解题思路与核心代码"
order: 4
icon: "🔵"
---

# Codeforces 搜索专题精选解题报告

> 来源：精选自 [Codeforces](https://codeforces.com/) 各场比赛中的搜索类题目
>
> 本报告针对 30 道精选搜索题目，逐题给出**题意概述 → 分析方法 → 搜索策略 → 核心代码 → 复杂度**，按难度与类型分组，最后做整体总结。

---

## 1 - CF 580C Kefa and Park（DFS）

### 题意

一棵 $N$ 个节点的有根树（根为 $1$），每个节点有猫或没猫。从根到叶子的路径上，**连续有猫的节点数**不超过 $m$ 时可到达该叶子。求可到达的叶子数。

### 分析

从根 DFS，维护当前路径上连续猫的计数。遇到无猫节点重置计数；超过 $m$ 则剪枝。

### 搜索策略

- **状态**：$(v, \text{consecutive\_cats})$
- **搜索方式**：DFS 从根出发
- **剪枝**：连续猫数 $> m$ 时不再深入
- **答案**：到达叶子时计数 $+1$

### 核心代码

```cpp
int ans = 0;
function<void(int, int, int)> dfs = [&](int v, int par, int cats) {
    cats = hasCat[v] ? cats + 1 : 0;
    if (cats > m) return;
    bool isLeaf = true;
    for (int u : adj[v]) {
        if (u == par) continue;
        isLeaf = false;
        dfs(u, v, cats);
    }
    if (isLeaf) ans++;
};
dfs(1, 0, 0);
```

### 复杂度

$O(N)$。

---

## 2 - CF 510B Fox And Two Dots（DFS / 环检测）

### 题意

$N$ 点 $M$ 边的无向图，判断是否存在环。

### 分析

无向图环检测：DFS 中遇到一个已访问但不是父节点的邻居则存在环。

### 搜索策略

- **状态**：节点编号 $v$、父节点 $\text{par}$
- **搜索方式**：DFS
- **判定**：访问到非父已访问节点 → 有环
- **答案**：`Yes` / `No`

### 核心代码

```cpp
bool found = false;
vector<int> vis(n + 1, 0);
function<void(int, int)> dfs = [&](int v, int par) {
    vis[v] = 1;
    for (int u : adj[v]) {
        if (u == par) continue;
        if (vis[u]) { found = true; return; }
        dfs(u, v);
        if (found) return;
    }
};
```

### 复杂度

$O(N + M)$。

---

## 3 - CF 115A Party（DFS / 树深度）

### 题意

$N$ 个员工，每人有一个直属上级（$-1$ 表示无上级）。求管理层级的最大深度。

### 分析

构建森林，对每棵树 DFS 求深度，取最大值。

### 搜索策略

- **状态**：节点 $v$、当前深度 $d$
- **搜索方式**：DFS 从每个根节点出发
- **答案**：所有节点深度的最大值

### 核心代码

```cpp
int ans = 0;
function<void(int, int)> dfs = [&](int v, int d) {
    ans = max(ans, d);
    for (int u : children[v]) dfs(u, d + 1);
};
for (int r : roots) dfs(r, 1);
```

### 复杂度

$O(N)$。

---

## 4 - CF 277A Learning Languages（DFS / 连通分量）

### 题意

$N$ 个员工，每人会若干语言。两人能直接或间接沟通 $\Leftrightarrow$ 存在一条"语言链"。求最少再教多少人一种新语言使所有人互相沟通。

### 分析

以语言为节点、以员工为桥建图，DFS 求连通分量数 $k$。答案 $= k - 1$（若所有人都不会任何语言则 $= N$）。

### 搜索策略

- **状态**：语言节点 / 员工节点
- **搜索方式**：DFS / 并查集，将同一员工会的语言合并
- **答案**：连通分量数 $- 1$

### 核心代码

```cpp
// 并查集实现
for (int i = 0; i < n; i++)
    for (int j = 1; j < langs[i].size(); j++)
        unite(langs[i][0], langs[i][j]);
set<int> comps;
for (int i = 0; i < n; i++)
    if (!langs[i].empty()) comps.insert(find(langs[i][0]));
int k = comps.size();
cout << (allEmpty ? n : k - 1);
```

### 复杂度

$O(N \cdot L \cdot \alpha(L))$，$L$ 为语言总数。

---

## 5 - CF 1365D Solve The Maze（BFS）

### 题意

$N \times M$ 网格迷宫，有好人（`G`）、坏人（`B`）和墙（`#`）。可以将空地变成墙。判断能否使所有好人到达 $(N,M)$、所有坏人无法到达。

### 分析

先把所有坏人的四方向相邻空地堵墙（若相邻的是好人则无解）。然后 BFS 从 $(N,M)$ 出发，检查所有好人是否可达、所有坏人是否不可达。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 从终点反向扩展
- **预处理**：堵住坏人相邻格子
- **答案**：好人全可达 $\land$ 坏人全不可达

### 核心代码

```cpp
// 堵坏人相邻格子
for (all B at (r,c))
    for (4 dirs) if (grid[nr][nc] == 'G') { impossible; }
                 else if (grid[nr][nc] == '.') grid[nr][nc] = '#';
// BFS from (N-1, M-1)
queue<pair<int,int>> q;
q.push({N-1, M-1}); vis[N-1][M-1] = true;
while (!q.empty()) { /* standard BFS */ }
// Check all G reachable, all B unreachable
```

### 复杂度

$O(NM)$。

---

## 6 - CF 1594D The Number of Imposters（DFS / 二分图判定）

### 题意

$N$ 个人、$M$ 条描述。每条描述 "$i$ 说 $j$ 是 crewmate/imposter"。若同类人说真话，不同类人说谎。求最大可能的 imposter 数，或判断矛盾。

### 分析

"$i$ 说 $j$ 是 crewmate" $\Leftrightarrow$ $i, j$ 同类；"说 imposter" $\Leftrightarrow$ 异类。这是二分图染色问题。对每个连通分量，两种染色取 imposter 数较大者。

### 搜索策略

- **状态**：$(v, \text{color})$
- **搜索方式**：DFS 染色
- **判定**：矛盾（邻居已有相同应不同的颜色）→ $-1$
- **答案**：$\sum \max(\text{count}_0, \text{count}_1)$

### 核心代码

```cpp
int ans = 0;
for (int i = 1; i <= n; i++) {
    if (col[i] != -1) continue;
    int c[2] = {};
    bool ok = true;
    function<void(int, int)> dfs = [&](int v, int cc) {
        col[v] = cc; c[cc]++;
        for (auto [u, type] : adj[v]) {
            int need = cc ^ type; // type=0 same, type=1 diff
            if (col[u] == -1) dfs(u, need);
            else if (col[u] != need) ok = false;
        }
    };
    dfs(i, 0);
    if (!ok) { cout << -1; return; }
    ans += max(c[0], c[1]);
}
```

### 复杂度

$O(N + M)$。

---

## 7 - CF 1272E Nearest Opposite Parity（多源 BFS）

### 题意

长为 $N$ 的数组 $a$。从位置 $i$ 可跳到 $i - a_i$ 或 $i + a_i$（若合法）。对每个 $i$，求到达**奇偶性不同**的 $a_j$ 所在位置的最少跳数。

### 分析

建**反向图**。将所有奇数值位置作为一组源点、偶数值位置作为另一组源点，分别做多源 BFS 在反向图上求最短距离。

### 搜索策略

- **状态**：位置 $i$
- **搜索方式**：多源 BFS，在反向图上分两轮（奇源 → 偶目标、偶源 → 奇目标）
- **答案**：每个位置取对应轮次的 BFS 距离

### 核心代码

```cpp
// Build reverse graph
for (int i = 1; i <= n; i++) {
    if (i - a[i] >= 1) radj[i - a[i]].push_back(i);
    if (i + a[i] <= n) radj[i + a[i]].push_back(i);
}
// Multi-source BFS from all odd-valued positions
auto bfs = [&](vector<int>& sources) -> vector<int> {
    vector<int> dist(n + 1, -1);
    queue<int> q;
    for (int s : sources) { dist[s] = 0; q.push(s); }
    while (!q.empty()) {
        int v = q.front(); q.pop();
        for (int u : radj[v])
            if (dist[u] == -1) { dist[u] = dist[v] + 1; q.push(u); }
    }
    return dist;
};
```

### 复杂度

$O(N)$。

---

## 8 - CF 1063B Labyrinth（0-1 BFS / 双端队列）

### 题意

$N \times M$ 网格，给定起点。最多可向左走 $x$ 步、向右走 $y$ 步（上下不限）。求所有可达格子数。

### 分析

上下移动代价 $0$，左右移动代价 $1$（消耗 $x/y$ 配额）。使用 **0-1 BFS**：代价 $0$ 的方向（上/下）加入队首，代价 $1$ 的方向（左/右）加入队尾。同时维护剩余左/右步数。

### 搜索策略

- **状态**：$(r, c, \text{left\_remain}, \text{right\_remain})$，但实际用 `dist_left[r][c]` 和 `dist_right[r][c]` 记录到达时的最小左/右消耗
- **搜索方式**：0-1 BFS 双端队列
- **答案**：所有被访问到的格子数

### 核心代码

```cpp
deque<pair<int,int>> dq;
int dl[N][M], dr[N][M]; // 到达 (r,c) 的最小左/右使用数
memset(dl, 0x3f, sizeof dl);
memset(dr, 0x3f, sizeof dr);
dl[sr][sc] = dr[sr][sc] = 0;
dq.push_back({sr, sc});
while (!dq.empty()) {
    auto [r, c] = dq.front(); dq.pop_front();
    // up/down: cost 0 → push_front
    // left: if dl[r][c] + 1 < dl[r][c-1] → push_back
    // right: if dr[r][c] + 1 < dr[r][c+1] → push_back
}
```

### 复杂度

$O(NM)$。

---

## 9 - CF 877D Olya and Energy Drinks（BFS + 单调队列）

### 题意

$N \times M$ 网格迷宫，每步可向四方向移动 $1 \sim k$ 格（不穿墙）。求起点到终点的最少步数。

### 分析

普通 BFS 每步扩展最多 $4k$ 个邻居太慢。优化：BFS 按层扩展，对每个方向用**单调队列**维护当前行/列上的最早到达信息，跳过已有更优解的格子。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS，每个方向沿行/列扩展最多 $k$ 步
- **关键优化**：遇到已访问（`dist != -1`）且 $\le$ 当前距离的格子时 break（BFS 保证先到的更优）
- **答案**：`dist[gr][gc]`

### 核心代码

```cpp
queue<pair<int,int>> q;
dist[sr][sc] = 0; q.push({sr, sc});
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    for (int d = 0; d < 4; d++) {
        for (int step = 1; step <= k; step++) {
            int nr = r + dx[d]*step, nc = c + dy[d]*step;
            if (!valid(nr, nc) || grid[nr][nc] == '#') break;
            if (dist[nr][nc] != -1 && dist[nr][nc] <= dist[r][c]) break;
            if (dist[nr][nc] != -1) continue;
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
}
```

### 复杂度

$O(NM)$（每个格子最多入队一次）。

---

## 10 - CF 1037D Valid BFS?（BFS 模拟）

### 题意

给一棵 $N$ 个节点的树和一个排列。判断该排列是否是某种合法的 BFS 序。

### 分析

BFS 序的唯一自由度在于**同层邻居的访问顺序**。按照给定排列的位次重排每个节点的邻接表，然后做一次标准 BFS，检查生成的序列是否与给定排列一致。

### 搜索策略

- **状态**：节点 $v$
- **搜索方式**：BFS 模拟
- **预处理**：按给定排列中的位次排序邻接表
- **答案**：模拟 BFS 序 $=$ 给定排列 → `Yes`

### 核心代码

```cpp
vector<int> pos(n + 1);
for (int i = 0; i < n; i++) pos[perm[i]] = i;
for (int v = 1; v <= n; v++)
    sort(adj[v].begin(), adj[v].end(), [&](int a, int b) {
        return pos[a] < pos[b];
    });
// Standard BFS from root, compare with perm
```

### 复杂度

$O(N \log N)$。

---

## 11 - CF 590C Three States（多源 BFS）

### 题意

网格中有三个国家（$1, 2, 3$）、道路（`.`）和墙（`#`）。每次可以将一个 `.` 变为道路（代价 $1$）。求使三个国家全部连通的最小代价。

### 分析

从每个国家做一次 **BFS / 0-1 BFS**（国家内部和道路代价 $0$，其他代价 $1$）。然后枚举：直接两两连接的最小代价 vs 三国在某个公共点汇合。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：三次 0-1 BFS（或 Dijkstra），分别从三个国家出发
- **答案**：$\min(\text{pairwise sums}, \min_{(r,c)} d_1 + d_2 + d_3 - (r,c\text{ is road} ? 2 : 0))$

### 核心代码

```cpp
// d[k][r][c] = min cost from country k to (r,c)
for (int k = 0; k < 3; k++) bfs01(k);
int ans = INF;
// Pairwise connections
for (int i = 0; i < 3; i++)
    for (int j = i+1; j < 3; j++)
        // find min d[i][r][c] + d[j][r][c] over all (r,c)
// Three-way meeting point
for (all (r,c))
    ans = min(ans, d[0][r][c] + d[1][r][c] + d[2][r][c]
              - (grid[r][c] != '#' ? 2 : 0));
```

### 复杂度

$O(NM)$。

---

## 12 - CF 1307D Cow and Fields（BFS + 贪心）

### 题意

$N$ 点 $M$ 边无权无向图。给定 $k$ 个特殊节点，可以在任意两个特殊节点间加一条边。求加边后 $1 \to N$ 最短路的最大值。

### 分析

设 $d_1[v]$ 为从 $1$ 到 $v$ 的最短距离，$d_n[v]$ 为从 $N$ 到 $v$ 的最短距离。加边 $(a, b)$ 后的新最短路候选 $= d_1[a] + 1 + d_n[b]$（或反向）。对特殊节点按 $d_1[v] - d_n[v]$ 排序后贪心选择。

### 搜索策略

- **状态**：节点 $v$
- **搜索方式**：两次 BFS（从 $1$ 和从 $N$）
- **贪心**：将特殊节点按 $d_1[v] - d_n[v]$ 排序，相邻最优对取 max
- **答案**：$\min(\text{original dist}, \max_{a,b} (d_1[a] + 1 + d_n[b]))$

### 核心代码

```cpp
bfs(1, d1); bfs(n, dn);
int orig = d1[n];
vector<int> vals;
for (int v : special) vals.push_back(d1[v] - dn[v]);
sort(vals.begin(), vals.end());
int best = 0;
for (int i = 0; i + 1 < vals.size(); i++)
    best = max(best, vals[i] + (orig - 1 - vals[i+1]) + 1);
// 这里简化了，实际取 min(orig, d1[a]+1+dn[b])
```

### 复杂度

$O(N + M + k \log k)$。

---

## 13 - CF 550B Preparing Olympiad（子集枚举）

### 题意

$N$ 道题（$N \le 15$），难度 $d_i$。选一个子集满足：题数在 $[l, r]$、难度总和在 $[x, y]$、最大难度 $-$ 最小难度 $\ge z$。求方案数。

### 分析

$N \le 15$，枚举 $2^N$ 个子集，逐一验证三个约束。

### 搜索策略

- **状态**：$N$ 位掩码
- **搜索方式**：位枚举 $1 \sim 2^N - 1$
- **答案**：满足所有约束的子集数

### 核心代码

```cpp
int ans = 0;
for (int mask = 1; mask < (1 << n); mask++) {
    int cnt = __builtin_popcount(mask);
    if (cnt < l || cnt > r) continue;
    int sum = 0, mn = INT_MAX, mx = 0;
    for (int i = 0; i < n; i++) if (mask >> i & 1) {
        sum += d[i]; mn = min(mn, d[i]); mx = max(mx, d[i]);
    }
    if (sum >= x && sum <= y && mx - mn >= z) ans++;
}
```

### 复杂度

$O(2^N \cdot N)$。

---

## 14 - CF 1097B Petr and a Combination Lock（DFS 枚举）

### 题意

$N$ 个角度（$N \le 15$），每个角度可以 $+$ 或 $-$。问是否存在一种选择使总和为 $0 \pmod{360}$。

### 分析

$2^N$ 枚举每个角度的符号，检查总和是否为 $360$ 的倍数。

### 搜索策略

- **状态**：当前位置 $i$、当前和 $\text{sum}$
- **搜索方式**：DFS，每个角度两种选择（$+/-$）
- **答案**：存在 $\text{sum} \bmod 360 = 0$

### 核心代码

```cpp
function<bool(int, int)> dfs = [&](int i, int sum) -> bool {
    if (i == n) return sum % 360 == 0;
    return dfs(i + 1, sum + a[i]) || dfs(i + 1, sum - a[i]);
};
cout << (dfs(0, 0) ? "YES" : "NO");
```

### 复杂度

$O(2^N)$。

---

## 15 - CF 1625C Road Optimization（DFS + DP）

### 题意

$L$ 公里的公路上有 $N$ 个限速牌（位置 $d_i$，限速 $a_i$）。最多拆除 $k$ 个限速牌（第一个不能拆），使总行驶时间最小。

### 分析

$dp[i][j]$ = 考虑前 $i$ 个限速牌、已拆 $j$ 个的最小时间。转移时枚举下一个保留的限速牌。

### 搜索策略

- **状态**：$(i, j)$ — 当前限速牌编号、已拆数量
- **搜索方式**：记忆化搜索 / 递推 DP
- **转移**：枚举下一个保留的限速牌 $t$，跳过中间的 $t - i - 1$ 个（拆除）
- **答案**：$\min_j dp[N][j]$（到终点）

### 核心代码

```cpp
// dp[i][j] = min time, sign i-th kept, j removed so far
for (int i = 0; i <= n; i++)
    for (int j = 0; j <= k; j++) dp[i][j] = INF;
dp[0][0] = 0;
for (int i = 0; i <= n; i++)
    for (int j = 0; j <= k; j++) {
        if (dp[i][j] == INF) continue;
        for (int t = i + 1; t <= n + 1; t++) {
            int removed = t - i - 1;
            if (j + removed > k) break;
            int dist = d[t] - d[i]; // d[n+1] = L
            dp[t][j + removed] = min(dp[t][j + removed],
                dp[i][j] + dist * a[i]);
        }
    }
```

### 复杂度

$O(N^2 K)$。

---

## 16 - CF 862B Mahmoud and Ehab and the bipartiteness（DFS / 二分图）

### 题意

$N$ 节点的树。在保持二分图性质的前提下，最多能加多少条边？

### 分析

树是天然的二分图。DFS 染色后，两部分大小为 $a$ 和 $b = N - a$。二分图最多有 $a \times b$ 条边，再减去已有的 $N - 1$ 条边。

### 搜索策略

- **状态**：$(v, \text{color})$
- **搜索方式**：DFS 染色
- **答案**：$a \times b - (N - 1)$

### 核心代码

```cpp
long long cnt[2] = {};
function<void(int, int, int)> dfs = [&](int v, int par, int c) {
    cnt[c]++;
    for (int u : adj[v])
        if (u != par) dfs(u, v, c ^ 1);
};
dfs(1, 0, 0);
cout << cnt[0] * cnt[1] - (n - 1);
```

### 复杂度

$O(N)$。

---

## 17 - CF 1176E Cover it!（DFS / BFS 染色）

### 题意

$N$ 点 $M$ 边无向连通图。选一个**不超过 $\lceil N/2 \rceil$ 个节点**的集合 $S$，使每条边至少有一个端点在 $S$ 中。

### 分析

BFS/DFS 对图二分染色。两种颜色中取节点数较少的那一边（$\le N/2$）。二分染色保证每条边两端颜色不同，所以选某一色的所有节点即为合法覆盖。

### 搜索策略

- **状态**：$(v, \text{color})$
- **搜索方式**：BFS 染色
- **答案**：颜色数量较少的一侧所有节点

### 核心代码

```cpp
vector<int> color(n + 1, -1);
vector<int> groups[2];
queue<int> q;
color[1] = 0; q.push(1);
while (!q.empty()) {
    int v = q.front(); q.pop();
    groups[color[v]].push_back(v);
    for (int u : adj[v])
        if (color[u] == -1) { color[u] = color[v] ^ 1; q.push(u); }
}
auto& ans = groups[0].size() <= groups[1].size() ? groups[0] : groups[1];
```

### 复杂度

$O(N + M)$。

---

## 18 - CF 377A Maze（BFS / 连通性）

### 题意

$N \times M$ 网格有 $\text{cnt}$ 个空格。需恰好堵住 $k$ 个空格使剩余 $\text{cnt} - k$ 个空格仍然连通。

### 分析

反向思考：从任意空格出发 BFS，只保留前 $\text{cnt} - k$ 个访问到的格子，其余空格堵住。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 从任一空格出发，保留前 $\text{cnt} - k$ 个
- **答案**：未被保留的空格变为墙

### 核心代码

```cpp
int need = total - k;
queue<pair<int,int>> q;
// find any empty cell, start BFS
q.push({sr, sc}); vis[sr][sc] = true;
int kept = 0;
while (!q.empty() && kept < need) {
    auto [r, c] = q.front(); q.pop();
    kept++;
    for (4 dirs) if (valid && !vis && grid == '.') {
        vis[nr][nc] = true; q.push({nr, nc});
    }
}
// Mark non-visited empty cells as '#'
```

### 复杂度

$O(NM)$。

---

## 19 - CF 598D Igor In the Museum（BFS / Flood Fill）

### 题意

$N \times M$ 博物馆，`.` 为空地，`*` 为墙。多次询问：从某空地出发，能看到多少面墙（空地四方向相邻的墙面计数）。

### 分析

同一连通分量的空地看到的墙面总数相同。预处理：BFS 找连通分量，同时统计边界墙面数。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS / DFS，逐连通分量处理
- **预计算**：每个连通分量的总墙面数 $= \sum_{(r,c) \in \text{comp}} \sum_{4 \text{dirs}} [\text{neighbor is wall}]$
- **答案**：查询所在分量的预计算值

### 核心代码

```cpp
int comp[N][M]; memset(comp, -1, sizeof comp);
vector<int> walls;
int id = 0;
for (all empty cells not visited) {
    int w = 0;
    queue<pair<int,int>> q;
    // BFS, count wall neighbors for each cell
    walls.push_back(w);
    id++;
}
// Query: cout << walls[comp[r][c]];
```

### 复杂度

预处理 $O(NM)$，每次查询 $O(1)$。

---

## 20 - CF 1037E Trips（DFS / 度数）

### 题意

$N$ 个人，$M$ 天依次加边。每天加完边后，求最大的子集使得子集中每个人至少有 $k$ 个朋友也在子集中。

### 分析

离线反向处理：从最终图开始逐步删边。维护每个点的度数，度数 $< k$ 的点不合法，用类似拓扑排序的方法反复删除不合法点。

### 搜索策略

- **状态**：节点度数
- **搜索方式**：类 BFS/拓扑排序，反复删除度数 $< k$ 的节点
- **答案**：每天删边后的剩余合法节点数

### 核心代码

```cpp
// Process edges in reverse order
int valid = n;
queue<int> q;
for (int v = 1; v <= n; v++)
    if (deg[v] < k) { q.push(v); removed[v] = true; valid--; }
while (!q.empty()) {
    int v = q.front(); q.pop();
    for (int u : adj[v]) {
        if (removed[u]) continue;
        deg[u]--;
        if (deg[u] < k) { q.push(u); removed[u] = true; valid--; }
    }
}
// For each day (reverse), record `valid`, then remove edge
```

### 复杂度

$O((N + M) \log N)$（使用 set 维护邻接表）。

---

## 21 - CF 505B Mr. Kitayuta's Colorful Graph（DFS / 连通分量）

### 题意

$N$ 点 $M$ 边有色图，每条边有颜色 $c$。$Q$ 次询问：$u, v$ 之间有多少种颜色 $c$ 使得仅走颜色为 $c$ 的边能从 $u$ 到 $v$？

### 分析

按颜色分组建图。对每种颜色分别做 DFS/并查集求连通分量。询问时统计 $u, v$ 在多少种颜色的图中属于同一连通分量。

### 搜索策略

- **状态**：$(v, \text{color})$
- **搜索方式**：对每种颜色分别 DFS / 并查集
- **答案**：$\sum_c [\text{same\_comp}(u, v, c)]$

### 核心代码

```cpp
map<int, DSU> dsu; // color -> DSU
for (auto [u, v, c] : edges) {
    if (!dsu.count(c)) dsu[c] = DSU(n);
    dsu[c].unite(u, v);
}
// query (u, v):
int ans = 0;
for (auto& [c, d] : dsu)
    if (d.find(u) == d.find(v)) ans++;
```

### 复杂度

预处理 $O(M \cdot \alpha(N))$，每次查询 $O(C)$，$C$ 为颜色数。

---

## 22 - CF 1294F Three Paths on a Tree（BFS / 树的直径）

### 题意

$N$ 个节点的树，选三个节点 $a, b, c$ 使得三条路径 $a\text{-}b, b\text{-}c, a\text{-}c$ 的并集边数最大。

### 分析

先两次 BFS 求树的直径端点 $a, b$。再从 $a$ 和 $b$ 分别 BFS 求到每个点的距离。第三个点 $c$ 使得 $d(a,c) + d(b,c) - d(a,b)$ 最大（减去重叠部分）的即为最优。

### 搜索策略

- **状态**：节点 $v$
- **搜索方式**：三次 BFS（找直径 + 计算距离）
- **答案**：$(d(a,b) + d(a,c) + d(b,c)) / 2$

### 核心代码

```cpp
auto bfs = [&](int s) -> vector<int> { /* standard BFS */ };
auto da = bfs(1);
int a = max_element(da.begin(), da.end()) - da.begin();
da = bfs(a);
int b = max_element(da.begin(), da.end()) - da.begin();
auto db = bfs(b);
int best = -1, c = -1;
for (int v = 0; v < n; v++) {
    if (v == a || v == b) continue;
    if (da[v] + db[v] > best) { best = da[v] + db[v]; c = v; }
}
cout << (da[b] + da[c] + db[c]) / 2;
```

### 复杂度

$O(N)$。

---

## 23 - CF 835D Palindromic characteristics（记忆化搜索）

### 题意

定义 $k$-回文：$k=1$ 时只需是回文串；$k > 1$ 时需是回文串且前半部分是 $(k-1)$-回文。对字符串 $s$，求每个 $k$ 的子串数。

### 分析

先 DP 求出所有回文子串（Manacher 或区间 DP）。然后 `level[l][r]` 表示 $s[l..r]$ 是几阶回文。$\text{level}[l][r] = \text{level}[l][\text{mid}] + 1$（若 $s[l..r]$ 是回文）。

### 搜索策略

- **状态**：$(l, r)$ 子串的回文阶数
- **搜索方式**：区间 DP + 记忆化
- **转移**：$\text{level}[l][r] = \text{isPalin}[l][r] ? \text{level}[l][(l+r)/2] + 1 : 0$
- **答案**：统计每个 $k$ 值的出现次数

### 核心代码

```cpp
// isPalin[l][r]: standard palindrome DP
for (int len = 1; len <= n; len++)
    for (int l = 0; l + len - 1 < n; l++) {
        int r = l + len - 1;
        if (!isPalin[l][r]) { level[l][r] = 0; continue; }
        int mid = (l + r) / 2;
        level[l][r] = level[l][mid] + 1;
        cnt[level[l][r]]++;
    }
// cnt[k] includes cnt[k+1], so accumulate backwards
for (int k = n; k >= 1; k--) cnt[k] += cnt[k + 1]; // 这里要反向前缀和
```

### 复杂度

$O(N^2)$。

---

## 24 - CF 678E Another Sith Tournament（状压 + 记忆化搜索）

### 题意

$N$ 个人（$N \le 18$）两两有胜率。按某种顺序依次决斗（败者淘汰），第一个人想最大化自己最终获胜的概率。求最优策略下的最大概率。

### 分析

状压 DP。$dp[\text{mask}][i]$ = 当前存活集合为 $\text{mask}$、轮到 $i$ 战斗时，第一个人最终获胜的最大概率。

### 搜索策略

- **状态**：$(\text{mask}, i)$ — 存活集合、当前决斗者
- **搜索方式**：记忆化搜索，枚举对手
- **答案**：初始状态的最大概率

### 核心代码

```cpp
double dp[1 << n][n];
memset(dp, -1, sizeof dp);
function<double(int, int)> solve = [&](int mask, int cur) -> double {
    if (__builtin_popcount(mask) == 1) return (mask >> 0 & 1) ? 1.0 : 0.0;
    if (dp[mask][cur] >= 0) return dp[mask][cur];
    double res = 0;
    for (int j = 0; j < n; j++) {
        if (j == cur || !(mask >> j & 1)) continue;
        // cur beats j with prob p[cur][j]
        double win = p[cur][j] * solve(mask ^ (1 << j), cur);
        double lose = (1 - p[cur][j]) * solve(mask ^ (1 << cur), j);
        res = max(res, win + lose);
    }
    return dp[mask][cur] = res;
};
```

### 复杂度

$O(2^N \cdot N^2)$。

---

## 25 - CF 888E Maximum Subsequence（折半搜索）

### 题意

长为 $N$（$N \le 35$）的数组，选一个子集使元素之和模 $m$ 最大。

### 分析

$2^{35}$ 太大，但 $2^{18} \approx 2.6 \times 10^5$ 可接受。折半搜索：前半枚举所有子集和模 $m$，排序后，对后半每个子集和用二分查找最优配对。

### 搜索策略

- **前半**：枚举前 $N/2$ 个元素的 $2^{N/2}$ 种子集和 $\bmod m$，排序
- **后半**：枚举后 $N/2$ 个元素的子集和 $s$，在前半中二分找 $m - 1 - s$ 附近的值
- **答案**：所有配对 $(s_1 + s_2) \bmod m$ 的最大值

### 核心代码

```cpp
vector<long long> left_sums, right_sums;
// Enumerate left half subsets
for (int mask = 0; mask < (1 << half); mask++) {
    long long s = 0;
    for (int i = 0; i < half; i++)
        if (mask >> i & 1) s = (s + a[i]) % m;
    left_sums.push_back(s);
}
sort(left_sums.begin(), left_sums.end());
long long ans = 0;
for (long long s : right_sums) {
    long long target = m - 1 - s;
    auto it = upper_bound(left_sums.begin(), left_sums.end(), target);
    if (it != left_sums.begin()) ans = max(ans, (s + *prev(it)) % m);
    ans = max(ans, (s + left_sums.back()) % m);
}
```

### 复杂度

$O(2^{N/2} \cdot \log 2^{N/2})$。

---

## 26 - CF 1006F Xor-Paths（折半搜索）

### 题意

$N \times M$ 网格（$N, M \le 20$），只能向右或向下走，从 $(1,1)$ 到 $(N,M)$。求路径上所有值 XOR 等于 $k$ 的路径数。

### 分析

路径长 $N + M - 2$ 步，折半在对角线 $r + c = \lfloor(N+M-2)/2\rfloor$ 处分割。前半从 $(1,1)$ DFS 到对角线，后半从 $(N,M)$ 反向 DFS 到同一对角线，在对角线上合并。

### 搜索策略

- **前半**：DFS 从 $(0,0)$ 到对角线，记录 `map<(r,c,xor), count>`
- **后半**：DFS 从 $(N-1,M-1)$ 反向到对角线，查表合并
- **答案**：$\sum \text{forward}[r][c][\text{xor}] \times \text{backward match}$

### 核心代码

```cpp
int mid = (n + m - 2) / 2;
map<tuple<int,int,long long>, long long> fwd;
function<void(int, int, long long, int)> dfs1 = [&](int r, int c, long long x, int step) {
    x ^= grid[r][c];
    if (step == mid) { fwd[{r, c, x}]++; return; }
    if (r + 1 < n) dfs1(r+1, c, x, step+1);
    if (c + 1 < m) dfs1(r, c+1, x, step+1);
};
dfs1(0, 0, 0, 0);
long long ans = 0;
function<void(int, int, long long, int)> dfs2 = [&](int r, int c, long long x, int step) {
    if (step == (n+m-2) - mid) {
        x ^= grid[r][c]; // avoid double-counting diagonal cell
        if (fwd.count({r, c, x ^ k})) ans += fwd[{r, c, x ^ k}];
        return;
    }
    x ^= grid[r][c];
    if (r - 1 >= 0) dfs2(r-1, c, x, step+1);
    if (c - 1 >= 0) dfs2(r, c-1, x, step+1);
};
dfs2(n-1, m-1, 0, 0);
```

### 复杂度

$O\!\bigl(\binom{N+M-2}{(N+M-2)/2}^{1/2}\bigr)$。

---

## 27 - CF 1515E Phoenix and Computers（DFS + 组合数学）

### 题意

$N$ 台电脑排成一排。手动开机或由两台相邻已开机电脑自动开启中间的电脑。求使所有电脑开启的方案数（开机顺序不同算不同方案），模 $10^9 + 7$。

### 分析

将连续手动开启的段视为一组。若手动开一段长 $k$ 的连续电脑，有 $2^{k-1}$ 种顺序（从中间往两边或从一端开始等）。各段之间由自动开启的电脑隔开。用 DP 枚举分段方式。

### 搜索策略

- **状态**：$dp[i]$ = 前 $i$ 台电脑全部开启的方案数
- **搜索方式**：枚举最后一段手动开启的长度 $k$
- **转移**：$dp[i] = \sum_{k} dp[i-k-1] \cdot 2^{k-1} \cdot \binom{i}{k}$（组合数选择开机时间的插入位置）
- **答案**：$dp[N]$

### 核心代码

```cpp
dp[0] = 1;
for (int i = 1; i <= n; i++)
    for (int k = 1; k <= i; k++) {
        int prev = i - k - 1; // -1 for auto-lit separator
        if (prev < 0 && k == i) {
            dp[i] = (dp[i] + pw2[k - 1]) % MOD;
        } else if (prev >= 0) {
            dp[i] = (dp[i] + dp[prev] % MOD * pw2[k - 1] % MOD * C[i - 1][k - 1]) % MOD;
        }
    }
```

### 复杂度

$O(N^2)$。

---

## 28 - CF 1534D Lost Tree（交互 / BFS）

### 题意

交互题。给定 $N$ 个节点的树（未知结构）。每次询问一个节点 $v$，返回所有节点到 $v$ 的距离。最多询问 $\lceil N/2 \rceil + 1$ 次。还原所有边。

### 分析

先询问节点 $1$，按距离奇偶分成两组。再对较小的一组中的每个节点询问。利用 $d(u, v) = d(u, 1) + d(1, v) - 2 \cdot d(1, \text{lca})$ 的性质还原边。

### 搜索策略

- **第一步**：询问节点 $1$，得到 $d_1[v]$
- **分组**：奇数层 vs 偶数层，选较小组
- **逐点询问**：对较小组的每个节点 $u$ 询问，$v$ 是 $u$ 的父亲当且仅当 $d_u[v] = 1$ 且 $d_1[v] = d_1[u] - 1$

### 核心代码

```cpp
ask(1); // get d1[]
vector<int> odd_nodes, even_nodes;
for (int v = 2; v <= n; v++)
    (d1[v] % 2 ? odd_nodes : even_nodes).push_back(v);
auto& small = odd_nodes.size() < even_nodes.size() ? odd_nodes : even_nodes;
for (int u : small) {
    ask(u); // get du[]
    for (int v = 1; v <= n; v++)
        if (du[v] == 1 && d1[v] == d1[u] - 1) { add_edge(u, v); break; }
}
```

### 复杂度

$O(N)$ 次询问内。

---

## 29 - CF 547D Mike and Fish（DFS / 欧拉回路）

### 题意

$N$ 个格点，要求红蓝染色使得每行、每列红蓝数量差 $\le 1$。

### 分析

将行和列视为二部图的两侧。每个点 $(r, c)$ 是一条连接行 $r$ 和列 $c$ 的边。对这个二部图求欧拉回路/路径，交替红蓝染色即可保证每个行/列节点的红蓝度数差 $\le 1$。

### 搜索策略

- **建图**：行节点 + 列节点，每个点是一条边
- **搜索方式**：DFS 求欧拉回路，交替染色
- **预处理**：奇度数节点两两补边
- **答案**：欧拉回路上交替红蓝

### 核心代码

```cpp
// Build bipartite graph: row nodes, col nodes
// Add dummy edges for odd-degree nodes
// DFS Euler circuit
function<void(int)> euler = [&](int v) {
    while (ptr[v] < adj[v].size()) {
        auto [u, idx] = adj[v][ptr[v]++];
        if (used[idx]) continue;
        used[idx] = true;
        euler(u);
        // alternate color based on depth parity
        color[idx] = depth % 2;
    }
};
```

### 复杂度

$O(N + R + C)$。

---

## 30 - CF 1236D Alice and the Doll（BFS / 模拟）

### 题意

$N \times M$ 网格，部分有障碍。机器人从 $(1,1)$ 出发朝右，只能右转（不能左转、不能掉头），且每个空格恰好经过一次。判断是否可行。

### 分析

模拟螺旋遍历：每次沿当前方向走到底（遇墙或已访问时右转）。贪心地尽可能走远。检查最终是否所有空格都被访问。

### 搜索策略

- **状态**：$(r, c, \text{dir})$
- **搜索方式**：模拟 + 贪心走到底
- **右转规则**：方向顺序 右→下→左→上
- **答案**：所有空格恰好访问一次 → `Yes`

### 核心代码

```cpp
int dr[] = {0, 1, 0, -1}, dc[] = {1, 0, -1, 0}; // R, D, L, U
int r = 0, c = 0, d = 0, visited = 1;
vis[0][0] = true;
while (true) {
    // Try to go straight
    int nr = r + dr[d], nc = c + dc[d];
    if (valid(nr, nc) && !vis[nr][nc]) {
        r = nr; c = nc; vis[r][c] = true; visited++;
    } else {
        d = (d + 1) % 4; // right turn
        nr = r + dr[d]; nc = c + dc[d];
        if (!valid(nr, nc) || vis[nr][nc]) break;
        r = nr; c = nc; vis[r][c] = true; visited++;
    }
}
cout << (visited == total_empty ? "Yes" : "No");
```

### 复杂度

$O(NM)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **DFS 入门** | 1, 2, 3, 4 | 树遍历、环检测、连通分量 |
| **BFS 入门** | 5, 10, 18 | 网格 BFS、BFS 模拟、连通性 |
| **二分图 / 染色** | 6, 16, 17 | DFS/BFS 染色、二分图性质 |
| **多源 BFS** | 7, 11, 12 | 反向图 BFS、多源最短路 |
| **0-1 BFS** | 8, 9 | 双端队列、带权网格搜索 |
| **子集枚举** | 13, 14 | $2^N$ 枚举、DFS 枚举 |
| **DP + 搜索** | 15, 23, 27 | 记忆化搜索、状态递推 |
| **Flood Fill** | 18, 19, 21 | 连通分量预处理、按颜色分组 |
| **树上搜索** | 20, 22 | 度数维护、直径 |
| **状压记忆化** | 24 | $2^N$ 状态、概率搜索 |
| **折半搜索** | 25, 26 | Meet in the Middle、二分查找 |
| **欧拉回路** | 29 | 交替染色、DFS |
| **交互搜索** | 28 | 奇偶分组、BFS 还原 |
| **模拟搜索** | 30 | 螺旋遍历、贪心方向 |

## 学习路线建议

```
入门：1 → 2 → 3 → 4 → 5
       ↓
DFS 进阶：6 → 16 → 17 → 21 → 22
       ↓
BFS 技巧：7 → 8 → 9 → 10 → 11 → 12
       ↓
枚举与回溯：13 → 14 → 18 → 19
       ↓
记忆化与状压：15 → 23 → 24
       ↓
折半搜索：25 → 26
       ↓
高级：27 → 28 → 29 → 30
```

## 解题方法论

1. **判别搜索类型**：无权最短路 → BFS；连通性/环/树性质 → DFS；小规模枚举 → $2^N$ / DFS 回溯。
2. **状态设计精简化**：只保留影响决策的信息。0-1 BFS 用于边权 $\{0,1\}$；分层图用于带切换的状态空间。
3. **多源 BFS 思维**：多个源点同时扩展等价于添加超级源点。反向建图 + 多源 BFS 可解决"到最近异类"的问题。
4. **折半搜索**：$N \le 40$ 时将搜索空间一分为二，各自枚举后合并（排序 + 二分 / 哈希表）。
5. **图的二分性**：很多约束问题可建模为二分图染色，DFS/BFS 一次遍历即可判定。

> 💡 **记住**：Codeforces 搜索题的难点往往不在搜索本身，而在**建模**——如何将题目转化为图/树/状态空间上的搜索问题。掌握 DFS/BFS 的各种变体后，核心竞争力在于"把问题翻译成搜索语言"的能力。
