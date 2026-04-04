---
title: "洛谷 树上算法专题精选解题报告"
subtitle: "🌲 从直径、LCA 到 DSU on Tree 与基环树的树上算法主线"
order: 2
icon: "🌴"
---

# 洛谷 树上算法专题精选解题报告

这一组题从树的直径一路走到 LCA、DSU on Tree、树链剖分，再延伸到仙人掌和基环树，核心一直是把“树上关系”压成可递推、可倍增或可剖分的结构。前半段偏经典性质，后半段则开始处理稀疏环和更复杂的树上维护。

# 一、树的直径

先把树的直径、树心和动态直径这条线打通，很多树上最远点问题都能往这里归。

## 1. [P3000 \[USACO10DEC\] Cow Calisthenics G](https://www.luogu.com.cn/problem/P3000)

`树的直径` `二分` `树形 DP`

### 题意

给定一棵边长全为 1 的树，可以封锁 $S$ 条边把树切成 $S+1$ 个连通块。要求让所有连通块直径的最大值尽量小。

### 分析

二分答案 `D` 后，在树上自底向上贪心合并子链：若两条向下最长链长度和超过 `D`，就必须在对应边处切断。统计最少需要切多少条边，判断是否不超过 `S` 即可。

### 核心代码

```cpp
int need=0;
int dfs(int u,int fa){
    vector<int> len;
    for(int v:adj[u]) if(v!=fa) len.push_back(dfs(v,u)+1);
    sort(len.begin(),len.end());
    while(len.size()>=2&&len.back()+len[len.size()-2]>mid)
        need++, len.erase(len.end()-1);
    return len.empty()?0:len.back();
}
```

### 复杂度

$O(n\log n\log n)$。

---

## 2. [P6845 \[CEOI 2019\] Dynamic Diameter](https://www.luogu.com.cn/problem/P6845)

`树的直径` `线段树` `动态维护`

### 题意

树上边权会被在线修改，要求在每次修改后立刻输出当前树直径的长度。

### 分析

静态直径常见做法是两次 DFS，但动态改单边权后显然不能每次重跑。真正该想的是：如果把树压成若干可合并的链段，一个区间能否像“括号合并”那样保存足够的信息，让父区间也能算出直径？

答案就是维护四个量：整段权和、从左端出发的最远距离、从右端出发的最远距离、整段内部直径。这样两个相邻区间一合并，跨越中点的新直径只可能来自“左段右端最远 + 右段左端最远”，于是信息可以自底向上递推。

所以这题最重要的不是具体剖法，而是这种区间抽象：**只要能把一段树链概括成少量可合并信息，动态直径就能转成线段树维护。**

### 核心代码

```cpp
struct Info{long long lmx,rmx,dia,sum;};
Info merge(Info a,Info b){
    return {max(a.lmx,a.sum+b.lmx),max(b.rmx,b.sum+a.rmx),
            max({a.dia,b.dia,a.rmx+b.lmx}),a.sum+b.sum};
}
modify(pos[id],nw-old);
cout<<seg[1].dia;
```

### 复杂度

$O((n+q)\log n)$。

---

## 3. [P4271 \[USACO18FEB\] New Barns P](https://www.luogu.com.cn/problem/P4271)

`树的直径` `LCA` `动态树`

### 题意

初始没有节点，操作 `B p` 表示新建一个点并连到 `p`，操作 `Q k` 询问当前连通块内离 `k` 最远点的距离。

### 分析

这题最关键的结论是：对一棵树中的任意点 `x`，离它最远的点一定是某条直径的一个端点。于是一个连通块真正需要长期维护的，并不是很多候选点，而只是它当前直径的两个端点。

新点加入时也很好理解：它只连出一条新边，因此新直径若发生变化，一端一定是这个新点，另一端只可能是原直径的某个端点。查询某个点 `k` 时，同样不用枚举全块，直接比较它到两个端点的距离较大者即可。

所以这题很值得形成一个树上最远点模板：**维护直径端点，查询最远距离时只看这两个端点。**

### 核心代码

```cpp
void add_node(int p,int x){
    fa[x][0]=p; dep[x]=dep[p]+1;
    auto &t=endp[find(x)];
    if(dist(t.first,t.second)<dist(t.first,x)) t.second=x;
    if(dist(t.first,t.second)<dist(t.second,x)) t.first=x;
}
int query(int x){
    auto [a,b]=endp[find(x)];
    return max(dist(x,a),dist(x,b));
}
```

### 复杂度

$O((n+q)\log n)$。

---

## 4. [P2971 \[USACO10HOL\] Cow Politics G](https://www.luogu.com.cn/problem/P2971)

`树的直径` `LCA` `分类讨论`

### 题意

树上每头奶牛属于某个政党。对每个政党，需要求出该政党内任意两头奶牛之间最远距离，也就是该党覆盖点集的直径。

### 分析

同一颜色点集的直径可以通过两次“找最远点”完成：先按 DFS 序把同色点取出，利用 LCA 计算距离，从任取一点找到最远点 `A`，再从 `A` 找到最远点 `B`，$dist(A,B)$ 就是答案。

### 核心代码

```cpp
int farthest(int s,vector<int>& vec){
    int best=s;
    for(int x:vec) if(dist(s,x)>dist(s,best)) best=x;
    return best;
}
for(auto &[c,vec]:bucket){
    int a=farthest(vec[0],vec);
    int b=farthest(a,vec);
    ans[c]=dist(a,b);
}
```

### 复杂度

$O(n\log n)$。

---

## 5. [P6118 \[JOI 2019 Final\] 独特的城市 / Unique Cities](https://www.luogu.com.cn/problem/P6118)

`树的直径` `树形 DP`

### 题意

对每个城市 `x`，把与 `x` 距离相同的城市视为同一层，只有某个距离上唯一出现的城市才算 `x` 的“独特城市”。题目要求统计这些独特城市能产出的特产种类数。

### 分析

树上某一层是否只有一个点，本质受离 `x` 最远的几个方向控制。先用两次 DFS 维护每个点向各个子树和父侧的最远距离，再据此判断哪些距离层只由一条直径链贡献，最后统计对应颜色即可。

### 核心代码

```cpp
dfs1(1,0); dfs2(1,0);
for(int x=1;x<=n;x++){
    clear(cnt);
    for(auto [d,col]:layers[x]) if(freq[x][d]==1) cnt.insert(col);
    ans[x]=cnt.size();
}
```

### 复杂度

$O(n\log n)$。

---

## 6. [P3761 \[TJOI2017\] 城市](https://www.luogu.com.cn/problem/P3761)

`树的直径` `枚举` `DP`

### 题意

树上允许删掉一条边并用同权值新边重新连接两部分，要求重建后整棵树的最大两点距离尽量小。

### 分析

删掉一条边会把树分成两棵树，分别只需关心各自的直径和半径。枚举断边时，合并后的最优直径是 $\max(d_1,d_2,r_1+w+r_2)$，其中 $r$ 是树半径，于是预处理每条边两侧的信息后枚举即可。

### 核心代码

```cpp
for(auto [u,v,w,id]:edges){
    int a=part_dia[id][0], b=part_dia[id][1];
    int ra=(a+1)/2, rb=(b+1)/2;
    ans=min(ans,max({a,b,ra+w+rb}));
}
```

