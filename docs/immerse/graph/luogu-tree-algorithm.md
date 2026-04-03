---
title: "洛谷 树上算法专题精选解题报告"
subtitle: "🌲 从直径、LCA 到 DSU on Tree 与基环树的树上算法主线"
order: 2
icon: "🌲"
---

# 洛谷 树上算法专题精选解题报告

这一组题从树的直径一路走到 LCA、DSU on Tree、树链剖分，再延伸到仙人掌和基环树，核心一直是把“树上关系”压成可递推、可倍增或可剖分的结构。前半段偏经典性质，后半段则开始处理稀疏环和更复杂的树上维护。

# 一、树的直径

先把树的直径、树心和动态直径这条线打通，很多树上最远点问题都能往这里归。

## 1. [P3000 \[USACO10DEC\] Cow Calisthenics G](https://www.luogu.com.cn/problem/P3000)

`树的直径` `二分` `树形 DP`

### 题意

给定一棵边长全为 1 的树，可以封锁 `S` 条边把树切成 `S+1` 个连通块。要求让所有连通块直径的最大值尽量小。

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

把树剖到 Euler 序上后，每段维护“从左/右端出发的最远距离”和整段直径。修改一条边只会影响一段区间，在线段树上自底向上合并即可实时得到全树直径。

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

对每个连通块只需维护它的两个直径端点。新点加入后，只可能与现有直径端点之一形成更长直径；查询某点的最远距离则等于它到这两个端点距离的较大值。

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

同一颜色点集的直径可以通过两次“找最远点”完成：先按 DFS 序把同色点取出，利用 LCA 计算距离，从任取一点找到最远点 `A`，再从 `A` 找到最远点 `B`，`dist(A,B)` 就是答案。

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

删掉一条边会把树分成两棵树，分别只需关心各自的直径和半径。枚举断边时，合并后的最优直径是 `max(d1,d2,r1+w+r2)`，其中 `r` 是树半径，于是预处理每条边两侧的信息后枚举即可。

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

每个连通块只需要维护直径。把两棵树用一条边连起来后，新直径是 `max(d1,d2,\lceil d1/2\rceil+\lceil d2/2\rceil+1)`，并查集合并时按这个公式更新即可。

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

最坏情况下父母会把连接 `A,B,C` 的最小连通子树整段走完一次。树上三点 Steiner 树长度恰好是 `(dis(A,B)+dis(B,C)+dis(C,A))/2`，因此求三次距离即可。

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

允许删除若干点，但每次删除后剩余图仍需连通。要求删点数最少，使剩余树的直径不超过 `K`。

### 分析

若 `K` 为偶数，保留下来的树一定有一个中心点；若 `K` 为奇数，则中心是一条边。枚举中心点或中心边，只保留距离中心不超过 `\lfloor K/2\rfloor` 的点，删去其余点即可。

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

树的直径模板就是两次 BFS / DFS：先从任意点出发找到最远点 `s`，再从 `s` 出发找到最远点 `t`，`dist(s,t)` 就是直径长度。

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

对每个节点 `x`，定义 `d_{x,i}` 为其子树中与 `x` 距离为 `i` 的节点数。要求找出使 `d_{x,i}` 最大的最小下标 `i`。

### 分析

轻重儿子启发式合并的典型题。先保留重儿子统计数组，再把轻儿子的深度计数逐个并进来；合并时顺手维护当前最大出现次数和对应的最小深度偏移即可。

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

这是标准倍增模板。预处理 `fa[u][j]` 表示 `2^j` 级祖先，查询时把 `k` 按二进制拆开逐位跳即可。

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

给定一棵边有价值的树，要求在边数 `L\sim U` 之间选择一条简单路径，使其平均边权最大。

### 分析

二分平均值 `mid`，把每条边权改成 `w-mid`，问题就变成“是否存在长度在 `[L,U]` 内、总和非负的路径”。树上合并子树时维护每个长度的最佳链值，并用单调队列优化长度窗口。

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

每次询问给定节点 `p` 和常数 `k`，要求统计有序三元组 `(a,b,c)` 的个数，其中 `a=p`，且 `a,b` 都是 `c` 的祖先，同时 `a` 与 `b` 的距离不超过 `k`。

### 分析

固定 `a=p` 后，真正变化的是子树内各深度层的点数。DSU on Tree 维护当前子树的深度计数与前缀和，就能在合并轻儿子时快速统计满足距离限制的 `b,c` 组合数。

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

一条路径能重排成回文，当且仅当其字母奇偶掩码至多有一位为 1。以节点为分治中心时，维护子树中每种掩码的最大深度；合并轻儿子时枚举 `mask` 和 `mask^(1<<c)` 就能更新答案。

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

把每个环缩成一个方点，原点与环方点组成块树。树边部分直接按深度前缀和处理，经过某个环时则利用环上前缀和取顺/逆时针较短的一段，再在块树上做 LCA 汇总。

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

题目三种情况最终都能统一到仙人掌最短路模型。先把每个环抽成块树节点，树上路径部分正常累加，穿过环时用环前缀和取两方向的较小值。

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

