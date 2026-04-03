---
title: "洛谷 几何与博弈专题精选解题报告"
subtitle: "🧭 从插值、线性基到博弈、积分与凸几何"
order: 3
icon: "📐"
---

# 洛谷 几何与博弈专题精选解题报告

这一组题从拉格朗日插值一路走到三维凸包，题型跨度很大，但核心都在“把原问题压成可维护的代数结构或几何包络”上：前半段是插值与线性基，随后转入博弈论，再落到数值积分、圆几何、半平面交与凸包。

# 一、插值、线性基与异或结构

## 1. [CF622F The Sum of the k-th Powers](https://www.luogu.com.cn/problem/CF622F)

`拉格朗日插值` `前缀和`

### 题意

求 `1^k+2^k+...+n^k` 在模数意义下的值，`n` 很大，`k` 相对较小，不能直接逐项求和。

### 分析

设 `f(x)=1^k+2^k+...+x^k`，它是一个次数为 `k+1` 的多项式。只要预处理出 `y_i=f(i)` 在 `i=0..k+2` 的值，就能用拉格朗日插值在 `O(k)` 或 `O(k log mod)` 的时间求出 `f(n)`。这题的关键不是求和本身，而是先认出“幂和是低次多项式”。

### 核心代码

```cpp
const int MOD = 1000000007;
vector<long long> y;

long long solve(long long n, int k){
  if(n <= k + 2) return y[n];
  long long ans = 0;
  for(int i = 0; i <= k + 2; i++){
    long long num = 1, den = 1;
    for(int j = 0; j <= k + 2; j++) if(i != j){
      num = num * (n - j) % MOD;
      den = den * (i - j) % MOD;
    }
    ans = (ans + y[i] * num % MOD * qpow(den, MOD - 2)) % MOD;
  }
  return (ans + MOD) % MOD;
}
```

### 复杂度

时间 `O(k^2)`，空间 `O(k)`。

---

## 2. [P4781 【模板】拉格朗日插值](https://www.luogu.com.cn/problem/P4781)

`拉格朗日插值` `多项式求值`

### 题意

给出 `n` 个点 `(x_i,y_i)`，保证横坐标互异，求唯一的 `n-1` 次以下多项式在 `k` 处的值。

### 分析

模板题就是直接套拉格朗日公式。因为询问只有一个点，不必上多项式分治，枚举每个基函数 `L_i(k)` 即可。真正要小心的是分母符号、取模逆元和 `k` 恰好等于某个 `x_i` 时的边界。

### 核心代码

```cpp
long long lagrange(int n, long long k){
  long long ans = 0;
  for(int i = 1; i <= n; i++){
    long long num = 1, den = 1;
    for(int j = 1; j <= n; j++) if(i != j){
      num = num * (k - x[j]) % MOD;
      den = den * (x[i] - x[j]) % MOD;
    }
    ans = (ans + y[i] * num % MOD * qpow(den, MOD - 2)) % MOD;
  }
  return (ans + MOD) % MOD;
}
```

### 复杂度

时间 `O(n^2)`，空间 `O(1)`（不计输入存储）。

---

## 3. [P5607 [Ynoi2013] 无力回天 NOI2017](https://www.luogu.com.cn/problem/P5607)

`分块` `bitset` `集合并`

### 题意

维护 `m` 个集合，操作总数也是 `m`。支持向某个集合插入一个元素，以及查询两个集合并集的大小。

### 分析

总插入次数只有 `m`，但查询很多，适合按集合大小分治。把元素数超过阈值的集合设成重集合，用 `bitset` 直接存元素；轻集合只存元素列表。查询时，重重直接按位或计数，轻重枚举轻集合元素统计交集，轻轻则把小集合元素丢进哈希或时间戳数组。这样把最坏复杂度压到 `O(m√m / w)` 量级。

### 核心代码

```cpp
const int B = 1000;
vector<int> a[MAXM], heavyId;
bitset<MAXM> bs[MAXH];

void insertVal(int s, int v){
  a[s].push_back(v);
  if(id[s] != -1) bs[id[s]][v] = 1;
}
int query(int x, int y){
  if(id[x] != -1 && id[y] != -1) return (bs[id[x]] | bs[id[y]]).count();
  if(a[x].size() > a[y].size()) swap(x, y);
  int inter = countIntersect(x, y);
  return (int)a[x].size() + (int)a[y].size() - inter;
}
```

### 复杂度

时间单次查询约为 `O(√m)` 或 `O(m / w)`，总空间 `O(m√m / w)`。

---

## 4. [P3733 [HAOI2017] 八纵八横](https://www.luogu.com.cn/problem/P3733)

`线性基` `线段树分治` `可撤销`

### 题意

给定一张初始连通图，后续对“高铁”边做加入、删除、改权。每次操作后询问从首都出发再回到首都的闭合路径中，边权异或和最大是多少。

### 分析

初始公路图固定，先任选生成树求出每个点到根的路径异或值 `dis[u]`，任意非树边或新增边 `(u,v,w)` 都会贡献一个环值 `dis[u] xor dis[v] xor w`。动态部分变成“时间轴上若干线性基元素的区间加入、单点询问”。把每条高铁的生存区间挂到线段树节点上，深搜线段树时维护一套可撤销线性基，到叶子就能得到当前全部环值的最大异或和。

### 核心代码

```cpp
struct Basis{
  vector<Bit> stk, p;
  int snapshot(){ return stk.size(); }
  void rollback(int t){ while((int)stk.size() > t) undo(); }
  void insert(Bit x){ /* 可撤销插入 */ }
  Bit queryMax(){ /* 贪心取最大 */ }
} lb;

void solve(int u, int l, int r){
  int snap = lb.snapshot();
  for(auto &x : seg[u]) lb.insert(x);
  if(l == r) ans[l] = lb.queryMax();
  else solve(u << 1, l, mid), solve(u << 1 | 1, mid + 1, r);
  lb.rollback(snap);
}
```

