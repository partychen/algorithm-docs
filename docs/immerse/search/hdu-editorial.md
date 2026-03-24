---
title: "HDU 搜索专题精选解题报告"
subtitle: "🔴 33 道经典搜索题目的分析方法、解题思路与核心代码"
order: 5
icon: "🔴"
---

# HDU 搜索专题精选解题报告

> 来源：精选自 [HDU Online Judge](https://acm.hdu.edu.cn/) 的搜索类题目
>
> 本报告针对 33 道精选搜索题目，逐题给出**题意概述 → 分析方法 → 搜索策略 → 核心代码 → 复杂度**，按类型分组，最后做整体总结。

---

## 1 - HDU 1016 Prime Ring Problem（回溯）

### 题意

将 $1 \sim N$ 填入一个环中，使相邻两数之和为素数。输出所有方案（$1$ 固定在第一个位置）。

### 分析

经典回溯模板。从位置 $2$ 开始逐个尝试未使用的数，检查与前一个数之和是否为素数。最后一个还需与 $1$ 的和为素数。

### 搜索策略

- **状态**：当前位置 $\text{pos}$、已使用集合
- **搜索方式**：DFS 回溯
- **剪枝**：`a[pos-1] + a[pos]` 非素数时跳过
- **答案**：填满 $N$ 个位置且末位与 $1$ 之和为素数

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
// a[0] = 1; dfs(1, n);
```

### 复杂度

$O(N!)$，素数剪枝后远小于此。

---

## 2 - HDU 1010 Tempter of the Bone（DFS + 剪枝）

### 题意

$N \times M$ 网格迷宫，从起点 $S$ 到终点 $D$，恰好走 $T$ 步（不能重复经过格子）。判断是否可行。

### 分析

DFS 回溯搜索所有路径。关键剪枝：**奇偶剪枝**——从 $(sx,sy)$ 到 $(dx,dy)$ 的曼哈顿距离与 $T$ 奇偶性必须相同。

### 搜索策略

- **状态**：$(r, c, \text{step})$
- **搜索方式**：DFS 四方向扩展
- **剪枝**：① 奇偶性不符直接排除；② 剩余步数 $<$ 曼哈顿距离时剪枝
- **答案**：到达 $D$ 时 $\text{step} = T$

### 核心代码

```cpp
bool dfs(int r, int c, int step) {
    if (r == dr && c == dc) return step == T;
    int remain = T - step;
    int dist = abs(r - dr) + abs(c - dc);
    if (dist > remain || (remain - dist) % 2 != 0) return false;
    for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        if (!valid(nr, nc) || vis[nr][nc] || grid[nr][nc] == '#') continue;
        vis[nr][nc] = true;
        if (dfs(nr, nc, step + 1)) return true;
        vis[nr][nc] = false;
    }
    return false;
}
```

### 复杂度

最坏 $O(4^T)$，剪枝后通常远小于此。

---

## 3 - HDU 2553 N皇后问题（回溯）

### 题意

$N \times N$ 棋盘放 $N$ 个皇后使互不攻击。求方案数（$N \le 10$）。

### 分析

经典 N 皇后回溯。逐行放置，用列/对角线标记剪枝。$N \le 10$ 可预处理打表。

### 搜索策略

- **状态**：当前行 $\text{row}$、列与对角线占用情况
- **搜索方式**：DFS 逐行放置
- **剪枝**：列冲突、主副对角线冲突
- **答案**：成功放完 $N$ 行时计数 $+1$

### 核心代码

```cpp
int cnt;
bool col[15], d1[30], d2[30]; // column, diag1, diag2
void dfs(int row, int n) {
    if (row == n) { cnt++; return; }
    for (int c = 0; c < n; c++) {
        if (col[c] || d1[row-c+n] || d2[row+c]) continue;
        col[c] = d1[row-c+n] = d2[row+c] = true;
        dfs(row + 1, n);
        col[c] = d1[row-c+n] = d2[row+c] = false;
    }
}
```

### 复杂度

$O(N!)$。

---

## 4 - HDU 1045 Fire Net（DFS / 回溯）

### 题意

$N \times N$ 棋盘（$N \le 4$）有墙壁。放置炮台使同行同列（被墙隔开则不算）不能互相攻击。求最大炮台数。

### 分析

$N \le 4$，DFS 枚举每个空格放或不放，检查合法性。也可建模为二分匹配。

### 搜索策略

- **状态**：当前格子编号、已放置的炮台
- **搜索方式**：DFS 枚举放/不放
- **剪枝**：放置时检查行列方向（到墙之间）无冲突
- **答案**：合法方案中炮台数的最大值

### 核心代码

```cpp
int ans = 0;
void dfs(int pos, int cnt) {
    if (pos == n * n) { ans = max(ans, cnt); return; }
    int r = pos / n, c = pos % n;
    dfs(pos + 1, cnt); // don't place
    if (grid[r][c] != 'X' && canPlace(r, c)) {
        grid[r][c] = 'O';
        dfs(pos + 1, cnt + 1);
        grid[r][c] = '.';
    }
}
```

### 复杂度

$O(2^{N^2})$，$N \le 4$ 时可行。

---

## 5 - HDU 1241 Oil Deposits（DFS / Flood Fill）

### 题意

$M \times N$ 网格，`@` 表示油田，`*` 表示空地。八方向相连的 `@` 构成一个油田。求油田数。

### 分析

经典 Flood Fill / 连通分量计数。对每个未访问的 `@` 做一次 DFS，标记整个连通块。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS，八方向扩展
- **答案**：DFS 启动次数 = 油田数

### 核心代码

```cpp
void dfs(int r, int c) {
    if (r < 0 || r >= m || c < 0 || c >= n) return;
    if (grid[r][c] != '@') return;
    grid[r][c] = '*';
    for (int dr = -1; dr <= 1; dr++)
        for (int dc = -1; dc <= 1; dc++)
            if (dr || dc) dfs(r + dr, c + dc);
}
int cnt = 0;
for (int i = 0; i < m; i++)
    for (int j = 0; j < n; j++)
        if (grid[i][j] == '@') { dfs(i, j); cnt++; }
