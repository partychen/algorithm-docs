---
title: "CSES 滑动窗口专题精选解题报告"
subtitle: "🪟 从流式维护到频次统计与有序结构的窗口主线"
order: 4
icon: "🪟"
---

# CSES 滑动窗口专题精选解题报告

滑动窗口真正考的是“窗口右移一步时，哪些信息可以跟着增删一项就更新完毕”。这组题把这种维护拆成了几条主线：可逆聚合、单调结构、频次表，以及更重的有序统计与区间支配。

# 一、可逆窗口统计与流式维护

这一章先看最典型的定长窗口：窗口长度固定，但答案是否容易维护，取决于这个统计量能不能“删掉旧元素、补上新元素”地更新。

## 1. [Sliding Window Sum](https://cses.fi/problemset/task/3220)

`滑动窗口` `生成器` `流式求和`

### 题意

数组不是直接给出的，而是由递推生成器在线产生。要求把每个长度为 $k$ 的窗口元素和算出来，并把这些窗口和再整体异或成一个最终答案。

### 分析

这题最关键的限制不是“窗口和”，而是 $n$ 可以到 $10^7$，所以不可能把整个数组存下来后再扫。既然输入本来就是生成器产出的，那就顺着生成顺序一边读、一边维护窗口。

窗口和本身是可逆量。若当前窗口和为 $sum$，窗口右移一步后，只需减掉离开的最旧元素，再加上刚生成的新元素即可。这样每产生一个新值，就能立刻把新的窗口和算出来，并顺手异或进答案。为了知道谁要离开，只需要一个长度为 $k$ 的环形缓冲区。

### 核心代码

```cpp
long long cur = x, sum = 0, ans = 0;
vector<int> buf(k);
for (int i = 0; i < n; ++i) {
    int v = cur;
    cur = (a * cur + b) % c;
    if (i < k) sum += v;
    else sum += v - buf[i % k];
    buf[i % k] = v;
    if (i >= k - 1) ans ^= sum;
}
cout << ans;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(k)$。

---

## 2. [Sliding Window Xor](https://cses.fi/problemset/task/3426)

`滑动窗口` `生成器` `按位异或`

### 题意

数组同样由生成器给出。要求依次求出每个长度为 $k$ 的窗口异或值，再把这些窗口异或值全部异或起来。

### 分析

这题和上一题的结构几乎一样，但窗口统计从“和”换成了“异或”。区别在于，异或比求和更适合滑动：同一个数异或两次会抵消，所以窗口右移时，直接把离开的数和进入的数各异或一次即可。

由于最终也只是要所有窗口异或值的总异或，仍然没必要保留整张答案表。边生成、边维护当前窗口异或、边并入最终答案，就是最顺的写法。这里同样只需要一个环形缓冲区记住将被删掉的旧值。

### 核心代码

```cpp
int cur = x, win = 0, ans = 0;
vector<int> buf(k);
for (int i = 0; i < n; ++i) {
    int v = cur;
    cur = (1LL * a * cur + b) % c;
    if (i >= k) win ^= buf[i % k];
    win ^= v;
    buf[i % k] = v;
    if (i >= k - 1) ans ^= win;
}
cout << ans;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(k)$。

---

## 3. [Sliding Window Minimum](https://cses.fi/problemset/task/3221)

`单调队列` `生成器` `窗口最小值`

### 题意

数组由生成器产生。对每个长度为 $k$ 的窗口，要求取最小值；最后输出所有窗口最小值的异或结果。

### 分析

最小值和求和、异或不同，它不是可逆量。若离开的元素刚好是当前最小值，就没法靠一个公式把答案“补回来”，所以必须显式维护一批未来可能成为最小值的候选者。

单调队列正好适合这件事。新元素 $v$ 进入窗口时，队尾所有不小于 $v$ 的元素以后都不可能再成为最小值，可以直接删掉；这样队列里就始终保持值递增。与此同时，队首若已经滑出窗口，也要及时弹掉。每次窗口长度达到 $k$ 时，队首就是当前窗口最小值。

### 核心代码

