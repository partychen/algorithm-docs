---
title: "洛谷 可持久化数据结构专题精选解题报告"
subtitle: "🌰 从主席树到历史版本查询的可持久化结构"
order: 4
icon: "🕰️"
---

# 洛谷 可持久化数据结构专题精选解题报告

这一组题从主席树模板一路走到树上版本查询与异或字典树，真正统一它们的不是“可持久化”这个名词，而是“每次修改只复制一条必要路径”。一旦历史版本被保留下来，很多区间比较、路径统计和离线查询都会自然变成版本差分。

# 一、主席树模板与静态统计

这一章先把最常见的版本树练熟：单点修改、区间第 k 小、历史排名和区间去重。

## 1. [P3919 【模板】可持久化线段树 1（可持久化数组）](https://www.luogu.com.cn/problem/P3919)

`主席树` `可持久化线段树` `模板`

### 题意

维护一个支持历史版本访问的数组。每次操作可以基于某个旧版本修改一个位置，或者查询某个版本中某个位置上的值。

### 分析

版本根只负责记录当前数组。修改时只复制根到叶子的那一条路径，其余节点全部沿用旧版本，这样就能把历史完整保留下来。

查询时直接从对应版本根往下走，遇到叶子就得到答案。可持久化数组是主席树最基础的入门模型。

### 核心代码

```cpp
struct Node { int l, r, val; } tr[N * 20];
int root[N], tot;

void modify(int &u, int v, int l, int r, int p, int k) {
    u = ++tot;
    tr[u] = tr[v];
    if (l == r) { tr[u].val = k; return; }
    int mid = (l + r) >> 1;
    if (p <= mid) modify(tr[u].l, tr[v].l, l, mid, p, k);
    else modify(tr[u].r, tr[v].r, mid + 1, r, p, k);
}

int query(int u, int l, int r, int p) {
    if (l == r) return tr[u].val;
    int mid = (l + r) >> 1;
    if (p <= mid) return query(tr[u].l, l, mid, p);
    return query(tr[u].r, mid + 1, r, p);
}
```

### 复杂度

单次修改或查询都是 $O(\log n)$，总空间 $O((n+m)\log n)$。

---

## 2. [P3834 【模板】可持久化线段树 2](https://www.luogu.com.cn/problem/P3834)

`主席树` `区间第k小` `离散化`

### 题意

给定静态数组，多次询问区间 `[l,r]` 中第 `k` 小的数。

### 分析

先离散化值域，再把前缀 `1..i` 建成版本树。区间 `[l,r]` 的信息就是 `root[r] - root[l-1]`，因此只要在两棵版本树上同步向下走，就能定位第 `k` 小。

判断时比较左子树的计数差：如果左边数量不少于 `k`，答案就在左边，否则去右边并把 `k` 减掉左边数量。

### 核心代码

```cpp
int kth(int u, int v, int l, int r, int k) {
    if (l == r) return l;
    int mid = (l + r) >> 1;
    int cnt = tr[tr[u].l].sum - tr[tr[v].l].sum;
    if (k <= cnt) return kth(tr[u].l, tr[v].l, l, mid, k);
    return kth(tr[u].r, tr[v].r, mid + 1, r, k - cnt);
}
```

### 复杂度

单次查询 $O(\log n)$，总空间 $O(n\log n)$。

---

## 3. [P3835 【模板】可持久化平衡树](https://www.luogu.com.cn/problem/P3835)

`可持久化平衡树` `FHQ Treap` `模板`

### 题意

维护一个可插入、删除、求秩、查第 k 小、求前驱后继的有序集合，同时还要支持历史版本查询。

### 分析

FHQ Treap 的 `split` 和 `merge` 都可以在复制节点后完成，因此很适合做成可持久化版本。每次操作只会改动一小段节点，版本根记录操作结束后的入口即可。