```

### 复杂度

$O(MN)$。

---

## 6 - HDU 1312 Red and Black（DFS / 连通性）

### 题意

$W \times H$ 网格，`.` 为黑砖，`#` 为红砖。人站在 `@` 处，只能走黑砖。求可到达的黑砖数（含起点）。

### 分析

从起点 DFS/BFS，统计可达 `.` 格子数。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：DFS 四方向
- **答案**：访问到的格子总数

### 核心代码

```cpp
int cnt = 0;
void dfs(int r, int c) {
    if (!valid(r,c) || grid[r][c] == '#' || vis[r][c]) return;
    vis[r][c] = true; cnt++;
    for (int d = 0; d < 4; d++) dfs(r+dx[d], c+dy[d]);
}
```

### 复杂度

$O(WH)$。

---

## 7 - HDU 1175 连连看（DFS + 剪枝）

### 题意

$N \times M$ 棋盘上有数字（$0$ 为空）。两个相同数字的棋子能否通过一条**最多转弯 $2$ 次**的路径（只经过空格）相连？

### 分析

DFS 搜索路径，维护当前方向和转弯次数。超过 $2$ 次转弯时剪枝。

### 搜索策略

- **状态**：$(r, c, \text{dir}, \text{turns})$
- **搜索方式**：DFS
- **剪枝**：转弯次数 $> 2$ 时返回
- **答案**：到达目标且转弯 $\le 2$

### 核心代码

```cpp
bool dfs(int r, int c, int dir, int turns, int tr, int tc) {
    if (r == tr && c == tc) return turns <= 2;
    for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        int nt = (dir == -1 || dir == d) ? turns : turns + 1;
        if (nt > 2) continue;
        if (!valid(nr,nc)) continue;
        if (nr == tr && nc == tc) return true;
        if (grid[nr][nc] != 0 || vis[nr][nc]) continue;
        vis[nr][nc] = true;
        if (dfs(nr, nc, d, nt, tr, tc)) return true;
        vis[nr][nc] = false;
    }
    return false;
}
```

### 复杂度

转弯限制使搜索空间很小，实际 $O(NM)$ 级别。

---

## 8 - HDU 1342 Lotto（DFS / 组合）

### 题意

给 $k$ 个数（已排序），输出所有大小为 $6$ 的子集（按字典序）。

### 分析

经典组合枚举。DFS 依次选取 $6$ 个不同元素。

### 搜索策略

- **状态**：当前选了几个、上一个选的索引
- **搜索方式**：DFS，从 `start` 往后选
- **答案**：选满 $6$ 个时输出

### 核心代码

```cpp
int chosen[6];
void dfs(int idx, int start, int k) {
    if (idx == 6) { print(chosen); return; }
    for (int i = start; i < k; i++) {
        chosen[idx] = a[i];
        dfs(idx + 1, i + 1, k);
    }
}
```

### 复杂度

$O(\binom{k}{6})$。

---

## 9 - HDU 1015 Safecracker（回溯 / 枚举）

### 题意

给一组大写字母（$A=1, B=2, \dots$）和目标值 $\text{target}$。从中选 $5$ 个不同字母 $v, w, x, y, z$（按字典序降序）使 $v - w^2 + x^3 - y^4 + z^5 = \text{target}$。

### 分析

字母数 $\le 12$，从中选 $5$ 个并检查等式。DFS 枚举所有 $\binom{12}{5}$ 种选法。

### 搜索策略

- **状态**：已选字母数、上一个索引
- **搜索方式**：DFS 组合枚举，按降序排列后选取
- **答案**：满足等式的字典序最大的组合

### 核心代码

```cpp
sort(letters, reverse);
int sel[5];
bool found = false;
void dfs(int idx, int start) {
    if (found) return;
    if (idx == 5) {
        if (eval(sel) == target) { print(sel); found = true; }
        return;
    }
    for (int i = start; i < n; i++) {
        sel[idx] = letters[i];
        dfs(idx + 1, i + 1);
    }
}
```

### 复杂度

$O(\binom{12}{5}) = 792$。

---

## 10 - HDU 1172 猜数字（枚举 / 搜索）

### 题意

猜 $4$ 位数（各位不同）。每次猜测给出"$A$ 个位置正确、$B$ 个数字对但位置错"。根据多次猜测结果确定答案。

### 分析

枚举所有合法 $4$ 位排列（$0\text{-}9$ 中选 $4$ 个排列），检查每个候选是否满足所有猜测条件。

### 搜索策略

- **状态**：$4$ 位排列
- **搜索方式**：枚举 $10 \times 9 \times 8 \times 7 = 5040$ 种排列
- **答案**：唯一满足所有条件的排列