### 复杂度

$O(n\log n)$。

---

## 7. [P2195 HXY造公园](https://www.luogu.com.cn/problem/P2195)

`并查集` `树的直径`

### 题意

公园最初是森林，支持两种操作：询问某点所在连通块的最长路径长度，以及把两个连通块用一条边最优连接后更新结构。

### 分析

每个连通块只需要维护直径。把两棵树用一条边连起来后，新直径是 $\max\!\left(d_1,d_2,\left\lceil \frac{d_1}{2} \right\rceil+\left\lceil \frac{d_2}{2} \right\rceil+1\right)$，并查集合并时按这个公式更新即可。

### 核心代码

```cpp
int find(int x){ return fa[x]==x?x:fa[x]=find(fa[x]); }
void merge(int x,int y){
    x=find(x), y=find(y);
    if(x==y) return;
    fa[x]=y;
    dia[y]=max({dia[x],dia[y],(dia[x]+1)/2+(dia[y]+1)/2+1});
}
```

### 复杂度

$O((n+q)\alpha(n))$。

---

## 8. [P4408 \[NOI2003\] 逃学的小孩 / 数据生成器](https://www.luogu.com.cn/problem/P4408)

`树形 DP` `LCA` `树的直径`

### 题意

Chris 只可能躲在朋友 `A` 或 `B` 家里，父母从 `C` 出发，按“先去离 `C` 更近的那个，再去另一个”的策略找人。要求求出在最坏情况下找到 Chris 所需的最短时间。

### 分析

最坏情况下父母会把连接 `A,B,C` 的最小连通子树整段走完一次。树上三点 Steiner 树长度恰好是 $\frac{dis(A,B)+dis(B,C)+dis(C,A)}{2}$，因此求三次距离即可。

### 核心代码

```cpp
int lca(int u,int v);
long long dist(int u,int v){
    int p=lca(u,v);
    return depw[u]+depw[v]-2*depw[p];
}
long long ans=(dist(A,B)+dist(B,C)+dist(C,A))/2;
```

### 复杂度

$O(\log n)$。

---

## 9. [P2610 \[ZJOI2012\] 旅游](https://www.luogu.com.cn/problem/P2610)

`树的直径` `对偶图`

### 题意

凸 `n` 边形被三角剖分成 `n-2` 个城市，旅游路线是一条连接两个不相邻边界点的线段。要求让路线经过的三角形数量尽量多。

### 分析

把每个三角形看成一个点、公共边看成连边，得到一棵对偶树。任意一条合法线段对应对偶树上的一条简单路径，因此最多经过多少城市，本质上就是这棵对偶树的直径长度加一。

### 核心代码

```cpp
int bfs(int s){
    queue<int> q; q.push(s); dist[s]=0;
    while(!q.empty()){
        int u=q.front(); q.pop();
        for(int v:adj[u]) if(dist[v]==-1)
            dist[v]=dist[u]+1,q.push(v);
    }
    return max_element(dist+1,dist+tot+1)-dist;
}
int a=bfs(1), b=bfs(a);
ans=dist[b]+1;
```

### 复杂度

$O(n)$。

---

## 10. [CF911F Tree Destruction](https://www.luogu.com.cn/problem/CF911F)

`树的直径` `贪心` `构造`

### 题意

每次选择两片叶子，把它们距离加到答案中并删除其中一个叶子。要求构造删除顺序，使最终总得分最大。

### 分析

最优策略始终围绕当前直径的两个端点操作。先求出整棵树的直径端点 `s,t`，再把所有非直径点贪心地挂到离它更远的端点上删除，最后沿直径链依次向两端收缩即可。

### 核心代码

```cpp
auto [s,t]=diameter();
dfs_mark_path(s,t);
for(int u=1;u<=n;u++) if(!on_path[u]){
    int x=(dist(u,s)>dist(u,t)?s:t);
    ans+=max(dist(u,s),dist(u,t));
    op.push_back({u,x,u});
}
shrink_path(s,t);
```

### 复杂度

$O(n)$。

---

## 11. [AT_agc001_c \[AGC001C\] Shorten Diameter](https://www.luogu.com.cn/problem/AT_agc001_c)

`树的直径` `枚举中心`

### 题意

允许删除若干点，但每次删除后剩余图仍需连通。要求删点数最少，使剩余树的直径不超过 $K$。

### 分析

若 $K$ 为偶数，保留下来的树一定有一个中心点；若 $K$ 为奇数，则中心是一条边。枚举中心点或中心边，只保留距离中心不超过 $\left\lfloor \frac{K}{2} \right\rfloor$ 的点，删去其余点即可。

### 核心代码

```cpp
int ans=n;
if(K&1){
    for(auto [u,v]:edges){
        bfs2(u,v); ans=min(ans,count_far(K/2));
    }
}else{
    for(int c=1;c<=n;c++){
        bfs1(c); ans=min(ans,count_far(K/2));
    }
}
```

### 复杂度

$O(n^2)$。

---

## 12. [P3629 \[APIO2010\] 巡逻](https://www.luogu.com.cn/problem/P3629)

`树的直径` `贪心`

### 题意

警车每天要从 `1` 出发巡逻所有边再回到 `1`。允许额外修建 1 或 2 条边，要求使巡逻总路程最短。

### 分析

原始代价是 `2(n-1)`。加一条边时，可以把树上一条最长简单路径变成环，从而少走 `直径-1`；加两条边时，再把删掉第一条直径后的残余树求一次直径，继续减少第二段。

### 核心代码

```cpp
int d1=diameter(tree);
if(k==1) ans=2*(n-1)-d1+1;
else{
    mark_first_diameter();
    int d2=diameter(tree_with_neg_edges);
    ans=2*(n-1)-d1-d2+2;
}
```

### 复杂度

$O(n)$。

---

## 13. [P2491 \[SDOI2011\] 消防](https://www.luogu.com.cn/problem/P2491)

`树的直径` `二分` `滑动窗口`

### 题意

允许在树上一段总长度不超过 `s` 的路径上建设消防枢纽，要求最小化所有城市到这段路径的最大距离。

### 分析

最优路径一定落在某条直径上。先求直径并把点按顺序拉成一条链，再二分答案，用双指针维护链上长度不超过 `s` 的区间，同时检查区间外两端和侧枝的最大距离是否都不超过当前答案。

### 核心代码

```cpp
get_diameter_path();
bool check(long long lim){
    int l=1;
    for(int r=1;r<=m;r++){
        while(pre[r]-pre[l]>S) l++;
        if(max({left_far[l],right_far[r],side_max(l,r)})<=lim) return true;
    }
    return false;
}
```

### 复杂度

$O(n\log n)$。

---

## 14. [P1099 \[NOIP 2007 提高组\] 树网的核](https://www.luogu.com.cn/problem/P1099)

`树的直径` `滑动窗口`

### 题意

要求在某条直径上截取一段长度不超过 `s` 的路径 `F`，使整棵树到 `F` 的最大距离最小，也就是求树网的核。

### 分析

树核一定在直径上。把直径剖成链以后，预处理每个直径点向外分支的最远距离，再用双指针枚举满足长度约束的链段，答案就是“链外两端距离”和“侧枝最大深度”的最大值最小化。

