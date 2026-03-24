---
title: "POJ 搜索专题精选解题报告"
subtitle: "📘 36 道经典搜索题目的分析方法、解题思路与核心代码"
order: 6
icon: "📘"
---

# POJ 搜索专题精选解题报告

> 来源：精选自 [POJ (Peking University Online Judge)](http://poj.org/) 的搜索类题目
>
> 本报告针对 36 道精选搜索题目，逐题给出**题意概述 → 分析方法 → 搜索策略 → 核心代码 → 复杂度**，按类型分组，最后做整体总结。

---

## 1 - POJ 2488 A Knight's Journey（DFS / 回溯）

### 题意

$P \times Q$ 棋盘（$P$ 行 $Q$ 列，$P, Q \le 26$），骑士从某一格出发，按马的走法遍历所有格子。输出字典序最小的路径，无解则输出 `impossible`。

### 分析

DFS 回溯。按字典序尝试 $8$ 个方向（预排序），找到第一条完整路径即输出。

### 搜索策略

- **状态**：$(r, c, \text{step})$
- **搜索方式**：DFS 回溯，方向按字典序排列
- **答案**：步数 $= P \times Q$ 时的路径

### 核心代码

```cpp
// 8 directions sorted for lexicographic order
int dx[] = {-2,-2,-1,-1,1,1,2,2};
int dy[] = {-1,1,-2,2,-2,2,-1,1};
bool dfs(int r, int c, int step) {
    path[step] = {r, c};
    if (step == p * q) return true;
    for (int d = 0; d < 8; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        if (valid(nr, nc) && !vis[nr][nc]) {
            vis[nr][nc] = true;
            if (dfs(nr, nc, step + 1)) return true;
            vis[nr][nc] = false;
        }
    }
    return false;
}
```

### 复杂度

最坏 $O(8^{PQ})$，实际回溯很快。

---

## 2 - POJ 3083 Children of the Candy Corn（DFS + BFS）

### 题意

$W \times H$ 迷宫。分别求：① 沿左墙走的步数；② 沿右墙走的步数；③ BFS 最短路。

### 分析

左墙法/右墙法通过 DFS 模拟方向转弯即可。BFS 求最短路是标准做法。

### 搜索策略

- **左墙法**：始终尝试"当前方向的左侧"优先
- **右墙法**：始终尝试"当前方向的右侧"优先
- **最短路**：标准 BFS

### 核心代码

```cpp
// Left-wall: try left, front, right, back
int leftFirst(int dir) {
    int order[] = {(dir+3)%4, dir, (dir+1)%4, (dir+2)%4};
    // try each in order, return first valid
}
// BFS for shortest path
int bfs() { /* standard BFS */ }
```

### 复杂度

$O(WH)$。

---

## 3 - POJ 1321 棋盘问题（DFS / 回溯）

### 题意

$N \times N$ 棋盘（$N \le 8$），部分格子可放棋子（`#`），放 $K$ 个棋子使每行每列最多一个。求方案数。

### 分析

逐行 DFS：每行选一个 `#` 格子放（或不放）。用列标记避免冲突。

### 搜索策略

- **状态**：当前行、已放个数、列占用情况
- **搜索方式**：DFS 逐行枚举
- **答案**：放满 $K$ 个时方案数 $+1$

### 核心代码

```cpp
int cnt = 0;
bool col_used[10];
void dfs(int row, int placed) {
    if (placed == k) { cnt++; return; }
    if (row >= n) return;
    dfs(row + 1, placed); // skip this row
    for (int c = 0; c < n; c++) {
        if (board[row][c] == '#' && !col_used[c]) {
            col_used[c] = true;
            dfs(row + 1, placed + 1);
            col_used[c] = false;
        }
    }
}
```

### 复杂度

$O(N!)$。

---

## 4 - POJ 2676 Sudoku（DFS / 回溯）

### 题意

$9 \times 9$ 数独。填入 $1\text{-}9$ 使每行、每列、每个 $3 \times 3$ 宫格各数字不重复。

### 分析

DFS 逐格填数。用行/列/宫的位掩码快速检查合法性。

### 搜索策略

- **状态**：当前空格位置
- **搜索方式**：DFS，按行列顺序填空格
- **剪枝**：行/列/宫掩码排除不可填数字
- **答案**：所有空格填满的第一个合法解

### 核心代码

```cpp
bool row[9][10], col[9][10], box[9][10];
bool dfs(int pos) {
    while (pos < 81 && board[pos/9][pos%9] != 0) pos++;
    if (pos == 81) return true;
    int r = pos / 9, c = pos % 9, b = r/3*3 + c/3;
    for (int d = 1; d <= 9; d++) {
        if (row[r][d] || col[c][d] || box[b][d]) continue;
        board[r][c] = d;
        row[r][d] = col[c][d] = box[b][d] = true;
        if (dfs(pos + 1)) return true;
        row[r][d] = col[c][d] = box[b][d] = false;
        board[r][c] = 0;
    }
    return false;
}
```

### 复杂度

最坏 $O(9^{81})$，剪枝后极快。

---

## 5 - POJ 1011 Sticks（DFS + 剪枝经典）

### 题意

若干小棍被切断。给出碎片长度，求原始棍子的最小可能长度。（与 HDU 1455 相同）

### 分析

枚举目标长度 $L$，DFS 验证能否拼出若干长 $L$ 的棍子。多重剪枝是关键。

### 搜索策略

- **状态**：当前棍子已拼长度、开始搜索位置
- **搜索方式**：DFS 回溯
- **剪枝**：① 从大到小排序；② 跳过相同长度；③ 当前棍子长度为 $0$ 或恰好 $L$ 时失败直接回溯
- **答案**：最小满足条件的 $L$

### 核心代码

```cpp
sort(sticks.rbegin(), sticks.rend());
bool dfs(int cur_len, int stick_cnt, int start) {
    if (stick_cnt == total / L) return true;
    for (int i = start; i < n; i++) {
        if (used[i]) continue;
        if (cur_len + sticks[i] > L) continue;
        if (i > 0 && sticks[i] == sticks[i-1] && !used[i-1]) continue;
        used[i] = true;
        if (cur_len + sticks[i] == L) {
            if (dfs(0, stick_cnt + 1, 0)) return true;
        } else {
            if (dfs(cur_len + sticks[i], stick_cnt, i + 1)) return true;
        }
        used[i] = false;
        if (cur_len == 0) return false;
    }
    return false;
}
```

### 复杂度

最坏指数级，剪枝后可处理 $N \le 64$。

---

## 6 - POJ 3009 Curling 2.0（DFS）

### 题意

$W \times H$ 冰壶场地。冰壶从起点沿四方向滑行直到撞上障碍（障碍消失，冰壶停在前一格）或出界。求到达终点的最少滑行次数（$\le 10$）。

### 分析

DFS 枚举每次滑行的方向。障碍破坏后状态改变，需要回溯恢复。

### 搜索策略

- **状态**：冰壶位置、障碍分布
- **搜索方式**：DFS，限制深度 $\le 10$
- **回溯**：撞碎障碍后恢复
- **答案**：最少滑行次数

### 核心代码

```cpp
int ans = 11;
void dfs(int r, int c, int moves) {
    if (moves >= ans) return;
    for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        while (valid(nr,nc) && grid[nr][nc] != 1) {
            if (grid[nr][nc] == 3) { ans = min(ans, moves + 1); return; }
            nr += dx[d]; nc += dy[d];
        }
        if (!valid(nr,nc) || (nr == r+dx[d] && nc == c+dy[d])) continue;
        grid[nr][nc] = 0; // destroy obstacle
        dfs(nr - dx[d], nc - dy[d], moves + 1);
        grid[nr][nc] = 1; // restore
    }
}
```

### 复杂度

$O(4^{10})$，有效剪枝后可行。

---

## 7 - POJ 1426 Find The Multiple（BFS / DFS）

### 题意

给正整数 $N$（$1 \le N \le 200$），找一个仅由 $0$ 和 $1$ 组成的十进制数为 $N$ 的倍数。

### 分析

BFS：从 $1$ 开始，每步追加 $0$ 或 $1$。只需记录余数（$\bmod N$）。

### 搜索策略

- **状态**：当前数字 $\bmod N$ 的余数
- **搜索方式**：BFS，两个分支（追加 $0$ 或 $1$）
- **答案**：余数 $= 0$ 时对应的数字

### 核心代码

```cpp
queue<pair<long long, int>> q;
q.push({1, 1 % n});
while (!q.empty()) {
    auto [num, rem] = q.front(); q.pop();
    if (rem == 0) { cout << num; return; }
    q.push({num * 10, (rem * 10) % n});
    q.push({num * 10 + 1, (rem * 10 + 1) % n});
}
```

### 复杂度

$O(N)$（余数空间有限）。

---

## 8 - POJ 2907 Collecting Beepers（TSP / 全排列搜索）

### 题意

$X \times Y$ 网格，起点和若干信标（$\le 10$）。从起点出发收集所有信标后回到起点，求最短曼哈顿距离。

### 分析

信标数 $\le 10$，全排列或状压 DP 解 TSP。全排列 DFS 即可在时限内通过。

### 搜索策略

- **状态**：当前位置、已访问集合
- **搜索方式**：DFS 全排列 / 状压 DP
- **答案**：最小总曼哈顿距离

### 核心代码

```cpp
int dist[12][12]; // precompute manhattan distances
int ans = INF;
void dfs(int cur, int mask, int total) {
    if (mask == (1 << k) - 1) {
        ans = min(ans, total + dist[cur][0]); // return to start
        return;
    }
    for (int i = 0; i < k; i++) {
        if (mask >> i & 1) continue;
        dfs(i + 1, mask | (1 << i), total + dist[cur][i + 1]);
    }
}
```

### 复杂度

$O(K! \cdot K)$ 或 $O(2^K \cdot K^2)$，$K \le 10$。

---

## 9 - POJ 3278 Catch That Cow（BFS）

### 题意

数轴上，人在位置 $N$，牛在位置 $K$。每步可 $+1$、$-1$ 或 $\times 2$。求最少步数。

### 分析

经典一维 BFS。状态空间 $[0, 100000]$。

### 搜索策略

- **状态**：当前位置
- **搜索方式**：BFS，三种转移
- **答案**：`dist[K]`

### 核心代码

```cpp
int dist[200001]; memset(dist, -1, sizeof dist);
dist[N] = 0;
queue<int> q; q.push(N);
while (!q.empty()) {
    int x = q.front(); q.pop();
    for (int nx : {x-1, x+1, x*2}) {
        if (nx >= 0 && nx <= 200000 && dist[nx] == -1) {
            dist[nx] = dist[x] + 1;
            if (nx == K) { cout << dist[nx]; return; }
            q.push(nx);
        }
    }
}
```

### 复杂度

$O(N)$。

---

## 10 - POJ 1915 Knight Moves（BFS）

### 题意

$L \times L$ 棋盘上骑士的最短步数。

### 分析

标准 BFS，$8$ 方向扩展。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 八方向
- **答案**：到达终点的步数

### 核心代码

```cpp
int dist[L][L]; memset(dist, -1, sizeof dist);
dist[sr][sc] = 0;
queue<pair<int,int>> q; q.push({sr, sc});
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    if (r == er && c == ec) { cout << dist[r][c]; return; }
    for (int d = 0; d < 8; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        if (valid(nr,nc) && dist[nr][nc] == -1) {
            dist[nr][nc] = dist[r][c] + 1;
            q.push({nr, nc});
        }
    }
}
```

### 复杂度

$O(L^2)$。

---

## 11 - POJ 3414 Pots（BFS / 状态搜索）

### 题意

两个杯子容量分别为 $A$ 和 $B$。操作：装满、倒空、从一个倒入另一个。求使某个杯子里恰好 $C$ 升水的最少操作，并输出操作序列。

### 分析

状态 $(a, b)$ 表示两杯水量。BFS 搜索 $6$ 种操作。

### 搜索策略

- **状态**：$(a, b)$，$0 \le a \le A$，$0 \le b \le B$
- **搜索方式**：BFS，$6$ 种操作
- **答案**：$a = C$ 或 $b = C$ 时的步数和操作序列

### 核心代码

```cpp
map<pair<int,int>, int> dist;
map<pair<int,int>, pair<pair<int,int>, string>> par;
queue<pair<int,int>> q;
q.push({0, 0}); dist[{0,0}] = 0;
while (!q.empty()) {
    auto [a, b] = q.front(); q.pop();
    if (a == C || b == C) { trace_path(); return; }
    // 6 operations: FILL(1), FILL(2), DROP(1), DROP(2), POUR(1,2), POUR(2,1)
    for (each next state (na, nb) with operation name) {
        if (!dist.count({na, nb})) {
            dist[{na,nb}] = dist[{a,b}] + 1;
            par[{na,nb}] = {{a,b}, op_name};
            q.push({na, nb});
        }
    }
}
```

### 复杂度

$O(AB)$。

---

## 12 - POJ 2251 Dungeon Master（三维 BFS）

### 题意

$L \times R \times C$ 的三维迷宫。从 `S` 走到 `E`，每步移动到六方向相邻的空格。求最短步数。

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
    for (6 dirs) {
        if (valid && grid[nl][nr][nc] != '#' && dist[nl][nr][nc] == -1) {
            dist[nl][nr][nc] = dist[l][r][c] + 1;
            q.push({nl, nr, nc});
        }
    }
}
```

### 复杂度

$O(LRC)$。

---

## 13 - POJ 3984 迷宫问题（BFS + 路径输出）

### 题意

$5 \times 5$ 迷宫从 $(0,0)$ 到 $(4,4)$ 的最短路径。输出路径上的坐标。

### 分析

BFS 求最短路，记录父节点回溯路径。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：BFS 四方向
- **答案**：回溯父节点得到路径

### 核心代码

```cpp
pair<int,int> par[5][5];
// BFS from (0,0)
// trace back from (4,4) using par[][]
vector<pair<int,int>> path;
for (auto p = make_pair(4,4); p != make_pair(-1,-1); p = par[p.first][p.second])
    path.push_back(p);
