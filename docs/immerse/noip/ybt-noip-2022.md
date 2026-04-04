---
title: "一本通 2022赛题解题报告"
subtitle: "🏁 从基础模拟、表达式解析到图论、构造与区间维护"
order: 23
icon: "2022"
---

# 一本通 2022赛题解题报告

这一组赛题把 2022 年从 CSP-J、CSP-S 到 NOIP 的节奏完整铺开：前半段先用模拟、数论、表达式解析和状态 DP 把建模手感练扎实，后半段再把图论、区间博弈、构造、计数与高级数据结构层层推高。阅读时最值得抓住的一条主线，是如何把题面里的限制翻译成“可维护的状态”——小题要敢于直接卡上界，大题则要先把结构压缩，再把选择空间降到常数级或对数级。

# 一、CSP-J 赛题

CSP-J 更像是在考“能不能把题目翻成程序”。这四道题分别对应卡界、方程还原、递归下降和带费用的二维 DP，方法都不算重，但每一步建模都要求很稳。
## 1. [【22CSPJ普及组】乘方(pow)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2086)

`CSP 2022` `CSP-J`

### 题意
给定正整数 $a,b$，要求输出 $a^b$。但题目并不关心真正的大整数结果，而是把阈值卡在 $10^9$：如果幂值超过这个上界，就直接输出 $-1$。
### 分析
这题最容易掉进的坑，是把它当成“普通快速幂模板题”。实际上题目要练的是“上界意识”：我们根本不需要算出完整的大整数，只要在乘法过程中一旦确认结果已经超过 $10^9$，后面的值就没有继续维护的意义了。
因此做法可以写成带封顶的快速幂。每次准备做乘法前，先判断是否会超过上界；一旦超过，就直接返回 $-1$。这样既保留了快速幂的 $O(\log b)$ 结构，也把溢出风险提前消掉了。和直接循环乘 $b$ 次相比，这种写法更稳，因为 $b$ 可能很大，而真正有用的信息只有“是否越界”。
### 核心代码
```cpp
long long pow_cap(long long a, long long b){
  const long long LIM = 1000000000;
  long long ans = 1;
  while(b){
    if(b & 1){
      if(a && ans > LIM / a) return -1;
      ans *= a;
      if(ans > LIM) return -1;
    }
    b >>= 1;
    if(!b) break;
    if(a && a > LIM / a) a = LIM + 1;
    else a *= a;
    if(a > LIM) a = LIM + 1;
  }
  return ans > LIM ? -1 : ans;
}
```
### 复杂度
时间复杂度 $O(\log b)$，空间复杂度 $O(1)$。

---
## 2. [【22CSPJ普及组】解密(decode)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2087)

`CSP 2022` `CSP-J`

### 题意
每次给出 $n,d,e$，要求找出两个正整数 $p,q$，满足 $n=pq$ 且 $ed=(p-1)(q-1)+1$。如果不存在这样的整数解，就输出 `NO`；如果存在，还要保证输出时 $p \le q$。
### 分析
这题的关键不是分解 $n$，而是先把第二个式子化开：$ed=pq-p-q+2=n-p-q+2$，所以可以直接得到 $p+q=n-ed+2$。这样一来，未知量就从“两个乘积条件”变成了“已知和与积求两根”，也就是标准的一元二次方程。
设 $s=p+q$，那么 $p,q$ 就是方程 $x^2-sx+n=0$ 的两根。于是只需要检查判别式 $\Delta=s^2-4n$ 是否是非负完全平方数，再判断 $(s-\sqrt{\Delta})$ 是否为偶数。最后把根代回去验证一次，就能把无解情况全部筛掉。整个过程是 $O(1)$，这才是这题真正想让人看到的“代数还原”。
### 核心代码
```cpp
bool solve(long long n, long long e, long long d, long long &p, long long &q){
  long long s = n - e * d + 2;
  long long delta = s * s - 4 * n;
  if(delta < 0) return false;
  long long r = sqrtl(delta);
  if(r * r != delta || ((s - r) & 1)) return false;
  p = (s - r) / 2;
  q = (s + r) / 2;
  return p > 0 && q > 0 && p * q == n;
}
```
### 复杂度
时间复杂度 $O(1)$，空间复杂度 $O(1)$。

