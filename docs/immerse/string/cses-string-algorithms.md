---
title: "CSES 字符串算法专题精选解题报告"
subtitle: "🔤 从前后缀、回文到后缀结构与自动机的字符串主线"
order: 2
icon: "🔤"
---

# CSES 字符串算法专题精选解题报告

这一组题把字符串算法里最常见的几条主线几乎都压在同一份题单里：有时要顺着前后缀关系做线性扫描，有时要把整批模式串折进自动机，有时则必须把“所有子串”交给后缀结构统一管理。阅读时最好一直盯住一个问题：当前题目真正需要维护的，到底是匹配状态、回文边界，还是子串的全局顺序。

# 一、前后缀、边界与基础匹配

这一章先把最经典的线性字符串工具串起来：KMP 的前缀函数、Z 函数、border、period 与最小表示法。它们看似分散，实际上都在处理同一件事——前缀和当前位置之间到底能对齐多长。

## 1. [String Matching](https://cses.fi/problemset/task/1753)

`KMP` `出现次数`

### 题意

给定文本串和模式串，要求统计模式串在文本串中出现了多少次，重叠出现也要计入。

### 分析

这题最直接的难点就是“重叠也算”，因此不能在匹配成功后整段跳过。KMP 的做法是先对模式串求前缀函数 `pi`，让指针 `j` 始终表示当前已经匹配了模式串前缀的长度。

扫描文本时，一旦当前字符失配，就顺着 `pi[j-1]` 回退到次长 border；一旦 `j==m`，说明找到了一个完整出现，答案加一，然后把 `j` 退到 `pi[m-1]`，这样下一个位置还能立刻接着处理可能的重叠匹配。整道题的关键不在“比较字符”，而在失配后不回头重扫文本。

### 核心代码

```cpp
vector<int> pi(m);
for (int i = 1, j = 0; i < m; ++i) {
    while (j && p[i] != p[j]) j = pi[j - 1];
    if (p[i] == p[j]) ++j;
    pi[i] = j;
}
long long ans = 0;
for (int i = 0, j = 0; i < n; ++i) {
    while (j && s[i] != p[j]) j = pi[j - 1];
    if (s[i] == p[j]) ++j;
    if (j == m) {
        ++ans;
        j = pi[j - 1];
    }
}
cout << ans;
```

### 复杂度

时间复杂度 $O(n+m)$，空间复杂度 $O(m)$。

---

## 2. [Finding Borders](https://cses.fi/problemset/task/1732)

`前缀函数` `border`

### 题意

给定一个字符串，输出它所有 border 的长度。这里 border 指既是前缀又是后缀，但不能等于整个串。

### 分析

这题并不需要把每个前缀都拿去和后缀比较。对整个串求出前缀函数以后，`pi[n-1]` 就是整串的最长 border 长度；而这个最长 border 自己也可能还有 border，于是继续跳到 `pi[pi[n-1]-1]`，就能一路把所有 border 串出来。

也就是说，前缀函数天然给出了一条“border 链”。题目要的不是某个最长值，而是整条链上的所有长度，按从短到长输出即可，所以把这条链收集后反转最方便。

### 核心代码