### 核心代码

```cpp
build_diameter();
int l=1;
for(int r=1;r<=tot;r++){
    while(pre[r]-pre[l]>S) l++;
    ans=min(ans,max({pre[l-1],pre[tot]-pre[r],mx_branch(l,r)}));
}
```

### 复杂度

$O(n)$。

---

## 15. [P3304 \[SDOI2013\] 直径](https://www.luogu.com.cn/problem/P3304)

`树的直径` `树形 DP`

### 题意

给定一棵带权树，要求输出直径长度，以及有多少条边被所有直径共同经过。

### 分析

先求出一条直径 `s-t` 并把这条链拉出来。链上每个点向外分支的最大深度若会制造新的直径端点，就会打破“所有直径都经过某边”的性质；因此只需在直径链上找出两端唯一可行的公共区间长度。

### 核心代码

```cpp
auto [s,t]=diameter();
get_path(s,t,diam);
for(int x:diam) calc_branch_depth(x);
int L=leftmost_must_pass(), R=rightmost_must_pass();
cout<<dist(s,t)<<" "<<max(0,R-L);
```

### 复杂度

$O(n)$。

---

## 16. [B4016 树的直径](https://www.luogu.com.cn/problem/B4016)

`树的直径` `模板`

### 题意

给定一棵无权树，要求输出树上最长简单路径的长度，也就是树的直径。

### 分析

这道模板题最重要的不是背“两遍 BFS”，而是理解为什么第一遍随便找出的最远点一定能落到某条直径端点上。直观地说，若从任意点 `x` 出发走到最远点 `s`，那么 `s` 不可能还在某条最长路径的中间，否则沿着那条最长路径往更远端走还能更远，和“最远点”矛盾。

一旦拿到一个直径端点，第二遍从它出发找到的最远点 `t`，就自然是另一端，因为树上最长简单路径一定把两个最远端点连起来。所以两次 BFS / DFS 的本质其实是：**先定位一端，再从这一端把整条最长链拉出来。**

### 核心代码

```cpp
int bfs(int s){
    queue<int> q; q.push(s); fill(dis,dis+n+1,-1); dis[s]=0;
    while(!q.empty()){
        int u=q.front(); q.pop();
        for(int v:adj[u]) if(dis[v]==-1) dis[v]=dis[u]+1,q.push(v);
    }
    return max_element(dis+1,dis+n+1)-dis;
}
int s=bfs(1), t=bfs(s);
cout<<dis[t];
```

### 复杂度

$O(n)$。

---

# 二、树上启发式合并（DSU on Tree）

这一组题都在做“子树信息统计”，核心套路是轻儿子清空、重儿子保留。

## 17. [CF1009F Dominant Indices](https://www.luogu.com.cn/problem/CF1009F)

`DSU on Tree` `树上统计`

### 题意

对每个节点 `x`，定义 $d_{x,i}$ 为其子树中与 `x` 距离为 `i` 的节点数。要求找出使 $d_{x,i}$ 最大的最小下标 `i`。

### 分析

这题最难的地方不是答案形式，而是如果对每个点都重新统计一遍子树深度分布，会立刻退化成平方级。真正该抓住的是：父节点的答案，本质上就是把所有儿子子树的“深度计数桶”往上平移一层后合并。

DSU on Tree 正是为这种“每个点都要看子树统计分布”的题准备的。重儿子的桶保留下来继续复用，轻儿子的桶只在需要时暴力加入，再在退出时清空。这样每个轻子树的信息只会被搬运较少次数，总复杂度才能压住。

合并时顺手维护“当前最大出现次数”和“对应的最小深度偏移”，就能一边加桶一边得到答案。所以这题最值得迁移的是：**当每个点都要看子树频率分布时，优先考虑 DSU on Tree 的‘重保留、轻重建’。**

### 核心代码

```cpp
void add(int u,int fa,int top,int val){
    cnt[dep[u]-top]+=val;
    upd(dep[u]-top);
    for(int v:son[u]) if(v!=fa&&!big[v]) add(v,u,top,val);
}
void dfs(int u,int fa,bool keep){
    for(int v:son[u]) if(v!=fa&&v!=heavy[u]) dfs(v,u,0);
    if(heavy[u]) dfs(heavy[u],u,1), big[heavy[u]]=1;
    add(u,fa,dep[u],1); ans[u]=best_dep;
    if(heavy[u]) big[heavy[u]]=0;
    if(!keep) add(u,fa,dep[u],-1), clear_best();
}
```

### 复杂度

$O(n\log n)$。

---

## 18. [P5903 【模板】树上 K 级祖先](https://www.luogu.com.cn/problem/P5903)

`倍增` `树上查询`

### 题意

给定一棵有根树和大量随机生成的询问 `(x,k)`，要求输出点 `x` 的第 `k` 级祖先。

### 分析

第 `k` 级祖先这个问题最自然的想法，就是不要一次一次往上爬，而是把“往上跳很多步”拆成若干次 2 的幂跳跃。因为任意整数 `k` 都能写成二进制和，这就提示我们预处理 $2^j$ 级祖先。

于是 `fa[u][j]` 的含义非常统一：从 `u` 出发往上跳 $2^j$ 步会到哪里。查询时把 `k` 按二进制展开，哪一位是 `1` 就执行一次对应大小的跳跃；若中途已经跳到 `0`，说明祖先不存在。

所以这道模板题最该记住的不是表怎么开，而是思路本身：**大步跳祖先 = 把步数二进制拆分，再复用预处理好的倍增表。**

### 核心代码

```cpp
void dfs(int u){
    for(int j=1;j<LOG;j++) fa[u][j]=fa[fa[u][j-1]][j-1];
    for(int v:son[u]) dep[v]=dep[u]+1,fa[v][0]=u,dfs(v);
}
int kth(int x,int k){
    for(int j=0;j<LOG;j++) if(k>>j&1) x=fa[x][j];
    return x;
}
```

### 复杂度

$O((n+q)\log n)$。

---

## 19. [P5904 \[POI 2014\] HOT-Hotels 加强版](https://www.luogu.com.cn/problem/P5904)

`DSU on Tree` `树上统计`

### 题意

给定一棵树，要求统计有多少组三元组 `(i,j,k)` 满足三点两两之间的距离都相等。

### 分析

等边三元组一定以某个点或某条边为中心。以节点为中心时，只需要统计不同子树里相同深度的点数，DSU on Tree 保留重儿子桶、合并轻儿子桶时就能顺手累计这些组合数。

### 核心代码

```cpp
void calc(int u,int fa,int top,int sign){
    for(int x:sub[u]){
        ans+=1LL*sign*cnt[dep[x]-top]*sum[dep[x]-top];
    }
    for(int x:sub[u]){
        cnt[dep[x]-top]++, sum[dep[x]-top]+=size_sub[x];
    }
}
void dfs(int u,int fa){
    for(int v:adj[u]) if(v!=fa&&v!=heavy[u]) dfs(v,u);
    if(heavy[u]) dfs(heavy[u],u);
    for(int v:adj[u]) if(v!=fa&&v!=heavy[u]) calc(v,u,dep[u],1);
}
```

### 复杂度