reverse(path.begin(), path.end());
```

### 复杂度

$O(25) = O(1)$。

---

## 14 - POJ 1979 Red and Black（Flood Fill）

### 题意

$W \times H$ 网格，`.` 为黑砖，`#` 为红砖。从 `@` 出发，只能走黑砖。求可到达的格子数。

### 分析

DFS/BFS Flood Fill。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS 四方向
- **答案**：访问到的格子数

### 核心代码

```cpp
int cnt = 0;
void dfs(int r, int c) {
    if (!valid(r,c) || grid[r][c] != '.') return;
    grid[r][c] = '#'; cnt++;
    for (int d = 0; d < 4; d++) dfs(r+dx[d], c+dy[d]);
}
```

### 复杂度

$O(WH)$。

---

## 15 - POJ 2312 Battle City（BFS / 优先队列）

### 题意

$M \times N$ 网格，有钢墙（不可破坏）、砖墙（可破坏耗 $1$ 步）、空地（$0$ 步）。求从起点到终点最短步数。

### 分析

带权 BFS（$0$-$1$ BFS）或 Dijkstra。砖墙权重 $2$（移动 $+$ 射击），空地权重 $1$。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：$0$-$1$ BFS（deque）或优先队列 BFS
- **答案**：到达终点的最短距离

