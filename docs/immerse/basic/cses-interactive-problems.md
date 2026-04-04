---
title: "CSES 交互题专题精选解题报告"
subtitle: "💬 从二分定位到比较恢复的交互主线"
order: 6
icon: "💬"
---
# CSES 交互题专题精选解题报告

屏幕另一端不肯直接亮出答案，只会在一次次提问后给出极短的回应：YES、NO、一个分数、一段翻转后的回声。真正的难点，不是“会不会写交互”，而是能不能把这些零碎反馈重新组织成稳定的信息流。

这条交互主线很有意思：先用单调性逼近边界，再把比较结果拼成全序，最后把每次操作后的反馈反过来当作观测器。只要抓住信息如何累积，隐藏对象就会一点点现形。

# 一、单调信息与阈值定位

当回答天然带有“左边都成立、右边都不成立”的边界感时，最稳的武器就是二分。这里的关键不是盲猜，而是先找出反馈背后的单调结构，再把查询额度压到对数级。

## 1. [Hidden Integer](https://cses.fi/problemset/task/3112)
`交互` `二分` `阈值定位`
### 题意
隐藏着一个整数 $x$。每次选择一个整数 $y$，系统只回答“$y<x$ 是否成立”。需要在有限提问内确定 $x$。

### 分析
答案并不是分散在整段值域里，而是卡在“最后一个 YES”与“第一个 NO”的交界处。
如果把询问结果看成布尔序列，那么当 $y<x$ 时恒为 YES，当 $y\ge x$ 时恒为 NO，整段区间只会发生一次翻转。于是直接在 $[1,10^9]$ 上做二分，维护“当前仍可能是最后一个 YES 的位置”，最终把边界右侧的第一个点输出即可。

### 核心代码
```cpp
bool ask(int y) {
    cout << "? " << y << endl;
    cout.flush();
    string s;
    cin >> s;
    return s == "YES";
}

void solve() {
    int l = 1, r = 1000000000, ans = 1;
    while (l <= r) {
        int m = l + (r - l) / 2;
        if (ask(m)) {
            ans = m + 1;
            l = m + 1;
        } else {
            r = m - 1;
        }
    }
    cout << "! " << ans << endl;
    cout.flush();
}
```

### 复杂度
询问次数为 $O(\log 10^9)$，本地额外空间为 $O(1)$。

---

## 2. [K-th Highest Score](https://cses.fi/problemset/task/3305)
`交互` `有序数组合并` `分割二分`
### 题意
芬兰和瑞典各有 $n$ 个互不相同的分数，每次可以询问某个国家的第 $i$ 高分。目标是在总询问数受限的情况下，找出整体第 $k$ 高分。

### 分析
两个国家各自形成一条降序链，题目本质上是“两个有序数组合并后的第 $k$ 大”。
设从芬兰取前 $x$ 个、从瑞典取前 $k-x$ 个作为左半边。合法分割应满足：芬兰第 $x$ 高分不小于瑞典第 $k-x+1$ 高分，且瑞典第 $k-x$ 高分不小于芬兰第 $x+1$ 高分。
如果第一条不满足，说明芬兰拿得太少；如果第二条不满足，说明芬兰拿得太多。于是可以对 $x$ 二分。真正的第 $k$ 高分，就是这组合法分割左半边里的最小值。由于二分会反复访问同一位置，代码里顺手做缓存，能把查询稳定压在限制之内。

### 核心代码
```cpp
const int INF = 2000000000;
unordered_map<int, int> memoF, memoS;

int getF(int i) {
    if (i == 0) return INF;
    if (i == n + 1) return -INF;
    if (memoF.count(i)) return memoF[i];
    cout << "F " << i << endl;
    cout.flush();
    return memoF[i] = read_score();
}

int getS(int i) {
    if (i == 0) return INF;
    if (i == n + 1) return -INF;
    if (memoS.count(i)) return memoS[i];
    cout << "S " << i << endl;
    cout.flush();
    return memoS[i] = read_score();
}

void solve() {
    int l = max(0, k - n), r = min(n, k);
    while (l <= r) {
        int x = (l + r) / 2;
        int y = k - x;
        int fx = getF(x), fn = getF(x + 1);
        int sy = getS(y), sn = getS(y + 1);
        if (fx < sn) l = x + 1;
        else if (sy < fn) r = x - 1;
        else {
            cout << "! " << min(fx, sy) << endl;
            cout.flush();
            return;
        }
    }
}
```

### 复杂度
询问次数为 $O(\log n)$，缓存状态数为 $O(\log n)$，本地额外空间为 $O(\log n)$。