### 核心代码

```cpp
for (int num = 0; num <= 9999; num++) {
    // extract digits, check all distinct
    bool ok = true;
    for (auto& [guess, a, b] : hints) {
        int ca = 0, cb = 0;
        // count exact matches (A) and digit matches (B)
        if (ca != a || cb != b) { ok = false; break; }
    }
    if (ok) candidates.push_back(num);
}
```

### 复杂度

$O(10000 \cdot Q)$。

---

## 11 - HDU 1253 胜利大逃亡（三维 BFS）

### 题意

$A \times B \times C$ 的三维迷宫，$0$ 为通路，$1$ 为墙。从 $(0,0,0)$ 走到 $(A-1,B-1,C-1)$，每步移动到六方向相邻通路格子。在 $T$ 步内到达则输出最短步数，否则 $-1$。

### 分析

标准三维 BFS。状态为 $(x, y, z)$，六方向扩展。

### 搜索策略

- **状态**：$(x, y, z)$
- **搜索方式**：BFS 六方向
- **剪枝**：步数 $> T$ 时无需继续
- **答案**：`dist[A-1][B-1][C-1]`（$\le T$ 时输出）

### 核心代码

```cpp
int dist[A][B][C]; memset(dist, -1, sizeof dist);
dist[0][0][0] = 0;
queue<tuple<int,int,int>> q;
q.push({0,0,0});
int dx[]={1,-1,0,0,0,0}, dy[]={0,0,1,-1,0,0}, dz[]={0,0,0,0,1,-1};
while (!q.empty()) {
    auto [x,y,z] = q.front(); q.pop();
    for (int d = 0; d < 6; d++) {
        int nx=x+dx[d], ny=y+dy[d], nz=z+dz[d];
        if (!valid(nx,ny,nz) || maze[nx][ny][nz] || dist[nx][ny][nz]!=-1) continue;
        dist[nx][ny][nz] = dist[x][y][z] + 1;
        q.push({nx,ny,nz});
    }
}
```

### 复杂度

$O(ABC)$。

---

## 12 - HDU 1240 Asteroids!（三维 BFS）

### 题意

$N^3$ 的三维空间，`O` 为空、`X` 为障碍。求两点之间六方向移动的最短步数。

### 分析

与 HDU 1253 类似的三维 BFS。

### 搜索策略

- **状态**：$(x, y, z)$
- **搜索方式**：BFS 六方向
- **答案**：终点的 BFS 距离

### 核心代码

```cpp
// 同 HDU 1253 的三维 BFS 模板
// 区别仅在输入格式和输出格式
```

### 复杂度

$O(N^3)$。

---

## 13 - HDU 1548 A strange lift（BFS）

### 题意

$N$ 层楼的电梯，在第 $i$ 层可上 $K_i$ 层或下 $K_i$ 层。求从 $A$ 层到 $B$ 层的最少操作次数。

### 分析

将每层视为图的节点，BFS 求最短路。

### 搜索策略

- **状态**：当前楼层
- **搜索方式**：BFS，每层两个邻居（$i + K_i$ 和 $i - K_i$）
- **答案**：`dist[B]`

### 核心代码

```cpp
int dist[205]; memset(dist, -1, sizeof dist);
dist[A] = 0;
queue<int> q; q.push(A);
while (!q.empty()) {
    int f = q.front(); q.pop();
    for (int nf : {f + K[f], f - K[f]}) {
        if (nf < 1 || nf > N || dist[nf] != -1) continue;
        dist[nf] = dist[f] + 1;
        q.push(nf);
    }
}
```

### 复杂度

$O(N)$。

---

## 14 - HDU 1195 Open the Lock（BFS）

### 题意

$4$ 位密码锁（每位 $1\text{-}9$），每步可对某一位 $+1$、$-1$（循环）或与相邻位交换。求从初始状态到目标状态的最少操作次数。

### 分析

状态空间 $9^4 = 6561$，BFS 搜索即可。

### 搜索策略

- **状态**：$4$ 位数字串
- **搜索方式**：BFS，每步枚举所有合法操作
- **答案**：首次到达目标的步数

### 核心代码

```cpp
map<string, int> dist;
queue<string> q;
dist[start] = 0; q.push(start);
while (!q.empty()) {
    string s = q.front(); q.pop();
    if (s == target) { cout << dist[s]; return; }
    // Generate neighbors: +1, -1 for each digit; swap adjacent
    for (each neighbor ns) {
        if (!dist.count(ns)) { dist[ns] = dist[s] + 1; q.push(ns); }
    }
}
```

### 复杂度

$O(9^4 \times 12) = O(1)$（常数级）。

---

## 15 - HDU 1429 胜利大逃亡(续)（BFS + 状压）

### 题意

$N \times M$ 迷宫有门（`A`-`J`）和钥匙（`a`-`j`），有钥匙才能开对应门。在 $T$ 步内从起点到终点。求最短步数。

### 分析

钥匙最多 $10$ 种，用位掩码表示持有的钥匙集合。BFS 状态扩展为 $(r, c, \text{keys})$。

### 搜索策略

- **状态**：$(r, c, \text{key\_mask})$
- **搜索方式**：BFS
- **转移**：拾取钥匙更新 mask；遇到门检查对应钥匙位
- **答案**：首次到达终点的步数（$\le T$）

### 核心代码

