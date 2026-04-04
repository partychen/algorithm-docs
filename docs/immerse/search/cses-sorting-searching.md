---
title: "CSES 排序与查找专题精选解题报告"
subtitle: "🔍 从排序秩序到窗口计数与有序维护的解题主线"
order: 3
icon: "🔍"
---

# CSES 排序与查找专题精选解题报告

排序与查找专题真正反复出现的，不是某个孤立技巧，而是“先把信息放回顺序，再在顺序上做决策”：有时是一遍排序后的贪心，有时是滑窗边走边修，有时则要把动态变化交给 multiset、树状数组或前缀和去维护。

# 一、排序之后，贪心才会变清楚

这一章先看最典型的“排完序就豁然开朗”型题目。它们的共同点是：排序并不只是为了好写代码，而是为了让局部选择拥有可证明的单调性。

## 1. [Distinct Numbers](https://cses.fi/problemset/task/1621)

`排序` `去重`

### 题意

给定 $n$ 个整数，求数组里一共有多少种不同的值。

### 分析

这题不需要维护出现次数的细节，只需要知道相同值会不会挤在一起。把数组排好序之后，所有相同元素都会变成连续的一段，于是“不同值的个数”就等于有多少次数值发生变化，再加上第一段本身。

这样做的关键不是排序本身，而是把原本散落在数组各处的重复值压成相邻块。扫描一遍时，当前元素只需要和前一个元素比较，就能知道自己是不是一个新值的起点。

### 核心代码