### 复杂度

时间 `O((m+Q) log Q · L^2)`，空间 `O((m+Q) log Q)`，`L` 为二进制位数。

---

## 5. [P3292 [SCOI2016] 幸运数字](https://www.luogu.com.cn/problem/P3292)

`树上倍增` `线性基`

### 题意

树上每个点有一个权值。多次询问一条路径上选若干个点异或和的最大值。

### 分析

路径最大异或和的模板做法是“倍增 + 线性基合并”。对每个点维护 `up[u][j]` 和一套 `base[u][j]`，表示从 `u` 往上跳 `2^j` 层这段路径上的线性基。查询时先把两个端点跳到同深度，再同步向上跳，把经过的若干段基合并到答案基里，最后插入 `lca` 的点权即可。

### 核心代码

```cpp
struct Basis{
  long long p[61];
  void insert(long long x){ for(int i = 60; i >= 0; i--) if(x >> i & 1){ if(!p[i]) return p[i] = x, void(); x ^= p[i]; } }
  void merge(const Basis &b){ for(int i = 60; i >= 0; i--) if(b.p[i]) insert(b.p[i]); }
  long long query(){ long long x = 0; for(int i = 60; i >= 0; i--) x = max(x, x ^ p[i]); return x; }
};
```

### 复杂度

预处理 `O(n log n · 60)`，单次询问 `O(log n · 60^2)`。

---

## 6. [CF1100F Ivan and Burgers](https://www.luogu.com.cn/problem/CF1100F)

`前缀线性基` `区间查询`

### 题意

给定数组，多次询问区间 `[l,r]` 内任选若干数异或和的最大值。

### 分析

经典做法是从左到右扫描右端点，维护“带位置”的线性基。每个基向量除了值，还记录它来自的最靠右位置；插入新数时若新数位置更靠右，就把旧基向量换下去。回答 `[l,r]` 时，只允许使用位置 `>= l` 的基向量贪心取最大值，于是所有询问按右端点分组离线处理即可。

### 核心代码

```cpp
long long p[21]; int pos[21];

void insert(long long x, int id){
  for(int i = 20; i >= 0; i--) if(x >> i & 1){
    if(!p[i]) return p[i] = x, pos[i] = id, void();
    if(pos[i] < id) swap(pos[i], id), swap(p[i], x);
    x ^= p[i];
  }
}
long long query(int l){
  long long ans = 0;
  for(int i = 20; i >= 0; i--) if(pos[i] >= l) ans = max(ans, ans ^ p[i]);
  return ans;
}
```

### 复杂度

预处理加询问总时间 `O((n+q) log V)`，空间 `O(log V)`。

---

## 7. [P3265 [JLOI2015] 装备购买](https://www.luogu.com.cn/problem/P3265)

`高斯消元` `拟阵贪心`

### 题意

每件装备对应一个实数向量和一个价格。要买到尽可能多的线性无关装备；在数量最大的前提下，总价格最小。

### 分析

线性无关集合构成线性拟阵，题目是标准的“最大基数、最小权值基”贪心。先按价格从小到大排序，再依次尝试把向量插入当前行阶梯形矩阵；能插入就选，不能插入说明它被前面更便宜的向量张成。因为域是实数，所以直接做高斯消元即可。

### 核心代码

```cpp
bool insert(vector<double> v){
  for(int i = 0; i < m; i++){
    int p = findPivot(i, v);
    if(fabs(v[p]) < eps) continue;
    for(int j = i + 1; j < m; j++) v[j] -= v[i] * a[j][i] / a[i][i];
    a.push_back(v);
    return true;
  }
  return false;
}
```

### 复杂度

时间 `O(nm^2)`，空间 `O(m^2)`。

---

## 8. [P4151 [WC2011] 最大 XOR 和路径](https://www.luogu.com.cn/problem/P4151)

`图上异或路` `线性基`

### 题意

无向图中允许重复经过点和边，求从 `1` 到 `n` 的一条路径，使边权异或和最大。

### 分析

先在图上做一棵搜索树，记 `dis[u]` 为树上从 `1` 到 `u` 的异或和。对于每条边 `(u,v,w)`，都能得到一个环值 `dis[u] xor dis[v] xor w`，它表示沿该环绕一圈后能额外异或上的量。把全部环值丢进线性基，再用它去提升 `dis[n]`，就是答案。

### 核心代码

```cpp
void dfs(int u){
  vis[u] = 1;
  for(auto [v, w] : g[u]){
    if(!vis[v]) dis[v] = dis[u] ^ w, dfs(v);
    else lb.insert(dis[u] ^ dis[v] ^ w);
  }
}

long long answer(){
  long long x = dis[n];
  for(int i = 60; i >= 0; i--) x = max(x, x ^ lb.p[i]);
  return x;
}
```

### 复杂度

时间 `O((n+m) · 60)`，空间 `O(n+m)`。

---

## 9. [P4301 [CQOI2013] 新Nim游戏](https://www.luogu.com.cn/problem/P4301)

`线性基` `博弈论`

### 题意

第一回合双方都可以整堆拿走若干堆，之后回到普通 Nim。先手想保证必胜，并让自己第一回合拿走的火柴总数尽量小。

### 分析

先手第一步的目标不是直接把异或和变成 `0`，而是留下一个**异或无关**的堆集。若留下的堆两两构成一组线性无关集，那么后手在自己的特殊回合无论删去哪个非空真子集，剩余异或和都不可能变成 `0`；这样进入普通 Nim 时，轮到先手面对的就是一个非零异或局面，必胜。于是问题转成“保留总权值最大的线性无关子集”，按堆大小从大到小做线性基贪心即可。

### 核心代码

