---
title: "UVa 搜索专题精选解题报告"
subtitle: "📙 30 道经典搜索题目的分析方法、解题思路与核心代码"
order: 8
icon: "📙"
---

# UVa 搜索专题精选解题报告

> 来源：精选自 [UVa Online Judge](https://onlinejudge.org/) 的搜索类题目
>
> 本报告针对 30 道精选搜索题目，逐题给出**题意概述 → 分析方法 → 搜索策略 → 核心代码 → 复杂度**，按类型分组，最后做整体总结。

---

## 1 - UVa 524 Prime Ring Problem（回溯）

### 题意

将 $1 \sim N$ 填入环形排列，使相邻两数之和为素数。$1$ 固定在第一个位置，输出所有方案。

### 分析

经典回溯模板。从位置 $2$ 开始逐个尝试未使用的数，验证与前一个数之和是否为素数。

### 搜索策略

- **状态**：当前位置 $\text{pos}$、已使用集合
- **搜索方式**：DFS 回溯
- **剪枝**：相邻和非素数时跳过
- **答案**：填满且最后一个与 $1$ 之和为素数

### 核心代码

```cpp
int a[25], vis[25];
void dfs(int pos, int n) {
    if (pos == n) {
        if (isPrime(a[n-1] + a[0]))
            printSolution(a, n);
        return;
    }
    for (int i = 2; i <= n; i++) {
        if (vis[i] || !isPrime(a[pos-1] + i)) continue;
        a[pos] = i; vis[i] = 1;
        dfs(pos + 1, n);
        vis[i] = 0;
    }
}
```

### 复杂度

$O(N!)$，素数剪枝后远小于此。

---

## 2 - UVa 129 Krypton Factor（DFS / 字典序枚举）

### 题意

用前 $L$ 个字母生成所有"无相邻重复子串"的字符串，按字典序排列，求第 $N$ 个。

### 分析

DFS 逐字符追加，每次检查新字符是否产生相邻重复子串。字典序自动保证（从 `a` 开始尝试）。

### 搜索策略

- **状态**：当前字符串
- **搜索方式**：DFS，每步追加 $L$ 个字母之一
- **剪枝**：检查所有长度为 $2, 4, 6, \dots$ 的后缀是否有相邻重复
- **答案**：第 $N$ 个合法字符串

### 核心代码

```cpp
char s[100];
int cnt = 0, found = 0;
void dfs(int len) {
    if (found) return;
    cnt++;
    if (cnt == n) { printResult(s, len); found = 1; return; }
    for (int c = 0; c < L; c++) {
        s[len] = 'A' + c;
        if (check(s, len + 1)) // no adjacent repeat
            dfs(len + 1);
    }
}
bool check(char s[], int len) {
    for (int half = 1; 2*half <= len; half++)
        if (memcmp(s+len-2*half, s+len-half, half) == 0) return false;
    return true;
}
```

### 复杂度

与合法字符串数相关，实际很快。

---

## 3 - UVa 216 Getting in Line（DFS / 全排列 + 剪枝）

### 题意

$N$ 台电脑（$N \le 8$），连接成链路（访问所有电脑的排列），使总电缆长度最小。

### 分析

$N \le 8$，全排列 DFS。每次加入下一台电脑，如果当前距离已超过最优解则剪枝。

### 搜索策略

- **状态**：当前排列、已选集合
- **搜索方式**：DFS 全排列
- **剪枝**：当前总距离 $\ge$ 最优解时返回
- **答案**：最短总电缆长度的排列

### 核心代码

```cpp
double best = 1e18;
int order[8], bestOrder[8];
void dfs(int idx, int last, double dist) {
    if (dist >= best) return;
    if (idx == n) { best = dist; copy(order, bestOrder); return; }
    for (int i = 0; i < n; i++) {
        if (vis[i]) continue;
        vis[i] = true; order[idx] = i;
        dfs(idx + 1, i, dist + euclidean(last, i) + 16.0);
        vis[i] = false;
    }
}
```

### 复杂度

$O(N!)$，$N \le 8$。

---

## 4 - UVa 532 Dungeon Master（三维 BFS）

### 题意

$L \times R \times C$ 三维迷宫。从 `S` 到 `E`，每步六方向移动。求最短步数。

### 分析

标准三维 BFS。

### 搜索策略

- **状态**：$(l, r, c)$
- **搜索方式**：BFS 六方向
- **答案**：到达 `E` 的步数

### 核心代码

```cpp
int dist[L][R][C]; memset(dist, -1, sizeof dist);
dist[sl][sr][sc] = 0;
queue<tuple<int,int,int>> q; q.push({sl, sr, sc});
while (!q.empty()) {
    auto [l, r, c] = q.front(); q.pop();
    for (6 directions) {
        if (valid && !wall && dist[nl][nr][nc] == -1) {
            dist[nl][nr][nc] = dist[l][r][c] + 1;
            q.push({nl, nr, nc});
        }
    }
}
```

### 复杂度

$O(LRC)$。

---

## 5 - UVa 439 Knight Moves（BFS）

### 题意

$8 \times 8$ 棋盘上骑士从一格到另一格的最少步数。

### 分析

标准 BFS，$8$ 方向扩展。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 八方向
- **答案**：到达终点的步数

### 核心代码

```cpp
int dist[8][8]; memset(dist, -1, sizeof dist);
dist[sr][sc] = 0;
queue<pair<int,int>> q; q.push({sr, sc});
// standard BFS with 8 knight moves
```

### 复杂度

$O(64) = O(1)$。

---

## 6 - UVa 10047 The Monocycle（BFS / 多维状态）

### 题意

独轮车在 $M \times N$ 网格上移动。轮子分 $5$ 种颜色（每走一格颜色变一次）。每步可前进（按当前方向）或左/右转 $90°$。到达终点时底部颜色必须为绿色。求最少操作数。

### 分析

BFS 状态需包含位置、方向、轮子颜色。状态数 $= M \times N \times 4 \times 5$。

### 搜索策略

- **状态**：$(r, c, \text{dir}, \text{color})$
- **搜索方式**：BFS
- **操作**：前进（颜色变）、左转、右转
- **答案**：到达终点且 $\text{color} = 0$

### 核心代码

```cpp
int dist[N][M][4][5]; memset(dist, -1, sizeof dist);
dist[sr][sc][0][0] = 0;
queue<tuple<int,int,int,int>> q; q.push({sr, sc, 0, 0});
while (!q.empty()) {
    auto [r, c, d, col] = q.front(); q.pop();
    // Forward: (r+dr, c+dc, d, (col+1)%5)
    // Turn left: (r, c, (d+3)%4, col)
    // Turn right: (r, c, (d+1)%4, col)
}
```

### 复杂度

$O(NM \times 20)$。

---

## 7 - UVa 321 The New Villa（BFS / 状态搜索）

### 题意

$D$ 个房间（$D \le 10$），每个房间有灯开关。从房间 $1$ 走到房间 $D$，最终只有房间 $D$ 的灯亮。每步可按开关或移动到相邻房间（必须灯亮才能进入）。

### 分析

状态 =（当前房间，灯的状态掩码）。BFS 搜索。

### 搜索策略

- **状态**：$(\text{room}, \text{light\_mask})$
- **搜索方式**：BFS
- **操作**：按开关（toggle 某灯）、移动到亮着的相邻房间
- **答案**：到达房间 $D$，mask $= (1 << (D-1))$

### 核心代码

```cpp
map<pair<int,int>, int> dist;
queue<pair<int,int>> q;
int initMask = 1; // room 1 light on
q.push({0, initMask}); dist[{0, initMask}] = 0;
while (!q.empty()) {
    auto [room, mask] = q.front(); q.pop();
    if (room == D-1 && mask == (1 << (D-1))) { print; return; }
    // Toggle switches in current room
    // Move to adjacent rooms with lights on
}
```

### 复杂度

$O(D \cdot 2^D)$。

---

## 8 - UVa 10653 Bombs! NO they are Mines!!（BFS）

### 题意

$R \times C$ 网格有地雷。从起点到终点的最短路径（四方向移动，不能踩地雷）。

### 分析

标准 BFS。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 四方向
- **答案**：终点的 BFS 距离

### 核心代码

```cpp
// Standard BFS, skip mine cells
```

### 复杂度

$O(RC)$。

---

## 9 - UVa 11624 Fire!（多源 BFS）

### 题意

$R \times C$ 迷宫，人在 `J` 处，火从 `F` 处蔓延（每轮四方向扩展）。人每步四方向移动。人到达边界即逃脱。求最少步数。

### 分析

先多源 BFS 计算火到每格的时间 $\text{fire}[r][c]$。再 BFS 人的移动，只在 $\text{step} < \text{fire}[r][c]$ 时可进入。

### 搜索策略

- **预处理**：多源 BFS 计算火的扩展时间
- **状态**：$(r, c)$
- **搜索方式**：BFS，约束 $\text{step} < \text{fire}[r][c]$
- **答案**：人到达边界的步数

### 核心代码

```cpp
// Multi-source BFS for fire
int fire[R][C]; memset(fire, INF, sizeof fire);
for (each fire source) { fire[r][c] = 0; q.push({r, c}); }
// BFS fire
// BFS person, only enter (r,c) if step+1 < fire[r][c]
```

### 复杂度

$O(RC)$。

---

## 10 - UVa 572 Oil Deposits（DFS / Flood Fill）

### 题意

$M \times N$ 网格，`@` 为油田，`*` 为空地。八方向连通的 `@` 为一个油田。求油田数。

### 分析

经典 Flood Fill。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS 八方向
- **答案**：DFS 启动次数

### 核心代码

```cpp
void dfs(int r, int c) {
    if (!valid(r,c) || grid[r][c] != '@') return;
    grid[r][c] = '*';
    for (int dr = -1; dr <= 1; dr++)
        for (int dc = -1; dc <= 1; dc++)
            if (dr || dc) dfs(r+dr, c+dc);
}
```

### 复杂度

$O(MN)$。

---

## 11 - UVa 657 The die is cast（DFS + BFS / 嵌套搜索）

### 题意

图像中有若干骰子（由 `*` 和 `.` 组成的连通块），每个骰子上有若干点（`*` 的连通块）。求每个骰子显示的点数。

### 分析

两层搜索：外层 DFS 找骰子连通块（`*` 和 `.` 构成），内层 DFS 在骰子内计数 `*` 连通块数。

### 搜索策略

- **外层**：DFS 标记整个骰子区域
- **内层**：在骰子区域内 DFS 计数 `*` 连通块
- **答案**：每个骰子的 `*` 连通块数

### 核心代码

```cpp
// Outer DFS: mark all '*' and '.' connected as one die
// Inner DFS: count '*' components within the die
int countDots(die) {
    int cnt = 0;
    for (each cell in die)
        if (cell == '*' && !inner_vis) {
            dfs_inner(cell); cnt++;
        }
    return cnt;
}
```

### 复杂度

$O(MN)$。

---

## 12 - UVa 11094 Continents（DFS / Flood Fill + 环形）

### 题意

$M \times N$ 的地图（水平方向**环绕**）。给定起点所在大陆（由相同字符连通），求**其他**大陆中最大的面积。

### 分析

先 Flood Fill 标记起点所在大陆。然后对所有未访问的陆地做 Flood Fill，取最大面积。水平方向取模处理环绕。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS，列坐标取模实现环绕
- **答案**：除起始大陆外最大的陆地连通块

### 核心代码

```cpp
void dfs(int r, int c, char land) {
    if (r < 0 || r >= M || vis[r][c % N]) return;
    c = (c % N + N) % N;
    if (grid[r][c] != land || vis[r][c]) return;
    vis[r][c] = true; area++;
    dfs(r-1, c, land); dfs(r+1, c, land);
    dfs(r, c-1, land); dfs(r, c+1, land);
}
```

### 复杂度

$O(MN)$。

---

## 13 - UVa 469 Wetlands of Florida（DFS / Flood Fill）

### 题意

$M \times N$ 网格，`W` 为水，`L` 为陆地。给定查询坐标，求该坐标所在水域的面积（八方向连通）。

### 分析

对每个查询做 Flood Fill 计数（或预处理所有连通块）。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS 八方向
- **答案**：查询点所在连通水域面积

### 核心代码

```cpp
int dfs(int r, int c) {
    if (!valid(r,c) || grid[r][c] != 'W' || vis[r][c]) return 0;
    vis[r][c] = true;
    int sz = 1;
    for (8 directions) sz += dfs(nr, nc);
    return sz;
}
```

### 复杂度

$O(MN)$ 每次查询。

---

## 14 - UVa 352 The Seasonal War（DFS / 连通分量）

### 题意

$N \times N$ 位图，`1` 为鹰的像素。八方向连通的 `1` 为一只鹰。求鹰的数量。

### 分析

Flood Fill 计数。

### 搜索策略

同 UVa 572。

### 核心代码

```cpp
// Same as UVa 572, replace '@' with '1'
```

### 复杂度

$O(N^2)$。

---

## 15 - UVa 10285 Longest Run on a Snowboard（记忆化搜索）

### 题意

$R \times C$ 网格有高度值。从任意格出发，每步向四方向严格更低的格子移动。求最长路径。

### 分析

与 POJ 1088（滑雪）完全相同。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS + 记忆化
- **转移**：$dp[r][c] = 1 + \max dp[\text{lower neighbor}]$
- **答案**：$\max dp[r][c]$

### 核心代码

```cpp
int dp[R][C]; memset(dp, -1, sizeof dp);
int solve(int r, int c) {
    if (dp[r][c] != -1) return dp[r][c];
    dp[r][c] = 1;
    for (4 dirs)
        if (valid(nr,nc) && h[nr][nc] < h[r][c])
            dp[r][c] = max(dp[r][c], 1 + solve(nr, nc));
    return dp[r][c];
}
```

### 复杂度

$O(RC)$。

---

## 16 - UVa 10118 Free Candies（记忆化搜索）

### 题意

$4$ 堆糖果，每堆 $N$ 个。篮子最多装 $5$ 个。每步从某堆顶取一个放入篮子；若篮中有两个相同颜色则配对取出（口袋 $+1$）。求最多能取出多少对。

### 分析

状态为四堆的栈顶索引 $(p_1, p_2, p_3, p_4)$。记忆化搜索。

### 搜索策略

- **状态**：$(p_1, p_2, p_3, p_4)$
- **搜索方式**：DFS + 记忆化
- **转移**：从每堆取一个，更新篮子状态
- **答案**：最大配对数

### 核心代码

```cpp
map<tuple<int,int,int,int>, int> memo;
int dfs(int p1, int p2, int p3, int p4, set<int>& basket) {
    if (basket.size() == 5) return 0; // full, stuck
    auto key = make_tuple(p1, p2, p3, p4);
    if (memo.count(key)) return memo[key];
    int res = 0;
    for (int i = 0; i < 4; i++) {
        if (p[i] >= N) continue;
        int candy = pile[i][p[i]];
        p[i]++;
        if (basket has candy) {
            remove candy from basket;
            res = max(res, 1 + dfs(...));
            add candy back;
        } else {
            basket.insert(candy);
            res = max(res, dfs(...));
            basket.erase(candy);
        }
        p[i]--;
    }
    return memo[key] = res;
}
```

### 复杂度

$O(N^4)$。

---

## 17 - UVa 437 The Tower of Babylon（DAG / 记忆化搜索）

### 题意

$N$ 种方块（每种无限个），三种摆法（选哪两维做底面）。下层底面严格大于上层。求最高塔高。

### 分析

展开为 $3N$ 种方块。建 DAG（$u \to v$ 当 $v$ 可叠在 $u$ 上），记忆化搜索求最长路径。

### 搜索策略

- **状态**：当前顶部方块
- **搜索方式**：DAG 上 DFS + 记忆化
- **转移**：$dp[i] = h_i + \max_{j \text{ fits on } i} dp[j]$
- **答案**：$\max dp[i]$

### 核心代码

```cpp
int dp[100]; memset(dp, -1, sizeof dp);
int solve(int i) {
    if (dp[i] != -1) return dp[i];
    dp[i] = blocks[i].h;
    for (int j = 0; j < 3*n; j++)
        if (blocks[j].d1 < blocks[i].d1 && blocks[j].d2 < blocks[i].d2)
            dp[i] = max(dp[i], blocks[i].h + solve(j));
    return dp[i];
}
```

### 复杂度

$O(N^2)$。

---

## 18 - UVa 307 Sticks（DFS + 剪枝经典）

### 题意

同 POJ 1011 / HDU 1455。碎片拼回原始棍子的最小长度。

### 搜索策略

同 POJ 1011。

### 核心代码

```cpp
// 同 POJ 1011 模板
```

### 复杂度

指数级，剪枝后可行。

---

## 19 - UVa 1374 Power Calculus（IDA*）

### 题意

同 POJ 3134。用最少的加减幂运算计算 $x^N$。

### 搜索策略

同 POJ 3134。

### 核心代码

```cpp
// 同 POJ 3134 模板
```

### 复杂度

IDA*。

---

## 20 - UVa 208 Firetruck（DFS + 剪枝 + 预判连通）

### 题意

无向图，从节点 $1$ 到目标节点输出所有路径（字典序）。

### 分析

DFS 枚举所有路径。关键剪枝：**先用并查集或 BFS 判断当前节点是否可达目标**，否则会超时。

### 搜索策略

- **预处理**：从目标节点反向 BFS/DFS 标记可达节点
- **状态**：当前节点、已访问集合
- **搜索方式**：DFS，按字典序枚举邻居
- **剪枝**：只走可达目标的节点
- **答案**：所有从 $1$ 到目标的路径

### 核心代码

```cpp
bool canReach[25]; // precompute with BFS from target
void dfs(int u, vector<int>& path) {
    if (u == target) { print(path); return; }
    for (int v : adj[u]) {
        if (vis[v] || !canReach[v]) continue;
        vis[v] = true; path.push_back(v);
        dfs(v, path);
        path.pop_back(); vis[v] = false;
    }
}
```

### 复杂度

指数级，剪枝后可行。

---

## 21 - UVa 193 Graph Coloring（DFS + 回溯）

### 题意

$N$ 个节点 $K$ 条边的图。将节点染黑/白色，使没有两个相邻节点同时为黑色。求最大黑色节点数。

### 分析

DFS 枚举每个节点染黑或白，约束相邻不能同时为黑。求最大黑色数。

### 搜索策略

- **状态**：当前节点、已染色方案
- **搜索方式**：DFS 回溯
- **剪枝**：剩余节点全黑也不能超过当前最优解
- **答案**：最大黑色节点数

### 核心代码

```cpp
int best = 0;
void dfs(int node, int blacks) {
    if (node > n) { best = max(best, blacks); return; }
    if (blacks + (n - node + 1) <= best) return; // prune
    // Try black (if no adjacent black neighbor)
    bool canBlack = true;
    for (int v : adj[node])
        if (color[v] == 1) { canBlack = false; break; }
    if (canBlack) {
        color[node] = 1;
        dfs(node + 1, blacks + 1);
        color[node] = 0;
    }
    // Try white
    dfs(node + 1, blacks);
}
```

### 复杂度

$O(2^N)$，剪枝后可行。

---

## 22 - UVa 10160 Servicing Stations（DFS + 剪枝）

### 题意

$N$ 个城市（$N \le 35$）的图。选最少的城市建服务站，使每个城市要么有服务站，要么与有服务站的城市相邻。（最小支配集）

### 分析

DFS + 剪枝。按节点编号从大到小处理，每个节点选或不选。若不选则所有邻居中必须有人选。

### 搜索策略

- **状态**：当前节点、已覆盖集合
- **搜索方式**：DFS 回溯
- **剪枝**：① 当前已选数 $\ge$ 最优解；② 某节点及其所有邻居都无法被覆盖时剪枝
- **答案**：最小服务站数

### 核心代码

```cpp
int best = n;
void dfs(int node, int selected, long long covered) {
    if (selected >= best) return;
    if (covered == (1LL << n) - 1) { best = selected; return; }
    // Find first uncovered node
    int u = __builtin_ctzll(~covered);
    // Try selecting u or each of u's neighbors
    for (int v : {u} + adj[u]) {
        long long newCov = covered | mask[v];
        dfs(node, selected + 1, newCov);
    }
}
```

### 复杂度

指数级，强剪枝后 $N \le 35$ 可行。

---

## 23 - UVa 652 Eight（八数码 / A*）

### 题意

$3 \times 3$ 八数码问题。求从初始到目标 `1 2 3 4 5 6 7 8 0` 的移动步骤。

### 分析

A*（曼哈顿距离）或 BFS（$9! = 362880$ 状态打表）。

### 搜索策略

- **状态**：排列编码
- **搜索方式**：A* 或 BFS
- **估价函数**：曼哈顿距离之和
- **答案**：最短移动序列

### 核心代码

```cpp
// A* with Manhattan heuristic
// or BFS from goal, precompute all states
```

### 复杂度

$O(9!)$。

---

## 24 - UVa 10181 15-Puzzle Problem（IDA*）

### 题意

$4 \times 4$ 的十五数码问题。求从初始到有序的最短步骤（$\le 45$ 步）。

### 分析

IDA*。估价函数 $h$ = 曼哈顿距离之和。每步不走上一步的反方向。

### 搜索策略

- **状态**：$16$ 格排列
- **搜索方式**：IDA*
- **估价函数**：$h =$ 曼哈顿距离之和
- **答案**：最短移动序列

### 核心代码

```cpp
int h(int board[]) {
    int sum = 0;
    for (int i = 0; i < 16; i++)
        if (board[i]) sum += manhattan(i, target[board[i]]);
    return sum;
}
bool dfs(int g, int maxD, int prev) {
    int hv = h(board);
    if (hv == 0) return true;
    if (g + hv > maxD) return false;
    for (4 moves != reverse(prev)) {
        swap; if (dfs(g+1, maxD, move)) return true; swap;
    }
    return false;
}
```

### 复杂度

IDA*，实际步数 $\le 45$。

---

## 25 - UVa 11212 Editing a Book（IDA*）

### 题意

$N$ 个数的排列（$N \le 9$），每步可剪切一段连续数字粘贴到另一位置。求排成 $1, 2, \dots, N$ 的最少操作次数。

### 分析

IDA*。估价函数：统计"后继不正确"的对数 $h$，每步最多修复 $3$ 对，因此 $h / 3$ 为下界。

### 搜索策略

- **状态**：当前排列
- **搜索方式**：IDA*
- **估价函数**：$h = \lceil \text{wrong\_successors} / 3 \rceil$
- **答案**：排列有序时的深度

### 核心代码

```cpp
int h(int a[], int n) {
    int cnt = 0;
    for (int i = 0; i < n - 1; i++)
        if (a[i] + 1 != a[i+1]) cnt++;
    if (a[n-1] != n) cnt++;
    return (cnt + 2) / 3;
}
bool dfs(int a[], int n, int depth, int maxD) {
    if (h(a, n) == 0) return true;
    if (depth + h(a, n) > maxD) return false;
    // Try all cut-paste operations
    for (int i = 0; i < n; i++)
        for (int j = i; j < n; j++)
            for (int k = 0; k <= n-(j-i+1); k++) {
                // cut [i,j], paste at position k
                int b[9]; apply_operation(a, b, i, j, k);
                if (dfs(b, n, depth + 1, maxD)) return true;
            }
    return false;
}
```

### 复杂度

IDA*，$N \le 9$ 时可行。

---

## 26 - UVa 1343 The Rotation Game（IDA* 经典）

### 题意

同 POJ 2286。$\#$ 形棋盘，$8$ 种旋转操作使中心 $8$ 格相同。

### 搜索策略

同 POJ 2286。

### 核心代码

```cpp
// 同 POJ 2286 模板
```

### 复杂度

IDA*。

---

## 27 - UVa 529 Addition Chains（IDA* / 迭代加深）

### 题意

求最短的加法链 $1 = a_0, a_1, \dots, a_m = N$，其中每个 $a_i = a_j + a_k$（$j, k < i$）。

### 分析

IDA*。每步从已有数中选两个相加。

### 搜索策略

- **状态**：当前加法链
- **搜索方式**：IDA*
- **剪枝**：当前最大值翻倍后无法在剩余步内达到 $N$ 时剪枝
- **答案**：链长最短的方案

### 核心代码

```cpp
int chain[100];
bool dfs(int depth, int maxD) {
    int cur = chain[depth];
    if (cur == n) return true;
    if (depth == maxD) return false;
    if (cur << (maxD - depth) < n) return false; // prune
    for (int i = depth; i >= 0; i--) {
        int next = cur + chain[i];
        if (next > n) continue;
        chain[depth + 1] = next;
        if (dfs(depth + 1, maxD)) return true;
    }
    return false;
}
```

### 复杂度

IDA*。

---

## 28 - UVa 1309 Sudoku（DLX / 精确覆盖）

### 题意

$16 \times 16$ 数独。

### 分析

建模为精确覆盖问题，用 Dancing Links (DLX) 求解。$4$ 类约束：每格恰好一个数、每行每数恰好一次、每列每数恰好一次、每宫每数恰好一次。

### 搜索策略

- **状态**：DLX 矩阵
- **搜索方式**：Algorithm X + Dancing Links
- **优化**：选择列覆盖最少的约束列
- **答案**：满足所有约束的行选择

### 核心代码

```cpp
struct DLX {
    // standard DLX implementation
    bool solve() {
        if (R[0] == 0) return true; // all columns covered
        int c = R[0]; // choose column with min size
        for (int j = R[0]; j != 0; j = R[j])
            if (S[j] < S[c]) c = j;
        cover(c);
        for (int r = D[c]; r != c; r = D[r]) {
            ans.push_back(r);
            for (int j = R[r]; j != r; j = R[j]) cover(Col[j]);
            if (solve()) return true;
            for (int j = L[r]; j != r; j = L[j]) uncover(Col[j]);
            ans.pop_back();
        }
        uncover(c);
        return false;
    }
};
```

### 复杂度

指数级，DLX 优化后极快。

---

## 29 - UVa 11488 Hyper Prefix Sets（DFS / Trie 搜索）

### 题意

$N$ 个二进制字符串。选一个子集使得"公共前缀长度 $\times$ 子集大小"最大。

### 分析

建 Trie 树。DFS 遍历 Trie，每个节点处计算 $\text{depth} \times \text{count}$（经过该节点的字符串数），取最大值。

### 搜索策略

- **状态**：Trie 节点
- **搜索方式**：DFS 遍历 Trie
- **答案**：$\max(\text{depth} \times \text{count})$

### 核心代码

```cpp
struct Trie {
    int ch[2], cnt;
} nodes[MAXN];
int ans = 0;
void dfs(int u, int depth) {
    ans = max(ans, depth * nodes[u].cnt);
    for (int c = 0; c < 2; c++)
        if (nodes[u].ch[c])
            dfs(nodes[u].ch[c], depth + 1);
}
```

### 复杂度

$O(L)$（$L$ 为总字符串长度）。

---

## 30 - UVa 10364 Square（DFS + 剪枝）

### 题意

$M$ 根火柴棍能否恰好拼成一个正方形（每根用恰好一次）。

### 分析

总长必须被 $4$ 整除。目标边长 $L = \text{sum} / 4$。DFS 拼 $4$ 条边，与"Sticks"问题相似。

### 搜索策略

- **状态**：当前边已拼长度、已拼完的边数
- **搜索方式**：DFS 回溯
- **剪枝**：排序、跳过相同、边拼满/拼空时失败直接回溯
- **答案**：$4$ 条边都拼成功

### 核心代码

```cpp
sort(sticks.rbegin(), sticks.rend());
bool dfs(int cur_len, int sides_done, int start) {
    if (sides_done == 4) return true;
    for (int i = start; i < m; i++) {
        if (used[i]) continue;
        if (cur_len + sticks[i] > L) continue;
        if (i > 0 && sticks[i] == sticks[i-1] && !used[i-1]) continue;
        used[i] = true;
        if (cur_len + sticks[i] == L) {
            if (dfs(0, sides_done + 1, 0)) return true;
        } else {
            if (dfs(cur_len + sticks[i], sides_done, i + 1)) return true;
        }
        used[i] = false;
        if (cur_len == 0) return false;
    }
    return false;
}
```

### 复杂度

指数级，剪枝后可行。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **DFS 回溯** | 1, 2, 3 | 素数环、字典序枚举、全排列 |
| **BFS 基础** | 4, 5, 8 | 三维 BFS、骑士最短路 |
| **BFS 多维状态** | 6, 7, 9 | 独轮车颜色/方向、灯开关状态、多源 BFS |
| **Flood Fill** | 10, 11, 12, 13, 14 | 八方向连通、嵌套搜索、环形地图 |
| **记忆化搜索** | 15, 16, 17 | 网格最长路、糖果配对、DAG 最长链 |
| **DFS + 剪枝** | 18, 20, 21, 22, 30 | 棍子拼接、预判连通、图着色、最小支配集 |
| **八数码 / A*** | 23, 24 | Cantor 编码、十五数码、曼哈顿距离 |
| **IDA*** | 19, 25, 26, 27 | 幂次计算、编辑排列、旋转游戏、加法链 |
| **DLX** | 28 | $16 \times 16$ 数独精确覆盖 |
| **Trie 搜索** | 29 | 前缀最大化 |

## 学习路线建议

```
入门：10 → 13 → 14
       ↓
DFS 回溯：1 → 2 → 3
       ↓
BFS 基础：4 → 5 → 8 → 9
       ↓
BFS 进阶：6 → 7
       ↓
Flood Fill 进阶：11 → 12
       ↓
记忆化搜索：15 → 17 → 16
       ↓
DFS + 剪枝：18 → 20 → 21 → 22 → 30
       ↓
A* / IDA*：23 → 24 → 19 → 25 → 26 → 27
       ↓
精确覆盖：28 → 29
```

## 解题方法论

1. **从 Flood Fill 开始**：UVa 上大量连通块计数题是搜索的最佳入门点。
2. **BFS 多维状态**：独轮车（颜色+方向）、别墅（灯的状态）等题展示了如何设计复合状态。
3. **记忆化搜索与 DP 互通**：DAG 最长链展示了搜索与 DP 的统一视角。
4. **IDA* 是 UVa 的标配**：15-Puzzle、Editing a Book、Rotation Game 都是 IDA* 经典题。估价函数的精确度直接决定搜索效率。
5. **DLX 解决精确覆盖**：$16 \times 16$ 数独、数独变形等问题用 DLX 是最高效的解法。

> 💡 **记住**：UVa 搜索题的特色在于"搜索与算法设计的融合"——Flood Fill 是基础，多维状态 BFS 练建模，记忆化搜索连通 DP 世界，IDA* 和 DLX 是高阶武器。掌握这个谱系，搜索能力将得到全面提升。
