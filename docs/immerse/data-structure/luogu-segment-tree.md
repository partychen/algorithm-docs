---
title: "洛谷 线段树专题精选解题报告"
subtitle: "🌲 从懒标记到李超树、树套树与动态开点"
order: 2
icon: "🌲"
---

# 洛谷 线段树专题精选解题报告

这一组题从最基础的懒标记一路走到树套树、李超线段树、动态开点、线段树合并与动态 DP，主线始终很清楚：只要问题能被压成一棵按区间分治的骨架，线段树就能继续往外长。它不只是一个模板，而是一整套“区间结构化维护”的方法族。

# 一、基础区间维护与懒标记

这一章先把区间加、乘加、翻转、赋值、最大值剪枝这些最常用的线段树基本功打牢。

## 1. [P3372 【模板】线段树 1](https://www.luogu.com.cn/problem/P3372)
`线段树` `懒标记` `区间加`
### 题意
给定一个长度为 `n` 的数组，操作只有两类：把区间 `[l,r]` 所有数同时加上 `k`，以及查询区间 `[l,r]` 的元素和。
### 分析
核心就是**懒标记线段树**。节点维护区间和，整段加法时直接把增量乘区间长度记到 `sum`，再把加法记进 `tag`，只有继续下探时才下传。
### 核心代码
```cpp
struct Node { long long sum, tag; } tr[N << 2];

void apply(int p, int l, int r, long long v) {
    tr[p].sum += v * (r - l + 1);
    tr[p].tag += v;
}
void push(int p, int l, int r) {
    if (!tr[p].tag || l == r) return;
    int mid = (l + r) >> 1;
    apply(p << 1, l, mid, tr[p].tag);
    apply(p << 1 | 1, mid + 1, r, tr[p].tag);
    tr[p].tag = 0;
}
```
### 复杂度
单次修改、查询都是 `O(log n)`，空间复杂度 `O(n)`。
---

## 2. [P3373 【模板】线段树 2](https://www.luogu.com.cn/problem/P3373)
`线段树` `懒标记` `区间乘加` `取模`
### 题意
给定数组和模数，支持区间乘、区间加、区间求和三种操作，所有结果都对给定模数取模。
### 分析
这里的区间修改是**仿射变换** `x -> x * mul + add`，所以节点除了 `sum` 还要维护两个懒标记 `mul`、`add`。合并标记时必须先乘后加，否则下传顺序会错。
### 核心代码
```cpp
struct Node { long long sum, mul, add; } tr[N << 2];

void apply(int p, int l, int r, long long mul, long long add) {
    tr[p].sum = (tr[p].sum * mul + add * (r - l + 1)) % mod;
    tr[p].mul = tr[p].mul * mul % mod;
    tr[p].add = (tr[p].add * mul + add) % mod;
}
void push(int p, int l, int r) {
    if (l == r) return;
    int mid = (l + r) >> 1;
    apply(p << 1, l, mid, tr[p].mul, tr[p].add);
    apply(p << 1 | 1, mid + 1, r, tr[p].mul, tr[p].add);
    tr[p].mul = 1; tr[p].add = 0;
}
```
### 复杂度
单次操作 `O(log n)`，空间复杂度 `O(n)`。
---

## 3. [P2023 [AHOI2009] 维护序列](https://www.luogu.com.cn/problem/P2023)
`线段树` `懒标记` `区间乘加` `取模`
### 题意
给定序列，要求在模数意义下维护区间乘法、区间加法，并回答任意区间和。
### 分析
做法与模板二完全一致，仍然是**乘加懒标记线段树**。关键点不是建树，而是保证父节点的仿射操作按函数复合顺序下传到儿子。
### 核心代码
```cpp
void apply(int p, int l, int r, long long mul, long long add) {
    tr[p].sum = (tr[p].sum * mul + add * (r - l + 1)) % mod;
    tr[p].mul = tr[p].mul * mul % mod;
    tr[p].add = (tr[p].add * mul + add) % mod;
}

void range_mul(int p, int l, int r, int ql, int qr, long long v);
void range_add(int p, int l, int r, int ql, int qr, long long v);
long long query(int p, int l, int r, int ql, int qr);
```
### 复杂度
单次修改、查询都是 `O(log n)`。
---

## 4. [P1438 无聊的数列](https://www.luogu.com.cn/problem/P1438)
`差分` `线段树` `等差数列`
### 题意
对数组多次执行“给区间 `[l,r]` 加上一段首项和公差已知的等差数列”，并查询某个位置当前的值。
### 分析
把原数组转成差分后，等差数列加法会拆成少量端点修改：`b[l]+=k`、`b[l+1..r]+=d`、`b[r+1]-=k+(r-l)d`。于是题目变成**差分 + 线段树维护区间加、单点前缀和查询**。
### 核心代码
```cpp
void upd(int p, int l, int r, int ql, int qr, long long v);
long long ask(int p, int l, int r, int pos);

void modify_ap(int l, int r, long long k, long long d) {
    upd(1, 1, n, l, l, k);
    if (l + 1 <= r) upd(1, 1, n, l + 1, r, d);
    if (r + 1 <= n) upd(1, 1, n, r + 1, r + 1, -(k + 1LL * (r - l) * d));
}
```
### 复杂度
单次操作 `O(log n)`，空间复杂度 `O(n)`。
---

## 5. [CF438D The Child and Sequence](https://www.luogu.com.cn/problem/CF438D)
`线段树` `最大值剪枝` `区间取模`
### 题意
维护数组，支持区间求和、区间取模 `a[i]%=x` 和单点赋值，要求在线回答所有操作。
### 分析
区间取模最怕整段暴力，但有个关键性质：若当前节点最大值 `< x`，这一段取模后完全不变，所以可以用**最大值剪枝线段树**。节点维护 `sum` 和 `mx`，只有 `mx >= x` 才继续递归。
### 核心代码
```cpp
struct Node { long long sum; int mx; } tr[N << 2];

void mod(int p, int l, int r, int ql, int qr, int x) {
    if (tr[p].mx < x) return;
    if (l == r) {
        tr[p].sum %= x;
        tr[p].mx = (int)tr[p].sum;
        return;
    }
    int mid = (l + r) >> 1;
    if (ql <= mid) mod(p << 1, l, mid, ql, qr, x);
    if (qr > mid) mod(p << 1 | 1, mid + 1, r, ql, qr, x);
    pull(p);
}
```
### 复杂度
均摊修改 `O(log n)` 到 `O(log^2 n)`，查询 `O(log n)`。
---

## 6. [CF920F SUM and REPLACE](https://www.luogu.com.cn/problem/CF920F)
`线段树` `最大值剪枝` `约数个数`
### 题意
多次把区间 `[l,r]` 中每个数替换成它的约数个数 `d(x)`，同时查询区间和。
### 分析
约数个数函数反复作用后很快稳定到 `1` 或 `2`，因此同样能用**最大值剪枝**。节点维护区间和和区间最大值；若 `mx <= 2`，这段再替换也不会变化，直接剪掉。
### 核心代码
```cpp
int divs[MAXA];
struct Node { long long sum; int mx; } tr[N << 2];

void replace(int p, int l, int r, int ql, int qr) {
    if (tr[p].mx <= 2) return;
    if (l == r) {
        tr[p].sum = tr[p].mx = divs[tr[p].mx];
        return;
    }
    int mid = (l + r) >> 1;
    if (ql <= mid) replace(p << 1, l, mid, ql, qr);
    if (qr > mid) replace(p << 1 | 1, mid + 1, r, ql, qr);
    pull(p);
}
```
### 复杂度
总修改次数受数值快速收敛限制，均摊 `O((n+q)log n)`。
---