```cpp
sort(a + 1, a + n + 1, greater<long long>());
long long keep = 0;
for(int i = 1; i <= n; i++){
  if(lb.insert(a[i])) keep += a[i];
}
ans = sum - keep;
```

### 复杂度

时间 `O(n · 31)`，空间 `O(31)`。

---

## 10. [P4570 [BJWC2011] 元素](https://www.luogu.com.cn/problem/P4570)

`线性基` `贪心`

### 题意

每种矿石有元素序号和魔力值，选一些矿石使不存在非空子集异或和为 `0`，并让魔力和最大。

### 分析

“不存在非空子集异或为 `0`”等价于所选元素序号线性无关。于是题目变成最大权线性无关集，仍然是线性拟阵上的权值贪心：按魔力值从大到小排序，能插入线性基就选，不能插入说明会产生异或依赖，直接舍弃。

### 核心代码

```cpp
sort(a + 1, a + n + 1, [](Node A, Node B){ return A.w > B.w; });
long long ans = 0;
for(int i = 1; i <= n; i++){
  if(lb.insert(a[i].id)) ans += a[i].w;
}
```

### 复杂度

时间 `O(n · 60)`，空间 `O(60)`。

---

## 11. [P3812 【模板】线性基](https://www.luogu.com.cn/problem/P3812)

`线性基` `最大异或和`

### 题意

给定若干整数，任选一些数异或，求能得到的最大值。

### 分析

模板题只有两步：插入时把每个数化成“最高位唯一”的基向量；查询时从高位到低位尝试让答案变大。因为线性基保留了所有可表示异或值的张成空间，贪心过程一定能得到字典序最大的二进制数，也就是数值最大。

### 核心代码

```cpp
long long p[61];

void insert(long long x){
  for(int i = 60; i >= 0; i--) if(x >> i & 1){
    if(!p[i]) return p[i] = x, void();
    x ^= p[i];
  }
}
long long query(){
  long long ans = 0;
  for(int i = 60; i >= 0; i--) ans = max(ans, ans ^ p[i]);
  return ans;
}
```

### 复杂度

时间 `O(n · 60)`，空间 `O(60)`。

---

## 12. [P3857 [TJOI2008] 彩灯](https://www.luogu.com.cn/problem/P3857)

`线性基` `状态计数`

### 题意

有 `M` 个开关控制 `N` 盏灯，每个开关按下会翻转某些灯。初始全灭，求最终能展示出多少种不同状态，对 `2008` 取模。

### 分析

每个开关对应一个 `N` 位 `01` 向量，按开关的效果就是这些向量的异或和。能到达的所有状态恰好构成这些向量张成的线性空间，其大小就是 `2^rank`。因此只要求出所有开关向量的秩，再快速幂即可。

### 核心代码

```cpp
int rank = 0;
for(int i = 1; i <= m; i++){
  bitset<55> x = sw[i];
  if(lb.insert(x)) rank++;
}
ans = qpow(2, rank, 2008);
```

### 复杂度

时间 `O(MN^2 / w)`，空间 `O(N^2 / w)`。

---

## 13. [P4869 albus就是要第一个出场](https://www.luogu.com.cn/problem/P4869)

`线性基` `排名`

### 题意

把所有子集异或值排序成序列 `B`，求给定 `Q` 第一次出现的位置，对 `10086` 取模。

### 分析

若原数组秩为 `r`，则每个可表示值都会出现 `2^(n-r)` 次。问题变成两部分：先判断 `Q` 是否在线性基张成空间内；若能表示，再求有多少个可表示值严格小于 `Q`。把线性基化成行最简形后，从高位往低位扫描，遇到 `Q` 当前位为 `1` 时，可以统计“这一位取 `0`、后面任意”的方案数，最后乘上重复次数再加一。

### 核心代码

```cpp
long long rankLess(long long q){
  long long cnt = 0;
  for(int i = top; i >= 0; i--){
    if(!basis[i]) continue;
    if(q >> i & 1) cnt = (cnt + pw[idx[i]]) % MOD, q ^= basis[i];
  }
  return q ? -1 : cnt;
}

ans = (rankLess(Q) * qpow(2, n - rk, MOD) + 1) % MOD;
```

### 复杂度

时间 `O(n · 31)`，空间 `O(31)`。

---

# 二、经典博弈论

## 14. [P2197 【模板】Nim 游戏](https://www.luogu.com.cn/problem/P2197)

`Nim` `异或和`

### 题意

多组数据，每次给出若干堆石子，双方轮流从一堆中取任意多，取完最后一颗者胜，判断先手胜负。

### 分析

标准 Nim 结论只有一句：所有堆大小的异或和为 `0` 时先手必败，否则先手必胜。原因是 `0` 局面无论怎么取都会变成非零，而非零局面总能把最高位调成 `0`，一步送回 `0` 局面。

### 核心代码

```cpp
int xr = 0;
for(int i = 1; i <= n; i++) xr ^= a[i];
puts(xr ? "Yes" : "No");
```

### 复杂度

时间 `O(n)`，空间 `O(1)`。

---

## 15. [P1247 取火柴游戏](https://www.luogu.com.cn/problem/P1247)

`Nim` `构造第一步`

### 题意

普通 Nim，但除了判断先手能否获胜，还要输出字典序最小的第一步方案，以及取完后的局面。

### 分析

若总异或和为 `0`，先手必败，直接输出 `lose`。否则枚举每一堆，若把第 `i` 堆改成 `a[i] xor xr` 后变小，就能把全局异或和送成 `0`。按堆编号从小到大扫描，在同一堆内取走数量越少越优，自然得到题目要求的字典序最小方案。

### 核心代码

```cpp
int xr = 0;
for(int i = 1; i <= k; i++) xr ^= a[i];
for(int i = 1; i <= k; i++){
  int b = a[i] ^ xr;
  if(b < a[i]){
    int take = a[i] - b;
    a[i] = b;
    printMove(take, i, a);
    break;
  }
}
```