---
## 3. [【22CSPJ普及组】逻辑表达式(expr)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2088)

`CSP 2022` `CSP-J`

### 题意
给一个只包含 `0`、`1`、`&`、`|` 和括号的逻辑表达式。运算优先级是 `&` 高于 `|`，同级从左到右。除了求整个表达式的值，还要统计真正发生了多少次 `a&b` 型短路和 `a|b` 型短路。
### 分析
题目难点不在优先级，而在“被外层短路包住的内层短路不计数”。这意味着我们不能只建表达式树后机械统计，而要把“这一段会不会真的被执行”也一起传下去。最自然的写法就是递归下降：按“或表达式—与表达式—原子”三层语法解析，同时给每层函数带一个 `live` 标记，表示当前子表达式是否真的需要求值。
当解析到 `x&y` 时，如果左边已经是 $0$ 且这段表达式处在 `live=true` 的上下文里，那么这里产生一次 `&` 短路，右边虽然仍要被解析过去以便吃掉字符，但要用 `live=false` 进入，这样右子树内部的短路就不会被重复统计。`|` 完全同理。这样一趟扫描既处理了优先级，也保证“只统计真正执行到的最外层短路”。
### 核心代码
```cpp
int p, cntAnd, cntOr;
string s;
int parseOr(bool live);
int parseAtom(bool live){
  if(s[p] == '('){ ++p; int v = parseOr(live); ++p; return v; }
  int v = s[p++] - '0';
  return live ? v : 0;
}
int parseAnd(bool live){
  int lhs = parseAtom(live);
  while(p < (int)s.size() && s[p] == '&'){
    ++p;
    bool cut = live && lhs == 0;
    int rhs = parseAtom(live && !cut);
    if(cut) ++cntAnd;
    else lhs &= rhs;
  }
  return live ? lhs : 0;
}
int parseOr(bool live){
  int lhs = parseAnd(live);
  while(p < (int)s.size() && s[p] == '|'){
    ++p;
    bool cut = live && lhs == 1;
    int rhs = parseAnd(live && !cut);
    if(cut) ++cntOr;
    else lhs |= rhs;
  }
  return live ? lhs : 0;
}
```
### 复杂度
时间复杂度 $O(|s|)$，空间复杂度 $O(|s|)$，其中空间主要来自递归栈。

---
## 4. [【22CSPJ普及组】上升点列(point)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2089)

`CSP 2022` `CSP-J`

### 题意
平面上有 $n$ 个给定整点，还允许再补 $k$ 个整点。你需要从这些点里选出一个序列，使相邻两点只能向右走一步或向上走一步，并且整个序列的横纵坐标都不下降，求最大长度。
### 分析
把两个给定点 $(x_i,y_i)$ 和 $(x_j,y_j)$ 放到同一条上升链里，前提一定是 $x_i \le x_j$ 且 $y_i \le y_j$。如果能连，那么从前者走到后者总共要走 $(x_j-x_i)+(y_j-y_i)$ 步，其中首尾两个点已经给定，所以真正需要补的点数是这段曼哈顿距离减一。
于是问题就变成了一个“带费用的二维 LIS”。先按 $x$、$y$ 排序，设 $f_{i,c}$ 表示以第 $i$ 个给定点结尾、用了 $c$ 个补点时，最多能包含多少个原始点。若从 $j$ 转到 $i$ 需要花费 $w$ 个补点，就做 $f_{i,c} = \max(f_{i,c}, f_{j,c-w}+1)$。为什么答案最后可以写成“链上原始点数 $+$ $k$”？因为无论哪些补点被花在中间，剩下的补点总能直接接到链尾继续向右或向上延长，每多一个补点，序列长度就再加一。
### 核心代码
```cpp
sort(a + 1, a + n + 1);
memset(dp, -1, sizeof dp);
int best = 1;
for(int i = 1; i <= n; i++){
  for(int c = 0; c <= k; c++) dp[i][c] = 1;
  for(int j = 1; j < i; j++){
    if(a[j].x > a[i].x || a[j].y > a[i].y) continue;
    int w = a[i].x - a[j].x + a[i].y - a[j].y - 1;
    for(int c = w; c <= k; c++)
      dp[i][c] = max(dp[i][c], dp[j][c - w] + 1);
  }
  for(int c = 0; c <= k; c++) best = max(best, dp[i][c]);
}
cout << best + k << '\n';
```
### 复杂度
时间复杂度 $O(n^2k)$，空间复杂度 $O(nk)$。