## 7. [P4145 上帝造题的七分钟 2 / 花神游历各国](https://www.luogu.com.cn/problem/P4145)
`线段树` `最大值剪枝` `区间开方`
### 题意
支持把区间 `[l,r]` 中每个数替换成 `floor(sqrt(a[i]))`，并查询区间和。
### 分析
开方和取模一样有明显的收敛性。若某段最大值 `<= 1`，再开方也不变，所以用**最大值剪枝线段树**维护 `sum` 与 `mx` 即可。
### 核心代码
```cpp
void modify_sqrt(int p, int l, int r, int ql, int qr) {
    if (tr[p].mx <= 1) return;
    if (l == r) {
        tr[p].sum = tr[p].mx = (long long)sqrt(tr[p].sum);
        return;
    }
    int mid = (l + r) >> 1;
    if (ql <= mid) modify_sqrt(p << 1, l, mid, ql, qr);
    if (qr > mid) modify_sqrt(p << 1 | 1, mid + 1, r, ql, qr);
    pull(p);
}
```
### 复杂度
均摊修改 `O(log n)`，查询 `O(log n)`。
---

## 8. [P1890 gcd 区间](https://www.luogu.com.cn/problem/P1890)
`线段树` `gcd` `区间查询`
### 题意
给定数组，反复询问某个区间 `[l,r]` 所有数的最大公约数。
### 分析
这是最直接的**区间 gcd 线段树**。节点维护整段 `gcd`，查询时左右结果再做一次 `gcd` 合并即可。
### 核心代码
```cpp
int gcd(int a, int b) { return b ? gcd(b, a % b) : a; }

void pull(int p) {
    tr[p] = gcd(tr[p << 1], tr[p << 1 | 1]);
}
int query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tr[p];
    int mid = (l + r) >> 1, res = 0;
    if (ql <= mid) res = gcd(res, query(p << 1, l, mid, ql, qr));
    if (qr > mid) res = gcd(res, query(p << 1 | 1, mid + 1, r, ql, qr));
    return res;
}
```
### 复杂度
单次查询 `O(log n)`，空间复杂度 `O(n)`。
---

## 9. [SP2713 GSS4 - Can you answer these queries IV](https://www.luogu.com.cn/problem/SP2713)
`线段树` `最大值剪枝` `区间开方`
### 题意
对序列执行区间开方并查询区间和，操作数量大，要求快速在线处理。
### 分析
本题和花神游历各国是同一类模型，仍然使用**最大值剪枝**。区别只在数据范围更大，写法上要尽量减少无效递归，`mx <= 1` 就立刻返回。
### 核心代码
```cpp
struct Node { long long sum; int mx; } tr[N << 2];

void upd(int p, int l, int r, int ql, int qr) {
    if (tr[p].mx <= 1) return;
    if (l == r) {
        tr[p].sum = tr[p].mx = (int)sqrt(tr[p].sum);
        return;
    }
    int mid = (l + r) >> 1;
    if (ql <= mid) upd(p << 1, l, mid, ql, qr);
    if (qr > mid) upd(p << 1 | 1, mid + 1, r, ql, qr);
    pull(p);
}
```
### 复杂度
总复杂度近似 `O((n+q)log n)`。
---

## 10. [CF915E Physical Education Lessons](https://www.luogu.com.cn/problem/CF915E)
`动态开点` `线段树` `区间赋值`
### 题意
长度为 `n` 的序列初始全为 `1`，每次把区间 `[l,r]` 赋成 `0` 或 `1`，并输出整个序列当前有多少个 `1`。其中 `n` 可达 `10^9`。
### 分析
值域太大，必须用**动态开点线段树**。节点维护当前区间 `sum` 和覆盖标记 `tag`，只有真正访问到的区间才开点，这样空间只和操作数成正比。
### 核心代码
```cpp
struct Node { int ls, rs, tag; long long sum; } tr[N * 40];

void apply(int p, int l, int r, int v) {
    tr[p].sum = 1LL * v * (r - l + 1);
    tr[p].tag = v;
}
void modify(int &p, int l, int r, int ql, int qr, int v) {
    if (!p) p = ++tot;
    if (ql <= l && r <= qr) return apply(p, l, r, v), void();
    push(p, l, r);
    int mid = (l + r) >> 1;
    if (ql <= mid) modify(tr[p].ls, l, mid, ql, qr, v);
    if (qr > mid) modify(tr[p].rs, mid + 1, r, ql, qr, v);
    pull(p);
}
```
### 复杂度
单次操作 `O(log n)`，空间复杂度 `O(q log n)`。
---

## 11. [P2574 XOR的艺术](https://www.luogu.com.cn/problem/P2574)
`线段树` `异或翻转` `区间统计`
### 题意
给定一个 01 串，支持把区间 `[l,r]` 所有位异或 `1`，并查询区间内 `1` 的个数。
### 分析
这是标准的**翻转懒标记线段树**。节点只维护区间 `1` 的数量，翻转时用区间长度减去原来的 `sum`，懒标记则做异或合并。
### 核心代码
```cpp
struct Node { int sum; bool rev; } tr[N << 2];

void apply(int p, int l, int r) {
    tr[p].sum = (r - l + 1) - tr[p].sum;
    tr[p].rev ^= 1;
}
void push(int p, int l, int r) {
    if (!tr[p].rev || l == r) return;
    int mid = (l + r) >> 1;
    apply(p << 1, l, mid);
    apply(p << 1 | 1, mid + 1, r);
    tr[p].rev = 0;
}
```
### 复杂度
单次修改、查询都是 `O(log n)`。
---

## 12. [P2846 [USACO08NOV] Light Switching G](https://www.luogu.com.cn/problem/P2846)
`线段树` `异或翻转` `开关`
### 题意
有 `n` 盏灯初始全关，操作要么翻转一个区间内所有灯的状态，要么查询区间里亮灯的数量。
### 分析
仍然是**区间翻转线段树**。题面换成灯泡，但本质和 01 串翻转完全一样，节点维护亮灯数即可。
### 核心代码
```cpp
void flip(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return apply(p, l, r), void();
    push(p, l, r);
    int mid = (l + r) >> 1;
    if (ql <= mid) flip(p << 1, l, mid, ql, qr);
    if (qr > mid) flip(p << 1 | 1, mid + 1, r, ql, qr);
    tr[p].sum = tr[p << 1].sum + tr[p << 1 | 1].sum;
}
```
### 复杂度
每次操作 `O(log n)`。
---

## 13. [P3870 [TJOI2009] 开关](https://www.luogu.com.cn/problem/P3870)
`线段树` `异或翻转` `区间求和`
### 题意
维护一排开关，多次翻转区间 `[l,r]` 的状态，并统计区间内当前开启的开关数量。
### 分析
同样是**翻转懒标记**。题目规模适合直接套维护 `sum + rev` 的线段树模板。
### 核心代码
```cpp
void modify(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return apply(p, l, r), void();
    push(p, l, r);
    int mid = (l + r) >> 1;
    if (ql <= mid) modify(p << 1, l, mid, ql, qr);
    if (qr > mid) modify(p << 1 | 1, mid + 1, r, ql, qr);
    pull(p);
}
```
### 复杂度
单次操作 `O(log n)`。
---

## 14. [P4344 [SHOI2015] 脑洞治疗仪](https://www.luogu.com.cn/problem/P4344)
`线段树` `01序列` `最长连续段`
### 题意
初始整段全是正常脑组织 `1`。操作包括把区间直接挖成 `0`、把一段区间里的 `1` 搬去填补另一段区间里靠前的 `0`，以及查询某个区间最大的连续脑洞长度。
### 分析
核心是维护 **01 线段树** 的前缀、后缀、区间最大连续 `0/1` 长度，再配合区间 `0/1` 赋值。治疗操作先统计供体区间 `1` 的数量，再在受体区间里用“找前 `k` 个 `0`”的方式填充。
### 核心代码
```cpp
struct Info {
    int len, cnt1, l0, r0, mx0, l1, r1, mx1, tag;
} tr[N << 2];

void cover(int p, int v) {
    tr[p].tag = v;
    tr[p].cnt1 = v ? tr[p].len : 0;
    tr[p].l1 = tr[p].r1 = tr[p].mx1 = v ? tr[p].len : 0;
    tr[p].l0 = tr[p].r0 = tr[p].mx0 = v ? 0 : tr[p].len;
}
int kth_zero(int p, int l, int r, int k);
```
### 复杂度
单次操作 `O(log^2 n)`，空间复杂度 `O(n)`。
---