### 核心代码

```cpp
deque<pair<int,int>> dq;
int dist[M][N]; memset(dist, INF, sizeof dist);
dist[sr][sc] = 0; dq.push_front({sr, sc});
while (!dq.empty()) {
    auto [r, c] = dq.front(); dq.pop_front();
    for (4 dirs) {
        int w = (grid[nr][nc] == 'B') ? 2 : 1;
        if (dist[r][c] + w < dist[nr][nc]) {
            dist[nr][nc] = dist[r][c] + w;
            if (w == 1) dq.push_front({nr, nc});
            else dq.push_back({nr, nc});
        }
    }
}
```

### 复杂度

$O(MN)$。

---

## 16 - POJ 2386 Lake Counting（DFS / Flood Fill）

### 题意

$N \times M$ 农场，`W` 为水，`.` 为干地。八方向相邻的水构成一个湖。求湖的个数。

### 分析

Flood Fill 模板题，与 HDU 1241 完全相同。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS 八方向
- **答案**：DFS 启动次数

### 核心代码

```cpp
void dfs(int r, int c) {
    if (!valid(r,c) || grid[r][c] != 'W') return;
    grid[r][c] = '.';
    for (int dr = -1; dr <= 1; dr++)
        for (int dc = -1; dc <= 1; dc++)
            if (dr || dc) dfs(r+dr, c+dc);
}
```

