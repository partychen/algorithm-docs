---
title: "CSES 几何专题精选解题报告"
subtitle: "📐 从叉积、凸包到扫描线与最早碰撞"
order: 5
icon: "📐"
---

# CSES 几何专题精选解题报告

这份专题按“几何对象怎样被稳定地转成算法”来重排：先用叉积、面积与格点公式解决基础判定，再把凸包和距离问题压成排序后的单调结构，接着用扫描线与上包络维护大规模线段集合，最后回到路径自交，观察最早碰撞本质上也是对已访问几何对象的查询。

# 一、基础判定与多边形公式

这一章处理最经典的几何基本功：方向、相交、面积、点与多边形关系，以及由面积进一步推出的格点计数。它们共同依赖的核心对象都是叉积与边界枚举。

## 1. [Point Location Test](https://cses.fi/problemset/task/2189)
`叉积` `方向判断`

### 题意

给定有向直线 $p_1 \to p_2$ 和点 $p_3$，判断 $p_3$ 在直线左侧、右侧，还是恰好落在线上。

### 分析

直接计算 $\operatorname{cross}(p_2-p_1,p_3-p_1)$ 的符号即可。叉积大于 $0$ 表示从 $p_1$ 看向 $p_2$ 时点在左侧，小于 $0$ 在右侧，等于 $0$ 则三点共线。全过程只做整数运算，用 $64$ 位整数就能覆盖坐标范围。

### 核心代码
```cpp
struct P { long long x, y; };

long long cross(P a, P b, P c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

string side(P a, P b, P c) {
    long long s = cross(a, b, c);
    if (s > 0) return "LEFT";
    if (s < 0) return "RIGHT";
    return "TOUCH";
}
```

### 复杂度

单次判断的时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

---

## 2. [Line Segment Intersection](https://cses.fi/problemset/task/2190)
`叉积` `线段相交`

### 题意

多组给定两条线段的端点，判断它们是否至少有一个公共点。

### 分析

先看四个方向判定：若两条线段分别把对方端点分在两侧，就发生严格相交；若有叉积为 $0$，则退化成共线情形，再检查端点是否落在线段包围盒内。于是“方向符号 + 在线段上”就覆盖了所有情况。

### 核心代码
```cpp
int sgn(long long x) { return (x > 0) - (x < 0); }

bool on_seg(P a, P b, P p) {
    return cross(a, b, p) == 0
        && min(a.x, b.x) <= p.x && p.x <= max(a.x, b.x)
        && min(a.y, b.y) <= p.y && p.y <= max(a.y, b.y);
}

bool intersect(P a, P b, P c, P d) {
    long long c1 = cross(a, b, c), c2 = cross(a, b, d);
    long long c3 = cross(c, d, a), c4 = cross(c, d, b);
    if (on_seg(a, b, c) || on_seg(a, b, d) || on_seg(c, d, a) || on_seg(c, d, b)) return true;
    return sgn(c1) * sgn(c2) < 0 && sgn(c3) * sgn(c4) < 0;
}
```

### 复杂度

单次判断的时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

---

## 3. [Polygon Area](https://cses.fi/problemset/task/2191)
`鞋带公式` `多边形面积`

### 题意

给定简单多边形的顶点顺序，输出其面积的两倍 $2A$。

### 分析

顶点已经按边界顺序给出，直接套鞋带公式
$2A=\left|\sum (x_i y_{i+1}-y_i x_{i+1})\right|$。
题目要求输出整数形式的 $2A$，因此连除以 $2$ 都不需要做，实现非常直接。

### 核心代码
```cpp
long long area2(const vector<P>& p) {
    int n = p.size();
    long long s = 0;
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        s += p[i].x * p[j].y - p[i].y * p[j].x;
    }
    return llabs(s);
}
```

### 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

---

## 4. [Point in Polygon](https://cses.fi/problemset/task/2192)
`点在多边形内` `绕数法`

### 题意

给定一个简单多边形和若干查询点，对每个点判断它在多边形内部、外部还是边界上。

### 分析

先逐边检查查询点是否在线段上，这一步命中就直接输出边界。否则统计多边形边界穿过从点向右射线的净次数：上穿且点在边左侧就令绕数加一，下穿且点在边右侧就令绕数减一。最后绕数非零在内部，绕数为零在外部。

