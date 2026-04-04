---
title: "CSES 入门与基础专题精选解题报告"
subtitle: "🧱 从模拟、公式观察到回溯剪枝的基础主线"
order: 4
icon: "🧱"
---

# CSES 入门与基础专题精选解题报告

这一组题从最直接的模拟和扫描起步，先练怎样把题目的动作一行行翻成程序，再慢慢走到构造、公式观察与回溯剪枝。前半段重在把条件看清，后半段重在把限制压成状态与不变量，读的时候不妨顺着“先会做、再做稳、最后做巧”的节奏往下推进。

# 一、模拟、扫描与基础数论

这一章先把最朴素的处理方式练扎实：有的题只要照着规则跑，有的题只要一趟扫描维护答案，还有一些题虽然长得像数论，核心却只是把不变量抓出来。

## 1. [Weird Algorithm](https://cses.fi/problemset/task/1068)

`模拟` `序列`

### 题意

输入一个正整数 $n$。如果它是偶数就除以 $2$，如果它是奇数就变成 $3n+1$，直到数值变成 $1$ 为止，要求按顺序输出整个变化过程。

### 分析

这题没有隐藏结构，就是把规则逐步执行出来。真正需要注意的点只有一个：虽然输入范围不大，但中间过程可能暂时变大，所以变量最好用 `long long`。

输出时可以边模拟边打印。每一步只依赖当前值，因此不需要额外数组存整条序列。

### 核心代码

```cpp
long long n;
cin >> n;
while (true) {
    cout << n;
    if (n == 1) break;
    cout << ' ';
    n = (n % 2 == 0 ? n / 2 : 3 * n + 1);
}
```

### 复杂度

时间复杂度为 $O(k)$，其中 $k$ 是序列长度；空间复杂度为 $O(1)$。

---

## 2. [Missing Number](https://cses.fi/problemset/task/1083)

`扫描` `异或`

### 题意

给出 $1$ 到 $n$ 之间的所有整数，但恰好缺失一个。输入里包含其余 $n-1$ 个互不相同的数，要求找出漏掉的那个数。

### 分析

把 $1$ 到 $n$ 全部异或一遍，再把输入出现过的数再异或一遍，成对出现的值都会抵消，最后剩下的就是缺失值。

这样写比求和更干净，也不用担心大范围下的加法溢出问题。

### 核心代码

```cpp
int n, x, ans = 0;
cin >> n;
for (int i = 1; i <= n; ++i) ans ^= i;
for (int i = 1; i < n; ++i) {
    cin >> x;
    ans ^= x;
}
cout << ans;
```

### 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

---

## 3. [Repetitions](https://cses.fi/problemset/task/1069)

`字符串` `扫描`

### 题意

给定一个只含 `A`、`C`、`G`、`T` 的字符串，要求找出其中最长的连续相同字符段长度。

### 分析

这题只关心连续段，所以扫描时维护当前段长度和历史最大值即可。当前字符与前一个字符相同，段长加一；否则从 $1$ 重新开始。

整个过程中从来不需要回头，因此本质上是一趟线性扫描。

### 核心代码

```cpp
string s;
cin >> s;
int cur = 0, ans = 0;
char last = 0;
for (char c : s) {
    cur = (c == last ? cur + 1 : 1);
    ans = max(ans, cur);
    last = c;
}
cout << ans;
```

### 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

---

## 4. [Increasing Array](https://cses.fi/problemset/task/1094)

`贪心` `数组`

### 题意

给出一个长度为 $n$ 的数组。每次操作可以把某个元素加一，要求用最少操作次数把整个数组变成非递减序列。

### 分析

从左往右看，当前位置如果已经不小于前一个数，就不用动；如果更小，那它至少要被补到前一个数，否则数组仍然不合法。因为操作只能增加，前面已经确定下来的值不可能再降低，所以这种“看到缺口就补平”的做法天然最优。

答案就是所有补差值的总和，累计时要用 `long long`。

### 核心代码

```cpp
int n;
cin >> n;
long long ans = 0, mx = 0;
for (int i = 0; i < n; ++i) {
    long long x;
    cin >> x;
    if (x < mx) ans += mx - x;
    else mx = x;
}
cout << ans;
```

### 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

---

## 5. [Bit Strings](https://cses.fi/problemset/task/1617)

`快速幂` `计数`

### 题意