$O(n\log n)$。

---

## 20. [P4292 \[WC2010\] 重建计划](https://www.luogu.com.cn/problem/P4292)

`树形 DP` `分数规划` `树上路径`

### 题意

给定一棵边有价值的树，要求在边数 $L\sim U$ 之间选择一条简单路径，使其平均边权最大。

### 分析

二分平均值 `mid`，把每条边权改成 `w-mid`，问题就变成“是否存在长度在 $[L,U]$ 内、总和非负的路径”。树上合并子树时维护每个长度的最佳链值，并用单调队列优化长度窗口。

### 核心代码

```cpp
bool check(double mid){
    for(auto &e:edges) val[e.id]=e.w-mid;
    dfs(u,fa);
    return best_path>=0;
}
void merge(int u,int v){
    for(int i=1;i<=len[u];i++)
        ans=max(ans,f[u][i]+best_in_range(g[v],L-i,U-i));
}
```

### 复杂度

$O(n\log^2 n\log V)$。

---

## 21. [P3899 \[湖南集训\] 更为厉害](https://www.luogu.com.cn/problem/P3899)

`DSU on Tree` `树上统计`

### 题意

每次询问给定节点 `p` 和常数 `k`，要求统计有序三元组 `(a,b,c)` 的个数，其中 $a=p$，且 $a,b$ 都是 $c$ 的祖先，同时 `a` 与 `b` 的距离不超过 `k`。

### 分析

固定 `a=p` 后，真正变化的是子树内各深度层的点数。DSU on Tree 维护当前子树的深度计数与前缀和，就能在合并轻儿子时快速统计满足距离限制的 $b,c$ 组合数。

### 核心代码

```cpp
void add(int u,int fa,int val){
    bit.add(dep[u],val);
    for(int v:adj[u]) if(v!=fa&&!big[v]) add(v,u,val);
}
void solve(int u,int fa,bool keep){
    for(int v:adj[u]) if(v!=fa&&v!=heavy[u]) solve(v,u,0);
    if(heavy[u]) solve(heavy[u],u,1), big[heavy[u]]=1;
    for(auto [k,id]:qry[u]) ans[id]=query_range(dep[u],k);
    add(u,fa,1);
    if(heavy[u]) big[heavy[u]]=0;
    if(!keep) add(u,fa,-1);
}
```

### 复杂度

$O((n+q)\log^2 n)$。

---

## 22. [CF1709E XOR Tree](https://www.luogu.com.cn/problem/CF1709E)

`DSU on Tree` `异或`

### 题意

树上每个点有权值，可以把某些点修改成任意正整数。要求最少修改多少次，才能让整棵树中不存在异或和为 `0` 的简单路径。

### 分析

设 `xor[u]` 为根到 `u` 的前缀异或。若某子树内出现两点的前缀异或在当前根语境下冲突，就说明存在异或和为 0 的路径，此时最优是直接在当前节点切一刀并清空整棵子树的信息。DSU on Tree 可以高效判断并合并这些集合。

### 核心代码

```cpp
set<int>* dfs(int u,int fa){
    auto *S=new set<int>{xr[u]};
    for(int v:adj[u]) if(v!=fa){
        auto *T=dfs(v,u);
        if(T==nullptr) continue;
        if(S->size()<T->size()) swap(S,T);
        for(int x:*T) if(S->count(x^a[u])) bad=1;
        for(int x:*T) S->insert(x);
    }
    if(bad) ans++, S->clear(), S->insert(xr[u]);
    return S;
}
```

### 复杂度

$O(n\log^2 n)$。

---

## 23. [CF741D Arpa’s letter-marked tree and Mehrdad’s Dokhtar-kosh paths](https://www.luogu.com.cn/problem/CF741D)

`DSU on Tree` `位运算` `树上统计`

### 题意

边上带字母的有根树中，要求对每个节点求出其子树内一条最长路径长度，使路径字母串能重排成回文串。

### 分析

一条路径能重排成回文，当且仅当其字母奇偶掩码至多有一位为 1。以节点为分治中心时，维护子树中每种掩码的最大深度；合并轻儿子时既要枚举当前掩码 `mask`，也要枚举“把第 `c` 位翻转后的掩码” `mask ^ (1 << c)`，这样就能检查是否只差一个字符出现次数为奇数，从而更新答案。

### 核心代码

```cpp
void upd(int u,int fa,int top,int val){
    ans[top]=max(ans[top],dep[u]+best[mask[u]]);
    for(int b=0;b<22;b++) ans[top]=max(ans[top],dep[u]+best[mask[u]^(1<<b)]);
    for(int v:adj[u]) if(v!=fa&&!big[v]) upd(v,u,top,val);
}
void add(int u,int fa){
    best[mask[u]]=max(best[mask[u]],dep[u]);
    for(int v:adj[u]) if(v!=fa&&!big[v]) add(v,u);
}
```

### 复杂度

$O(n\log n\cdot \Sigma)$。

---

## 24. [CF600E Lomsat gelral](https://www.luogu.com.cn/problem/CF600E)

`DSU on Tree` `颜色统计`

### 题意

对每个节点 `v`，要求统计其子树中出现次数最多的颜色编号之和。

### 分析

仍是启发式合并模板。维护颜色出现次数 `cnt[c]`、当前最高频 `mx` 与达到最高频的颜色和 `sum`；保留重儿子桶，再把轻儿子的颜色贡献逐个并进来即可。

### 核心代码

```cpp
void add(int u,int fa,int val){
    int c=col[u];
    cnt[c]+=val;
    if(cnt[c]>mx) mx=cnt[c],sum=c;
    else if(cnt[c]==mx) sum+=c;
    for(int v:adj[u]) if(v!=fa&&!big[v]) add(v,u,val);
}
void dfs(int u,int fa,bool keep){ /* DSU on Tree 模板 */ }
```

### 复杂度

$O(n\log n)$。

---

## 25. [U41492 树上数颜色](https://www.luogu.com.cn/problem/U41492)

`DSU on Tree` `颜色统计`

### 题意

给定一棵以 `1` 为根的树和多次子树询问，要求回答每个节点子树内不同颜色的种类数。

### 分析

对子树颜色去重最适合用 DSU on Tree。保留重儿子的颜色桶，轻儿子暴力加入/删除；当桶里某颜色计数从 `0` 变成 `1` 时种类数加一，反之减一。

### 核心代码

```cpp
void add(int u,int fa,int val){
    if((cnt[col[u]]+=val)==1) kind++;
    if(!cnt[col[u]]) kind--;
    for(int v:adj[u]) if(v!=fa&&!big[v]) add(v,u,val);
}
void dfs(int u,int fa,bool keep){
    for(int v:adj[u]) if(v!=fa&&v!=heavy[u]) dfs(v,u,0);
    if(heavy[u]) dfs(heavy[u],u,1), big[heavy[u]]=1;
    add(u,fa,1); ans[u]=kind;
    if(heavy[u]) big[heavy[u]]=0;
    if(!keep) add(u,fa,-1), kind=0;
}
```

### 复杂度

$O(n\log n)$。

---

# 三、仙人掌与基环树

图里只要环很稀疏，就可以想圆方树、基环树和环上 DP，把一般图拆回树结构。