---
# 二、CSP-S 赛题

CSP-S 开始之后，题面会明显转向“先抽结构，再做优化”。图上可达性、区间博弈、动态图维护、树上 DP、构造和历史信息线段树，都是先把原问题压成更小的核心对象，再在这个对象上做高效维护。
## 5. [【22CSPS提高组】假期计划(holiday)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2090)

`CSP 2022` `CSP-S`

### 题意
图上 $1$ 号点是家，其余点是景点。你要从家出发，依次游玩四个不同景点 $A,B,C,D$，最后回家，且每一段路都要求最多转车 $k$ 次，也就是路径长度至多为 $k+1$ 条边。目标是让四个景点分数之和最大。
### 分析
最直接的暴力会卡在四个景点的枚举上。先把“每段路是否合法”单独抽出来：因为图是无权图，所以从每个点做一次 BFS，就能知道任意两点间最短路是否不超过 $k+1$。这样原题就变成了在一个“可达关系图”上选 $1\to A\to B\to C\to D\to1$ 的最优链。
真正的优化点在中间两站 $B,C$。一旦固定了它们，$A$ 只需要满足“家能到 $A$，且 $A$ 能到 $B$”；$D$ 只需要满足“家能到 $D$，且 $C$ 能到 $D$”。因此可以为每个点预处理前三个最优候选前驱。为什么前三个就够？因为最终只会和 $B,C$ 以及另一个候选冲突，常数个备选就足以把重复点绕开。随后枚举 $(B,C)$，在两边候选里做常数次组合即可。
### 核心代码
```cpp
for(int s = 1; s <= n; s++) bfs(s);
for(int v = 2; v <= n; v++){
  for(int u = 2; u <= n; u++){
    if(u == v) continue;
    if(dist[1][u] <= k + 1 && dist[u][v] <= k + 1) upd(best[v], u);
  }
}
long long ans = 0;
for(int b = 2; b <= n; b++) for(int c = 2; c <= n; c++){
  if(b == c || dist[b][c] > k + 1) continue;
  for(int x : best[b]) for(int y : best[c]){
    if(x == y || x == b || x == c || y == b || y == c) continue;
    ans = max(ans, val[x] + val[b] + val[c] + val[y]);
  }
}
```
### 复杂度
时间复杂度 $O(n(n+m)+n^2)$，空间复杂度 $O(n^2)$。

---
## 6. [【22CSPS提高组】策略游戏(game)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2091)

`CSP 2022` `CSP-S`