求长度为 $n$ 的二进制串一共有多少个，答案对 $10^9+7$ 取模。

### 分析

每一位都可以独立选择 $0$ 或 $1$，所以总数就是 $2^n$。题目唯一的技术点是取模，直接用快速幂就能在很短时间内算完。

这题的结论简单，但它很好地提醒了一件事：看到“每位独立选择”，通常就应该立刻想到乘法原理。

### 核心代码

```cpp
const long long MOD = 1e9 + 7;
long long n, ans = 1, a = 2;
cin >> n;
while (n) {
    if (n & 1) ans = ans * a % MOD;
    a = a * a % MOD;
    n >>= 1;
}
cout << ans;
```

### 复杂度

时间复杂度为 $O(\log n)$，空间复杂度为 $O(1)$。

---

## 6. [Trailing Zeros](https://cses.fi/problemset/task/1618)

`数论` `阶乘`

### 题意

给定 $n$，要求计算 $n!$ 的末尾一共有多少个零。

### 分析

末尾零来自因子 $10$，而 $10=2\times 5$。在阶乘里，因子 $2$ 的数量远多于因子 $5$，所以问题等价于统计 $n!$ 中一共含有多少个 $5$。

所有 $5$ 的倍数贡献至少一个 $5$，所有 $25$ 的倍数还会再多贡献一个，以此类推。因此答案是 $\lfloor n/5 \rfloor + \lfloor n/25 \rfloor + \lfloor n/125 \rfloor + \cdots$。

### 核心代码

```cpp
long long n, ans = 0;
cin >> n;
for (long long p = 5; p <= n; p *= 5) ans += n / p;
cout << ans;
```

### 复杂度

时间复杂度为 $O(\log_5 n)$，空间复杂度为 $O(1)$。

---

## 7. [Coin Piles](https://cses.fi/problemset/task/1754)

`数学结论` `不变量`

### 题意

有两堆硬币，当前数量分别为 $a$ 和 $b$。每次操作只能拿走 $(1,2)$ 或 $(2,1)$ 枚，问能否恰好把两堆都清空。

### 分析

每次操作总共会拿走 $3$ 枚，所以 $a+b$ 必须能被 $3$ 整除，这是第一个必要条件。

第二个条件来自“大的那堆不能太大”。因为一次操作至多从某一堆拿走 $2$ 枚，如果一开始就有 $\max(a,b)>2\min(a,b)$，那么较小那堆先见底时，较大那堆还会剩下硬币，无论如何都清不空。反过来，这两个条件同时满足时总能通过合适的 $(1,2)$ 与 $(2,1)$ 组合消掉全部硬币，所以它们也是充分条件。

### 核心代码

```cpp
int t;
cin >> t;
while (t--) {
    long long a, b;
    cin >> a >> b;
    bool ok = ((a + b) % 3 == 0) && max(a, b) <= 2 * min(a, b);
    cout << (ok ? "YES\n" : "NO\n");
}
```

### 复杂度

单组时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

# 二、直接构造与输出

这一章的共同点是“答案并不藏在复杂运算里，而是藏在一种可执行的摆法里”。有的题靠结构对称，有的题靠字典序贪心，但都要求你先想清楚什么样的排列天然满足限制。

## 8. [Permutations](https://cses.fi/problemset/task/1070)

`构造` `排列`

### 题意

构造一个 $1$ 到 $n$ 的排列，使得任意相邻两个数的差都不等于 $1$。如果不存在这样的排列，就输出 `NO SOLUTION`。

### 分析

把所有偶数放在前面、所有奇数放在后面，是这题最经典的构造。块内相邻元素至少相差 $2$，跨块的那一处差值通常也不会是 $1$。

真正需要单独处理的是很小的 $n$：$n=1$ 直接输出 $1$；$n=2,3$ 无法构造；从 $4$ 开始，偶数块接奇数块就已经足够。

### 核心代码

```cpp
int n;
cin >> n;
if (n == 1) cout << 1;
else if (n <= 3) cout << "NO SOLUTION";
else {
    for (int i = 2; i <= n; i += 2) cout << i << ' ';
    for (int i = 1; i <= n; i += 2) cout << i << ' ';
}
```

### 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

---

## 9. [Two Sets](https://cses.fi/problemset/task/1092)

`构造` `贪心`

### 题意

把 $1$ 到 $n$ 这 $n$ 个整数分成两个集合，要求两个集合的元素和相等。如果可以，输出一种具体分法。