## 15. [P2572 [SCOI2010] 序列操作](https://www.luogu.com.cn/problem/P2572)
`线段树` `区间赋值` `区间取反` `最长连续1`
### 题意
维护一个 01 序列，支持区间赋成 `0`、赋成 `1`、整体取反、查询区间内 `1` 的总数，以及查询区间最长连续 `1` 的长度。
### 分析
这是 **01 线段树** 的完整模板。每个节点同时维护 `1` 和 `0` 的前缀、后缀、最长连续段，懒标记有两类：覆盖赋值和翻转，两者合并顺序要分清。
### 核心代码
```cpp
struct Node {
    int len, sum, l1, r1, mx1, l0, r0, mx0;
    int cov; bool rev;
} tr[N << 2];

void apply_rev(int p) {
    swap(tr[p].l0, tr[p].l1);
    swap(tr[p].r0, tr[p].r1);
    swap(tr[p].mx0, tr[p].mx1);
    tr[p].sum = tr[p].len - tr[p].sum;
    tr[p].rev ^= 1;
}
```
### 复杂度
每次操作 `O(log n)`。
---

# 二、区间最值、扫描线与顺序维护

这一章把最值维护、矩形并、可见性和切割类问题放到一起，重点是“节点里到底存什么信息”。

## 16. [P1816 忠诚](https://www.luogu.com.cn/problem/P1816)
`线段树` `RMQ` `区间最小值`
### 题意
给定一组数和很多个查询，每次要求输出区间 `[l,r]` 内的最小值。
### 分析
这是最基础的 **RMQ 线段树**。节点只维护区间最小值，查询时取左右答案的最小值即可。
### 核心代码
```cpp
void build(int p, int l, int r) {
    if (l == r) return tr[p] = a[l], void();
    int mid = (l + r) >> 1;
    build(p << 1, l, mid);
    build(p << 1 | 1, mid + 1, r);
    tr[p] = min(tr[p << 1], tr[p << 1 | 1]);
}
```
### 复杂度
建树 `O(n)`，单次查询 `O(log n)`。
---

## 17. [P2894 [USACO08FEB] Hotel G](https://www.luogu.com.cn/problem/P2894)
`线段树` `最长连续空房` `区间赋值`
### 题意
酒店有一排房间，操作要么为新客人分配一段长度为 `x` 的最靠左连续空房，要么把一段已退房的区间重新置为空。
### 分析
标准的**最长连续段线段树**。节点维护前缀空房长度、后缀空房长度和区间最大连续空房长度，就能在 `O(log n)` 找到最靠左可行区间并做区间赋值。
### 核心代码
```cpp
struct Node { int len, lmx, rmx, mx, tag; } tr[N << 2];

int find_left(int p, int l, int r, int need) {
    if (l == r) return l;
    push(p);
    int mid = (l + r) >> 1;
    if (tr[p << 1].mx >= need) return find_left(p << 1, l, mid, need);
    if (tr[p << 1].rmx + tr[p << 1 | 1].lmx >= need) return mid - tr[p << 1].rmx + 1;
    return find_left(p << 1 | 1, mid + 1, r, need);
}
```
### 复杂度
每次分配或释放都是 `O(log n)`。
---

## 18. [P5490 【模板】扫描线 & 矩形面积并](https://www.luogu.com.cn/problem/P5490)
`扫描线` `线段树` `面积并`
### 题意
给出若干个与坐标轴平行的矩形，求这些矩形并集的总面积。
### 分析
横坐标做**扫描线**，纵坐标离散化后在线段树里维护当前被覆盖的总长度 `len`。每扫过一条竖边，就用覆盖次数 `cnt` 更新这一段的有效长度。
### 核心代码
```cpp
struct Seg { int l, r, k; long long x; } seg[M << 1];
struct Node { int cnt; long long len; } tr[M << 3];

void pushup(int p, int l, int r) {
    if (tr[p].cnt) tr[p].len = ys[r + 1] - ys[l];
    else if (l == r) tr[p].len = 0;
    else tr[p].len = tr[p << 1].len + tr[p << 1 | 1].len;
}
```
### 复杂度
排序 `O(n log n)`，扫描过程 `O(n log n)`。
---

## 19. [P1856 [IOI 1998 / USACO5.5] 矩形周长 Picture](https://www.luogu.com.cn/problem/P1856)
`扫描线` `线段树` `周长并`
### 题意
给出多个轴对齐矩形，求它们并集图形的总周长。
### 分析
仍然是**扫描线 + 线段树**，但节点除了覆盖长度，还要维护当前被覆盖线段数量 `num` 以及左右端点是否被覆盖。横扫一次算竖边贡献，纵扫一次算横边贡献。
### 核心代码
```cpp
struct Node { int cnt, num; long long len; bool lc, rc; } tr[M << 3];

void pushup(int p, int l, int r) {
    if (tr[p].cnt) {
        tr[p].len = ys[r + 1] - ys[l];
        tr[p].num = 1;
        tr[p].lc = tr[p].rc = 1;
        return;
    }
    if (l == r) return tr[p] = {0, 0, 0, 0, 0}, void();
    tr[p].len = tr[p << 1].len + tr[p << 1 | 1].len;
    tr[p].num = tr[p << 1].num + tr[p << 1 | 1].num - (tr[p << 1].rc && tr[p << 1 | 1].lc);
    tr[p].lc = tr[p << 1].lc;
    tr[p].rc = tr[p << 1 | 1].rc;
}
```
### 复杂度
总时间复杂度 `O(n log n)`。
---

## 20. [P4198 楼房重建](https://www.luogu.com.cn/problem/P4198)
`线段树` `斜率` `可见楼房`
### 题意
初始所有楼房高度为 `0`，每天把某一栋楼的高度改成新值，要求输出从原点 `(0,0)` 看出去当前能看见多少栋楼。
### 分析
第 `i` 栋楼是否可见，只和斜率 `H[i]/i` 是否刷新前缀最大值有关。线段树节点维护区间最大斜率和“在给定前缀最大斜率下，这一段还能新增多少可见楼”，合并时把左段最大斜率传给右段做二分统计。
### 核心代码
```cpp
struct Node { double mx; int cnt; } tr[N << 2];

int calc(int p, int l, int r, double lim) {
    if (tr[p].mx <= lim) return 0;
    if (l == r) return 1;
    int mid = (l + r) >> 1;
    if (tr[p << 1].mx <= lim) return calc(p << 1 | 1, mid + 1, r, lim);
    return calc(p << 1, l, mid, lim) + calc(p << 1 | 1, mid + 1, r, tr[p << 1].mx);
}
```
### 复杂度
单次修改 `O(log^2 n)`，空间复杂度 `O(n)`。
---

## 21. [P2471 [SCOI2007] 降雨量](https://www.luogu.com.cn/problem/P2471)
`线段树` `最大值查询` `判定`
### 题意
已知若干年份的降雨量，查询一句“`X` 年是自 `Y` 年以来最多的”是必真、必假还是可能为真。
### 分析
先把已知年份离散成数组，线段树维护区间最大降雨量。判断时要同时看三件事：`Y` 和 `X` 是否已知，中间已知年份的最大值是否达到 `rain[X]`，以及年份是否连续，从而区分 `true / false / maybe`。
### 核心代码
```cpp
int mx = query(1, 1, n, posY + 1, posX - 1);
if (hasX && hasY && rain[X] > rain[Y]) puts("false");
else if (mx >= rain[X]) puts("false");
else if (hasX && hasY && year[posX] - year[posY] == posX - posY) puts("true");
else puts("maybe");
```
### 复杂度
每次询问 `O(log n)`。
---