### 复杂度

时间 `O(k)`，空间 `O(1)`。

---

## 16. [P1288 取数游戏 II](https://www.luogu.com.cn/problem/P1288)

`博弈论` `环转链`

### 题意

环上每条边有一个非负整数，硬币放在固定点。每次沿左边或右边一条正权边走过去，并把该边减小为更小的非负整数；若轮到某人时左右两边都是 `0` 则输，判断先手是否必胜。

### 分析

因为环上至少有一条 `0` 边，硬币实际上永远不可能穿过这条边，原问题可看成从起点向左右两侧扩张的链式博弈。继续化简后，真正决定胜负的是起点向左、向右第一次遇到 `0` 的距离奇偶：只要某一侧最近的 `0` 与起点距离为奇数，先手就能先把局面送成对称必败态；两侧都为偶数时，后手始终可以镜像应对。

### 核心代码

```cpp
int L = firstZeroLeft();
int R = firstZeroRight();
puts((L % 2 == 1 || R % 2 == 1) ? "YES" : "NO");
```

### 复杂度

时间 `O(n)`，空间 `O(1)`。

---

## 17. [P4279 [SHOI2008] 小约翰的游戏](https://www.luogu.com.cn/problem/P4279)

`反常 Nim` `misere`

### 题意

仍然是若干堆石子，每次从一堆取任意多，但这次“取到最后一粒的人输”，判断先手胜负。

### 分析

这就是 `misere Nim`。当所有堆都只有 `1` 颗时，结论与普通 Nim 反过来：堆数为奇数先手败，偶数先手胜。只要存在某堆大于 `1`，局面又退回普通 Nim 的判定，即总异或和非零先手胜。

### 核心代码

```cpp
bool allOne = true;
int xr = 0;
for(int i = 1; i <= n; i++) allOne &= (a[i] == 1), xr ^= a[i];
if(allOne) puts(n & 1 ? "Brother" : "John");
else puts(xr ? "John" : "Brother");
```

### 复杂度

时间 `O(n)`，空间 `O(1)`。

---

## 18. [P1199 [NOIP 2010 普及组] 三国游戏](https://www.luogu.com.cn/problem/P1199)

`结论题` `贪心`

### 题意

双方轮流从自由武将里选人。计算机每次都会抢走“当前最能破坏你下一组最强配对”的武将。问你是否能保证获胜，若能，最大能保证的默契值是多少。

### 分析

这题的关键结论是：答案一定可行，输出第一行恒为 `1`；真正要求的是 `max_i secondMax(i)`，也就是每个武将连出去的边权第二大值中的最大者。原因是你首选武将 `i` 后，计算机会优先拿走与 `i` 配对最强的那个人，但挡不住你之后拿到与 `i` 配对第二强的人；而任何策略都不可能保证超过这个值。

### 核心代码

```cpp
int ans = 0;
for(int i = 1; i <= n; i++){
  int mx1 = 0, mx2 = 0;
  for(int j = 1; j <= n; j++) if(i != j){
    upd(mx1, mx2, w[i][j]);
  }
  ans = max(ans, mx2);
}
```

### 复杂度

时间 `O(n^2)`，空间 `O(1)`（边权读入后即时更新时）。

---

## 19. [P1290 欧几里德的游戏](https://www.luogu.com.cn/problem/P1290)

`Euclid Game` `递归`

### 题意

给定两个正整数，当前玩家可从较大者中减去较小者的若干倍但不能减成负数，谁先把某个数变成 `0` 谁赢。

### 分析

这题就是欧几里得算法的博弈版。设 `a>=b`，若 `a/b>=2`，当前玩家总能通过“多减一点”直接把主动权锁死，因此必胜；若 `a<b*2`，当前玩家其实只有一种有效走法，局面退化成 `(b,a-b)` 并交换先后手。沿着辗转相减递归即可。

### 核心代码

```cpp
bool win(long long a, long long b){
  if(a < b) swap(a, b);
  if(b == 0) return true;
  if(a / b >= 2) return true;
  return !win(b, a - b);
}
```

### 复杂度

时间 `O(log max(a,b))`，空间 `O(log max(a,b))`。

---

## 20. [P2252 【模板】威佐夫博弈 / [SHOI2002] 取石子游戏](https://www.luogu.com.cn/problem/P2252)

`Wythoff Game` `黄金分割`

### 题意

有两堆石子，每次可从一堆取任意多，或两堆同时取相同数量，判断先手胜负。

### 分析

冷局面是典型的威佐夫对：设 `a<=b`，令 `k=b-a`，若 `a=floor(k·phi)`，`b=floor(k·phi^2)`，则先手必败，否则必胜。实现时只要按这个公式判定即可，题目里的 `-1` 只是输出格式保留项，这个模型下不会出现无法确定的情况。

### 核心代码

```cpp
long long a, b;
if(a > b) swap(a, b);
long long k = b - a;
long long x = (long long)(k * phi);
puts(x == a ? "0" : "1");
```

### 复杂度

时间 `O(1)`，空间 `O(1)`。

---

# 三、数值积分与圆几何

## 21. [P4525 【模板】自适应辛普森法 1](https://www.luogu.com.cn/problem/P4525)

`自适应辛普森` `数值积分`

### 题意

计算 `∫[L,R] (cx+d)/(ax+b) dx`，保证分母在区间内不为 `0` 且积分收敛。

### 分析

这是标准的自适应辛普森模板。虽然本题其实能手推原函数，但模板题的目标就是练“递归细分直到左右两段辛普森值足够接近”。由于函数在区间内连续，误差控制只看 `|S(l,r)-S(l,mid)-S(mid,r)|` 即可。

### 核心代码