### 复杂度

$O(NM)$。

---

## 17 - POJ 1562 Oil Deposits（DFS / 连通分量）

### 题意

$M \times N$ 网格，`@` 为油田，`*` 为空地。八方向连通的 `@` 为一个油田。求油田数。

### 分析

与 POJ 2386 完全相同的 Flood Fill 计数。

### 搜索策略

同 POJ 2386。

### 核心代码

```cpp
// 同 POJ 2386
```

### 复杂度

$O(MN)$。

---

## 18 - POJ 3620 Avoid The Lakes（DFS / Flood Fill）

### 题意

$R \times C$ 农场，若干格子被水淹。求最大的连通水域面积。

### 分析

Flood Fill 求每个连通块大小，取最大值。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS 四方向
- **答案**：$\max$ 连通块大小

### 核心代码

```cpp
int dfs(int r, int c) {
    if (!valid(r,c) || grid[r][c] != 1) return 0;
    grid[r][c] = 0;
    int sz = 1;
    for (int d = 0; d < 4; d++) sz += dfs(r+dx[d], c+dy[d]);
    return sz;
}
int ans = 0;
for (all flooded cells) ans = max(ans, dfs(r, c));
```

### 复杂度

$O(RC)$。

---

## 19 - POJ 1164 The Castle（DFS / 连通块）

### 题意

城堡网格，每个格子有四面墙（用位掩码编码）。求连通房间数和最大房间面积。

### 分析

DFS 连通块。相邻格子之间是否有墙根据位掩码判定。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS，根据墙的位掩码决定是否可通行
- **答案**：连通块数和最大块大小

### 核心代码

```cpp
// wall[r][c] is bitmask: bit 0=W, 1=N, 2=E, 3=S
int dfs(int r, int c) {
    if (vis[r][c]) return 0;
    vis[r][c] = true;
    int sz = 1;
    if (!(wall[r][c] & 1) && c > 0) sz += dfs(r, c-1);   // West
    if (!(wall[r][c] & 2) && r > 0) sz += dfs(r-1, c);   // North
    if (!(wall[r][c] & 4) && c < m-1) sz += dfs(r, c+1); // East
    if (!(wall[r][c] & 8) && r < n-1) sz += dfs(r+1, c); // South
    return sz;
}
```

### 复杂度

$O(NM)$。

---

## 20 - POJ 1190 生日蛋糕（DFS + 剪枝经典）

### 题意

$M$ 层蛋糕，总体积为 $N\pi$。每层圆柱体，从下到上半径和高度严格递减。求最小侧面积（不含 $\pi$）。

### 分析

DFS 从底层到顶层，枚举每层的半径 $r$ 和高度 $h$。多种剪枝：

### 搜索策略

- **状态**：当前层、剩余体积、当前侧面积
- **搜索方式**：DFS 枚举半径和高度
- **剪枝**：① 剩余体积的下界检查；② 当前面积 $+$ 估计最小面积 $\ge$ 最优解时剪枝；③ 半径和高度的范围约束
- **答案**：最小总侧面积

### 核心代码

```cpp
int ans = INF;
void dfs(int layer, int remV, int curS, int maxR, int maxH) {
    if (layer == 0) {
        if (remV == 0) ans = min(ans, curS);
        return;
    }
    if (curS + minSurface(layer, remV) >= ans) return; // prune
    for (int r = maxR; r >= layer; r--)
        for (int h = maxH; h >= layer; h--) {
            int v = r * r * h;
            if (v > remV) continue;
            int s = 2 * r * h;
            if (layer == M) s += r * r; // bottom
            dfs(layer - 1, remV - v, curS + s, r - 1, h - 1);
        }
}
```

### 复杂度

指数级，多重剪枝后可行。

---

## 21 - POJ 3411 Paid Roads（DFS + 剪枝）

### 题意

$N$ 个城市 $M$ 条道路，每条道路有两种费用：已访问过某城市 $c_i$ 则费用 $a_i$，否则 $b_i$。从城市 $1$ 到城市 $N$ 的最小费用。

### 分析

DFS + 剪枝。允许重复访问城市（可能先绕路访问 $c_i$ 再回来走便宜路线）。限制每个城市最多经过 $3$ 次避免死循环。

### 搜索策略

- **状态**：当前城市、已访问集合、当前费用
- **搜索方式**：DFS，允许重复但限次数
- **剪枝**：费用 $\ge$ 当前最优解时剪枝
- **答案**：到达城市 $N$ 的最小费用