```cpp
int dist[N][M][1 << 10];
memset(dist, -1, sizeof dist);
dist[sr][sc][0] = 0;
queue<tuple<int,int,int>> q;
q.push({sr, sc, 0});
while (!q.empty()) {
    auto [r, c, keys] = q.front(); q.pop();
    for (4 dirs) {
        int nr = r+dr, nc = c+dc, nk = keys;
        if (grid[nr][nc] >= 'a' && grid[nr][nc] <= 'j')
            nk |= (1 << (grid[nr][nc] - 'a'));
        if (grid[nr][nc] >= 'A' && grid[nr][nc] <= 'J')
            if (!(nk & (1 << (grid[nr][nc] - 'A')))) continue;
        if (dist[nr][nc][nk] != -1) continue;
        dist[nr][nc][nk] = dist[r][c][keys] + 1;
        q.push({nr, nc, nk});
    }
}
```

### 复杂度

$O(NM \cdot 2^{10})$。

---

## 16 - HDU 1728 逃离迷宫（BFS / 转弯计数）

### 题意

$N \times M$ 迷宫，从起点到终点，路径中**转弯次数**不超过 $k$。判断是否可达。

### 分析

BFS 中状态包含当前方向。每次沿当前方向一直走到底（不转弯），或在任意位置转弯（转弯 $+1$）。用 BFS 找最少转弯数到达终点。

### 搜索策略

- **状态**：$(r, c, \text{turns})$
- **搜索方式**：BFS，沿每个方向走到底
- **答案**：终点的最少转弯数 $\le k$

### 核心代码

```cpp
// BFS: from start, for each direction go as far as possible
int turns[N][M]; memset(turns, 0x3f, sizeof turns);
turns[sr][sc] = -1; // will be 0 after first move
queue<pair<int,int>> q; q.push({sr, sc});
while (!q.empty()) {
    auto [r, c] = q.front(); q.pop();
    for (int d = 0; d < 4; d++) {
        int nr = r + dx[d], nc = c + dy[d];
        while (valid(nr, nc) && grid[nr][nc] != '#') {
            if (turns[r][c] + 1 < turns[nr][nc]) {
                turns[nr][nc] = turns[r][c] + 1;
                q.push({nr, nc});
            }
            nr += dx[d]; nc += dy[d];
        }
    }
}
```

### 复杂度

$O(NM \cdot \max(N,M))$。

---

## 17 - HDU 3085 Nightmare Ⅱ（双向 BFS）

### 题意

$N \times M$ 网格，男孩和女孩各在一个位置，有两个鬼。每秒：鬼向外扩展 $2$ 步（曼哈顿距离），男孩走 $3$ 步，女孩走 $1$ 步。不能走被鬼占领的格子。求两人相遇的最早时间。

### 分析

模拟 BFS：每一轮先扩展鬼的领地，再分别扩展男孩（$3$ 步）和女孩（$1$ 步）。两人的 BFS 区域有交集即为相遇。

### 搜索策略

- **状态**：$(r, c)$，分别维护男孩和女孩的 BFS 前沿
- **搜索方式**：逐轮同步 BFS
- **答案**：某轮两人的已访问区域首次重叠

### 核心代码

```cpp
for (int t = 1; ; t++) {
    expandGhosts(2); // expand ghost territory by 2
    expandBoy(3);    // BFS boy 3 steps, skip ghost territory
    expandGirl(1);   // BFS girl 1 step
    if (overlap(boy_vis, girl_vis)) return t;
    if (no more expansion possible) return -1;
}
```

### 复杂度

$O(NM \cdot T)$，$T$ 为答案轮数。

---

## 18 - HDU 1072 Nightmare（BFS / 状态搜索）

### 题意

$N \times M$ 网格，初始生命 $6$ 分钟。每走一步耗 $1$ 分钟。有重置点可将生命重置为 $6$（每个重置点只能用一次）。生命 $= 0$ 时死亡。求到终点的最短步数。

### 分析

状态需要区分"已使用过哪些重置点"——但重置点可能较多。简化：允许重复访问格子但不重复使用重置点。实际上可用 `dist[r][c]` 记录到达时剩余的最大生命，更新更优时重新入队。

### 搜索策略

- **状态**：$(r, c, \text{life})$
- **搜索方式**：BFS，到达重置点时 life $= 6$
- **剪枝**：life $\le 0$ 时不扩展；已访问且 life 不更优时跳过
- **答案**：首次到达终点的步数

### 核心代码

```cpp
int best[N][M]; memset(best, -1, sizeof best);
queue<tuple<int,int,int,int>> q; // r, c, life, steps
q.push({sr, sc, 6, 0}); best[sr][sc] = 6;
while (!q.empty()) {
    auto [r, c, life, steps] = q.front(); q.pop();
    if (life <= 0) continue;
    if (r == er && c == ec) { cout << steps; return; }
    for (4 dirs) {
        int nl = life - 1;
        if (grid[nr][nc] == 4) nl = 6; // reset point
        if (nl <= best[nr][nc]) continue;
        best[nr][nc] = nl;
        q.push({nr, nc, nl, steps + 1});
    }
}
```

### 复杂度

$O(NM \cdot 6)$。

---

## 19 - HDU 1044 Collect More Jewels（BFS + DFS + 剪枝）

### 题意

$W \times H$ 迷宫，有入口、出口和若干宝石（$\le 10$）。在 $L$ 步内从入口到出口，途中拾取宝石使总价值最大。

### 分析