### 核心代码
```cpp
string locate(const vector<P>& poly, P p) {
    int wn = 0, n = poly.size();
    for (int i = 0; i < n; i++) {
        P a = poly[i], b = poly[(i + 1) % n];
        if (on_seg(a, b, p)) return "BOUNDARY";
        if (a.y <= p.y) {
            if (b.y > p.y && cross(a, b, p) > 0) wn++;
        } else {
            if (b.y <= p.y && cross(a, b, p) < 0) wn--;
        }
    }
    return wn ? "INSIDE" : "OUTSIDE";
}
```

### 复杂度

单次查询的时间复杂度为 $O(n)$，总时间复杂度为 $O(nm)$，空间复杂度为 $O(1)$。

---

## 5. [Polygon Lattice Points](https://cses.fi/problemset/task/2193)
`格点多边形` `Pick 定理`

### 题意

给定一个顶点坐标全为整数的简单多边形，求内部格点数和边界格点数。

### 分析

边界上一条边贡献的格点数是 $\gcd(|\Delta x|,|\Delta y|)$；全边求和即可得到边界格点总数 $B$。面积仍用鞋带公式得到 $2A$，再套 Pick 定理 $A=I+\frac{B}{2}-1$，化成整数式就是
$ I=\frac{2A-B+2}{2} $。

### 核心代码
```cpp
pair<long long, long long> lattice(const vector<P>& p) {
    int n = p.size();
    long long s = 0, B = 0;
    for (int i = 0; i < n; i++) {
        int j = (i + 1) % n;
        s += p[i].x * p[j].y - p[i].y * p[j].x;
        long long dx = llabs(p[i].x - p[j].x);
        long long dy = llabs(p[i].y - p[j].y);
        B += std::gcd(dx, dy);
    }
    long long area2 = llabs(s);
    long long I = (area2 - B + 2) / 2;
    return {I, B};
}
```

### 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

---

# 二、凸包与距离度量

这一章的主线是“先换坐标或排序，再在单调结构上做最优性维护”。无论是最近点、凸包还是曼哈顿距离，本质上都在压缩候选集合。

## 6. [Minimum Euclidean Distance](https://cses.fi/problemset/task/2194)
`最近点对` `扫描维护`

### 题意

给定平面上 $n$ 个互不相同的点，求两点欧几里得距离的最小平方值 $d^2$。

### 分析

按 $x$ 排序后，从左到右扫描。若当前最优平方为 $best$，那么横向距离超过 $\sqrt{best}$ 的旧点一定不可能更新答案，可以从活动集合中删除；在剩余集合里，只需枚举 $y$ 落在 $[y-\sqrt{best},y+\sqrt{best}]$ 的点。这样把二维最近点约束压成了一个按 $y$ 有序的活动窗口。

### 核心代码
```cpp
long long sq(long long x) { return x * x; }

long long closest(vector<P>& p) {
    sort(p.begin(), p.end(), [](P a, P b) { return tie(a.x, a.y) < tie(b.x, b.y); });
    set<pair<long long, long long>> box;
    long long best = (1LL << 62);
    int l = 0, n = p.size();
    for (int i = 0; i < n; i++) {
        long long d = sqrtl((long double)best) + 1;
        while (p[i].x - p[l].x > d) box.erase({p[l].y, p[l].x}), l++;
        auto it = box.lower_bound({p[i].y - d, -(1LL << 60)});
        while (it != box.end() && it->first <= p[i].y + d) {
            best = min(best, sq(p[i].x - it->second) + sq(p[i].y - it->first));
            ++it;
        }
        box.insert({p[i].y, p[i].x});
    }
    return best;
}
```

### 复杂度

时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

---

## 7. [Convex Hull](https://cses.fi/problemset/task/2195)
`凸包` `单调链`

### 题意

给定若干平面点，输出它们的凸包，并且要求把落在凸包边界上的点全部输出。

### 分析

按字典序排序后用 Andrew 单调链分别构造下包和上包。普通凸包常在遇到共线时弹栈，但这题要求保留所有边界点，所以只在出现严格右转时弹栈，也就是条件写成 $\operatorname{cross}<0$。合并后去重即可，题目允许任意顺序输出。