```cpp
long long cur = x;
deque<pair<int,int>> dq;
int ans = 0;
for (int i = 0; i < n; ++i) {
    int v = cur;
    cur = (a * cur + b) % c;
    while (!dq.empty() && dq.back().second >= v) dq.pop_back();
    dq.push_back({i, v});
    while (!dq.empty() && dq.front().first <= i - k) dq.pop_front();
    if (i >= k - 1) ans ^= dq.front().second;
}
cout << ans;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(k)$。

---

## 4. [Sliding Window Or](https://cses.fi/problemset/task/3405)

`按位统计` `生成器` `窗口 OR`

### 题意

数组由生成器给出。对每个长度为 $k$ 的窗口，要求计算按位或结果，并把所有窗口 OR 再异或成最终答案。

### 分析

按位或和最小值一样，也不能直接“删掉一个元素就回退”。一个比特位是否为 $1$，取决于窗口里是否还有任何元素在这一位上为 $1$；因此最自然的维护方式不是整个数，而是每个二进制位各自维护出现次数。

窗口滑动时，对离开的数和进入的数逐位更新计数。若某一位计数从 $0$ 变成 $1$，说明当前窗口 OR 新增了这一位；若从 $1$ 变成 $0$，说明这一位应该被清掉。因为题目中的数值上界在 $10^9$ 量级，维护三十多位就够了。

### 核心代码

```cpp
const int B = 31;
long long cur = x;
vector<int> buf(k), cnt(B, 0);
int now = 0, ans = 0;
auto add = [&](int v, int d) {
    for (int b = 0; b < B; ++b) if (v >> b & 1) {
        cnt[b] += d;
        if (cnt[b] == 0) now &= ~(1 << b);
        else now |= 1 << b;
    }
};
for (int i = 0; i < n; ++i) {
    int v = cur;
    cur = (a * cur + b) % c;
    if (i >= k) add(buf[i % k], -1);
    add(v, 1), buf[i % k] = v;
    if (i >= k - 1) ans ^= now;
}
cout << ans;
```

### 复杂度

时间复杂度 $O(n\log V)$，空间复杂度 $O(k+\log V)$。

---

# 二、频次表驱动的窗口信息

当窗口答案只和“每个值在当前窗口里出现了几次”有关时，核心结构就从顺序转成了频次表；不同题目之间的差异，只在于怎样从这张频次表上读出答案。

## 5. [Sliding Window Distinct Values](https://cses.fi/problemset/task/3222)

`频次统计` `哈希表` `去重计数`

### 题意

给定数组，要求输出每个长度为 $k$ 的窗口中，不同数值的个数。

### 分析

这题最省事，因为答案只关心“某个值是否出现过”，不关心它具体出现几次。于是维护一个频次表 `cnt[x]`，再额外维护当前窗口里频次大于 $0$ 的值有多少个即可。

窗口右移时，离开的元素频次减一；若它从 $1$ 变成 $0$，说明窗口里少了一种值。进入的新元素频次加一；若它从 $0$ 变成 $1$，说明窗口里新增了一种值。整个过程完全不需要更复杂的数据结构。

### 核心代码

```cpp
unordered_map<int,int> cnt;
int kinds = 0;
for (int i = 0; i < n; ++i) {
    if (++cnt[a[i]] == 1) ++kinds;
    if (i >= k && --cnt[a[i - k]] == 0) --kinds;
    if (i >= k - 1) cout << kinds << ' ';
}
```

### 复杂度

时间复杂度期望为 $O(n)$，空间复杂度 $O(m)$，其中 $m$ 是窗口内不同元素个数的上界。

---

## 6. [Sliding Window Mode](https://cses.fi/problemset/task/3224)

`频次统计` `有序集合` `众数`

### 题意

给定数组，要求输出每个长度为 $k$ 的窗口众数；若有多个出现次数并列最多的值，输出其中最小的那个。

### 分析

单靠频次表还不够，因为题目除了要知道“谁的频次最大”，还规定了并列时取最小值。也就是说，窗口答案实际上是按“频次降序、数值升序”排出来的第一名。

最直接的维护方式是：频次表之外，再放一个有序集合，元素写成 $(-cnt[x], x)$。这样集合最小元就是当前窗口的合法众数。窗口滑动时，某个值频次变化前先把旧二元组删掉，变化后若新频次仍大于 $0$，再把新二元组插回去。

### 核心代码

```cpp
unordered_map<int,int> cnt;
set<pair<int,int>> ord;
auto touch = [&](int x, int d) {
    if (cnt[x] > 0) ord.erase({-cnt[x], x});
    cnt[x] += d;
    if (cnt[x] > 0) ord.insert({-cnt[x], x});
};
for (int i = 0; i < n; ++i) {
    touch(a[i], 1);
    if (i >= k) touch(a[i - k], -1);
    if (i >= k - 1) cout << ord.begin()->second << ' ';
}
```

### 复杂度

时间复杂度 $O(n\log m)$，空间复杂度 $O(m)$。

---

## 7. [Sliding Window Mex](https://cses.fi/problemset/task/3219)

`频次统计` `mex` `缺失值维护`

### 题意

给定数组，要求输出每个长度为 $k$ 的窗口的 mex，也就是窗口中没有出现的最小非负整数。

### 分析

mex 看起来像要盯住很多数，但窗口长度固定后有个关键上界：任意长度为 $k$ 的数组，mex 一定不超过 $k$。因为若 $0,1,\dots,k-1$ 都出现了，mex 就恰好是 $k$；若其中有谁缺失，mex 更小。所以所有大于 $k$ 的值都不会直接影响答案。

于是可以只维护 $0$ 到 $k$ 的频次，并额外维护一个“当前缺失的数”的有序集合 `miss`。某个值进入窗口时，若它的频次从 $0$ 变成 $1$，就把它从 `miss` 里删掉；某个值离开窗口时，若它的频次从 $1$ 变成 $0$，就把它重新放回去。集合最小值始终就是 mex。

### 核心代码

```cpp
vector<int> cnt(k + 1, 0);
set<int> miss;
for (int x = 0; x <= k; ++x) miss.insert(x);
auto add = [&](int x, int d) {
    if (x > k) return;
    cnt[x] += d;
    if (cnt[x] == 0) miss.insert(x);
    else miss.erase(x);
};
for (int i = 0; i < n; ++i) {
    add(a[i], 1);
    if (i >= k) add(a[i - k], -1);
    if (i >= k - 1) cout << *miss.begin() << ' ';
}
```

### 复杂度

时间复杂度 $O(n\log k)$，空间复杂度 $O(k)$。

---

# 三、有序统计、秩与代价函数

这一章开始，窗口答案不再是简单频次，而是“第几小”“到中位数的距离和”这类顺序统计量；维护重点也从哈希表转向 multiset、Fenwick 之类的有序结构。

## 8. [Sliding Window Median](https://cses.fi/problemset/task/1076)

`中位数` `multiset` `平衡维护`

### 题意

给定数组，要求输出每个长度为 $k$ 的窗口的中位数。若 $k$ 为偶数，按题意取较小的那个中位数。

### 分析

窗口中位数的难点在于既要支持插入删除，又要随时拿到“第 $(k+1)/2$ 小”的数。把窗口拆成两半最自然：`low` 保存较小的一半，`high` 保存较大的一半，并强制 `low` 的大小始终等于 $(k+1)/2$。

这样一来，`low` 里的最大值就恰好是题目要求的中位数。每次插入或删除后，只要根据大小关系把元素放进正确的一边，再不断搬运边界元素把两边尺寸调平，就能稳定输出答案。因为会有重复值，容器最好用支持重复元素的 `multiset`。

### 核心代码

```cpp
multiset<int> low, high;
auto fix = [&]() {
    while ((int)low.size() > (k + 1) / 2) high.insert(*prev(low.end())), low.erase(prev(low.end()));
    while ((int)low.size() < (k + 1) / 2) low.insert(*high.begin()), high.erase(high.begin());
    while (!low.empty() && !high.empty() && *prev(low.end()) > *high.begin()) {
        int a = *prev(low.end()), b = *high.begin();
        low.erase(prev(low.end())), high.erase(high.begin());
        low.insert(b), high.insert(a);
    }
};
auto add = [&](int x) { (low.empty() || x <= *prev(low.end()) ? low : high).insert(x); fix(); };
auto del = [&](int x) { auto it = low.find(x); if (it != low.end()) low.erase(it); else high.erase(high.find(x)); fix(); };
```

### 复杂度

时间复杂度 $O(n\log k)$，空间复杂度 $O(k)$。

---

## 9. [Sliding Window Cost](https://cses.fi/problemset/task/1077)

`中位数` `绝对值和` `双 multiset`

### 题意

给定数组，要求对每个长度为 $k$ 的窗口，求把窗口内所有元素都改成同一个值所需的最小总代价，其中单个元素的代价是改变量的绝对值。

### 分析

绝对值和最小化的经典结论是：最佳目标值取任意一个中位数。于是这题并不是新问题，而是在上一题“维护窗口中位数”的基础上，再把左右两边元素和也一起记住。

设 `low` 保存不大于中位数的一半，`high` 保存其余一半，`med` 为 `low` 最大值。那么窗口总代价就是
$med\cdot |low| - sumLow + sumHigh - med\cdot |high|$。
前半部分是把左边元素都抬到中位数，后半部分是把右边元素都降到中位数。也就是说，只要在平衡两个 multiset 的同时同步维护两边元素和，就能在 $O(1)$ 时间读出当前窗口答案。

### 核心代码

```cpp
multiset<long long> low, high;
long long sumLow = 0, sumHigh = 0;
auto push_low = [&](long long x) { low.insert(x), sumLow += x; };
auto push_high = [&](long long x) { high.insert(x), sumHigh += x; };
auto erase_one = [&](multiset<long long> &st, long long x, long long &sum) { auto it = st.find(x); sum -= x, st.erase(it); };
auto fix = [&]() {
    while ((int)low.size() > (k + 1) / 2) { long long x = *prev(low.end()); erase_one(low, x, sumLow); push_high(x); }
    while ((int)low.size() < (k + 1) / 2) { long long x = *high.begin(); erase_one(high, x, sumHigh); push_low(x); }
    while (!low.empty() && !high.empty() && *prev(low.end()) > *high.begin()) {
        long long a = *prev(low.end()), b = *high.begin();
        erase_one(low, a, sumLow), erase_one(high, b, sumHigh);
        push_low(b), push_high(a);
    }
};
auto cost = [&]() {
    long long med = *prev(low.end());
    return med * (long long)low.size() - sumLow + sumHigh - med * (long long)high.size();
};
```

### 复杂度

时间复杂度 $O(n\log k)$，空间复杂度 $O(k)$。

---

## 10. [Sliding Window Inversions](https://cses.fi/problemset/task/3223)

`逆序对` `Fenwick` `坐标压缩`

### 题意

给定数组，要求输出每个长度为 $k$ 的窗口中的逆序对数量。

### 分析

逆序对和顺序有关，看上去不太像标准滑窗；但固定窗口右移一步时，变化量其实很干净。先把值做坐标压缩，再用 Fenwick 维护当前窗口各个值的出现次数。

构造第一个窗口时，从左到右插入元素。新元素 $x$ 作为右端点，会和前面所有大于它的元素形成新的逆序对，所以贡献是“当前已有元素数减去不大于 $x$ 的个数”。窗口右移时，左端点 $y$ 离开，它只会删掉那些以它为左端点的逆序对，也就是当前窗口中严格小于 $y$ 的元素个数；新右端点 $x$ 进入时，则新增当前窗口中严格大于 $x$ 的元素个数。这样每次平移都只要几次 Fenwick 查询。

### 核心代码

```cpp
Fenwick bit(m);
long long inv = 0;
for (int i = 0; i < k; ++i) {
    int p = rk[a[i]];
    inv += i - bit.sum(p);
    bit.add(p, 1);
}
cout << inv << ' ';
for (int r = k; r < n; ++r) {
    int out = rk[a[r - k]];
    inv -= bit.sum(out - 1);
    bit.add(out, -1);
    int in = rk[a[r]];
    inv += (k - 1) - bit.sum(in);
    bit.add(in, 1);
    cout << inv << ' ';
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

# 四、从最小值支配到整段最优

最后这题不再输出某个点值，而是窗口里整段区间的最优矩形面积。窗口仍然在滑，但真正要维护的是“哪根柱子作为最小值时，能支配多宽的一段”。

## 11. [Sliding Window Advertisement](https://cses.fi/problemset/task/3227)

`单调栈` `Li Chao Tree` `最大矩形`

### 题意

给定一排木板高度。对每个长度为 $k$ 的窗口，要求求出只使用这个窗口内木板时，能贴出的最大矩形广告面积。

### 分析

若只求整张直方图的最大矩形，经典做法是枚举“哪根柱子充当最小高度”，再用单调栈求它向左右最多能扩到哪里。现在窗口固定为长度 $k$，思路仍然一样，只是同一根柱子在不同窗口里的可扩展宽度会变化。

设第 $i$ 根柱子的高度为 $h_i$。用单调栈求出它作为指定最小值时的最大支配区间 $[L_i,R_i]$：左边找上一个严格更小的位置，右边找下一个小于等于它的位置，这样每个矩形都会被唯一地归到一根柱子上。对于起点为 $s$ 的窗口 $[s,s+k-1]$，若它覆盖了 $i$，那么以 $i$ 为最小值的最佳矩形宽度就是
$w_i(s)=\min(R_i,s+k-1)-\max(L_i,s)+1$。

这个宽度函数随 $s$ 变化，只会经历“重叠逐渐变大、保持不变、再逐渐变小”三段，因此面积 $h_i\cdot w_i(s)$ 是最多三段一次函数。于是整题可以转成：对所有窗口起点 $s=1\dots n-k+1$，求许多线段函数在该点的最大值。单调栈先算每根柱子的 $[L_i,R_i]$，再把每根柱子的贡献拆成若干条线段丢进支持区间加线、单点查询最大值的 Li Chao Tree，最后依次查询每个窗口起点即可。

### 核心代码

```cpp
for (int i = 1; i <= n; ++i) {
    while (!st.empty() && h[st.top()] >= h[i]) st.pop();
    L[i] = st.empty() ? 1 : st.top() + 1;
    st.push(i);
}
while (!st.empty()) st.pop();
for (int i = n; i >= 1; --i) {
    while (!st.empty() && h[st.top()] > h[i]) st.pop();
    R[i] = st.empty() ? n : st.top() - 1;
    st.push(i);
}
for (int i = 1; i <= n; ++i) add_piecewise(i, L[i], R[i], h[i], k, lichao);
for (int s = 1; s <= n - k + 1; ++s) cout << lichao.query(s) << ' ';
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。
