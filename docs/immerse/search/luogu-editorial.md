---
title: "洛谷 搜索专题精选解题报告"
subtitle: "🔎 从回溯、双向搜索到 A* 与 DLX 的搜索主线"
order: 1
icon: "🔎"
---

# 洛谷 搜索专题精选解题报告

这一组题从 DFS 回溯一路走到双向 BFS、A*、迭代加深与 DLX，题型从棋盘、排列到覆盖问题都有，但核心始终是“搜索树怎么缩”。有的靠剪枝砍分支，有的靠估价函数改顺序，有的干脆把可行性压成精确覆盖，真正决定效率的是状态展开方式。

# 一、DFS 入门与基础搜索

先用最基础的网格和递归题把 DFS 手感建立起来，重点是“状态怎么定义、访问标记怎么写、什么时候需要回溯”。

## 1. [B3625 迷宫寻路](https://www.luogu.com.cn/problem/B3625)

`DFS` `网格搜索`

### 题意

给定一个 `n × m` 的迷宫，空地可以走、墙不能走，问从 `(1,1)` 能否到达 `(n,m)`。

### 分析

这是最基础的可达性问题。题目不要求最短路，只要求“能不能到”，所以直接 DFS 即可。

搜索状态就是当前位置 `(x,y)`。每次向四个方向扩展，碰到越界、墙或访问过的格子就停。只要有一条路能走到终点，就可以立刻返回。

### 核心代码

```cpp
const int dx[4] = {-1, 0, 1, 0};
const int dy[4] = {0, 1, 0, -1};
char g[105][105];
bool vis[105][105], ok;
int n, m;

void dfs(int x, int y) {
    if (x < 1 || x > n || y < 1 || y > m) return;
    if (g[x][y] == '#' || vis[x][y] || ok) return;
    if (x == n && y == m) { ok = true; return; }
    vis[x][y] = true;
    for (int k = 0; k < 4; k++) dfs(x + dx[k], y + dy[k]);
}
```

### 复杂度

