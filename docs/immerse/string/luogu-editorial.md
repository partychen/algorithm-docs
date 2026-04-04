---
title: "洛谷 字符串专题精选解题报告"
subtitle: "🔤 从匹配、哈希到自动机与后缀结构的字符串主线"
order: 1
icon: "🧵"
---

# 洛谷 字符串专题精选解题报告

这一组题从朴素匹配与回文处理一路走到哈希、Trie、AC 自动机和后缀结构，主线非常清楚：字符串题看似在操作字符，实则总在维护“前缀、子串或若干模式串之间的结构关系”。前半段偏局部匹配，后半段则逐步走向全局索引与自动机。

# 一、基础匹配、回文与循环同构

先把字符串里最常见的几类线性算法打稳：循环同构、单模式匹配、扩展匹配和回文半径。

## 1. [P13270 【模板】最小表示法](https://www.luogu.com.cn/problem/P13270)

`最小表示法` `循环同构`

### 题意

给定一个字符串 `s`，把它看成一个环，允许从任意位置开始读一圈。要求输出所有循环同构串中字典序最小的那个。

### 分析

暴力枚举所有起点再比较，复杂度是 $O(n^2)$。最小表示法的核心是同时维护两个候选起点 `i` 和 `j`，逐字符比较它们对应的循环串。

一旦在第 `k` 位发现大小关系，就能一次性排除一整段起点：如果 `s[i+k] > s[j+k]`，那么从 `i` 到 `i+k` 的起点都不可能更优，直接跳到 `i+k+1`。整个过程每个位置最多被跳过一次，所以是线性的。

### 核心代码