这就是仙人掌上的最大权独立集。对树边正常做选/不选 DP；遇到一个环时，断开环头枚举“首点选或不选”两种情况，再在线性链上转移并取最优。

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

当图是树时，按邻接表升序 DFS 就最优；当图只有一个环时，必须删去环上的某一条边再做树上的升序 DFS。枚举被删的环边，取最小字典序即可。

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

依然只分树和单环两种情况。先找出唯一环，再从起点沿最优方向贪心决定到底跳过环上的哪条边，只对这一条边禁用一次 DFS，就能避免暴力枚举所有环边。

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

先找出唯一环。每个环点挂着一棵树，只需知道挂树的最大深度；然后把环复制一倍，用单调队列维护一段弧两侧的最坏值，从而求出基环树的最小半径。

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

连通图满足 `m=n`，删去一条边后仍需保持连通。要求在所有删边方案中，使剩余树直径最小。

### 分析

删边后一定把唯一环断开成树。先对每个环点求挂树的最大深度和内部直径，再在复制两倍的环上用双指针 / 单调队列枚举断开位置，最小化断开后树的直径。

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

关卡图满足 `m\le n` 且连通，凯特要把它当作线性流程来玩：每次只能从当前关卡走到一个相邻且未通过的关卡。要求最大化通过关卡的成就感总和。

### 分析

连通且 `m\le n` 说明图是树或基环树，线性通关过程本质上是一条简单路径。树上是最大权路径，基环树则把环上断开成若干链，枚举环上经过的一段并结合挂树 DP 求最大路径和。

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

连通无向图满足 `m=n`，部分点需要清扫。机器人可从任意点出发且每条边至多经过一次，要求最多能清扫多少个待清扫点。

### 分析

每条边最多经过一次意味着最终路线是一条欧拉意义上的开链，图又是基环树。先求每个环点挂树中“从该点出发的最佳链”，再在环上枚举取一段路径或整环，合并得到最优答案。

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

每个连通块互不影响，答案是各基环树最优值之和。对每个环先求挂树的直径与从环点出发的最长链，再在倍长环上用单调队列求“跨环路径”的最佳贡献，和挂树直径取最大。

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

每个点恰有一条出边，因此整张图由若干基环树组成。对挂在环上的树先做选/不选 DP，再把环拆成链，分别讨论“首点选”与“首点不选”两种情况做环上最大独立集。

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

树上距离公式固定为 `dep[u]+dep[v]-2\times dep[lca(u,v)]`。因此只要先用倍增或树剖求出 LCA，距离问题就都变成模板计算。

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

标准树剖模板：两次 DFS 求重儿子和剖分序，把路径拆成若干段连续区间交给线段树维护；子树操作则直接变成 Euler 序上的一段区间。

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

树剖后，线段树每段维护左端颜色、右端颜色和颜色段数。路径查询时把若干区间按方向拼起来，若前一段右色等于后一段左色，就要把段数减一。

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

多次询问 `\sum_{i=l}^{r} dep(lca(i,z))`，要求快速输出答案。

### 分析

把询问拆成前缀差分：`ask(r,z)-ask(l-1,z)`。按 `x` 从小到大扫点，每加入一个编号 `i`，就在根到 `i` 的路径上全部加 1；此时查询根到 `z` 的路径和，就等于 `\sum_{j\le x} dep(lca(j,z))`。

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

一条边的负载等于它两侧连通块大小的乘积。动态加边时适合用 Link-Cut Tree 维护实链与虚子树大小，查询某条边时把这条边看成父子关系，就能得到 `size_sub\times(size_all-size_sub)`。

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

设当前天数为 `day`，某人危险值大于 `c` 等价于它的激活时间 `start\le day-c-1`。把传递任务按阈值离线排序，按时间把已经“足够危险”的点加入树剖结构，路径和就是危险人数，总人数则是普通路径长度。

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

树剖后，安装就是把根到 `x` 路径赋值为 `1`，卸载就是把 `x` 子树赋值为 `0`。操作前后查询对应区间和，差值就是本次真正改变的包数量。

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

询问 `\sum_{i\le x} depth(lca(i,y))^k`，需要对大量 `(x,y)` 快速回答。

### 分析

与 P4211 同样做前缀离线，只是每个祖先的贡献从 `1` 变成了 `depth^k`。当扫描到点 `i` 时，把根到 `i` 路径上每个节点加上其深度 `k` 次幂，随后查询根到 `y` 的路径和即可。

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

仍然是边权树剖。在线段树中维护区间和、最大值、最小值，再加一个“取反”懒标记：打标时把 `sum` 取负，同时交换并取反 `mx/mn`，就能支持路径翻转。

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

LCA 模板。预处理每个点的 `2^j` 级祖先，查询时先把较深的点跳到同一深度，再一起从高位往低位跳，最后父亲就是 LCA。

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

把所有激活点按 DFS 序放进有序集合，维护它们首尾相连形成的“环”总长度 `sum`。每次插入或删除一个点，只会影响它与前驱、后继的三段距离，答案始终是 `sum/2`。

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