## 26. [P5236 【模板】静态仙人掌](https://www.luogu.com.cn/problem/P5236)

`仙人掌` `LCA` `最短路`

### 题意

给定一张静态仙人掌图和多组询问，每次要求输出两点之间的最短路长度。

### 分析

仙人掌最难的地方，是图里既有树边又有环，普通树上距离公式直接失效；但它又没有复杂到任意图那种程度，因为每条边至多属于一个简单环。

这就提示我们先把“麻烦的环”整体打包：每个环缩成一个方点，原点和方点连成块树。这样原图里任意一条路径，就被翻译成块树上的一条简单路径；只有当路径经过某个环块时，才额外面临一次“顺时针走还是逆时针走”的二选一。

于是查询就被拆成两部分：树边部分像普通树上一样靠深度前缀和与 LCA 累加；环块部分则用环上一圈前缀和，计算两个接触点之间两条方向的较短弧长。所以这题最值得形成的统一认识是：**静态仙人掌最短路 = 块树骨架 + 环内局部最短弧。**

### 核心代码

```cpp
build_cactus_tree();
dfs(1,0);
long long query(int u,int v){
    int p=lca(u,v);
    return dist_to_root(u)+dist_to_root(v)-2*dist_to_root(p)+cycle_fix(u,v,p);
}
```

### 复杂度

$O((n+q)\log n)$。

---

## 27. [P10932 Freda的传呼机](https://www.luogu.com.cn/problem/P10932)

`仙人掌` `最短路` `LCA`

### 题意

房屋通过光缆连成树、基环树或一般仙人掌，询问两座房屋之间传呼机信号传递的最短时间。

### 分析

题面特意把树、基环树、仙人掌分开说，但真正有用的统一结构其实只有一个：**任意两条简单环至多共点的图，可以缩成一棵块树。**只要完成这一步，三种情况就全都落到同一框架里了。

缩点后的块树上，普通树边部分仍然像树上距离那样直接累加；只有当路径穿过某个环块时，才需要额外处理“沿环顺时针走还是逆时针走更短”。为此只要给每个环预处理一圈前缀和，就能在进入、离开环的两个接触点之间取较小的一段。

所以这题最重要的迁移点是：**仙人掌最短路不是在原图上乱分类，而是先缩成块树，再把环当成特殊边处理。**

### 核心代码

```cpp
tarjan_cactus();
build_block_tree();
dfs(root,0);
for(auto [u,v]:qry)
    cout<<tree_dis(u,v)+ring_dis(u,v);
```

### 复杂度

$O((n+q)\log n)$。

---

## 28. [P4410 \[HNOI2009\] 无归岛](https://www.luogu.com.cn/problem/P4410)

`仙人掌` `树形 DP`

### 题意

Neverland 的关系图可以看成若干环与挂树组成的结构，要求选出若干生物使任意两只都不是朋友，并最大化战斗力总和。

### 分析

仙人掌上的最大独立集，难点不在树上 DP，而在环会破坏树的“父选子不选”单向依赖。真正该做的，是先承认：除了若干简单环以外，其他部分仍然都是树。

因此处理方式也分两层。挂在环上的树照常做选 / 不选 DP，把每个环点向外那一坨信息先浓缩成两个值；真正麻烦的只剩环本身。而环上的独立集可以像经典环形 DP 那样，断成链后分情况讨论“首点选”还是“首点不选”。

所以这题的核心迁移点是：**仙人掌 = 树 DP + 少量环 DP；先把树侧信息压到环点，再解决环的闭合约束。**

### 核心代码

```cpp
pair<ll,ll> solve_tree(int u,int fa){
    ll f0=0,f1=w[u];
    for(int v:son[u]) if(v!=fa){
        auto [g0,g1]=solve_tree(v,u);
        f0+=max(g0,g1), f1+=g0;
    }
    return {f0,f1};
}
ans+=solve_cycle(cycle_nodes);
```

### 复杂度

$O(n)$。

---

## 29. [P4606 \[SDOI2018\] 战略游戏](https://www.luogu.com.cn/problem/P4606)

`点双` `虚树` `树形 DP`

### 题意

每局给出一组已被占领的城市 `S`，若删除某个未被占领城市后能让 `S` 中至少两城不连通，则该城市是必胜点。要求统计每局的必胜点数量。

### 分析

先把原图转成圆方树，圆点是原点、方点是点双。对每次询问把 `S` 和它们的 LCA 拉成一棵虚树，虚树上某个原点能否成为必胜点，只取决于它分裂出的被占领连通块个数。

### 核心代码

```cpp
build_block_cut_tree();
for(auto &qry:S){
    auto vt=build_virtual_tree(qry);
    dfs_vt(root,0);
    ans=0;
    for(int x:vt_nodes) if(is_real[x]&&!occupied[x]&&need_cut[x]>=2) ans++;
}
```

### 复杂度

$O((n+\sum |S|)\log n)$。

---

## 30. [P5022 \[NOIP 2018 提高组\] 旅行](https://www.luogu.com.cn/problem/P5022)

`基环树` `DFS 序` `构造`

### 题意

在连通无向图中从某个起点出发按 DFS 式游览所有城市，记录首次到达新城市的序列。要求让这个长度为 `n` 的序列字典序最小。

### 分析

若图本来就是树，答案显然就是把邻接表排好序后做 DFS；问题真正复杂的地方，在于 $m=n$ 时图恰好多出一条环边，这会让 DFS 序列因为“先走环的哪一边”而发生字典序差异。

关键观察是：对于单环图，任何一次合法 DFS 序都等价于**先删掉环上的某一条边，再在树上做升序 DFS**。因为 DFS 真正不允许的是在首次访问序中绕环造成回头选择冲突，而删去一条环边正好对应确定了一种展开方式。

所以朴素版做法就是枚举删哪条环边，比较得到的 DFS 序最小者。这题最值得记住的是：**单环图的 DFS 字典序问题，常能先转成“删一条环边变树”。**

### 核心代码

```cpp
find_cycle();
best.clear();
for(auto [u,v]:cycle_edges){
    ban={u,v}; seq.clear();
    dfs(1,0);
    best=min(best,seq);
}
```

### 复杂度

$O(n^2)$。

---

## 31. [P5049 \[NOIP 2018 提高组\] 旅行 加强版](https://www.luogu.com.cn/problem/P5049)

`基环树` `DFS 序` `贪心`

### 题意

题意与“旅行”相同，但数据范围更大，需要在线性或接近线性的时间内求出最小字典序的访问序列。

### 分析

加强版和原题的本质没变，仍然是在单环图上决定“到底删掉哪条环边”才能让 DFS 序最小。区别只在于不能再把每条环边都试一遍了。

要优化，就得把“删哪条边”这件事本身也做成贪心判断。沿着环从起点视角看，真正影响字典序的，是在第一次遇到环分叉时，哪一侧会更早给出更小的未访问节点。于是可以在线性扫描环时确定唯一应该禁用的边，而不是暴力枚举整圈。

所以加强版最重要的升级点是：**不是换模型，而是把原来“枚举删边”的过程提炼成一次环上的字典序贪心。**

### 核心代码

```cpp
get_cycle();
choose_ban_edge();
dfs(1,0);
for(int v:adj[u]) if(!vis[v]&&!is_ban(u,v)) dfs(v,u);
```