### 题意
给定数组 $A,B$。每次询问先指定两个区间，小 L 先从 $A$ 的区间里选一个数，小 Q 再从 $B$ 的区间里选一个数，得分是两者乘积。小 L 想让得分尽量大，小 Q 想让得分尽量小，要求输出双方都最优时的结果。
### 分析
博弈的关键是“后手怎么压你”。如果小 L 先选了一个正数，那么小 Q 一定会在 $B$ 区间里挑最小值；如果小 L 选了一个负数，小 Q 一定会挑最大值。也就是说，对某个固定的 $a$，它能保证的分数只和 $B$ 区间的最小值、最大值有关。
接下来只剩符号分类。若 $B$ 全非负，正数应该配最小的 $B$，负数应该配最大的 $B$；若 $B$ 全非正，正数会被最负的值打击，负数反而应该去乘最接近零的负数；若 $B$ 跨过零，那么正数一定吃到负最小，负数一定吃到正最大，此时 $0$ 往往会变成极优选择。所以对 $A$ 区间只需维护：最大正数、最小正数、最靠近零的负数、最负的负数，以及是否存在 $0$。这些量都能用 ST 表或线段树做区间查询。
### 核心代码
```cpp
long long solve(InfoA a, InfoB b){
  long long ans = LLONG_MIN;
  if(b.mn >= 0){
    if(a.posMax != -INF) ans = max(ans, a.posMax * b.mn);
    if(a.negMax != -INF) ans = max(ans, a.negMax * b.mx);
  }else if(b.mx <= 0){
    if(a.posMin != INF) ans = max(ans, a.posMin * b.mn);
    if(a.negMin != INF) ans = max(ans, a.negMin * b.mx);
  }else{
    if(a.posMin != INF) ans = max(ans, a.posMin * b.mn);
    if(a.negMax != -INF) ans = max(ans, a.negMax * b.mx);
  }
  if(a.hasZero) ans = max(ans, 0LL);
  return ans;
}
```
### 复杂度
预处理时间复杂度 $O((n+m)\log(n+m))$，单次询问时间复杂度 $O(1)$，空间复杂度 $O((n+m)\log(n+m))$。

---
## 7. [【22CSPS提高组】星战(galaxy)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2092)

`CSP 2022` `CSP-S`

### 题意
初始给定一张有向图，之后会不断执行四种操作：删一条边、删某个点的全部入边、恢复一条边、恢复某个点的全部入边。每次操作后都要判断当前是否是“反攻时刻”，也就是所有点都能无限次穿梭，并且每个点恰好只有一条可用出边。
### 分析
这题最重要的一步，是先把题目条件彻底看穿：只要每个点当前的可用出度都等于 $1$，整张图就是一张函数图。函数图的每个点沿着出边一直走，有限步之后必然进入某个有向环，所以“可以无限穿梭”自动成立。于是判定条件实际上只剩一句话：每个点的可用出度都恰好是 $1$。
难点在于操作是按“某个点的全部入边”批量删改，没法逐条改出度。标准技巧是给每个源点分配一个随机权值 $w_u$。若一条边 $u\to v$ 当前可用，就把 $w_u$ 计入终点 $v$ 的桶里。这样所有桶的总和，等价于“每个源点的权值被当前可用出边统计了多少次”。如果每个源点恰好有一条可用出边，总和就等于全部权值之和；反之极大概率不相等。因为删点/修点都是把某个终点桶整体置零或整体恢复，所以四种操作都能做到 $O(1)$ 维护。
### 核心代码
```cpp
using ull = unsigned long long;
ull w[N], fullIn[N], curIn[N], totalHash, curHash;
void delEdge(int u, int v){
  curIn[v] -= w[u];
  curHash -= w[u];
}
void addEdge(int u, int v){
  curIn[v] += w[u];
  curHash += w[u];
}
void destroyNode(int v){
  curHash -= curIn[v];
  curIn[v] = 0;
}
void repairNode(int v){
  curHash += fullIn[v] - curIn[v];
  curIn[v] = fullIn[v];
}
bool ok(){
  return curHash == totalHash;
}
```
### 复杂度
预处理时间复杂度 $O(n+m)$，单次操作时间复杂度 $O(1)$，空间复杂度 $O(n+m)$。

---
## 8. [【22CSPS提高组】数据传输(transmit)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2093)

`CSP 2022` `CSP-S`