## 22. [CF527C Glass Carving](https://www.luogu.com.cn/problem/CF527C)
`有序集合` `多重集合` `区间切割`
### 题意
给定一块 `w × h` 的玻璃，按顺序做横切或竖切，每次切完都要输出当前最大矩形碎片的面积。
### 分析
核心不是树高，而是**有序集合 + 多重集合**。分别维护横切点和竖切点的有序位置，再维护各段长度的 multiset；每次切割只会把一段删掉再分裂成两段。
### 核心代码
```cpp
set<int> sx, sy;
multiset<int> wx, wy;

void cut(set<int> &s, multiset<int> &ms, int x) {
    auto it = s.lower_bound(x);
    int r = *it, l = *prev(it);
    ms.erase(ms.find(r - l));
    ms.insert(x - l);
    ms.insert(r - x);
    s.insert(x);
}
```
### 复杂度
每次切割 `O(log n)`。
---

# 三、树套树、离线与函数型维护

这一章的共同点是“单棵线段树已经不够”，要么再套一层，要么把时间轴、值域或函数一起塞进去。

## 23. [P3380 【模板】树套树](https://www.luogu.com.cn/problem/P3380)
`树套树` `排名` `第k小`
### 题意
对数组支持单点修改，并在任意子区间 `[l,r]` 内查询某个值的排名、第 `k` 小值、前驱和后继。
### 分析
标准 **树套树**：外层线段树管下标区间，内层平衡树或有序数组结构管值域统计。区间排名转成“统计 `<= x` 的个数”，第 `k` 小再对值域二分。
### 核心代码
```cpp
void modify(int p, int l, int r, int pos, int oldv, int newv) {
    tr[p].erase(oldv);
    tr[p].insert(newv);
    if (l == r) return;
    int mid = (l + r) >> 1;
    if (pos <= mid) modify(p << 1, l, mid, pos, oldv, newv);
    else modify(p << 1 | 1, mid + 1, r, pos, oldv, newv);
}
int count_le(int p, int l, int r, int ql, int qr, int x);
```
### 复杂度
单次操作通常是 `O(log^2 n)` 到 `O(log^3 n)`。
---

## 24. [P1712 [NOI2016] 区间](https://www.luogu.com.cn/problem/P1712)
`扫描线` `线段树` `区间覆盖次数`
### 题意
从给定区间中选出 `m` 个，使它们有公共交点，并让所选区间最长长度减最短长度最小。
### 分析
按区间长度从小到大排序后双指针。右端加入一个区间就对其覆盖范围做 `+1`，左端移出就做 `-1`。只要线段树维护的区间最大覆盖次数 `>= m`，当前窗口就是可行答案。核心是**排序 + 扫描 + 覆盖次数线段树**。
### 核心代码
```cpp
sort(seg + 1, seg + n + 1, [](auto a, auto b){ return a.len < b.len; });
for (int l = 1, r = 0; l <= n; l++) {
    while (r < n && tr[1].mx < m) add(1, 1, tot, seg[++r].l, seg[r].r, 1);
    if (tr[1].mx >= m) ans = min(ans, seg[r].len - seg[l].len);
    add(1, 1, tot, seg[l].l, seg[l].r, -1);
}
```
### 复杂度
总时间复杂度 `O(n log n)`。
---

## 25. [P1937 [USACO10MAR] Barn Allocation G](https://www.luogu.com.cn/problem/P1937)
`贪心` `线段树` `区间最小值`
### 题意
每个畜栏有容量，每头牛申请一个区间 `[A,B]`，只要这个区间内每个畜栏都还能腾出 `1` 单位容量，就能满足这头牛，求最多满足多少头。
### 分析
按右端点从小到大贪心最优。对一头牛，只需检查区间最小剩余容量是否大于 `0`，若可行就整段减一。于是用**区间最小值线段树 + 懒标记减法**即可。
### 核心代码
```cpp
sort(q + 1, q + m + 1, [](auto a, auto b){ return a.r < b.r; });
for (int i = 1; i <= m; i++) {
    if (query_min(1, 1, n, q[i].l, q[i].r) > 0) {
        range_add(1, 1, n, q[i].l, q[i].r, -1);
        ans++;
    }
}
```
### 复杂度
总时间复杂度 `O(m log n)`。
---

## 26. [P1607 [USACO09FEB] Fair Shuttle G](https://www.luogu.com.cn/problem/P1607)
`贪心` `线段树` `区间最大值`
### 题意
班车容量为 `C`，每组奶牛给出起点、终点和人数，问最多能运送多少头奶牛。
### 分析
仍然按终点贪心。把每一站之间的已占容量看成一段区间，某请求最多还能装 `C - max_used[l,r-1]` 头，于是需要**区间最大值线段树**维护各路段当前载客数。
### 核心代码
```cpp
sort(req + 1, req + k + 1, [](auto a, auto b){ return a.e < b.e; });
for (int i = 1; i <= k; i++) {
    int mx = query_max(1, 1, n - 1, req[i].s, req[i].e - 1);
    int take = min(req[i].m, C - mx);
    if (take > 0) range_add(1, 1, n - 1, req[i].s, req[i].e - 1, take), ans += take;
}
```
### 复杂度
总时间复杂度 `O(k log n)`。
---

## 27. [P2184 贪婪大陆](https://www.luogu.com.cn/problem/P2184)
`端点统计` `线段树` `区间相交`
### 题意
每次加入一种只出现在区间 `[L,R]` 的新地雷，询问某段 `[l,r]` 内一共出现过多少种不同地雷。
### 分析
一种地雷只对应一个区间，所以它会在查询段里出现，当且仅当 `L <= r` 且 `R >= l`。因此答案等于“左端点 `<= r` 的区间数”减去“右端点 `< l` 的区间数”，可用**两棵线段树或两棵树状数组**分别统计左右端点。
### 核心代码
```cpp
void add_mine(int l, int r) {
    addL(l, 1);
    addR(r, 1);
}
int query(int l, int r) {
    return sumL(r) - sumR(l - 1);
}
```
### 复杂度
单次插入和查询 `O(log n)`。
---

## 28. [P6327 区间加区间 sin 和](https://www.luogu.com.cn/problem/P6327)
`线段树` `三角函数` `区间加`
### 题意
对区间 `[l,r]` 的每个 `a[i]` 同时加上 `v`，并查询区间内 `sin(a[i])` 的总和。
### 分析
利用三角恒等式：`sin(x+v)=sin x cos v + cos x sin v`，`cos(x+v)=cos x cos v - sin x sin v`。于是节点同时维护 `sumSin` 与 `sumCos`，区间加法就是一次二维旋转，这就是本题的**函数变换懒标记线段树**。
### 核心代码
```cpp
struct Node { double s, c, tag; } tr[N << 2];

void apply(int p, double v) {
    double ns = tr[p].s * cos(v) + tr[p].c * sin(v);
    double nc = tr[p].c * cos(v) - tr[p].s * sin(v);
    tr[p].s = ns; tr[p].c = nc;
    tr[p].tag += v;
}
```
### 复杂度
单次修改和查询 `O(log n)`。
---

## 29. [P5142 区间方差](https://www.luogu.com.cn/problem/P5142)
`线段树` `方差` `平方和`
### 题意
支持单点赋值 `b[x]=y`，以及查询区间 `[l,r]` 的方差并以模意义输出。
### 分析
方差公式可以写成 `E(x^2)-E(x)^2`，所以节点只要维护区间和 `sum` 与平方和 `sq`。本题是**单点修改 + 区间和/平方和线段树**。
### 核心代码
```cpp
struct Node { long long sum, sq; } tr[N << 2];

void modify(int p, int l, int r, int pos, long long v) {
    if (l == r) return tr[p] = {v % mod, v % mod * (v % mod) % mod}, void();
    int mid = (l + r) >> 1;
    if (pos <= mid) modify(p << 1, l, mid, pos, v);
    else modify(p << 1 | 1, mid + 1, r, pos, v);
    pull(p);
}
```
### 复杂度
单次操作 `O(log n)`。
---

