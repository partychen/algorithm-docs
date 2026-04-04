---
title: "一本通 动态规划提高专题精选解题报告"
subtitle: "🧠 从区间、树形到单调队列与斜率优化的动规进阶主线"
order: 17
icon: "📊"
---

# 一本通 动态规划提高专题精选解题报告

这一组题从区间合并一路走到树上选择、数位统计、状态压缩，再落到单调队列与斜率优化。读的时候可以一直抓住同一条线：先把状态压准，再想办法把转移里的整段枚举压掉。

# 一、区间切分与环形展开

这一章先把“最后一步在哪发生”这件事想清楚。只要区间边界定下来，合并、配对、构树和恢复方案都会顺着断点展开。

## 1. [1569：【 例 1】石子合并](http://ybt.ssoier.cn:8088/problem_show.php?pid=1569)

`算法提高篇` `提高(五)动态规划` `第1章 区间类动态规划`

### 题意

有 $n$ 堆石子围成一个环，每次只能合并相邻两堆，合并代价是新堆石子数。题目同时要求最小总得分和最大总得分。

### 分析

环上的相邻关系不好直接做，先把序列复制一遍，任取长度为 $n$ 的连续段就对应一个断环位置。于是问题转成链上的区间 DP，再在所有断点里取最优。

设 `mn[l][r]`、`mx[l][r]` 表示把区间 `[l,r]` 合并成一堆的最小和最大代价。最后一次合并一定把它拆成 `[l,k]` 与 `[k+1,r]`，再加整段区间和，所以经典转移就出来了。

### 核心代码

```cpp
for(int len=2;len<=n;len++)
  for(int l=1;l+len-1<=2*n;l++){
    int r=l+len-1; mn[l][r]=INF; mx[l][r]=0;
    long long s=pre[r]-pre[l-1];
    for(int k=l;k<r;k++){
      mn[l][r]=min(mn[l][r],mn[l][k]+mn[k+1][r]+s);
      mx[l][r]=max(mx[l][r],mx[l][k]+mx[k+1][r]+s);
    }
  }
for(int l=1;l<=n;l++) ans1=min(ans1,mn[l][l+n-1]), ans2=max(ans2,mx[l][l+n-1]);
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 2. [1570：【例 2】能量项链](http://ybt.ssoier.cn:8088/problem_show.php?pid=1570)

`算法提高篇` `提高(五)动态规划` `第1章 区间类动态规划`

### 题意

给出一串首尾相接的能量珠，相邻两段合并会产生三元乘积能量。要求选择合并顺序，使总能量最大。

### 分析

它和多边形取最优剖分是同一类模型。把项链断成链并复制一遍后，枚举长度为 $n$ 的区间；区间 `[l,r]` 若最后在 `k` 处分开，那么左右两边先各自合并完，最后一次贡献就是两端标记和断点标记组成的三元乘积。

因此直接设 `dp[l][r]` 为区间最大能量，转移只需枚举最后断点 `k`。关键不是记公式，而是先看出“最后一次合并”会唯一决定贡献。

### 核心代码

```cpp
for(int len=2;len<=n;len++)
  for(int l=1;l+len-1<=2*n;l++){
    int r=l+len-1;
    for(int k=l;k<r;k++)
      dp[l][r]=max(dp[l][r],dp[l][k]+dp[k+1][r]+1LL*a[l]*a[k+1]*a[r+1]);
  }