### 核心代码
```cpp
vector<P> hull(vector<P>& p) {
    sort(p.begin(), p.end(), [](P a, P b) { return tie(a.x, a.y) < tie(b.x, b.y); });
    vector<P> st;
    for (auto pt : p) {
        while (st.size() >= 2 && cross(st[st.size() - 2], st.back(), pt) < 0) st.pop_back();
        st.push_back(pt);
    }
    int t = st.size() + 1;
    for (int i = (int)p.size() - 2; i >= 0; i--) {
        while ((int)st.size() >= t && cross(st[st.size() - 2], st.back(), p[i]) < 0) st.pop_back();
        st.push_back(p[i]);
    }
    st.pop_back();
    sort(st.begin(), st.end(), [](P a, P b) { return tie(a.x, a.y) < tie(b.x, b.y); });
    st.erase(unique(st.begin(), st.end(), [](P a, P b) { return a.x == b.x && a.y == b.y; }), st.end());
    return st;
}
```

### 复杂度

时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

---

## 8. [Maximum Manhattan Distances](https://cses.fi/problemset/task/3410)
`曼哈顿距离` `坐标变换`

### 题意

点集从空集开始逐个加入点，要求在每次加入后输出当前点集中两点曼哈顿距离的最大值。

### 分析

恒等式
$|x_1-x_2|+|y_1-y_2|=\max\bigl(|(x+y)_1-(x+y)_2|, |(x-y)_1-(x-y)_2|\bigr)$
说明答案只由两个一维投影的极差决定。因此维护 $x+y$ 与 $x-y$ 的最大值和最小值即可，每次插入都能 $O(1)$ 更新当前答案。

### 核心代码
```cpp
long long mx1 = -(1LL << 60), mn1 = 1LL << 60;
long long mx2 = -(1LL << 60), mn2 = 1LL << 60;

long long add_point(long long x, long long y) {
    long long s = x + y, d = x - y;
    mx1 = max(mx1, s), mn1 = min(mn1, s);
    mx2 = max(mx2, d), mn2 = min(mn2, d);
    return max(mx1 - mn1, mx2 - mn2);
}
```

### 复杂度

单次插入的时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

---

## 9. [All Manhattan Distances](https://cses.fi/problemset/task/3411)
`曼哈顿距离和` `排序贡献`

### 题意

给定一个点集，求所有点对曼哈顿距离之和。

### 分析

曼哈顿距离可以拆成 $|x_i-x_j|+|y_i-y_j|$，所以横纵两个坐标独立求和后再相加即可。对排好序的一维数组 $a$，位置 $i$ 对前面元素的贡献为 $i\cdot a_i-\sum_{j<i}a_j$，顺扫一遍就能得到所有绝对差之和。

### 核心代码
```cpp
long long sum_abs(vector<long long> a) {
    sort(a.begin(), a.end());
    long long ans = 0, pre = 0;
    for (int i = 0; i < (int)a.size(); i++) {
        ans += 1LL * i * a[i] - pre;
        pre += a[i];
    }
    return ans;
}

long long solve(const vector<P>& p) {
    vector<long long> xs, ys;
    for (auto pt : p) xs.push_back(pt.x), ys.push_back(pt.y);
    return sum_abs(xs) + sum_abs(ys);
}
```

### 复杂度

时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

---

# 三、扫描线与函数包络

这一章面对的是大量线段或直线的整体维护：要么沿着 $x$ 轴扫描，动态维护当前活跃对象；要么把每条函数看成候选上包络，用线段树只保留真正可能成为答案的那部分。

## 10. [Intersection Points](https://cses.fi/problemset/task/1740)
`扫描线` `树状数组`

### 题意

给定若干水平线段和竖直线段，统计它们的交点个数。题目保证平行线段之间不会相交，且任意线段端点都不是交点。

### 分析

按 $x$ 从左到右扫描。水平线段在其左端点时加入、右端点时删除，于是扫描到某条竖线段 $x=c$ 时，当前活跃集合恰好是所有覆盖这个 $x$ 的水平线段；只要统计它们的 $y$ 是否落在竖线段的 $[y_1,y_2]$ 内即可。由于只做单点加减和区间计数，用树状数组维护压缩后的 $y$ 坐标最合适。

### 核心代码
```cpp
struct E { int x, t, y1, y2; };

sort(ev.begin(), ev.end(), [](E a, E b) { return tie(a.x, a.t) < tie(b.x, b.t); });
long long ans = 0;
for (auto e : ev) {
    if (e.t == 0) {
        bit.add(id(e.y1), 1);
    } else if (e.t == 2) {
        bit.add(id(e.y1), -1);
    } else {
        ans += bit.sum(id(e.y2)) - bit.sum(id(e.y1) - 1);
    }
}
```