```cpp
double f(double x){ return (c * x + d) / (a * x + b); }
double simpson(double l, double r){
  double m = (l + r) / 2;
  return (f(l) + 4 * f(m) + f(r)) * (r - l) / 6;
}
double asr(double l, double r, double S){
  double m = (l + r) / 2, L = simpson(l, m), R = simpson(m, r);
  if(fabs(L + R - S) < 15 * eps) return L + R + (L + R - S) / 15;
  return asr(l, m, L) + asr(m, r, R);
}
```

### 复杂度

时间与误差要求相关，常记为 `O(T)`，空间为递归深度 `O(T)`。

---

## 22. [P4526 【模板】自适应辛普森法 2](https://www.luogu.com.cn/problem/P4526)

`广义积分` `自适应辛普森`

### 题意

计算 `∫[0,+∞) x^(a/x-x) dx`，若积分发散输出 `orz`。

### 分析

先看端点：当 `a<0` 时，`x→0+` 有 `a/x` 项把指数推到 `+∞`，积分发散；当 `a>=0` 时，函数在 `0` 附近可积、在 `+∞` 处又因 `-x ln x` 急速衰减，可以放心截断到一个足够大的上界后做自适应辛普森。实现时把极小区间 `[0,δ]` 单独处理，或直接从很小的正数开始积分即可。

### 核心代码

```cpp
double f(double x){ return exp((a / x - x) * log(x)); }

double solve(){
  if(a < 0) throw "orz";
  double L = 1e-8, R = 20.0;
  double S = simpson(L, R);
  return asr(L, R, S);
}
```

### 复杂度

时间与递归细分次数有关，空间为递归深度 `O(T)`。

---

## 23. [P4207 [NOI2005] 月下柠檬树](https://www.luogu.com.cn/problem/P4207)

`几何积分` `圆包络`

### 题意

多层圆台和圆锥叠成一棵树，月光以固定夹角平行照射，求树在地面上的影子面积。

### 分析

把投影方向通过一次仿射变换拉正后，每个水平圆截面的投影都可视为一个圆，整棵树影子就变成若干圆上半弧形成的包络面积。对横坐标 `x`，只要求出所有有效圆在该处的最大纵坐标 `F(x)`，再对 `F(x)` 做自适应辛普森积分即可。难点是把每层圆台拆成一串圆，而不是直接硬算曲面投影。

### 核心代码

```cpp
double F(double x){
  double y = 0;
  for(auto &c : cir){
    double dx = x - c.x;
    if(fabs(dx) <= c.r) y = max(y, sqrt(c.r * c.r - dx * dx));
  }
  return y;
}

ans = 2 * asr(leftMost, rightMost, simpson(leftMost, rightMost));
```

### 复杂度

时间约为 `O(n · T)`，空间 `O(n)`。

---

## 24. [SP8073 CIRU - The area of the union of circles](https://www.luogu.com.cn/problem/SP8073)

`圆面积并` `角度扫描`

### 题意

给出若干圆，求它们面积并。

### 分析

对每个圆单独处理其“未被覆盖的圆弧”。先删去被其他圆完整覆盖的圆，再把其他圆对当前圆造成的遮挡区间转成极角区间，排序后做一次扫描。未被遮住的每段圆弧既贡献扇形面积，也贡献与弦围成的三角形面积，全部加起来就是面积并。

### 核心代码

```cpp
for(int i = 1; i <= n; i++){
  seg.clear();
  for(int j = 1; j <= n; j++) if(i != j) addCoverArc(i, j, seg);
  sort(seg.begin(), seg.end());
  double last = -PI;
  for(auto [l, r] : seg){
    if(l > last) ans += sector(i, last, l) + triangle(i, last, l);
    last = max(last, r);
  }
  if(last < PI) ans += sector(i, last, PI) + triangle(i, last, PI);
}
```

### 复杂度

时间 `O(n^2 log n)`，空间 `O(n)`。

---

## 25. [P1742 最小圆覆盖](https://www.luogu.com.cn/problem/P1742)

`最小圆覆盖` `随机增量`

### 题意

给出平面点集，求包含所有点的最小圆。

### 分析

Welzl 随机化模板。先把点随机打乱，维护当前最小圆；当新点落在圆外时，它必然在新圆边界上，于是再往前枚举一个边界点；若仍不满足，就再枚举第三个点，由三点唯一确定外接圆。这个三重循环看着像 `O(n^3)`，但随机化后期望是线性的。

### 核心代码

```cpp
shuffle(p + 1, p + n + 1, rng);
Circle c(p[1], 0);
for(int i = 2; i <= n; i++) if(!in(c, p[i])){
  c = Circle(p[i], 0);
  for(int j = 1; j < i; j++) if(!in(c, p[j])){
    c = getCircle(p[i], p[j]);
    for(int k = 1; k < j; k++) if(!in(c, p[k]))
      c = getCircle(p[i], p[j], p[k]);
  }
}
```

### 复杂度

期望时间 `O(n)`，空间 `O(1)`。

---

## 26. [P4288 [SHOI2014] 信号增幅仪](https://www.luogu.com.cn/problem/P4288)

`坐标变换` `最小圆覆盖`

### 题意

增幅后覆盖范围是一个固定方向、长短轴比固定的椭圆。求覆盖所有用户所需的最小半短轴。

### 分析

方向固定、拉伸倍数固定时，椭圆可以通过一次线性变换还原成圆：先把所有点绕原点旋转 `-a`，再沿增幅方向缩小 `p` 倍。变换后问题就变成“这些点的最小圆覆盖半径是多少”，这个半径正是原问题最小半短轴长度。

### 核心代码

```cpp
for(int i = 1; i <= n; i++){
  Point q = rotate(p[i], -ang);
  q.x /= amp;
  t[i] = q;
}
Circle c = minCoverCircle(t, n);
printf("%.3f\n", c.r);
```

### 复杂度

时间为最小圆覆盖的期望 `O(n)`，空间 `O(n)`。

---