## 30. [P1471 方差](https://www.luogu.com.cn/problem/P1471)
`线段树` `懒标记` `平均数` `方差`
### 题意
数组支持区间加法、查询区间平均数，以及查询区间方差。
### 分析
同样维护 `sum` 与 `sq`，但这里是**区间加懒标记**：一段整体加上 `v` 后，平方和变成 `sq + 2v*sum + len*v^2`。有了这两个量，平均数和方差都能直接算。
### 核心代码
```cpp
struct Node { double sum, sq, tag; } tr[N << 2];

void apply(int p, int len, double v) {
    tr[p].sq += 2.0 * v * tr[p].sum + len * v * v;
    tr[p].sum += len * v;
    tr[p].tag += v;
}
```
### 复杂度
单次修改、查询都是 `O(log n)`。
---

## 31. [CF703D Mishka and Interesting sum](https://www.luogu.com.cn/problem/CF703D)
`离线` `异或` `最后出现`
### 题意
每次询问区间 `[l,r]` 内“出现次数为偶数次的数”的异或和。
### 分析
设区间所有元素异或为 `all`，区间内出现过至少一次的不同数异或为 `dist`，则答案就是 `all xor dist`。`all` 用前缀异或，`dist` 用**按右端点离线 + 线段树/树状数组维护最后出现位置异或**。
### 核心代码
```cpp
for (int i = 1; i <= n; i++) {
    if (last[a[i]]) add(last[a[i]], a[i]);
    add(i, a[i]);
    last[a[i]] = i;
    for (auto [l, id] : qry[i])
        ans[id] = (pre[i] ^ pre[l - 1]) ^ (sum(i) ^ sum(l - 1));
}
```
### 复杂度
总时间复杂度 `O((n+q)log n)`。
---

## 32. [P2824 [HEOI2016/TJOI2016] 排序](https://www.luogu.com.cn/problem/P2824)
`二分答案` `01线段树` `区间排序`
### 题意
一个 `1..n` 的排列要经过多次子区间升序或降序排序，最后询问位置 `q` 上的数是多少。
### 分析
二分答案 `x`。把原排列按“是否 `>= x`”变成 01 串，模拟每次局部排序时只需统计区间里 `1` 的个数，再整段赋值成前 `0` 后 `1` 或相反。于是 check 用的是**01 线段树 + 区间赋值**。
### 核心代码
```cpp
bool check(int x) {
    build_by_binary(x);
    for (int i = 1; i <= m; i++) {
        int cnt = query_sum(1, 1, n, op[i].l, op[i].r);
        assign_zero(1, 1, n, op[i].l, op[i].r);
        if (op[i].type == 0) assign_one(1, 1, n, op[i].r - cnt + 1, op[i].r);
        else assign_one(1, 1, n, op[i].l, op[i].l + cnt - 1);
    }
    return query_sum(1, 1, n, q, q);
}
```
### 复杂度
每次 check `O(m log n)`，总复杂度 `O(m log^2 n)`。
---

## 33. [CF601E A Museum Robbery](https://www.luogu.com.cn/problem/CF601E)
`线段树分治` `背包DP` `可回滚`
### 题意
展品会随时间加入和删除，询问当前活跃展品集合在容量 `1..k` 下的最优背包值按权重组合后的结果。
### 分析
把每件展品的存在时间看成一个区间，挂到**时间轴线段树分治**上。DFS 到某个节点时，把该节点所有展品统一做一次 `0/1` 背包转移；到了叶子，数组就是该时刻的真实答案。
### 核心代码
```cpp
void dfs(int p, int l, int r, vector<int> dp) {
    for (auto id : seg[p]) {
        for (int j = k; j >= w[id]; j--)
            dp[j] = max(dp[j], dp[j - w[id]] + v[id]);
    }
    if (l == r) return answer_time(l, dp), void();
    int mid = (l + r) >> 1;
    dfs(p << 1, l, mid, dp);
    dfs(p << 1 | 1, mid + 1, r, dp);
}
```
### 复杂度
总时间复杂度约 `O((n+q)k log q)`。
---

# 四、树上维护、李超线段树与动态开点

这一章从树上的动态最值切到直线集合、路径函数和超大值域，维护对象已经不再只是普通数组。

## 34. [CF932F Escape Through Leaf](https://www.luogu.com.cn/problem/CF932F)
`树形DP` `李超线段树`
### 题意
树上每个点有 `a[i]`、`b[i]`，要求计算 `dp[u]=min(dp[v]+a[u]*b[v])`（`v` 在 `u` 子树内，叶子为 `0`）。
### 分析
每个子节点 `v` 都给父亲贡献一条直线 `y=b[v]x+dp[v]`，父亲要在 `x=a[u]` 处取最小值，所以是**树形 DP + 李超线段树合并**。小子树的线段树合并到大子树上即可。
### 核心代码
```cpp
void dfs(int u, int p) {
    if (leaf(u, p)) return insert(rt[u], XMIN, XMAX, {b[u], 0}), void(dp[u] = 0);
    for (int v : g[u]) if (v != p) dfs(v, u), merge(rt[u], rt[v]);
    dp[u] = query(rt[u], XMIN, XMAX, a[u]);
    insert(rt[u], XMIN, XMAX, {b[u], dp[u]});
}
```
### 复杂度
总时间复杂度 `O(n log V)`。
---

## 35. [P4655 [CEOI 2017] Building Bridges](https://www.luogu.com.cn/problem/P4655)
`DP优化` `李超线段树`
### 题意
按顺序修桥，状态转移含有形如 `dp[j] + (h[i]-h[j])^2 + prefixCost` 的二次式，要求最小总代价。
### 分析
把转移式展开后，`i` 固定时只需要在 `x=h[i]` 处查询若干条直线的最小值，因此直接用**李超线段树优化 DP**。每处理完一个 `j`，就把对应直线插入。
### 核心代码
```cpp
for (int i = 1; i <= n; i++) {
    dp[i] = 1LL * h[i] * h[i] + pre[i - 1] + query(rt, XMIN, XMAX, h[i]);
    insert(rt, XMIN, XMAX, {-2LL * h[i], dp[i] + 1LL * h[i] * h[i] - pre[i]});
}
```
### 复杂度
时间复杂度 `O(n log V)`。
---

## 36. [P4069 [SDOI2016] 游戏](https://www.luogu.com.cn/problem/P4069)
`树链剖分` `李超线段树` `路径最小值`
### 题意
在树上一条路径 `s->t` 上，按离 `s` 的距离给每个点加入一个一次函数值 `a*dis+b`；查询另一条路径上所有被加入过的数字中的最小值。
### 分析
把路径拆成若干条重链区间后，每个区间上加入的是一条关于 DFS 序位置的一次函数。于是用**树链剖分 + 线段树套李超线段树**：更新路径时向覆盖节点插线，查询路径时在经过的节点里取点值最小。
### 核心代码
```cpp
void insert_path(int x, int y, Line up, Line down) {
    while (top[x] != top[y]) {
        if (dep[top[x]] >= dep[top[y]]) add_seg(1, 1, n, dfn[top[x]], dfn[x], line_from_x());
        else add_seg(1, 1, n, dfn[top[y]], dfn[y], line_from_y());
        move_up();
    }
    add_seg(1, 1, n, dfn[x], dfn[y], final_line());
}
```
### 复杂度
单次路径修改、查询一般为 `O(log^2 n log V)`。
---