### 复杂度

时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

---

## 11. [Line Segments Trace I](https://cses.fi/problemset/task/3427)
`李超线段树` `上包络`

### 题意

有若干条从 $(0,y_1)$ 连到 $(m,y_2)$ 的线段。对每个整数 $x=0,1,\dots,m$，求所有线段在该位置的最大值。

### 分析

每条线段都覆盖整个定义域，所以它本质上就是一条直线 $y=ax+b$，问题变成在离散区间 $[0,m]$ 上查询直线集合的上包络。最大值版本的李超线段树正适合这种“插入直线、点查询最大值”的场景：节点只保留在该区间内更优的那条候选线。

### 核心代码
```cpp
struct Line {
    long long a, b;
    long long get(long long x) const { return a * x + b; }
};

void add_line(int u, int l, int r, Line s) {
    int m = (l + r) >> 1;
    bool lef = s.get(l) > seg[u].get(l);
    bool mid = s.get(m) > seg[u].get(m);
    if (mid) swap(s, seg[u]);
    if (l == r) return;
    if (lef != mid) add_line(u << 1, l, m, s);
    else add_line(u << 1 | 1, m + 1, r, s);
}

long long ask(int u, int l, int r, int x) {
    long long res = seg[u].get(x);
    if (l == r) return res;
    int m = (l + r) >> 1;
    if (x <= m) return max(res, ask(u << 1, l, m, x));
    return max(res, ask(u << 1 | 1, m + 1, r, x));
}
```

### 复杂度

建树后的总时间复杂度为 $O((n+m) \log m)$，空间复杂度为 $O(m)$。

---

## 12. [Line Segments Trace II](https://cses.fi/problemset/task/3428)
`区间李超线段树` `线段上包络`

### 题意

现在每条线段只在自己的 $x$ 区间 $[x_1,x_2]$ 内有效。要求对每个整数 $x=0,1,\dots,m$ 求所有覆盖该点的线段最大值，若没有线段覆盖则输出 $-1$。

### 分析

与上一题的区别只是“每条直线只在一段区间内活跃”。做法是把 $x$ 轴再套一层区间树：一条线段对应的直线只插入到被其完全覆盖的节点，每个节点内部仍按李超方式维护上包络。最后对每个整数 $x$ 沿根到叶的路径取最大值即可。

### 核心代码
```cpp
void add_seg(int u, int l, int r, int ql, int qr, Line s) {
    if (ql <= l && r <= qr) return add_line(u, l, r, s);
    int m = (l + r) >> 1;
    if (ql <= m) add_seg(u << 1, l, m, ql, qr, s);
    if (qr > m) add_seg(u << 1 | 1, m + 1, r, ql, qr, s);
}

long long ask_seg(int u, int l, int r, int x) {
    long long res = seg[u].get(x);
    if (l == r) return res;
    int m = (l + r) >> 1;
    if (x <= m) return max(res, ask_seg(u << 1, l, m, x));
    return max(res, ask_seg(u << 1 | 1, m + 1, r, x));
}
```

### 复杂度

总插入时间复杂度为 $O(n \log^2 m)$，全部查询时间复杂度为 $O(m \log m)$，空间复杂度为 $O(m)$。

---

## 13. [Lines and Queries I](https://cses.fi/problemset/task/3429)
`李超线段树` `在线查询`

### 题意

在线处理两类操作：加入一条直线 $ax+b$，以及询问所有已加入直线在某个位置 $x$ 的最大值。

### 分析

定义域固定为 $x \in [0,10^5]$，而且只有插入和点查询，没有删除，所以直接维护一棵最大值李超线段树即可。加入时按区间中点比较优劣，把“未来可能更优”的直线递归下放；查询时沿根到叶取最大值。

### 核心代码
```cpp
for (auto q : qs) {
    if (q.type == 1) {
        add_line(1, 0, X, {q.a, q.b});
    } else {
        cout << ask(1, 0, X, q.x) << '\n';
    }
}
```

### 复杂度

单次插入和单次查询的时间复杂度都为 $O(\log X)$，空间复杂度为 $O(X)$。

---

## 14. [Lines and Queries II](https://cses.fi/problemset/task/3430)
`区间李超线段树` `激活区间`

### 题意