```cpp
vector<int> pi(n);
for (int i = 1, j = 0; i < n; ++i) {
    while (j && s[i] != s[j]) j = pi[j - 1];
    if (s[i] == s[j]) ++j;
    pi[i] = j;
}
vector<int> ans;
for (int x = pi[n - 1]; x > 0; x = pi[x - 1]) ans.push_back(x);
reverse(ans.begin(), ans.end());
for (int x : ans) cout << x << ' ';
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 3. [Finding Periods](https://cses.fi/problemset/task/1733)

`Z 函数` `周期`

### 题意

给定一个字符串，输出它所有 period 的长度。这里允许最后一次重复只用到前缀的一部分。

### 分析

“最后一次重复可以不完整”这个条件非常关键。若长度 $p$ 是一个合法周期，那么从位置 $p$ 开始的后缀，必须和原串前缀匹配到结尾，也就是剩下的 $n-p$ 个字符都满足 `s[i]=s[i-p]`。

这正好可以用 Z 函数直接判定：若 `z[p] >= n-p`，说明从位置 $p$ 出发的后缀与前缀重合到了串尾，那么长度 $p$ 就是一个 period。于是只要把所有满足条件的 $p$ 找出来，并补上总长度 $n$ 本身即可。

### 核心代码

```cpp
vector<int> z(n);
for (int i = 1, l = 0, r = 0; i < n; ++i) {
    if (i <= r) z[i] = min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) ++z[i];
    if (i + z[i] - 1 > r) l = i, r = i + z[i] - 1;
}
for (int p = 1; p < n; ++p) {
    if (z[p] >= n - p) cout << p << ' ';
}
cout << n;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 4. [String Functions](https://cses.fi/problemset/task/2107)

`Z 函数` `前缀函数`

### 题意

给定一个字符串，要求同时输出它的 Z 函数和前缀函数数组。

### 分析

这题本身没有额外建模，重点就是把两套最常用的线性预处理分清楚。Z 函数 `z[i]` 看的是“从位置 $i$ 开始能和前缀对齐多长”；前缀函数 `pi[i]` 看的是“前缀 $s[0..i]$ 的最长真 border 是多长”。

它们都在描述前后缀关系，但锚点不同：一个锚在起点，一个锚在前缀结尾。很多字符串题会在这两者之间来回切换，这道题相当于把两把基础工具单独拎出来做一次纯实现体检。

### 核心代码

```cpp
vector<int> z(n), pi(n);
for (int i = 1, l = 0, r = 0; i < n; ++i) {
    if (i <= r) z[i] = min(r - i + 1, z[i - l]);
    while (i + z[i] < n && s[z[i]] == s[i + z[i]]) ++z[i];
    if (i + z[i] - 1 > r) l = i, r = i + z[i] - 1;
}
for (int i = 1, j = 0; i < n; ++i) {
    while (j && s[i] != s[j]) j = pi[j - 1];
    if (s[i] == s[j]) ++j;
    pi[i] = j;
}
print(z);
print(pi);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 5. [Minimal Rotation](https://cses.fi/problemset/task/1110)

`最小表示法` `字典序`

### 题意

给定一个字符串，要求求出它所有循环位移中字典序最小的那个。

### 分析

把字符串复制一份得到 `s+s` 之后，每个循环位移都对应其中一个长度为 $n$ 的子串。问题在于不能真的把所有位移取出来排序，那会把比较成本做爆。

Booth 最小表示法维护两个候选起点 $i,j$ 和当前已知相同前缀长度 $k$。若 `t[i+k]` 与 `t[j+k]` 不同，那么字典序更大的那一侧不但当前起点不可能最优，连中间那段起点也都可以一起跳过，因为它们共享这段已经比较过的前缀。正是这个“整段淘汰”让复杂度降到了线性。

### 核心代码

```cpp
string t = s + s;
int i = 0, j = 1, k = 0;
while (i < n && j < n && k < n) {
    if (t[i + k] == t[j + k]) {
        ++k;
    } else {
        if (t[i + k] > t[j + k]) i += k + 1;
        else j += k + 1;
        if (i == j) ++j;
        k = 0;
    }
}
int st = min(i, j);
cout << t.substr(st, n);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

# 二、字典树、自动机与批量模式串

这一章的关键词是“把大量匹配状态压到一张图里”。有的题要把词典装进 Trie，有的题要把单串的所有子串压成后缀自动机，还有的题要把“是否已经出现过模式串”当成 DP 状态的一部分。

## 6. [Word Combinations](https://cses.fi/problemset/task/1731)

`Trie` `DP`

### 题意

给定一个目标串和一个字典，要求统计有多少种方式把目标串拆成若干个字典单词的拼接结果，答案对 $10^9+7$ 取模。

### 分析

直接枚举“当前位置接哪个单词”会被字典总长度卡死，因为单词数很多，但目标串长度只有 $5000$。这说明主循环应该围着目标串走，而不是围着词典走。

最自然的做法是把所有单词插入 Trie，然后做 `dp[i]` 表示从位置 $i$ 开始拼完后缀的方案数。枚举起点 $i$ 时，顺着 Trie 沿着 `s[i],s[i+1],...` 往下走；每经过一个单词结尾，就把对应的 `dp[j+1]` 加到 `dp[i]` 上。这样每次只会沿着目标串上真实存在的匹配路径前进，不会把无关单词一个个试过去。

### 核心代码

```cpp
const int MOD = 1000000007;
vector<int> dp(n + 1);
dp[n] = 1;
for (int i = n - 1; i >= 0; --i) {
    int u = 0;
    for (int j = i; j < n; ++j) {
        int c = s[j] - 'a';
        if (!tr[u][c]) break;
        u = tr[u][c];
        if (end[u]) dp[i] = (dp[i] + dp[j + 1]) % MOD;
    }
}
cout << dp[0];
```

### 复杂度

时间复杂度为沿目标串在 Trie 中实际走过的总边数，最坏 $O(n^2)$；空间复杂度 $O(\text{字典总长度})$。

---

## 7. [Required Substring](https://cses.fi/problemset/task/1112)

`KMP 自动机` `状态 DP`

### 题意

给定长度 $n$ 和模式串 $p$，要求统计长度为 $n$ 的大写字母串中，有多少个串至少包含一次 $p$ 作为子串。

### 分析

这题不能只记“当前构造到了第几位”，因为下一位是否会触发一次完整匹配，取决于当前后缀与模式串前缀重合了多长。于是状态必须带上一个 KMP 匹配长度。

先用前缀函数建出 `nxt[state][c]`，表示当前已经匹配了 `state` 个字符，再接上字母 `c` 后会转到哪里。再把“已经出现过模式串”折成一个吸收态：一旦匹配长度达到 $m$，后续无论再接什么都留在状态 $m$。这样 `dp[i][j]` 就能稳定表示“长度为 $i$，且自动机状态为 $j$ 的方案数”，最终答案就是 `dp[n][m]`。

### 核心代码

```cpp
const int MOD = 1000000007;
for (int st = 0; st <= m; ++st) {
    for (int c = 0; c < 26; ++c) {
        if (st == m) nxt[st][c] = m;
        else nxt[st][c] = go(st, 'A' + c);
    }
}
dp[0][0] = 1;
for (int i = 0; i < n; ++i) {
    for (int st = 0; st <= m; ++st) {
        for (int c = 0; c < 26; ++c) {
            int to = nxt[st][c];
            dp[i + 1][to] = (dp[i + 1][to] + dp[i][st]) % MOD;
        }
    }
}
cout << dp[n][m];
```

### 复杂度

时间复杂度 $O(26nm)$，空间复杂度 $O(nm)$；若滚动数组优化，空间可降为 $O(m)$。

---

## 8. [Finding Patterns](https://cses.fi/problemset/task/2102)

`后缀自动机` `多模式匹配`

### 题意

给定一个文本串和很多模式串，要求对每个模式串判断它是否在文本串中出现过。

### 分析

这里只有一条文本串，却有海量查询模式串，这非常适合先把文本串的所有子串压成一个统一结构。后缀自动机的每一条路径都对应文本串的一个子串，因此只要把文本串建成 SAM，判断某个模式串是否出现，就只剩下沿转移边走一遍。

这题的关键在于识别“多次问子串是否存在”本质上是静态全集查询，而 SAM 恰好把“所有出现过的子串”压成了 $O(n)$ 个状态。若走着走着某个字符没有转移边，答案就是 `NO`；若整串都能走完，答案就是 `YES`。

### 核心代码

```cpp
for (char c : s) extend(c);
for (string p : qs) {
    int u = 0;
    bool ok = true;
    for (char c : p) {
        int v = ch[u][c - 'a'];
        if (!v) {
            ok = false;
            break;
        }
        u = v;
    }
    cout << (ok ? "YES" : "NO") << '\n';
}
```

### 复杂度

建图时间复杂度 $O(n)$，回答全部询问的时间复杂度 $O(\text{模式串总长度})$，空间复杂度 $O(n)$。

---

## 9. [Counting Patterns](https://cses.fi/problemset/task/2103)

`后缀自动机` `endpos`

### 题意

给定一个文本串和很多模式串，要求对每个模式串输出它在文本串中出现了多少次。

### 分析

和上一题相比，这里不是只问“有没有”，而是问“有几次”。在后缀自动机里，这正对应每个状态的 `endpos` 集合大小：某条路径代表的所有子串，在它落到的那个状态里共享同一组结束位置，因此出现次数也相同。

实现时在每次扩展文本串时给当前末状态记一次贡献 `cnt[cur]=1`，然后按状态长度从大到小拓扑，把计数累加到后缀链接父亲上。这样所有状态的 `cnt` 都会变成对应 `endpos` 集合大小。查询某个模式串时，若能在 SAM 上走完，所在状态的 `cnt` 就是答案。

### 核心代码

```cpp
for (char c : s) extend(c), cnt[last] = 1;
for (int u : order_by_len_desc) cnt[link[u]] += cnt[u];
for (string p : qs) {
    int u = 0;
    for (char c : p) {
        u = ch[u][c - 'a'];
        if (!u) break;
    }
    cout << (u ? cnt[u] : 0) << '\n';
}
```

### 复杂度

建图与统计时间复杂度 $O(n)$，回答全部询问的时间复杂度 $O(\text{模式串总长度})$，空间复杂度 $O(n)$。

---

## 10. [Pattern Positions](https://cses.fi/problemset/task/2104)

`后缀自动机` `最早出现`

### 题意

给定一个文本串和很多模式串，要求对每个模式串输出它第一次出现的位置；若不存在则输出 $-1$。

### 分析

这题和上一题的差别只在“状态上要存什么统计量”。模式串若能在 SAM 上走完，仍然会落到某个状态；但现在要的不是 `endpos` 个数，而是这个状态对应所有结束位置中的最小值。

做法是在扩展文本串时把当前末状态的结束位置记成当前位置，然后仍然按长度从大到小把信息沿后缀链接往父亲上传，取最小值。这样每个状态都会得到自己 `endpos` 集合中的最小结束位置。设模式串长度为 $m$，若其落在状态 $u$，那么第一次出现的起点就是 `minEnd[u]-m+1`。

### 核心代码

```cpp
const int INF = 1e9;
fill(minEnd, minEnd + sz, INF);
for (int i = 0; i < n; ++i) {
    extend(s[i]);
    minEnd[last] = min(minEnd[last], i + 1);
}
for (int u : order_by_len_desc) minEnd[link[u]] = min(minEnd[link[u]], minEnd[u]);
for (string p : qs) {
    int u = 0;
    for (char c : p) {
        u = ch[u][c - 'a'];
        if (!u) break;
    }
    if (!u) cout << -1 << '\n';
    else cout << minEnd[u] - (int)p.size() + 1 << '\n';
}
```

### 复杂度

建图与预处理时间复杂度 $O(n)$，回答全部询问的时间复杂度 $O(\text{模式串总长度})$，空间复杂度 $O(n)$。

# 三、回文结构与在线判断

回文题最怕的通常不是“会不会判”，而是“能不能一次性把所有中心都处理掉”或者“修改之后还能不能继续判”。这一章分别对应离线最长回文、在线最长回文后缀，以及带修改的区间回文判断。

## 11. [Longest Palindrome](https://cses.fi/problemset/task/1111)

`Manacher` `最长回文子串`

### 题意

给定一个字符串，要求输出它的最长回文子串；若有多个答案，输出任意一个即可。

### 分析

如果对每个中心都暴力向两边扩，会在长串上退化到平方级。Manacher 的核心是在维护当前最右回文区间时，利用对称点的结果为新中心提供下界，从而避免重复扩展。

这题还有一个细节：既要处理奇回文，也要处理偶回文。最常见的写法是先在字符间插入分隔符，把两种情况统一成“奇数长度回文半径”。最后找到半径最大的中心，再把它映回原串区间即可。

### 核心代码

```cpp
string t = "^";
for (char c : s) t += '#', t += c;
t += "#$";
vector<int> p(t.size());
int best = 0, pos = 0;
for (int i = 1, c = 0, r = 0; i + 1 < (int)t.size(); ++i) {
    if (i < r) p[i] = min(r - i, p[2 * c - i]);
    while (t[i + p[i] + 1] == t[i - p[i] - 1]) ++p[i];
    if (i + p[i] > r) c = i, r = i + p[i];
    if (p[i] > best) best = p[i], pos = i;
}
int L = (pos - best) / 2;
cout << s.substr(L, best);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 12. [All Palindromes](https://cses.fi/problemset/task/3138)

`回文树` `最长回文后缀`

### 题意

给定一个字符串，要求对每个位置输出一个数：以该位置为结尾的最长回文子串长度。

### 分析

题目要的是“每个前缀处理完之后，当前最长的回文后缀有多长”。这正是回文树最擅长维护的量：每加入一个新字符，只需要沿着后缀链接跳到第一个还能继续扩展的回文节点，再决定是否新建节点。

一旦插入完成，当前指针 `last` 指向的就是“以当前位置结尾的最长回文后缀”对应的节点，所以直接记录它的长度即可。和 Manacher 不同，这题不是一次性离线扫所有中心，而是强调前缀逐步增长时的在线维护。

### 核心代码

```cpp
init_tree();
vector<int> ans(n);
for (int i = 0; i < n; ++i) {
    last = extend(i, s[i]);
    ans[i] = tree[last].len;
}
for (int x : ans) cout << x << ' ';
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 13. [Palindrome Queries](https://cses.fi/problemset/task/2420)

`动态哈希` `区间查询`

### 题意

给定一个字符串，支持两种操作：单点修改字符，以及询问某个子串是否为回文串。

### 分析

这里最大的问题是“字符串会改”。Manacher、回文树这种一次建好的结构都不适合频繁单点更新，更稳妥的做法是转成动态字符串哈希：同时维护原串的正向哈希和反串的正向哈希。

若询问区间是 $[l,r]$，那么它在反串中对应的位置正好是 $[n-r+1,n-l+1]$。只要把两边哈希都规范化到同一幂次上，比较两段哈希是否相同即可。单点修改时，同步更新正向树状数组和反向树状数组，两边都还是 $O(\log n)$。

### 核心代码

```cpp
void modify(int pos, char oldc, char newc) {
    Hash delta = val(newc) - val(oldc);
    fw.add(pos, delta * pw[pos]);
    rv.add(n - pos + 1, delta * pw[n - pos + 1]);
}
bool isPal(int l, int r) {
    Hash a = normalize(fw.query(l, r), l);
    Hash b = normalize(rv.query(n - r + 1, n - l + 1), n - r + 1);
    return a == b;
}
```

### 复杂度

单次修改和单次查询的时间复杂度都是 $O(\log n)$，空间复杂度 $O(n)$。

# 四、后缀数组、BWT 与重复子串

只要题目开始围绕“所有子串”做统计、排序或重建，就该把目光转向后缀结构。这一章里，后缀数组负责把所有后缀排好序，LCP 负责消重或找重复，而 BWT 与给定后缀序则是在做结构反推。

## 14. [Distinct Substrings](https://cses.fi/problemset/task/2105)

`后缀数组` `LCP`

### 题意

给定一个字符串，要求统计它有多少个不同的子串。

### 分析

所有子串都可以看成某个后缀的前缀。若把所有后缀按字典序排好，那么第 $i$ 个后缀一共带来 `suffixLen` 个前缀子串，但其中前 `lcp[i]` 个已经和前一个后缀重复出现过了。

所以新的不同子串个数恰好是 `suffixLen-lcp[i]`。把所有后缀的贡献加起来，就是总子串数 $\frac{n(n+1)}2$ 减去所有相邻后缀的 LCP 之和。这题最重要的转化，就是把“对子串去重”变成“看每个后缀新增了多少前缀”。

### 核心代码

```cpp
build_sa(s);
build_lcp(s);
long long ans = 1LL * n * (n + 1) / 2;
for (int i = 1; i < n; ++i) ans -= lcp[i];
cout << ans;
```

### 复杂度

若用倍增法建后缀数组，时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 15. [Repeating Substring](https://cses.fi/problemset/task/2106)

`后缀数组` `最长重复子串`

### 题意

给定一个字符串，要求输出最长的重复子串；若不存在则输出 $-1$。

### 分析

“重复子串”意味着它至少在两个位置出现过。任意两个后缀的最长公共前缀，就是一个同时出现在这两个位置的重复子串；反过来，最长重复子串一定会成为某一对相邻后缀的 LCP 最大值。

因此建好后缀数组之后，直接在 LCP 数组里找最大值即可。因为相同前缀的后缀会被排到一起，最长公共前缀不需要跨很远去找，扫描相邻后缀已经足够。

### 核心代码

```cpp
build_sa(s);
build_lcp(s);
int best = 0, at = -1;
for (int i = 1; i < n; ++i) {
    if (lcp[i] > best) best = lcp[i], at = sa[i];
}
if (best == 0) cout << -1;
else cout << s.substr(at, best);
```

### 复杂度

若用倍增法建后缀数组，时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 16. [Substring Distribution](https://cses.fi/problemset/task/2110)

`后缀数组` `差分统计`

### 题意

给定一个字符串，要求对每个长度 $1..n$ 输出不同子串的个数。

### 分析

和统计总数相比，这题多了一维“长度”。仍然按后缀数组的视角来看：第 $i$ 个后缀长度为 `len`，它会新增所有长度落在 `(lcp[i], len]` 之间的前缀子串，每个长度恰好新增一个。

这就把问题变成了大量区间加一：对每个后缀，把区间 `[lcp[i]+1, len]` 的计数都加一。最后对长度轴做一次前缀和，就能得到每种长度的不同子串数量。真正要抓住的不是“怎么枚举子串”，而是“每个后缀新增的是一段连续长度区间”。

### 核心代码

```cpp
build_sa(s);
build_lcp(s);
vector<long long> diff(n + 2);
for (int i = 0; i < n; ++i) {
    int len = n - sa[i];
    int L = lcp[i] + 1, R = len;
    if (L <= R) ++diff[L], --diff[R + 1];
}
for (int len = 1; len <= n; ++len) {
    diff[len] += diff[len - 1];
    cout << diff[len] << ' ';
}
```

### 复杂度

若用倍增法建后缀数组，时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 17. [String Transform](https://cses.fi/problemset/task/1113)

`BWT` `LF-mapping`

### 题意

给定一个经过题面定义变换后的字符串，要求还原原始字符串。

### 分析

题面描述的其实就是 Burrows–Wheeler Transform。已知的是排序后所有循环位移的最后一列，要恢复原串，关键不是把整张旋转矩阵真的造出来，而是利用首列和末列之间的对应关系。

若某个字符在最后一列里是它第 $k$ 次出现，那么在排好序的第一列里，它会对应到该字符的第 $k$ 次出现位置，这就是 LF-mapping。以 `#` 所在那一行为起点，反复应用 LF 映射，就能逆着把原串字符一个个找回来；由于恢复顺序是从后往前，所以最后记得反转。

### 核心代码

```cpp
vector<int> occ(m), cnt(27), first(27), lf(m);
for (int i = 0; i < m; ++i) occ[i] = ++cnt[id(t[i])];
for (int c = 1; c < 27; ++c) first[c] = first[c - 1] + cnt[c - 1];
for (int i = 0; i < m; ++i) lf[i] = first[id(t[i])] + occ[i] - 1;
int row = t.find('#');
string ans;
for (int step = 0; step < m - 1; ++step) {
    row = lf[row];
    ans.push_back(t[row]);
}
reverse(ans.begin(), ans.end());
cout << ans;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 18. [Inverse Suffix Array](https://cses.fi/problemset/task/3225)

`后缀数组` `构造`

### 题意

给定一个长度为 $n$ 的后缀数组，要求构造任意一个只含小写字母的字符串，使它的后缀数组恰好等于给定排列；若不存在则输出 $-1$。

### 分析

设 `sa[1..n]` 是给定后缀数组，`rk[i]` 是后缀 $i$ 的名次。沿着后缀数组从前往后看相邻两个后缀 $a=sa[i-1], b=sa[i]`：

- 如果想让它们首字符相同，那么它们的比较结果就必须交给后缀 `a+1` 和 `b+1` 决定，所以需要 `rk[a+1] < rk[b+1]`；
- 如果这个条件不成立，就说明再用同一个字符会把顺序弄反，必须让 `s[a] < s[b]`，也就是开一个新的字符块。

于是可以顺着 `sa` 扫一遍，只要发现 `rk[sa[i-1]+1] > rk[sa[i]+1]`，就把字符等级加一。最后把同一块赋同一字符。若字符块超过 $26$ 个，就不可能只用 `a..z` 构造成功。

### 核心代码

```cpp
vector<int> rk(n + 2);
for (int i = 1; i <= n; ++i) rk[sa[i]] = i;
string ans(n + 1, 'a');
int cls = 0;
ans[sa[1]] = 'a';
for (int i = 2; i <= n; ++i) {
    if (rk[sa[i - 1] + 1] > rk[sa[i] + 1]) ++cls;
    if (cls >= 26) {
        cout << -1;
        return;
    }
    ans[sa[i]] = char('a' + cls);
}
cout << ans.substr(1);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

# 五、字典序枚举与序列计数

最后这一章关注的不是“某个子串存不存在”，而是“把所有候选对象按某种顺序摊开之后，如何数、如何选”。这时后缀自动机里的路径数和重复次数会变成计数器，而普通序列 DP 则负责处理去重后的子序列集合。

## 19. [Substring Order I](https://cses.fi/problemset/task/2108)

`后缀自动机` `第 k 小`

### 题意

给定一个字符串，若把所有不同子串按字典序排序，要求输出第 $k$ 小的那个。

### 分析

“不同子串”最适合放到后缀自动机里看：从初始状态出发的每一条非空路径，恰好对应一个不同子串。于是题目就转成了“按字典序在 SAM 上走第 $k$ 条路径”。

做法是先计算 `dp[u]`：从状态 $u$ 出发，一共能形成多少个不同的非空后缀路径。若存在一条字符 `c` 的转移到 `v`，那么这条边贡献的块大小就是 `1 + dp[v]`：其中 `1` 对应当前这个更短的子串，`dp[v]` 对应它的所有延伸。再按字符从小到大贪心减去整块，就能定位到第 $k$ 个答案落在哪条边上。

### 核心代码

```cpp
long long dfs(int u) {
    if (vis[u]) return dp[u];
    vis[u] = true;
    for (int c = 0; c < 26; ++c) {
        int v = ch[u][c];
        if (v) dp[u] += 1 + dfs(v);
    }
    return dp[u];
}
string ans;
for (int u = 0; k > 0; ) {
    for (int c = 0; c < 26; ++c) {
        int v = ch[u][c];
        if (!v) continue;
        long long block = 1 + dfs(v);
        if (k > block) k -= block;
        else {
            ans.push_back('a' + c);
            --k;
            if (k == 0) {
                cout << ans;
                return;
            }
            u = v;
            break;
        }
    }
}
```

### 复杂度

建图与 DP 时间复杂度 $O(n\sigma)$，这里字母表大小 $\sigma=26$；空间复杂度 $O(n)$。

---

## 20. [Substring Order II](https://cses.fi/problemset/task/2109)

`后缀自动机` `重复计数`

### 题意

给定一个字符串，若把所有子串按字典序排序，相同子串要按出现次数重复出现，要求输出第 $k$ 小的那个。

### 分析

和上一题相比，真正变化的只有“同一个子串要重复出现几次”。在后缀自动机里，某条路径对应的子串出现次数，正是其终点状态的 `endpos` 大小，也就是常见的 `occ[state]`。

于是从状态 $u$ 走一条字符 `c` 到 `v` 时，这一整块的大小不再是 `1 + dp[v]`，而是 `occ[v] + dp[v]`：先是当前这个子串自身重复 `occ[v]` 次，然后才轮到它的所有更长扩展。仍然按字符从小到大减块即可，只不过一旦落进某个块里，要先判断是不是已经落在当前子串的那 `occ[v]` 份拷贝里。

### 核心代码

```cpp
long long dfs(int u) {
    if (vis[u]) return dp[u];
    vis[u] = true;
    for (int c = 0; c < 26; ++c) {
        int v = ch[u][c];
        if (v) dp[u] += occ[v] + dfs(v);
    }
    return dp[u];
}
string ans;
for (int u = 0; ; ) {
    for (int c = 0; c < 26; ++c) {
        int v = ch[u][c];
        if (!v) continue;
        long long block = occ[v] + dfs(v);
        if (k > block) {
            k -= block;
            continue;
        }
        ans.push_back('a' + c);
        if (k <= occ[v]) {
            cout << ans;
            return;
        }
        k -= occ[v];
        u = v;
        break;
    }
}
```

### 复杂度

建图、出现次数统计与 DP 的时间复杂度都是 $O(n\sigma)$，空间复杂度 $O(n)$。

---

## 21. [Distinct Subsequences](https://cses.fi/problemset/task/1149)

`DP` `去重计数`

### 题意

给定一个字符串，允许删除任意字符但保持相对顺序，要求统计能得到多少个不同的子序列，答案对 $10^9+7$ 取模。

### 分析

若不考虑去重，处理一个新字符时，所有已有子序列都可以选择“接上它”或“不接它”，数量会翻倍。真正麻烦的是重复字符：比如当前又来了一个 `a`，那么“把它接在所有旧子序列后面”这批新串里，会有一部分在上一次出现 `a` 时已经生成过。

设 `all` 表示当前前缀的不同子序列数（含空串），`last[c]` 记录“上一次处理字符 `c` 之前的 `all`”。那么新一轮本应得到 `2*all`，但其中恰好有 `last[c]` 个会和上次由 `c` 扩展出来的结果重合，所以转移就是 `all = 2*all - last[c]`。最后减掉空串即可。

### 核心代码

```cpp
const int MOD = 1000000007;
long long all = 1;
vector<long long> last(26, 0);
for (char c : s) {
    long long old = all;
    all = (2 * all - last[c - 'a'] + MOD) % MOD;
    last[c - 'a'] = old;
}
cout << (all - 1 + MOD) % MOD;
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(\sigma)$，这里 $\sigma=26$。