## 37. [P4097 【模板】李超线段树 / [HEOI2013] Segment](https://www.luogu.com.cn/problem/P4097)
`李超线段树` `线段插入`
### 题意
多次插入一条只在某个 `x` 区间内生效的线段，查询某个横坐标 `x` 处纵坐标最大的线段编号。
### 分析
这是标准的**李超线段树**。与普通插整条直线不同，本题是“线段插入”，所以只把直线递归挂到它覆盖的 `x` 区间；节点保留当前最优线段。
### 核心代码
```cpp
void insert(int p, int l, int r, int ql, int qr, Line v) {
    if (ql <= l && r <= qr) return lichao_insert(p, l, r, v), void();
    int mid = (l + r) >> 1;
    if (ql <= mid) insert(p << 1, l, mid, ql, qr, v);
    if (qr > mid) insert(p << 1 | 1, mid + 1, r, ql, qr, v);
}
```
### 复杂度
单次插入、查询都是 `O(log^2 V)` 或 `O(log V)` 级别。
---

## 38. [P4254 [JSOI2008] Blue Mary 开公司](https://www.luogu.com.cn/problem/P4254)
`李超线段树` `斜率优化`
### 题意
不断加入一条收益直线，并询问某一天 `x` 时哪条方案的收益最大。
### 分析
这是最纯粹的**全局插线、单点查询**李超线段树。每个商业方案都是一条直线，查询时直接在 `x` 处取最大值即可。
### 核心代码
```cpp
void lichao_insert(int p, int l, int r, Line v) {
    int mid = (l + r) >> 1;
    if (f(v, mid) > f(tr[p], mid)) swap(v, tr[p]);
    if (l == r) return;
    if (f(v, l) > f(tr[p], l)) lichao_insert(p << 1, l, mid, v);
    else if (f(v, r) > f(tr[p], r)) lichao_insert(p << 1 | 1, mid + 1, r, v);
}
```
### 复杂度
单次操作 `O(log V)`。
---

## 39. [P2497 [SDOI2012] 基站建设](https://www.luogu.com.cn/problem/P2497)
`DP优化` `李超线段树` `坐标建模`
### 题意
一排基站在直线上，选择若干站接力把信号送到终点，每个基站有建设费用和几何覆盖关系，要求最小总代价。
### 分析
几何约束整理后，转移会落成“在一段可达范围内取 `dp[j] + k*x + b` 的最小值”。因此做法是**坐标扫描 + 李超线段树 / 线段树维护最优线性转移**，随着站点推进把可用决策加入结构。
### 核心代码
```cpp
for (int i = 1; i <= n; i++) {
    dp[i] = query(rt, XMIN, XMAX, x[i]) + cost[i];
    insert(rt, XMIN, XMAX, {slope(i), intercept(i, dp[i])});
}
ans = query(rt, XMIN, XMAX, homePos);
```
### 复杂度
时间复杂度通常为 `O(n log V)`。
---

## 40. [P3960 [NOIP 2017 提高组] 列队](https://www.luogu.com.cn/problem/P3960)
`动态开点` `权值线段树` `第k空位`
### 题意
`n × m` 方阵不断发生“某行某列的学生离队、整体左移和上移、最后回到右下角”的过程，需要输出每次离队学生原本的编号。
### 分析
每一行和最后一列都像一个动态序列，实质是在不断删除第 `k` 个仍然存在的位置，再把某个编号追加到尾部。适合用**动态开点权值线段树**维护“还没被删掉的位置数”，靠 `kth` 找第 `k` 个存活元素。
### 核心代码
```cpp
long long kth(int &rt, int l, int r, int k) {
    if (!rt) rt = ++tot, tr[rt].sum = r - l + 1;
    if (l == r) return id_of(l);
    int mid = (l + r) >> 1;
    int leftCnt = count(tr[rt].ls, l, mid);
    if (k <= leftCnt) return kth(tr[rt].ls, l, mid, k);
    return kth(tr[rt].rs, mid + 1, r, k - leftCnt);
}
```
### 复杂度
单次询问 `O(log(n+q))`。
---

## 41. [P4425 [HNOI/AHOI2018] 转盘](https://www.luogu.com.cn/problem/P4425)
`线段树` `环形维护` `最值`
### 题意
环上第 `i` 个物品在时刻 `T[i]` 出现，可以原地等待或每秒走到下一个位置。每次修改一个 `T[i]` 后，要求最早什么时候能把所有物品都标记完。
### 分析
若起点固定，答案可化成若干项 `T[i] - i` 的前后缀最大值组合。于是在线段树中维护区间最大值以及该区间最优起点答案，合并时把左段前缀信息传到右段，就能在单点修改后直接得到全局最优。核心是**环形 DP 公式在线段树上的区间合并**。
### 核心代码
```cpp
struct Node { int mx, ans; } tr[N << 2];

Node merge(Node L, Node R, int lenL) {
    Node t;
    t.mx = max(L.mx, R.mx);
    t.ans = min(L.ans, min(R.ans, lenL + max(L.mx, n + R.mx)));
    return t;
}
```
### 复杂度
单次修改 `O(log n)`。
---

## 42. [P3437 [POI 2006] TET-Tetris 3D](https://www.luogu.com.cn/problem/P3437)
`二维线段树` `矩形最值`
### 题意
许多长方体按顺序垂直落下，每个方块覆盖地面上的一个矩形区域，最终停在该区域当前最高处上方，求最后的最高高度。
### 分析
每次操作都要先求一个矩形区域的当前最大高度，再把整个矩形赋成这个最大值加上方块高度。这是**二维区间最大值查询 + 矩形赋值**，常见实现是二维线段树或线段树套线段树。
### 核心代码
```cpp
int h = query2D(1, 1, D, x1, x2, y1, y2);
modify2D(1, 1, D, x1, x2, y1, y2, h + w);
ans = max(ans, h + w);
```
### 复杂度
总复杂度通常为 `O(n log^2 S)`。
---

## 43. [P4588 [TJOI2018] 数学计算](https://www.luogu.com.cn/problem/P4588)
`线段树` `乘积` `时间轴`
### 题意
初始 `x=1`。一种操作把 `x` 乘上新数 `m`，另一种操作把 `x` 除以某一次乘上的数，要求每步输出 `x mod M`。
### 分析
把每次乘法看成时间轴上的一个位置，当前 `x` 就是所有仍然生效位置的乘积。于是用**线段树维护全体位置乘积**：加入时把该位置改成 `m`，删除时改回 `1`。
### 核心代码
```cpp
void modify(int p, int l, int r, int pos, long long v) {
    if (l == r) return tr[p] = v % mod, void();
    int mid = (l + r) >> 1;
    if (pos <= mid) modify(p << 1, l, mid, pos, v);
    else modify(p << 1 | 1, mid + 1, r, pos, v);
    tr[p] = tr[p << 1] * tr[p << 1 | 1] % mod;
}
```
### 复杂度
单次操作 `O(log q)`。
---

## 44. [P1198 [JSOI2008] 最大数](https://www.luogu.com.cn/problem/P1198)
`线段树` `动态序列` `区间最大值`
### 题意
序列从空开始，支持在末尾追加一个数，以及查询最后 `L` 个数中的最大值。追加的值还会受上一次查询答案影响。
### 分析
下标只会递增，所以直接把时间当作位置。用**线段树维护前 `tot` 个位置的区间最大值**，查询最后 `L` 个数就是查 `[tot-L+1, tot]`。
### 核心代码
```cpp
int tot = 0, last = 0;

void append(int x) {
    x = (x + last) % D;
    modify(1, 1, m, ++tot, x);
}
int query_last(int len) {
    return last = query_max(1, 1, m, tot - len + 1, tot);
}
```
### 复杂度
单次追加或查询 `O(log m)`。
---

# 五、权值线段树与候选维护

这一章转到值域视角：不是维护下标区间，而是维护“还剩哪些值”“第 k 小是谁”“候选答案有哪些”。