最多访问每个格子一次，时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 2. [P1596 [USACO10OCT] Lake Counting S](https://www.luogu.com.cn/problem/P1596)

`DFS` `连通块`

### 题意

网格中 `W` 表示水、`.` 表示地，八个方向连通的水格算同一个水塘，求水塘数量。

### 分析

这是典型的 Flood Fill。枚举每个格子，遇到一个还没访问过的 `W`，就从这里 DFS，把整片联通的水都染掉，答案加一。

和普通迷宫题的差别只有一个：这题是 **八联通**，所以方向数组要开 8 个方向。

### 核心代码

```cpp
const int dx[8] = {-1,-1,-1,0,0,1,1,1};
const int dy[8] = {-1,0,1,-1,1,-1,0,1};
char g[105][105];
bool vis[105][105];
int n, m, ans;

void dfs(int x, int y) {
    if (x < 1 || x > n || y < 1 || y > m) return;
    if (g[x][y] != 'W' || vis[x][y]) return;
    vis[x][y] = true;
    for (int k = 0; k < 8; k++) dfs(x + dx[k], y + dy[k]);
}
```

### 复杂度

每个格子最多进 DFS 一次，时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 3. [P1644 跳马问题](https://www.luogu.com.cn/problem/P1644)

`DFS` `搜索计数`

### 题意

马从 `(0,0)` 出发跳到 `(m,n)`，并且只能向右跳，问一共有多少条路径。

### 分析

因为横坐标只能增大，所以状态不会回到过去，也就不会形成环。这种题很适合直接 DFS 枚举所有合法路径。

当前状态是 `(x,y)`，每次尝试四种“向右”的马步。若走到终点就计数加一；若越过边界就返回。

### 核心代码

```cpp
const int dx[4] = {1, 2, 2, 1};
const int dy[4] = {2, 1, -1, -2};
int m, n, ans;

void dfs(int x, int y) {
    if (x > m || y < 0 || y > n) return;
    if (x == m && y == n) { ans++; return; }
    for (int k = 0; k < 4; k++) dfs(x + dx[k], y + dy[k]);
}
```

### 复杂度

时间复杂度取决于搜索树大小，最坏为指数级；空间复杂度为递归深度。

---

## 4. [P1605 迷宫](https://www.luogu.com.cn/problem/P1605)

`DFS` `回溯`

### 题意

给定一个有障碍的迷宫，从起点走到终点，每个格子最多经过一次，问一共有多少种走法。

### 分析

和“迷宫寻路”相比，这题从“判存在”变成了“统计所有方案”，所以必须回溯。

走到一个格子时先标记已访问，往四个方向递归；递归回来后要取消标记，让别的路径还能使用这个格子。这就是回溯的标准写法。

### 核心代码

```cpp
const int dx[4] = {-1, 0, 1, 0};
const int dy[4] = {0, 1, 0, -1};
bool block[8][8], vis[8][8];
int n, m, sx, sy, tx, ty, ans;

void dfs(int x, int y) {
    if (x < 1 || x > n || y < 1 || y > m) return;
    if (block[x][y] || vis[x][y]) return;
    if (x == tx && y == ty) { ans++; return; }
    vis[x][y] = true;
    for (int k = 0; k < 4; k++) dfs(x + dx[k], y + dy[k]);
    vis[x][y] = false;
}
```

### 复杂度

时间复杂度取决于可行路径数量，最坏为指数级；空间复杂度为递归深度。

---

## 5. [P1219 [USACO1.5] 八皇后 Checker Challenge](https://www.luogu.com.cn/problem/P1219)

`DFS` `回溯` `八皇后`

### 题意

在 `n × n` 棋盘上放 `n` 个皇后，使得任意两个皇后都不在同一行、同一列或同一对角线上。输出前 3 个方案和总方案数。

### 分析

按行搜索最自然：第 `r` 行只需要决定放在哪一列。列冲突、主对角线冲突、副对角线冲突都可以用布尔数组维护，这样判断一个位置是否合法就是 `O(1)`。

如果按列从小到大枚举，那么天然得到字典序最小的方案，因此前 3 个答案也能直接按要求输出。

### 核心代码

```cpp
int n, pos[15], cnt;
bool col[15], diag1[30], diag2[30];
vector<vector<int>> out;

void dfs(int r) {
    if (r > n) {
        cnt++;
        if ((int)out.size() < 3) out.push_back(vector<int>(pos + 1, pos + n + 1));
        return;
    }
    for (int c = 1; c <= n; c++) {
        if (col[c] || diag1[r + c] || diag2[r - c + n]) continue;
        col[c] = diag1[r + c] = diag2[r - c + n] = true;
        pos[r] = c;
        dfs(r + 1);
        col[c] = diag1[r + c] = diag2[r - c + n] = false;
    }
}
```

### 复杂度

时间复杂度取决于搜索树大小，通常记为指数级；空间复杂度为 $O(n)$。

---

## 6. [P1019 [NOIP 2000 提高组] 单词接龙（疑似错题）](https://www.luogu.com.cn/problem/P1019)

`DFS` `字符串` `回溯`

### 题意

给定一组单词和一个起始字母，要求拼出最长的“龙”。两个单词相接时必须有合法重叠，每个单词最多使用两次。

### 分析

先预处理每两个单词之间的重叠长度 `ov[i][j]`。如果 `i` 可以接 `j`，就把它看成一条有向边。

之后从所有首字母符合要求的单词出发 DFS。搜索状态包括当前单词编号和每个单词已使用次数。每接上一个单词，答案长度增加 `|word[j]| - ov[i][j]`。

### 核心代码

```cpp
string w[25];
int n, ov[25][25], used[25], best;

void dfs(int u, int len) {
    best = max(best, len);
    for (int v = 1; v <= n; v++) {
        if (!ov[u][v] || used[v] == 2) continue;
        used[v]++;
        dfs(v, len + (int)w[v].size() - ov[u][v]);
        used[v]--;
    }
}
```

### 复杂度

时间复杂度取决于搜索树大小，最坏为指数级；空间复杂度为递归深度与状态数组。

---

# 二、BFS 与状态图搜索

这一组主要解决“最少步数”类问题。只要边权统一，就优先考虑 BFS。

## 7. [P1588 [USACO07OPEN] Catch That Cow S](https://www.luogu.com.cn/problem/P1588)

`BFS` `最短路`

### 题意

数轴上从位置 `x` 走到位置 `y`，每次可以走到 `x-1`、`x+1` 或 `2x`，求最少步数。

### 分析

这题最关键的一步，是把“人在数轴上走”翻译成状态图：每个位置就是一个点，三种操作 `-1`、`+1`、`*2` 就是从这个点出发的三条边。

一旦看成图，题目问的“最少多少步”就变成了无权图最短路。因为每走一步代价都相同，所以根本不需要 Dijkstra，按层扩展的 BFS 就已经保证：第一次到达某个位置时，用的步数一定最少。

所以这题很适合当搜索建模的第一题：**操作固定、每步代价相同的最少步数问题，优先把状态看成点，再直接上 BFS。**

### 核心代码

```cpp
queue<int> q;
int dist[200005];

void bfs(int s, int t, int limit) {
    fill(dist, dist + limit + 1, -1);
    dist[s] = 0;
    q.push(s);
    while (!q.empty()) {
        int x = q.front();
        q.pop();
        if (x == t) return;
        int nxt[3] = {x - 1, x + 1, x << 1};
        for (int y : nxt) {
            if (y < 0 || y > limit || dist[y] != -1) continue;
            dist[y] = dist[x] + 1;
            q.push(y);
        }
    }
}
```

### 复杂度

时间复杂度 $O(\text{状态数})$，空间复杂度 $O(\text{状态数})$。

---

## 8. [P1443 马的遍历](https://www.luogu.com.cn/problem/P1443)

`BFS` `棋盘最短路`

### 题意

给定棋盘大小和马的起点，求马到所有位置的最少步数。

### 分析

和上一题一样，真正该先完成的是“把题目翻成图”。棋盘上的每个格子是一个状态，马的八种跳法就是状态转移边。

题目不是问某一个终点，而是问起点到所有格子的最少步数，所以本质是单源无权最短路。BFS 从起点一层层往外推，谁先被访问到，谁的步数就已经固定，不会再被更优方案更新。

这题可以帮助建立一个更稳的判断：**棋盘最短步数题只要每步代价相同，就先别想搜索回溯，通常就是网格/棋盘版 BFS。**

### 核心代码

```cpp
const int dx[8] = {-2,-2,-1,-1,1,1,2,2};
const int dy[8] = {-1,1,-2,2,-2,2,-1,1};
int dist[405][405];
queue<pair<int, int>> q;

void bfs(int sx, int sy, int n, int m) {
    memset(dist, -1, sizeof dist);
    dist[sx][sy] = 0;
    q.push({sx, sy});
    while (!q.empty()) {
        auto [x, y] = q.front();
        q.pop();
        for (int k = 0; k < 8; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            if (nx < 1 || nx > n || ny < 1 || ny > m || dist[nx][ny] != -1) continue;
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
}
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 9. [P2730 [IOI 1996 / USACO3.2] 魔板 Magic Squares](https://www.luogu.com.cn/problem/P2730)

`BFS` `状态压缩`

### 题意

从初始魔板状态出发，通过操作 `A`、`B`、`C` 变换到目标状态，要求最短操作序列。

### 分析

这题表面像在玩魔板，实质上是一个很标准的**排列状态图最短路**。八个数字的排布就是状态，操作 `A/B/C` 则是固定的三种状态变换。

因为每做一次操作代价都一样，所以仍然是 BFS。和普通可达题不同的是，这里还要求输出操作序列，因此不能只记访问过没访问过，还要给每个状态记下“我是从哪个前驱状态、通过哪种操作转移来的”。

这样一旦第一次搜到目标状态，就不仅拿到了最短步数，还能沿前驱链从终点一路倒推回起点，恢复整条最短操作串。

### 核心代码

```cpp
queue<string> q;
unordered_map<string, pair<string, char>> pre;

string opA(string s);
string opB(string s);
string opC(string s);

void bfs(const string& target) {
    string st = "12348765";
    pre[st] = {"", '#'};
    q.push(st);
    while (!q.empty()) {
        string s = q.front();
        q.pop();
        if (s == target) return;
        vector<pair<string, char>> nxt = {{opA(s), 'A'}, {opB(s), 'B'}, {opC(s), 'C'}};
        for (auto [t, ch] : nxt) {
            if (pre.count(t)) continue;
            pre[t] = {s, ch};
            q.push(t);
        }
    }
}
```

### 复杂度

状态数有限，时间复杂度 $O(\text{状态数})$，空间复杂度 $O(\text{状态数})$。

---

## 10. [P1032 [NOIP 2002 提高组] 字串变换（疑似错题）](https://www.luogu.com.cn/problem/P1032)

`双向 BFS` `字符串`

### 题意

给定起始串、目标串和若干替换规则，要求在不超过 10 步内把起始串变成目标串，并输出最少步数。

### 分析

这题最大的麻烦不是单次替换，而是字符串状态分支太多：若从起点单向 BFS，层数还没到 `10`，状态就可能膨胀得很厉害。

既然起点和终点都明确，而且题目只问不超过 `10` 步内的最短变换次数，那么最自然的优化就是双向 BFS。两边各自只搜一半深度，中间一旦相遇，就把两段距离拼起来。

实现时还要注意一个细节：优先扩展当前队列较小的一端，这样能显著降低分支爆炸速度。以后看到“最短变换 + 起终点都给出 + 步数不大”的题，优先联想到双向搜索。

### 核心代码

```cpp
vector<string> A, B;
unordered_map<string, int> da, db;
queue<string> qa, qb;

int expand(queue<string>& q, unordered_map<string, int>& dist,
           unordered_map<string, int>& other,
           const vector<string>& from, const vector<string>& to) {
    int step = dist[q.front()];
    while (!q.empty() && dist[q.front()] == step) {
        string s = q.front();
        q.pop();
        for (int i = 0; i < (int)from.size(); i++) {
            for (size_t pos = s.find(from[i]); pos != string::npos; pos = s.find(from[i], pos + 1)) {
                string t = s.substr(0, pos) + to[i] + s.substr(pos + from[i].size());
                if (other.count(t)) return dist[s] + 1 + other[t];
                if (!dist.count(t) && dist[s] < 10) dist[t] = dist[s] + 1, q.push(t);
            }
        }
    }
    return 11;
}
```

### 复杂度

时间复杂度取决于搜索到的状态数，通常远小于单向 BFS；空间复杂度同样为状态数级别。

---

## 11. [P4667 [BalticOI 2011] Switch the Lamp On (Day1)](https://www.luogu.com.cn/problem/P4667)

`0-1 BFS` `最短路`

### 题意

一个 `n × m` 的网格中放着若干斜线元件，旋转一个元件代价为 `1`，不旋转代价为 `0`。问最少旋转多少次，才能让左上角与右下角连通。

### 分析

关键是换建图方式：把 **格点** 看成点，而不是格子。穿过某个小格对角线时，如果当前方向和斜线一致，代价为 `0`；否则需要旋转一次，代价为 `1`。

于是整题变成了边权只有 `0/1` 的最短路，直接上 0-1 BFS。

### 核心代码

```cpp
const int INF = 0x3f3f3f3f;
const int dx[4] = {-1, -1, 1, 1};
const int dy[4] = {-1, 1, 1, -1};
const int cx[4] = {-1, -1, 0, 0};
const int cy[4] = {-1, 0, 0, -1};
const char need[4] = {'\\', '/', '\\', '/'};
int dist[505][505];
deque<pair<int, int>> q;

void bfs01(int n, int m, vector<string>& g) {
    memset(dist, 0x3f, sizeof dist);
    dist[0][0] = 0;
    q.push_front({0, 0});
    while (!q.empty()) {
        auto [x, y] = q.front();
        q.pop_front();
        for (int k = 0; k < 4; k++) {
            int nx = x + dx[k], ny = y + dy[k];
            int px = x + cx[k], py = y + cy[k];
            if (nx < 0 || nx > n || ny < 0 || ny > m || px < 0 || px >= n || py < 0 || py >= m) continue;
            int w = g[px][py] == need[k] ? 0 : 1;
            if (dist[x][y] + w >= dist[nx][ny]) continue;
            dist[nx][ny] = dist[x][y] + w;
            if (w == 0) q.push_front({nx, ny});
            else q.push_back({nx, ny});
        }
    }
}
```

### 复杂度

时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---

## 12. [P2578 [ZJOI2005] 九数码游戏](https://www.luogu.com.cn/problem/P2578)

`BFS` `康托展开` `状态压缩`

### 题意

给定一个九宫格状态，通过固定操作把它变到目标状态，要求最少步数；若无法达到则输出无解。

### 分析

九数码这类题第一反应应该先估状态数。九个位置的排列总数是 `9! = 362880`，这个量级已经足够让 BFS 在状态图上直接跑。

真正的实现关键不在搜索本身，而在判重。若直接拿字符串或数组做哈希，当然也能写；但排列状态有一个非常经典的压缩方式，就是康托展开，把每个排列唯一映射到 `0..9!-1` 之间的整数。

这样队列里存编号，访问数组、距离数组、前驱数组都能直接开定长数组，判重和回溯都会很顺。也就是说，这题的核心迁移点是：**排列状态空间不大时，常可先编号，再在编号图上 BFS。**

### 核心代码

```cpp
int dist[362880];
pair<int, char> pre[362880];
queue<int> q;

int cantor(const array<int, 9>& a);
array<int, 9> decode(int code);
vector<pair<array<int, 9>, char>> expand(const array<int, 9>& a);

void bfs(int st, int ed) {
    fill(dist, dist + 362880, -1);
    dist[st] = 0;
    q.push(st);
    while (!q.empty()) {
        int code = q.front();
        q.pop();
        if (code == ed) return;
        auto cur = decode(code);
        for (auto [nxt_state, op] : expand(cur)) {
            int nxt = cantor(nxt_state);
            if (dist[nxt] != -1) continue;
            dist[nxt] = dist[code] + 1;
            pre[nxt] = {code, op};
            q.push(nxt);
        }
    }
}
```

### 复杂度

时间复杂度 $O(9!)$ 量级，空间复杂度 $O(9!)$。

---

# 三、启发式搜索与迭代加深

这一组的特点是：普通 BFS / DFS 可以做，但状态空间偏大，需要借助估价函数或逐层加深来压搜索树。

## 13. [P1379 八数码难题](https://www.luogu.com.cn/problem/P1379)

`A*` `八数码`

### 题意

在 `3 × 3` 棋盘上移动空格，把初始状态变成目标状态 `123804765`，求最少步数。

### 分析

八数码最经典的写法就是 A*。设 `g` 为已经走的步数，`h` 为当前状态到目标状态的曼哈顿距离总和，那么 `f = g + h` 就是一个合法估价。

由于曼哈顿距离不会高估真实剩余步数，所以目标状态第一次从优先队列里弹出时，答案就是最优解。

### 核心代码

```cpp
string goal = "123804765";
unordered_map<string, int> dist;

int h(const string& s) {
    int res = 0;
    for (int i = 0; i < 9; i++) if (s[i] != '0') {
        int v = s[i] - '0';
        int p = goal.find(s[i]);
        res += abs(i / 3 - p / 3) + abs(i % 3 - p % 3);
    }
    return res;
}

struct Node {
    string s;
    int g, f;
    bool operator<(const Node& t) const { return f > t.f; }
};

priority_queue<Node> pq;
```

### 复杂度

时间复杂度取决于实际扩展状态数，通常远优于普通 BFS；空间复杂度为已访问状态数。

---

## 14. [UVA529 Addition Chains](https://www.luogu.com.cn/problem/UVA529)

`IDDFS` `剪枝`

### 题意

给定整数 `n`，构造一个最短加成序列：每一项都等于前面两项之和，最后一项是 `n`。

### 分析

答案长度通常不大，但事先不知道是多少，因此适合用迭代加深 DFS。先假设答案深度为 `1`，不行就试 `2`，再试 `3`，直到找到第一组可行解。

剪枝关键在于下界：如果当前最大值即使每一步都翻倍，也不可能在剩余层数内达到 `n`，那这条分支就没必要继续搜。

### 核心代码

```cpp
int n, dep, a[25];

bool dfs(int u) {
    if (u > dep) return a[dep] == n;
    if ((a[u - 1] << (dep - u + 1)) < n) return false;
    unordered_set<int> used;
    for (int i = u - 1; i >= 1; i--) {
        for (int j = i; j >= 1; j--) {
            int nxt = a[i] + a[j];
            if (nxt > n || nxt <= a[u - 1] || used.count(nxt)) continue;
            used.insert(nxt);
            a[u] = nxt;
            if (dfs(u + 1)) return true;
        }
    }
    return false;
}
```

### 复杂度

时间复杂度取决于搜索树大小；空间复杂度为递归深度。

---

## 15. [U420877 【模板_A*第k短路】日期Remmarguts' Date](https://www.luogu.com.cn/problem/U420877)

`A*` `第 k 短路`

### 题意

给定一个带正权的有向图，求从 `S` 到 `T` 的第 `k` 短路径。路径可以重复经过结点。

### 分析

这题的标准做法是“反图最短路 + A*”。先在反图上以终点为源跑最短路，得到 `h[u] = u 到 T 的最短距离`，这就是 A* 的估价函数。

然后从起点开始做 A*。由于允许重复经过结点，所以不需要额外记录整条路径，只要在终点第 `k` 次出堆时输出对应的 `g` 即可。

### 核心代码

```cpp
struct Edge { int to, w; };
vector<Edge> g[N], rg[N];
long long h[N];

struct Node {
    int u;
    long long g, f;
    bool operator<(const Node& t) const { return f > t.f; }
};

int kth_path(int s, int t, int k) {
    if (s == t) k++;
    priority_queue<Node> pq;
    pq.push({s, 0, h[s]});
    int cnt = 0;
    while (!pq.empty()) {
        auto cur = pq.top();
        pq.pop();
        if (cur.u == t && ++cnt == k) return (int)cur.g;
        for (auto e : g[cur.u]) pq.push({e.to, cur.g + e.w, cur.g + e.w + h[e.to]});
    }
    return -1;
}
```

### 复杂度

预处理最短路复杂度为 $O(m \log n)$，A* 复杂度取决于实际扩展状态数。

---

## 16. [P4467 [SCOI2007] k短路](https://www.luogu.com.cn/problem/P4467)

`A*` `简单路` `字典序`

### 题意

给定有向图，要求输出从 `a` 到 `b` 的第 `k` 短**简单路**。如果长度相同，则按路径字典序最小输出。

### 分析

和允许重复点的第 `k` 短路相比，这题多了两个限制：**必须是简单路**，以及**同长度要比较字典序**。

因此 A* 队列中的状态不能只存当前点和距离，还要存整条路径，甚至要带一个访问标记避免重复走点。队列排序规则是：先按 `g + h`，再按路径字典序。

### 核心代码

```cpp
struct State {
    vector<int> path;
    int u;
    long long g, f;
    bool operator<(const State& t) const {
        if (f != t.f) return f > t.f;
        return path > t.path;
    }
};

priority_queue<State> pq;

void astar(int s, int t, int k) {
    pq.push({{s}, s, 0, h[s]});
    while (!pq.empty()) {
        auto cur = pq.top();
        pq.pop();
        if (cur.u == t && --k == 0) return;
        vector<char> used(n + 1, 0);
        for (int x : cur.path) used[x] = 1;
        for (auto e : g[cur.u]) {
            if (used[e.to]) continue;
            auto nxt = cur.path;
            nxt.push_back(e.to);
            pq.push({nxt, e.to, cur.g + e.w, cur.g + e.w + h[e.to]});
        }
    }
}
```

### 复杂度

时间复杂度取决于搜索到的路径状态数；空间复杂度同样与状态数相关。

---

## 17. [P1731 [NOI1999] 生日蛋糕](https://www.luogu.com.cn/problem/P1731)

`DFS` `最优性剪枝`

### 题意

做一个体积为 `Nπ` 的 `M` 层生日蛋糕，每层都是圆柱，半径和高度严格递减，要求总表面积最小。

### 分析

这题是典型的“回溯 + 下界剪枝”。直接搜每层半径和高度会爆炸，所以一定要设计剪枝：

1. 预处理前 `i` 层的最小体积 `minv[i]`；
2. 预处理前 `i` 层的最小侧面积 `mins[i]`；
3. 如果当前面积加上下界已经不可能优于最优解，就提前返回。

### 核心代码

```cpp
int n, m, best = 1e9, minv[25], mins[25];

void dfs(int dep, int lastR, int lastH, int restV, int area) {
    if (!dep) {
        if (!restV) best = min(best, area);
        return;
    }
    if (restV < minv[dep] || area + mins[dep] >= best) return;
    if (area + 2 * restV / lastR >= best) return;
    for (int r = min(lastR - 1, (int)sqrt(restV)); r >= dep; r--) {
        for (int h = min(lastH - 1, restV / (r * r)); h >= dep; h--) {
            int add = 2 * r * h + (dep == m ? r * r : 0);
            dfs(dep - 1, r, h, restV - r * r * h, area + add);
        }
    }
}
```

### 复杂度

时间复杂度取决于剪枝后的搜索树大小；空间复杂度为递归深度 $O(m)$。

---

## 18. [P1120 [CERC 1995] 小木棍](https://www.luogu.com.cn/problem/P1120)

`DFS` `剪枝`

### 题意

给定若干小木棍碎片，要求把它们拼成若干根等长木棍，求原木棍的最小可能长度。

### 分析

外层枚举目标长度 `len`，内层 DFS 检查能否拼出。此题的重点在剪枝：

1. 先把所有碎片按长度降序排序；
2. 同层遇到相同长度的碎片只试一次；
3. 如果当前木棍第一段就失败，或者正好拼满时失败，可以直接返回。

这些剪枝几乎是此题能否过掉的关键。

### 核心代码

```cpp
int n, sum, len, a[70];
bool used[70];

bool dfs(int done, int cur, int start) {
    if (done * len == sum) return true;
    if (cur == len) return dfs(done + 1, 0, 1);
    int last = -1;
    for (int i = start; i <= n; i++) {
        if (used[i] || cur + a[i] > len || a[i] == last) continue;
        used[i] = true;
        if (dfs(done, cur + a[i], i + 1)) return true;
        used[i] = false;
        last = a[i];
        if (!cur || cur + a[i] == len) return false;
    }
    return false;
}
```

### 复杂度

时间复杂度取决于枚举目标长度和 DFS 搜索树大小；空间复杂度为状态数组与递归深度。

---

# 四、模板化搜索与精确覆盖

这一组已经不再是朴素 DFS / BFS，而是把问题改写成“精确覆盖”，然后用 DLX 统一求解。

## 19. [P4929 【模板】舞蹈链（DLX）](https://www.luogu.com.cn/problem/P4929)

`DLX` `精确覆盖`

### 题意

给定一个 `0/1` 矩阵，要求选择若干行，使每一列恰好被覆盖一次。

### 分析

DLX 最难的不是代码细节，而是先理解“精确覆盖”这个模型：我们要选若干行，使每一列**恰好**被覆盖一次。于是问题的核心不再是普通 DFS，而是怎样高效地做“选一行后删掉冲突列，再回溯恢复”。

舞蹈链的作用就是把矩阵里的 `1` 用十字双向链表串起来。这样删除一列、删除与之冲突的若干行，以及之后的恢复操作，都能用局部改指针完成，不需要真的重建整张矩阵。

搜索时还要配合一个关键贪心：优先选当前 `1` 最少的列。因为这等于优先处理限制最强的位置，能让分支数尽量小。这才是 DLX 真正常数优秀的原因。

### 核心代码

```cpp
int L[M], R[M], U[N], D[N], row[N], col[N], sz[M];
int ans[505];

void remove(int c) {
    L[R[c]] = L[c], R[L[c]] = R[c];
    for (int i = D[c]; i != c; i = D[i])
        for (int j = R[i]; j != i; j = R[j])
            U[D[j]] = U[j], D[U[j]] = D[j], sz[col[j]]--;
}

void resume(int c) {
    for (int i = U[c]; i != c; i = U[i])
        for (int j = L[i]; j != i; j = L[j])
            sz[col[j]]++, U[D[j]] = D[U[j]] = j;
    L[R[c]] = R[L[c]] = c;
}

bool dance(int dep) {
    if (!R[0]) return true;
    int c = R[0];
    for (int j = R[0]; j; j = R[j]) if (sz[j] < sz[c]) c = j;
    remove(c);
    for (int i = D[c]; i != c; i = D[i]) {
        ans[dep] = row[i];
        for (int j = R[i]; j != i; j = R[j]) remove(col[j]);
        if (dance(dep + 1)) return true;
        for (int j = L[i]; j != i; j = L[j]) resume(col[j]);
    }
    resume(c);
    return false;
}
```

### 复杂度

时间复杂度取决于搜索树大小；空间复杂度为矩阵中 `1` 的数量。

---

## 20. [P1784 数独](https://www.luogu.com.cn/problem/P1784)

`DLX` `数独`

### 题意

解一个标准 `9 × 9` 数独，要求每行、每列、每个 `3 × 3` 宫都恰好填入 `1..9`。

### 分析

把每个候选填法 `(r, c, v)` 看成一行。它会对应四个约束：

1. 这个格子只能填一个数；
2. 第 `r` 行数字 `v` 只能出现一次；
3. 第 `c` 列数字 `v` 只能出现一次；
4. 所在宫里数字 `v` 只能出现一次。

这样整题就变成了精确覆盖，直接套 DLX 模板即可。

### 核心代码

```cpp
int id(int r, int c, int v) { return (r - 1) * 81 + (c - 1) * 9 + v; }

void add_row(int r, int c, int v) {
    int box = (r - 1) / 3 * 3 + (c - 1) / 3 + 1;
    int rid = id(r, c, v);
    link(rid, (r - 1) * 9 + c);
    link(rid, 81 + (r - 1) * 9 + v);
    link(rid, 162 + (c - 1) * 9 + v);
    link(rid, 243 + (box - 1) * 9 + v);
}
```

### 复杂度

时间复杂度取决于搜索树大小；空间复杂度为候选数对应的矩阵规模。

---

## 21. [SP1110 SUDOKU - Sudoku](https://www.luogu.com.cn/problem/SP1110)

`DLX` `16×16 数独`

### 题意

解一个 `16 × 16` 数独，使用 `A` 到 `P` 这 16 个符号，每行、每列、每个 `4 × 4` 宫都不能重复。

### 分析

这题最值得强调的不是“16×16 比 9×9 更大”，而是**模型完全没变**。无论是普通数独还是 16 进制数独，本质都还是四类约束：每格一个数、每行每个数一次、每列每个数一次、每宫每个数一次。

因此一旦已经接受“数独 = 精确覆盖”，规模放大并不会改变解法，只会让候选数和约束列数跟着扩展。DLX 在这里的优势正好体现出来：约束结构稳定，代码框架几乎原样复用。

所以这题可以帮助读者建立一个更强的泛化意识：**DLX 不是只会解 9×9 数独，而是会解一整类‘候选填法 + 若干恰好一次约束’的问题。**

### 核心代码

```cpp
int id(int r, int c, int v) { return (r - 1) * 256 + (c - 1) * 16 + v; }

void add_row(int r, int c, int v) {
    int box = (r - 1) / 4 * 4 + (c - 1) / 4 + 1;
    int rid = id(r, c, v);
    link(rid, (r - 1) * 16 + c);
    link(rid, 256 + (r - 1) * 16 + v);
    link(rid, 512 + (c - 1) * 16 + v);
    link(rid, 768 + (box - 1) * 16 + v);
}
```

### 复杂度

时间复杂度取决于搜索树大小；空间复杂度为候选矩阵大小。

---

## 22. [P4205 [NOI2005] 智慧珠游戏](https://www.luogu.com.cn/problem/P4205)

`DLX` `拼板`

### 题意

给定一个三角形拼盘和 12 个允许旋转、翻转的零件，要求找出一种合法摆放方案，使所有零件刚好拼满棋盘。

### 分析

这类题最适合转成精确覆盖：

1. 每个零件必须恰好使用一次；
2. 拼盘上的每个位置必须恰好被覆盖一次。

于是“某个零件的一种摆放方式”就是矩阵中的一行，“零件约束 + 格子约束”就是列。把所有合法摆法预处理出来，再交给 DLX 搜索。

### 核心代码

```cpp
struct Shape { vector<pair<int, int>> cell; };
vector<Shape> trans[13];

void build() {
    for (int id = 1; id <= 12; id++) {
        for (auto& sh : trans[id]) {
            for (auto [x, y] : anchor) {
                auto cells = place(sh, x, y);
                if (!inside(cells) || !fits_board(cells)) continue;
                int rid = new_row(id, x, y);
                link(rid, piece_col(id));
                for (auto [r, c] : cells) link(rid, board_col(r, c));
            }
        }
    }
}
```

### 复杂度

时间复杂度取决于合法摆法数量和搜索树大小；空间复杂度为精确覆盖矩阵规模。

---

# 五、综合剪枝与高阶回溯

最后几题不只是“会搜索”，而是要求把搜索顺序和剪枝做到位，否则很难通过。

## 23. [P1074 [NOIP 2009 提高组] 靶形数独](https://www.luogu.com.cn/problem/P1074)

`DFS` `位运算` `最少候选优先`

### 题意

在普通数独的规则基础上，每个格子还有一个权值。要求填出一个合法数独，并让总得分最大。

### 分析

如果只求“有没有解”，DLX 也可以做；但这题要的是**最大得分**，更适合写位运算 DFS。

用三个位集维护每一行、每一列、每一宫还能填哪些数字；每次优先选择候选数最少的空格展开，这样分支最少。填入一个数后更新位集和当前得分，回溯时再恢复。

### 核心代码

```cpp
int row[9], col[9], box[9], a[9][9], w[9][9], best = -1;

void dfs(int rest, int score) {
    if (!rest) { best = max(best, score); return; }
    int x = -1, y = -1, cand = 0, cnt = 10;
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) if (!a[i][j]) {
            int s = row[i] & col[j] & box[i / 3 * 3 + j / 3];
            if (__builtin_popcount(s) < cnt) cnt = __builtin_popcount(s), x = i, y = j, cand = s;
        }
    }
    while (cand) {
        int bit = cand & -cand;
        cand -= bit;
        int v = __builtin_ctz(bit) + 1;
        a[x][y] = v;
        row[x] ^= bit; col[y] ^= bit; box[x / 3 * 3 + y / 3] ^= bit;
        dfs(rest - 1, score + v * w[x][y]);
        row[x] ^= bit; col[y] ^= bit; box[x / 3 * 3 + y / 3] ^= bit;
        a[x][y] = 0;
    }
}
```

### 复杂度

时间复杂度取决于剪枝后的搜索树大小；空间复杂度为递归深度与状态数组。