先 BFS 预计算入口、出口、各宝石之间的两两最短距离。然后 DFS/状压 DP 枚举宝石拾取顺序，贪心选择总步数 $\le L$ 的最大价值方案。

### 搜索策略

- **预处理**：从入口、出口、每个宝石出发做 BFS，求两两最短距离
- **状态**：（当前位置，已拾取集合，剩余步数）
- **搜索方式**：DFS / 状压 DP
- **答案**：到达出口时的最大总价值

### 核心代码

```cpp
// BFS from each key point
for (int i = 0; i < num_points; i++) bfs(points[i]);
// DFS with bitmask
int ans = -1;
function<void(int, int, int, int)> dfs = [&](int cur, int mask, int val, int rem) {
    // try going to exit
    if (dist[cur][exit_id] <= rem) ans = max(ans, val);
    for (int j = 0; j < num_jewels; j++) {
        if (mask >> j & 1) continue;
        if (dist[cur][j] > rem) continue;
        dfs(j, mask | (1<<j), val + jewel_val[j], rem - dist[cur][j]);
    }
};
dfs(entrance_id, 0, 0, L);
```

### 复杂度

$O(WH \cdot K + 2^K \cdot K^2)$，$K \le 10$。

---

## 20 - HDU 1455 Sticks（DFS + 剪枝经典）

### 题意

一些小棍被切断。给出所有碎片长度，求原始棍子的最小可能长度。

### 分析

枚举目标长度 $L$（从最大碎片到总和），DFS 检查能否恰好拼成若干根长 $L$ 的棍子。多种经典剪枝。

### 搜索策略

- **状态**：当前棍子已拼长度、已使用碎片
- **搜索方式**：DFS 回溯
- **剪枝**：① 从大到小排序；② 跳过相同长度；③ 失败时若当前棍子长度为 $0$ 或刚好 $L$ 则直接回溯；④ 当前碎片不行则跳过相同长度的后续碎片
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
        int new_len = cur_len + sticks[i];
        if (new_len == L) {
            if (dfs(0, stick_cnt + 1, 0)) return true;
        } else {
            if (dfs(new_len, stick_cnt, i + 1)) return true;
        }
        used[i] = false;
        if (cur_len == 0 || cur_len + sticks[i] == L) return false;
    }
    return false;
}
```

### 复杂度

最坏指数级，剪枝后可处理 $N \le 64$。

---

## 21 - HDU 1180 诡异的楼梯（BFS + 状态）

### 题意

$N \times M$ 迷宫中有水平/垂直交替变化的楼梯。楼梯每分钟状态翻转一次。从起点到终点的最短时间。

### 分析

BFS，到达楼梯处时根据当前时间的奇偶判断楼梯方向。若方向不对可以等一步。

### 搜索策略

- **状态**：$(r, c, \text{time})$
- **搜索方式**：BFS
- **楼梯处理**：到达楼梯时根据 $\text{time} \bmod 2$ 判断方向；方向不对则 $\text{time} + 1$ 再过
- **答案**：到达终点的最短时间

### 核心代码

```cpp
// BFS, at staircase check time parity
// If staircase matches direction → pass through (cost 1)
// If not → wait 1 step then pass (cost 2)
```

### 复杂度

$O(NM)$。

---

## 22 - HDU 2612 Find a way（双源 BFS）

### 题意

$N \times M$ 网格城市，两人分别从位置 $Y$ 和 $M$ 出发，求到达某个 KFC（`@`）的**两人总时间最小值**。

### 分析

分别从两个起点做 BFS，然后枚举所有 KFC 取两人距离之和的最小值。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：两次 BFS
- **答案**：$\min_{\text{KFC at }(r,c)} (d_Y[r][c] + d_M[r][c])$

### 核心代码

```cpp
bfs(yr, yc, distY);
bfs(mr, mc, distM);
int ans = INF;
for (all (r,c) where grid[r][c] == '@')
    if (distY[r][c] != -1 && distM[r][c] != -1)
        ans = min(ans, distY[r][c] + distM[r][c]);