### 题意
给一棵带点权的树。一次“直接传输”允许跨过不超过 $k$ 条边，其中 $k \le 3$。每次询问给出 $s,t$，要求把信息从 $s$ 传到 $t$ 的最小总代价，代价是整条传输链上所有经过主机的点权之和。
### 分析
如果把一次直接传输看成“从当前点跳到距离不超过 $k$ 的下一个点”，这其实是一个树上最短路问题。但 $k$ 只有 $1,2,3$，所以状态维度是常数，可以专门按 $k$ 做路径 DP。$k=1$ 时答案就是普通路径和；$k=2$ 时最优点集一定仍落在 $s$ 到 $t$ 的简单路径上，状态是“走到链上当前位置时，前一个被选点离我有多远”；$k=3$ 时才会出现绕到路径旁边一个便宜儿子的情况，因此要多维护一个“借用路径外最小权邻点”的状态。
真正让它过大数据的办法，是把这套常数维 DP 写成 min-plus 矩阵转移。树链剖分后，每条重链上的点都对应一个小矩阵，矩阵相乘就等价于把一段路径的 DP 一次性合并。查询 $s,t$ 时先拆成若干条链段，再按经过顺序把这些矩阵乘起来。因为状态数最多只有 $3$，矩阵很小，但路径合并从线性降到了对数级。
### 核心代码
```cpp
struct Mat{
  long long a[3][3];
  Mat(){ memset(a, 0x3f, sizeof a); }
};
Mat operator*(const Mat& x, const Mat& y){
  Mat z;
  for(int i = 0; i < S; i++)
    for(int k = 0; k < S; k++)
      for(int j = 0; j < S; j++)
        z.a[i][j] = min(z.a[i][j], x.a[i][k] + y.a[k][j]);
  return z;
}
Mat trans(int u){
  Mat t;
  if(k == 1) t.a[0][0] = val[u];
  if(k == 2) t.a[0][0] = val[u], t.a[1][0] = val[u], t.a[0][1] = 0;
  if(k == 3) t.a[0][0] = val[u], t.a[1][0] = val[u], t.a[2][1] = 0, t.a[0][2] = mnSon[u], t.a[1][2] = mnSon[u];
  return t;
}
long long query(int s, int t){
  int l = lca(s, t);
  Mat left = climb(s, l), right = climb_rev(t, l);
  Mat all = left * trans(l) * right;
  return all.a[0][0];
}
```
### 复杂度
预处理时间复杂度 $O(n\log n)$，单次询问时间复杂度 $O(\log n)$，空间复杂度 $O(n\log n)$。

---

# 三、NOIP 赛题

这一章开始是 2022 年的 NOIP 提高组赛题。和前面的 CSP 相比，这几题更强调把抽象出来的模型继续往前推：有的题要把奇偶结构拆成可贪心的两部分，有的题要围绕“第一次失误”反向计数，有的题要抓住树上唯一传递链或把任意长度范围拆成少量可预处理的块。

## 9. [【22NOIP提高组】种花(plant)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2094)

`NOIP 2022` `NOIP 提高组`

### 题意
给定一个由可种位置与土坑组成的网格。需要统计两类图案方案数：`C` 形和 `F` 形。设它们的方案数分别为 $V_C,V_F$，输出 $(cV_C)\bmod 998244353$ 和 $(fV_F)\bmod 998244353$。
### 分析
这类图案计数题的第一步，是把“某个拐角能向右延伸多长、向下延伸多长”先预处理出来。设 $right_{i,j}$ 表示从 $(i,j)$ 往右连续空格数，$down_{i,j}$ 表示往下连续空格数。一个 `C` 形实际上就是：确定左上拐点后，挑一条下方横杠；一个 `F` 形则是在此基础上，再为中间横杠下面额外选择一段竖尾。
于是统计时可以固定左上拐点 $(i,j)$。它对答案的贡献只和同一列中更下面的那些“可作为第二条横杠起点的格子”有关，而且每个候选格子只需要知道它向右能延多少、向下还能继续多少。这样就能对每一列自底向上做前缀和：一份累计 $(right-1)$ 用来数 `C`，另一份累计 $(right-1)(down-1)$ 用来数 `F`。原本看起来像三重枚举的图案统计，就被压成了 $O(nm)$。
### 核心代码
```cpp
for(int i = 1; i <= n; i++) for(int j = m; j >= 1; j--)
  right[i][j] = a[i][j] ? 0 : right[i][j + 1] + 1;
for(int i = n; i >= 1; i--) for(int j = 1; j <= m; j++)
  down[i][j] = a[i][j] ? 0 : down[i + 1][j] + 1;
for(int j = 1; j <= m; j++) for(int i = n; i >= 1; i--){
  sC[i][j] = sC[i + 1][j];
  sF[i][j] = sF[i + 1][j];
  if(!a[i][j] && right[i][j] > 1){
    sC[i][j] += right[i][j] - 1;
    sF[i][j] += 1LL * (right[i][j] - 1) * (down[i][j] - 1);
  }
}
for(int i = 1; i <= n; i++) for(int j = 1; j <= m; j++){
  if(a[i][j] || right[i][j] <= 1 || down[i][j] <= 2) continue;
  int b = i + down[i][j];
  C = (C + 1LL * (right[i][j] - 1) * (sC[i + 2][j] - sC[b][j])) % MOD;
  F = (F + 1LL * (right[i][j] - 1) * (sF[i + 2][j] - sF[b][j])) % MOD;
}
```
### 复杂度
时间复杂度 $O(nm)$，空间复杂度 $O(nm)$。