### 核心代码

```cpp
int ans = INF, cnt[11];
void dfs(int u, int cost, int vis_mask) {
    if (u == n) { ans = min(ans, cost); return; }
    if (cost >= ans) return;
    for (auto& [v, c, a, b] : edges[u]) {
        int w = (vis_mask >> c & 1) ? a : b;
        if (cnt[v] >= 3) continue;
        cnt[v]++;
        dfs(v, cost + w, vis_mask | (1 << v));
        cnt[v]--;
    }
}
```

### 复杂度

指数级，剪枝 + 次数限制后可行。

---

## 22 - POJ 1724 ROADS（DFS + 剪枝 / 优先队列）

### 题意

$N$ 个城市 $R$ 条道路，每条道路有长度 $d$ 和费用 $c$。在总费用 $\le K$ 的约束下，从城市 $1$ 到城市 $N$ 的最短距离。

### 分析

Dijkstra 改造：状态为 $(u, \text{remaining\_money})$。也可 DFS + 剪枝。

### 搜索策略

- **状态**：$(u, \text{cost\_so\_far})$
- **搜索方式**：优先队列 BFS / DFS + 剪枝
- **答案**：到达 $N$ 且总费用 $\le K$ 的最短距离

### 核心代码

```cpp
// Dijkstra variant
priority_queue<tuple<int,int,int>, vector<...>, greater<>> pq;
pq.push({0, 0, 1}); // dist, cost, node
while (!pq.empty()) {
    auto [d, c, u] = pq.top(); pq.pop();
    if (u == n) { cout << d; return; }
    for (auto& [v, len, toll] : adj[u]) {
        if (c + toll <= K)
            pq.push({d + len, c + toll, v});
    }
}
```

### 复杂度

$O(R \cdot K \cdot \log)$。

---

## 23 - POJ 2044 Weather Forecast（DFS + 状态压缩）

### 题意

$4 \times 4$ 网格代表区域天气。每天选一个 $2 \times 2$ 区域降雨。要求连续 $7$ 天内每个格子至少下过一次雨。给定一周的约束，判断能否连续满足。

### 分析

状压表示 $16$ 个格子的"最近是否下过雨"。DFS 枚举每天选哪个 $2 \times 2$ 区域。

### 搜索策略

- **状态**：当前天数、$16$ 位掩码
- **搜索方式**：DFS，每天 $9$ 种选择（$3 \times 3$ 个 $2 \times 2$ 区域）
- **答案**：所有天处理完后合法

### 核心代码

```cpp
bool dfs(int day, int mask) {
    if (day > 7) return (mask & FULL) == FULL;
    for (int r = 0; r < 3; r++)
        for (int c = 0; c < 3; c++) {
            int rain = rainMask(r, c);
            int new_mask = updateMask(mask, rain, day);
            if (dfs(day + 1, new_mask)) return true;
        }
    return false;
}
```

### 复杂度

$O(9^7) \approx 5 \times 10^6$。

---

## 24 - POJ 1129 Channel Allocation（DFS / 图着色）

### 题意

$N$ 个中继站（$N \le 26$），给出相邻关系。求最少需要多少个频道使相邻站不同频道（图着色问题）。

### 分析

$N \le 26$，DFS 回溯图着色。从 $1$ 种颜色开始尝试，依次增加。

### 搜索策略

- **状态**：当前节点的颜色分配
- **搜索方式**：DFS 逐节点着色
- **剪枝**：与已着色邻居颜色冲突时跳过
- **答案**：使 DFS 成功的最少颜色数

### 核心代码

```cpp
int color[26];
bool dfs(int node, int numColors) {
    if (node == n) return true;
    for (int c = 1; c <= numColors; c++) {
        bool ok = true;
        for (auto v : adj[node])
            if (color[v] == c) { ok = false; break; }
        if (!ok) continue;
        color[node] = c;
        if (dfs(node + 1, numColors)) return true;
        color[node] = 0;
    }
    return false;
}
// Try numColors = 1, 2, 3, ... until success
```

### 复杂度

指数级，$N \le 26$ 但实际图着色很快。

---

## 25 - POJ 1088 滑雪（记忆化搜索经典）

### 题意

$R \times C$ 网格，每格有高度。从任意格子出发，只能向四方向相邻且**高度更低**的格子滑行。求最长滑行路径长度。

### 分析

经典记忆化搜索。$dp[i][j]$ = 从 $(i,j)$ 出发的最长路径。

### 搜索策略

- **状态**：$(i, j)$
- **搜索方式**：DFS + 记忆化
- **转移**：$dp[i][j] = 1 + \max_{4 \text{dirs}} dp[i'][j']$（$h[i'][j'] < h[i][j]$）
- **答案**：$\max_{i,j} dp[i][j]$

### 核心代码

```cpp
int dp[R][C]; memset(dp, -1, sizeof dp);
int solve(int r, int c) {
    if (dp[r][c] != -1) return dp[r][c];
    dp[r][c] = 1;
    for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        if (valid(nr,nc) && h[nr][nc] < h[r][c])
            dp[r][c] = max(dp[r][c], 1 + solve(nr, nc));
    }
    return dp[r][c];
}
int ans = 0;
for (all (r,c)) ans = max(ans, solve(r, c));
```

### 复杂度

$O(RC)$。

---

## 26 - POJ 1191 棋盘分割（记忆化搜索）