for(int l=1;l<=n;l++) ans=max(ans,dp[l][l+n-1]);
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 3. [1571：【例 3】凸多边形的划分](http://ybt.ssoier.cn:8088/problem_show.php?pid=1571)

`算法提高篇` `提高(五)动态规划` `第1章 区间类动态规划`

### 题意

给定凸多边形各顶点权值，把它剖分成若干三角形，要求三角形权值乘积和最小。

### 分析

凸多边形最稳的想法就是固定一个区间边界，把它当成一段顶点序列来做。若 `[l,r]` 最后选 `k` 与两端组成一个三角形，那么左边与右边就是两个独立子问题，再加上 `w[l]w[k]w[r]` 的贡献。

因为点权可达 $10^9$，乘积和会远超 `long long`，所以状态值需要高精度。模型本身仍是标准区间 DP，难点只是数值范围。

### 核心代码

```cpp
for(int len=3;len<=n;len++)
  for(int l=1;l+len-1<=n;l++){
    int r=l+len-1; dp[l][r]=INF;
    for(int k=l+1;k<r;k++)
      dp[l][r]=min(dp[l][r],dp[l][k]+dp[k][r]+cpp_int(w[l])*w[k]*w[r]);
  }
cout<<dp[1][n];
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 4. [1572：括号配对](http://ybt.ssoier.cn:8088/problem_show.php?pid=1572)

`算法提高篇` `提高(五)动态规划` `第1章 区间类动态规划`

### 题意

给出只含 `(` `)` `[` `]` 的字符串，允许插入最少字符，使整个串变成合法括号表达式。

### 分析

对一段子串来说，最优方案只有两种来源：要么把首尾配成一对，问题缩成中间；要么在某个位置断开，变成两段最优值之和。区间 DP 天然适合这种“最后一步要么配对、要么切开”的结构。

设 `dp[l][r]` 为把子串修成合法表达式的最少插入数。单个字符显然要补一个；若 `s[l]` 和 `s[r]` 能配对，就尝试 `dp[l+1][r-1]`，再和所有分割方案取最小。

### 核心代码

```cpp
for(int i=1;i<=n;i++) dp[i][i]=1;
for(int len=2;len<=n;len++)
  for(int l=1;l+len-1<=n;l++){
    int r=l+len-1; dp[l][r]=INF;
    if(match(s[l],s[r])) dp[l][r]=min(dp[l][r],dp[l+1][r-1]);
    for(int k=l;k<r;k++) dp[l][r]=min(dp[l][r],dp[l][k]+dp[k+1][r]);
  }
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 5. [1573：分离与合体](http://ybt.ssoier.cn:8088/problem_show.php?pid=1573)

`算法提高篇` `提高(五)动态规划` `第1章 区间类动态规划`

### 题意

一段区间每次在某个位置分离成左右两段，最终再按相反方向合体。每次合体有收益，要求总收益最大，并输出字典序最小的分离顺序。

### 分析

把区间 `[l,r]` 第一次分离的位置记为 `k`，它会把问题拆成 `[l,k]` 与 `[k+1,r]` 两段，最终合体时得到的新增收益正是 `(a[l]+a[r])\times a[k]`。于是状态仍然是标准区间 DP，只不过除了最优值，还要记录最优断点。

为了满足“分离阶段从前到后、同层从左到右”的输出要求，恢复时不能直接先序 DFS，而要把每次被分开的区间按层次推进。存下 `rt[l][r]` 后，用队列按层展开即可。

### 核心代码

```cpp
for(int len=2;len<=n;len++)
  for(int l=1;l+len-1<=n;l++){
    int r=l+len-1;
    for(int k=l;k<r;k++){
      int v=dp[l][k]+dp[k+1][r]+(a[l]+a[r])*a[k];
      if(v>dp[l][r]||(v==dp[l][r]&&k<rt[l][r])) dp[l][r]=v,rt[l][r]=k;
    }
  }
queue<pair<int,int>> q; q.push({1,n});
while(!q.empty()){ auto [l,r]=q.front(); q.pop(); if(l==r) continue; int k=rt[l][r]; out.push_back(k); q.push({l,k}); q.push({k+1,r}); }
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 6. [1574：矩阵取数游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1574)

`算法提高篇` `提高(五)动态规划` `第1章 区间类动态规划`

### 题意

矩阵每一轮都要从每行的最左或最右取一个数，第 $i$ 轮取到的数乘上 $2^i$ 计分。要求最大总得分。

### 分析

行与行之间互不影响，因为每一轮总分就是各行得分之和，所以可以把每一行单独算出最优值再求和。对一行来说，决定状态的只有当前还剩下哪一段。

设 `dp[l][r]` 表示当前还剩 `[l,r]` 没取时的最大附加得分，已经取走的个数就能由区间长度反推，从而知道这一轮的权重是多少。由于 $2^m$ 很大，状态值同样要用高精度。

### 核心代码

```cpp
for(int len=1;len<=m;len++)
  for(int l=1;l+len-1<=m;l++){
    int r=l+len-1, used=m-len+1;
    cpp_int w=cpp_int(1)<<used;
    dp[l][r]=max(dp[l+1][r]+row[l]*w,dp[l][r-1]+row[r]*w);
  }
ans+=dp[1][m];
```

### 复杂度

单行时间复杂度 $O(m^2)$，总时间复杂度 $O(nm^2)$，空间复杂度 $O(m^2)$。

---

# 二、树上选择、覆盖与路径

树上题看起来题型很多，其实核心都在子树合并：选点要合并，覆盖要合并，最长链与换根也都在合并来自不同方向的信息。

## 7. [1575：【例 1】二叉苹果树](http://ybt.ssoier.cn:8088/problem_show.php?pid=1575)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

给一棵带边权的苹果树，要求恰好保留 $Q$ 条树枝，使保留下来的苹果总数最大。

### 分析

保留多少条边，本质就是树上背包。把树定根后，`dp[u][k]` 表示在 `u` 的子树里保留 `k` 条边的最大苹果数；合并儿子时，要决定给这个儿子分配多少条边。

如果打算保留通向儿子 `v` 的那条边，就要额外占掉一条名额，并把该边苹果数一起算上。于是转移完全是背包卷积。

### 核心代码

```cpp
void dfs(int u,int fa){
  for(auto [v,w]:g[u]) if(v!=fa){
    dfs(v,u);
    for(int j=Q;j>=1;j--)
      for(int k=0;k<j;k++)
        dp[u][j]=max(dp[u][j],dp[u][j-k-1]+dp[v][k]+w);
  }
}
```

### 复杂度

时间复杂度 $O(nQ^2)$，空间复杂度 $O(nQ)$。

---

## 8. [1576：【例 2】选课](http://ybt.ssoier.cn:8088/problem_show.php?pid=1576)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

每门课最多只有一门直接先修课，必须满足先修课优先，要求在可选门数固定时最大化总学分。

### 分析

“先修课唯一”说明课程关系是一片森林。把所有没有先修课的课程连到虚根 `0` 上后，问题就变成从树上选若干点，且选子节点前必须先选父节点。

因此设 `dp[u][k]` 为在 `u` 的子树中选 `k` 门课且包含 `u` 的最大学分。先对子树做背包合并，最后再把 `u` 自己这一门课补进去；虚根学分为 `0`，答案就是它选满后的值。

### 核心代码

```cpp
void dfs(int u){
  dp[u][1]=score[u]; siz[u]=1;
  for(int v:son[u]){
    dfs(v);
    for(int j=siz[u];j>=1;j--)
      for(int k=1;k<=siz[v];k++)
        dp[u][j+k]=max(dp[u][j+k],dp[u][j]+dp[v][k]);
    siz[u]+=siz[v];
  }
}
// answer = dp[0][N+1]
```

### 复杂度

时间复杂度 $O(MN)$，空间复杂度 $O(MN)$。

---

## 9. [1577：【例 3】数字转换](http://ybt.ssoier.cn:8088/problem_show.php?pid=1577)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

每个数都能和它的真约数和互相转换，要求在不超过 $n$ 的正整数中，找一条不重复数字的最长变换链。

### 分析

设 `s[x]` 为 `x` 的真约数和。只要 `s[x]<x`，就在 `s[x]` 与 `x` 之间连一条边；由于每个点只会连向一个更小的数，所以整张图是一片森林。

题目要的就是这片森林中的最长简单路径，也就是树的直径。于是先筛出所有 `s[x]`，再对每棵树做一次 DFS，维护从当前点往下的两条最长链，更新全局答案即可。

### 核心代码

```cpp
for(int i=1;i<=n/2;i++)
  for(int j=i*2;j<=n;j+=i) sum[j]+=i;
for(int x=2;x<=n;x++) if(sum[x]<x) add(sum[x],x),add(x,sum[x]);
void dfs(int u,int fa){
  int a=0,b=0;
  for(int v:g[u]) if(v!=fa){ dfs(v,u); int t=down[v]+1;
    if(t>a) b=a,a=t; else if(t>b) b=t; }
  down[u]=a; ans=max(ans,a+b);
}
```

### 复杂度

预处理加 DFS 的总时间复杂度约为 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 10. [1578：【例 4】战略游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1578)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

在树的节点上放最少士兵，使每条边都至少被一个端点上的士兵覆盖。

### 分析

题目要求覆盖的是边，不是点，因此这是树上最小点覆盖。设 `dp[u][0/1]` 表示 `u` 不放或放士兵时，覆盖 `u` 子树所有边所需的最少人数。

若 `u` 不放，则每个儿子都必须放；若 `u` 放，则儿子放不放都行，取更小值即可。状态非常直接。

### 核心代码

```cpp
void dfs(int u,int fa){
  dp[u][0]=0; dp[u][1]=1;
  for(int v:g[u]) if(v!=fa){
    dfs(v,u);
    dp[u][0]+=dp[v][1];
    dp[u][1]+=min(dp[v][0],dp[v][1]);
  }
}
ans=min(dp[root][0],dp[root][1]);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 11. [1579：【例 5】皇宫看守](http://ybt.ssoier.cn:8088/problem_show.php?pid=1579)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

每个宫殿放守卫有不同费用，要求所有宫殿都被守卫看见，且总费用最小。守卫能看见自己和相邻宫殿。

### 分析

这是树上的最小带权支配集。只用“选或不选”不够，因为一个点即使不放守卫，也可能已经被儿子覆盖，或者还得指望父亲来覆盖。

因此常用三态：`0` 表示 `u` 放守卫，`1` 表示 `u` 不放但已被儿子覆盖，`2` 表示 `u` 还没被覆盖、必须交给父亲。核心转移是：求 `dp[u][1]` 时，至少要有一个儿子放守卫。

### 核心代码

```cpp
void dfs(int u){
  dp[u][0]=w[u]; dp[u][2]=0; dp[u][1]=INF;
  for(int v:son[u]){
    dfs(v);
    dp[u][0]+=min({dp[v][0],dp[v][1],dp[v][2]});
    dp[u][2]+=dp[v][1];
  }
  for(int x:son[u])
    dp[u][1]=min(dp[u][1],dp[u][2]-dp[x][1]+dp[x][0]);
}
ans=min(dp[root][0],dp[root][1]);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 12. [1580：加分二叉树](http://ybt.ssoier.cn:8088/problem_show.php?pid=1580)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

节点中序遍历固定为 `1..n`，每个节点有分数。要求构造一棵二叉树，使整棵树加分最大，并输出前序遍历。

### 分析

中序固定意味着区间 `[l,r]` 的根一旦选成 `k`，左右子树就只能分别来自 `[l,k-1]` 与 `[k+1,r]`。所以本质仍是区间 DP，而不是图上的结构搜索。

设 `dp[l][r]` 为区间最优加分，枚举根 `k`，左子树为空时加分按 `1` 处理，右边同理。顺手存下最优根 `rt[l][r]`，最后按根递归输出前序即可。

### 核心代码

```cpp
for(int i=1;i<=n;i++) dp[i][i]=a[i], rt[i][i]=i;
for(int len=2;len<=n;len++)
  for(int l=1;l+len-1<=n;l++){
    int r=l+len-1;
    for(int k=l;k<=r;k++){
      long long L=(k==l?1:dp[l][k-1]), R=(k==r?1:dp[k+1][r]);
      if(L*R+a[k]>dp[l][r]) dp[l][r]=L*R+a[k], rt[l][r]=k;
    }
  }
```

### 复杂度

时间复杂度 $O(n^3)$，空间复杂度 $O(n^2)$。

---

## 13. [1581：旅游规划](http://ybt.ssoier.cn:8088/problem_show.php?pid=1581)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

给一棵树，要求输出所有位于某条最长路径上的点。最长路径可能不唯一。

### 分析

若一个点出现在某条最长路径上，那么一定存在两条从它出发、走向不同方向的链，长度和恰好等于整棵树的直径。于是不能只盯着某一对直径端点，而要对每个点都算“经过它的最长路径”。

做法是两次 DFS：第一次求每个点向下的最长链和次长链；第二次把来自父亲方向的最优链补下来。对每个点收集所有可延伸长度，取最大的两条，若和等于全局直径，它就在某条最长路上。

### 核心代码

```cpp
void dfs1(int u,int fa){
  for(int v:g[u]) if(v!=fa){ dfs1(v,u); upd(u,down[v]+1); }
}
void dfs2(int u,int fa,int up){
  vector<int> cand={up};
  for(int v:g[u]) if(v!=fa) cand.push_back(down[v]+1);
  sort(cand.rbegin(),cand.rend());
  if(cand[0]+cand[1]==diam) mark[u]=1;
  for(int v:g[u]) if(v!=fa) dfs2(v,u,best_except(u,v)+1);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 14. [1582：周年纪念晚会](http://ybt.ssoier.cn:8088/problem_show.php?pid=1582)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

职员关系形成一棵树，直接上下级不能同时参加晚会。要求总欢乐度最大。

### 分析

这是树上最大权独立集。设 `dp[u][0]` 表示不选 `u`，`dp[u][1]` 表示选 `u`，那么如果选了 `u`，儿子都不能选；如果不选 `u`，儿子各自取最优。

这类题的手感很重要：一看到“父子不能同时选”，就该直接把状态分成“这个点选/不选”两类。

### 核心代码

```cpp
void dfs(int u){
  dp[u][1]=happy[u];
  for(int v:son[u]){
    dfs(v);
    dp[u][0]+=max(dp[v][0],dp[v][1]);
    dp[u][1]+=dp[v][0];
  }
}
ans=max(dp[root][0],dp[root][1]);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 15. [1583：叶子的染色](http://ybt.ssoier.cn:8088/problem_show.php?pid=1583)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

叶子颜色已经给定，要求给尽量少的节点染黑白两色，使每条根到叶路径上最后一个被染色节点的颜色恰好等于该叶子颜色。

### 分析

真正要控制的是“从上往下最后一次出现的颜色”。因此设 `dp[u][c]` 表示当 `u` 以上最近一次染色颜色是 `c` 时，满足 `u` 子树所有叶子要求所需的最少染色数。

对内部节点有两种选择：要么不染 `u`，那所有儿子继续继承颜色 `c`；要么把 `u` 染成某种颜色 `t`，代价加一，之后所有儿子都继承 `t`。叶子是最清楚的基例：若继承颜色已经等于目标色，就可以不染；否则必须把叶子自己补染。

### 核心代码

```cpp
int solve(int u,int c){
  if(isLeaf[u]) return color[u]==c?0:1;
  int keep=0; for(int v:son[u]) keep+=solve(v,c);
  int paint0=1, paint1=1;
  for(int v:son[u]) paint0+=solve(v,0), paint1+=solve(v,1);
  return min(keep,min(paint0,paint1));
}
ans=min(root_paint_black,root_paint_white);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 16. [1584：骑士](http://ybt.ssoier.cn:8088/problem_show.php?pid=1584)

`算法提高篇` `提高(五)动态规划` `第2章 树型动态规划`

### 题意

每个骑士恰好厌恶一个人，不能把互相冲突的一对同时选入军团。要求总战斗力最大。

### 分析

每人只有一条“厌恶边”，整张图是若干个基环树。树上的部分还是最大权独立集，麻烦只在每个连通块里多出来的那个环。

处理方法是把环找出来，对环上任意一条边做“拆断”两次：一次强制一端不选，一次强制另一端不选。这样环就变成树，可以跑树形 DP；两个结果取大，再把所有连通块相加。

### 核心代码

```cpp
for(auto cyc:get_cycles()){
  auto [x,y]=pick_edge(cyc);
  cut(x,y); dfs(x,0); long long v1=dp[x][0];
  cut(y,x); dfs(y,0); long long v2=dp[y][0];
  ans+=max(v1,v2);
}
void dfs(int u,int fa){
  dp[u][1]=w[u];
  for(int v:g[u]) if(v!=fa&&!cutEdge(u,v)) dfs(v,u), dp[u][0]+=max(dp[v][0],dp[v][1]), dp[u][1]+=dp[v][0];
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

# 三、数位约束与统计型数位 DP

这里不再直接数整数，而是按位往下放。状态里记住上一位、模数、是否贴上界，问题就会从“整段区间”变成“前缀受限的计数”。

## 17. [1585：【例 1】Amount of Degrees](http://ybt.ssoier.cn:8088/problem_show.php?pid=1585)

`算法提高篇` `提高(五)动态规划` `第3章 数位动态规划`

### 题意

统计区间内有多少数能写成恰好 $K$ 个互不相同的 $B$ 的幂之和。

### 分析

“互不相同的幂之和”翻译到 $B$ 进制，就是每一位只能是 `0/1`，而且恰好有 `K` 个 `1`。因此比起一般数位 DP，这题更像数位上的组合计数。

把上界写成 $B$ 进制后从高位往低位扫描：若当前位允许放 `0`，就把后面随便选若干个 `1` 的方案数累加进去；若当前位本身超过 `1`，说明这一位可以直接放 `1` 后面任意填，或者本位再往下都不可能贴着上界了。

### 核心代码

```cpp
int calc(int n){
  auto d=to_base(n,B); int need=K, ans=0;
  for(int i=d.size()-1;i>=0;i--){
    if(d[i]>0) ans+=C[i][need], need--;
    if(d[i]>1) { ans+=sum(C[i][need]); break; }
    if(need<0) break;
  }
  return ans+(need==0);
}
```

### 复杂度

单次计算时间复杂度 $O(log_B Y)$，预处理组合数为 $O(\log^2 Y)$。

---

## 18. [1586：【 例 2】数字游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1586)

`算法提高篇` `提高(五)动态规划` `第3章 数位动态规划`

### 题意

统计区间内从左到右各位数字单调不降的整数个数。

### 分析

这类题最自然的状态就是“上一位放了多少”。从高位往低位填时，当前位只能选择不小于上一位的数字；同时还要区分前面是否仍在前导零阶段。

所以记忆化状态写成 `dfs(pos,last,tight,started)` 就够了：`started=0` 时还没正式开始，当前位可以继续跳过；一旦开始，后面每位都要满足 `d>=last`。

### 核心代码

```cpp
long long dfs(int pos,int last,bool tight,bool started){
  if(!pos) return 1;
  if(!tight&&vis[pos][last][started]) return memo[pos][last][started];
  int up=tight?dig[pos]:9; long long ans=0;
  for(int d=0;d<=up;d++){
    if(!started||d>=last) ans+=dfs(pos-1,d,tight&&d==up,started||d);
  }
  return !tight?memo[pos][last][started]=ans,vis[pos][last][started]=1,ans:ans;
}
```

### 复杂度

时间复杂度约为 $O(\text{位数}\times 10\times 10)$，空间复杂度 $O(\text{位数}\times 10)$。

---

## 19. [1587：【例 3】Windy 数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1587)

`算法提高篇` `提高(五)动态规划` `第3章 数位动态规划`

### 题意

统计区间内相邻两位数字差至少为 $2$ 的正整数个数。

### 分析

和上一题一样，关键状态仍然是“上一位放了什么”。区别只是合法条件从“当前位不小于上一位”换成了“与上一位差的绝对值至少为 $2$”。

因此仍用 `dfs(pos,last,tight,started)`。当前还没开始时可以继续跳过；一旦开始，就只枚举满足 `|d-last|\ge 2` 的数字。

### 核心代码

```cpp
long long dfs(int pos,int last,bool tight,bool started){
  if(!pos) return started;
  int up=tight?dig[pos]:9; long long ans=0;
  for(int d=0;d<=up;d++){
    if(!started||abs(d-last)>=2)
      ans+=dfs(pos-1,d,tight&&d==up,started||d);
  }
  return ans;
}
```

### 复杂度

时间复杂度约为 $O(\text{位数}\times 10\times 10)$，空间复杂度 $O(\text{位数}\times 10)$。

---

## 20. [1588：数字游戏](http://ybt.ssoier.cn:8088/problem_show.php?pid=1588)

`算法提高篇` `提高(五)动态规划` `第3章 数位动态规划`

### 题意

对每组 $(a,b,N)$，统计区间内各位数字和对 $N$ 取模为 $0$ 的数。

### 分析

题目约束的不是数本身，而是数位和的余数，所以状态直接加一个 `mod` 即可。高位到低位枚举当前位 `d` 时，新的余数就是 `(mod+d)mod N`。

这种题最值得记住的不是公式，而是状态选取习惯：题目最后检查什么，就把什么压进 DP。

### 核心代码

```cpp
int dfs(int pos,int mod,bool tight,bool started){
  if(!pos) return started&&mod==0;
  int up=tight?dig[pos]:9, ans=0;
  for(int d=0;d<=up;d++)
    ans+=dfs(pos-1,(mod+d)%N,tight&&d==up,started||d);
  return ans;
}
```

### 复杂度

时间复杂度约为 $O(\text{位数}\times N\times 10)$，空间复杂度 $O(\text{位数}\times N)$。

---

## 21. [1589：不要 62](http://ybt.ssoier.cn:8088/problem_show.php?pid=1589)

`算法提高篇` `提高(五)动态规划` `第3章 数位动态规划`

### 题意

统计区间内不含数字 `4`，且不出现连续子串 `62` 的整数个数。

### 分析

这里的限制只和当前位及前一位有关，所以状态里额外记录“上一位是不是 `6`”即可。枚举新数字时，若它等于 `4`，或者当前上一位是 `6` 且新位是 `2`，就直接跳过。

这就是最典型的“短模式禁用”数位 DP：把模式机压成很小的状态。

### 核心代码

```cpp
int dfs(int pos,bool pre6,bool tight){
  if(!pos) return 1;
  int up=tight?dig[pos]:9, ans=0;
  for(int d=0;d<=up;d++){
    if(d==4) continue;
    if(pre6&&d==2) continue;
    ans+=dfs(pos-1,d==6,tight&&d==up);
  }
  return ans;
}
```

### 复杂度

时间复杂度约为 $O(\text{位数}\times 20)$，空间复杂度 $O(\text{位数})$。

---

## 22. [1590：恨 7 不成妻](http://ybt.ssoier.cn:8088/problem_show.php?pid=1590)

`算法提高篇` `提高(五)动态规划` `第3章 数位动态规划`

### 题意

统计区间内所有和 `7` 无关的数的平方和。和 `7` 无关意味着：没有数位 `7`，数位和不被 `7` 整除，数本身也不被 `7` 整除。

### 分析

只计数已经不够了，因为最后要求的是平方和。数位 DP 中一旦问到和、平方和，就该让状态返回一个三元组：`cnt`、`sum`、`sq`。

转移时把低位子问题整体平移一个高位数字 `d`，新的总和和平方和都能由展开式一次合并出来。再把 `sumMod` 与 `valMod` 作为状态，排除所有和 `7` 有关的情况即可。

### 核心代码

```cpp
struct Node{long long cnt,sum,sq;};
Node dfs(int pos,int s7,int v7,bool tight){
  if(!pos) return (s7&&v7)?Node{1,0,0}:Node{0,0,0};
  Node ans{0,0,0}; int up=tight?dig[pos]:9;
  for(int d=0;d<=up;d++) if(d!=7){
    Node t=dfs(pos-1,(s7+d)%7,(v7*10+d)%7,tight&&d==up);
    long long p=d*pw10[pos-1]%MOD;
    ans.sq=(ans.sq+t.sq+2*p*t.sum%MOD+p*p%MOD*t.cnt)%MOD;
    ans.sum=(ans.sum+t.sum+p*t.cnt)%MOD; ans.cnt=(ans.cnt+t.cnt)%MOD;
  }
  return ans;
}
```

### 复杂度

时间复杂度约为 $O(\text{位数}\times 7\times 7\times 10)$，空间复杂度 $O(\text{位数}\times 7\times 7)$。

---

## 23. [1591：数字计数](http://ybt.ssoier.cn:8088/problem_show.php?pid=1591)

`算法提高篇` `提高(五)动态规划` `第3章 数位动态规划`

### 题意

给定区间 $[a,b]$，统计数字 `0` 到 `9` 在所有整数中分别出现了多少次。

### 分析

这题更适合按位贡献，而不是整套数位 DP。固定十进制的某一位，设高位为 `high`、当前位为 `cur`、低位为 `low`，那么某个数字在这一位出现多少次可以直接分类讨论。

除数字 `0` 外，公式几乎完全一样；`0` 需要额外扣掉前导零产生的虚假贡献。最后对每个数字做一次 `calc(b,d)-calc(a-1,d)` 即可。

### 核心代码

```cpp
long long calc(long long n,int d){
  long long ans=0;
  for(long long p=1;p<=n;p*=10){
    long long high=n/(p*10), cur=n/p%10, low=n%p;
    if(d) ans+=(high+(cur>d))*p + (cur==d?low+1:0) - (cur>d?p:0);
    else if(high) ans+=(high-1)*p + (cur? p: low+1);
  }
  return ans;
}
```

### 复杂度

对每个数字的时间复杂度为 $O(\log_{10} b)$，总空间复杂度 $O(1)$。

---

# 四、状压边界与局部相容

当决策天然按行推进时，把一行压成一个状态最稳。真正的难点不在枚举，而在合法状态、相邻两行乃至三行之间的兼容关系。

## 24. [1592：【例 1】国王](http://ybt.ssoier.cn:8088/problem_show.php?pid=1592)

`算法提高篇` `提高(五)动态规划` `第4章 状态压缩类动态规划`

### 题意

在 $n\times n$ 棋盘上放 $k$ 个国王，要求任意两个国王不能互相攻击，求方案数。

### 分析

按行推进最自然。先预处理所有合法行状态：同一行里不能有相邻的 `1`。然后做 `dp[row][state][cnt]`，表示处理到当前行、这一行状态为 `state`、总共已放 `cnt` 个国王的方案数。

行间转移时，不仅正上方不能冲突，两条对角线也不能冲突，所以要同时检查 `state & pre`、`(state<<1)&pre`、`(state>>1)&pre`。

### 核心代码

```cpp
for(int s=0;s<1<<n;s++) if(!(s&(s>>1))) st.push_back(s), bits[s]=__builtin_popcount(s);
dp[0][0][0]=1;
for(int i=1;i<=n;i++)
  for(int s:st) for(int p:st){
    if(s&p||(s<<1)&p||(s>>1)&p) continue;
    for(int k=bits[s];k<=K;k++) dp[i][s][k]+=dp[i-1][p][k-bits[s]];
  }
```

### 复杂度

时间复杂度 $O(n\cdot V^2\cdot k)$，空间复杂度 $O(n\cdot V\cdot k)$，其中 $V$ 为合法状态数。

---

## 25. [1593：【例 2】牧场的安排](http://ybt.ssoier.cn:8088/problem_show.php?pid=1593)

`算法提高篇` `提高(五)动态规划` `第4章 状态压缩类动态规划`

### 题意

牧场部分格子可用，要求选择若干格种草，且任意两块草地不能有公共边，统计方案总数。

### 分析

这就是典型的按行状压。每行状态既要满足本行没有相邻 `1`，也要保证种草位置都在肥沃格上；与上一行转移时，再检查上下不能同时种。

因为题目不限制总块数，所以状态只需做到 `dp[row][state]`。和国王题相比，它少了对角线冲突，模型更纯粹。

### 核心代码

```cpp
dp[0][0]=1;
for(int i=1;i<=m;i++)
  for(int s:st){
    if(s&ban[i]) continue;
    for(int p:st){
      if(s&p) continue;
      dp[i][s]=(dp[i][s]+dp[i-1][p])%MOD;
    }
  }
```

### 复杂度

时间复杂度 $O(M\cdot V^2)$，空间复杂度 $O(M\cdot V)$。

---

## 26. [1594：涂抹果酱](http://ybt.ssoier.cn:8088/problem_show.php?pid=1594)

`算法提高篇` `提高(五)动态规划` `第4章 状态压缩类动态规划`

### 题意

给一个 $N\times M$ 网格，用三种果酱染色，相邻格不能同色，并且第 $K$ 行已经固定，求方案数。

### 分析

因为 $M\le 5$，一整行的颜色完全可以压成一个三进制状态。先预处理所有本行相邻格不同色的合法状态，再预处理两行之间同列不等色的兼容关系。

然后按行 DP；到了第 `K` 行时，只保留与给定方案完全相同的那一个状态即可。题目虽是三种颜色，本质仍是“行状态 + 相邻行兼容”。

### 核心代码

```cpp
for(int s=0;s<pow3[M];s++) if(ok_row(s)) st.push_back(s);
dp[0][0]=1;
for(int i=1;i<=N;i++)
  for(int s:st){
    if(i==K&&s!=fix) continue;
    for(int p:st) if(ok_col(s,p))
      dp[i][s]=(dp[i][s]+dp[i-1][p])%MOD;
  }
```

### 复杂度

时间复杂度 $O(N\cdot V^2)$，空间复杂度 $O(N\cdot V)$。

---

## 27. [1595：炮兵阵地](http://ybt.ssoier.cn:8088/problem_show.php?pid=1595)

`算法提高篇` `提高(五)动态规划` `第4章 状态压缩类动态规划`

### 题意

在有山地障碍的网格上放炮兵，炮兵横纵方向两格内都不能互相攻击，求最多放置数量。

### 分析

炮兵的纵向攻击会跨过相邻一行，所以只记上一行还不够，必须把前两行都带进状态。先预处理所有本行内部合法的摆法：行内不能有距离 $1$ 或 $2$ 的两个炮兵。

设 `dp[i][s][p]` 表示第 `i` 行状态是 `s`、第 `i-1` 行状态是 `p` 时的最优值，再枚举第 `i-2` 行状态做转移。只要三行之间都互不冲突即可。

### 核心代码

```cpp
for(int s=0;s<1<<m;s++) if(!(s&(s>>1))&&!(s&(s>>2))) st.push_back(s), cnt[s]=popcount(s);
for(int i=1;i<=n;i++)
  for(int s:st) if(!(s&ban[i]))
    for(int p:st) if(!(s&p)&&!(p&ban[i-1]))
      for(int q:st) if(!(s&q)&&!(p&q))
        dp[i][s][p]=max(dp[i][s][p],dp[i-1][p][q]+cnt[s]);
```

### 复杂度

时间复杂度 $O(n\cdot V^3)$，空间复杂度 $O(n\cdot V^2)$。

---

## 28. [1596：动物园](http://ybt.ssoier.cn:8088/problem_show.php?pid=1596)

`算法提高篇` `提高(五)动态规划` `第4章 状态压缩类动态规划`

### 题意

圆形动物园中，每个小朋友只看连续五个围栏。可以移走一些动物，要求让高兴的小朋友数量最多。

### 分析

每个小朋友的判定只和一个长度为 $5$ 的窗口有关，所以真正该维护的是“最近五个围栏是否被移走”的状态。问题是它在环上，于是先枚举前五个围栏的取舍，把环断成链。

接着顺着围栏做 DP，状态是最后五位的 bitmask。每确定一个新围栏，就把所有起点恰好在当前窗口的小朋友贡献结算进去；最后只保留与开头枚举相吻合的状态。

### 核心代码

```cpp
for(int first=0;first<32;first++){
  fill(dp,-INF); dp[5][first]=0;
  for(int i=6;i<=N+5;i++)
    for(int mask=0;mask<32;mask++) if(dp[i-1][mask]>=0)
      for(int b=0;b<2;b++){
        int nmask=((mask<<1)&31)|b;
        dp[i][nmask]=max(dp[i][nmask],dp[i-1][mask]+gain[i][nmask]);
      }
  ans=max(ans,dp[N+5][first]);
}
```

### 复杂度

时间复杂度 $O(32\cdot N\cdot 32)$，空间复杂度 $O(N\cdot 32)$。

---

# 五、单调队列与窗口化转移

这些题的共同点，是最优前驱永远只会落在一段滑动窗口里。把式子改写成窗口最值以后，队列就能把整段枚举压掉。

## 29. [1597：【 例 1】滑动窗口](http://ybt.ssoier.cn:8088/problem_show.php?pid=1597)

`算法提高篇` `提高(五)动态规划` `第5章 单调队列优化动规`

### 题意

给定长度为 $N$ 的序列，要求输出每个长度为 $K$ 的窗口里的最小值和最大值。

### 分析

窗口最值题的关键不是记模板，而是明白队列里为什么存下标：既要比较新值把更差的弹掉，又要判断队首是否已经滑出窗口。

做两遍即可，一遍维护单调递增队列求最小值，一遍维护单调递减队列求最大值。

### 核心代码

```cpp
for(int i=1;i<=n;i++){
  while(hh<=tt&&a[q[tt]]>=a[i]) tt--;
  q[++tt]=i; while(q[hh]<=i-k) hh++;
  if(i>=k) mn.push_back(a[q[hh]]);
}
for(int i=1;i<=n;i++){
  while(hh<=tt&&a[q[tt]]<=a[i]) tt--;
  q[++tt]=i; while(q[hh]<=i-k) hh++;
  if(i>=k) mx.push_back(a[q[hh]]);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(k)$。

---

## 30. [1598：【 例 2】最大连续和](http://ybt.ssoier.cn:8088/problem_show.php?pid=1598)

`算法提高篇` `提高(五)动态规划` `第5章 单调队列优化动规`

### 题意

要求找到长度不超过 $m$ 的连续子序列，使元素和最大。

### 分析

子段和一旦写成前缀和差 `pre[i]-pre[j]`，问题就变成：对每个右端点 `i`，在最近的 `m` 个前缀里找最小的 `pre[j]`。这正是滑动窗口最小值。

因此队列里维护的是前缀和下标，而且保持前缀和值递增。这样队首始终是当前窗口里最优的左端点。

### 核心代码

```cpp
for(int i=1;i<=n;i++){
  while(hh<=tt&&q[hh]<i-m) hh++;
  ans=max(ans,pre[i]-pre[q[hh]]);
  while(hh<=tt&&pre[q[tt]]>=pre[i]) tt--;
  q[++tt]=i;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 31. [1599：【 例 3】修剪草坪](http://ybt.ssoier.cn:8088/problem_show.php?pid=1599)

`算法提高篇` `提高(五)动态规划` `第5章 单调队列优化动规`

### 题意

选若干只奶牛使效率和最大，但不能出现长度超过 $K$ 的连续被选区间。

### 分析

与其直接限制“连续选了多少只”，不如反过来看每一段被选区间的前一个未选位置。设 `f[i]` 为前 `i` 只奶牛的最优值，那么如果最后一段从 `j+1` 开始一直选到 `i`，就得到

`f[i]=max(f[i-1], pre[i]+max(f[j-1]-pre[j]))`，其中 `j` 只能落在最近 `K` 个位置里。于是窗口中的最优量就是 `f[j-1]-pre[j]`。

### 核心代码

```cpp
g[0]=0; q[++tt]=0;
for(int i=1;i<=n;i++){
  while(hh<=tt&&q[hh]<i-k) hh++;
  f[i]=max(f[i-1],pre[i]+g[q[hh]]);
  g[i]=f[i-1]-pre[i];
  while(hh<=tt&&g[q[tt]]<=g[i]) tt--;
  q[++tt]=i;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 32. [1600：【例 4】旅行问题](http://ybt.ssoier.cn:8088/problem_show.php?pid=1600)

`算法提高篇` `提高(五)动态规划` `第5章 单调队列优化动规`

### 题意

环形公路上每站可取油，判断每个站能否顺时针或逆时针完整绕行一圈且过程中油量不为负。

### 分析

把顺时针的净收益写成 `p_i-d_i` 后，起点 `s` 可行等价于从 `s` 开始长度为 `n` 的所有前缀和都不低于起点前缀和。复制一遍数组后，这就是一个长度为 `n` 的滑动窗口最小值判断。

逆时针同理，只是把净收益改成 `p_i-d_{i-1}` 再做一次。两次有一次可行，这个站就是答案。

### 核心代码

```cpp
for(int i=1;i<=2*n;i++) sum[i]=sum[i-1]+gas[i]-dist[i];
for(int i=1;i<=2*n;i++){
  while(hh<=tt&&q[hh]<i-n) hh++;
  while(hh<=tt&&sum[q[tt]]>=sum[i]) tt--;
  q[++tt]=i;
  if(i>=n) ok[i-n+1]|=sum[q[hh]]>=sum[i-n];
}
// reverse array and do the same once more
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 33. [1601：【例 5】Banknotes](http://ybt.ssoier.cn:8088/problem_show.php?pid=1601)

`算法提高篇` `提高(五)动态规划` `第5章 单调队列优化动规`

### 题意

每种面值的硬币都有数量上限，要求凑出目标金额时硬币数最少。

### 分析

多重背包的瓶颈在于同一种硬币要枚举用了几张。按面值 `v` 的同余类拆开后，状态下标就变成一条直线：`r, r+v, r+2v, ...`。

在这条直线上，转移式是一个固定宽度窗口中的最小值，于是可以用单调队列维护 `dp[pos]-次数`。这正是多重背包单调队列优化的标准落点。

### 核心代码

```cpp
for(int r=0;r<v;r++){
  clear();
  for(int t=0;r+t*v<=K;t++){
    int pos=r+t*v;
    while(hh<=tt&&q[hh]<t-c) hh++;
    while(hh<=tt&&old[r+q[tt]*v]-q[tt]>=old[pos]-t) tt--;
    q[++tt]=t;
    dp[pos]=old[r+q[hh]*v]+t-q[hh];
  }
}
```

### 复杂度

时间复杂度 $O(nk)$，空间复杂度 $O(k)$。

---

## 34. [1602：烽火传递](http://ybt.ssoier.cn:8088/problem_show.php?pid=1602)

`算法提高篇` `提高(五)动态规划` `第5章 单调队列优化动规`

### 题意

在连续 $m$ 座烽火台中至少要有一座点火，求总费用最小。

### 分析

若第 `i` 座烽火台被选中，前一个被选中的位置必须落在 `[i-m,i-1]`，否则会出现一段长度为 `m` 的空窗。于是设 `dp[i]` 为最后一个被选位置正好是 `i` 的最小费用，就有一个固定窗口取最小的转移。

答案再从最后 `m` 个位置里取最小，因为结尾也不能留下长度为 `m` 的空窗。

### 核心代码

```cpp
dp[0]=0; q[++tt]=0;
for(int i=1;i<=n;i++){
  while(hh<=tt&&q[hh]<i-m) hh++;
  dp[i]=dp[q[hh]]+a[i];
  while(hh<=tt&&dp[q[tt]]>=dp[i]) tt--;
  q[++tt]=i;
}
for(int i=n-m+1;i<=n;i++) ans=min(ans,dp[i]);
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 35. [1603：绿色通道](http://ybt.ssoier.cn:8088/problem_show.php?pid=1603)

`算法提高篇` `提高(五)动态规划` `第5章 单调队列优化动规`

### 题意

题目总用时不能超过 $t$，希望最长连续空题段尽量短，要求这个最短可能值。

### 分析

答案是“最长空题段的上界”，天然可以二分。若假设最长空题段不能超过 `L`，就等价于在每段长度为 `L+1` 的区间里至少写一道题。

于是可行性检查和上一题几乎同型：设 `dp[i]` 为第 `i` 题被写时的最小耗时，则前一个被写的位置必须落在 `[i-L-1,i-1]`。窗口最小值用单调队列维护，最后看是否能在总时间内收尾。

### 核心代码

```cpp
bool check(int L){
  dp[0]=0; clear(); q[++tt]=0;
  for(int i=1;i<=n;i++){
    while(hh<=tt&&q[hh]<i-L-1) hh++;
    dp[i]=dp[q[hh]]+a[i];
    while(hh<=tt&&dp[q[tt]]>=dp[i]) tt--;
    q[++tt]=i;
  }
  long long best=INF; for(int i=max(0,n-L);i<=n;i++) best=min(best,dp[i]);
  return best<=T;
}
```

### 复杂度

单次检查时间复杂度 $O(n)$，总时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 36. [1604：理想的正方形](http://ybt.ssoier.cn:8088/problem_show.php?pid=1604)

`算法提高篇` `提高(五)动态规划` `第5章 单调队列优化动规`

### 题意

在矩阵中找一个 $n\times n$ 子正方形，使其中最大值与最小值之差最小。

### 分析

二维窗口最值的标准做法是拆成两遍一维。先对每一行做长度为 `n` 的滑动窗口最小值和最大值，得到横向压缩后的两个矩阵；再对这两个矩阵按列各做一次长度为 `n` 的窗口最值。

这样每个 `n\times n` 子矩阵的最小值和最大值都会在第二遍结束时同时就位。

### 核心代码

```cpp
for(int i=1;i<=a;i++){
  rowMin(i); rowMax(i);
}
for(int j=1;j<=b-n+1;j++){
  colMin(j,tmpMin,finalMin);
  colMax(j,tmpMax,finalMax);
}
ans=min(ans,finalMax[x][y]-finalMin[x][y]);
```

### 复杂度

时间复杂度 $O(ab)$，空间复杂度 $O(ab)$。

---

## 37. [1605：股票交易](http://ybt.ssoier.cn:8088/problem_show.php?pid=1605)

`算法提高篇` `提高(五)动态规划` `第5章 单调队列优化动规`

### 题意

每天可买卖股数有上限，两次交易之间至少间隔 $W$ 天，持仓也有上限。要求最终收益最大。

### 分析

设 `f[i][j]` 为第 `i` 天结束后持有 `j` 股的最大收益。若今天买入，前一次交易必须发生在 `i-W-1` 之前，于是买入转移变成区间内 `f[k][x]+x\times AP_i` 的最大值；卖出同理，维护的是 `f[k][x]+x\times BP_i`。

也就是说，对每一天来说，按持股数枚举时，前驱 `x` 只会落在一个固定宽度窗口里，所以能用单调队列优化。

### 核心代码

```cpp
for(int i=1;i<=T;i++){
  for(int j=0;j<=MaxP;j++) f[i][j]=max(f[i][j],f[i-1][j]);
  int k=max(0,i-W-1); clear();
  for(int j=0;j<=MaxP;j++){
    while(hh<=tt&&q[hh]<j-AS[i]) hh++;
    while(hh<=tt&&f[k][q[tt]]+1LL*q[tt]*AP[i]<=f[k][j]+1LL*j*AP[i]) tt--;
    q[++tt]=j; f[i][j]=max(f[i][j],f[k][q[hh]]+1LL*q[hh]*AP[i]-1LL*j*AP[i]);
  }
  clear();
  for(int j=MaxP;j>=0;j--){
    while(hh<=tt&&q[hh]>j+BS[i]) hh++;
    while(hh<=tt&&f[k][q[tt]]+1LL*q[tt]*BP[i]<=f[k][j]+1LL*j*BP[i]) tt--;
    q[++tt]=j; f[i][j]=max(f[i][j],f[k][q[hh]]+1LL*q[hh]*BP[i]-1LL*j*BP[i]);
  }
}
```

### 复杂度

时间复杂度 $O(T\cdot MaxP)$，空间复杂度 $O(T\cdot MaxP)$。

---

# 六、斜率优化与凸包决策

最后这一组题把“枚举断点”继续往下压。转移一旦长成线性函数的比较，真正该维护的就不再是所有决策，而是一条凸包。

## 38. [1606：【 例 1】任务安排 1](http://ybt.ssoier.cn:8088/problem_show.php?pid=1606)

`算法提高篇` `提高(五)动态规划` `第6章 斜率优化动态规划`

### 题意

任务顺序固定，可以分成若干连续批次，每批有启动时间 $S$。任务费用等于完成时刻乘费用系数，要求总费用最小。

### 分析

固定最后一批从 `j+1` 到 `i`，它们会在同一时刻完成，于是转移自然是“枚举最后一批从哪开始”。前缀和记下处理时间和费用系数后，朴素式子就是

`dp[i]=min(dp[j]+(st[i]-st[j]+S)(sc[n]-sc[j]))`。第一题数据不大，直接按这个式子枚举断点即可，重点是把批处理费用准确翻成前缀和。

### 核心代码

```cpp
for(int i=1;i<=n;i++){
  dp[i]=INF;
  for(int j=0;j<i;j++)
    dp[i]=min(dp[i],dp[j]+(st[i]-st[j]+S)*(sc[n]-sc[j]));
}
```

### 复杂度

时间复杂度 $O(n^2)$，空间复杂度 $O(n)$。

---

## 39. [1607：【 例 2】任务安排 2](http://ybt.ssoier.cn:8088/problem_show.php?pid=1607)

`算法提高篇` `提高(五)动态规划` `第6章 斜率优化动态规划`

### 题意

与上一题同模型，但数据范围更大，需要把枚举断点优化掉。

### 分析

上一题的转移里，`i` 只通过 `st[i]` 进入，并且对每个 `j` 都能整理成一条直线在 `x=st[i]` 处的取值。因为 `st[i]` 单调增加，查询顺序是单调的；而插入直线的斜率 `sc[n]-sc[j]` 也是单调的。

这就变成最标准的凸包队列：队首弹出不优直线，队尾维护下凸壳。

### 核心代码

```cpp
auto M=[&](int j){ return sc[n]-sc[j]; };
auto B=[&](int j){ return dp[j]+(S-st[j])*M(j); };
deque<int> q={0};
for(int i=1;i<=n;i++){
  while(q.size()>1&&M(q[0])*st[i]+B(q[0])>=M(q[1])*st[i]+B(q[1])) q.pop_front();
  int j=q.front(); dp[i]=M(j)*st[i]+B(j);
  while(q.size()>1&&cross(q[q.size()-2],q.back(),i)>=0) q.pop_back();
  q.push_back(i);
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 40. [1608：【 例 3】任务安排 3](http://ybt.ssoier.cn:8088/problem_show.php?pid=1608)

`算法提高篇` `提高(五)动态规划` `第6章 斜率优化动态规划`

### 题意

任务安排模型不变，但前缀时间不再保证单调，因此不能再直接用队首指针线性查询。

### 分析

直线集合仍然是同一批，只是查询横坐标 `st[i]` 失去单调性。于是优化思路不变，差别只在“怎么从凸包里找到当前最优直线”。

做法是维护按交点有序的凸包，然后对每次查询用二分或 Li Chao Tree 找到最优线。也就是说，这题的门槛不在推式子，而在认出“斜率优化仍成立，只是查询顺序变了”。

### 核心代码

```cpp
vector<int> hull={0};
for(int i=1;i<=n;i++){
  int p=best_line_by_binary_search(hull,st[i]);
  int j=hull[p]; dp[i]=M(j)*st[i]+B(j);
  while(hull.size()>1&&cross(hull[hull.size()-2],hull.back(),i)>=0) hull.pop_back();
  hull.push_back(i);
}
```

### 复杂度

时间复杂度 $O(n\log n)$，空间复杂度 $O(n)$。

---

## 41. [1609：【例 4】Cats Transport](http://ybt.ssoier.cn:8088/problem_show.php?pid=1609)

`算法提高篇` `提高(五)动态规划` `第6章 斜率优化动态规划`

### 题意

把猫按等待时间等价变换后，用 $P$ 个饲养员去覆盖，要求总等待时间最小。

### 分析

关键变换是把每只猫改写成 `a_i=T_i-dist[H_i]`，再按 `a_i` 排序。这样若某个饲养员负责一段连续猫，它们的总代价就只和这段的端点有关，题目就转成经典分组 DP。

设 `dp[p][i]` 为前 `i` 只猫用 `p` 个饲养员的最小代价，最后一组从 `j+1` 开始时可写成线性函数比较，于是每一层都能用凸包优化。

### 核心代码

```cpp
for(int p=1;p<=P;p++){
  clear(); q[++tt]=0;
  for(int i=1;i<=M;i++){
    while(hh<tt&&value(q[hh],a[i])>=value(q[hh+1],a[i])) hh++;
    int j=q[hh]; dp[p][i]=pre[i]+calc(p-1,j)-pre[j]-1LL*(i-j)*a[i];
    while(hh<tt&&bad(q[tt-1],q[tt],i,p-1)) tt--;
    q[++tt]=i;
  }
}
```

### 复杂度

时间复杂度 $O(PM)$，空间复杂度 $O(M)$。

---

## 42. [1610：玩具装箱](http://ybt.ssoier.cn:8088/problem_show.php?pid=1610)

`算法提高篇` `提高(五)动态规划` `第6章 斜率优化动态规划`

### 题意

把连续编号的玩具装进若干容器，容器长度偏离常数 $L$ 的平方就是费用，要求总费用最小。

### 分析

设 `s[i]=\sum_{k=1}^i C_k+i`，则把 `j+1..i` 放进同一容器的长度就能写成 `s[i]-s[j]-1`，对应费用是一个标准二次式。于是转移变为

`dp[i]=min(dp[j]+(s[i]-s[j]-L-1)^2)`，典型到不能再典型的斜率优化模板。因为 `s[i]` 单调，直接用单调队列维护下凸壳即可。

### 核心代码

```cpp
auto X=[&](int j){ return s[j]; };
auto Y=[&](int j){ return dp[j]+(s[j]+L+1)*(s[j]+L+1); };
for(int i=1;i<=n;i++){
  while(hh<tt&&slope(q[hh],q[hh+1])<=2*s[i]) hh++;
  int j=q[hh]; dp[i]=dp_eval(j,i);
  while(hh<tt&&cross(q[tt-1],q[tt],i)>=0) tt--;
  q[++tt]=i;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 43. [1611：仓库建设](http://ybt.ssoier.cn:8088/problem_show.php?pid=1611)

`算法提高篇` `提高(五)动态规划` `第6章 斜率优化动态规划`

### 题意

工厂沿山路排开，产品只能往山下运。每个点建仓有固定费用，要求建仓加运输总费用最小。

### 分析

若最后一个覆盖到 `i` 的仓库就建在 `i`，那么在它上面的那一段工厂都会把货送到 `i`，这一段费用可以用产品数和位置的前缀和写成线性式。

于是设 `dp[i]` 为在 `i` 建仓并覆盖前 `i` 个工厂的最小费用，有 `dp[i]=C_i+X_iP_{i-1}-XP_{i-1}+min(dp[j]+XP_j-X_iP_j)`。这已经是标准直线查询。

### 核心代码

```cpp
auto M=[&](int j){ return -P[j]; };
auto B=[&](int j){ return dp[j]+XP[j]; };
q[++tt]=0;
for(int i=1;i<=n;i++){
  while(hh<tt&&M(q[hh])*X[i]+B(q[hh])>=M(q[hh+1])*X[i]+B(q[hh+1])) hh++;
  int j=q[hh]; dp[i]=C[i]+X[i]*P[i-1]-XP[i-1]+M(j)*X[i]+B(j);
  while(hh<tt&&cross(q[tt-1],q[tt],i)>=0) tt--;
  q[++tt]=i;
}
ans=dp[n];
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 44. [1612：特别行动队](http://ybt.ssoier.cn:8088/problem_show.php?pid=1612)

`算法提高篇` `提高(五)动态规划` `第6章 斜率优化动态规划`

### 题意

把士兵划成若干连续小队，每队战斗力和经过一个开口向下的二次函数修正，要求总修正值最大。

### 分析

若最后一队是 `j+1..i`，其原始战斗力就是前缀和差 `s[i]-s[j]`。直接展开 `dp[i]=max(dp[j]+a(s[i]-s[j])^2+b(s[i]-s[j])+c)` 后，会得到一条关于 `s[i]` 的直线查询。

因为 `a<0`，我们维护的是上凸壳，思路和求最小值完全对称。

### 核心代码

```cpp
auto M=[&](int j){ return -2*a*s[j]; };
auto B=[&](int j){ return dp[j]+a*s[j]*s[j]-b*s[j]; };
q[++tt]=0;
for(int i=1;i<=n;i++){
  while(hh<tt&&M(q[hh])*s[i]+B(q[hh])<=M(q[hh+1])*s[i]+B(q[hh+1])) hh++;
  int j=q[hh]; dp[i]=a*s[i]*s[i]+b*s[i]+c+M(j)*s[i]+B(j);
  while(hh<tt&&cross(q[tt-1],q[tt],i)<=0) tt--;
  q[++tt]=i;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 45. [1613：打印文章](http://ybt.ssoier.cn:8088/problem_show.php?pid=1613)

`算法提高篇` `提高(五)动态规划` `第6章 斜率优化动态规划`

### 题意

把单词划成若干连续段，每段代价为该段权值和的平方再加常数 $M$，要求总费用最小。

### 分析

这题和玩具装箱是同一模版：设前缀和为 `s[i]`，则最后一段从 `j+1` 到 `i` 的代价是 `(s[i]-s[j])^2+M`。把平方展开后，`j` 仍然只对应一条直线。

所以真正的工作只有两步：先识别出“分段 + 平方代价”的模式，再把式子整理成凸包查询。

### 核心代码

```cpp
auto Mx=[&](int j){ return -2*s[j]; };
auto By=[&](int j){ return dp[j]+s[j]*s[j]; };
q[++tt]=0;
for(int i=1;i<=n;i++){
  while(hh<tt&&Mx(q[hh])*s[i]+By(q[hh])>=Mx(q[hh+1])*s[i]+By(q[hh+1])) hh++;
  int j=q[hh]; dp[i]=s[i]*s[i]+M+Mx(j)*s[i]+By(j);
  while(hh<tt&&cross(q[tt-1],q[tt],i)>=0) tt--;
  q[++tt]=i;
}
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---

## 46. [1614：锯木厂选址](http://ybt.ssoier.cn:8088/problem_show.php?pid=1614)

`算法提高篇` `提高(五)动态规划` `第6章 斜率优化动态规划`

### 题意

山路上有 $n$ 棵树，木材只能往山下运。山脚已有一个锯木厂，还能再新建两个，要求运输总费用最小。

### 分析

固定一段树最终送到某个新建锯木厂时，这一段的代价和仓库建设是同一类前缀和式子。区别只在于这里没有建造费用，但需要做三段划分：两个新厂加上山脚已有的一个厂。

于是设 `dp[t][i]` 为前 `i` 棵树已经用了 `t` 个新厂、且第 `t` 个新厂建在 `i` 的最小费用。每一层转移都还是直线查询，最后再把尾段送到山脚即可。

### 核心代码

```cpp
for(int t=1;t<=2;t++){
  clear(); q[++tt]=0;
  for(int i=1;i<=n;i++){
    while(hh<tt&&value(q[hh],X[i],t-1)>=value(q[hh+1],X[i],t-1)) hh++;
    int j=q[hh]; dp[t][i]=X[i]*(W[i-1]-W[j])-(WX[i-1]-WX[j])+dp[t-1][j];
    while(hh<tt&&bad(q[tt-1],q[tt],i,t-1)) tt--;
    q[++tt]=i;
  }
}
for(int i=0;i<=n;i++) ans=min(ans,dp[2][i]+WX[n]-WX[i]-X[i]*(W[n]-W[i]));
```

### 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

---