## 45. [P3369 【模板】普通平衡树](https://www.luogu.com.cn/problem/P3369)
`权值线段树` `平衡树`
### 题意
维护一个可重集合，支持插入、删除、查询排名、查询第 `k` 小、前驱和后继。
### 分析
把所有可能出现的值离散化后，完全可以用**权值线段树**代替平衡树。节点维护该值域内元素总数，排名和第 `k` 小都是计数前缀问题。
### 核心代码
```cpp
void add(int p, int l, int r, int pos, int v) {
    tr[p] += v;
    if (l == r) return;
    int mid = (l + r) >> 1;
    if (pos <= mid) add(p << 1, l, mid, pos, v);
    else add(p << 1 | 1, mid + 1, r, pos, v);
}
int kth(int p, int l, int r, int k) {
    if (l == r) return l;
    int mid = (l + r) >> 1;
    if (tr[p << 1] >= k) return kth(p << 1, l, mid, k);
    return kth(p << 1 | 1, mid + 1, r, k - tr[p << 1]);
}
```
### 复杂度
单次操作 `O(log V)`。
---

## 46. [P3988 [SHOI2013] 发牌](https://www.luogu.com.cn/problem/P3988)
`权值线段树` `第k张牌`
### 题意
一副 `1..N` 的牌按顺序排好。第 `i` 次发牌前先做 `R[i]` 次“把牌顶移到底”，再发出当前牌顶，要求输出整副牌的发牌顺序。
### 分析
把还没发出的牌看成若干存活位置，第 `i` 次要找的是当前循环偏移后的第 `k` 个存活位置。用**权值线段树维护剩余牌数**，就能反复做 `kth` 删除。
### 核心代码
```cpp
int cur = 0, rem = n;
for (int i = 1; i <= n; i++) {
    cur = (cur + R[i]) % rem;
    int pos = kth(1, 1, n, cur + 1);
    print(pos);
    add(1, 1, n, pos, -1);
    rem--;
    if (rem) cur %= rem;
}
```
### 复杂度
总时间复杂度 `O(n log n)`。
---

## 47. [P3939 数颜色](https://www.luogu.com.cn/problem/P3939)
`权值线段树` `颜色统计` `相邻交换`
### 题意
序列里的颜色会发生相邻交换，询问时要求统计区间 `[l,r]` 中颜色 `c` 出现了多少次。
### 分析
每种颜色只关心自己出现在哪些位置。可以为每种颜色维护一棵**权值线段树**或有序集合：交换时只改两个位置所属颜色的结构，查询时统计该颜色在 `[l,r]` 的计数。
### 核心代码
```cpp
void swap_pos(int x) {
    int c1 = a[x], c2 = a[x + 1];
    if (c1 == c2) return;
    modify(rt[c1], 1, n, x, -1); modify(rt[c1], 1, n, x + 1, +1);
    modify(rt[c2], 1, n, x + 1, -1); modify(rt[c2], 1, n, x, +1);
    swap(a[x], a[x + 1]);
}
```
### 复杂度
单次交换或查询 `O(log n)`。
---

## 48. [CF840D Destiny](https://www.luogu.com.cn/problem/CF840D)
`候选众数线段树` `出现次数`
### 题意
对每个区间 `[l,r]` 和参数 `k(2<=k<=5)`，求区间内出现次数严格大于 `floor(len/k)` 的最小值，不存在则输出 `-1`。
### 分析
一个区间里满足条件的值至多 `k-1` 个，所以线段树节点只需维护少量**候选众数**。合并节点时用 Misra-Gries 消去法保留候选，再用每个值的位置表二分验证真实出现次数。
### 核心代码
```cpp
vector<pair<int,int>> merge(vector<pair<int,int>> A, vector<pair<int,int>> B) {
    for (auto [x, c] : B) add_candidate(A, x, c);
    normalize(A, 4);
    return A;
}
int check(int x, int l, int r) {
    return upper_bound(pos[x].begin(), pos[x].end(), r) - lower_bound(pos[x].begin(), pos[x].end(), l);
}
```
### 复杂度
单次查询 `O(log n * k * log n)`。
---

# 六、动态图、分治与可并线段树

这一章是全篇最“硬核”的部分：有时间轴分治、可回滚并查集、线段树合并、线段树分裂和动态树。

## 49. [P5787 【模板】线段树分治 / 二分图](https://www.luogu.com.cn/problem/P5787)
`线段树分治` `可回滚并查集` `二分图`
### 题意
边在某个时间区间内出现，要求判断每个时间点对应的图是否是二分图。
### 分析
把每条边的生存区间挂到**时间轴线段树分治**上，DFS 到一个节点时，把该节点所有边加入**可回滚带权并查集**维护奇偶关系；若某节点已冲突，整段直接输出 `No`。
### 核心代码
```cpp
void dfs(int p, int l, int r) {
    int snap = dsu.snapshot();
    for (auto [u, v] : seg[p]) dsu.merge(u, v + n), dsu.merge(u + n, v);
    if (dsu.bad()) fill(ans + l, ans + r + 1, false);
    else if (l == r) ans[l] = true;
    else {
        int mid = (l + r) >> 1;
        dfs(p << 1, l, mid);
        dfs(p << 1 | 1, mid + 1, r);
    }
    dsu.rollback(snap);
}
```
### 复杂度
总时间复杂度 `O((m+k)log k)`。
---

## 50. [CF1814F Communication Towers](https://www.luogu.com.cn/problem/CF1814F)
`线段树分治` `可回滚并查集` `频率区间`
### 题意
每座通信塔只接受一个频率区间，若一条路径上的所有塔都能接受同一频率，则路径可用。要求找出从 `1` 号塔能到达哪些塔。
### 分析
一条电线只会在两端频率区间交集上有效，所以可把它挂到**频率轴线段树分治**上。DFS 某段频率时，用**可回滚并查集**维护该频率段内有效边形成的连通块，只要某个点在某个叶子频率和 `1` 同块，就说明它可达。
### 核心代码
```cpp
for (auto [u, v] : edges) {
    int L = max(l[u], l[v]), R = min(r[u], r[v]);
    if (L <= R) add_seg(1, 1, MAXF, L, R, {u, v});
}
void dfs(int p, int l, int r) {
    int snap = dsu.snapshot();
    for (auto [u, v] : seg[p]) dsu.merge(u, v);
    if (l == r) mark_component_of_one(l);
    else dfs_ls_rs();
    dsu.rollback(snap);
}
```
### 复杂度
总时间复杂度 `O((n+m)log V)` 级别。
---

## 51. [P5494 【模板】线段树分裂](https://www.luogu.com.cn/problem/P5494)
`线段树分裂` `可重集`
### 题意
维护很多个可重集，支持从一个集合中按值域 `[x,y]` 拆出一个新集合、合并两个集合、单点加、区间计数和第 `k` 小查询。
### 分析
这是**动态开点权值线段树分裂/合并**模板。每个集合对应一棵线段树，分裂时把 `[x,y]` 覆盖到的新树节点摘出来，合并时递归合并左右儿子即可。
### 核心代码
```cpp
void split(int p, int &q, int l, int r, int ql, int qr) {
    if (!p || qr < l || r < ql) return;
    if (ql <= l && r <= qr) return q = p, p = 0, void();
    q = ++tot;
    int mid = (l + r) >> 1;
    split(ls[p], ls[q], l, mid, ql, qr);
    split(rs[p], rs[q], mid + 1, r, ql, qr);
    pull(p); pull(q);
}
```
### 复杂度
单次分裂、合并、查询均为 `O(log V)` 到摊还 `O(log V)`。
---

## 52. [P3224 [HNOI2012] 永无乡](https://www.luogu.com.cn/problem/P3224)
`并查集` `线段树合并` `第k小`
### 题意
若干岛屿会通过建桥逐渐连通，询问某个岛所在连通块里第 `k` 小的重要度对应哪座岛。
### 分析
并查集维护连通块代表元，每个连通块再挂一棵**权值线段树**记录块内所有重要度。两块连通时直接**线段树合并**，查询时在代表元的线段树上找第 `k` 小。
### 核心代码
```cpp
int merge(int x, int y, int l, int r) {
    if (!x || !y) return x | y;
    if (l == r) return sum[x] += sum[y], x;
    int mid = (l + r) >> 1;
    ls[x] = merge(ls[x], ls[y], l, mid);
    rs[x] = merge(rs[x], rs[y], mid + 1, r);
    pull(x);
    return x;
}
```
### 复杂度
总时间复杂度 `O((n+q)log n)`。
---