### 复杂度

$O(n\log n)$。

---

## 32. [P1399 \[NOI2013\] 快餐店](https://www.luogu.com.cn/problem/P1399)

`基环树` `树的直径` `半径`

### 题意

城市共有 `N` 个建筑和恰好 `N` 条双向道路，也就是一张带权基环树。快餐店可以建在点上或边上，要求使到最远顾客的距离最小。

### 分析

基环树的“最远点”来源有两部分：一部分在某个环点挂着的树里，另一部分沿着环走向别的挂树。于是先把唯一环剥出来，每个环点向外那棵树只需保留一个量——从环点出发能到的最深距离。

剩下的问题就被压成了一个环上选址：在环上某个位置建店，最坏顾客距离等于“向左走的弧长 + 左侧挂树深度”和“向右走的弧长 + 右侧挂树深度”的较大者。把环复制一倍后，这个最小化最大值的问题就能转成滑动窗口 / 单调队列维护。

所以这题最值得迁移的是基环树的标准拆法：**先把挂树信息压到环上，再把整题变成环上的序列优化。**

### 核心代码

```cpp
find_cycle();
for(int x:cycle) dfs_depth(x,0);
for(int i=1;i<=2*m;i++) pre[i]=pre[i-1]+len[i];
deque<int> q; slide_on_doubled_cycle(q);
ans=min(ans,max_left_right());
```

### 复杂度

$O(n)$。

---

## 33. [CF835F Roads in the Kingdom](https://www.luogu.com.cn/problem/CF835F)

`基环树` `树的直径` `单调队列`

### 题意

连通图满足 $m=n$，删去一条边后仍需保持连通。要求在所有删边方案中，使剩余树直径最小。

### 分析

因为 $m=n$，图里恰好只有一个环；删边且保持连通，等价于从这个环上删去一条边，把基环树断成普通树。问题于是变成：断开环的哪个位置，最终树直径最小。

树直径来源同样分两部分：各挂树内部自己的直径，以及跨越环上两端挂树形成的新最长路径。前者可以先对每个环点的挂树预处理出来，后者则在“复制两倍的环”后，变成一个带单调队列的窗口最值问题。

所以这题和快餐店一脉相承：**先把基环树压成“环 + 每个环点的附加信息”，再在环上枚举 / 优化断开位置。**

### 核心代码

```cpp
find_cycle();
for(int x:cycle) calc_subtree(x);
for(int i=1;i<=2*m;i++) pre[i]=pre[i-1]+w[i];
for(int l=1,r=1;l<=m;l++){
    while(r<l+m-1) push(++r);
    ans=min(ans,max(calc_left(l,r),calc_right(l,r)));
}
```

### 复杂度

$O(n)$。

---

## 34. [P11850 \[TOIP 2023\] 关卡地图](https://www.luogu.com.cn/problem/P11850)

`基环树` `树形 DP`

### 题意

关卡图满足 $m\le n$ 且连通，凯特要把它当作线性流程来玩：每次只能从当前关卡走到一个相邻且未通过的关卡。要求最大化通过关卡的成就感总和。

### 分析

连通且 $m\le n$ 说明图是树或基环树，线性通关过程本质上是一条简单路径。树上是最大权路径，基环树则把环上断开成若干链，枚举环上经过的一段并结合挂树 DP 求最大路径和。

### 核心代码

```cpp
find_cycle();
for(int x:cycle) tree_dp(x,0);
for(int i=1;i<=m;i++){
    cur=max(cur+val[cycle[i]],best_in[cycle[i]]);
    ans=max(ans,cur+best_out[cycle[i]]);
}
```

### 复杂度

$O(n)$。

---

## 35. [P12145 \[蓝桥杯 2025 省 A\] 扫地机器人](https://www.luogu.com.cn/problem/P12145)

`基环树` `DP`

### 题意

连通无向图满足 $m=n$，部分点需要清扫。机器人可从任意点出发且每条边至多经过一次，要求最多能清扫多少个待清扫点。

### 分析

“每条边至多经过一次”这句决定了路线形态：在无向连通图里，你最后拿到的不是随便乱走的一团，而是一条不重复边的开链。题目图又满足 `m=n`，所以每个连通块都是基环树，复杂性只来自那唯一一个环。

因此思考顺序应该是先拆结构。对每个环点，把挂在它外面的树先单独做 DP，压成一个量：从这个环点出发，最多还能在树里额外收多少待清扫点。这样原题就从“基环树上找最优路线”，变成了“环上取一段路径，并把两端接上各自最优树链”。

换句话说，真正要练的是这类基环树题的共通套路：**先把挂树贡献压到环点，再在环这个一维结构上做选择。**

### 核心代码

```cpp
find_cycle();
for(int x:cycle) calc_chain(x,0);
for(int i=1;i<=m;i++){
    ans=max(ans,best_tree[i]);
    ans=max(ans,prefix_best[i-1]+suffix_best[i+1]+sum_mark_on_arc(i));
}
```

### 复杂度

$O(n)$。

---

## 36. [P4381 \[IOI 2008\] Island](https://www.luogu.com.cn/problem/P4381)

`基环树` `树的直径` `单调队列`

### 题意

每个岛恰好向外连一座桥，因此整张图是若干个带权基环树。要求在给定的步行/乘船规则下，最大化能够走过的桥长总和。

### 分析

因为每个点恰好连出一条边，所以每个连通块都是“一个环外带若干棵树”的基环树，不同连通块互不影响，答案直接按块累加。

对单个基环树来说，最长路径只有两种来源：要么完全落在某棵挂树内部，那就是普通树直径；要么从某个环点的挂树出发，沿环走一段，再进入另一个环点的挂树。这说明我们不需要保留整棵挂树的细节，只需对每个环点记一个“向外最长链长度”。

接下来把环复制一倍，是为了把“跨环选两端”改写成线性区间里的最优配对；单调队列负责维护当前窗口内最优的另一端候选。所以这题的关键迁移点是：**基环树最长路先分成‘树内直径’和‘跨环路径’两类，再把跨环部分压成倍长环上的序列优化。**

### 核心代码

```cpp
for(each component){
    get_cycle(comp);
    for(int x:cycle) dfs_tree(x,0);
    ll best=tree_dia;
    deque<int> q; solve_cycle(q,best);
    ans+=best;
}
```

### 复杂度

$O(n)$。

---

## 37. [P2607 \[ZJOI2008\] 骑士](https://www.luogu.com.cn/problem/P2607)

`基环树` `最大独立集` `DP`

### 题意

每位骑士恰好讨厌一名骑士，不能把互相存在厌恶关系的两人同时选入军团。要求求出最大战斗力和。

### 分析

每个骑士恰好讨厌一人，等价于每个点恰有一条出边，所以整张图不会乱成一般有向图，而是分解成若干个“一个有向环，外面挂入树”的基环树结构。

若没有环，最大独立集就是标准树 DP：`选我则儿子都不能选，不选我则儿子各自取最优`。真正让树 DP 失效的只有环，因为环首尾相邻，导致“第一个点选不选”会反过来影响最后一个点。