### 题意

$8 \times 8$ 棋盘每格有分值。用 $N-1$ 刀切成 $N$ 块（每刀沿行或列切，切一个矩形为两个）。求各块分值之和的方差最小值。

### 分析

等价于最小化 $\sum s_i^2$。记忆化搜索：$dp[n][r1][c1][r2][c2]$ = 把矩形 $(r1,c1)$-$(r2,c2)$ 切成 $n$ 块的最小 $\sum s_i^2$。

### 搜索策略

- **状态**：$(\text{cuts}, r_1, c_1, r_2, c_2)$
- **搜索方式**：记忆化搜索
- **转移**：枚举横切/竖切位置，一部分保留另一部分递归
- **答案**：$dp[N][1][1][8][8]$

### 核心代码

```cpp
double dp[16][9][9][9][9];
double solve(int n, int r1, int c1, int r2, int c2) {
    if (n == 1) return sq(sum(r1,c1,r2,c2));
    if (dp[n][r1][c1][r2][c2] >= 0) return dp[n][r1][c1][r2][c2];
    double res = 1e18;
    for (int i = r1; i < r2; i++) { // horizontal cut
        res = min(res, sq(sum(r1,c1,i,c2)) + solve(n-1,i+1,c1,r2,c2));
        res = min(res, solve(n-1,r1,c1,i,c2) + sq(sum(i+1,c1,r2,c2)));
    }
    for (int j = c1; j < c2; j++) { // vertical cut
        res = min(res, sq(sum(r1,c1,r2,j)) + solve(n-1,r1,j+1,r2,c2));
        res = min(res, solve(n-1,r1,c1,r2,j) + sq(sum(r1,j+1,r2,c2)));
    }
    return dp[n][r1][c1][r2][c2] = res;
}
```

### 复杂度

$O(N \cdot 8^4 \cdot 8)$。

---

## 27 - POJ 1661 Help Jimmy（记忆化搜索）

### 题意

Jimmy 从高处坠落，中间有水平平台。可从平台左端或右端跳下。掉落高度 $> \text{MAX}$ 则死亡。求从起点到地面的最短时间。

### 分析

按高度排序平台。$dp[i][0/1]$ = 从平台 $i$ 的左端/右端到达地面的最短时间。

### 搜索策略

- **状态**：$(i, \text{side})$
- **搜索方式**：记忆化搜索
- **转移**：向下找能降落到的平台，加上水平移动时间
- **答案**：从起始平台出发的最短时间

### 核心代码

```cpp
int dp[1001][2]; memset(dp, -1, sizeof dp);
int solve(int i, int side) { // side: 0=left, 1=right
    if (dp[i][side] != -1) return dp[i][side];
    int x = (side == 0) ? plat[i].left : plat[i].right;
    int h = plat[i].height;
    // find platform below that x falls onto
    int j = findBelow(i, x);
    if (j == -1) { // falls to ground
        if (h > MAX) return dp[i][side] = INF;
        return dp[i][side] = h;
    }
    if (h - plat[j].height > MAX) return dp[i][side] = INF;
    int fall = h - plat[j].height;
    dp[i][side] = fall + min(
        abs(x - plat[j].left) + solve(j, 0),
        abs(x - plat[j].right) + solve(j, 1)
    );
    return dp[i][side];
}
```

### 复杂度

$O(N^2)$。

---

## 28 - POJ 2704 Pascal's Travels（记忆化搜索）

### 题意

$N \times N$ 网格，每格数字 $d$。从左上角出发每步向右或向下走恰好 $d$ 格。求到右下角的路径数。（与 HDU 1208 相同）

### 搜索策略

同 HDU 1208。

### 核心代码

```cpp
// 同 HDU 1208 模板
```

### 复杂度

$O(N^2)$。

---

## 29 - POJ 3373 Changing Digits（DFS + 记忆化）

### 题意

给大数 $N$ 和整数 $K$。修改 $N$ 的最少位数使结果是 $K$ 的倍数，且修改位数相同时取最小值。

### 分析

BFS/DFS：按修改位数从少到多尝试。对每一位从小到大尝试替换，用 $\bmod K$ 的余数判断。记忆化 `(位数, 余数)` 状态。

### 搜索策略

- **状态**：（修改位数，余数）
- **搜索方式**：迭代加深 DFS 或 BFS
- **答案**：余数 $= 0$ 时的最小修改数字

### 核心代码

```cpp
// Precompute 10^i mod K for each position
// BFS/IDA*: try changing 0,1,2,... digits
for (int changes = 0; ; changes++) {
    // DFS: pick 'changes' positions, try digits 0-9
    // check if result mod K == 0
}
```

### 复杂度

取决于 $K$ 和修改位数，实际可行。

---

## 30 - POJ 1077 Eight（八数码 / A* / IDA*）

### 题意

经典八数码问题。$3 \times 3$ 拼图从初始状态到 `1 2 3 4 5 6 7 8 0` 的最短步骤。

### 分析

A*（曼哈顿距离启发函数）或 IDA*。先用逆序数判断有解性。

### 搜索策略

- **状态**：排列的 Cantor 编码
- **搜索方式**：A* 或 IDA*
- **估价函数**：$h =$ 各数字到目标位置的曼哈顿距离之和
- **答案**：最短移动序列

### 核心代码

