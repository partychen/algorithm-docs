---
title: "AtCoder 搜索专题精选解题报告"
subtitle: "🏆 26 道经典搜索题目的分析方法、解题思路与核心代码"
order: 1
icon: "🏆"
---

# AtCoder 搜索专题精选解题报告

> 来源：精选自 [AtCoder](https://atcoder.jp/) ABC / ARC / AGC 各场比赛中的搜索类题目
>
> 本报告针对 26 道精选搜索题目，逐题给出**题意概述 → 分析方法 → 搜索策略 → 核心代码 → 复杂度**，最后做整体总结。

---

## 1 - ABC 007C 广度优先搜索（BFS 入门）

### 题意

$R \times C$ 的网格迷宫，`.` 为通路，`#` 为墙壁。给定起点 $(sy, sx)$ 和终点 $(gy, gx)$，求最短步数。

### 分析

BFS 求无权图最短路的模板题。从起点出发逐层扩展，首次到达终点时的层数即为答案。

### 搜索策略

- **状态**：$(r, c)$ — 当前所在行列
- **搜索方式**：BFS 队列，四方向扩展
- **剪枝**：`dist[r][c] != -1` 时跳过（已访问）
- **答案**：`dist[gy][gx]`

### 核心代码

```cpp
int dist[R][C];
memset(dist, -1, sizeof dist);
queue<pair<int,int>> q;
dist[sy][sx] = 0;
q.push({sy, sx});
int dx[] = {0,0,1,-1}, dy[] = {1,-1,0,0};
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;
        if (grid[nr][nc] == '#' || dist[nr][nc] != -1) continue;
        dist[nr][nc] = dist[r][c] + 1;
        q.push({nr, nc});
    }
}
// 答案：dist[gy][gx]
```

### 复杂度

$O(RC)$ 时间，$O(RC)$ 空间。

---

## 2 - ABC 088D Grid（BFS 最短路 + 求和）

### 题意

$H \times W$ 的网格，每个格子为白（`.`）或黑（`#`）。从 $(1,1)$ 走到 $(H,W)$，只能走白格、四方向移动。若可达，输出**白格总数 $-$ 最短路径经过的格子数**；否则输出 $-1$。

### 分析

先 BFS 求起点到终点的最短路径长度（经过的格子数 $= \text{dist} + 1$）。再统计白格总数。答案为未在最短路径上的白格数量。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 从 $(0,0)$ 出发
- **答案**：若 `dist[H-1][W-1] == -1` 则不可达；否则答案 $= \text{white} - (\text{dist}[H-1][W-1] + 1)$

### 核心代码

```cpp
// BFS 求最短路（同第 1 题模板）
int white = 0;
for (int i = 0; i < H; i++)
    for (int j = 0; j < W; j++)
        if (grid[i][j] == '.') white++;
if (dist[H-1][W-1] == -1) cout << -1;
else cout << white - (dist[H-1][W-1] + 1);
```

### 复杂度

$O(HW)$。

---

## 3 - ABC 168D .. (Double Dots)（BFS 最短路径树）

### 题意

$N$ 点 $M$ 边无向图。对每个节点 $2 \sim N$，输出一个"路标"：指向一个相邻节点，使得沿路标走能以最短路到达节点 $1$。

### 分析

从节点 $1$ 做 BFS，记录每个节点的**发现者**（BFS 树上的父亲）。发现者即为该节点的最优路标。

### 搜索策略

- **状态**：节点编号 $v$
- **搜索方式**：BFS 从节点 $1$ 出发
- **关键记录**：`parent[v]` = 在 BFS 树上发现 $v$ 的节点
- **答案**：对 $v = 2 \dots N$ 输出 `parent[v]`

### 核心代码

```cpp
vector<int> parent(N + 1, -1);
queue<int> q;
parent[1] = 0;
q.push(1);
while (!q.empty()) {
    int v = q.front(); q.pop();
    for (int u : adj[v]) {
        if (parent[u] != -1) continue;
        parent[u] = v;
        q.push(u);
    }
}
for (int v = 2; v <= N; v++) cout << parent[v] << "\n";
```

### 复杂度

$O(N + M)$。

---

## 4 - AGC 033A Darker and Darker（多源 BFS）

### 题意

$H \times W$ 网格，部分格子为黑色，其余为白色。每一步，所有与黑格相邻的白格同时变黑。求所有格子变黑的步数。

### 分析

等价于求**每个白格到最近黑格的最大距离**。这是多源 BFS 的经典应用：将所有黑格同时入队作为源点。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：多源 BFS，初始将所有黑格入队，`dist = 0`
- **答案**：所有格子中 `dist` 的最大值

### 核心代码

```cpp
queue<pair<int,int>> q;
int dist[H][W];
memset(dist, -1, sizeof dist);
for (int i = 0; i < H; i++)
    for (int j = 0; j < W; j++)
        if (grid[i][j] == '#') {
            dist[i][j] = 0;
            q.push({i, j});
        }
int ans = 0;
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
        if (dist[nr][nc] != -1) continue;
        dist[nr][nc] = dist[r][c] + 1;
        ans = max(ans, dist[nr][nc]);
        q.push({nr, nc});
    }
}
```

### 复杂度

$O(HW)$。

---

## 5 - ABC 151D Maze Master（BFS 全点对最远距离）

### 题意

$H \times W$ 迷宫，`.` 为通路，`#` 为墙壁。求任意两个 `.` 格子之间最短路的最大值。

### 分析

对每个 `.` 格子做一次 BFS，取所有 BFS 结果中的最大距离值。$H, W \le 20$，复杂度可接受。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：从每个 `.` 格子出发做 BFS
- **答案**：所有 BFS 结果中距离的全局最大值

### 核心代码

```cpp
int ans = 0;
for (int i = 0; i < H; i++)
    for (int j = 0; j < W; j++) {
        if (grid[i][j] == '#') continue;
        // BFS from (i, j)
        int d[H][W]; memset(d, -1, sizeof d);
        queue<pair<int,int>> q;
        d[i][j] = 0; q.push({i, j});
        while (!q.empty()) {
            auto [r, c] = q.front(); q.pop();
            for (int k = 0; k < 4; k++) {
                int nr = r + dx[k], nc = c + dy[k];
                if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
                if (grid[nr][nc] == '#' || d[nr][nc] != -1) continue;
                d[nr][nc] = d[r][c] + 1;
                ans = max(ans, d[nr][nc]);
                q.push({nr, nc});
            }
        }
    }
```

### 复杂度

$O(H^2 W^2)$。

---

## 6 - ARC 031B 填海造陆（DFS 连通性判定）

### 题意

$10 \times 10$ 网格，`o` 为陆地，`x` 为海洋。问能否将**恰好一个** `x` 变为 `o`，使所有 `o` 连通。

### 分析

暴力枚举：尝试将每个 `x` 翻转为 `o`，然后 DFS 检查所有 `o` 是否连通。网格固定 $10 \times 10$，复杂度没有问题。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS / BFS 检查连通性
- **枚举方式**：遍历所有 `x` 格子，依次翻转后检查
- **答案**：存在某次翻转后所有 `o` 连通 → `YES`

### 核心代码

```cpp
bool check(char g[10][10]) {
    bool vis[10][10] = {};
    int sr = -1, sc = -1;
    for (int i = 0; i < 10; i++)
        for (int j = 0; j < 10; j++)
            if (g[i][j] == 'o') sr = i, sc = j;
    if (sr == -1) return true;
    // DFS from (sr, sc)
    dfs(g, vis, sr, sc);
    for (int i = 0; i < 10; i++)
        for (int j = 0; j < 10; j++)
            if (g[i][j] == 'o' && !vis[i][j]) return false;
    return true;
}
// 主逻辑：枚举每个 'x'，翻转 → check → 翻转回
```

### 复杂度

$O(100 \times 100) = O(1)$（固定网格大小）。

---

## 7 - ABC 138D Ki（DFS 子树累加）

### 题意

$N$ 个节点的有根树（根为 $1$）。$Q$ 次操作，每次给节点 $p$ 的子树所有节点加 $x$。输出最终各节点的值。

### 分析

不需要逐个修改子树节点。将加值标记在节点 $p$ 上，最后一次 DFS 从根向下传递累加值即可。

### 搜索策略

- **状态**：节点编号 $v$、从祖先传递下来的累加值 $sum$
- **搜索方式**：DFS 从根节点 $1$ 出发，自顶向下传递
- **关键**：`ans[v] = sum + add[v]`，然后将 `ans[v]` 传递给子节点

### 核心代码

```cpp
vector<long long> add(N + 1, 0), ans(N + 1, 0);
// 读入操作，累加到 add[p]
for (auto [p, x] : ops) add[p] += x;
// DFS 传递
function<void(int, int, long long)> dfs = [&](int v, int par, long long sum) {
    sum += add[v];
    ans[v] = sum;
    for (int u : adj[v])
        if (u != par) dfs(u, v, sum);
};
dfs(1, 0, 0);
```

### 复杂度

$O(N + Q)$。

---

## 8 - ABC 126D Even Relation（DFS 奇偶染色）

### 题意

$N$ 个节点的带权树。给每个节点染黑或白色，使得**同色节点对之间路径权值和为偶数**。

### 分析

树上任意两点路径唯一。路径权值和的奇偶性 $=$ 两端点到根的距离奇偶性的异或。因此以距离奇偶性为依据染色：偶数→白，奇数→黑。

### 搜索策略

- **状态**：$(v, \text{parity})$ — 当前节点及到根的距离奇偶
- **搜索方式**：DFS 从根出发，维护路径权值和的奇偶性
- **答案**：`parity[v] == 0` → 白，否则 → 黑

### 核心代码

```cpp
vector<int> color(N + 1);
function<void(int, int, int)> dfs = [&](int v, int par, int parity) {
    color[v] = parity;
    for (auto [u, w] : adj[v])
        if (u != par)
            dfs(u, v, parity ^ (w % 2));
};
dfs(1, 0, 0);
```

### 复杂度

$O(N)$。

---

## 9 - ABC 213D Takahashi Tour（DFS 遍历序模拟）

### 题意

$N$ 个节点的树。从节点 $1$ 出发，每次优先走**编号最小**的未访问子节点；无未访问子节点时回退。输出每次经过的节点编号。

### 分析

本质是模拟 DFS 遍历序。将每个节点的邻接表排序，DFS 时按序访问。进入和回退时都输出当前节点。

### 搜索策略

- **状态**：当前节点 $v$
- **搜索方式**：DFS，邻接表升序排列
- **关键**：进入节点时输出 $v$；从子节点返回时再输出 $v$

### 核心代码

```cpp
for (auto& v : adj) sort(v.begin(), v.end());
vector<int> tour;
function<void(int, int)> dfs = [&](int v, int par) {
    tour.push_back(v);
    for (int u : adj[v]) {
        if (u == par) continue;
        dfs(u, v);
        tour.push_back(v); // 回退时输出
    }
};
dfs(1, 0);
```

### 复杂度

$O(N \log N)$（排序），遍历 $O(N)$。

---

## 10 - ARC 037B 树判定（DFS 树判定）

### 题意

$N$ 个节点、$M$ 条边的无向图。求图中有多少个连通分量是**树**。

### 分析

连通分量是树 $\Leftrightarrow$ 连通且边数 $=$ 节点数 $- 1$（即无环）。DFS 遍历每个连通分量，统计节点数和边数。

### 搜索策略

- **状态**：节点编号 $v$
- **搜索方式**：DFS 遍历每个连通分量
- **判定**：分量内边数 $=$ 节点数 $- 1$ → 是树
- **答案**：满足条件的分量数

### 核心代码

```cpp
int ans = 0;
vector<bool> vis(N, false);
for (int i = 0; i < N; i++) {
    if (vis[i]) continue;
    int nodes = 0, edges = 0;
    function<void(int)> dfs = [&](int v) {
        vis[v] = true;
        nodes++;
        for (int u : adj[v]) {
            edges++;
            if (!vis[u]) dfs(u);
        }
    };
    dfs(i);
    edges /= 2; // 每条边被计数两次
    if (edges == nodes - 1) ans++;
}
```

### 复杂度

$O(N + M)$。

---

## 11 - ABC 054C One-stroke Path（DFS 哈密顿路径计数）

### 题意

$N$ 个节点（$N \le 8$）、$M$ 条边的无向图。从节点 $1$ 出发，不重复经过所有节点的路径有多少条？（模 $10^9 + 7$）

### 分析

$N \le 8$ 极小，DFS 暴力枚举所有路径即可。用 `visited` 位掩码记录已访问节点。

### 搜索策略

- **状态**：$(v, \text{mask})$ — 当前节点及已访问节点集合
- **搜索方式**：DFS 回溯，每次选择一个未访问的邻居
- **答案**：到达 `mask = (1 << N) - 1` 的路径数

### 核心代码

```cpp
long long ans = 0;
function<void(int, int, int)> dfs = [&](int v, int mask, int cnt) {
    if (cnt == N) { ans++; return; }
    for (int u : adj[v]) {
        if (mask >> u & 1) continue;
        dfs(u, mask | (1 << u), cnt + 1);
    }
};
dfs(0, 1, 1); // 从节点 0 出发，已访问 {0}
cout << ans % MOD;
```

### 复杂度

$O(N!)$，$N \le 8$ 时完全可行。

---

## 12 - ABC 114C 755（DFS 数位构造搜索）

### 题意

求 $1 \sim N$（$N \le 10^9$）中有多少个"七五三数"——只包含数字 $3, 5, 7$ 且三个数字**各至少出现一次**。

### 分析

七五三数的位数最多 $10$ 位（$\le 10^9$），且每位只有 $3$ 种选择。DFS 逐位构造所有候选数，检查是否 $\le N$ 且包含全部三种数字。

### 搜索策略

- **状态**：当前构造的数值 $x$、已使用的数字集合
- **搜索方式**：DFS，每步追加数字 $3/5/7$
- **剪枝**：$x > N$ 时剪枝
- **答案**：满足 $x \le N$ 且三种数字全出现的个数

### 核心代码

```cpp
int ans = 0;
function<void(long long, bool, bool, bool)> dfs =
    [&](long long x, bool has3, bool has5, bool has7) {
    if (x > N) return;
    if (has3 && has5 && has7) ans++;
    dfs(x * 10 + 3, true, has5, has7);
    dfs(x * 10 + 5, has3, true, has7);
    dfs(x * 10 + 7, has3, has5, true);
};
dfs(3, true, false, false);
dfs(5, false, true, false);
dfs(7, false, false, true);
```

### 复杂度

$O(3^{d})$，$d \le 10$，总状态数 $\le 3^{10} = 59049$。

---

## 13 - ABC 165C Many Requirements（DFS 递增序列枚举）

### 题意

枚举所有长为 $N$ 的递增序列 $A$（$1 \le A_1 \le A_2 \le \cdots \le A_N \le M$），对给定的 $Q$ 个条件 $(a, b, c, d)$ 计算 $A_b - A_a = c$ 的贡献 $d$，求最大总贡献。

### 分析

$N \le 10$，$M \le 10$，递增序列总数 $= \binom{M+N-1}{N}$ 很小。DFS 枚举所有序列，对每个序列计算得分。

### 搜索策略

- **状态**：当前填到第 $i$ 个位置，上一个填的值为 $\text{prev}$
- **搜索方式**：DFS，第 $i$ 位从 $\text{prev}$ 枚举到 $M$
- **答案**：所有合法序列得分的最大值

### 核心代码

```cpp
int ans = 0;
vector<int> A(N);
function<void(int, int)> dfs = [&](int i, int prev) {
    if (i == N) {
        int score = 0;
        for (auto [a, b, c, d] : conds)
            if (A[b] - A[a] == c) score += d;
        ans = max(ans, score);
        return;
    }
    for (int v = prev; v <= M; v++) {
        A[i] = v;
        dfs(i + 1, v);
    }
};
dfs(0, 1);
```

### 复杂度

$O\!\bigl(\binom{M+N-1}{N} \cdot Q\bigr)$，题目保证数据规模可行。

---

## 14 - ABC 198D Send More Money（回溯 / 字母算术）

### 题意

给三个由小写字母组成的字符串 $S_1, S_2, S_3$（不同字母 $\le 10$ 种）。给每个字母分配 $0 \sim 9$ 的不同数字，使得 $[S_1] + [S_2] = [S_3]$（视为数字）。首字母不能为 $0$。

### 分析

经典密码算术（Cryptarithmetic）。不同字母 $\le 10$ 个，回溯枚举每个字母的数字分配，用剪枝加速。

### 搜索策略

- **状态**：已分配的字母数量及数字使用情况
- **搜索方式**：DFS 逐个为字母分配数字
- **剪枝**：首字母不为 $0$；所有字母分配完后验证等式
- **答案**：找到满足等式的第一组分配

### 核心代码

```cpp
vector<int> assign(26, -1);
vector<bool> used(10, false);
string chars = /* 去重的字母列表 */;
function<bool(int)> dfs = [&](int i) -> bool {
    if (i == (int)chars.size()) {
        // 构造数字，检查 S1 + S2 == S3
        return toNum(S1) + toNum(S2) == toNum(S3);
    }
    for (int d = 0; d <= 9; d++) {
        if (used[d]) continue;
        if (d == 0 && isLeading(chars[i])) continue;
        assign[chars[i] - 'a'] = d;
        used[d] = true;
        if (dfs(i + 1)) return true;
        used[d] = false;
        assign[chars[i] - 'a'] = -1;
    }
    return false;
};
```

### 复杂度

最坏 $O(10!)$，剪枝后远小于此。

---

## 15 - ABC 293C Make Takahashi Happy（DFS 路径搜索）

### 题意

$H \times W$ 网格，每格一个正整数。从 $(1,1)$ 只向右或向下走到 $(H,W)$，求路径上所有值互不相同的路径数。（$H, W \le 10$）

### 分析

路径长度 $= H + W - 1 \le 19$。DFS 枚举所有路径，用集合维护路径上出现过的值。

### 搜索策略

- **状态**：$(r, c, \text{seen})$ — 当前位置及已出现的值集合
- **搜索方式**：DFS，每步向右或向下
- **剪枝**：当前格子值已在 `seen` 中 → 剪枝
- **答案**：到达 $(H,W)$ 时的合法路径数

### 核心代码

```cpp
int ans = 0;
set<int> seen;
function<void(int, int)> dfs = [&](int r, int c) {
    if (seen.count(grid[r][c])) return;
    seen.insert(grid[r][c]);
    if (r == H - 1 && c == W - 1) { ans++; }
    else {
        if (r + 1 < H) dfs(r + 1, c);
        if (c + 1 < W) dfs(r, c + 1);
    }
    seen.erase(grid[r][c]);
};
dfs(0, 0);
```

### 复杂度

$O\!\bigl(\binom{H+W-2}{H-1}\bigr)$，最大约 $\binom{18}{9} \approx 48620$。

---

## 16 - ABC 128C Switches（位枚举搜索）

### 题意

$N$ 个开关（$N \le 10$）、$M$ 个灯泡。每个灯泡连接若干开关，当所连开关中打开数量的奇偶性满足要求时灯泡亮。求使所有灯泡亮的开关方案数。

### 分析

$N \le 10$，直接枚举 $2^N$ 种开关状态，逐一检查所有灯泡条件。

### 搜索策略

- **状态**：$N$ 位二进制数，表示每个开关的开/关
- **搜索方式**：位枚举 $0 \sim 2^N - 1$
- **答案**：满足所有灯泡条件的状态数

### 核心代码

```cpp
int ans = 0;
for (int mask = 0; mask < (1 << N); mask++) {
    bool ok = true;
    for (int j = 0; j < M; j++) {
        int cnt = 0;
        for (int k : bulb[j])
            if (mask >> (k - 1) & 1) cnt++;
        if (cnt % 2 != parity[j]) { ok = false; break; }
    }
    if (ok) ans++;
}
```

### 复杂度

$O(2^N \cdot M \cdot N)$。

---

## 17 - ABC 190C Bowls and Dishes（子集枚举）

### 题意

$K$ 个人（$K \le 16$），每人从两个选项中选一个（放球到碗 $A$ 或碗 $B$）。$M$ 个条件要求某两个碗都有球。求最大满足条件数。

### 分析

$K \le 16$，枚举 $2^K$ 种选择方案，逐一统计满足条件数。

### 搜索策略

- **状态**：$K$ 位二进制数，第 $i$ 位表示第 $i$ 人的选择
- **搜索方式**：位枚举 $0 \sim 2^K - 1$
- **答案**：所有方案中满足条件数的最大值

### 核心代码

```cpp
int ans = 0;
for (int mask = 0; mask < (1 << K); mask++) {
    set<int> has;
    for (int i = 0; i < K; i++)
        has.insert((mask >> i & 1) ? choice[i].second : choice[i].first);
    int cnt = 0;
    for (auto [c, d] : conds)
        if (has.count(c) && has.count(d)) cnt++;
    ans = max(ans, cnt);
}
```

### 复杂度

$O(2^K \cdot (K + M))$。

---

## 18 - ABC 176D Wizard in Maze（0-1 BFS）

### 题意

$H \times W$ 网格迷宫。普通移动到相邻 `.` 格子（代价 $0$）；施展魔法可瞬移到以当前位置为中心的 $5 \times 5$ 范围内任意 `.` 格子（代价 $1$）。求从起点到终点的最小魔法使用次数。

### 分析

边权只有 $0$（普通移动）和 $1$（魔法）。使用 **0-1 BFS**（双端队列 BFS）：代价 $0$ 的邻居加入队首，代价 $1$ 的加入队尾。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：0-1 BFS，双端队列
- **代价 0**：四方向相邻 `.` 格子 → push_front
- **代价 1**：$5 \times 5$ 范围内 `.` 格子 → push_back
- **答案**：`dist[gr][gc]`

### 核心代码

```cpp
deque<pair<int,int>> dq;
int dist[H][W];
memset(dist, -1, sizeof dist);
dist[sy][sx] = 0;
dq.push_back({sy, sx});
while (!dq.empty()) {
    auto [r, c] = dq.front(); dq.pop_front();
    // 普通移动（代价 0）
    for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        if (valid(nr, nc) && dist[nr][nc] == -1) {
            dist[nr][nc] = dist[r][c];
            dq.push_front({nr, nc});
        }
    }
    // 魔法（代价 1）
    for (int dr = -2; dr <= 2; dr++)
        for (int dc = -2; dc <= 2; dc++) {
            int nr = r + dr, nc = c + dc;
            if (valid(nr, nc) && dist[nr][nc] == -1) {
                dist[nr][nc] = dist[r][c] + 1;
                dq.push_back({nr, nc});
            }
        }
}
```

### 复杂度

$O(HW)$（每个格子至多入队一次）。

---

## 19 - ARC 005C 破坏障碍!（0-1 BFS / 状态搜索）

### 题意

$H \times W$ 网格迷宫。`.` 为通路，`#` 为墙壁。最多可以破坏 $2$ 面墙壁（使其变为通路）。问能否从起点到达终点。

### 分析

将"已破坏的墙壁数"加入状态。移动到 `.` 代价 $0$，破墙移动到 `#` 代价 $1$。总代价 $\le 2$ 即可达。使用 0-1 BFS 在三层状态图上搜索。

### 搜索策略

- **状态**：$(r, c, k)$ — 当前位置及已破坏的墙壁数（$k = 0, 1, 2$）
- **搜索方式**：0-1 BFS
- **代价 0**：移动到 `.` → push_front
- **代价 1**：移动到 `#`（$k < 2$ 时）→ push_back
- **答案**：`dist[gr][gc][k] ≤ 2` 对某个 $k$

### 核心代码

```cpp
int dist[H][W][3];
memset(dist, -1, sizeof dist);
deque<tuple<int,int,int>> dq;
dist[sy][sx][0] = 0;
dq.push_back({sy, sx, 0});
while (!dq.empty()) {
    auto [r, c, k] = dq.front(); dq.pop_front();
    if (r == gy && c == gx) { cout << "YES"; return; }
    for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        if (!inRange(nr, nc)) continue;
        if (grid[nr][nc] == '.' && dist[nr][nc][k] == -1) {
            dist[nr][nc][k] = dist[r][c][k];
            dq.push_front({nr, nc, k});
        }
        if (grid[nr][nc] == '#' && k < 2 && dist[nr][nc][k+1] == -1) {
            dist[nr][nc][k+1] = dist[r][c][k] + 1;
            dq.push_back({nr, nc, k + 1});
        }
    }
}
```

### 复杂度

$O(HW)$（状态数 $3HW$）。

---

## 20 - ABC 184E Third Avenue（BFS 传送门）

### 题意

$H \times W$ 网格。除了四方向移动外，格子上标有字母 `a`–`z` 时可**瞬间传送**到所有标有相同字母的格子。求从起点到终点的最短步数。

### 分析

BFS 中，第一次踩到字母 `c` 时，将所有 `c` 格子加入队列（距离 $+1$），然后**清空该字母的列表**避免重复传送。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS
- **关键优化**：每个字母的传送门组只触发一次，触发后清空列表
- **答案**：`dist[gr][gc]`

### 核心代码

```cpp
vector<pair<int,int>> portals[26];
// 预处理每个字母的位置列表
queue<pair<int,int>> q;
dist[sy][sx] = 0; q.push({sy, sx});
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    // 四方向移动
    for (int d = 0; d < 4; d++) { /* 标准 BFS */ }
    // 传送门
    if (grid[r][c] >= 'a' && grid[r][c] <= 'z') {
        int ch = grid[r][c] - 'a';
        for (auto [pr, pc] : portals[ch]) {
            if (dist[pr][pc] != -1) continue;
            dist[pr][pc] = dist[r][c] + 1;
            q.push({pr, pc});
        }
        portals[ch].clear(); // 关键：避免重复遍历
    }
}
```

### 复杂度

$O(HW)$（每个传送门组只遍历一次）。

---

## 21 - ABC 277E Crystal Switches（BFS 分层图）

### 题意

$N$ 个节点、$M$ 条边的图。每条边有类型 $0$ 或 $1$，只有当前状态与边类型匹配时才能通过。$K$ 个特殊节点上有开关可切换状态。求从节点 $1$ 到节点 $N$ 的最短步数。

### 分析

经典**分层图**思路。将图拆为两层：层 $0$（状态为 $0$）和层 $1$（状态为 $1$）。在开关节点处可以零代价切换层。

### 搜索策略

- **状态**：$(v, s)$ — 当前节点及当前状态（$s \in \{0, 1\}$）
- **搜索方式**：BFS 在分层图上搜索
- **转移**：通过类型为 $s$ 的边移动（代价 $1$）；在开关节点切换层（代价 $0$）
- **答案**：$\min(\text{dist}[N][0], \text{dist}[N][1])$

### 核心代码

```cpp
int dist[N + 1][2];
memset(dist, -1, sizeof dist);
deque<pair<int,int>> dq;
dist[1][0] = 0;
dq.push_back({1, 0});
while (!dq.empty()) {
    auto [v, s] = dq.front(); dq.pop_front();
    // 通过类型 s 的边移动
    for (auto [u, type] : adj[v]) {
        if (type != s || dist[u][s] != -1) continue;
        dist[u][s] = dist[v][s] + 1;
        dq.push_back({u, s});
    }
    // 在开关节点切换层（代价 0）
    if (isSwitch[v] && dist[v][s ^ 1] == -1) {
        dist[v][s ^ 1] = dist[v][s];
        dq.push_front({v, s ^ 1});
    }
}
```

### 复杂度

$O(N + M)$。

---

## 22 - ABC 275D Yet Another Recursive Function（记忆化搜索入门）

### 题意

给定 $N$（$\le 10^{18}$），定义 $f(0) = 1$，$f(k) = f(\lfloor k/2 \rfloor) + f(\lfloor k/3 \rfloor)$（$k \ge 1$）。求 $f(N)$。

### 分析

直接递归会重复计算大量子问题。但不同的 $\lfloor N / 2^a 3^b \rfloor$ 值只有 $O(\log^2 N)$ 种，用 `map` 做记忆化即可。

### 搜索策略

- **状态**：当前参数 $k$
- **搜索方式**：DFS + `map<long long, long long>` 记忆化
- **关键观察**：子问题种类 $= O(\log_2 N \times \log_3 N)$，约 $60 \times 40 = 2400$
- **答案**：$f(N)$

### 核心代码

```cpp
map<long long, long long> memo;
function<long long(long long)> f = [&](long long k) -> long long {
    if (k == 0) return 1;
    if (memo.count(k)) return memo[k];
    return memo[k] = f(k / 2) + f(k / 3);
};
cout << f(N);
```

### 复杂度

$O(\log^2 N)$。

---

## 23 - ABC 015D 高桥的苦恼（记忆化搜索 / 二维背包）

### 题意

$N$ 张截图，第 $i$ 张宽度 $A_i$、重要度 $B_i$。选若干张放入宽度上限 $W$ 的页面，**最多选 $K$ 张**。求最大总重要度。

### 分析

带数量限制的 $0\text{-}1$ 背包。可用三维记忆化搜索 `(物品编号, 剩余宽度, 剩余张数)` 实现，也可写成迭代 DP。

### 搜索策略

- **状态**：$(i, w, k)$ — 考虑前 $i$ 张、剩余宽度 $w$、剩余可选张数 $k$
- **搜索方式**：DFS + 记忆化数组
- **转移**：选第 $i$ 张（若 $A_i \le w$ 且 $k > 0$）或不选
- **答案**：$\text{dfs}(N, W, K)$

### 核心代码

```cpp
int dp[N + 1][W + 1][K + 1];
memset(dp, 0, sizeof dp);
for (int i = N - 1; i >= 0; i--)
    for (int w = 0; w <= W; w++)
        for (int k = 0; k <= K; k++) {
            dp[i][w][k] = dp[i + 1][w][k]; // 不选
            if (k > 0 && A[i] <= w)         // 选
                dp[i][w][k] = max(dp[i][w][k],
                    dp[i + 1][w - A[i]][k - 1] + B[i]);
        }
cout << dp[0][W][K];
```

### 复杂度

$O(NWK)$。

---

## 24 - ABC 119C Synthetic Kadomatsu（DFS + 剪枝）

### 题意

$N$ 根竹子（$N \le 8$），需选出若干根合成**三根目标竹子**（长度分别为 $A, B, C$）。每次合并/拆分操作代价 $10$ mp，多余长度也计入代价。求最小总代价。

### 分析

$N \le 8$，对每根竹子有 $4$ 种选择：分给组 $A$、组 $B$、组 $C$、或丢弃。DFS 枚举所有分配方案，计算代价取最小值。

### 搜索策略

- **状态**：当前第 $i$ 根竹子、三组当前总长 $(la, lb, lc)$
- **搜索方式**：DFS 回溯，每根竹子 $4$ 种选择
- **剪枝**：当前代价已超过已知最优解时剪枝
- **答案**：各组分别至少有一根竹子时，代价 = $|la - A| + |lb - B| + |lc - C| + 10 \times k$（$k$ 为合并次数）

### 核心代码

```cpp
int ans = INT_MAX;
function<void(int, long long, long long, long long)> dfs =
    [&](int i, long long la, long long lb, long long lc) {
    if (i == N) {
        if (la == 0 || lb == 0 || lc == 0) return; // 每组至少 1 根
        int cost = abs(la - A) + abs(lb - B) + abs(lc - C);
        // 合并次数 = 每组竹子数 - 1 的总和，通过全局计数
        ans = min(ans, cost + merges * 10);
        return;
    }
    // 4 种选择：分给 A / B / C / 丢弃
    dfs(i + 1, la + L[i], lb, lc); // 给 A
    dfs(i + 1, la, lb + L[i], lc); // 给 B
    dfs(i + 1, la, lb, lc + L[i]); // 给 C
    dfs(i + 1, la, lb, lc);        // 丢弃
};
dfs(0, 0, 0, 0);
```

### 复杂度

$O(4^N)$，$N \le 8$ 时 $4^8 = 65536$。

---

## 25 - ARC 017C 讨厌浪费的人（折半搜索）

### 题意

$N$ 个物品（$N \le 40$），每个重量 $w_i$。求恰好总重为 $W$ 的子集数。

### 分析

$2^{40}$ 太大，但 $2^{20} \approx 10^6$ 可以接受。经典**折半搜索（Meet in the Middle）**：将物品分成前后两半，分别枚举所有子集和，再合并计数。

### 搜索策略

- **前半**：枚举前 $N/2$ 个物品的 $2^{N/2}$ 种子集，记录所有可能的重量和
- **后半**：枚举后 $N/2$ 个物品的 $2^{N/2}$ 种子集，对每个和 $s$，在前半中查找 $W - s$ 的个数
- **合并**：排序 + 二分 / 或使用 `map` 计数

### 核心代码

```cpp
int half = N / 2;
map<long long, long long> left_sums;
// 枚举前半所有子集
for (int mask = 0; mask < (1 << half); mask++) {
    long long s = 0;
    for (int i = 0; i < half; i++)
        if (mask >> i & 1) s += w[i];
    left_sums[s]++;
}
// 枚举后半所有子集
long long ans = 0;
int rest = N - half;
for (int mask = 0; mask < (1 << rest); mask++) {
    long long s = 0;
    for (int i = 0; i < rest; i++)
        if (mask >> i & 1) s += w[half + i];
    if (left_sums.count(W - s))
        ans += left_sums[W - s];
}
```

### 复杂度

$O(2^{N/2} \log 2^{N/2}) = O(N \cdot 2^{N/2})$。

---

## 26 - ABC 271F XOR on Grid Path（折半搜索 / 网格路径）

### 题意

$N \times N$ 网格（$N \le 20$），每格有值 $a_{i,j}$。从 $(1,1)$ 只向右或向下走到 $(N,N)$，求路径上所有值 XOR 为 $0$ 的路径数。

### 分析

路径长度 $= 2N - 1$，步数 $= 2(N-1)$。直接枚举 $\binom{2N-2}{N-1}$ 条路径太大。利用**折半搜索**在反对角线处切割：从 $(1,1)$ DFS 到反对角线的前半路径，从 $(N,N)$ 反向 DFS 到同一反对角线的后半路径，在反对角线上合并。

### 搜索策略

- **前半**：DFS 从 $(0,0)$ 到反对角线 $r + c = N - 1$ 的所有路径，记录 `map<(r, xor_value), count>`
- **后半**：DFS 从 $(N-1, N-1)$ 反向到同一反对角线
- **合并**：在反对角线的同一格子 $(r, c)$ 上，前半 XOR 值为 $x$ 的路径数 × 后半 XOR 值为 $x \oplus a_{r,c}$ 的路径数（因为反对角线上的格子被两侧各计一次，需去掉一次）

### 核心代码

```cpp
// 前半：从 (0,0) DFS 到 r+c == N-1
map<pair<int,int>, map<long long,long long>> fwd; // (r,c) → {xor → count}
function<void(int, int, long long)> dfs1 = [&](int r, int c, long long x) {
    x ^= a[r][c];
    if (r + c == N - 1) { fwd[{r,c}][x]++; return; }
    if (r + 1 < N) dfs1(r + 1, c, x);
    if (c + 1 < N) dfs1(r, c + 1, x);
};
dfs1(0, 0, 0);

// 后半：从 (N-1,N-1) 反向 DFS 到 r+c == N-1
long long ans = 0;
function<void(int, int, long long)> dfs2 = [&](int r, int c, long long x) {
    if (r + c == N - 1) {
        // 反对角线格子的值在 fwd 中已计入，此处不再 XOR
        if (fwd[{r,c}].count(x))
            ans += fwd[{r,c}][x];
        return;
    }
    x ^= a[r][c];
    if (r - 1 >= 0) dfs2(r - 1, c, x);
    if (c - 1 >= 0) dfs2(r, c - 1, x);
};
dfs2(N - 1, N - 1, 0);
```

### 复杂度

$O\!\bigl(\binom{2N-2}{N-1}^{1/2}\bigr)$，前后各约 $\binom{N-1}{\lfloor(N-1)/2\rfloor}$ 条路径，$N = 20$ 时约 $10^5$ 级别。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **BFS 基础** | 1, 2, 3 | 网格最短路、路径树 |
| **多源 BFS** | 4, 5 | 多源同时出发、全点对距离 |
| **DFS 连通性** | 6, 7, 8, 10 | 连通判定、子树传递、奇偶染色、树判定 |
| **DFS 遍历** | 9 | 遍历序模拟、邻接表排序 |
| **DFS 回溯** | 11, 12, 13, 14, 15 | 哈密顿路径、数位构造、序列枚举、密码算术 |
| **位枚举** | 16, 17 | 子集枚举、条件验证 |
| **0-1 BFS** | 18, 19 | 双端队列 BFS、分层状态 |
| **高级 BFS** | 20, 21 | 传送门优化、分层图 |
| **记忆化搜索** | 22, 23 | map 记忆化、多维记忆化 |
| **DFS 剪枝** | 24 | 分支限界、方案枚举 |
| **折半搜索** | 25, 26 | Meet in the Middle、路径分割 |

## 学习路线建议

```
入门：1 → 2 → 3 → 6 → 7
       ↓
基础进阶：4 → 5 → 8 → 9 → 10
       ↓
回溯与枚举：11 → 12 → 13 → 14 → 15 → 16 → 17
       ↓
0-1 BFS 与高级 BFS：18 → 19 → 20 → 21
       ↓
记忆化搜索与剪枝：22 → 23 → 24
       ↓
折半搜索：25 → 26
```

## 解题方法论

1. **识别搜索类型**：根据问题特征判断使用 BFS（最短路/层序）还是 DFS（枚举/连通/回溯）。
2. **明确状态**：搜索的核心是"状态"设计。状态需完整描述当前局面，但维度尽量少。
3. **选择数据结构**：
   - 普通 BFS → 队列
   - 0-1 BFS → 双端队列
   - 分层图 → 扩展状态维度
   - 回溯 → 递归栈 + visited 标记
4. **优化搜索效率**：
   - 记忆化（22, 23）— 避免重复计算
   - 剪枝（24）— 提前终止无效分支
   - 传送门清空（20）— 避免重复遍历
   - 折半搜索（25, 26）— 将指数复杂度开根号
5. **常见陷阱**：
   - BFS 中忘记判重导致 TLE
   - DFS 回溯时忘记恢复状态
   - 0-1 BFS 中 push_front / push_back 方向搞反
   - 折半搜索合并时重复/遗漏边界格子上的值

> 💡 **记住**：搜索不是蛮力，而是**有策略的空间探索**。每道题的关键在于如何定义状态、如何选择搜索方式、以及如何剪枝优化。这 26 题覆盖了搜索从入门到进阶的核心技巧。