## 27. [P1257 平面上的最接近点对](https://www.luogu.com.cn/problem/P1257)

`最近点对` `分治`

### 题意

给出平面点集，求最近点对距离。

### 分析

经典分治。按横坐标排序后递归求左右两半最优值 `d`，再把距中线不超过 `d` 的点按纵坐标取出。利用条带内每个点只需和后面常数个点比较的性质，合并阶段仍是线性的。模板重点是维护按 `y` 有序的临时数组。

### 核心代码

```cpp
double solve(int l, int r){
  if(r - l <= 3) return bruteForce(l, r);
  int mid = (l + r) >> 1;
  double d = min(solve(l, mid), solve(mid + 1, r));
  mergeByY(l, mid, r);
  int m = collectStrip(l, r, x[mid], d);
  for(int i = 1; i <= m; i++)
    for(int j = i + 1; j <= m && b[j].y - b[i].y < d; j++)
      d = min(d, dist(b[i], b[j]));
  return d;
}
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

## 28. [P1429 平面最近点对（加强版）](https://www.luogu.com.cn/problem/P1429)

`最近点对` `分治模板加强`

### 题意

同样求平面最近点对，但数据范围更大，需要更稳的 `O(n log n)` 做法。

### 分析

和上一题是同一模型，只是更强调常数和精度。实践里要尽量少开平方，统一比较距离平方；条带数组复用临时空间；所有点先按 `x` 排序，递归返回时再按 `y` 归并，避免重复排序。

### 核心代码

```cpp
long long solve(int l, int r){
  if(r - l <= 3) return brute(l, r);
  int mid = (l + r) >> 1;
  long long d = min(solve(l, mid), solve(mid + 1, r));
  inplace_merge(p + l, p + mid + 1, p + r + 1, cmpY);
  int m = 0;
  for(int i = l; i <= r; i++) if(sqr(p[i].x - xmid) < d) b[++m] = p[i];
  for(int i = 1; i <= m; i++)
    for(int j = i + 1; j <= m && sqr(b[j].y - b[i].y) < d; j++)
      d = min(d, dist2(b[i], b[j]));
  return d;
}
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

# 四、半平面交与凸几何

## 29. [P4196 【模板】半平面交 / [CQOI2006] 凸多边形](https://www.luogu.com.cn/problem/P4196)

`半平面交` `有向直线`

### 题意

给出若干凸多边形，求它们公共部分的面积。

### 分析

每条边都能转成一个“左侧为可行域”的半平面，所有多边形的交就是全部半平面的交。按极角排序后用双端队列维护当前有效直线集合，遇到平行线时只保留更靠内的一条；最后把队列中相邻直线求交得到交多边形，再做一次叉积面积。

### 核心代码

```cpp
sort(line + 1, line + m + 1, cmpAngle);
for(int i = 1; i <= m; i++){
  while(hh + 1 <= tt && out(line[i], q[tt], q[tt - 1])) tt--;
  while(hh + 1 <= tt && out(line[i], q[hh], q[hh + 1])) hh++;
  q[++tt] = line[i];
}
while(hh + 1 <= tt && out(q[hh], q[tt], q[tt - 1])) tt--;
while(hh + 1 <= tt && out(q[tt], q[hh], q[hh + 1])) hh++;
```

### 复杂度

时间 `O(m log m)`，空间 `O(m)`。

---

## 30. [P3194 [HNOI2008] 水平可见直线](https://www.luogu.com.cn/problem/P3194)

`上凸壳` `直线可见性`

### 题意

给出若干条不重合直线 `y=Ax+B`，从 `y=+∞` 方向向下看，求哪些直线可见。

### 分析

“可见”就是这条直线在某个 `x` 上成为上包络线。把所有直线按斜率排序，斜率相同时只保留截距最大的；随后像维护凸包一样，用交点单调性维护一个上凸壳。若新直线与栈顶前一条的交点不比原来的更靠右，说明栈顶永远不会露出来，直接弹掉。

### 核心代码

```cpp
sort(a + 1, a + n + 1, cmpSlope);
for(int i = 1; i <= n; i++){
  if(i > 1 && sameSlope(a[i], a[i - 1])) continue;
  while(top >= 2 && crossX(st[top - 1], st[top]) >= crossX(st[top], a[i])) top--;
  st[++top] = a[i];
}
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

## 31. [P3256 [JLOI2013] 赛车](https://www.luogu.com.cn/problem/P3256)

`上包络` `直线运动`

### 题意

第 `i` 辆车的位置是 `x_i(t)=v_i t-k_i`。若一辆车曾在某时刻处于领跑位置，就能获奖，求全部获奖车辆编号。

### 分析

每辆车对应 `t-x` 平面里的一条直线，能领跑等价于它在 `t>=0` 的半轴上出现在上包络线上。处理方法与可见直线几乎完全一致：按斜率排序，平行线只留截距大的，然后维护上凸壳和相邻交点。最后只保留在 `t>=0` 处有有效区间的直线，对应车辆就是答案。

### 核心代码

```cpp
sort(car + 1, car + n + 1, cmpV);
for(int i = 1; i <= n; i++){
  if(i > 1 && car[i].v == car[i - 1].v) continue;
  while(top >= 2 && meet(st[top - 1], st[top]) >= meet(st[top], car[i])) top--;
  st[++top] = car[i];
}
for(int i = 1; i <= top; i++){
  double L = (i == 1 ? 0 : meet(st[i - 1], st[i]));
  double R = (i == top ? INF : meet(st[i], st[i + 1]));
  if(R >= max(L, 0.0)) ans.push_back(st[i].id);
}
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

## 32. [P3222 [HNOI2012] 射箭](https://www.luogu.com.cn/problem/P3222)

`对偶变换` `半平面交`

### 题意

抛物线箭轨迹从原点射出。第 `i` 个靶子是竖直线段 `x=x_i, y∈[l_i,r_i]`，问最多能连续通过多少关，也就是是否存在一条抛物线同时穿过前缀所有靶子。