---
## 10. [【22NOIP提高组】喵了个喵(meow)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2095)

`NOIP 2022` `NOIP 提高组`

### 题意
有一个牌堆和若干个栈。操作一是把牌堆顶放到某个栈顶，若新栈顶两张牌相同就自动消去；操作二是选两个不同栈，若它们栈底牌面相同，则把这两张栈底一起消去。题目保证有解，你需要构造一组不超过 $2m$ 次的操作，把所有牌和所有栈清空。
### 分析
这题本质是构造，不是搜索。赛题给出的测试组实际上对应两类核心场景：一类可以长期保留一个空栈作“辅助栈”，另一类则需要在空栈快要用尽时，允许某个主栈短暂承受第三种颜色，再立刻把它清回安全状态。也就是说，整题的关键不是“怎么匹配所有同色牌”，而是“怎么始终留住足够的机动空间”。
常规做法是把主栈按颜色分组维护，再额外维护哪些栈是空的、哪些栈只有一张、哪些栈的栈底或栈顶颜色可立即配对。当读到一张新牌时，优先送去能在栈顶直接抵消的地方；如果同色牌只出现在某个栈底，就先把当前牌压入辅助栈，再用一次底部消除把这对牌拿掉。更难的分支是在没有稳定辅助栈时如何选“临时溢出”的那个栈：此时要优先选择后续最容易恢复成空栈或双牌栈的位置，本质上是一个带状态集合维护的贪心模拟。
### 核心代码
```cpp
void put(int x, int id){
  ops.push_back({1, id});
  st[id].push_back(x);
  if(st[id].size() >= 2 && st[id].back() == st[id][st[id].size() - 2]){
    st[id].pop_back();
    st[id].pop_back();
  }
}
void killBottom(int a, int b){
  ops.push_back({2, a, b});
  st[a].pop_front();
  st[b].pop_front();
}
void solveEasy(){
  for(int x : deck){
    int id = belong[x], aux = spareStack();
    if(!st[id].empty() && st[id].back() == x) put(x, id);
    else if(!st[id].empty() && st[id].front() == x){ put(x, aux); killBottom(id, aux); }
    else put(x, id);
  }
}
int pickStack(int x){ return !emptySet.empty() ? *emptySet.begin() : *bufferSet.begin(); }
```
### 复杂度
时间复杂度 $O(m\log n)$，空间复杂度 $O(n)$。

---
## 11. [【22NOIP提高组】建造军营(barrack)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2096)

`NOIP 2022` `NOIP 提高组`