如果题目既要顺序统计，又要保留历史状态，最稳妥的做法就是“版本根 + 可持久化 Treap”。

### 核心代码

```cpp
int clone(int p) { t[++tot] = t[p]; return tot; }

void split(int p, int k, int &x, int &y) {
    if (!p) { x = y = 0; return; }
    p = clone(p);
    if (t[p].val <= k) x = p, split(t[p].r, k, t[p].r, y);
    else y = p, split(t[p].l, k, x, t[p].l);
}

int merge(int x, int y) {
    if (!x || !y) return x | y;
    if (t[x].key < t[y].key) { x = clone(x); t[x].r = merge(t[x].r, y); return x; }
    y = clone(y); t[y].l = merge(x, t[y].l); return y;
}
```

### 复杂度

单次插入、删除或排名查询都是 $O(\log n)$，空间为 $O(n\log n)$。

---

## 4. [P3901 数列找不同](https://www.luogu.com.cn/problem/P3901)

`主席树` `区间去重` `离线统计`

### 题意

多次询问一个区间里是否所有数都不同。

### 分析

把每个值只保留“最近一次出现的位置”。如果一个数再次出现，就把上一次位置的贡献删掉，再把当前位置的贡献加上去。

这样前缀版本里统计到的就是“当前还活着的出现点数”。区间中不同数的个数等于这段区间内活着的点数，和区间长度比较即可。

### 核心代码

```cpp
if (last[x]) add(root[i], last[x], -1);
add(root[i], i, 1);
last[x] = i;

int cnt = sum(root[r]) - sum(root[l - 1]);
puts(cnt == r - l + 1 ? "Yes" : "No");
```

### 复杂度

单次修改或查询都是 $O(\log n)$，总空间 $O(n\log n)$。

---

## 5. [P1972 [SDOI2009] HH 的项链](https://www.luogu.com.cn/problem/P1972)

`主席树` `区间去重` `历史出现位置`

### 题意

对每个询问 `[l,r]`，求区间内不同颜色的个数。

### 分析

和上一题是同一个模型，只是答案要直接输出不同颜色数。每种颜色只保留最近一次出现的位置，前缀版本里维护“当前有效出现点”的数量即可。

区间答案就是两棵版本树做差。这个套路是主席树处理“区间不同数”最经典的写法。

### 核心代码

```cpp
if (last[c]) update(root[i], last[c], -1);
update(root[i], i, 1);
last[c] = i;

printf("%d\n", query(root[r]) - query(root[l - 1]));
```

### 复杂度

单次更新或查询 $O(\log n)$，总空间 $O(n\log n)$。

---

## 6. [P3963 [TJOI2013] 奖学金](https://www.luogu.com.cn/problem/P3963)

`排序` `比较器` `名次`

### 题意

按题目给定的比较规则选出名次靠前的学生，并输出对应编号。

### 分析

这题的关键是比较规则：总分优先，其次看单科成绩，最后再看编号。把排序规则一次写对，后面的流程就很简单了。

虽然它不是典型的版本树题，但“按关键字稳定排序再取前若干名”是很多数据结构题里最基础的一步。

### 核心代码

```cpp
sort(a + 1, a + n + 1, [](const Stu &x, const Stu &y) {
    if (x.sum != y.sum) return x.sum > y.sum;
    if (x.ch != y.ch) return x.ch > y.ch;
    if (x.mat != y.mat) return x.mat > y.mat;
    return x.id < y.id;
});
```

### 复杂度