### 分析

设轨迹为 `y=px-qx^2`，两边除以 `x_i` 得 `y/x = p-qx`。于是每个靶子在 `(x, y/x)` 平面里变成一条竖线段，而选一条抛物线等价于选一条直线同时穿过这些线段。再把“直线穿过线段”对偶成参数平面 `(q,p)` 上的两条半平面约束，就变成了前缀可行域是否为空的判定；配合二分或单调推进即可。

### 核心代码

```cpp
bool check(int k){
  vector<Line> hp;
  for(int i = 1; i <= k; i++){
    hp.push_back(Line(x[i], 1, low[i] / x[i]));
    hp.push_back(Line(-x[i], -1, -high[i] / x[i]));
  }
  return !halfPlaneIntersection(hp).empty();
}
```

### 复杂度

单次判定 `O(k log k)`，配合二分总时间 `O(n log^2 n)`。

---

## 33. [P2600 [ZJOI2008] 瞭望塔](https://www.luogu.com.cn/problem/P2600)

`上凸包` `函数最小化`

### 题意

山的上边界是一条折线，在区间 `[x_1,x_n]` 内选一处建塔，使塔顶能看到整个山体轮廓，求所需最小高度。

### 分析

能挡住视线的只有轮廓的上凸壳。对固定位置 `x`，为了看到整条轮廓，塔顶高度必须不低于所有凸壳边在该位置诱导出的支撑线最大值，因此得到一个分段线性的凸函数 `H(x)`。先求上凸壳，再对 `H(x)` 用三分或直接枚举相邻交点找最小值即可。

### 核心代码

```cpp
double need(double x){
  double h = -1e100;
  for(auto &e : hullEdge) h = max(h, lineValue(e, x));
  return h;
}

double l = x1, r = xn;
for(int t = 0; t < 100; t++){
  double m1 = (2 * l + r) / 3, m2 = (l + 2 * r) / 3;
  if(need(m1) < need(m2)) r = m2; else l = m1;
}
```

### 复杂度

预处理 `O(n)` 或 `O(n log n)`，计算最小值 `O(h · T)`，`h` 为凸壳边数。

---

## 34. [P4250 [SCOI2015] 小凸想跑步](https://www.luogu.com.cn/problem/P4250)

`半平面交` `概率几何`

### 题意

在凸 `n` 边形内部均匀随机取一点 `p`。若三角形 `(p,0,1)` 的面积是所有 `n` 个三角形 `(p,i,i+1)` 中最小的，视为一次正确站位，求概率。

### 分析

固定一条边时，三角形面积对点 `p` 是线性函数，所以条件
`area(p,0,1) <= area(p,i,i+1)` 等价于一个半平面。把这些不等式与原凸多边形一起求交，得到的区域就是所有“正确站位”的点集。最终概率就是该交多边形面积除以原多边形面积。

### 核心代码

```cpp
Polygon poly = originPolygon;
for(int i = 1; i < n; i++){
  Line lim = buildLimit(edge01, edge(i, i + 1));
  poly = cut(poly, lim);
  if(poly.empty()) break;
}
double ans = area(poly) / area(originPolygon);
```

### 复杂度

时间 `O(n^2)`，空间 `O(n)`。

---

## 35. [P3297 [SDOI2013] 逃考](https://www.luogu.com.cn/problem/P3297)

`Voronoi` `半平面交` `最短路`

### 题意

矩形内每个位置都由最近的某位亲戚监控。给出小杨起点和所有亲戚位置，要求找到一条逃到边界的路线，使被不同亲戚看到的人数最少。

### 分析

每位亲戚的监控区域就是其 Voronoi 单元。因为 `n<=600`，可以直接对每个亲戚做一次“矩形 + 与其他亲戚的垂直平分线半平面”的裁剪，得到所有有界或无界单元。起点落在哪个单元就从哪个点出发，两个单元若共享边就连边，所有碰到矩形边界的单元视为出口。之后在单元图上做 BFS / 最短路，代价就是经过的单元数量。

### 核心代码

```cpp
for(int i = 1; i <= n; i++){
  poly[i] = rectangle;
  for(int j = 1; j <= n; j++) if(i != j)
    poly[i] = cut(poly[i], bisector(p[i], p[j]));
}
buildGraphBySharedEdge(poly);
int s = locate(startPoint), t = superExit();
ans = bfs(s, t);
```

### 复杂度

时间 `O(n^3)`，空间 `O(n^2)`。

---

# 五、凸包进阶与三维几何

## 36. [P1452 【模板】旋转卡壳 / [USACO03FALL] Beauty Contest G](https://www.luogu.com.cn/problem/P1452)

`凸包` `旋转卡壳`

### 题意

给出平面点集，求凸包直径的平方。

### 分析

先做二维凸包，最远点对一定在凸包上。随后用旋转卡壳枚举一条边和其对踵点，利用面积单调性让指针只往前走不回退，整个过程线性完成。模板里别忘了 `n=2` 的特判。

### 核心代码