### 题意
在一张连通无向图上，你可以任选若干城市建军营，也可以任选若干道路派兵把守。之后敌人会袭击一条道路。要求无论敌人袭击哪一条路，所有建有军营的城市仍然连通。求合法方案数，对 $10^9+7$ 取模。
### 分析
先把题意翻译成图论语言：如果被袭击的是一条非桥边，删掉它并不会破坏连通性，所以这种边守不守都无所谓；真正会威胁军营连通性的，只有桥。于是第一步一定是 Tarjan 找桥，再把原图缩成边双连通分量树。缩点之后，每个树点内部没有桥，问题只剩“在树上怎么选军营、怎么决定哪些桥必须被守”。
设某个缩点块 $u$ 内有 $V_u$ 个城市、$E_u$ 条内部边。若这块里一个军营都不建，则内部边任意选，方案数是 $2^{E_u}$；若至少建一个军营，则方案数是 $2^{E_u}(2^{V_u}-1)$。向儿子合并时分两种情况：儿子子树完全不建军营，那么父子桥可守可不守；儿子子树里一旦有军营，为了保证整片军营连通，父子桥就必须进入“被保护的连通骨架”。这就得到树形 DP 的乘法转移，最后再乘上子树外剩余边的自由选择数即可。
### 核心代码
```cpp
void dfs(int u, int fa){
  g[u] = pw[innerE[u]];
  f[u] = pw[innerE[u]] * (pw[sz[u]] - 1) % MOD;
  used[u] = innerE[u];
  for(int v : tree[u]) if(v != fa){
    dfs(v, u);
    used[u] += used[v] + 1;
    long long nf = (f[u] * 2 % MOD * g[v] + (f[u] + g[u]) % MOD * f[v]) % MOD;
    long long ng = g[u] * 2 % MOD * g[v] % MOD;
    f[u] = nf;
    g[u] = ng;
  }
  ans = (ans + f[u] * pw[m - used[u] - (fa != 0)]) % MOD;
}
```
### 复杂度
时间复杂度 $O(n+m)$，空间复杂度 $O(n+m)$。

---
## 12. [【22NOIP提高组】比赛(match)](http://ybt.ssoier.cn:8088/problem_show.php?pid=2097)

`NOIP 2022` `NOIP 提高组`

### 题意
给定两个排列 $a,b$。每次询问给区间 $[l,r]$，要求把其中所有子区间 $[p,q]$ 的“精彩程度”相加；这里的精彩程度是 $\max(a_p\dots a_q) \times \max(b_p\dots b_q)$。答案按 $2^{64}$ 取模输出。
### 分析
如果固定右端点 $q$，并记 $A_i=\max(a_i\dots a_q)$、$B_i=\max(b_i\dots b_q)$，那么所有以 $q$ 结尾的子区间贡献就是 $\sum_{i=1}^q A_iB_i$。当右端点从 $q-1$ 推到 $q$ 时，只有一批前缀位置的区间最大值会被新元素改写，而且这些位置一定是连续段，这正是单调栈最擅长维护的结构。
所以标准做法是按右端点离线扫描。用两组单调栈维护“谁负责成为当前区间最大值”，每次把受影响的起点区间整段改成新的最大值；线段树则同时维护当前位置的 $A_i,B_i,A_iB_i$，以及这些值随时间累加形成的历史和。为什么要维护历史和？因为询问 $[l,r]$ 需要的是所有右端点不超过 $r$、且起点也落在 $[l,r]$ 内的子区间总贡献，正好就是扫描到 $r$ 时，历史数组在 $[l,r]$ 上的区间和。
### 核心代码
```cpp
while(curR < r){
  ++curR;
  while(topA && a[stkA[topA]] <= a[curR]){
    seg.coverA(stkA[topA - 1] + 1, stkA[topA], a[curR]);
    --topA;
  }
  stkA[++topA] = curR;
  while(topB && b[stkB[topB]] <= b[curR]){
    seg.coverB(stkB[topB - 1] + 1, stkB[topB], b[curR]);
    --topB;
  }
  stkB[++topB] = curR;
  seg.addHistory(1, curR);
}
for(auto [l, id] : ask[r]) ans[id] = seg.query(l, r);
```
### 复杂度
时间复杂度 $O((n+Q)\log n)$，空间复杂度 $O(n)$。

---