```cpp
// IDA*
int h(int board[]) {
    int sum = 0;
    for (int i = 0; i < 9; i++)
        if (board[i]) sum += manhattan(i, target_pos[board[i]]);
    return sum;
}
bool dfs(int board[], int g, int maxD, int prev) {
    int hv = h(board);
    if (hv == 0) return true;
    if (g + hv > maxD) return false;
    for (4 moves != reverse(prev)) {
        swap; 
        if (dfs(board, g+1, maxD, move)) return true;
        swap back;
    }
    return false;
}
```

### 复杂度

IDA*，实际很快（平均步数约 $22$）。

---

## 31 - POJ 2449 Remmarguts' Date（A* / K 短路）

### 题意

$N$ 个节点 $M$ 条有向边的加权图。求从 $S$ 到 $T$ 的第 $K$ 短路长度。

### 分析

经典 A* K 短路。先从 $T$ 反向 Dijkstra 求启发函数 $h(v)$。然后 A* 搜索，第 $K$ 次取出 $T$ 时即为答案。

### 搜索策略

- **预处理**：反向 Dijkstra 从 $T$ 求 $h(v) = \text{dist}(v, T)$
- **状态**：$(v, g)$
- **搜索方式**：A*，$f(v) = g + h(v)$
- **答案**：第 $K$ 次从优先队列中取出 $T$

### 核心代码

```cpp
// Reverse Dijkstra from T to get h[]
priority_queue<pair<int,int>, vector<...>, greater<>> pq;
pq.push({h[S], S}); // f = 0 + h[S]
int cnt[N] = {};
while (!pq.empty()) {
    auto [f, u] = pq.top(); pq.pop();
    cnt[u]++;
    if (u == T && cnt[u] == K) { cout << f; return; }
    if (cnt[u] > K) continue;
    for (auto [v, w] : adj[u])
        pq.push({f - h[u] + w + h[v], v});
}
```

### 复杂度

$O(NK \log(NK))$。

---

## 32 - POJ 3131 Cubic Eight-Puzzle（双向 BFS / IDA*）

### 题意

$3 \times 3$ 棋盘上有 $8$ 个小立方体（每面不同颜色）和一个空格。每步将一个邻居立方体滚入空格。求从初始状态到目标朝上颜色配置的最少步数（$\le 30$）。

### 分析

状态空间极大（位置 $\times$ 朝向）。双向 BFS 从初始和目标两端搜索。或 IDA*。

### 搜索策略

- **状态**：空格位置 + 每个立方体的朝向
- **搜索方式**：双向 BFS 或 IDA*
- **答案**：两端搜索首次相遇的总步数

### 核心代码

```cpp
// Bidirectional BFS
// Encode state: empty position + 8 cube orientations (24 possible each)
// Forward BFS from start, backward BFS from goal
// Meet in the middle
```

### 复杂度

双向 BFS: $O(\sqrt{S})$，$S$ 为状态空间大小。

---

## 33 - POJ 3134 Power Calculus（IDA*）

### 题意

给正整数 $N$，用最少的乘法/除法次数计算 $x^N$（从 $x^1$ 开始，每步可将已有的两个幂次相加或相减）。

### 分析

IDA* 搜索。维护当前可用的幂次集合。每步选两个已有幂次相加/减生成新幂次。

### 搜索策略

- **状态**：当前可用幂次集合
- **搜索方式**：IDA*
- **估价函数**：当前最大幂次翻倍几次能达到 $N$
- **答案**：包含 $N$ 时的深度

### 核心代码

```cpp
int a[1000]; // available exponents
bool dfs(int depth, int maxDepth) {
    if (a[depth] == n) return true;
    if (depth == maxDepth) return false;
    if (a[depth] << (maxDepth - depth) < n) return false; // prune
    for (int i = depth; i >= 0; i--) {
        a[depth+1] = a[depth] + a[i];
        if (dfs(depth+1, maxDepth)) return true;
        a[depth+1] = a[depth] - a[i];
        if (a[depth+1] > 0 && dfs(depth+1, maxDepth)) return true;
    }
    return false;
}
// a[0] = 1; try maxDepth = 0, 1, 2, ...
```

### 复杂度

IDA*，$N \le 1000$ 时可行。

---

## 34 - POJ 2286 The Rotation Game（IDA* 经典）

### 题意

$\#$ 形棋盘上有 $24$ 个格子填数字 $1, 2, 3$。有 $8$ 种旋转操作（上下左右各两列/行循环移动）。求使中心 $8$ 格数字相同的最少操作数和操作序列。

### 分析

IDA* 经典题。估价函数：中心 $8$ 格中出现最多的数字为 $\text{maxCnt}$，则 $h = 8 - \text{maxCnt}$。

### 搜索策略

- **状态**：$24$ 个格子的值
- **搜索方式**：IDA*
- **估价函数**：$h = 8 - \text{maxCnt}$（中心 $8$ 格）
- **答案**：中心 $8$ 格全部相同时的操作序列

### 核心代码

```cpp
int h() {
    int cnt[4] = {};
    for (each of 8 center cells) cnt[board[cell]]++;
    return 8 - *max_element(cnt+1, cnt+4);
}
bool dfs(int depth, int maxDepth, int lastOp) {
    if (h() == 0) return true;
    if (depth + h() > maxDepth) return false;
    for (int op = 0; op < 8; op++) {
        if (op == reverse(lastOp)) continue;
        applyOp(op);
        if (dfs(depth + 1, maxDepth, op)) return true;
        reverseOp(op);
    }
    return false;
}
```