因此自然做法就是两层处理：先把所有挂树信息压到环点上，得到每个环点“选 / 不选”的收益；再把环断成链，分两次讨论“首点选”与“首点不选”。所以这题最该形成的套路是：**基环树 DP 先做树，再做环；环只额外带来一个首尾闭合约束。**

### 核心代码

```cpp
pair<ll,ll> dp_tree(int u){
    ll f0=0,f1=val[u];
    for(int v:son[u]){
        auto [g0,g1]=dp_tree(v);
        f0+=max(g0,g1), f1+=g0;
    }
    return {f0,f1};
}
ans+=solve_cycle_independent_set(cycle_nodes);
```

### 复杂度

$O(n)$。

---

# 四、树链剖分

树剖的重点始终是两件事：把路径拆成若干条重链区间，以及在线段树上维护区间答案。

## 38. [T72503 点的距离](https://www.luogu.com.cn/problem/T72503)

`LCA` `树上距离`

### 题意

给定一棵树和多组询问，每次要求输出两点之间的距离。

### 分析

树上距离公式固定为 $dep[u]+dep[v]-2\times dep[lca(u,v)]$。因此只要先用倍增或树剖求出 LCA，距离问题就都变成模板计算。

### 核心代码

```cpp
int lca(int u,int v){
    if(dep[u]<dep[v]) swap(u,v);
    lift(u,dep[u]-dep[v]);
    for(int j=LOG-1;j>=0;j--) if(fa[u][j]!=fa[v][j])
        u=fa[u][j],v=fa[v][j];
    return u==v?u:fa[u][0];
}
```

### 复杂度

$O((n+q)\log n)$。

---

## 39. [P3384 【模板】重链剖分 / 树链剖分](https://www.luogu.com.cn/problem/P3384)

`树链剖分` `线段树`

### 题意

树上支持路径加、路径求和、子树加、子树求和四类操作，答案都需要对模数取模。

### 分析

树剖的本质不是“背两遍 DFS”，而是把树上两类最常见的操作统一压成序列区间。子树为什么天然好做？因为 DFS 序下，一棵子树本来就是一个连续段；路径为什么也能做？因为重链剖分保证任意一条路径只会被拆成 `O(log n)` 段重链连续区间。

于是线段树真正负责的只是普通的区间加与区间求和，树剖负责把树上对象翻译成这些区间。写代码时最关键的是记住拆路径的顺序：始终让更深的链顶先跳，这样每次都能安全地把一段 `[dfn[top], dfn[x]]` 收进去。

所以这道模板题最值得建立的是分工意识：**树剖管“树变链”，线段树管“链上区间维护”。**

### 核心代码

```cpp
void path_add(int u,int v,int w){
    while(top[u]!=top[v]){
        if(dep[top[u]]<dep[top[v]]) swap(u,v);
        seg.add(dfn[top[u]],dfn[u],w); u=fa[top[u]];
    }
    if(dep[u]>dep[v]) swap(u,v);
    seg.add(dfn[u],dfn[v],w);
}
```

### 复杂度

$O((n+q)\log^2 n)$。

---

## 40. [P2486 \[SDOI2011\] 染色](https://www.luogu.com.cn/problem/P2486)

`树链剖分` `线段树`

### 题意

树上支持把路径 `[a,b]` 全部染成颜色 `c`，以及查询路径上颜色段的数量。

### 分析

这题和普通路径求和不同，答案不是简单可加的，因为颜色段数量会受两段拼接处颜色是否相同影响。也正因此，线段树结点里不能只存一个“这段有多少段”，还必须同时记住左端颜色和右端颜色。

这样一来，两段合并规则就很清楚了：总段数先相加，若左段右端颜色等于右段左端颜色，说明拼接处两段能并成一段，答案再减一。树剖把整条路径拆成若干链段后，真正麻烦的是路径方向：一边是自下而上，一边是自上而下，合并时要注意左右端点语义不能反。

所以这题最该学会的是：**当路径答案依赖边界状态时，线段树结点就要把边界信息也一起存下来。**

### 核心代码

```cpp
Info merge(Info a,Info b){
    Info c{a.lc,b.rc,a.seg+b.seg-(a.rc==b.lc)};
    return c;
}
void path_cover(int u,int v,int c){ /* HLD 分段区间赋值 */ }
Info path_query(int u,int v){ /* 左右答案分开合并 */ }
```

### 复杂度

$O((n+q)\log^2 n)$。

---

## 41. [P4211 \[LNOI2014\] LCA](https://www.luogu.com.cn/problem/P4211)

`树链剖分` `离线查询`

### 题意

多次询问 $\sum_{i=l}^{r} dep(lca(i,z))$，要求快速输出答案。

### 分析

把询问拆成前缀差分：`ask(r,z)-ask(l-1,z)`。按 `x` 从小到大扫点，每加入一个编号 `i`，就在根到 `i` 的路径上全部加 1；此时查询根到 `z` 的路径和，就等于 $\sum_{j\le x} dep(lca(j,z))$。

### 核心代码

```cpp
sort(qry.begin(),qry.end(),by_x);
for(int i=1,p=0;i<=n;i++){
    path_add(1,i,1);
    while(p<qry.size()&&qry[p].x==i){
        ans[qry[p].id]+=qry[p].sgn*path_sum(1,qry[p].z);
        p++;
    }
}
```

### 复杂度

$O((n+q)\log^2 n)$。

---

## 42. [P3313 \[SDOI2014\] 旅行](https://www.luogu.com.cn/problem/P3313)

`树链剖分` `平衡树` `分类讨论`

### 题意

树上每个城市有宗教和评级，支持修改宗教、修改评级，以及查询路径上与起点同宗教城市的评级和或评级最大值。

### 分析

树剖负责把路径拆段，但只统计同一宗教的点，因此需要为每个宗教单独维护一套按 DFS 序组织的线段树 / 平衡树。修改宗教时相当于把一个点从旧宗教结构删掉，再插入新宗教结构。

### 核心代码

```cpp
void change_color(int x,int c){
    seg[col[x]].erase(dfn[x],w[x]);
    col[x]=c;
    seg[col[x]].insert(dfn[x],w[x]);
}
int query_sum(int x,int y){
    return split_path(x,y,[&](int l,int r){ return seg[col[x]].sum(l,r); });
}
```

### 复杂度

$O(q\log^2 n)$。

---

## 43. [P4219 \[BJOI2014\] 大融合](https://www.luogu.com.cn/problem/P4219)

`树链剖分` `LCT` `动态树`

### 题意

树是边一条条加入的，询问某条边当前被多少条简单路径经过，也就是它的负载。

### 分析

一条边的负载等于它两侧连通块大小的乘积。动态加边时适合用 Link-Cut Tree 维护实链与虚子树大小，查询某条边时把这条边看成父子关系，就能得到 $size_{sub}\times(size_{all}-size_{sub})$。

### 核心代码

```cpp
void link(int x,int y){
    makeroot(x); access(y); splay(y);
    fa[x]=y; vir[y]+=sz[x]; pushup(y);
}
long long query_edge(int x,int y){
    makeroot(x); access(y); splay(y);
    return 1LL*sz[ch[y][0]]*(sz[y]-sz[ch[y][0]]);
}
```

### 复杂度

$O(q\log n)$。

---