---

## 3. [Colored Chairs](https://cses.fi/problemset/task/3273)
`交互` `奇环` `区间二分`
### 题意
有一圈编号为 $1$ 到 $n$ 的椅子，每把椅子不是红色就是蓝色，且 $n$ 为奇数。每次只能询问某把椅子的颜色，要求找出一对相邻且同色的椅子。

### 分析
奇数个点围成的环不可能严格红蓝交替，所以答案一定存在。难点在于如何在很少的询问里定位。
如果先问 $1$ 和 $n$，同色时，$(n,1)$ 这对相邻椅子已经是答案；异色时，把区间 $[1,n]$ 拉直来看，端点颜色与“完全交替”应有的奇偶关系不一致，说明区间内部必然藏着一对同色相邻。
接下来对这个坏区间二分。对任意子区间 $[l,r]$，若长度奇偶与端点颜色关系不匹配，就说明同色相邻仍在其中。每次只要问中点颜色，就能把坏区间缩成一半，直到剩下长度为 $1$ 的边。

### 核心代码
```cpp
unordered_map<int, char> col;

char ask(int i) {
    if (col.count(i)) return col[i];
    cout << "? " << i << endl;
    cout.flush();
    char c;
    cin >> c;
    return col[i] = c;
}

bool bad(int len, char lc, char rc) {
    if (len % 2 == 0) return lc != rc;
    return lc == rc;
}

void solve() {
    int l = 1, r = n;
    if (ask(1) == ask(n)) {
        cout << "! " << n << endl;
        cout.flush();
        return;
    }
    while (r - l > 1) {
        int m = (l + r) / 2;
        if (bad(m - l, ask(l), ask(m))) r = m;
        else l = m;
    }
    cout << "! " << l << endl;
    cout.flush();
}
```

### 复杂度
询问次数为 $O(\log n)$，本地空间为 $O(\log n)$ 级缓存。

# 二、比较器与隐藏排列恢复

当系统愿意回答“谁更小”“某一位被搬去了哪里”时，隐藏对象其实已经具备了可恢复的结构。重点不在于一口气看见排列，而在于把多次局部比较拼成全局编号。

## 4. [Hidden Permutation](https://cses.fi/problemset/task/3139)
`交互` `比较排序` `排列恢复`
### 题意
隐藏着一个 $1$ 到 $n$ 的排列 $a$。每次选择两个位置 $i,j$，系统只告诉你 $a_i<a_j$ 是否成立。要求恢复整个排列。

### 分析
这里拿到的是标准比较器：它不能直接告诉数值，却足以给所有位置排出相对大小。
因为 $a$ 恰好是 $1$ 到 $n$ 的一个排列，所以“第几小”就等于“数值是多少”。先把位置集合按隐藏值从小到大排好序，再把排在第 $t$ 位的位置赋值为 $t$，整个排列就被完整重建了。
为了稳稳卡进比较次数上限，用归并排序最合适：比较次数是确定的 $O(n\log n)$，不会像某些快排写法那样在坏情况下翻车。

### 核心代码
```cpp
vector<int> ord;

bool less_pos(int i, int j) {
    cout << "? " << i << " " << j << endl;
    cout.flush();
    string s;
    cin >> s;
    return s == "YES";
}

void merge_sort(int l, int r) {
    if (r - l <= 1) return;
    int m = (l + r) / 2;
    merge_sort(l, m);
    merge_sort(m, r);
    vector<int> tmp;
    int i = l, j = m;
    while (i < m && j < r) {
        if (less_pos(ord[i], ord[j])) tmp.push_back(ord[i++]);
        else tmp.push_back(ord[j++]);
    }
    while (i < m) tmp.push_back(ord[i++]);
    while (j < r) tmp.push_back(ord[j++]);
    copy(tmp.begin(), tmp.end(), ord.begin() + l);
}

void solve() {
    ord.resize(n);
    iota(ord.begin(), ord.end(), 1);
    merge_sort(0, n);
    vector<int> a(n + 1);
    for (int rank = 0; rank < n; rank++) a[ord[rank]] = rank + 1;
    answer(a);
}
```

### 复杂度
询问次数为 $O(n\log n)$，本地空间为 $O(n)$。

---

## 5. [Permuted Binary Strings](https://cses.fi/problemset/task/3228)
`交互` `位编码` `排列恢复`
### 题意
隐藏着一个排列 $a$。每次可以提交一个长度为 $n$ 的二进制串 $b$，系统返回重排后的字符串 $b_{a_1}b_{a_2}\dots b_{a_n}$。需要恢复整个排列。