```cpp
int get_min(vector<int>& a) {
    int n = a.size() - 1;
    for (int i = 1; i <= n; i++) a.push_back(a[i]);
    int i = 1, j = 2, k = 0;
    while (i <= n && j <= n) {
        for (k = 0; k < n && a[i + k] == a[j + k]; k++);
        if (k == n) break;
        if (a[i + k] > a[j + k]) i += k + 1;
        else j += k + 1;
        if (i == j) j++;
    }
    return min(i, j);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 2. [P1368 工艺](https://www.luogu.com.cn/problem/P1368)

`最小表示法` `循环序列`

### 题意

给定一个环形方块序列，只允许把最左边的方块搬到最右边，问经过若干次操作后，字典序最小的序列是什么。

### 分析

虽然题面讲的是环形方块，但操作只有一种：把最左边搬到最右边。连续做若干次后，本质上就是选一个新的起点重新读整圈，所以问题和字符串最小表示法完全同构。

一旦看出“操作序列 = 循环位移”，后面就不该再模拟搬运，而是直接在所有起点里找字典序最小者。最小表示法的价值也正体现在这里：比较两个候选起点时，一旦在第 `k` 位分出大小，就能整段淘汰一批不可能更优的起点。

所以这题最重要的识别是：**环上左移到末尾，不是队列操作题，而是循环同构的最小表示问题。**

### 核心代码

```cpp
int get_min(vector<int>& a) {
    int n = a.size() - 1;
    for (int i = 1; i <= n; i++) a.push_back(a[i]);
    int i = 1, j = 2;
    while (i <= n && j <= n) {
        int k = 0;
        while (k < n && a[i + k] == a[j + k]) k++;
        if (k == n) break;
        if (a[i + k] > a[j + k]) i += k + 1;
        else j += k + 1;
        if (i == j) j++;
    }
    return min(i, j);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 3. [P3375 【模板】KMP](https://www.luogu.com.cn/problem/P3375)

`KMP` `前缀函数`

### 题意

给定文本串 `s1` 和模式串 `s2`，要求输出模式串在文本串中的所有出现位置，并输出模式串每个前缀的最长 border 长度。

### 分析

KMP 的核心是 `next`（或 `pi`）数组：`next[i]` 表示模式串前 `i` 个字符的最长相等真前后缀长度。失配时，不回退文本指针，而是把模式串指针跳到 `next[j]`。

这样文本串只扫描一遍，模式串也只沿着 `next` 链回退，总复杂度线性。模板部分分两段：先求 `next`，再进行匹配。

### 核心代码

```cpp
string s, t;
int ne[N];

void build_next() {
    for (int i = 2, j = 0; i <= (int)t.size() - 1; i++) {
        while (j && t[i] != t[j + 1]) j = ne[j];
        if (t[i] == t[j + 1]) j++;
        ne[i] = j;
    }
}

void match() {
    for (int i = 1, j = 0; i <= (int)s.size() - 1; i++) {
        while (j && s[i] != t[j + 1]) j = ne[j];
        if (s[i] == t[j + 1]) j++;
        if (j == (int)t.size() - 1) j = ne[j];
    }
}
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(m)$。

---

## 4. [P5410 【模板】扩展 KMP / exKMP（Z 函数）](https://www.luogu.com.cn/problem/P5410)

`Z 函数` `扩展 KMP`

### 题意

给定两个字符串 `a,b`，要求求出 `b` 的 Z 函数，以及 `b` 与 `a` 每个后缀的最长公共前缀长度数组。

### 分析

Z 函数 `z[i]` 表示 `s[i..n]` 与 `s[1..n]` 的最长公共前缀长度。它和 KMP 很像，但关注的是“每个后缀和原串的 LCP”，而不是 border。

做法是维护当前覆盖最远的区间 `[l,r]`。如果 `i` 落在区间内，就能先用镜像位置的答案做下界，再暴力向右扩展。扩展匹配时，把模式串的 Z 值拿来给文本串做同样的优化即可。

### 核心代码

```cpp
void get_z(const string& s, vector<int>& z) {
    int n = s.size() - 1;
    z.assign(n + 1, 0);
    z[1] = n;
    for (int i = 2, l = 0, r = 0; i <= n; i++) {
        if (i <= r) z[i] = min(z[i - l + 1], r - i + 1);
        while (i + z[i] <= n && s[1 + z[i]] == s[i + z[i]]) z[i]++;
        if (i + z[i] - 1 > r) l = i, r = i + z[i] - 1;
    }
}

void exkmp(const string& a, const string& b, vector<int>& z, vector<int>& p) {
    int n = a.size() - 1, m = b.size() - 1;
    p.assign(n + 1, 0);
    for (int i = 1, l = 0, r = 0; i <= n; i++) {
        if (i <= r) p[i] = min(z[i - l + 1], r - i + 1);
        while (1 + p[i] <= m && i + p[i] <= n && b[1 + p[i]] == a[i + p[i]]) p[i]++;
        if (i + p[i] - 1 > r) l = i, r = i + p[i] - 1;
    }
}
```

### 复杂度

时间复杂度 $O(|a|+|b|)$，空间复杂度 $O(|a|+|b|)$。

---

## 5. [P3805 【模板】Manacher](https://www.luogu.com.cn/problem/P3805)

`Manacher` `最长回文子串`

### 题意

给定一个只含小写字母的字符串，求最长回文子串的长度。

### 分析

如果每个中心向两边扩展，最坏要 $O(n^2)$。Manacher 的关键是引入分隔符，把奇偶长度回文统一起来，然后维护当前最右回文区间 `[l,r]`。

对于一个新中心 `i`，若它落在 `[l,r]` 内，可以先继承对称位置的部分答案；之后只需从这个下界继续扩展即可。每个字符被“真正扩展”的次数仍然是线性的。

### 核心代码

```cpp
string build(const string& s) {
    string t = "^#";
    for (char c : s) t += c, t += '#';
    t += '$';
    return t;
}

int manacher(const string& s) {
    string t = build(s);
    vector<int> p(t.size(), 0);
    int mid = 0, r = 0, ans = 0;
    for (int i = 1; i + 1 < (int)t.size(); i++) {
        if (i < r) p[i] = min(p[mid * 2 - i], r - i);
        while (t[i - p[i] - 1] == t[i + p[i] + 1]) p[i]++;
        if (i + p[i] > r) mid = i, r = i + p[i];
        ans = max(ans, p[i]);
    }
    return ans;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 6. [P3501 [POI 2010] ANT-Antisymmetry](https://www.luogu.com.cn/problem/P3501)

`Manacher` `反对称`

### 题意

给定一个 `0/1` 串，求有多少个子串满足：把它翻转并把 `0/1` 全部取反后，仍然与原串相同。

### 分析

反对称子串只可能是偶数长度，而且围绕中心向外扩展时，要求左右字符始终相反，也就是 `s[l] != s[r]`。

因此可以把 Manacher 的“左右字符相等”改成“左右字符不等”，专门处理偶回文中心。每个中心的最大半径就是以该中心为界的反对称子串个数。

### 核心代码

```cpp
long long solve(const string& s) {
    int n = s.size();
    vector<int> p(n, 0);
    long long ans = 0;
    for (int i = 1, l = 1, r = 0; i < n; i++) {
        int k = (i <= r) ? min(p[l + r - i + 1], r - i + 1) : 0;
        while (i - k - 1 >= 0 && i + k < n && s[i - k - 1] != s[i + k]) k++;
        p[i] = k;
        ans += k;
        if (i + k - 1 > r) l = i - k + 1, r = i + k - 1;
    }
    return ans;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

# 二、字符串哈希与复杂计数

这一组围绕多项式哈希展开，从基础判等、判重一路推进到前缀链和复杂分块计数。

## 7. [U417226 字符串哈希](https://www.luogu.com.cn/problem/U417226)

`字符串哈希` `子串判等`

### 题意

给定一个字符串和若干询问，每次判断两个区间对应的子串是否完全相同。

### 分析

子串判等最朴素的方法是把两个区间逐字符比较，但重复询问时，很多前缀会被反复扫很多遍。字符串哈希的核心，就是先把每个前缀压成一个数，让“比较一整段”变成“比较两个归一化后的哈希值”。

设 `h[i]` 是前缀哈希，那么 `h[r]` 里既包含了 `[1,l-1]` 也包含了 `[l,r]`。用 `h[l-1] * p[r-l+1]` 把前半段对齐后减掉，就恰好留下区间 `[l,r]` 的独立哈希。这样两个子串只要长度相同，就能在 `O(1)` 时间拿到可比较的表示。

所以这题最值得形成的直觉是：**前缀哈希的作用，不是“记住整个串”，而是把任意子串快速切出来比较。**

### 核心代码

```cpp
using ull = unsigned long long;
const ull B = 131;
ull h[N], pw[N];

void build(const string& s) {
    pw[0] = 1;
    for (int i = 1; i <= (int)s.size() - 1; i++) {
        h[i] = h[i - 1] * B + s[i];
        pw[i] = pw[i - 1] * B;
    }
}

ull get(int l, int r) {
    return h[r] - h[l - 1] * pw[r - l + 1];
}
```

### 复杂度

预处理时间复杂度 $O(n)$，单次询问 $O(1)$，空间复杂度 $O(n)$。

---

## 8. [P3370 【模板】字符串哈希](https://www.luogu.com.cn/problem/P3370)

`字符串哈希` `判重`

### 题意

给定 `N` 个字符串，求其中有多少个不同的字符串。

### 分析

最直接的做法是把每个字符串算成哈希值，再排序去重。由于题目只需要统计不同字符串数量，不需要支持在线修改，所以离线排序非常自然。

为降低冲突风险，可以用 `unsigned long long` 自然溢出，或者直接做双哈希。题解里常见的是“算值 → 排序 → `unique`”三板斧。

### 核心代码

```cpp
using ull = unsigned long long;
const ull B = 131;

ull get_hash(const string& s) {
    ull h = 0;
    for (char c : s) h = h * B + c;
    return h;
}

vector<ull> hs;
for (int i = 1; i <= n; i++) hs.push_back(get_hash(str[i]));
sort(hs.begin(), hs.end());
hs.erase(unique(hs.begin(), hs.end()), hs.end());
```

### 复杂度

总哈希时间复杂度 $O(\sum |s_i|)$，排序复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 9. [U461211 字符串 Hash（数据加强）](https://www.luogu.com.cn/problem/U461211)

`字符串哈希` `双哈希`

### 题意

给定若干字符串，要求统计不同字符串的个数，但数据比普通判重更强，更容易卡掉单哈希。

### 分析

普通判重题里，单哈希往往已经够用；但这题的数据加强，本质上是在逼你正视一个事实：哈希不是数学意义上的完全等价，而是“高概率正确”的压缩表示。

因此关键不在排序，而在如何把冲突风险继续压低。最常见的做法就是双哈希：让同一个字符串同时映射到两个独立的值，再把它们拼成二元组比较。这样想要误判，必须两个哈希同时撞上，概率会显著下降。

所以这题最该学到的是工程判断：**当题目明显在卡单哈希时，不要硬赌，直接把比较单位升级成双哈希二元组。**

### 核心代码

```cpp
struct H {
    unsigned long long x, y;
    bool operator<(const H& t) const {
        return x == t.x ? y < t.y : x < t.x;
    }
    bool operator==(const H& t) const { return x == t.x && y == t.y; }
};

H get_hash(const string& s) {
    const unsigned long long B1 = 131, B2 = 13331;
    H h{0, 0};
    for (char c : s) {
        h.x = h.x * B1 + c;
        h.y = h.y * B2 + c;
    }
    return h;
}
```

### 复杂度

总哈希时间复杂度 $O(\sum |s_i|)$，排序复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 10. [U577837 字符串哈希详解](https://www.luogu.com.cn/problem/U577837)

`字符串哈希` `模板`

### 题意

这一题更偏向模板化练习，核心在于理解多项式哈希的定义、冲突与常见实现方式。

### 分析

字符串哈希最常用的形式是：

$H(s)=\sum s_i \times B^{k-i}$。

工程上通常使用两种策略：一是模数哈希，二是 `unsigned long long` 自然溢出。为了写题稳，通常同时保留幂数组、前缀哈希和子串提取函数。

### 核心代码

```cpp
using ull = unsigned long long;
const ull B = 131;
ull h[N], pw[N];

void init(const string& s) {
    pw[0] = 1;
    for (int i = 1; i <= (int)s.size() - 1; i++) {
        h[i] = h[i - 1] * B + s[i];
        pw[i] = pw[i - 1] * B;
    }
}

ull get(int l, int r) {
    return h[r] - h[l - 1] * pw[r - l + 1];
}
```

### 复杂度

预处理时间复杂度 $O(n)$，区间查询 $O(1)$，空间复杂度 $O(n)$。

---

## 11. [P1481 魔族密码](https://www.luogu.com.cn/problem/P1481)

`动态规划` `前缀链`

### 题意

给定一个单词表，要求选出尽可能多的单词组成词链，使得除了最后一个词外，每个词都是后一个词的前缀。

### 分析

要求一个词接在另一个词后面，条件不是“能接任意子串”，而是前一个词必须是后一个词的前缀。这说明转移边非常特殊：一个单词的前驱只可能来自它自己的若干真前缀。

因此先按长度从小到大处理就很自然，因为当前词所有可能的前驱都比它短，必然已经算过。接着枚举它的每个前缀，只要该前缀本身也在单词表里，就能尝试更新链长。

所以这题最值得迁移的是一种 DAG 化视角：**按长度排序后，“前缀关系”天然形成从短串指向长串的有向无环图。**

### 核心代码

```cpp
unordered_map<string, int> dp;
sort(words.begin(), words.end(), [](const string& a, const string& b) {
    return a.size() < b.size();
});

int ans = 0;
for (auto& s : words) {
    dp[s] = 1;
    for (int i = 1; i < (int)s.size(); i++) {
        string pre = s.substr(0, i);
        if (dp.count(pre)) dp[s] = max(dp[s], dp[pre] + 1);
    }
    ans = max(ans, dp[s]);
}
```

### 复杂度

时间复杂度约为 $O(\sum |s_i|^2)$，空间复杂度 $O(n \cdot L)$。

---

## 12. [P7114 [NOIP2020] 字符串匹配](https://www.luogu.com.cn/problem/P7114)

`Z 函数` `前后缀统计`

### 题意

要求统计字符串 `S` 的所有拆分方案，使其满足 `S=(AB)^kC`，并且 `A` 中出现奇数次的字符种数不超过 `C` 中出现奇数次的字符种数。

### 分析

这题的关键分成两半：

1. 用前缀 / 后缀奇偶统计得到 `pre[i]`、`suf[i]`；
2. 用 Z 函数判断某个前缀是否能重复覆盖后面的若干段。

枚举循环节长度时，Z 函数告诉我们最多能重复多少次；再用树状数组或前缀桶统计有多少个 `A` 满足 `pre[A] <= suf[C]`，就能在线性或线性对数复杂度内完成计数。

### 核心代码

```cpp
int pre[N], suf[N], z[N], bit[30];

void add(int x, int v) { for (; x <= 27; x += x & -x) bit[x] += v; }
int ask(int x) { int s = 0; for (; x; x -= x & -x) s += bit[x]; return s; }

void build_cnt(const string& s, int n) {
    for (int i = 1, msk = 0; i <= n; i++) {
        msk ^= 1 << (s[i] - 'a');
        pre[i] = __builtin_popcount(msk);
    }
    for (int i = n, msk = 0; i >= 1; i--) {
        msk ^= 1 << (s[i] - 'a');
        suf[i] = __builtin_popcount(msk);
    }
}

// 先用 Z 函数求每个前缀的最大可重复次数，再用树状数组统计 pre <= suf 的切分数
```

### 复杂度

时间复杂度 $O(n \log \Sigma)$ 或 $O(n \log n)$，空间复杂度 $O(n)$。

---

# 三、Trie 基础与异或字典树

这一组从最基本的前缀树出发，先做前缀统计和查名，再过渡到按位 Trie 处理异或最值。

## 13. [P8306 【模板】字典树 / Trie](https://www.luogu.com.cn/problem/P8306)

`Trie` `前缀统计`

### 题意

给定若干模式串和若干询问串，询问有多少个模式串以当前询问串为前缀。

### 分析

题目问的是“有多少模式串以询问串为前缀”，注意不是“有多少模式串等于它”。这意味着信息不该只放在单词结尾，而应该放在整条前缀路径上。

Trie 正好天然表示所有前缀。每插入一个模式串，就让它走过的结点计数加一；于是某个结点的 `cnt` 表示有多少模式串经过这里，也就是有多少模式串拥有这段前缀。

这样查询串沿 Trie 走到末尾后，读取当前结点计数就是答案。所以这道模板题最该掌握的是：**前缀类问题，通常把统计量挂在路径节点上，而不只挂在结尾。**

### 核心代码

```cpp
int ch[N][62], cnt[N], idx;

void insert(const string& s) {
    int u = 0;
    for (char c : s) {
        int t = id(c);
        if (!ch[u][t]) ch[u][t] = ++idx;
        u = ch[u][t];
        cnt[u]++;
    }
}

int query(const string& s) {
    int u = 0;
    for (char c : s) {
        int t = id(c);
        if (!ch[u][t]) return 0;
        u = ch[u][t];
    }
    return cnt[u];
}
```

### 复杂度

单次插入或查询时间复杂度 $O(|s|)$，空间复杂度 $O(\sum |s_i|)$。

---

## 14. [P2580 于是他错误的点名开始了](https://www.luogu.com.cn/problem/P2580)

`Trie` `字符串判定`

### 题意

先给出一批合法名字，再给若干次点名，要求判断当前名字是否不存在、第一次出现，还是已经点过。

### 分析

这题和普通字典树模板的差别不在匹配过程，而在答案不是简单的“存在 / 不存在”二选一，而是三种状态：没出现过、第一次点到、已经点过。

因此查询时必须把“字符串在不在字典里”和“这个合法名字有没有被用过”分开记。Trie 负责判断这串字符能不能走到某个单词结尾，结尾结点上的 `vis` 负责记录是否已经点过。

所以这题的关键是把题意拆成两个维度：**先判是不是合法名字，再判是不是第一次出现。**

### 核心代码

```cpp
int ch[N][26], ed[N], vis[N], idx;

void insert(const string& s) {
    int u = 0;
    for (char c : s) {
        int t = c - 'a';
        if (!ch[u][t]) ch[u][t] = ++idx;
        u = ch[u][t];
    }
    ed[u] = 1;
}

int query(const string& s) {
    int u = 0;
    for (char c : s) {
        int t = c - 'a';
        if (!ch[u][t]) return 0;
        u = ch[u][t];
    }
    if (!ed[u]) return 0;
    if (vis[u]) return 2;
    vis[u] = 1;
    return 1;
}
```

### 复杂度

单次插入或查询时间复杂度 $O(|s|)$，空间复杂度 $O(\sum |s_i|)$。

---

## 15. [P10471 最大异或对 The XOR Largest Pair](https://www.luogu.com.cn/problem/P10471)

`Trie` `异或最值`

### 题意

给定若干整数，从中选两个数异或，求最大异或值。

### 分析

异或最大化的本质，是希望结果从高位到低位尽量早地出现 `1`。因此与其在数值层面直接配对，不如把所有数按二进制位放进 01-Trie，让“高位怎么选”变成树上的分叉选择。

查询某个数 `x` 时，当前位若能走到和 `x` 相反的分支，就会让这一位异或成 `1`，显然比走相同分支更优；而且高位优先，所以这种贪心是成立的——只要某一更高位已经赢了，后面的低位再怎么变化也翻不了盘。

所以这题最值得记住的是 01-Trie 的判断依据：**异或最值题，本质是在按位从高到低做字典序贪心。**

### 核心代码

```cpp
int ch[N * 31][2], idx;

void insert(int x) {
    int u = 0;
    for (int k = 30; k >= 0; k--) {
        int b = (x >> k) & 1;
        if (!ch[u][b]) ch[u][b] = ++idx;
        u = ch[u][b];
    }
}

int query(int x) {
    int u = 0, res = 0;
    for (int k = 30; k >= 0; k--) {
        int b = (x >> k) & 1;
        if (ch[u][b ^ 1]) u = ch[u][b ^ 1], res |= 1 << k;
        else u = ch[u][b];
    }
    return res;
}
```

### 复杂度

单次插入或查询时间复杂度 $O(\log V)$，总复杂度 $O(n \log V)$，空间复杂度 $O(n \log V)$。

---

## 16. [P4551 最长异或路径](https://www.luogu.com.cn/problem/P4551)

`Trie` `树上异或`

### 题意

给定一棵带权树，要求树上任意两点路径边权异或和的最大值。

### 分析

树上异或路径有一个经典转化：设 `xr[u]` 表示根到 `u` 的路径异或和，那么 `u` 到 `v` 的路径异或和就是 `xr[u] ^ xr[v]`。

于是原题就转化成“在一堆数 `xr[u]` 中找最大异或对”，和上一题完全同构。先 DFS 出所有前缀异或，再扔进 01-Trie 即可。

### 核心代码

```cpp
vector<pair<int, int>> g[N];
int xr[N];

void dfs(int u, int fa) {
    for (auto [v, w] : g[u]) {
        if (v == fa) continue;
        xr[v] = xr[u] ^ w;
        dfs(v, u);
    }
}

int ans = 0;
dfs(1, 0);
for (int i = 1; i <= n; i++) insert(xr[i]);
for (int i = 1; i <= n; i++) ans = max(ans, query(xr[i]));
```

### 复杂度

DFS 复杂度 $O(n)$，Trie 部分复杂度 $O(n \log V)$，总空间复杂度 $O(n \log V)$。

---

# 四、Trie 进阶：模糊匹配、树上统计与构造

这一组不再只是“插入 + 查询”，而是让 Trie 和 DFS、可持久化结构、树上合并与构造问题结合。

## 17. [P4407 [JSOI2009] 电子字典](https://www.luogu.com.cn/problem/P4407)

`Trie` `DFS` `编辑距离`

### 题意

给一个词典和若干查询串。如果查询串本身在词典中，输出 `-1`；否则输出与它编辑距离恰好为 `1` 的单词个数。

### 分析

由于字符串长度上界不大，可以直接在 Trie 上做 DFS。状态包括：当前 Trie 结点、当前匹配到查询串的哪个位置、是否已经使用过一次编辑操作。

当还没用过编辑时，可以尝试三类操作：删除当前字符、插入一个字符、替换当前字符；用过一次之后只能继续正常匹配。到单词结尾时，如果恰好已经用过一次编辑，就计数。

### 核心代码

```cpp
int ch[N][26], ed[N], idx;
string s;
int ans;

void dfs(int u, int p, bool used) {
    if (p == (int)s.size()) {
        if (used && ed[u]) ans += ed[u];
        if (!used) {
            for (int c = 0; c < 26; c++) if (ch[u][c]) dfs(ch[u][c], p, true);
        }
        return;
    }
    int t = s[p] - 'a';
    if (ch[u][t]) dfs(ch[u][t], p + 1, used);
    if (used) return;
    dfs(u, p + 1, true);
    for (int c = 0; c < 26; c++) if (ch[u][c]) {
        dfs(ch[u][c], p, true);
        if (c != t) dfs(ch[u][c], p + 1, true);
    }
}
```

### 复杂度

时间复杂度与查询串长度和 Trie 分支数有关，数据范围下可接受；空间复杂度为 Trie 大小。

---

## 18. [P6088 [JSOI2015] 字符串树](https://www.luogu.com.cn/problem/P6088)

`Trie` `可持久化` `树上路径`

### 题意

树的每条边都有一个字符串。每次给定字符串 `S` 和两个点 `U,V`，问 `U` 到 `V` 的路径上，有多少条边对应的字符串以 `S` 为前缀。

### 分析

这是“树上路径查询 + 字符串前缀计数”的组合题。常见做法是把每个点维护成“根到该点路径上的所有边串”构成的一棵可持久化 Trie。

这样路径答案就能像树上前缀和一样拆成：

`query(rt[u], S) + query(rt[v], S) - 2 * query(rt[lca], S)`。

核心难点在于：每插入一条边串时，要让 Trie 上经过的结点计数加一；而查询一个前缀时，只需沿 Trie 走完这个前缀并读取最终结点计数。

### 核心代码

```cpp
struct Node { int ch[26], sum; } tr[M];
int rt[N], tot;

int insert(int pre, const string& s, int p = 0) {
    int cur = ++tot;
    tr[cur] = tr[pre];
    tr[cur].sum++;
    if (p == (int)s.size()) return cur;
    int c = s[p] - 'a';
    tr[cur].ch[c] = insert(tr[pre].ch[c], s, p + 1);
    return cur;
}

int query(int u, const string& s, int p = 0) {
    if (!u) return 0;
    if (p == (int)s.size()) return tr[u].sum;
    return query(tr[u].ch[s[p] - 'a'], s, p + 1);
}

// ans = query(rt[u], s) + query(rt[v], s) - 2 * query(rt[lca], s)
```

### 复杂度

单次插入或查询的时间复杂度为 $O(|S|)$，总复杂度还需加上树上 LCA 预处理。

---

## 19. [P6623 [省选联考 2020 A 卷] 树](https://www.luogu.com.cn/problem/P6623)

`Trie` `树上启发式合并` `位运算`

### 题意

对每个结点 `x`，考虑其子树内所有点 `u` 的值 `v[u] + dist(u,x)`，把这些值全部异或起来得到 `val(x)`，要求求出所有 `val(x)` 之和。

### 分析

核心转化是：从一个儿子子树往父亲合并时，所有数都会整体 `+1`。而“一个集合里的数整体加一”在 01-Trie 上可以通过按位处理进位、交换子树来维护。

因此常见做法是：对子树维护一棵 01-Trie，支持三种操作：

1. 合并两棵 Trie；
2. 整棵 Trie 所有数 `+1`；
3. 计算当前集合异或和。

为了控制复杂度，再配合树上启发式合并，让小 Trie 并到大 Trie 里。

### 核心代码

```cpp
struct T { int ch[2]; long long xr; } tr[M];

int merge(int a, int b) {
    if (!a || !b) return a | b;
    tr[a].ch[0] = merge(tr[a].ch[0], tr[b].ch[0]);
    tr[a].ch[1] = merge(tr[a].ch[1], tr[b].ch[1]);
    tr[a].xr ^= tr[b].xr;
    return a;
}

void add1(int u, int dep) {
    swap(tr[u].ch[0], tr[u].ch[1]);
    if (tr[u].ch[0]) add1(tr[u].ch[0], dep - 1);
    if (tr[u].xr & 1) tr[u].xr ^= 1LL << dep;
}

void dfs(int u) {
    for (int v : son[u]) {
        dfs(v);
        add1(rt[v], LIM);
        rt[u] = merge(rt[u], rt[v]);
    }
    ans += tr[rt[u]].xr;
}
```

### 复杂度

时间复杂度通常为 $O(n \log V)$，空间复杂度 $O(n \log V)$。

---

## 20. [AT_agc057_c [AGC057C] Increment or Xor](https://www.luogu.com.cn/problem/AT_agc057_c)

`Trie` `二进制分治` `构造`

### 题意

给定一个长为 `2^N` 的排列 `A`，允许两种全局操作：所有数同时 `+1 mod 2^N`，或者同时异或某个 `x`。要求判断能否把整个排列变成 `A[i]=i`，若能则构造操作序列。

### 分析

这题的本质是按二进制位递归整理排列。异或会直接翻转某些位，而整体 `+1` 则体现为低位进位向高位传播，因此非常适合做二叉分治 / Trie 递归。

常见判定思路是：检查每层分组的模结构是否一致；若无解直接退出。构造时从高位到低位递归处理，每一层决定是否需要先异或修正，再通过若干次整体加一把当前层归位。

### 核心代码

```cpp
vector<pair<char, int>> ops;

bool solve(vector<int>& a, int bit) {
    if (bit < 0) return true;
    if (!check_block(a, bit)) return false;
    if (need_xor(a, bit)) {
        int x = 1 << bit;
        apply_xor(a, x);
        ops.push_back({'^', x});
    }
    if (need_inc(a, bit)) {
        apply_inc(a);
        ops.push_back({'+', 1});
    }
    split_blocks(a, bit);
    return solve(left_half(a, bit), bit - 1) && solve(right_half(a, bit), bit - 1);
}
```

### 复杂度

时间复杂度通常为 $O(N2^N)$，空间复杂度 $O(2^N)$。

---

# 五、AC 自动机专题

这一组围绕多模式匹配展开，从模板计数一路推进到 fail 树、图上判环、离线询问和自动机 DP。

## 21. [P3808 AC 自动机（简单版）](https://www.luogu.com.cn/problem/P3808)

`AC 自动机` `多模式匹配`

### 题意

给定若干模式串和一个文本串，求有多少个不同编号的模式串在文本串中出现过。

### 分析

Trie 只能同时维护多模式串，不能高效处理失配跳转；AC 自动机就是在 Trie 上补一套 `fail` 指针，让匹配过程像 KMP 一样失配时快速转移。

文本串扫描到某个状态后，沿着 `fail` 链往上跳，所有终止结点对应的模式串都出现过。为防止重复统计，同一个模式串只计一次。

### 核心代码

```cpp
int ch[N][26], fail[N], ed[N], idx;

void build() {
    queue<int> q;
    for (int c = 0; c < 26; c++) if (ch[0][c]) q.push(ch[0][c]);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int c = 0; c < 26; c++) {
            int v = ch[u][c];
            if (v) fail[v] = ch[fail[u]][c], q.push(v);
            else ch[u][c] = ch[fail[u]][c];
        }
    }
}

int query(const string& s) {
    int u = 0, ans = 0;
    for (char c : s) {
        u = ch[u][c - 'a'];
        for (int p = u; p && ed[p] != -1; p = fail[p]) ans += ed[p], ed[p] = -1;
    }
    return ans;
}
```

### 复杂度

构建复杂度 $O(\sum |t_i|)$，匹配复杂度均摊 $O(|S|)$。

---

## 22. [P3796 AC 自动机（简单版 II）](https://www.luogu.com.cn/problem/P3796)

`AC 自动机` `出现次数`

### 题意

给定若干模式串和一个文本串，要求找出在文本串中出现次数最多的模式串。

### 分析

简单版只要判“有没有出现过”，沿 `fail` 链现跳现记就够了；这题要的是出现次数，若每次都暴力沿 `fail` 链往上加，最坏会反复走很多遍。

更高效的思路是把问题拆开：文本扫描时，只记录“每个自动机状态被访问了多少次”；而一个模式串之所以出现，等价于文本某次走到了它结尾状态，或者走到了它某个 fail 子孙状态。于是最后只要沿 fail 树自底向上汇总，祖先就能收到所有后代贡献。

所以这题最重要的升级点是：**次数统计别在匹配时边跳边加，而是先记访问频次，再在 fail 树上统一回流。**

### 核心代码

```cpp
int cnt[N], pos[M], ord[N], tot;

void query(const string& s) {
    int u = 0;
    for (char c : s) {
        u = ch[u][c - 'a'];
        cnt[u]++;
    }
}

void topo() {
    for (int i = tot; i; i--) cnt[fail[ord[i]]] += cnt[ord[i]];
}

// pos[i] 是第 i 个模式串结尾结点，答案就是 cnt[pos[i]]
```

### 复杂度

构建、匹配、统计总复杂度 $O(\sum |t_i| + |S| + \text{状态数})$。

---

## 23. [P5357 【模板】AC 自动机](https://www.luogu.com.cn/problem/P5357)

`AC 自动机` `模板题`

### 题意

给一个文本串和若干模式串，要求分别输出每个模式串在文本串中出现了多少次。

### 分析

这题和上一题的核心算法完全相同：文本只扫一遍，访问次数先记在自动机状态上，再沿 fail 树反向累加。

真正新增的实现点在于“答案要分别对应到每个模式串”。由于多个模式串可能共享部分前缀，甚至结尾状态也可能有重合信息，所以插入每个模式串时一定要记住它最终停在哪个结点。等 fail 树累计完成后，这个结点上的计数就是该模式串的出现次数。

所以这道模板题最该形成的代码意识是：**自动机负责批量统计，`pos[i]` 负责把统计结果映回第 `i` 个模式串。**

### 核心代码

```cpp
int pos[M], cnt[N], deg[N];

void query(const string& s) {
    int u = 0;
    for (char c : s) {
        u = ch[u][c - 'a'];
        cnt[u]++;
    }
}

void push_fail() {
    queue<int> q;
    for (int i = 1; i <= idx; i++) if (!deg[i]) q.push(i);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cnt[fail[u]] += cnt[u];
        if (--deg[fail[u]] == 0) q.push(fail[u]);
    }
}
```

### 复杂度

总时间复杂度 $O(\sum |t_i| + |S|)$，空间复杂度 $O(\text{状态数})$。

---

## 24. [P2414 [NOI2011] 阿狸的打字机](https://www.luogu.com.cn/problem/P2414)

`AC 自动机` `fail 树` `离线`

### 题意

打字机支持输入字符、退格 `B` 和打印 `P`。给若干询问 `(x,y)`，要求求出第 `x` 个打印串在第 `y` 个打印串中出现了多少次。

### 分析

把整个输入过程看成在 Trie 上移动：输入字符就是走儿子，退格就是回父亲，`P` 则把当前结点记为一个“打印串节点”。

随后在这棵 Trie 上建 AC 自动机。一个模式串 `x` 在串 `y` 中的出现次数，等价于：扫描 `y` 这条打字路径时，有多少个状态落在 `x` 对应结点的 fail 子树内。

因此可以把所有询问挂到 `y` 对应结点上，再在原 Trie 上 DFS，并用树状数组维护当前路径在 fail 树里的活跃结点数。

### 核心代码

```cpp
vector<int> g[N], ask[N];
int dfn[N], out[N], pos[M], bit[N], timer;

void dfs_fail(int u) {
    dfn[u] = ++timer;
    for (int v : g[u]) dfs_fail(v);
    out[u] = timer;
}

void add(int x, int v) { for (; x <= timer; x += x & -x) bit[x] += v; }
int sum(int x) { int s = 0; for (; x; x -= x & -x) s += bit[x]; return s; }

void dfs_trie(int u) {
    add(dfn[u], 1);
    for (auto id : ask[u]) ans[id] = sum(out[qx[id]]) - sum(dfn[qx[id]] - 1);
    for (int c = 0; c < 26; c++) if (trie[u][c]) dfs_trie(trie[u][c]);
    add(dfn[u], -1);
}
```

### 复杂度

总时间复杂度 $O((L+Q)\log L)$，其中 `L` 为总输入长度，空间复杂度 $O(L)$。

---

## 25. [P2444 [POI 2000 R1] 病毒](https://www.luogu.com.cn/problem/P2444)

`AC 自动机` `图上判环`

### 题意

给定若干二进制病毒串，问是否存在一个无限长的二进制串，使它不包含任何病毒串作为子串。

### 分析

先建 AC 自动机，并把所有终止结点及其 fail 祖先打上“危险”标记。这样自动机上的“安全状态”就是所有未被标记的结点。

问题就转化成：从根出发，在只经过安全状态的自动机图上，是否存在一个可达环。若存在，就能沿着这个环无限走下去，构造无限长安全串；否则不存在。

### 核心代码

```cpp
bool bad[N], vis[N], ins[N];

bool dfs(int u) {
    vis[u] = ins[u] = true;
    for (int c = 0; c < 2; c++) {
        int v = ch[u][c];
        if (bad[v]) continue;
        if (!vis[v] && dfs(v)) return true;
        if (ins[v]) return true;
    }
    ins[u] = false;
    return false;
}

// 建完 fail 后先把 bad[u] |= bad[fail[u]]，再从根结点判环
```

### 复杂度

构建和判环总时间复杂度 $O(\sum |s_i|)$，空间复杂度 $O(\text{状态数})$。

---

## 26. [P2292 [HNOI2004] L 语言](https://www.luogu.com.cn/problem/P2292)

`AC 自动机` `DP`

### 题意

给定一个字典和若干文章串，要求求出每个文章串在字典下“可被拆成若干单词”的最长前缀长度。

### 分析

本质是字符串分词 DP：`f[i]` 表示前 `i` 个字符能否被合法拆分。难点在于每个位置可能有很多个单词在这里结束，不能暴力枚举。

把字典建成 AC 自动机后，扫描文章串时可以立刻得到“有哪些单词在当前位置结束”。如果某个单词长度为 `len`，并且 `f[i-len]=true`，就能推出 `f[i]=true`。

### 核心代码

```cpp
vector<int> out[N];
bool f[N];

int solve(const string& s) {
    memset(f, 0, sizeof f);
    f[0] = true;
    int u = 0, ans = 0;
    for (int i = 1; i <= (int)s.size() - 1; i++) {
        u = ch[u][s[i] - 'a'];
        for (int p = u; p; p = fail[p]) {
            for (int len : out[p]) if (i >= len && f[i - len]) f[i] = true;
            if (f[i]) break;
        }
        if (f[i]) ans = i;
    }
    return ans;
}
```

### 复杂度

时间复杂度与匹配过程中遍历的 fail 链长度有关，通常可做到线性或接近线性。

---

## 27. [P3966 [TJOI2013] 单词](https://www.luogu.com.cn/problem/P3966)

`AC 自动机` `fail 树统计`

### 题意

给定若干单词，问每个单词在“整篇论文”中一共出现多少次。

### 分析

把所有单词都插入 AC 自动机。接着把每个单词自己当作“文本”再扫一遍：沿着自动机转移时，把经过的状态访问次数加一。

最后沿 fail 树从深到浅汇总次数。因为一个结点的 fail 祖先对应它的所有后缀模式串，所以把访问量往 fail 父亲累加后，每个终止结点的计数就是答案。

### 核心代码

```cpp
int cnt[N], pos[M];

void feed(const string& s) {
    int u = 0;
    for (char c : s) {
        u = ch[u][c - 'a'];
        cnt[u]++;
    }
}

void push_up() {
    for (int i = idx; i; i--) cnt[fail[ord[i]]] += cnt[ord[i]];
}

// 第 i 个单词的答案是 cnt[pos[i]]
```

### 复杂度

总时间复杂度 $O(\sum |s_i|)$，空间复杂度 $O(\text{状态数})$。

---

## 28. [P4052 [JSOI2007] 文本生成器](https://www.luogu.com.cn/problem/P4052)

`AC 自动机` `DP`

### 题意

随机生成长度固定的文本，若其中至少包含一个给定单词则称为“可读”。要求求出可读文本数量。

### 分析

直接数“至少包含一个模式串”的文本很难，因为一个文本可能同时包含多个单词，容斥会非常麻烦。这里最自然的转身是数补集：先数完全不含任何模式串的安全文本，再用总方案数减掉它。

建出 AC 自动机后，每个状态都代表“当前文本后缀和哪些模式前缀匹配”。一旦某状态自己是某个模式串结尾，或者沿 `fail` 能到达结尾，就说明当前文本已经触发禁词，这类状态都该视为危险状态。

于是 DP 的含义就很清楚了：`dp[i][u]` 表示长度为 `i`、且当前停在安全状态 `u` 的方案数。转移时只允许走向仍然安全的状态。所以这题最值得迁移的是：**“至少命中一个禁词”常先转成 AC 自动机上的补集计数。**

### 核心代码

```cpp
const int MOD = 10007;
int dp[N][M];
bool bad[M];

dp[0][0] = 1;
for (int i = 0; i < m; i++) {
    for (int u = 0; u <= idx; u++) if (dp[i][u]) {
        for (int c = 0; c < 26; c++) {
            int v = ch[u][c];
            if (bad[v]) continue;
            dp[i + 1][v] = (dp[i + 1][v] + dp[i][u]) % MOD;
        }
    }
}
```

### 复杂度

时间复杂度 $O(m \times \text{状态数} \times 26)$，空间复杂度 $O(m \times \text{状态数})$。

---

## 29. [P3121 [USACO15FEB] Censoring G](https://www.luogu.com.cn/problem/P3121)

`AC 自动机` `栈`

### 题意

给定一个文本串和若干禁用单词。每次都删除当前串中最早出现的禁用单词，重复直到不能删，输出最终结果。

### 分析

如果每删一次都重新在整串里查找，会非常慢。更好的方法是边扫描边构造答案串，并维护“当前答案前缀在 AC 自动机上的状态”。

每读入一个字符，就把它压到答案栈里，同时记录当前自动机状态。如果当前状态对应某个禁用串结尾，就直接把该串长度的字符全部弹出，并把状态恢复到弹出后的栈顶状态。

### 核心代码

```cpp
string out;
vector<int> st;
int u = 0;

for (char c : s) {
    u = ch[u][c - 'a'];
    out.push_back(c);
    st.push_back(u);
    if (ed[u]) {
        int len = ed[u];
        while (len--) out.pop_back(), st.pop_back();
        u = st.empty() ? 0 : st.back();
    }
}
```

### 复杂度

每个字符最多进栈出栈一次，时间复杂度 $O(|S|)$，空间复杂度 $O(|S|)$。

---

# 六、后缀结构专题

最后两题分别对应后缀数组和后缀自动机，是字符串后缀结构里最常用的两把武器。

## 30. [P3809 【模板】后缀排序](https://www.luogu.com.cn/problem/P3809)

`后缀数组` `倍增`

### 题意

给定一个字符串，要求把所有非空后缀按字典序排序，并输出它们在原串中的起始位置。

### 分析

后缀排序最朴素当然是把所有后缀拿出来直接排，但那样比较两个后缀时会一遍遍重复扫描公共前缀。倍增算法的核心，就是把“长串比较”拆成“短串排名的复用”。

具体来说，若已经知道每个长度 `2^k` 前缀的排名，那么长度 `2^{k+1}` 的后缀前缀就只需比较一个二元组：前半段排名 `rk[i]` 和后半段排名 `rk[i+2^k]`。这样长关键字比较就被降成了两个整数比较。

因此每轮只要把后缀按这个二元组稳定排序，再重新赋新排名，就完成了一次长度翻倍。也就是说，这道模板题最该记住的是：**倍增不是“每次排序更长的串”，而是不断把长串比较还原成旧排名的二元组比较。**

### 核心代码

```cpp
int sa[N], rk[N], oldrk[N], cnt[N], id[N];

void build_sa(string s, int n, int m = 128) {
    for (int i = 1; i <= n; i++) cnt[rk[i] = s[i]]++;
    for (int i = 1; i <= m; i++) cnt[i] += cnt[i - 1];
    for (int i = n; i; i--) sa[cnt[rk[i]]--] = i;
    for (int w = 1, p;; w <<= 1, m = p) {
        p = 0;
        for (int i = n - w + 1; i <= n; i++) id[++p] = i;
        for (int i = 1; i <= n; i++) if (sa[i] > w) id[++p] = sa[i] - w;
        fill(cnt, cnt + m + 1, 0);
        for (int i = 1; i <= n; i++) cnt[rk[id[i]]]++;
        for (int i = 1; i <= m; i++) cnt[i] += cnt[i - 1];
        for (int i = n; i; i--) sa[cnt[rk[id[i]]]--] = id[i];
        memcpy(oldrk, rk, sizeof(int) * (n + 1));
        rk[sa[1]] = p = 1;
        for (int i = 2; i <= n; i++)
            rk[sa[i]] = (oldrk[sa[i]] == oldrk[sa[i - 1]] && oldrk[sa[i] + w] == oldrk[sa[i - 1] + w]) ? p : ++p;
        if (p == n) break;
    }
}
```

### 复杂度

时间复杂度 $O(n \log n)$，空间复杂度 $O(n)$。

---

## 31. [P3804 【模板】后缀自动机（SAM）](https://www.luogu.com.cn/problem/P3804)

`后缀自动机` `出现次数统计`

### 题意

给定一个字符串，要求在所有出现次数不为 `1` 的子串中，求“出现次数 × 子串长度”的最大值。

### 分析

后缀自动机中的每个状态代表一类 endpos 等价的子串，其中：

- `len[u]` 是这类子串的最长长度；
- `siz[u]` 可以统计这类子串在原串中的出现次数。

构造 SAM 后，按 `len` 从大到小把出现次数往 `link` 父亲汇总。之后枚举所有状态，只要 `siz[u] > 1`，就可以用 `siz[u] * len[u]` 更新答案。

### 核心代码

```cpp
int ch[N][26], link[N], len[N], siz[N], last = 1, tot = 1;

void extend(int c) {
    int cur = ++tot, p = last;
    len[cur] = len[last] + 1;
    siz[cur] = 1;
    while (p && !ch[p][c]) ch[p][c] = cur, p = link[p];
    if (!p) link[cur] = 1;
    else {
        int q = ch[p][c];
        if (len[q] == len[p] + 1) link[cur] = q;
        else {
            int clone = ++tot;
            memcpy(ch[clone], ch[q], sizeof ch[q]);
            link[clone] = link[q];
            len[clone] = len[p] + 1;
            while (p && ch[p][c] == q) ch[p][c] = clone, p = link[p];
            link[q] = link[cur] = clone;
        }
    }
    last = cur;
}

// 按 len 降序统计 siz 后：
// if (siz[u] > 1) ans = max(ans, 1LL * siz[u] * len[u]);
```

### 复杂度

构造与统计总时间复杂度 $O(n)$，空间复杂度 $O(n)$。