```cpp
sort(a.begin(), a.end());
int ans = 1;
for (int i = 1; i < n; ++i) {
    ans += (a[i] != a[i - 1]);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(1)$ 或 $O(n)$（取决于排序实现）。

---

## 2. [Apartments](https://cses.fi/problemset/task/1084)

`排序` `双指针`

### 题意

有 $n$ 个申请者和 $m$ 套公寓，第 $i$ 个申请者希望房间大小接近 $a_i$，可接受区间是 $[a_i-k,a_i+k]$。每套公寓只能分给一个人，要求最大化成功分配的人数。

### 分析

申请者和公寓都只在“大小顺序”上产生关系，所以先分别排序。随后用两个指针从小到大匹配：如果当前公寓太小，就只能丢掉这套公寓；如果当前公寓太大，说明这个申请者已经不可能再被更小的房子满足，只能跳过这个人；只有当公寓落在可接受范围内时，才把这对人房一起消耗掉。

这个贪心成立的原因是顺序一旦固定，最小的未处理申请者和最小的未处理公寓之间只有三种关系，而每种关系的决策都不会影响后面更大的数。它本质上是在一维有序线上做最早可行匹配。

### 核心代码

```cpp
sort(a.begin(), a.end());
sort(b.begin(), b.end());
int i = 0, j = 0, ans = 0;
while (i < n && j < m) {
    if (b[j] < a[i] - k) ++j;
    else if (b[j] > a[i] + k) ++i;
    else ++ans, ++i, ++j;
}
```

### 复杂度

时间复杂度 $O(n\log n+m\log m)$，空间复杂度 $O(1)$ 或 $O(n+m)$。

---

## 3. [Ferris Wheel](https://cses.fi/problemset/task/1090)

`排序` `双指针`

### 题意

每个缆车最多坐两个人，总重量不能超过上限 $x$。给出所有孩子体重，求最少需要多少个缆车。

### 分析

如果只看“最重的孩子”，他无论如何都要占用一辆缆车，所以问题只剩下：能不能顺手再塞一个最轻的孩子进去。把体重排序后，用双指针指向最轻和最重：若两人能同车，就让他们一起走；否则最重者只能单独坐走。

这个策略的核心在于：最重的人如果连当前最轻的人都带不动，那他就不可能和任何其他人配对；反过来，如果他能和最轻的人配对，那把这个最轻的人留给别人也不会更优，因为别人只会更轻松。于是每一步都能安全地固定一辆车。

### 核心代码

```cpp
sort(p.begin(), p.end());
int l = 0, r = n - 1, ans = 0;
while (l <= r) {
    if (l == r) {
        ++ans;
        break;
    }
    if (p[l] + p[r] <= x) ++l;
    --r;
    ++ans;
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(1)$ 或 $O(n)$。

---

## 4. [Restaurant Customers](https://cses.fi/problemset/task/1619)

`扫描线` `排序`

### 题意

给出所有顾客的到达时间和离开时间，且所有时间互不相同，要求求出餐厅里同时在场的顾客最大数量。

### 分析

这题关心的不是顾客身份，而是时间轴上的人数变化。把每个到达记成 $+1$ 事件，每个离开记成 $-1$ 事件，按时间排序后从左到右扫描，当前人数不断累加，历史最大值就是答案。

因为题目保证所有到达和离开时刻互不相同，所以不需要额外讨论同一时刻先到还是先走的细节。整个问题就被压成了一条有序事件流。

### 核心代码

```cpp
vector<pair<int, int>> ev;
for (auto [l, r] : seg) {
    ev.push_back({l, 1});
    ev.push_back({r, -1});
}
sort(ev.begin(), ev.end());
int cur = 0, ans = 0;
for (auto [t, d] : ev) {
    cur += d;
    ans = max(ans, cur);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 5. [Movie Festival](https://cses.fi/problemset/task/1629)

`区间贪心` `排序`

### 题意

给出若干部电影的开始和结束时间，要求选出尽可能多部能够完整观看的电影。

### 分析

标准做法是按结束时间从小到大排序，然后总是优先选择最早结束且与当前安排不冲突的电影。原因在于：一旦你决定看某部电影，真正会压缩后续选择空间的是它的结束时间，而不是开始时间；结束越早，给后面留下的空档越大。

这正是区间调度的经典贪心。每次固定最早结束的可选电影后，剩余问题仍然保持同样结构，因此可以一路贪到底。

### 核心代码

```cpp
sort(movie.begin(), movie.end(), [](auto x, auto y) {
    return x.r < y.r;
});
int last = 0, ans = 0;
for (auto [l, r] : movie) {
    if (l >= last) {
        ++ans;
        last = r;
    }
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(1)$ 或 $O(n)$。

---

## 6. [Stick Lengths](https://cses.fi/problemset/task/1074)

`中位数` `排序`

### 题意

可以把每根木棍变长或变短，代价等于改变量。要求把所有木棍改成同一长度时，总代价最小。

### 分析

总代价是 $\sum |a_i-t|$，而这类绝对值和最小化问题的最优点就是中位数。直观上看，若目标点在中位数左边，右侧元素的拉力更强；若在中位数右边，左侧元素的拉力更强，只有落在中位数附近时两边才能平衡。

因此先排序，再选中位数作为目标长度，最后把所有木棍到它的距离加起来即可。题目只要求最小代价，不需要构造所有可能目标值。

### 核心代码

```cpp
sort(a.begin(), a.end());
long long mid = a[n / 2], ans = 0;
for (long long x : a) {
    ans += llabs(x - mid);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(1)$ 或 $O(n)$。

---

## 7. [Missing Coin Sum](https://cses.fi/problemset/task/2183)

`贪心` `排序`

### 题意

给出若干正整数硬币，问最小的、无法由某个子集凑出的和是多少。

### 分析

把硬币从小到大排序，并维护当前已经能够连续凑出的区间是 $[1,\text{reach})$。如果下一枚硬币 $x\le \text{reach}$，那么所有原本能凑出的数再加上 $x$，连续可达范围就会扩展到 $[1,\text{reach}+x)$；但如果 $x>\text{reach}$，那么 $\text{reach}$ 这个数就出现了断层，再也凑不出来。

这题最关键的不是“尝试所有子集”，而是抓住连续可达区间这个不变量。只要前面的硬币已经把前缀区间填满，当前硬币能不能接上，答案就立刻确定。

### 核心代码

```cpp
sort(a.begin(), a.end());
long long reach = 1;
for (long long x : a) {
    if (x > reach) break;
    reach += x;
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(1)$ 或 $O(n)$。

---

## 8. [Tasks and Deadlines](https://cses.fi/problemset/task/1630)

`排序` `贪心`

### 题意

每个任务有处理时长 $a$ 和截止时间 $d$，总收益是所有 $d-f$ 之和，其中 $f$ 是任务完成时刻。要求安排任务顺序，使总收益最大。

### 分析

因为所有截止时间之和是常数，最大化 $\sum(d-f)$ 等价于最小化所有完成时刻之和。于是题目本质变成：怎样安排顺序，能让每个任务的完成时刻总和最小。

这里应该按处理时长从小到大排序，也就是最短任务优先。越早完成的任务会被重复计入后面许多完成时刻，因此把短任务放前面，能尽量减少对整体的连锁拖累。

### 核心代码

```cpp
sort(task.begin(), task.end(), [](auto x, auto y) {
    return x.a < y.a;
});
long long cur = 0, ans = 0;
for (auto [a, d] : task) {
    cur += a;
    ans += d - cur;
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(1)$ 或 $O(n)$。

---

## 9. [Reading Books](https://cses.fi/problemset/task/1631)

`结论` `贪心下界`

### 题意

两个人都要把所有书各读一遍，同一本书不能被两个人同时读。给出每本书的阅读时间，求最少总时间。

### 分析

先看两个不可绕开的下界。第一，每个人都要读完全部书，所以总时间至少是所有阅读时间之和 $\sum t_i$；第二，最长那本书必须被两个人先后各读一遍，因此总时间至少是 $2\max t_i$。

更关键的是，这两个下界中的较大者总能达到。若最长书特别长，另一个人可以在这段时间里把其他书穿插读完；若所有书比较均衡，则两人总工作量的下界 $\sum t_i$ 就已经主导。因此答案直接是 $\max(\sum t_i, 2\max t_i)$。

### 核心代码

```cpp
long long sum = 0, mx = 0;
for (long long x : t) {
    sum += x;
    mx = max(mx, x);
}
long long ans = max(sum, 2 * mx);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

# 二、有序结构与在线维护

这一章的题不再满足“排序一次就结束”。它们都需要边处理边维护当前状态，于是 multiset、优先队列、单调栈和树状数组开始接管节奏。

## 10. [Concert Tickets](https://cses.fi/problemset/task/1091)

`multiset` `贪心`

### 题意

有若干张票，每位顾客依次报出自己能接受的最高价格。每位顾客必须拿到一张价格不超过上限且尽量接近上限的票，且每张票只能卖一次。

### 分析

顾客到来顺序固定，所以每次都要在“当前剩余票价”中找不超过上限的最大值。这正是有序 multiset 的典型用法：用 `upper_bound` 找到第一个大于上限的位置，再往前退一步，就是当前能卖给他的最贵门票。

这里必须取“最大的不超过上限”的票，而不能随便取一张便宜票。因为更便宜的票往往还能留给后面预算更低的顾客，过早浪费高性价比票会直接压缩未来选择空间。

### 核心代码

```cpp
multiset<int> st(h.begin(), h.end());
for (int x : ask) {
    auto it = st.upper_bound(x);
    if (it == st.begin()) ans.push_back(-1);
    else {
        --it;
        ans.push_back(*it);
        st.erase(it);
    }
}
```

### 复杂度

时间复杂度 $O((n+m)\log n)$，空间复杂度 $O(n)$。

---

## 11. [Towers](https://cses.fi/problemset/task/1073)

`贪心` `multiset`

### 题意

按给定顺序处理立方体。每次可以把当前立方体放到某座塔顶，但要求上面的立方体必须严格小于下面的立方体；或者新开一座塔。要求最终塔的数量最少。

### 分析

把每座塔当前的塔顶大小维护起来。对新立方体 $x$，最优做法是把它放到“塔顶中第一个大于 $x$ 的塔”上；如果找不到，就新开一座塔。这样既满足严格递减条件，又尽量不给后面留下过大的塔顶。

这和 patience sorting 的思路一致：替换掉最靠左、刚刚能接纳它的塔顶，才能把塔顶数组维持得尽可能小，从而为未来元素保留最多安放位置。

### 核心代码

```cpp
multiset<int> tops;
for (int x : a) {
    auto it = tops.upper_bound(x);
    if (it != tops.end()) tops.erase(it);
    tops.insert(x);
}
int ans = (int)tops.size();
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 12. [Traffic Lights](https://cses.fi/problemset/task/1163)

`有序集合` `区间维护`

### 题意

长度为 $x$ 的街道上，初始只有两端 $0$ 和 $x$。现在依次加入若干红绿灯，每次加入后要输出当前没有红绿灯的最长连续路段长度。

### 分析

每次插入一个位置 $p$，真正变化的只有它所在的那一段：原来的整段 $[l,r]$ 会被拆成 $[l,p]$ 和 $[p,r]$。因此需要同时维护两类信息：所有红绿灯位置的有序集合，用来快速找到前驱和后继；所有路段长度的 multiset，用来快速删掉旧长度、加入新长度，并随时取最大值。

这题的关键是别去“重算所有区间”。插入只会影响一个局部区间，抓住这一点后，每次更新就是标准的拆段操作。

### 核心代码

```cpp
set<int> pos = {0, x};
multiset<int> len = {x};
for (int p : add) {
    auto it = pos.lower_bound(p);
    int r = *it, l = *prev(it);
    len.erase(len.find(r - l));
    len.insert(p - l);
    len.insert(r - p);
    pos.insert(p);
    ans.push_back(*len.rbegin());
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 13. [Room Allocation](https://cses.fi/problemset/task/1164)

`优先队列` `区间分配`

### 题意

酒店顾客有到达和离开日期。若前一位顾客的离开日严格早于后一位顾客的到达日，两人才能住同一房间。要求用最少房间并给出一种分配方案。

### 分析

把顾客按到达时间排序后，决定当前顾客住哪间房，只和“哪些房间最早空出来”有关。因此用一个小根堆维护每个已分配房间的最近离开时间和房间编号。处理新顾客时，如果最早空出的房间满足 `end < start`，就复用；否则只能新开房间。

最少房间数之所以成立，是因为每一步都尽量复用最早可复用的房间。若连这个房间都赶不上当前顾客，其他房间只会更晚空出，更不可能复用。

### 核心代码

```cpp
sort(seg.begin(), seg.end());
priority_queue<Node, vector<Node>, greater<Node>> pq;
int rooms = 0;
for (auto [l, r, id] : seg) {
    if (!pq.empty() && pq.top().end < l) {
        auto cur = pq.top(); pq.pop();
        ans[id] = cur.id;
        pq.push({r, cur.id});
    } else {
        ans[id] = ++rooms;
        pq.push({r, rooms});
    }
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 14. [Movie Festival II](https://cses.fi/problemset/task/1632)

`multiset` `区间贪心`

### 题意

有 $k$ 个俱乐部成员可以并行看电影。每部电影最多由一个成员观看，且单个成员看的电影不能重叠。要求最大化全体成员总共看完的电影数。

### 分析

单人版本是按结束时间贪心；多人版本仍然延续这个主线，只是每次不再维护一个结束时刻，而是维护 $k$ 个成员各自最近一次观影结束的时间。对当前电影 $[l,r]$，应该找结束时间中不超过 $l$ 的最大那个成员，把电影接到他后面。

为什么要找“最大的可行结束时间”？因为这等于把最晚还能赶上的成员拿来接单，能把更早空闲的成员留给以后开始更早的电影。这和单调贪心里“刚好够用”的思想完全一致。

### 核心代码

```cpp
sort(movie.begin(), movie.end(), [](auto x, auto y) {
    return x.r < y.r;
});
multiset<int> endt;
for (int i = 0; i < k; ++i) endt.insert(0);
int ans = 0;
for (auto [l, r] : movie) {
    auto it = endt.upper_bound(l);
    if (it == endt.begin()) continue;
    --it;
    endt.erase(it);
    endt.insert(r);
    ++ans;
}
```

### 复杂度

时间复杂度 $O(n\log k)$，空间复杂度 $O(k)$。

---

## 15. [Nearest Smaller Values](https://cses.fi/problemset/task/1645)

`单调栈` `在线维护`

### 题意

对于数组每个位置，求它左边最近的、值严格小于它的位置编号；若不存在则输出 $0$。

### 分析

从左到右扫描时，真正可能成为未来答案的，只会是一个值严格递增的栈。当前值 $a_i$ 到来后，所有大于等于它的栈顶元素都不可能再成为任何后续位置的“最近更小值”，因为它们既更靠左，又不比 $a_i$ 更小，应当立刻弹掉。

弹完以后，新的栈顶就是离 $i$ 最近且严格更小的位置。于是整题的核心就在于维护这个“删掉无效候选”的单调结构。

### 核心代码

```cpp
stack<int> st;
for (int i = 1; i <= n; ++i) {
    while (!st.empty() && a[st.top()] >= a[i]) st.pop();
    ans[i] = st.empty() ? 0 : st.top();
    st.push(i);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 16. [Josephus Problem I](https://cses.fi/problemset/task/2162)

`队列模拟` `循环结构`

### 题意

有 $1$ 到 $n$ 编号的孩子围成一圈，每次删除当前圈中“每隔一个”的那个孩子，直到所有人都被删光，要求输出删除顺序。

### 分析

这题的步长固定为 $1$，所以不需要更重的数据结构。用队列维护当前顺序，每轮先把队首孩子转到队尾，表示“跳过一个”，再删掉新的队首即可。这个过程正好等价于在圆环上不断向前走两步、删第二个。

由于每个孩子只会入队出队有限次，直接模拟就能在约束内通过。这里更重要的是把圆环删除翻译成“旋转一次再弹出”的线性操作。

### 核心代码

```cpp
queue<int> q;
for (int i = 1; i <= n; ++i) q.push(i);
while (q.size() > 1) {
    q.push(q.front());
    q.pop();
    ans.push_back(q.front());
    q.pop();
}
ans.push_back(q.front());
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 17. [Josephus Problem II](https://cses.fi/problemset/task/2163)

`树状数组` `第 k 个存活者`

### 题意

与上一题类似，但现在每次要先跳过 $k$ 个孩子，再删除下一个孩子。要求输出完整删除顺序。

### 分析

当步长变成任意 $k$ 时，直接转队列就可能退化得很慢。更稳的做法是维护“谁还活着”的 $0/1$ 数组，并支持两种操作：删掉某个人，以及查询当前第 $t$ 个存活者是谁。树状数组正好能维护前缀活人数，再通过二进制跳找出第 $t$ 个 $1$ 的位置。

设当前剩余人数为 `rem`，下一个被删的位置就是 `(cur + k) % rem` 这个秩。删完后从它后面继续数，问题规模自然减一。

### 核心代码

```cpp
Fenwick bit(n);
for (int i = 1; i <= n; ++i) bit.add(i, 1);
long long cur = 0;
for (int rem = n; rem >= 1; --rem) {
    cur = (cur + k) % rem;
    int id = bit.kth(cur + 1);
    ans.push_back(id);
    bit.add(id, -1);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

# 三、双指针、滑窗与配对枚举

这一章的共同气质是“边界随着答案一起移动”。有时左右指针在有序数组上夹逼，有时窗口在原数组上伸缩，本质都是利用某种单调性，让每个元素只被处理常数次。

## 18. [Sum of Two Values](https://cses.fi/problemset/task/1640)

`排序` `双指针`

### 题意

给定数组和目标和 $x$，要求找出两个不同位置，使两数之和恰好为 $x$；若不存在则输出 `IMPOSSIBLE`。

### 分析

把每个数连同原下标一起排序后，问题就变成经典的有序两数和。若当前两端之和太小，就只能增大左指针；若太大，就只能减小右指针；只有刚好等于目标时才成功。

这里双指针成立的核心在于数组已经有序：调整一端时，和会朝确定方向变化，所以不会漏掉任何可能配对。

### 核心代码

```cpp
sort(a.begin(), a.end());
int l = 0, r = n - 1;
while (l < r) {
    long long s = a[l].val + a[r].val;
    if (s == x) return {a[l].id, a[r].id};
    if (s < x) ++l;
    else --r;
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 19. [Sum of Three Values](https://cses.fi/problemset/task/1641)

`排序` `双指针`

### 题意

给定数组和目标和 $x$，要求找出三个不同位置，使三数之和等于 $x$。

### 分析

三数和最自然的降维方式是固定一个数，剩下两个数在后缀里做双指针。排序后，枚举第一个位置 $i$，目标就变成在区间 $(i,n]$ 里找和为 $x-a_i$ 的两数。

因为 $n$ 上限只有 $5000$，$O(n^2)$ 是完全可行的。真正的重点是：别去暴力枚举三元组，而要及时把“三数和”压回熟悉的“两数和”。

### 核心代码

```cpp
sort(a.begin(), a.end());
for (int i = 0; i < n; ++i) {
    int l = i + 1, r = n - 1;
    while (l < r) {
        long long s = a[i].val + a[l].val + a[r].val;
        if (s == x) return {a[i].id, a[l].id, a[r].id};
        if (s < x) ++l;
        else --r;
    }
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

---

## 20. [Sum of Four Values](https://cses.fi/problemset/task/1642)

`哈希` `配对枚举`

### 题意

给定数组和目标和 $x$，要求找出四个不同位置，使四数之和等于 $x$。

### 分析

若仍然在排序数组上继续多层枚举，会很快变成立方复杂度。这里更自然的思路是把四数和拆成“两对数之和”。扫描到第 $i$ 个位置时，先枚举所有 $j>i$，查询有没有一对更早出现的下标和为 $x-a_i-a_j$；再把所有 `(j,i)` 形式的旧配对和加入哈希表。

之所以先查再加，是为了保证哈希表里的配对下标都严格在 $i$ 左边，从而自动避免四个位置重叠。这个细节正是本题实现是否稳妥的关键。

### 核心代码

```cpp
unordered_map<long long, pair<int, int>> mp;
for (int i = 0; i < n; ++i) {
    for (int j = i + 1; j < n; ++j) {
        long long need = x - a[i] - a[j];
        if (mp.count(need)) return {mp[need].first, mp[need].second, i, j};
    }
    for (int j = 0; j < i; ++j) {
        mp[a[j] + a[i]] = {j, i};
    }
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n^2)$。

---

## 21. [Playlist](https://cses.fi/problemset/task/1141)

`滑动窗口` `哈希`

### 题意

给定歌曲序列，求最长的连续子数组，使其中所有歌曲编号互不相同。

### 分析

窗口右端不断向右扩展时，真正会破坏合法性的只有“当前歌曲在窗口内已经出现过”。因此只要记录每个值最近一次出现的位置，并维护一个左端 `l`。当歌曲 $a_r$ 再次出现时，就把 `l` 推到它上次出现位置的后面。

这样窗口始终保持“无重复”，而且左端只会单调右移。于是每个位置最多进窗、出窗各一次，整题自然线性。

### 核心代码

```cpp
unordered_map<int, int> last;
int l = 0, ans = 0;
for (int r = 0; r < n; ++r) {
    if (last.count(a[r])) l = max(l, last[a[r]] + 1);
    last[a[r]] = r;
    ans = max(ans, r - l + 1);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 22. [Distinct Values Subarrays](https://cses.fi/problemset/task/3420)

`滑动窗口` `计数`

### 题意

给定数组，统计有多少个连续子数组满足其中所有元素都互不相同。

### 分析

这题和上一题共享同一个窗口结构，只是问法从“最长”变成了“总数”。当右端固定在 $r$ 且当前合法左端为 $l$ 时，以 $r$ 结尾的合法子数组恰好有 $r-l+1$ 个，因为起点可以是 $l,l+1,\dots,r$。

所以仍然用最近出现位置维护一个无重复窗口，然后把每个右端对应的贡献累加起来即可。题目难点不在窗口，而在发现“固定右端时可选起点形成一整段”。

### 核心代码

```cpp
unordered_map<int, int> last;
long long ans = 0;
int l = 0;
for (int r = 0; r < n; ++r) {
    if (last.count(a[r])) l = max(l, last[a[r]] + 1);
    last[a[r]] = r;
    ans += r - l + 1;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 23. [Distinct Values Subarrays II](https://cses.fi/problemset/task/2428)

`滑动窗口` `频次维护`

### 题意

给定数组和整数 $k$，统计有多少个连续子数组的不同元素个数至多为 $k$。

### 分析

这次窗口合法性的判定从“是否有重复”变成了“不同元素数是否超过 $k$”。因此不能只看最近出现位置，而要维护窗口内每个值的频次以及当前 distinct 数量。右端加入一个数后，如果 distinct 超过 $k$，就不断右移左端并减少频次，直到窗口重新合法。

一旦窗口合法，以当前右端结尾的所有合法子数组起点仍然形成连续区间，所以贡献依旧是 $r-l+1$。这是“至多型滑窗计数”的标准模板。

### 核心代码

```cpp
unordered_map<int, int> cnt;
long long ans = 0;
int l = 0, kind = 0;
for (int r = 0; r < n; ++r) {
    if (++cnt[a[r]] == 1) ++kind;
    while (kind > k) {
        if (--cnt[a[l]] == 0) --kind;
        ++l;
    }
    ans += r - l + 1;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

# 四、前缀和、子数组与答案二分

这一章的题目虽然表面不同，但都在做同一件事：把原问题转成某种可累计量，再借助前缀和、最值维护或二分判定，把“看起来要枚举很多段”的问题压成线性或对数复杂度。

## 24. [Maximum Subarray Sum](https://cses.fi/problemset/task/1643)

`Kadane` `动态规划`

### 题意

给定整数数组，求非空连续子数组的最大和。

### 分析

设 `cur` 表示“以当前位置结尾”的最大子数组和。来到 $a_i$ 时，这个子数组要么从前一个最优后缀接过来，要么干脆从自己重新开始，所以转移就是 `cur = max(a[i], cur + a[i])`。

这就是 Kadane 算法的本质：只保留对未来还有帮助的那段后缀和。一旦旧和已经拖后腿，就立刻舍弃重开。

### 核心代码

```cpp
long long cur = a[0], ans = a[0];
for (int i = 1; i < n; ++i) {
    cur = max(1LL * a[i], cur + a[i]);
    ans = max(ans, cur);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 25. [Factory Machines](https://cses.fi/problemset/task/1620)

`二分答案` `判定`

### 题意

有若干台机器并行生产，第 $i$ 台每生产一件产品需要 $k_i$ 秒。要求求出至少生产出 $t$ 件产品所需的最短时间。

### 分析

时间越长，能生产的产品数只会越多，因此答案具备明确的单调性。固定一个候选时间 $mid$ 后，第 $i$ 台机器最多能做出 $\lfloor mid / k_i \rfloor$ 件，总产量是这些值的和；若总产量已经不少于 $t$，说明这个时间可行，可以继续往更小的时间压。

这类题最重要的不是“二分”两个字，而是先看出判定函数天然单调。只要单调性成立，最短时间就可以靠最左可行位置拿到。

### 核心代码

```cpp
auto ok = [&](long long tm) {
    long long made = 0;
    for (long long x : k) {
        made += tm / x;
        if (made >= t) return true;
    }
    return false;
};
long long l = 0, r = 1;
while (!ok(r)) r <<= 1;
while (l < r) {
    long long m = (l + r) >> 1;
    if (ok(m)) r = m;
    else l = m + 1;
}
```

### 复杂度

时间复杂度 $O(n\log A)$，空间复杂度 $O(1)$，其中 $A$ 是答案范围。

---

## 26. [Subarray Sums I](https://cses.fi/problemset/task/1660)

`双指针` `正数数组`

### 题意

数组元素全为正数，要求统计和恰好等于 $x$ 的连续子数组个数。

### 分析

因为所有数都为正，窗口和随着右端扩大只会增加，随着左端缩小只会减少，因此可以用双指针维护一个当前窗口和。右端加入元素后，如果和超过 $x$，就不断移动左端把它压回去；若正好等于 $x$，就记一次答案。

“全为正数”是这题能用双指针的决定性条件。一旦有负数，窗口和就不再单调，做法必须换掉。

### 核心代码

```cpp
long long sum = 0, ans = 0;
int l = 0;
for (int r = 0; r < n; ++r) {
    sum += a[r];
    while (sum > x) sum -= a[l++];
    if (sum == x) ++ans;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(1)$。

---

## 27. [Subarray Sums II](https://cses.fi/problemset/task/1661)

`前缀和` `哈希`

### 题意

数组元素可以为负，要求统计和恰好等于 $x$ 的连续子数组个数。

### 分析

有负数时，双指针失效，就该回到前缀和。设前缀和为 $pre_i$，区间 $(l,r]$ 的和是 $pre_r-pre_l$。因此当扫描到当前前缀和 `pre` 时，只要知道此前有多少个前缀和等于 `pre - x`，就知道有多少个子数组以当前位置结尾且和为 $x$。

于是用哈希表统计每种前缀和出现次数即可。空前缀和 $0$ 要先出现一次，表示从开头开始的子数组。

### 核心代码

```cpp
unordered_map<long long, long long> cnt;
cnt[0] = 1;
long long pre = 0, ans = 0;
for (long long x : a) {
    pre += x;
    ans += cnt[pre - target];
    ++cnt[pre];
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 28. [Subarray Divisibility](https://cses.fi/problemset/task/1662)

`前缀和` `同余`

### 题意

给定长度为 $n$ 的数组，求有多少个连续子数组的元素和能够被 $n$ 整除。

### 分析

区间和能被 $n$ 整除，等价于两个前缀和对 $n$ 取模后的余数相同。于是问题变成：扫描前缀和时，每个模值出现了多少次，相同模值之间能组成多少对。

需要特别注意负数取模。为了让余数始终落在 $[0,n-1]$，应该写成 `(pre % n + n) % n`。这一步是本题最容易出错的地方。

### 核心代码

```cpp
vector<long long> cnt(n, 0);
cnt[0] = 1;
long long pre = 0, ans = 0;
for (long long x : a) {
    pre = (pre + x) % n;
    pre = (pre + n) % n;
    ans += cnt[pre];
    ++cnt[pre];
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 29. [Array Division](https://cses.fi/problemset/task/1085)

`二分答案` `贪心划分`

### 题意

给定正整数数组，要把它分成恰好 $k$ 段，使各段和的最大值尽量小，求这个最小可能值。

### 分析

若猜一个上界 $mid$，问题就变成：能否把数组切成不超过 $k$ 段，并让每段和都不超过 $mid$。因为数组元素全为正，所以从左到右贪心装段最优：当前段还能放就继续放，放不下就立刻新开一段。这样得到的是在这个上界下所需段数的最小值。

随着 $mid$ 增大，可行性只会更强，因此可以二分答案。别被“恰好 $k$ 段”吓住；对正数数组而言，只要能切成不超过 $k$ 段，就总能继续把某些段拆开，变成恰好 $k$ 段。

### 核心代码

```cpp
auto ok = [&](long long lim) {
    long long cur = 0;
    int parts = 1;
    for (long long x : a) {
        if (x > lim) return false;
        if (cur + x > lim) ++parts, cur = x;
        else cur += x;
    }
    return parts <= k;
};
```

### 复杂度

时间复杂度 $O(n\log A)$，空间复杂度 $O(1)$，其中 $A$ 是答案范围。

---

## 30. [Maximum Subarray Sum II](https://cses.fi/problemset/task/1644)

`前缀和` `滑动最小值`

### 题意

求长度在 $[a,b]$ 之间的连续子数组的最大和。

### 分析

设前缀和为 $pre$。若子数组右端是 $r$，长度限制意味着左端前一个位置 $l-1$ 必须落在区间 $[r-b,r-a]$。因此答案就是对每个 $r$，取 $pre[r]-\min pre[t]$，其中 $t$ 属于这个合法区间。

所以扫描右端时，需要动态维护一个窗口，里面装的是所有合法的前缀和候选，并且能快速取最小值。用 multiset 最直接，若再追求线性也可以换成单调队列。

### 核心代码

```cpp
multiset<long long> box;
long long ans = LLONG_MIN;
for (int r = a; r <= n; ++r) {
    box.insert(pre[r - a]);
    if (r - b - 1 >= 0) box.erase(box.find(pre[r - b - 1]));
    ans = max(ans, pre[r] - *box.begin());
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

# 五、位置关系、包含判定与组合计数

最后这一组题不再直接操纵数值大小，而是转去维护“位置之间的相对关系”。有些题靠位置逆序对式的局部修补，有些题把区间关系翻成排序后的扫描，还有些题则直接走向组合计数。

## 31. [Collecting Numbers](https://cses.fi/problemset/task/2216)

`位置数组` `排列`

### 题意

数组是 $1$ 到 $n$ 的一个排列。每一轮从左到右尽量收集递增的数字 $1,2,3,\dots$，问总共需要多少轮。

### 分析

真正决定轮数的不是数组值本身，而是每个数所在的位置。若 `pos[i] < pos[i+1]`，说明在同一轮扫描里，拿到 $i$ 后还能继续往右拿到 $i+1$；反之如果 `pos[i] > pos[i+1]`，就一定要新开一轮。

因此答案就是 $1$ 加上所有“位置下降”的次数。这题的关键，是把模拟收集过程直接压成相邻数位置关系的统计。

### 核心代码

```cpp
for (int i = 1; i <= n; ++i) pos[p[i]] = i;
int ans = 1;
for (int x = 1; x < n; ++x) {
    ans += (pos[x] > pos[x + 1]);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 32. [Collecting Numbers II](https://cses.fi/problemset/task/2217)

`局部修补` `排列维护`

### 题意

在上一题的排列上，给出多次交换操作。每次交换两个位置后，都要输出新的轮数。

### 分析

总轮数仍然是 $1+\#\{x\mid pos[x] > pos[x+1]\}$。一次交换只会改变两个数的位置，因此真正可能受影响的相邻数对，只会出现在这两个数的值附近，也就是 $x-1,x,x+1$ 这些边界。

做法是先把所有受影响的相邻对贡献删掉，执行交换、更新位置，再把新贡献加回来。核心不是重算整张排列，而是抓住“局部交换只影响常数个断点”这个性质。

### 核心代码

```cpp
auto bad = [&](int x) {
    return 1 <= x && x < n && pos[x] > pos[x + 1];
};
set<int> chk = {x - 1, x, y - 1, y};
for (int v : chk) ans -= bad(v);
swap(p[i], p[j]);
swap(pos[x], pos[y]);
for (int v : chk) ans += bad(v);
```

### 复杂度

时间复杂度 $O((n+m)\log n)$ 或 $O(n+m)$，空间复杂度 $O(n)$。

---

## 33. [Distinct Values Subsequences](https://cses.fi/problemset/task/3421)

`组合计数` `乘法原理`

### 题意

给定数组，统计其中元素互不相同的子序列个数，答案对 $10^9+7$ 取模。

### 分析

一条合法子序列的本质是：对每种值，最多选它的一个出现位置；选中的所有位置按原数组下标从小到大排列后，就唯一确定了一条子序列。也就是说，不同数值之间的选择彼此独立：若某个值出现了 $c$ 次，那么它有 $c+1$ 种选择方式——选其中任意一个位置，或者干脆不选。

于是总方案数就是所有不同值的 $(c+1)$ 之积，再减去“所有值都不选”的空子序列。题目看起来像 DP，其实更像一次把子序列定义直接拆开的乘法计数。

### 核心代码

```cpp
const long long MOD = 1000000007;
unordered_map<int, int> cnt;
for (int x : a) ++cnt[x];
long long ans = 1;
for (auto [v, c] : cnt) {
    ans = ans * (c + 1) % MOD;
}
ans = (ans - 1 + MOD) % MOD;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 34. [Nested Ranges Check](https://cses.fi/problemset/task/2168)

`区间排序` `扫描`

### 题意

给出若干区间。对每个区间分别判断：它是否包含某个别的区间，以及它是否被某个别的区间包含。

### 分析

先按左端点升序、右端点降序排序。这样做后，若一个区间可能被前面的区间包含，只需要看前面出现过的最大右端点是否不小于自己；若一个区间可能包含后面的区间，只需要看后面出现过的最小右端点是否不大于自己。

右端点按降序排这一细节非常关键：当左端点相同时，更长的区间必须排在前面，才能正确处理“同起点下的包含关系”。

### 核心代码

```cpp
sort(seg.begin(), seg.end(), cmp);
int mx = 0, mn = INF;
for (int i = n - 1; i >= 0; --i) {
    contains[seg[i].id] = (seg[i].r >= mn);
    mn = min(mn, seg[i].r);
}
for (int i = 0; i < n; ++i) {
    contained[seg[i].id] = (seg[i].r <= mx);
    mx = max(mx, seg[i].r);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 35. [Nested Ranges Count](https://cses.fi/problemset/task/2169)

`树状数组` `离线统计`

### 题意

仍然给出若干区间，但这次要对每个区间统计：它包含了多少别的区间，以及有多少别的区间包含了它。

### 分析

排序方式仍然是左端点升序、右端点降序。这样一来，“被多少区间包含”就等价于：在它前面出现过的区间里，有多少个右端点不小于它；“它包含多少区间”则等价于：在它后面出现过的区间里，有多少个右端点不大于它。

右端点的比较需要大量计数，于是先离散化右端点，再用树状数组做两次扫描：从左到右统计前缀中的“大于等于”，从右到左统计后缀中的“小于等于”。这比逐个暴力比较所有区间稳定得多。

### 核心代码

```cpp
sort(seg.begin(), seg.end(), cmp);
for (int i = 0; i < n; ++i) {
    contained[seg[i].id] = bit.sum(m) - bit.sum(rank(seg[i].r) - 1);
    bit.add(rank(seg[i].r), 1);
}
bit.clear();
for (int i = n - 1; i >= 0; --i) {
    contains[seg[i].id] = bit.sum(rank(seg[i].r));
    bit.add(rank(seg[i].r), 1);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。