### 复杂度

IDA*，实际搜索空间小。

---

## 35 - POJ 1198 Solitaire（双向 BFS）

### 题意

$8 \times 8$ 棋盘上有 $4$ 个棋子。每步将一个棋子向四方向移动一格（目标格为空），或跳过一个相邻棋子。求 $8$ 步内能否从初始到目标。

### 分析

$4$ 个棋子的位置组合很大，但限制 $8$ 步。双向 BFS 各搜 $4$ 步。

### 搜索策略

- **状态**：$4$ 个棋子的位置（排序后哈希）
- **搜索方式**：双向 BFS 各 $4$ 步
- **答案**：两端搜索相遇

### 核心代码

```cpp
// Encode 4 positions as sorted tuple
// Forward BFS 4 levels from start
// Backward BFS 4 levels from goal
// Check intersection
```

### 复杂度

$O(C(64,4)^{0.5} \cdot 16)$，可行。

---

## 36 - POJ 3523 The Morning after Halloween（BFS / 多人同步搜索）

### 题意

$W \times H$ 网格（$W, H \le 16$），有 $K$ 个鬼（$K \le 3$）。每步所有鬼同时移动（或不动），不能重叠或交换位置。求所有鬼到达各自目标的最少步数。

### 分析

$K \le 3$，状态为 $3$ 个鬼的位置。先将网格压缩（只保留非墙格子），减少状态数。BFS 搜索。

### 搜索策略

- **状态**：$(p_1, p_2, p_3)$（最多 $3$ 个位置）
- **搜索方式**：BFS，每步枚举所有鬼的移动组合
- **约束**：不重叠、不交换
- **答案**：所有鬼到达目标的步数

### 核心代码

```cpp
// Compress grid to numbered walkable cells
// State: (pos1, pos2, pos3)
// BFS: enumerate all 5^3 = 125 move combinations
// Check no collision, no swap
map<tuple<int,int,int>, int> dist;
queue<tuple<int,int,int>> q;
q.push({start1, start2, start3});
while (!q.empty()) {
    auto [p1, p2, p3] = q.front(); q.pop();
    if (p1==t1 && p2==t2 && p3==t3) { print dist; return; }
    for (each valid combination of moves) {
        auto ns = apply_moves(p1,p2,p3);
        if (!dist.count(ns)) {
            dist[ns] = dist[{p1,p2,p3}] + 1;
            q.push(ns);
        }
    }
}
```

### 复杂度

$O(C^3 \cdot 5^3)$，$C$ 为可行走格数。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **DFS 回溯** | 1, 3, 4, 6, 7, 8 | 骑士巡游、棋盘放置、数独、组合枚举 |
| **BFS 基础** | 2, 9, 10, 12, 13, 14 | 一维/二维/三维 BFS、路径输出 |
| **Flood Fill** | 14, 16, 17, 18, 19 | 四/八方向连通块、位掩码墙 |
| **BFS + 权重** | 11, 15, 22 | 状态搜索、$0$-$1$ BFS、费用约束 |
| **DFS + 剪枝** | 5, 20, 21, 23, 24 | 棍子拼接、生日蛋糕、图着色、状态压缩 |
| **记忆化搜索** | 25, 26, 27, 28, 29 | 网格最长路径、棋盘分割、平台跳跃 |
| **八数码 / A*** | 30, 31, 32 | Cantor 编码、K 短路、双向 BFS |
| **IDA*** | 33, 34 | 幂次计算、旋转游戏 |
| **双向 BFS** | 35, 36 | 棋子移动、多人同步搜索 |

## 学习路线建议

```
入门：14 → 16 → 17 → 18 → 19
       ↓
DFS 回溯：1 → 3 → 4 → 7 → 8
       ↓
DFS 剪枝：5 → 6 → 20 → 21 → 24
       ↓
BFS 基础：9 → 10 → 12 → 13 → 2
       ↓
BFS 进阶：11 → 15 → 22 → 23
       ↓
记忆化搜索：25 → 28 → 26 → 27 → 29
       ↓
A* / IDA*：30 → 31 → 33 → 34
       ↓
双向 BFS：32 → 35 → 36
```

## 解题方法论

1. **识别搜索类型**：连通块 → Flood Fill；最短路 → BFS；方案数 → DFS/记忆化；最优解 + 大状态空间 → A*/IDA*。
2. **状态压缩**：钥匙/开关 → 位掩码；多棋子 → 元组编码。
3. **剪枝是灵魂**：
   - 排序后从大到小搜索（POJ 1011）
   - 上下界估计（POJ 1190 生日蛋糕）
   - 限制重复次数（POJ 3411）
   - IDA* 估价函数（POJ 2286, 3134）
4. **双向搜索**：步数限制在 $8\text{-}10$ 步以内时，双向 BFS 各搜一半效果显著。
5. **预处理 + 搜索**：BFS 预算距离后用 DP/DFS 枚举（POJ 2907 TSP）。

> 💡 **记住**：POJ 的搜索题是 ACM 训练的经典教材。从 Flood Fill 入门，经 DFS 剪枝磨炼搜索直觉，再通过 A*/IDA* 体会启发式搜索的威力——这条路线将帮你构建完整的搜索知识体系。