```cpp
int j = 2;
for(int i = 1; i <= m; i++){
  while(area(ch[i], ch[i + 1], ch[j + 1]) > area(ch[i], ch[i + 1], ch[j])) j = nxt(j);
  ans = max(ans, dist2(ch[i], ch[j]));
  ans = max(ans, dist2(ch[i + 1], ch[j]));
}
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

## 37. [P4166 [SCOI2007] 最大土地面积](https://www.luogu.com.cn/problem/P4166)

`凸包` `旋转卡壳` `最大四边形`

### 题意

给定点集，选四个点组成四边形，使面积最大。

### 分析

最大面积四边形的顶点都在凸包上。固定凸包上一条对角线 `(i,j)` 后，四边形面积就是它两侧两个三角形面积之和，因此可以分别在两边各找一个使三角形面积最大的点。沿着 `i,j` 枚举时，这两个最优点都具有单调性，可以用旋转卡壳整体做到平方级。

### 核心代码

```cpp
for(int i = 1; i <= m; i++){
  int p = i + 1, q = i + 3;
  for(int j = i + 2; j <= m; j++){
    while(area(ch[i], ch[j], ch[p + 1]) > area(ch[i], ch[j], ch[p])) p++;
    while(area(ch[j], ch[i], ch[q + 1]) > area(ch[j], ch[i], ch[q])) q++;
    ans = max(ans, area(ch[i], ch[j], ch[p]) + area(ch[j], ch[i], ch[q]));
  }
}
```

### 复杂度

时间 `O(h^2)`，空间 `O(h)`，`h` 为凸包点数。

---

## 38. [P3187 [HNOI2007] 最小矩形覆盖](https://www.luogu.com.cn/problem/P3187)

`凸包` `旋转卡壳` `最小外接矩形`

### 题意

给出点集，求面积最小的包围矩形，并输出矩形四个顶点。

### 分析

最优矩形的一条边一定与凸包某条边平行。于是先求凸包，再以每条边为基准边做旋转卡壳，同时维护最远点、最左点、最右点，得到当前方向下的宽和高，更新最小面积即可。恢复四个顶点时，只要在该方向的正交坐标系里反推回来。

### 核心代码

```cpp
for(int i = 1; i <= m; i++){
  Vec e = unit(ch[i + 1] - ch[i]), v = rotate90(e);
  while(dot(e, ch[r + 1]) > dot(e, ch[r])) r++;
  while(dot(v, ch[u + 1] - ch[i]) > dot(v, ch[u] - ch[i])) u++;
  while(dot(e, ch[l + 1]) < dot(e, ch[l])) l++;
  updAnswer(i, l, r, u);
}
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

## 39. [P2742 【模板】二维凸包 / [USACO5.1] 圈奶牛Fencing the Cows](https://www.luogu.com.cn/problem/P2742)

`二维凸包` `Andrew`

### 题意

给出平面点集，求凸包周长。

### 分析

模板题直接用 Andrew 单调链。点按 `(x,y)` 排序后，先扫下凸壳再扫上凸壳，转向不合法就弹栈。最后把壳上的相邻点距离求和即可；若有重复点或共线点，要统一好“是否保留边上点”的判定。

### 核心代码

```cpp
sort(p + 1, p + n + 1);
for(int i = 1; i <= n; i++){
  while(top >= 2 && cross(st[top] - st[top - 1], p[i] - st[top]) <= 0) top--;
  st[++top] = p[i];
}
for(int i = n - 1, t = top; i >= 1; i--){
  while(top > t && cross(st[top] - st[top - 1], p[i] - st[top]) <= 0) top--;
  st[++top] = p[i];
}
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

## 40. [P3829 [SHOI2012] 信用卡凸包](https://www.luogu.com.cn/problem/P3829)

`Minkowski` `凸包`

### 题意

每张信用卡是一个圆角矩形，给出若干张卡片的中心、旋转角和统一规格，求它们总体轮廓的凸包周长。

### 分析

圆角矩形可以看成“内核矩形”与半径 `r` 的圆的 Minkowski 和。若先把每张卡片去掉四个圆角，只保留中间矩形的四个顶点，所有卡片并起来后的凸包周长等于这些顶点凸包的周长，再额外加上整整一圈圆弧长度 `2πr`。所以实现上只需求出所有变换后角点的二维凸包。

### 核心代码

```cpp
for(int i = 1; i <= n; i++){
  for(auto &q : coreCorners(a - 2 * r, b - 2 * r)){
    pts.push_back(rotate(q, theta[i]) + center[i]);
  }
}
Hull h = convexHull(pts);
ans = perimeter(h) + 2 * PI * r;
```

### 复杂度

时间 `O(n log n)`，空间 `O(n)`。

---

## 41. [P4724 【模板】三维凸包](https://www.luogu.com.cn/problem/P4724)

`三维凸包` `增量法`

### 题意

给出三维空间点集，求其凸包表面积。

### 分析

标准增量法。先找出四个不共面的点建立初始四面体，再依次插入新点：把所有能被该点看到的面删掉，找到可见面与不可见面之间形成的边界圈，用新点与这些边界边重新拼出新的三角面。最后把全部外侧三角面的面积加起来。

### 核心代码

```cpp
for(int i = 5; i <= n; i++){
  vector<Face> vis;
  for(auto &f : face) if(volume(f, p[i]) > eps) vis.push_back(f);
  auto border = getBorder(vis);
  eraseVisible(face, vis);
  for(auto &e : border) face.push_back({e.a, e.b, i});
}
for(auto &f : face) ans += area(p[f.a], p[f.b], p[f.c]);
```

### 复杂度

时间 `O(n^2)`，空间 `O(n^2)`。

---

## 42. [P2287 [HNOI2004] 最佳包裹](https://www.luogu.com.cn/problem/P2287)

`三维凸包` `最小包裹面积`

### 题意

空间中给出金属制品的若干顶点，金属条在顶点处连接。用材料把整件制品完整包裹起来，求最小所需面积。

### 分析

最省材料的包裹一定是这件制品的凸包表面；而由线段拼成的整体，其凸包只由所有顶点决定，所以本题本质上仍然是三维凸包表面积。和模板题相比，差别只在输出精度更高，几何判零需要更稳。

### 核心代码

```cpp
buildInitialTetrahedron();
for(int i = 5; i <= n; i++) addPointToHull(i);
double ans = 0;
for(auto &f : face){
  if(!dead[f.id]) ans += area(p[f.a], p[f.b], p[f.c]);
}
printf("%.6f\n", ans);
```

### 复杂度

时间 `O(n^2)`，空间 `O(n^2)`。

---