### 分析

总和是 $n(n+1)/2$，如果它是奇数，那两边不可能平分，直接无解。

当总和是偶数时，目标就变成从 $1$ 到 $n$ 里挑一些数凑出一半。由于这些数是连续的，按从大到小贪心拿数很好用：当前数不超过剩余目标，就把它放进第一组。大数先拿走以后，后面总还能用更小的连续整数把缺口补齐。

### 核心代码

```cpp
int n;
cin >> n;
long long sum = 1LL * n * (n + 1) / 2;
if (sum & 1) cout << "NO\n";
else {
    vector<int> a, b;
    long long need = sum / 2;
    for (int x = n; x >= 1; --x) {
        if (x <= need) a.push_back(x), need -= x;
        else b.push_back(x);
    }
    cout << "YES\n" << a.size() << "\n";
    for (int x : a) cout << x << ' ';
    cout << "\n" << b.size() << "\n";
    for (int x : b) cout << x << ' ';
}
```

### 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

---

## 10. [Palindrome Reorder](https://cses.fi/problemset/task/1755)

`构造` `计数`

### 题意

给定一个只含大写字母的字符串，要求重新排列字符，使新串成为回文串；如果无解，输出 `NO SOLUTION`。

### 分析

回文的左右两半必须完全对称，所以每种字符的出现次数通常都要是偶数。只有当字符串总长度为奇数时，才允许恰好有一种字符出现奇数次，它会被放在最中间。

因此先统计 $26$ 个字母频次。如果奇数频次的字母超过一个，就不可能构成回文；否则把每个字符的一半放进左半边，中间放那一个奇数字符，再把左半边反转接到右边即可。

### 核心代码

```cpp
string s, left, mid;
cin >> s;
vector<int> cnt(26);
for (char c : s) cnt[c - 'A']++;
for (int i = 0; i < 26; ++i) {
    if (cnt[i] & 1) {
        if (!mid.empty()) return cout << "NO SOLUTION", 0;
        mid.append(cnt[i], char('A' + i));
    }
    left.append(cnt[i] / 2, char('A' + i));
}
string right = left;
reverse(right.begin(), right.end());
cout << left + mid + right;
```

### 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

---

## 11. [Gray Code](https://cses.fi/problemset/task/2205)

`构造` `位运算`

### 题意

输出长度为 $n$ 的一组格雷码，使相邻两个二进制串恰好只在一位上不同。

### 分析

直接套用二进制反射格雷码公式 $g(i)=i\oplus(i>>1)$ 即可。把 $i=0,1,2,\dots,2^n-1$ 依次代入，得到的序列天然满足相邻项只翻转一位。

这题真正值得记住的是“编号映射”这件事：并不一定要手工构造整串序列，有时只要把普通编号变形成目标编号，结构就自己出来了。

### 核心代码

```cpp
int n;
cin >> n;
for (int i = 0; i < (1 << n); ++i) {
    int g = i ^ (i >> 1);
    for (int b = n - 1; b >= 0; --b) cout << ((g >> b) & 1);
    cout << '\n';
}
```

### 复杂度

时间复杂度为 $O(n2^n)$，空间复杂度为 $O(1)$。

---

## 12. [Creating Strings](https://cses.fi/problemset/task/1622)

`全排列` `字典序`

### 题意

给定一个长度不大的字符串，要求输出由这些字符能够组成的所有不同字符串，并按字典序排列。

### 分析

因为长度最多只有 $8$，完全可以直接枚举排列。关键是字符串里可能有重复字符，所以不能把同一种结果输出多次。

最省事的做法是先排序，再不断调用 `next_permutation`。从有序起点出发，它会按字典序依次走过所有不同的排列，重复字符也会被自然处理掉。

### 核心代码

```cpp
string s;
cin >> s;
sort(s.begin(), s.end());
vector<string> ans;
do ans.push_back(s);
while (next_permutation(s.begin(), s.end()));
cout << ans.size() << "\n";
for (auto &t : ans) cout << t << "\n";
```

### 复杂度

设不同排列数量为 $k$，时间复杂度为 $O(kn)$，空间复杂度为 $O(kn)$。

---

## 13. [String Reorder](https://cses.fi/problemset/task/1743)

`贪心` `字符串构造`

### 题意

重排一个只含大写字母的字符串，使得相邻字符都不相同，并且在所有合法结果中字典序最小；如果根本无法构造，输出 $-1$。