## 53. [P4556 【模板】线段树合并 / [Vani 有约会] 雨天的尾巴](https://www.luogu.com.cn/problem/P4556)
`树上差分` `线段树合并` `众数`
### 题意
多次在树上路径 `(x,y)` 上给某个颜色 `z` 贡献一次，最后对每个点求经过它的路径中出现次数最多的颜色。
### 分析
先做**树上差分**：在 `x`、`y` 加一，在 `lca` 和 `fa[lca]` 减一。每个点维护一棵颜色计数线段树，DFS 回溯时把儿子线段树**合并**到父亲，根节点就能知道当前点的最高频颜色。
### 核心代码
```cpp
void dfs(int u, int p) {
    for (int v : g[u]) if (v != p) {
        dfs(v, u);
        rt[u] = merge(rt[u], rt[v], 1, MAXC);
    }
    ans[u] = bestColor[rt[u]];
}
```
### 复杂度
总时间复杂度 `O((n+m)log C)`。
---

## 54. [CF600E Lomsat gelral](https://www.luogu.com.cn/problem/CF600E)
`DSU on Tree` `线段树合并` `颜色计数`
### 题意
对每个点，求它子树中出现次数最多的颜色编号之和。
### 分析
本题既可用 DSU on Tree，也可写成**线段树合并**。每个叶子颜色先建一棵只含自己颜色的权值线段树，回溯时合并儿子；节点额外维护当前最大出现次数和对应颜色和。
### 核心代码
```cpp
int merge(int x, int y, int l, int r) {
    if (!x || !y) return x | y;
    if (l == r) {
        cnt[x] += cnt[y];
        bestCnt[x] = cnt[x]; bestSum[x] = l;
        return x;
    }
    int mid = (l + r) >> 1;
    ls[x] = merge(ls[x], ls[y], l, mid);
    rs[x] = merge(rs[x], rs[y], mid + 1, r);
    pull(x);
    return x;
}
```
### 复杂度
总时间复杂度 `O(n log C)`。
---

## 55. [P5298 [PKUWC2018] Minimax](https://www.luogu.com.cn/problem/P5298)
`线段树合并` `概率DP`
### 题意
二叉树叶子有互不相同的值，内部节点按给定概率取左右子树最大值或最小值，要求统计根节点各种可能取值的概率并计算给定加权和。
### 分析
把叶子值离散成值域。每个子树对应一棵**概率线段树**，叶子存该值被取到的概率。内部节点合并左右子树时，根据“取 max / min”的概率，把两边前缀概率卷进新树，最后在根上按有序值统计答案。
### 核心代码
```cpp
int merge_maxmin(int x, int y, int l, int r, int p) {
    if (l == r) return val[x] = combine(val[x], val[y], p), x;
    int mid = (l + r) >> 1;
    ls[x] = merge_maxmin(ls[x], ls[y], l, mid, p);
    rs[x] = merge_maxmin(rs[x], rs[y], mid + 1, r, p);
    pull_prob(x);
    return x;
}
```
### 复杂度
总时间复杂度 `O(n log n)`。
---

## 56. [P5631 最小mex生成树](https://www.luogu.com.cn/problem/P5631)
`线段树分治` `可回滚并查集` `mex`
### 题意
在带权连通图中选一棵生成树，使所选边权集合的 `mex` 尽量小，求这个最小 `mex`。
### 分析
若答案是 `x`，说明“删去所有权值等于 `x` 的边后，图仍可连通”。于是把每条边挂到“除自己权值外都可用”的**权值轴线段树**上，DFS 时用**可回滚并查集**维护当前能否连通，找到最小的可行叶子就是答案。
### 核心代码
```cpp
for (auto [u, v, w] : edges) {
    if (w > 0) add_seg(1, 0, W, 0, w - 1, {u, v});
    if (w < W) add_seg(1, 0, W, w + 1, W, {u, v});
}
void dfs(int p, int l, int r) {
    int snap = dsu.snapshot();
    for (auto e : seg[p]) dsu.merge(e.u, e.v);
    if (l == r) { if (dsu.cc == 1) ans = min(ans, l); }
    else dfs_ls_rs();
    dsu.rollback(snap);
}
```
### 复杂度
总时间复杂度 `O(m log W + n log W)`。
---

# 七、动态 DP、偏序维护与综合模型

最后这一章收拢那些仍以线段树为重要部件、但已经不再是单纯区间维护的题：有的把线段树嵌进动态 DP，有的把它塞进 CDQ 或偏序转移里，更多是在复杂模型里把它当作一个可查询、可合并的子结构。

## 57. [P4719 【模板】动态 DP](https://www.luogu.com.cn/problem/P4719)
`动态DP` `矩阵` `树链剖分`
### 题意
树上点权会单点修改，每次修改后都要求整棵树的最大权独立集值。
### 分析
静态树形 DP 有 `f[u][0/1]` 两态，动态时可把每个点抽象成一个 `2×2` 转移矩阵，再用**树链剖分 + 线段树维护矩阵乘积**。点权改动只会影响从该点到链顶的一串矩阵。
### 核心代码
```cpp
struct Mat { long long a[2][2]; };
Mat operator * (const Mat &A, const Mat &B) {
    Mat C; init_neg_inf(C);
    for (int i = 0; i < 2; i++)
        for (int j = 0; j < 2; j++)
            for (int k = 0; k < 2; k++)
                C.a[i][j] = max(C.a[i][j], A.a[i][k] + B.a[k][j]);
    return C;
}
```
### 复杂度
单次修改 `O(log^2 n)`。
---

## 58. [P4751 【模板】动态 DP（加强版）](https://www.luogu.com.cn/problem/P4751)
`动态DP` `矩阵` `在线`
### 题意
和 P4719 相同，但数据规模更大并带强制在线，要求在每次异或后的修改后输出最大权独立集。
### 分析
核心模型不变，仍然是**矩阵化动态 DP**。区别只是实现必须更极致：迭代式树剖、紧凑线段树、`int` 优化和常数控制，才能撑住加强版数据。
### 核心代码
```cpp
void modify_point(int x, int w) {
    val[x] = w;
    while (x) {
        update_seg(1, 1, n, dfn[top[x]], dfn[bot[top[x]]]);
        x = fa[top[x]];
    }
    lastans = max(rootMat.a[0][0], rootMat.a[1][0]);
}
```
### 复杂度
单次修改 `O(log^2 n)`，但实现常数更关键。
---

## 59. [P3769 [CH弱省胡策R2] TATT](https://www.luogu.com.cn/problem/P3769)
`CDQ分治` `动态开点线段树` `偏序DP`
### 题意
给出 `n` 个四维点，要求找一条经过点数最多的路径，使路径上四个坐标都单调不降。
### 分析
这是四维偏序最长链。常规做法是排序一维后做**CDQ 分治**降到三维，再用**动态开点线段树 / 树状数组**维护后两维上的最长链值，完成 `dp` 转移。
### 核心代码
```cpp
void cdq(int l, int r) {
    if (l == r) return f[l] = max(f[l], 1), void();
    int mid = (l + r) >> 1;
    cdq(l, mid);
    sort(a + l, a + mid + 1, by_b_c_d);
    sort(a + mid + 1, a + r + 1, by_b_c_d);
    for (int i = l, j = mid + 1; j <= r; j++) {
        while (i <= mid && a[i].b <= a[j].b) seg.update(a[i].c, a[i].d, f[a[i].id]), i++;
        f[a[j].id] = max(f[a[j].id], seg.query(a[j].c, a[j].d) + 1);
    }
    seg.clear();
    cdq(mid + 1, r);
}
```
### 复杂度
时间复杂度约 `O(n log^3 n)`。
---