```

### 复杂度

$O(NM)$。

---

## 23 - HDU 1078 FatMouse and Cheese（记忆化搜索）

### 题意

$N \times N$ 网格，每格有奶酪量 $a_{ij}$。老鼠从 $(0,0)$ 出发，每步沿水平或垂直方向走 $1 \sim k$ 格，且目标格奶酪量必须**严格大于**当前格。求能吃到的最大奶酪总量。

### 分析

记忆化搜索。$dp[i][j]$ = 从 $(i,j)$ 出发能吃到的最大奶酪量（含当前格）。

### 搜索策略

- **状态**：$(i, j)$
- **搜索方式**：DFS + 记忆化
- **转移**：$dp[i][j] = a[i][j] + \max_{1 \le s \le k, 4 \text{dirs}} dp[i'][j']$（$a[i'][j'] > a[i][j]$）
- **答案**：$dp[0][0]$

### 核心代码

```cpp
int dp[N][N]; memset(dp, -1, sizeof dp);
int solve(int r, int c) {
    if (dp[r][c] != -1) return dp[r][c];
    dp[r][c] = a[r][c];
    for (int d = 0; d < 4; d++)
        for (int s = 1; s <= k; s++) {
            int nr = r + dx[d]*s, nc = c + dy[d]*s;
            if (!valid(nr,nc)) break;
            if (a[nr][nc] > a[r][c])
                dp[r][c] = max(dp[r][c], a[r][c] + solve(nr, nc));
        }
    return dp[r][c];
}
```

### 复杂度

$O(N^2 \cdot k)$。

---

## 24 - HDU 1208 Pascal's Travels（记忆化搜索）

### 题意

$N \times N$ 网格（$N \le 34$），每格有数字 $d$。从左上角出发，每步向右或向下走恰好 $d$ 格。求到达右下角 $(N-1,N-1)$ 的路径数。

### 分析

记忆化搜索。$dp[i][j]$ = 从 $(i,j)$ 到右下角的路径数。

### 搜索策略

- **状态**：$(i, j)$
- **搜索方式**：DFS + 记忆化
- **转移**：$dp[i][j] = dp[i+d][j] + dp[i][j+d]$（若合法）
- **答案**：$dp[0][0]$

### 核心代码

```cpp
long long dp[35][35]; memset(dp, -1, sizeof dp);
long long solve(int r, int c) {
    if (r == n-1 && c == n-1) return 1;
    if (dp[r][c] != -1) return dp[r][c];
    int d = grid[r][c];
    if (d == 0) return dp[r][c] = 0; // stuck
    dp[r][c] = 0;
    if (r + d < n) dp[r][c] += solve(r + d, c);
    if (c + d < n) dp[r][c] += solve(r, c + d);
    return dp[r][c];
}
```

### 复杂度

$O(N^2)$。

---

## 25 - HDU 1428 漫步校园（BFS + 记忆化搜索）

### 题意

$N \times N$ 网格，每格通行时间 $w[i][j]$。从 $(0,0)$ 到 $(N-1,N-1)$，只走"使剩余最短路严格减少"的方向。求满足条件的路径数。

### 分析

先从终点 BFS/Dijkstra 求每个格子到终点的最短距离 $d[i][j]$。然后从起点记忆化搜索，只走 $d[\text{next}] < d[\text{cur}]$ 的邻居。

### 搜索策略

- **预处理**：从 $(N-1,N-1)$ 反向 BFS/Dijkstra 求 $d[i][j]$
- **状态**：$(i, j)$
- **搜索方式**：DFS + 记忆化，只走 $d[\text{neighbor}] < d[i][j]$ 的方向
- **答案**：$dp[0][0]$

### 核心代码

```cpp
// Dijkstra from (N-1, N-1) to get d[][]
long long dp[N][N]; memset(dp, -1, sizeof dp);
long long solve(int r, int c) {
    if (r == n-1 && c == n-1) return 1;
    if (dp[r][c] != -1) return dp[r][c];
    dp[r][c] = 0;
    for (4 dirs) {
        if (valid(nr, nc) && d[nr][nc] < d[r][c])
            dp[r][c] += solve(nr, nc);
    }
    return dp[r][c];
}
```

### 复杂度

$O(N^2 \log N)$（Dijkstra）+ $O(N^2)$（记忆化）。

---

## 26 - HDU 1142 A Walk Through the Forest（BFS + 记忆化）

### 题意

$N$ 个节点的带权无向图。从节点 $1$ 到节点 $2$，每步只走"到终点最短距离严格减少"的邻居。求路径数。

### 分析

与 HDU 1428 思路相同。先 Dijkstra 从节点 $2$ 求 $d[v]$，再记忆化搜索从节点 $1$ 出发，只走 $d[u] < d[v]$ 的邻居 $u$。

### 搜索策略

- **预处理**：从节点 $2$ Dijkstra 求 $d[v]$
- **状态**：节点 $v$
- **搜索方式**：DFS + 记忆化
- **答案**：$dp[1]$

### 核心代码

```cpp
// Dijkstra from node 2
long long dp[N]; memset(dp, -1, sizeof dp);
long long solve(int v) {
    if (v == 2) return 1;
    if (dp[v] != -1) return dp[v];
    dp[v] = 0;
    for (auto [u, w] : adj[v])
        if (d[u] < d[v]) dp[v] += solve(u);
    return dp[v];
}
```

### 复杂度

$O(N^2)$ 或 $O((N+M) \log N)$。

---

## 27 - HDU 4960 Another OCD Patient（记忆化搜索）

### 题意

长为 $N$ 的序列，将其分成若干段使得段结构是回文的（即第 $i$ 段和与倒数第 $i$ 段和相等）。每段有合并代价。求最小总代价。

### 分析

双指针从两端向中间扫描。贪心地让两端各取若干元素使和相等，形成一对配对段。用记忆化搜索或 DP 处理。

### 搜索策略

- **状态**：$(l, r)$ — 当前未处理的区间
- **搜索方式**：记忆化搜索 / 双指针 DP
- **转移**：两端各取一段使和相等，递归处理内部
- **答案**：最小合并代价

### 核心代码

```cpp
long long dp[N][N]; memset(dp, -1, sizeof dp);
long long solve(int l, int r) {
    if (l > r) return 0;
    if (l == r) return cost[1]; // single element
    if (dp[l][r] != -1) return dp[l][r];
    long long res = cost[r - l + 1]; // merge all into one
    int i = l, j = r;
    long long sl = 0, sr = 0;
    while (i < j) {
        sl += a[i++]; sr += a[j--];
        while (i < j && sl != sr) {
            if (sl < sr) sl += a[i++]; else sr += a[j--];
        }
        if (sl == sr)
            res = min(res, cost[i-l] + cost[r-j] + solve(i, j));
    }
    return dp[l][r] = res;
}
```

### 复杂度

$O(N^2)$。

---

## 28 - HDU 3567 Eight II（BFS + 打表 / 双向 BFS）

### 题意

$3 \times 3$ 的八数码问题。给定起始和目标状态，求字典序最小的最短移动序列。

### 分析

以目标状态为终点 BFS 打表。由于目标不固定，可对 $9$ 种目标（空格在不同位置）分别预处理。也可用双向 BFS。

### 搜索策略

- **状态**：排列的 Cantor 展开编码
- **搜索方式**：BFS（或双向 BFS）
- **优化**：按字典序 `d, l, r, u` 扩展保证字典序最小
- **答案**：首次到达目标时的路径

### 核心代码

```cpp
// Cantor encoding of permutation
int encode(int perm[]) { /* Cantor expansion */ }
// BFS from target, store parent and move
// For query: BFS from start, match target encoding
```

### 复杂度

$O(9!)$ 预处理，$O(1)$ 查询。

---

## 29 - HDU 1043 Eight（八数码 / A* / BFS）

### 题意

经典八数码问题：$3 \times 3$ 拼图从初始状态到目标状态 `1 2 3 4 5 6 7 8 x` 的最短移动步骤。

### 分析

可用 BFS（$9! = 362880$ 状态可枚举）、双向 BFS 或 A*（曼哈顿距离启发函数）。先判断是否有解（逆序数奇偶性）。

### 搜索策略

- **状态**：排列编码
- **搜索方式**：A*（$f = g + h$，$h$ = 曼哈顿距离之和）或 BFS
- **判定无解**：逆序数为奇数则无解
- **答案**：最短移动序列

### 核心代码

```cpp
// A* with Manhattan distance heuristic
priority_queue<State, vector<State>, greater<>> pq;
pq.push({start, 0, manhattan(start)});
while (!pq.empty()) {
    auto [state, g, f] = pq.top(); pq.pop();
    if (state == goal) { print_path(); return; }
    for (4 moves) {
        State ns = apply_move(state, move);
        int ng = g + 1, nh = manhattan(ns);
        if (!visited(ns) || ng < dist(ns)) {
            pq.push({ns, ng, ng + nh});
        }
    }
}
```

### 复杂度

BFS: $O(9!)$；A*: 实际远小于此。

---

## 30 - HDU 3533 Escape（BFS + 预处理）

### 题意

$N \times M$ 网格上有若干炮台，周期性发射子弹。人从 $(0,0)$ 走到 $(N,M)$，每步可四方向移动或停留。被子弹击中则死亡。求最短时间到达终点。

### 分析

预处理每个时刻每个格子是否有子弹。BFS 状态为 $(r, c, t)$。

### 搜索策略

- **状态**：$(r, c, t)$
- **预处理**：计算每个时刻每个格子的子弹覆盖
- **搜索方式**：BFS，五方向（含停留）
- **剪枝**：$t$ 超过上限时停止
- **答案**：首次到达 $(N,M)$ 的时刻

### 核心代码

```cpp
// Precompute bullet[t][r][c]
bool bullet[T][N][M];
// BFS
queue<tuple<int,int,int>> q; q.push({0,0,0});
vis[0][0][0] = true;
while (!q.empty()) {
    auto [r,c,t] = q.front(); q.pop();
    if (r == N && c == M) { cout << t; return; }
    for (5 dirs including stay) {
        if (valid && !bullet[t+1][nr][nc] && !vis[nr][nc][t+1]) {
            vis[nr][nc][t+1] = true;
            q.push({nr, nc, t+1});
        }
    }
}
```

### 复杂度

$O(NMT)$。

---

## 31 - HDU 1813 Escape from Tetris（BFS / IDA*）

### 题意

$N \times N$ 棋盘上有若干棋子。每步所有棋子同时向同一方向移动（碰墙不动）。求让所有棋子离开棋盘的最短操作序列。

### 分析

状态为所有棋子位置的集合。IDA* 搜索：估价函数为所有棋子到最近边界距离的最大值。

### 搜索策略

- **状态**：所有棋子的位置集合
- **搜索方式**：IDA*（迭代加深 + 启发式剪枝）
- **估价函数**：$h = \max_i \text{dist\_to\_border}(i)$
- **答案**：所有棋子离开棋盘的操作序列

### 核心代码

```cpp
int h(State& s) {
    int mx = 0;
    for (auto& p : s.pieces)
        mx = max(mx, min({p.r, p.c, n-1-p.r, n-1-p.c}));
    return mx;
}
bool ida(State s, int depth, int maxDepth) {
    if (s.allOut()) return true;
    if (depth + h(s) > maxDepth) return false;
    for (int d = 0; d < 4; d++) {
        State ns = s.move(d);
        if (ida(ns, depth + 1, maxDepth)) { record(d); return true; }
    }
    return false;
}
```

### 复杂度

IDA* 实际性能取决于启发函数质量。

---

## 32 - HDU 1560 DNA sequence（IDA*）

### 题意

给 $N$ 个 DNA 序列（由 `A, C, G, T` 组成，长度 $\le 5$），求最短的**超序列**（包含所有给定序列为子序列）。

### 分析

IDA* 搜索。状态为每个序列当前匹配到的位置。每步选择一个字母追加到超序列中，推进所有能匹配该字母的序列。估价函数：所有序列剩余未匹配长度的最大值。

### 搜索策略

- **状态**：各序列的匹配位置 $(p_1, p_2, \dots, p_N)$
- **搜索方式**：IDA*
- **估价函数**：$h = \max_i (\text{len}_i - p_i)$
- **答案**：所有序列全部匹配完的最小深度

### 核心代码

```cpp
int h(int pos[]) {
    int mx = 0;
    for (int i = 0; i < n; i++)
        mx = max(mx, (int)seq[i].size() - pos[i]);
    return mx;
}
bool dfs(int pos[], int depth, int maxDepth) {
    int hv = h(pos);
    if (hv == 0) return true;
    if (depth + hv > maxDepth) return false;
    for (char c : "ACGT") {
        int npos[N];
        bool useful = false;
        for (int i = 0; i < n; i++) {
            npos[i] = pos[i];
            if (pos[i] < seq[i].size() && seq[i][pos[i]] == c)
                { npos[i]++; useful = true; }
        }
        if (useful && dfs(npos, depth + 1, maxDepth)) return true;
    }
    return false;
}
```

### 复杂度

IDA*，实际搜索空间较小。

---

## 33 - HDU 3152 Obstacle Course（BFS / 最短路）

### 题意

$N \times N$ 网格，每格有代价 $c_{ij}$。从第一行某格走到最后一行某格（四方向移动），总代价为经过格子代价之和（含起终点）。求最小代价。

### 分析

经典带权网格最短路。Dijkstra 或 BFS + 优先队列。起点为第一行所有格子，终点为最后一行所有格子。

### 搜索策略

- **状态**：$(r, c)$
- **搜索方式**：Dijkstra / 优先队列 BFS
- **初始化**：第一行所有格子入队，$\text{dist} = c_{0,j}$
- **答案**：最后一行中 $\text{dist}$ 的最小值

### 核心代码

```cpp
priority_queue<tuple<int,int,int>, vector<...>, greater<>> pq;
for (int j = 0; j < n; j++) {
    dist[0][j] = grid[0][j];
    pq.push({dist[0][j], 0, j});
}
while (!pq.empty()) {
    auto [d, r, c] = pq.top(); pq.pop();
    if (d > dist[r][c]) continue;
    for (4 dirs) {
        int nd = d + grid[nr][nc];
        if (nd < dist[nr][nc]) {
            dist[nr][nc] = nd;
            pq.push({nd, nr, nc});
        }
    }
}
int ans = *min_element(dist[n-1], dist[n-1] + n);
```

### 复杂度

$O(N^2 \log N)$。

---

# 总结

## 知识点全景图

| 类别 | 题目 | 核心技术 |
|------|------|----------|
| **DFS 回溯** | 1, 3, 4, 8, 9 | 排列/组合枚举、N 皇后、回溯模板 |
| **DFS + 剪枝** | 2, 7, 20 | 奇偶剪枝、转弯限制、等长拼接剪枝 |
| **Flood Fill** | 5, 6 | 连通分量计数、八方向扩展 |
| **BFS 基础** | 11, 12, 13, 14 | 三维 BFS、状态空间 BFS |
| **BFS + 状压** | 15 | 钥匙门模型 |
| **BFS 进阶** | 16, 17, 21, 22, 30 | 转弯计数、双向 BFS、时间状态 |
| **枚举搜索** | 10 | 全排列暴力验证 |
| **记忆化搜索** | 23, 24, 25, 26, 27 | 网格 DP、DAG 路径计数、区间回文 |
| **搜索 + 预处理** | 19 | BFS 预计算两两距离 |
| **八数码 / A*** | 28, 29 | Cantor 编码、曼哈顿启发函数 |
| **IDA*** | 31, 32 | 迭代加深 A*、估价函数设计 |
| **最短路搜索** | 33 | Dijkstra / 优先队列 BFS |

## 学习路线建议

```
入门：5 → 6 → 1 → 3 → 8
       ↓