### 分析

这题比回文构造难在两点：既要合法，还要字典序最小。一个自然的思路是从左到右贪心，每次都尝试放当前能放的最小字符，但不能只看“和前一个不同”，还得确认放完以后剩余字符仍然可排。

判定剩余部分能否继续排，可以抓住两个条件：第一，任意字符出现次数都不能超过剩余长度的一半向上取整；第二，刚刚放下的那个字符在下一位不能立刻再出现，所以它剩余的次数不能多到必须贴着自己放。只要对每个候选字符做这个可行性检查，第一次通过检查的字符就是这一位的最优选择。

### 核心代码

```cpp
string s, ans;
cin >> s;
vector<int> cnt(26);
for (char c : s) cnt[c - 'A']++;
auto ok = [&](int last) {
    int rem = 0, mx = 0;
    for (int x : cnt) rem += x, mx = max(mx, x);
    if (mx > (rem + 1) / 2) return false;
    return last == -1 || cnt[last] <= rem - cnt[last];
};
int pre = -1;
for (int step = 0; step < (int)s.size(); ++step) {
    bool found = false;
    for (int c = 0; c < 26; ++c) {
        if (!cnt[c] || c == pre) continue;
        cnt[c]--;
        if (ok(c)) {
            ans.push_back(char('A' + c));
            pre = c;
            found = true;
            break;
        }
        cnt[c]++;
    }
    if (!found) return cout << -1, 0;
}
cout << ans;
```

### 复杂度

时间复杂度为 $O(26n)$，空间复杂度为 $O(1)$。

# 三、坐标、棋盘与公式观察

这一章开始出现“表面上像模拟，实质上要先看出结构”的题。你可以把它们理解成几种不同的观察训练：有的看层数，有的看攻击关系，有的把无限串拆成按位数分块。

## 14. [Number Spiral](https://cses.fi/problemset/task/1071)

`公式` `坐标`

### 题意

无限棋盘上的数按螺旋方式编号，给出坐标 $(y,x)$，要求求出该位置上的数字。

### 分析

关键不在逐层模拟，而在看出当前位置属于哪一圈。令 $z=\max(y,x)$，那么点 $(y,x)$ 一定落在边长为 $z$ 的那一层正方形上，而这一层的最大编号是 $z^2$。

接下来只要按奇偶分类。奇数层和偶数层的增长方向相反：有时要从 $(z-1)^2+1$ 往前推，有时要从 $z^2$ 往回减。把这两种情况写成分支以后，每个询问都能 $O(1)$ 回答。

### 核心代码

```cpp
int t;
cin >> t;
while (t--) {
    long long y, x, z, ans;
    cin >> y >> x;
    z = max(y, x);
    if (z & 1) ans = (y == z ? (z - 1) * (z - 1) + x : z * z - y + 1);
    else ans = (x == z ? (z - 1) * (z - 1) + y : z * z - x + 1);
    cout << ans << '\n';
}
```

### 复杂度

单组时间复杂度为 $O(1)$，空间复杂度为 $O(1)$。

---

## 15. [Two Knights](https://cses.fi/problemset/task/1072)

`组合计数` `公式`

### 题意

对于每个 $k=1,2,\dots,n$，求在 $k\times k$ 棋盘上摆放两个骑士且互不攻击的方案数。

### 分析

先不管攻击限制，任意选两个格子的方案数是 $\binom{k^2}{2}$。真正要减掉的是互相攻击的情况。

一对骑士互相攻击，必须落在一个 $2\times 3$ 或 $3\times 2$ 小矩形的两个对角位置上。这样的矩形一共有 $(k-1)(k-2)$ 个方向排列，每个矩形提供 $4$ 对攻击位置，所以冲突总数是 $4(k-1)(k-2)$。总答案就是二者相减。

### 核心代码

```cpp
long long n;
cin >> n;
for (long long k = 1; k <= n; ++k) {
    long long total = k * k * (k * k - 1) / 2;
    long long bad = 4 * (k - 1) * (k - 2);
    cout << total - bad << '\n';
}
```

### 复杂度

时间复杂度为 $O(n)$，空间复杂度为 $O(1)$。

---

## 16. [Knight Moves Grid](https://cses.fi/problemset/task/3217)

`最短路` `棋盘`

### 题意

在一个 $n\times n$ 棋盘上有一匹马。对于每个格子，输出它走到左上角所需的最少步数。