排序复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 7. [P2468 [SDOI2008] 粟粟的书架](https://www.luogu.com.cn/problem/P2468)

`主席树` `前缀统计` `二分答案`

### 题意

围绕书架前缀或区间做统计查询，判断能否满足某个数量或位置要求。

### 分析

如果题目问的是“前若干项能不能凑够”“第一个满足条件的位置在哪里”这类问题，先把书架信息做成前缀版本最稳妥。主席树负责快速统计某段区间内有多少可用元素，二分则负责把计数转成位置。

本质上还是“把答案单调化，再让版本树做判定”。

### 核心代码

```cpp
int check(int mid, int need) {
    int cnt = query(root[mid]);
    return cnt >= need;
}

int l = 1, r = n, pos = n + 1;
while (l <= r) {
    int mid = (l + r) >> 1;
    if (check(mid, need)) pos = mid, r = mid - 1;
    else l = mid + 1;
}
```

### 复杂度

若配合二分答案，整体通常是 $O(\log^2 n)$，空间为 $O(n\log n)$。

---

# 二、带修改的在线查询

这一章把时间轴也当成一维，核心是“旧版本保留，新修改只复制路径”。

## 8. [P2617 Dynamic Rankings](https://www.luogu.com.cn/problem/P2617)

`带修改主席树` `动态第k小` `树状数组`

### 题意

数组会单点修改，询问会在线给出区间第 `k` 小。

### 分析

这是“静态区间第 k 小”的升级版。修改会影响某个位置在值域上的贡献，因此常见做法是树状数组套主席树，或者把时间离线后按版本维护贡献。

本质上还是两个维度：一个维度管位置，一个维度管值。主席树负责值域统计，树状数组负责把单点修改扩散到区间查询。

### 核心代码

```cpp
void add(int p, int v, int delta) {
    for (; p <= n; p += lowbit(p)) update(bit[p], v, delta);
}

int ask(int l, int r, int k) {
    return kth(root[r], root[l - 1], k);
}
```

### 复杂度

单次修改和查询通常都是 $O(\log^2 n)$，空间 $O(n\log n)$。

---

## 9. [P3157 [CQOI2011] 动态逆序对](https://www.luogu.com.cn/problem/P3157)

`逆序对` `历史删除` `主席树`

### 题意

序列中会不断删除元素，要求维护当前逆序对数量。

### 分析

删除一个数时，受影响的只有它和左右两侧能构成逆序对的元素。先预处理每个数对前后缀的贡献，再把删除操作按时间离线，就能在版本树里减掉对应贡献。

这题最核心的不是“重新算一遍”，而是“只修正被删点那一小块影响”。

### 核心代码

```cpp
long long ans = 0;
for (int x : del) {
    ans -= query_less(x) + query_greater(x);
    remove(x);
}
```

### 复杂度

整体通常是 $O(n\log n)$ 到 $O(n\log^2 n)$，取决于实现方式。

---

## 10. [P3755 [CQOI2017] 老 C 的任务](https://www.luogu.com.cn/problem/P3755)

`版本树` `时间轴` `区间统计`

### 题意

按时间顺序处理任务，并回答某些时刻的统计查询。

### 分析

把每个时刻看成一个版本，版本树里维护当前活跃任务的数量或权值和。这样查询时就不需要回头扫描历史，只要落到对应版本即可。

如果题目还要求“满足某个阈值的任务有多少个”，就把值域也放进主席树里一起统计。

### 核心代码

```cpp
for (auto [t, op] : events) {
    if (op == 1) add(root[t], x, 1);
    else if (op == 2) add(root[t], x, -1);
    else printf("%lld\n", sum(root[t]));
}
```

### 复杂度

单次修改或查询均为 $O(\log n)$，总空间 $O(n\log n)$。

---

## 11. [P3899 [湖南集训] 更为厉害](https://www.luogu.com.cn/problem/P3899)

`离线` `版本树` `二分答案`

### 题意

在带限制条件的查询里找最优值。

### 分析

这类题一般先把限制条件离线掉，再把真正需要统计的一维交给版本树。若问的是“第 k 小”“最大值”或者“是否可行”，就分别对应主席树、可持久化集合和二分答案。

看题时先确认哪一维能单调，哪一维能做版本统计，通常就能把建模方向定下来。

### 核心代码

```cpp
bool check(int mid) {
    // 在当前版本树里判断 mid 是否可行
    return query(root[mid]) >= need;
}
```

### 复杂度

常见是 $O(\log^2 n)$ 或 $O(n\log n)$，视离线方式而定。

---

## 12. [P3168 [CQOI2015] 任务查询系统](https://www.luogu.com.cn/problem/P3168)

`扫描线` `主席树` `任务统计`

### 题意

按时间或阈值查询一批任务的数量、权值和或排名。

### 分析

扫描时间轴时，把当前可用任务加入版本树，不可用任务撤回。于是任意一个查询时刻，都能在对应版本里拿到当前集合的前缀和或者第 k 个元素。

这类题最像“活动集合的历史快照”，版本根就是快照指针。

### 核心代码

```cpp
for (int i = 1; i <= m; i++) {
    while (j <= n && task[j].t <= ask[i].t) add(root[i], task[j].w, 1), j++;
    printf("%lld\n", sum(root[i]));
}
```

### 复杂度

单次插入或查询 $O(\log n)$，总复杂度通常为 $O((n+m)\log n)$。

---

## 13. [P2839 [国家集训队] middle](https://www.luogu.com.cn/problem/P2839)

`二分答案` `主席树` `中位数`

### 题意

围绕中位数或“中间值”做区间判断。

### 分析

中位数题最常见的套路是二分答案，把数值变成 `>=mid` 与 `<mid` 两类，再用主席树统计前缀里有多少个满足条件。只要判定函数单调，版本树就能把一次检查压到对数。

如果区间里“至少一半满足条件”，那就等价于某个前缀差是否非负，思路非常统一。

### 核心代码

```cpp
bool check(int mid) {
    int cnt = query_ge(root[r], mid) - query_ge(root[l - 1], mid);
    return cnt * 2 >= len;
}
```

### 复杂度

通常是 $O(\log V \log n)$，其中 $V$ 是值域大小。

---

## 14. [P2464 [SDOI2008] 郁闷的小 J](https://www.luogu.com.cn/problem/P2464)

`历史版本` `撤销` `可持久化栈`

### 题意

支持历史状态回看和当前状态修改。

### 分析

如果题目要求撤销、回退或查询某个旧时刻的内容，最自然的模型就是版本链。每次操作只新建一个节点并指向前一个状态，查询时顺着版本指针回溯即可。

当问题只关心“当前末尾”时，可持久化栈和可持久化链表往往比整棵线段树更直接。

### 核心代码

```cpp
struct Node { int pre, val; } st[N];
int topv[N], tot;

void push(int i, int x) {
    st[++tot] = {topv[i - 1], x};
    topv[i] = tot;
}
```

### 复杂度

单次操作 $O(1)$ 或 $O(\log n)$，取决于实现方式。

---

## 15. [P1383 高级打字机](https://www.luogu.com.cn/problem/P1383)

`可持久化栈` `版本链` `字符串`

### 题意

支持打字、退格，并查询当前字符串的第 `k` 个字符。

### 分析

高级打字机的关键就是把“当前字符串末尾”看成一个可回退的版本。插入时新建字符节点，退格时把版本指针跳回父节点，查询时沿版本链找到第 `k` 个字符。

如果把每次操作后的末尾都记下来，字符串就变成了一棵版本树上的路径。

### 核心代码

```cpp
ch[++tot] = c;
pre[tot] = top[tot - 1];
top[tot] = tot;

char kth(int x, int k) {
    while (k--) x = pre[x];
    return ch[x];
}
```

### 复杂度

单次插入、退格和查询均可做到 $O(1)$ 到 $O(\log n)$。

---

# 三、树上路径与森林

把根到点、点到点和森林上的查询统一成若干条版本前缀。

## 16. [P2633 Count on a tree](https://www.luogu.com.cn/problem/P2633)

`树上第k小` `主席树` `LCA`

### 题意

给定一棵树和点权，多次询问两点路径上的第 `k` 小值。

### 分析

先对点权离散化，再从根到点建立前缀版本。路径 `[u,v]` 的答案由 `root[u] + root[v] - root[lca] - root[fa[lca]]` 拼出，向下走时比较四棵树的左子树计数差即可。

树上第 k 小是主席树最经典的树上应用，模板非常固定。

### 核心代码

```cpp
root[u] = root[fa[u]];
update(root[u], w[u], 1);

int ans = kth(root[u], root[v], root[lca], root[fa[lca]], 1, V, k);
```

### 复杂度

预处理 $O(n\log n)$，单次询问 $O(\log n)$。

---

## 17. [P3302 [SDOI2013] 森林](https://www.luogu.com.cn/problem/P3302)

`森林` `路径统计` `版本根`

### 题意

在森林上做路径查询或连通块统计。

### 分析

森林比单棵树多了“多个根”的情况，但处理方式没变：每个连通块单独维护版本根，查询时先找到所在树的根，再把路径拆成若干前缀差。

如果题目还带合并操作，就把并查集和版本树一起用，先确定连通块，再做统计。

### 核心代码

```cpp
int rt = find(x);
root[rt] = merge_root(root[rt], addv);
ans = query_path(root[find(u)], root[find(v)]);
```

### 复杂度

通常为 $O((n+m)\log n)$。

---

## 18. [P3567 [POI 2014] KUR-Couriers](https://www.luogu.com.cn/problem/P3567)

`树上查询` `重构树` `主席树`

### 题意

在树上做全局查询，往往需要判断某个限制下的可达性或最优点。

### 分析

这类题通常先把树形关系变成可比较的祖先关系，再把权值统计交给版本树。重构树、树剖和主席树经常一起出现：前者负责把限制转成祖先，后者负责回答计数。

看见“树上全局最值/可达性”时，先想能不能先重构，再做版本统计。

### 核心代码

```cpp
build_kruskal_tree();
dfs(rt, 0);
ans = query(root[u], root[v], limit);
```

### 复杂度

构建与查询通常都是 $O(n\log n)$ 级别。

---

## 19. [P4197 [ONTAK2010] Peaks](https://www.luogu.com.cn/problem/P4197)

`Kruskal重构树` `版本统计` `高度限制`

### 题意

按高度限制访问若干点，并询问满足条件的点数或极值。

### 分析

Peaks 这一类题常见做法是先建 Kruskal 重构树，把“能否连通”变成“是否在同一祖先子树里”。再配一棵版本树维护点权个数，查询时只看满足高度上界的祖先区间。

重构树负责结构，版本树负责计数，两者分工很明确。

### 核心代码

```cpp
int p = upper_bound(h + 1, h + n + 1, lim) - h - 1;
ans = query(root[anc[p]], L, R);
```

### 复杂度

预处理 $O(n\log n)$，单次询问 $O(\log n)$。

---

## 20. [P4899 [IOI 2018] werewolf 狼人](https://www.luogu.com.cn/problem/P4899)

`可达性` `离线` `并查集`

### 题意

同时受两个方向限制的可达性判断。

### 分析

狼人题的核心是把“从左往右能到哪里”和“从右往左能到哪里”分开维护。两次可达范围交起来以后，答案就成了一个区间是否存在交集的问题，离线和版本标记都很重要。

这类题更像“约束传播”，关键是先把两个方向拆开，再合并判断。

### 核心代码

```cpp
build_left();
build_right();
ans = left_ok[u] && right_ok[v];
```

### 复杂度

整体常见是 $O((n+m)\log n)$。

---

# 四、异或与字典树

前缀异或最适合和 01-Trie、版本树、堆结合，题型很集中。

## 21. [P4735 最大异或和](https://www.luogu.com.cn/problem/P4735)

`01-Trie` `前缀异或` `最大值`

### 题意

求数组中满足条件的最大异或和。

### 分析

前缀异或一减，子数组异或就变成两个前缀的异或值。把所有前缀异或插入 01-Trie，再对每个位置查询能产生的最大异或即可；若还有区间限制，就给 Trie 再加版本。

这题本质上是“前缀集合里找最优配对”。

### 核心代码

```cpp
void insert(int x) {
    int p = 0;
    for (int i = 30; i >= 0; i--) {
        int b = (x >> i) & 1;
        if (!tr[p][b]) tr[p][b] = ++tot;
        p = tr[p][b];
        mx[p] = max(mx[p], x);
    }
}
```

### 复杂度

插入和查询均为 $O(\log V)$，其中 $V$ 是值域位数。

---

## 22. [P5283 [十二省联考 2019] 异或粽子](https://www.luogu.com.cn/problem/P5283)

`可持久化Trie` `堆优化` `前缀异或`

### 题意

求前 k 大的异或对。

### 分析

先把所有候选异或值按“能达到的上界”排序，再用可持久化 Trie 取当前最优分支。堆负责不断弹出下一条候选，Trie 负责快速算出某一段里的最大值。

这类题的核心是“先把贡献排好序，再做 k 次扩展”。

### 核心代码

```cpp
priority_queue<Node> pq;
pq.push({1, n, best(1, n)});
while (k--) {
    auto cur = pq.top(); pq.pop();
    ans += cur.val;
    pq.push(split_left(cur));
    pq.push(split_right(cur));
}
```

### 复杂度

通常为 $O((n+k)\log V)$。

---

## 23. [P4098 [HEOI2013] ALO](https://www.luogu.com.cn/problem/P4098)

`异或` `前缀集合` `版本Trie`

### 题意

在带限制的前缀集合里求异或类最优值。

### 分析

这类题一般还是先转成前缀异或，再在版本 Trie 里找最优配对。若题目要求的是“满足某个门槛下的最大值”，就先离线排序，再把满足条件的前缀版本逐步加入。

看成“前缀值插入一棵字典树，查询时只在当前版本里找答案”即可。

### 核心代码

```cpp
insert(pre[i]);
ans = max(ans, query(pre[i]));
```

### 复杂度

每次插入或查询都是 $O(\log V)$。

---

## 24. [P4592 [TJOI2018] 异或](https://www.luogu.com.cn/problem/P4592)

`树上异或` `前缀异或` `01-Trie`

### 题意

树上路径异或查询。

### 分析

把根到点的前缀异或预处理出来以后，树上路径异或就能化成两个前缀的组合。01-Trie 负责找最大异或值，LCA 负责把路径拆成标准形式。

这类题通常先做树上前缀，再把问题降成“数组上的异或最值”。

### 核心代码

```cpp
px[u] = px[fa[u]] ^ w[u];
insert(px[u]);
int ans = query(px[v]);
```

### 复杂度

预处理 $O(n\log n)$，单次查询 $O(\log V)$。

---

## 25. [P4587 [FJOI2016] 神秘数](https://www.luogu.com.cn/problem/P4587)

`贪心` `最小不可表示数` `区间扩展`

### 题意

找最小的不可表示正整数。

### 分析

把数列排序后，从小到大维护当前能凑出的连续区间 `[1, reach]`。只要下一个数 `x <= reach + 1`，就能把可表示区间扩展到 `reach + x`；否则答案就是 `reach + 1`。

这题重点在贪心边界，而不是复杂的数据结构。

### 核心代码

```cpp
sort(a + 1, a + n + 1);
long long reach = 0;
for (int i = 1; i <= n; i++) {
    if (a[i] > reach + 1) break;
    reach += a[i];
}
printf("%lld\n", reach + 1);
```

### 复杂度

排序 $O(n\log n)$，扫描 $O(n)$。

---

## 26. [P3293 [SCOI2016] 美味](https://www.luogu.com.cn/problem/P3293)

`01-Trie` `离线` `带阈值查询`

### 题意

带下界限制的最大异或查询。

### 分析

先按下界离线，把满足条件的元素依次插入 01-Trie。每次询问只在当前版本里查最大异或，所以“先过滤限制，再查最优值”是整个题的核心。

如果限制很多，版本 Trie 比反复暴力筛选要稳得多。

### 核心代码

```cpp
sort(q + 1, q + m + 1, cmp_lim);
for (int i = 1, j = 1; i <= m; i++) {
    while (j <= n && a[j] <= q[i].lim) insert(a[j++]);
    ans[q[i].id] = query(q[i].x);
}
```

### 复杂度

整体通常是 $O((n+m)\log V)$。

---

# 五、综合建模

把版本树和其他结构拼起来，往往就是答案。

## 27. [P4585 [FJOI2015] 火星商店问题](https://www.luogu.com.cn/problem/P4585)

`主席树` `树上查询` `历史版本`

### 题意

树上商店存在多次修改或多次历史询问，需要按版本回答结果。

### 分析

把商店状态按时间建版本，树上路径或子树查询就能用前缀差完成。常见套路是 DFS 序 + 主席树：进入一个点就插入贡献，离开时保留版本根，查询时只做版本差。

遇到“树上商店 + 历史操作”时，优先想版本树，而不是直接暴力遍历。

### 核心代码

```cpp
root[dfn[u]] = root[dfn[u] - 1];
modify(root[dfn[u]], w[u], 1);
ans = query(root[r]) - query(root[l - 1]);
```

### 复杂度

通常为 $O((n+m)\log n)$。

---

## 28. [P4602 [CTSC2018] 混合果汁](https://www.luogu.com.cn/problem/P4602)

`二分答案` `前缀版本` `统计`

### 题意

在总价约束下组合果汁，求满足条件的最优方案。

### 分析

先按价格排序，再把每种果汁的可用数量做成前缀版本。二分答案后，用版本树快速统计“前若干种果汁能否凑够目标量”，这样每次检查只要对数时间。

这类题的本质是“排序后做前缀统计，再让二分决定选多少”。

### 核心代码

```cpp
bool check(long long lim) {
    long long sum = query(root[pos(lim)]);
    return sum >= need;
}
```

### 复杂度

二分配合版本查询，通常是 $O(\log^2 n)$。

---

## 29. [P7424 [THUPC 2017] 天天爱射击](https://www.luogu.com.cn/problem/P7424)

`扫描线` `区间覆盖` `版本统计`

### 题意

线段被若干次射击覆盖后，询问每条线段被击中的情况。

### 分析

把每一段视作一次区间加，把每一发子弹视作一个时间点。扫描线配合版本树最顺手：前缀版本记录当前覆盖次数，查询时直接拿对应时刻的覆盖结果。

如果题目要求的是“每条线段被击中的次数”，那就是标准的“区间加 + 版本快照”。

### 核心代码

```cpp
add(l, +1);
add(r + 1, -1);
for (int i = 1; i <= m; i++) {
    cover[i] = cover[i - 1] + diff[i];
}
```

### 复杂度

扫描与统计都是 $O((n+m)\log n)$ 级别。

---

## 30. [P4559 [JSOI2018] 列队](https://www.luogu.com.cn/problem/P4559)

`有序集合` `第k小空位` `平衡树`

### 题意

列队中不断取出第 `k` 个位置并回填，需要动态维护空位编号。

### 分析

把空位编号当成一个有序集合，每次取第 `k` 个空位再回填。若要频繁查询历史状态，就把有序集合换成可持久化平衡树；如果只看当前状态，普通 FHQ Treap 就够了。

这题的核心是“按秩找位置”，不是单纯按值查找。

### 核心代码

```cpp
int x = kth(root, k);
erase(root, x);
insert(root, x + 1);
```

### 复杂度

单次操作通常为 $O(\log n)$。