### 分析
这题给的不是比较器，而是一次把很多位置批量打标记的能力。
最自然的做法是把每个下标的二进制表示拆开：第 $t$ 次询问时，让所有第 $t$ 位为 $1$ 的位置写成字符 $1$，其余写成 $0$。返回串的第 $j$ 位，就等于下标 $a_j$ 在这一位上的二进制值。把所有位拼起来，$a_j$ 的完整编号就恢复出来了。
因为 $n\le 1000$，只需要 $\lceil \log_2 n \rceil$ 次询问，正好落在限制之内。

### 核心代码
```cpp
string ask(const string& s) {
    cout << "? " << s << endl;
    cout.flush();
    string t;
    cin >> t;
    return t;
}

void solve() {
    vector<int> a(n + 1, 0);
    for (int b = 0; (1 << b) < n; b++) {
        string s(n, '0');
        for (int i = 1; i <= n; i++) {
            if (((i - 1) >> b) & 1) s[i - 1] = '1';
        }
        string t = ask(s);
        for (int j = 1; j <= n; j++) {
            if (t[j - 1] == '1') a[j] |= 1 << b;
        }
    }
    for (int j = 1; j <= n; j++) a[j]++;
    answer(a);
}
```

### 复杂度
询问次数为 $O(\log n)$，本地重建时间为 $O(n\log n)$，空间为 $O(n)$。

# 三、反馈驱动的排序控制

最后这一类更像在黑箱前做实验：你先动手，系统再把整体状态压缩成一个数字回给你。此时题解的关键，不是直接排序，而是先反推出足够多的结构信息，再把排序过程变成可控执行。

## 6. [Inversion Sorting](https://cses.fi/problemset/task/3140)
`交互` `逆序对` `反馈重建`
### 题意
隐藏着一个排列。每次可以翻转一段连续子数组，随后系统返回当前排列的逆序对数量；当逆序对数变成 $0$ 时，排列已经排好序。要求在操作数限制内完成排序。

### 分析
翻转区间不会影响区间外与区间内元素之间的先后关系，真正变化的只有区间内部的逆序对。
设当前总逆序对为 $I$，翻转长度为 $m$ 的区间后得到 $I'$。区间内部原有逆序对数若为 $x$，翻转后会变成 $m(m-1)/2-x$，于是有
$ I' = I + m(m-1)/2 - 2x $，
从而可以反推出
$ x = \dfrac{m(m-1)/2 + I - I'}{2} $。
对每个前缀 $[1,i]$ 询问一次、再翻回来，就能得到这个前缀的逆序对数，进一步算出 Lehmer 编码。排列一旦被重建，后半段就很直接：从小到大把每个值翻到自己的目标位置，总操作数仍然是线性的。

### 核心代码
```cpp
struct Fenwick {
    int n;
    vector<int> bit;
    Fenwick(int n): n(n), bit(n + 1, 0) {}
    void add(int i, int v) { for (; i <= n; i += i & -i) bit[i] += v; }
    int kth(int k) {
        int x = 0;
        for (int p = 1 << 10; p; p >>= 1) {
            if (x + p <= n && bit[x + p] < k) {
                k -= bit[x + p];
                x += p;
            }
        }
        return x + 1;
    }
};

int ask(int l, int r) {
    cout << l << " " << r << endl;
    cout.flush();
    int inv;
    cin >> inv;
    if (inv == 0) exit(0);
    return inv;
}

void solve() {
    long long cur = ask(1, 1);
    vector<long long> pref(n + 1, 0);
    for (int i = 2; i <= n; i++) {
        long long nxt = ask(1, i);
        pref[i] = (1LL * i * (i - 1) / 2 + cur - nxt) / 2;
        ask(1, i);
    }

    vector<int> code(n + 1), p(n + 1), pos(n + 1);
    for (int i = 1; i <= n; i++) code[i] = pref[i] - pref[i - 1];

    Fenwick fw(n);
    for (int i = 1; i <= n; i++) fw.add(i, 1);
    for (int i = n; i >= 1; i--) {
        p[i] = fw.kth(i - code[i]);
        fw.add(p[i], -1);
    }
    for (int i = 1; i <= n; i++) pos[p[i]] = i;

    for (int x = 1; x <= n; x++) {
        int j = pos[x];
        if (j == x) continue;
        ask(x, j);
        reverse(p.begin() + x, p.begin() + j + 1);
        for (int k = x; k <= j; k++) pos[p[k]] = k;
    }
}
```

### 复杂度
交互操作次数为 $O(n)$，本地重建与位置维护时间为 $O(n\log n)$，空间为 $O(n)$。