在线处理两类操作：加入一条只在区间 $[l,r]$ 内有效的直线 $ax+b$，以及询问某个位置 $x$ 上所有有效直线的最大值；若不存在有效直线则输出 `NO`。

### 分析

这题比上一题多了有效区间限制，本质上和第 $12$ 题完全一致，只是把“遍历所有整数点输出”改成了“只回答出现过的查询点”。因此仍然使用区间李超线段树：新增直线做区间插入，查询时走到对应叶子，收集整条路径上的最大值；若最终还是哨兵值，就说明没有活跃直线。

### 核心代码
```cpp
for (auto q : qs) {
    if (q.type == 1) {
        add_seg(1, 0, X, q.l, q.r, {q.a, q.b});
    } else {
        long long ans = ask_seg(1, 0, X, q.x);
        if (ans == NEG) cout << "NO\n";
        else cout << ans << '\n';
    }
}
```

### 复杂度

单次区间插入的时间复杂度为 $O(\log^2 X)$，单次查询的时间复杂度为 $O(\log X)$，空间复杂度为 $O(X)$。

---

## 15. [Area of Rectangles](https://cses.fi/problemset/task/1741)
`矩形并面积` `扫描线`

### 题意

给定若干轴对齐矩形，求它们并集的总面积。

### 分析

把每个矩形拆成两条竖边事件：左边加入一段 $[y_1,y_2)$，右边删除一段。扫描到相邻两条事件 $x$ 之间时，当前被至少一个矩形覆盖的总高度记为 $len$，那么这一条竖条贡献就是 $len \cdot \Delta x$。为了动态维护覆盖长度，需要对 $y$ 坐标离散化，并用线段树记录覆盖次数与当前总覆盖长度。

### 核心代码
```cpp
void pull(int u, int l, int r) {
    if (cov[u]) len[u] = ys[r + 1] - ys[l];
    else if (l == r) len[u] = 0;
    else len[u] = len[u << 1] + len[u << 1 | 1];
}

long long area = 0;
for (int i = 0, last = ev[0].x; i < (int)ev.size(); ) {
    area += 1LL * (ev[i].x - last) * len[1];
    int x = ev[i].x;
    while (i < (int)ev.size() && ev[i].x == x) {
        upd(1, 0, m - 2, ev[i].y1, ev[i].y2, ev[i].k);
        i++;
    }
    last = x;
}
```

### 复杂度

时间复杂度为 $O(n \log n)$，空间复杂度为 $O(n)$。

---

# 四、路径自交与最早碰撞

这一章只有一道题，但它把前面几章的很多想法都连起来了：路径本身是一组按时间顺序出现的轴对齐线段，而停止时刻就是“当前线段第一次碰到历史访问集合”的最近事件。

## 16. [Robot Path](https://cses.fi/problemset/task/1742)
`路径自交` `最近碰撞`

### 题意

机器人从原点出发，按顺序执行上下左右四种移动命令。若它在途中再次到达某个已经访问过的点，就立刻停止；否则执行完整条路径。要求输出它实际走过的总距离。

### 分析

把每条移动看成一条按时间加入的轴对齐线段。机器人停止的时刻，就是当前线段第一次碰到历史横段或竖段的最近位置；此外还要处理与同轴旧线段发生重叠的情况。于是按命令顺序逐段处理，分别维护历史横段与竖段的索引结构：一类查询异向相交，一类查询同轴重叠，并返回沿当前运动方向最近的命中距离；若这个距离不超过本段长度，答案立刻确定，否则把整段加入结构继续前进。

### 核心代码
```cpp
long long nearest_hit(const Seg& s) {
    if (s.hor) {
        return min(vtree.cross(s.x1, s.x2, s.y, s.step),
                   htree.overlap(s.y, s.x1, s.x2, s.step));
    }
    return min(htree.cross(s.y1, s.y2, s.x, s.step),
               vtree.overlap(s.x, s.y1, s.y2, s.step));
}

long long solve() {
    long long moved = 0;
    Point cur{0, 0};
    for (auto [dir, len] : cmd) {
        Seg s = build_seg(cur, dir, len);
        long long hit = nearest_hit(s);
        if (hit <= len) return moved + hit;
        add_history(s);
        moved += len;
        cur = s.b;
    }
    return moved;
}
```

### 复杂度

若用按坐标分治的区间结构维护历史线段，整体时间复杂度可以做到 $O(n \log^2 n)$，空间复杂度为 $O(n \log n)$。