### 分析

虽然题面也和棋盘坐标有关，但这题最稳的做法不是猜公式，而是把棋盘看成无权图：每个格子是点，马的八种跳法是边。要求某个起点到所有点的最短路，直接做一遍 BFS 即可。

因为棋盘共有 $n^2$ 个格子，每个格子最多扩展 $8$ 条边，所以总复杂度就是线性的网格遍历量级，足够通过。

### 核心代码

```cpp
vector<vector<int>> dist(n, vector<int>(n, -1));
queue<pair<int, int>> q;
int dx[8] = {1, 2, 2, 1, -1, -2, -2, -1};
int dy[8] = {2, 1, -1, -2, -2, -1, 1, 2};
dist[0][0] = 0;
q.push({0, 0});
while (!q.empty()) {
    auto [x, y] = q.front();
    q.pop();
    for (int k = 0; k < 8; ++k) {
        int nx = x + dx[k], ny = y + dy[k];
        if (0 <= nx && nx < n && 0 <= ny && ny < n && dist[nx][ny] == -1) {
            dist[nx][ny] = dist[x][y] + 1;
            q.push({nx, ny});
        }
    }
}
```

### 复杂度

时间复杂度为 $O(n^2)$，空间复杂度为 $O(n^2)$。

---

## 17. [Digit Queries](https://cses.fi/problemset/task/2431)

`数位` `分块`

### 题意

把所有正整数按顺序拼成无限长字符串 `123456789101112...`。每次询问给出一个位置 $k$，要求找出该位置上的数字。

### 分析

这条无限串最适合按“数字长度”分块：$1$ 位数贡献 $9$ 个字符，$2$ 位数贡献 $90\times 2$ 个字符，$3$ 位数贡献 $900\times 3$ 个字符，依次类推。

先不断减去整块，直到确定第 $k$ 位落在哪一段位数里。接着定位它属于这一段中的第几个数，再取出这个数里对应的第几位字符即可。由于 $k$ 可以很大，块大小乘法最好用 `__int128` 承接一下。

### 核心代码

```cpp
int q;
cin >> q;
while (q--) {
    long long k, len = 1, cnt = 9, start = 1;
    cin >> k;
    while ((__int128)len * cnt < k) {
        k -= len * cnt;
        len++, cnt *= 10, start *= 10;
    }
    long long num = start + (k - 1) / len;
    string s = to_string(num);
    cout << s[(k - 1) % len] << '\n';
}
```

### 复杂度

单组时间复杂度为 $O(\log k)$，空间复杂度为 $O(1)$。

# 四、搜索与回溯

到了这里，题目开始要求你在大量可能性里找合法答案。搜索本身并不难写，难的是及时剪掉注定无效的分支，让枚举停在“刚刚好”的规模上。

## 18. [Tower of Hanoi](https://cses.fi/problemset/task/2165)

`递归` `经典问题`

### 题意

有三根柱子和 $n$ 个不同大小的圆盘，要求把所有圆盘从左柱移动到右柱，且始终不能把大盘放在小盘上。需要输出最少操作次数以及一种最优移动方案。

### 分析

汉诺塔的结构非常稳定：如果要移动 $n$ 个盘，必须先把上面的 $n-1$ 个盘挪到辅助柱，再把最大盘挪到目标柱，最后把那 $n-1$ 个盘从辅助柱挪到目标柱。

于是递归关系就是 $T(n)=T(n-1)+1+T(n-1)=2T(n-1)+1$，最少步数为 $2^n-1$。输出方案时只要按这个递归过程记录移动边即可。

### 核心代码

```cpp
vector<pair<int, int>> ans;
function<void(int, int, int, int)> dfs = [&](int n, int a, int b, int c) {
    if (n == 0) return;
    dfs(n - 1, a, c, b);
    ans.push_back({a, c});
    dfs(n - 1, b, a, c);
};
dfs(n, 1, 2, 3);
cout << ans.size() << '\n';
for (auto [a, b] : ans) cout << a << ' ' << b << '\n';
```

### 复杂度

时间复杂度为 $O(2^n)$，空间复杂度为 $O(2^n)$。

---

## 19. [Apple Division](https://cses.fi/problemset/task/1623)

`回溯` `子集枚举`

### 题意

给出若干苹果重量，要求把它们分成两组，使两组总重量差值最小。

### 分析