## 44. [P4216 \[SCOI2015\] 情报传递](https://www.luogu.com.cn/problem/P4216)

`树链剖分` `离线查询`

### 题意

情报员一旦开始搜集情报，危险值会随天数增长。对每次传递任务 `(x,y,c)`，要求统计路径上总共有多少人参与、以及其中危险值大于 `c` 的人数。

### 分析

设当前天数为 `day`，某人危险值大于 `c` 等价于它的激活时间 $start\le day-c-1$。把传递任务按阈值离线排序，按时间把已经“足够危险”的点加入树剖结构，路径和就是危险人数，总人数则是普通路径长度。

### 核心代码

```cpp
sort(adds.begin(),adds.end());
sort(qry.begin(),qry.end(),by_lim);
for(auto &q:qry){
    while(p<adds.size()&&adds[p].time<=q.lim) point_add(adds[p].x,1),p++;
    bad[q.id]=path_sum(q.x,q.y);
    all[q.id]=dep[q.x]+dep[q.y]-2*dep[lca(q.x,q.y)]+1;
}
```

### 复杂度

$O((n+q)\log^2 n)$。

---

## 45. [P2146 \[NOI2015\] 软件包管理器](https://www.luogu.com.cn/problem/P2146)

`树链剖分` `线段树`

### 题意

依赖关系构成一棵以 `0` 为根的树，支持安装某个包（需要把根到它整条链都装上）和卸载某个包（需要把它整棵子树都卸掉），并输出实际改变状态的包数。

### 分析

这题表面是软件包依赖，实际上是两种非常典型的树上区间操作：安装某个包时，根到它路径上所有点都必须变成 `1`；卸载某个包时，它整棵子树都要变成 `0`。

一旦看出这点，树剖就非常自然了：路径安装被拆成若干重链区间赋值，子树卸载则直接是 DFS 序上一段连续区间赋值。题目要求的“本次真正改变了多少包”也不需要额外设计复杂结构，只要在赋值前后查询区间和做差即可。

所以这题很适合拿来巩固树剖的一个核心应用：**路径更新和子树更新同时出现时，树剖往往是最顺手的统一方案。**

### 核心代码

```cpp
int install(int x){
    int before=path_sum(0,x);
    path_cover(0,x,1);
    return path_sum(0,x)-before;
}
int uninstall(int x){
    int before=sub_sum(x);
    sub_cover(x,0);
    return before-sub_sum(x);
}
```

### 复杂度

$O(q\log^2 n)$。

---

## 46. [P5305 \[GXOI/GZOI2019\] 旧词](https://www.luogu.com.cn/problem/P5305)

`树链剖分` `离线查询` `LCA`

### 题意

询问 $\sum_{i\le x} depth(lca(i,y))^k$，需要对大量 `(x,y)` 快速回答。

### 分析

与 P4211 同样做前缀离线，只是每个祖先的贡献从 `1` 变成了 $depth^k$。当扫描到点 `i` 时，把根到 `i` 路径上每个节点加上其深度 `k` 次幂，随后查询根到 `y` 的路径和即可。

### 核心代码

```cpp
for(int i=1,p=0;i<=n;i++){
    path_add_pow(1,i);
    while(p<qry.size()&&qry[p].x==i){
        ans[qry[p].id]+=qry[p].sgn*path_sum(1,qry[p].y);
        p++;
    }
}
```

### 复杂度

$O((n+q)\log^2 n)$。

---

## 47. [P1505 \[国家集训队\] 旅游](https://www.luogu.com.cn/problem/P1505)

`树链剖分` `线段树`

### 题意

树边带权，支持单边改值、路径取反、路径求和、路径最大值和路径最小值。

### 分析

这题如果只看到“路径求和 / 最值”，会觉得是普通树剖模板；真正新增的难点是“路径取反”。一旦一整段边权全部乘 `-1`，区间和当然取负，但最大值和最小值的角色也会互换。

所以线段树结点里必须同时维护 `sum / mx / mn`。打取反标记时，不能只改 `sum`，还要先交换 `mx` 和 `mn`，再一起取负，这样新的最大值才会对应原来的最小值。认清这一点后，树剖部分仍然只是把路径拆成若干区间。

因此这题最值得记的是维护逻辑而不是树剖本身：**当区间操作会改变大小关系时，结点里所有相关统计量都要按真实语义同步变换。**

### 核心代码

```cpp
void apply_neg(int p){
    seg[p].sum=-seg[p].sum;
    swap(seg[p].mx,seg[p].mn);
    seg[p].mx=-seg[p].mx; seg[p].mn=-seg[p].mn;
    seg[p].tag^=1;
}
void path_neg(int u,int v){ split_path(u,v,[&](int l,int r){ seg.neg(l,r); }); }
```

### 复杂度

$O(q\log^2 n)$。

---

# 五、LCA 与虚树

LCA 负责树上距离与祖先关系，虚树负责把多点询问压缩到关键节点上。

## 48. [P3379 【模板】最近公共祖先（LCA）](https://www.luogu.com.cn/problem/P3379)

`LCA` `倍增`

### 题意

给定一棵有根树和多组询问，要求输出两点的最近公共祖先。

### 分析

LCA 真正要解决的是“两个点在树上第一次汇合的位置”，所以查询过程必须先把它们放到可比较的同一层级上。若深度都不同，直接一起跳是没有意义的。

倍增做法因此分成两步：先把更深的那个点往上跳到与另一个点同深；若此时已经相等，说明浅的那个点就是祖先。否则再从大到小枚举 $2^j$，只要二者的 $2^j$ 级祖先还不同，就把它们同时抬上去；最后停下时，它们的父亲就是最低公共祖先。

所以这道模板题最该记住的是查询动作链：**先对齐深度，再同步上跳，直到恰好卡在 LCA 的两个儿子上。**

### 核心代码

```cpp
int lca(int u,int v){
    if(dep[u]<dep[v]) swap(u,v);
    for(int j=LOG-1;j>=0;j--) if(dep[fa[u][j]]>=dep[v]) u=fa[u][j];
    if(u==v) return u;
    for(int j=LOG-1;j>=0;j--) if(fa[u][j]!=fa[v][j])
        u=fa[u][j],v=fa[v][j];
    return fa[u][0];
}
```

### 复杂度

$O((n+q)\log n)$。

---

## 49. [P10930 异象石](https://www.luogu.com.cn/problem/P10930)

`LCA` `动态维护` `虚树`

### 题意

树上点会动态加入或删除异象石。每次询问要求输出把所有当前存在异象石的点连通所需边权和的最小值。

### 分析

把所有激活点按 DFS 序放进有序集合，维护它们首尾相连形成的“环”总长度 `sum`。每次插入或删除一个点，只会影响它与前驱、后继的三段距离，答案始终是 $rac{sum}{2}$。

### 核心代码

```cpp
auto dist=[&](int u,int v){ return depw[u]+depw[v]-2*depw[lca(u,v)]; };
void insert(int x){
    auto it=st.lower_bound(x), pre=prev_it(it), nxt=next_it(it);
    sum+=dist(*pre,x)+dist(x,*nxt)-dist(*pre,*nxt);
    st.insert(x);
}
```

### 复杂度

$O(q\log n)$。

---