DFS 剪枝：2 → 7 → 20 → 4
       ↓
BFS 基础：11 → 12 → 13 → 14
       ↓
BFS 进阶：15 → 16 → 17 → 21 → 22
       ↓
记忆化搜索：23 → 24 → 25 → 26 → 27
       ↓
综合搜索：19 → 30 → 33
       ↓
八数码 / A* / IDA*：28 → 29 → 31 → 32
```

## 解题方法论

1. **判断搜索类型**：连通性/路径计数 → DFS；最短路/最少步 → BFS；重叠子问题 → 记忆化搜索。
2. **状态设计**：明确搜索状态的维度。钥匙/开关 → 状压；三维空间 → 三维坐标；时间相关 → $(r,c,t)$。
3. **剪枝是关键**：
   - 奇偶剪枝（HDU 1010）
   - 跳过相同长度（HDU 1455）
   - 转弯限制（HDU 1175）
   - 估价函数（A*/IDA*）
4. **预处理加速**：BFS 预算两两距离后再 DP/枚举（HDU 1044）；Dijkstra 预算后记忆化搜索（HDU 1428）。
5. **经典模型**：八数码 → Cantor 编码 + BFS/A*；超序列 → IDA*。

> 💡 **记住**：HDU 上的搜索题覆盖了从入门 Flood Fill 到高级 IDA* 的完整谱系。掌握 BFS/DFS 模板后，重点修炼**剪枝技巧**和**状态设计能力**，这是提升搜索效率的两大核心武器。