苹果数量最多只有 $20$，这已经在明确暗示“直接枚举子集就行”。每个苹果只有放左边或放右边两种选择，所以整题是一个标准的二叉决策树。

设总重量为 $S$，当前枚举到某个子集和为 $x$，那么两组差值就是 $|S-2x|$。搜索时一路维护当前和，走到叶子结点时更新答案即可。

### 核心代码

```cpp
long long sum = accumulate(p.begin(), p.end(), 0LL), ans = (1LL << 62);
function<void(int, long long)> dfs = [&](int i, long long cur) {
    if (i == n) {
        ans = min(ans, llabs(sum - 2 * cur));
        return;
    }
    dfs(i + 1, cur);
    dfs(i + 1, cur + p[i]);
};
dfs(0, 0);
cout << ans;
```

### 复杂度

时间复杂度为 $O(2^n)$，空间复杂度为 $O(n)$。

---

## 20. [Chessboard and Queens](https://cses.fi/problemset/task/1624)

`回溯` `八皇后`

### 题意

在一个 $8\times 8$ 棋盘上放置 $8$ 个皇后，使它们互不攻击。棋盘上有些格子被标记为不可放置，要求计算总方案数。

### 分析

按行搜索最自然。第 $r$ 行只需要决定皇后放在哪一列，而合法性检查只和列、主对角线、副对角线是否已被占用有关。

因此可以用三个布尔集合或位掩码维护冲突状态。遇到保留格就直接跳过，放下一个皇后后递归到下一行，最后统计所有成功铺满 $8$ 行的方案。

### 核心代码

```cpp
int ans = 0;
function<void(int, int, int, int)> dfs = [&](int r, int col, int d1, int d2) {
    if (r == 8) {
        ans++;
        return;
    }
    for (int c = 0; c < 8; ++c) {
        int a = r + c, b = r - c + 7;
        if (g[r][c] == '*' || (col >> c & 1) || (d1 >> a & 1) || (d2 >> b & 1)) continue;
        dfs(r + 1, col | (1 << c), d1 | (1 << a), d2 | (1 << b));
    }
};
dfs(0, 0, 0, 0);
cout << ans;
```

### 复杂度

时间复杂度为 $O(8!)$ 量级，空间复杂度为 $O(8)$。

---

## 21. [Grid Path Description](https://cses.fi/problemset/task/1625)

`深搜` `剪枝`

### 题意

在 $7\times 7$ 网格中，从左上角走到左下角，恰好走满 $48$ 步，每步方向由字符串给出；其中 `?` 表示该步可以任选上下左右。要求统计所有与描述匹配的合法路径数。

### 分析

暴力 DFS 是起点，但真正能过题的是剪枝。最重要的剪枝是“分裂判死”：如果当前位置上下都被堵住、左右却都还能走，那么未访问区域会被切成左右两块，后续不可能再一次性走完；左右被堵、上下都通也是同理。

另外，提前到达终点也必须立即判掉，因为题目要求恰好走完全部步数。把这些明显死局剪掉以后，搜索树会急剧缩小，DFS 才能在时限内完成。

### 核心代码

```cpp
string s;
int ans = 0;
bool vis[9][9];
int dr[4] = {1, -1, 0, 0}, dc[4] = {0, 0, -1, 1};
string dir = "DULR";
function<void(int, int, int)> dfs = [&](int r, int c, int i) {
    if (r == 7 && c == 1) return void(ans += (i == 48));
    if (i == 48) return;
    if ((vis[r - 1][c] && vis[r + 1][c] && !vis[r][c - 1] && !vis[r][c + 1]) ||
        (vis[r][c - 1] && vis[r][c + 1] && !vis[r - 1][c] && !vis[r + 1][c])) return;
    for (int k = 0; k < 4; ++k) {
        if (s[i] != '?' && s[i] != dir[k]) continue;
        int nr = r + dr[k], nc = c + dc[k];
        if (vis[nr][nc]) continue;
        vis[nr][nc] = true;
        dfs(nr, nc, i + 1);
        vis[nr][nc] = false;
    }
};
for (int i = 0; i < 9; ++i) vis[0][i] = vis[8][i] = vis[i][0] = vis[i][8] = true;
vis[1][1] = true;
dfs(1, 1, 0);
cout << ans;
```

### 复杂度

最坏时间复杂度接近指数级，但关键剪枝后可通过；空间复杂度为 $O(48)$。

# 五、入门扩展构造

最后这一章的题目更像“把规律落成成品”。它们不再只是还原一个现成过程，而是要求你主动设计排列、矩阵或染色方案，让所有限制同时成立。

## 22. [Raab Game I](https://cses.fi/problemset/task/3399)

`构造` `排列`

### 题意

两名玩家各有 $1$ 到 $n$ 这 $n$ 张牌，并各自决定一个出牌顺序。每一轮双方同时出一张，较大的得一分。给出最终分数 $a,b$，要求判断是否存在这样的对局，并构造一种方案。

### 分析

把第一位玩家的顺序固定成 $1,2,\dots,n$，问题就转化成给第二位玩家构造一个排列 $q$：有 $a$ 个位置满足 $i>q_i$，有 $b$ 个位置满足 $i<q_i$，剩下的位置相等。

如果 $a+b>n$，位置数都不够，显然无解；如果只有一方得分而另一方完全不得分，也无解，因为一旦某些位置出现“大于”，总得有别的位置出现“小于”来平衡排列。其余情况下，令 $m=a+b$，把前 $m$ 个位置做一个循环位移 $q=[a+1,a+2,\dots,m,1,2,\dots,a]$，后面位置保持不动。这样前 $b$ 个位置恰好让第一人失分，后 $a$ 个位置恰好让第一人得分，构造一次完成。

### 核心代码

```cpp
int t;
cin >> t;
while (t--) {
    int n, a, b;
    cin >> n >> a >> b;
    if (a + b > n || ((a == 0) ^ (b == 0))) {
        cout << "NO\n";
        continue;
    }
    vector<int> p(n), q(n);
    iota(p.begin(), p.end(), 1);
    iota(q.begin(), q.end(), 1);
    int m = a + b;
    for (int i = 0; i < m; ++i) q[i] = (i + a) % m + 1;
    cout << "YES\n";
    for (int x : p) cout << x << ' ';
    cout << "\n";
    for (int x : q) cout << x << ' ';
    cout << "\n";
}
```

### 复杂度

单组时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

---

## 23. [Mex Grid Construction](https://cses.fi/problemset/task/3419)

`构造` `异或`

### 题意

构造一个 $n\times n$ 网格。每个位置的值必须等于“同一行左侧出现过的数”和“同一列上方出现过的数”的并集所缺失的最小非负整数。

### 分析

这题最漂亮的地方在于答案可以直接写成 $a_{i,j}=i\oplus j$，这里的下标按 $0$ 开始理解。异或表天然满足一种逐位补全的性质：当你看某个格子时，左边和上边已经出现过的值会把所有更小且应当出现的数覆盖掉，而当前这个异或值本身还没在对应位置出现过，所以它正好就是 mex。

一旦看出这个结构，整题就从“看上去很难验证的 mex 条件”变成了简单的双重循环输出。

### 核心代码

```cpp
int n;
cin >> n;
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < n; ++j) cout << (i ^ j) << " \n"[j + 1 == n];
}
```

### 复杂度

时间复杂度为 $O(n^2)$，空间复杂度为 $O(1)$。

---

## 24. [Grid Coloring I](https://cses.fi/problemset/task/3311)

`构造` `染色`

### 题意

给定一个由 `A`、`B`、`C`、`D` 组成的网格。你需要把每个格子重新改成四种字符之一，并满足两个条件：新字符不能和原字符相同，且上下左右相邻格子的新字符也不能相同。

### 分析

把棋盘按黑白格分成两个部分。若黑格只允许使用 `A/B`，白格只允许使用 `C/D`，那么任意相邻格子必定属于不同颜色集合，自然不可能相同。

剩下的问题就变成：每个格子如何在自己所属的两个候选字符里，选一个与原字符不同的值。由于候选集合大小是 $2$，而原字符只有一个，所以总能选出另一个，整张表一定可以构造出来。

### 核心代码

```cpp
vector<string> ans(n, string(m, '?'));
for (int i = 0; i < n; ++i) {
    for (int j = 0; j < m; ++j) {
        string cand = ((i + j) & 1) ? "CD" : "AB";
        ans[i][j] = (g[i][j] == cand[0] ? cand[1] : cand[0]);
    }
}
for (auto &row : ans) cout << row << '\n';
```

### 复杂度

时间复杂度为 $O(nm)$，空间复杂度为 $O(nm)$。
