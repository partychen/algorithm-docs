---
title: "洛谷 最短路专题精选解题报告"
subtitle: "🛣️ 从 Floyd 到分层图的最短路建模主线"
order: 1
icon: "🛣️"
---

# 洛谷 最短路专题精选解题报告

这一组题从 Floyd 与闭包一路走到 Dijkstra、分层图和最小环，题面上有的是路网、有的是状态机、有的是限制条件，但底层都在问“距离”该怎样定义。最短路题的关键往往不是套哪种算法，而是先把额外条件并进状态，让图上的边重新变得诚实。

# 一、Floyd 算法

这一组围绕 Floyd 的判序、闭包、最小环与动态加点展开。

## 1. [P1347 \[ECNA 2001\] 排序](https://www.luogu.com.cn/problem/P1347)

`Floyd` `传递闭包`

### 题意

给出 $n$ 个字母和按顺序加入的若干比较关系 $A<B$，需要判断是在第几条关系后首次出现矛盾、首次能唯一确定完整序列，还是到最后仍无法确定。

### 分析

把大小关系看成有向边，布尔 Floyd 维护可达性。每加入一条边就闭包一次：若出现 `reach[i][i]` 说明矛盾；若任意两点都已可比较，再按每个点前面有多少点来还原唯一序列。

### 核心代码

```cpp
bool reach[26][26];
int pos[26];

int check(int n){
    for(int k=0;k<n;k++)
        for(int i=0;i<n;i++) if(reach[i][k])
            for(int j=0;j<n;j++) reach[i][j]|=reach[k][j];
    for(int i=0;i<n;i++) if(reach[i][i]) return -1;
    for(int i=0;i<n;i++) for(int j=i+1;j<n;j++)
        if(!reach[i][j]&&!reach[j][i]) return 0;
    for(int i=0;i<n;i++){
        pos[i]=0;
        for(int j=0;j<n;j++) pos[i]+=reach[j][i];
    }
    return 1;
}
```

### 复杂度

$O(mn^3)$。

---

## 2. [B3611 【模板】传递闭包](https://www.luogu.com.cn/problem/B3611)

`Floyd` `传递闭包` `bitset`

### 题意

给定一个有向图的邻接矩阵，输出任意点对之间是否可直接或间接到达的传递闭包矩阵。

### 分析

传递闭包题本质上不是求最短路，而是求“能不能到”。一旦状态只剩布尔值，Floyd 的加法最小化就会退化成逻辑上的可达传递：如果 `i` 能到 `k`，而 `k` 又能到 `j`，那 `i` 就能到 `j`。

所以这里真正要理解的是 Floyd 的另一种形态：不再维护距离，而是维护“在只允许经过前若干个中转点时，两个点是否连通”。点数较大时再配合 `bitset`，就能把按列枚举压成按机器字并行。

因此这题最值得建立的是一个框架感：**Floyd 不只会做最短路，只要状态满足“经过 `k` 能否把两段关系接起来”，就能用同样的中转点扩张思路。**

### 核心代码

```cpp
const int N=2005;
bitset<N> reach[N];

void floyd(int n){
    for(int k=1;k<=n;k++)
        for(int i=1;i<=n;i++)
            if(reach[i][k]) reach[i]|=reach[k];
    for(int i=1;i<=n;i++) reach[i][i]=1;
}
```

### 复杂度

$O(\frac{n^3}{\omega})$。

---

## 3. [P10927 \[CEOI 1999\] Sightseeing trip](https://www.luogu.com.cn/problem/P10927)

`Floyd` `最小环`

### 题意

给定一张带权无向图，要求找到一个至少包含 3 个点的最短简单环，并输出这条环上的点序列；如果不存在则输出无解。

### 分析

Floyd 的经典最小环做法是在用点 `k` 更新最短路之前，先枚举 `i<j<k`，用 `dis[i][j]+w[i][k]+w[k][j]` 尝试更新答案。因为此时 `dis[i][j]` 只经过编号小于 `k` 的点，所以得到的环一定简单。

### 核心代码

```cpp
int dis[N][N],pre[N][N],ans=INF;
vector<int> cyc;

for(int k=1;k<=n;k++){
    for(int i=1;i<k;i++) for(int j=i+1;j<k;j++)
        if(dis[i][j]+g[i][k]+g[k][j]<ans){
            ans=dis[i][j]+g[i][k]+g[k][j];
            cyc=get_path(i,j),cyc.push_back(k);
        }
    for(int i=1;i<=n;i++) for(int j=1;j<=n;j++)
        if(dis[i][k]+dis[k][j]<dis[i][j])
            dis[i][j]=dis[i][k]+dis[k][j],pre[i][j]=pre[k][j];
}
```

### 复杂度

$O(n^3)$。

---

## 4. [P7516 \[省选联考 2021 A/B 卷\] 图函数](https://www.luogu.com.cn/problem/P7516)

`Floyd` `bitset` `可达性`

### 题意

对一张有向图定义函数 `f(u,G)`：按编号从小到大扫描顶点，若当前图中 `u` 与该点互相可达，就计数并删除该点。题目要求输出删去前缀边后的所有图的 $h(G)=\sum f(u,G)$。

### 分析

删前缀边得到的是一系列后缀图，适合倒序加边。核心是用 `bitset` 维护传递闭包；每加入一条 $u\to v$，所有能到 `u` 的点都并上 `v` 的可达集，再据此按顶点顺序模拟 `f(u,G)` 的删除过程。

### 核心代码

```cpp
bitset<N> reach[N];

void add_edge(int u,int v,int n){
    if(reach[u][v]) return;
    vector<int> src;
    for(int i=1;i<=n;i++) if(i==u||reach[i][u]) src.push_back(i);
    bitset<N> add=reach[v]; add[v]=1;
    for(int x:src) reach[x]|=add;
}

long long calc(int s,int n){
    bitset<N> ban; long long cnt=0;
    for(int v=1;v<=n;v++) if(!ban[v]&&reach[s][v]&&reach[v][s])
        cnt++, ban|=(reach[v]&reach[s]), ban[v]=1;
    return cnt;
}
```

### 复杂度

$O(\frac{mn^2}{\omega})$。

---

## 5. [P1119 灾后重建](https://www.luogu.com.cn/problem/P1119)

`Floyd` `离线`

### 题意

给出每个村庄的重建完成时间和若干询问 `(x,y,t)`，需要回答在第 `t` 天时，只经过已经修好的村庄时从 `x` 到 `y` 的最短路长度，不可达则输出 `-1`。

### 分析

这题的关键不在最短路本身，而在“哪些点在当天可以当中转点”。如果某个村庄还没修好，就根本不能经过它，所以随着时间推进，可用中转点集合是在不断扩大的。

这正好契合 Floyd 的状态含义：`dis[i][j]` 可以理解成“只允许经过前若干个已解锁点时，`i` 到 `j` 的最短路”。因此把村庄按修好时间排序，每多解锁一个点，就把它作为新的中转点做一轮转移。

所以这题最该形成的理解是：**时间变化只是在逐步开放中转点集合，而这正是 Floyd 最擅长维护的状态。**

### 核心代码

```cpp
int cur=0;
sort(ord+1,ord+n+1,cmp_time);
for(auto [t,x,y,id]:qry){
    while(cur<n&&tim[ord[cur+1]]<=t){
        int k=ord[++cur];
        for(int i=0;i<n;i++) for(int j=0;j<n;j++)
            dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
    }
    ans[id]=(tim[x]<=t&&tim[y]<=t&&dis[x][y]<INF)?dis[x][y]:-1;
}
```

### 复杂度

$O(n^3+q\log q)$。

---

# 二、状态图最短路与 BFS 建模

当边权退化为 1，或者状态需要额外携带钥匙、路径限制与访问历史时，最稳的入口通常就是 BFS。

## 6. [P1266 \[BalticOI 2002\] 速度限制](https://www.luogu.com.cn/problem/P1266)

`Dijkstra` `状态图`

### 题意

道路是有向的，每条路长度已知，起点处可能挂有限速牌；若没有新牌子就继续沿用当前速度。要求求出从起点到终点的最短行驶时间。

### 分析

速度会影响下一条边的耗时，因此状态不能只记路口，还要记当前车速。把 `(u,s)` 看成一个点：经过一条边后若起点有新限速就切换到该速度，否则保持 `s`，再用 Dijkstra 求最短时间。

### 核心代码

```cpp
struct State{int u,s; double d; bool operator<(const State& o)const{return d>o.d;}};
double dist[N][MAXS];

void dijkstra(int S){
    priority_queue<State> pq;
    dist[S][70]=0; pq.push({S,70,0});
    while(!pq.empty()){
        auto [u,s,d]=pq.top(); pq.pop();
        if(d!=dist[u][s]) continue;
        for(auto [v,len,lim]:g[u]){
            int ns=lim?lim:s;
            double nd=d+1.0*len/ns;
            if(nd<dist[v][ns]) dist[v][ns]=nd,pq.push({v,ns,nd});
        }
    }
}
```

### 复杂度

$O((nk+mk)\log(nk))$。

---

## 7. [P4011 孤岛营救问题](https://www.luogu.com.cn/problem/P4011)

`BFS` `状压` `最短路`

### 题意

迷宫是一个 $N\times M$ 网格，相邻格子之间可能是通路、墙或不同颜色的锁门，部分格子能拾取钥匙。每次移动耗时 1，要求从左上角最短时间到右下角。

### 分析

这题难点不在网格，而在“同一个格子，带着不同钥匙集合到达时，后续可走范围完全不同”。因此若状态只记位置，就会把本来不等价的情况错误合并。

所以自然要把状态扩成 `(位置,钥匙集合)`。到达某格时，先把这里能捡到的钥匙并进状态，再去尝试走相邻边；若边上是带颜色的门，就检查当前钥匙集合里是否已经有对应钥匙。

由于每次移动代价都还是 `1`，扩完状态后外层算法并没有变，仍然是普通 BFS。也就是说，这题最关键的建模是：**限制来自“你手里有什么”，就把资源集合并进状态图。**

### 核心代码

```cpp
queue<pair<int,int>> q;
dist[s][init]=0; q.push({s,init});
while(!q.empty()){
    auto [u,mask]=q.front(); q.pop();
    int nmask=mask|key[u];
    for(auto [v,col]:adj[u]){
        if(col&&!(nmask&(1<<(col-1)))) continue;
        if(dist[v][nmask]==-1){
            dist[v][nmask]=dist[u][mask]+1;
            q.push({v,nmask});
        }
    }
}
```

### 复杂度

$O(nm2^p)$。

---

## 8. [P8817 \[CSP-S 2022\] 假期计划](https://www.luogu.com.cn/problem/P8817)

`BFS` `折半搜索` `最短路`

### 题意

从家 `1` 出发，需要按 $1\to A\to B\to C\to D\to 1$ 走 5 段行程，每段至多转车 `k` 次，四个景点互不相同。给定每个景点分数，求最大得分和。

### 分析

先从家和每个景点做 BFS，求出“是否能在 `k+1` 条边内到达”。接着对每个点保留若干个既能从家到达、又能再到它的最高分候选，最后枚举中间两个点 `B,C` 做双端拼接。

### 核心代码

```cpp
for(int s=1;s<=n;s++) bfs(s);
for(int v=2;v<=n;v++)
    for(int u=2;u<=n;u++)
        if(ok[1][u]&&ok[u][v]) upd(best[v],u,val[u]);

long long ans=0;
for(int b=2;b<=n;b++) for(int c=2;c<=n;c++){
    if(b==c||!ok[b][c]) continue;
    for(auto [sa,a]:best[b]) for(auto [sd,d]:best[c])
        if(a&&d&&a!=b&&a!=c&&d!=a&&d!=b&&d!=c)
            ans=max(ans,sa+val[b]+val[c]+sd);
}
```

### 复杂度

$O(n(n+m)+n^2)$。

---

## 9. [P5683 \[CSP-J 2019 江西\] 道路拆除](https://www.luogu.com.cn/problem/P5683)

`BFS` `最短路` `建模`

### 题意

首都为 `1`，拆路后仍要保证从 `1` 到 `s_1`、`s_2` 的最短时间分别不超过 `t_1`、`t_2`。图是无权无向图，要求最多能拆掉多少条边。

### 分析

保留下来的边只需要支撑两条从 `1` 出发的路径，最优结构一定是先共用一段，再从某个分叉点分开。预处理任意两点最短路后，枚举分叉点 `x`，保留边数就是 `dis[1][x]+dis[x][s1]+dis[x][s2]`。

### 核心代码

```cpp
for(int s=1;s<=n;s++) bfs_all(s);
int keep=INF;
for(int x=1;x<=n;x++){
    int d1=dis[1][x]+dis[x][s1];
    int d2=dis[1][x]+dis[x][s2];
    if(d1<=t1&&d2<=t2) keep=min(keep,dis[1][x]+dis[x][s1]+dis[x][s2]);
}
ans=(keep==INF?-1:m-keep);
```

### 复杂度

$O(n(n+m))$。

---

## 10. [P5663 \[CSP-J 2019\] 加工零件](https://www.luogu.com.cn/problem/P5663)

`BFS` `奇偶性`

### 题意

每张工单给出工人 `a` 和阶段 `L`，询问 1 号工人是否会在这次递归加工中承担“提供原材料”的角色。

### 分析

工序每往外扩一层就沿一条传送带多走一步，所以问题等价于：是否存在一条从 `1` 到 `a` 的长度与 `L` 同奇偶且不超过 `L` 的路径。把每个点拆成奇偶两层做 BFS，就能回答全部询问。

### 核心代码

```cpp
queue<pair<int,int>> q;
dist[1][0]=0; q.push({1,0});
while(!q.empty()){
    auto [u,p]=q.front(); q.pop();
    for(int v:adj[u]) if(dist[v][p^1]==-1){
        dist[v][p^1]=dist[u][p]+1;
        q.push({v,p^1});
    }
}
bool ok(int a,int L){
    int d=dist[a][L&1];
    return d!=-1&&d<=L;
}
```

### 复杂度

$O(n+m+q)$。

---

## 11. [P5767 \[NOI1997\] 最优乘车](https://www.luogu.com.cn/problem/P5767)

`BFS` `图论建模`

### 题意

给出若干条单向巴士线路，每条线路会依次经过多个站点。旅客从 `1` 号站出发到 `N` 号站，要求换车次数最少。

### 分析

乘坐同一条巴士在线路上的任意后继站下车都不算换乘，所以可以把同一线路上前面的站向后面的站连一条“乘一次车”边。之后在站点图上做 BFS，得到最少乘车次数，再减一就是换乘次数。

### 核心代码

```cpp
for(auto &line:lines)
    for(int i=0;i<(int)line.size();i++)
        for(int j=i+1;j<(int)line.size();j++)
            g[line[i]].push_back(line[j]);

queue<int> q; dist[1]=1; q.push(1);
while(!q.empty()){
    int u=q.front(); q.pop();
    for(int v:g[u]) if(!dist[v]){
        dist[v]=dist[u]+1;
        q.push(v);
    }
}
```

### 复杂度

$O(\sum |route|^2)$。

---

## 12. [P1811 最短路](https://www.luogu.com.cn/problem/P1811)

`BFS` `状态图` `最短路`

### 题意

无权无向图上给出若干有序禁忌三元组 `(A,B,C)`，表示走到 `B` 且上一步来自 `A` 时不能继续走向 `C`。要求求出从 `1` 到 `N` 的最短合法路径并输出路径。

### 分析

限制依赖“前一个点”，因此把状态设为 `(pre,u)`。从 `(pre,u)` 扩展到 `(u,v)` 时，只要三元组 `(pre,u,v)` 不在禁集里即可，BFS 首次到达任何 `(*,N)` 就得到最短路。

### 核心代码

```cpp
queue<pair<int,int>> q;
q.push({0,1}); dist[0][1]=0;
while(!q.empty()){
    auto [pre,u]=q.front(); q.pop();
    for(int v:adj[u]){
        if(bad.count({pre,u,v})||dist[u][v]!=-1) continue;
        dist[u][v]=dist[pre][u]+1;
        from[u][v]={pre,u};
        q.push({u,v});
    }
}
```

### 复杂度

$O(n^2+m\Delta+k)$。

---

## 13. [CF59E Shortest Path](https://www.luogu.com.cn/problem/CF59E)

`BFS` `状态图` `最短路`

### 题意

城市之间道路长度全为 1，同时给出若干有序诅咒三元组 `(a,b,c)`，要求从 `1` 走到 `n` 时不能出现任意被禁止的连续三城访问顺序，并输出最短路线。

### 分析

和带前驱限制的最短路完全一致，状态必须记录“当前点 + 上一个点”。把所有禁用三元组放进哈希表，BFS 搜索 `(pre,u)` 到 `(u,v)` 的转移并保留前驱即可还原路线。

### 核心代码

```cpp
queue<pair<int,int>> q;
q.push({0,1}); dist[0][1]=0;
while(!q.empty()){
    auto [pre,u]=q.front(); q.pop();
    for(int v:g[u]){
        if(forbid.count({pre,u,v})||dist[u][v]!=-1) continue;
        dist[u][v]=dist[pre][u]+1;
        prv[u][v]={pre,u};
        q.push({u,v});
    }
}
```

### 复杂度

$O(n^2+m\Delta+k)$。

---

## 14. [P1608 路径统计](https://www.luogu.com.cn/problem/P1608)

`Dijkstra` `最短路计数`

### 题意

给定一张带权有向图，要求同时输出从 `1` 到 `N` 的最短距离以及这样的最短路径条数。

### 分析

跑 Dijkstra 时同时维护 `cnt[v]`。如果通过 `u` 找到更短路就直接覆盖距离和方案数；如果找到等长路，就把 `cnt[u]` 累加到 `cnt[v]` 上。

### 核心代码

```cpp
priority_queue<Node> pq;
dist[1]=0; cnt[1]=1; pq.push({1,0});
while(!pq.empty()){
    auto [u,d]=pq.top(); pq.pop();
    if(d!=dist[u]) continue;
    for(auto [v,w]:g[u]){
        if(dist[v]>d+w){
            dist[v]=d+w; cnt[v]=cnt[u];
            pq.push({v,dist[v]});
        }else if(dist[v]==d+w){
            cnt[v]+=cnt[u];
        }
    }
}
```

### 复杂度

$O(m\log n)$。

---

## 15. [P1144 最短路计数](https://www.luogu.com.cn/problem/P1144)

`BFS` `最短路计数`

### 题意

给定无向无权图，要求输出从 `1` 号点到每个点的最短路条数，答案对 `100003` 取模。

### 分析

无权图里“最短路”四个字，第一反应就该从 Dijkstra 切到 BFS，因为边权全是 `1` 时，BFS 分层顺序本身就是距离递增顺序。

计数的关键则在于看清“哪些路径还能算作最短路”。当你第一次到达某个点 `v` 时，当前层数一定就是它的最短距离，这时直接把前驱 `u` 的方案数赋给它；以后如果又从某个点走到 `v`，只有当这条新路长度仍等于 `dist[v]` 时，才说明找到了另一条同长度最短路，可以继续累加。

所以这题最值得记住的是一个分层思想：**无权图最短路计数 = BFS 定距离 + 只从上一层向下一层累加方案数。**

### 核心代码

```cpp
queue<int> q;
dist[1]=0; ways[1]=1; q.push(1);
while(!q.empty()){
    int u=q.front(); q.pop();
    for(int v:adj[u]){
        if(dist[v]==-1){
            dist[v]=dist[u]+1;
            ways[v]=ways[u];
            q.push(v);
        }else if(dist[v]==dist[u]+1){
            ways[v]=(ways[v]+ways[u])%100003;
        }
    }
}
```

### 复杂度

$O(n+m)$。

---

## 16. [P2934 \[USACO09JAN\] Safe Travel G](https://www.luogu.com.cn/problem/P2934)

`Dijkstra` `最短路树` `替代路径`

### 题意

对每个牧场 `i`，原来的最短路最后一条边上会有小妖精埋伏。要求求出每头牛避开自己那条“最后一条树边”后，从 `1` 到 `i` 的最短通行时间。

### 分析

先从 `1` 跑 Dijkstra 选出一棵最短路树。每条非树边 `(u,v)` 都能为树上 `u` 到 `v` 路径上的若干点提供一条绕开最后一条树边的备选答案，把这些候选值沿树路径打到节点上即可。

### 核心代码

```cpp
run_dijkstra();
for(auto e:edges) if(!in_tree[e.id]){
    int u=e.u,v=e.v;
    long long cand=dist[u]+dist[v]+e.w;
    upd_path(u,v,cand);
}
void upd_path(int u,int v,long long cand){
    while(find(u)!=find(v)){
        if(dep[find(u)]<dep[find(v)]) swap(u,v);
        int x=find(u); ans[x]=min(ans[x],cand-dist[x]);
        fa[x]=par[x];
    }
}
```

### 复杂度

$O((n+m)\log n)$。

---

## 17. [P2149 \[SDOI2009\] Elaxia的路线](https://www.luogu.com.cn/problem/P2149)

`Dijkstra` `最短路 DAG` `拓扑 DP`

### 题意

给定两个人各自的宿舍与实验室，要求在两人都走最短路的前提下，让两条路线的公共路径长度尽量长，方向相反也允许。

### 分析

两个人都必须走各自的最短路，这句话一下子把可选路线压缩掉了：真正可能出现在公共部分里的边，必须同时属于两个人某一组最短路。

因此先从四个端点分别跑最短路，再筛边就很自然了。若一条边 `(u,v)` 同时满足“它在甲的某条最短路上”和“它在乙的某条最短路上”，就把它放进交集图里。因为边方向必须顺着距离递增走，这张交集图天然是 DAG。

公共路径长度于是被改写成 DAG 上最长路；而题目允许方向相反，也就是要把两种端点配对方式都各做一次。所以这题最值得记住的是：**最短路公共段问题，先求最短路约束交集，再在交集 DAG 上做最长路。**

### 核心代码

```cpp
auto build=[&](int s1,int t1,int s2,int t2){
    vector<int> indeg(n+1); vector<vector<pair<int,int>>> dag(n+1);
    for(auto [u,v,w]:edges){
        if(d1[u]+w+r1[v]==d1[t1]&&d2[u]+w+r2[v]==d2[t2])
            dag[u].push_back({v,w}), indeg[v]++;
    }
    queue<int> q; for(int i=1;i<=n;i++) if(!indeg[i]) q.push(i);
    while(!q.empty()){ int u=q.front(); q.pop();
        for(auto [v,w]:dag[u]) dp[v]=max(dp[v],dp[u]+w),--indeg[v]||q.push(v);
    }
};
```

### 复杂度

$O(m\log n)$。

---

## 18. [P2505 \[HAOI2012\] 道路](https://www.luogu.com.cn/problem/P2505)

`Dijkstra` `最短路 DAG` `计数`

### 题意

对一张带权有向图，需要对每条边统计：有多少条不同的最短路径会经过这条边。

### 分析

固定一个源点 `s` 时，满足 `dis[u]+w=dis[v]` 的边构成最短路 DAG。拓扑序上向前统计从 `s` 到每点的最短路条数，反向再统计从每点出发的条数，二者乘积就是该源点对边的贡献。

### 核心代码

```cpp
for(int s=1;s<=n;s++){
    dijkstra(s);
    build_dag();
    topo_forward(); topo_backward();
    for(auto [u,v,id]:dag_edges)
        ans[id]+=1LL*f[u]*g[v];
}
```

### 复杂度

$O(n(m\log n+m))$。

---

## 19. [CF1163F Indecisive Taxi Fee](https://www.luogu.com.cn/problem/CF1163F)

`Dijkstra` `线段树` `最短路`

### 题意

原图是带权无向图，`q` 个询问各自独立地把某一条边的权值改成 `x`，要求输出修改后从 `1` 到 `n` 的最短路长度。

### 分析

先求出原图从两端出发的最短路，并选定一条原最短路径 `P`。不在 `P` 上的边会形成一条绕过 `P` 某段区间的备选方案，用线段树对这段区间做 `chmin`；而在 `P` 上的边改权时，则比较“仍走原路径”与“被备选方案替代”两类答案。

### 核心代码

```cpp
for(auto e:edges) if(!on_path[e.id]){
    int l=pos[belL(e.u,e.v)], r=pos[belR(e.u,e.v)];
    long long cand=min(du[e.u]+e.w+dv[e.v],du[e.v]+e.w+dv[e.u]);
    if(l<r) seg.chmin(l+1,r,cand);
}
for(auto [id,x]:qry){
    if(!on_path[id]) ans=min(base,du[u[id]]+x+dv[v[id]]);
    else ans=min(base-path_w[id]+x, seg.query(pos_edge[id]));
}
```

### 复杂度

$O((m+q)\log n)$。

---

## 20. [CF1005F Berland and the Shortest Paths](https://www.luogu.com.cn/problem/CF1005F)

`BFS` `最短路树` `构造`

### 题意

无权无向图中要构造最多 `k` 棵以 `1` 为根的最短路树：每个点都选一个来自上一层的父边，并输出对应边集。

### 分析

无权图里最短路树的本质约束只有一个：每个点的父边必须来自前一层。也就是说，先 BFS 分层后，每个点有哪些合法父边就已经完全确定了。

接下来题目要做的，其实不是再求最短路，而是在这些合法父边里给每个点各选一条。不同点的父边选择彼此独立，于是所有最短路树就对应于“每个点从自己的候选集合里挑一个父边”的笛卡尔积。

因此最自然的构造方式就是按点 DFS 枚举父边方案；因为题目只要前 `k` 棵，所以搜索到 `k` 个方案就立刻截断。这题最该建立的理解是：**最短路树枚举，本质是在分层后枚举每个点的合法前驱选择。**

### 核心代码

```cpp
bfs();
for(auto [u,v,id]:edges){
    if(dis[u]+1==dis[v]) par[v].push_back(id);
    if(dis[v]+1==dis[u]) par[u].push_back(id);
}
void dfs(int x){
    if(ans.size()==k) return;
    if(x>n){ ans.push_back(cur); return; }
    for(int id:par[x]){
        cur.push_back(id); dfs(x+1); cur.pop_back();
    }
}
```

### 复杂度

$O(n+m+kn)$。

---

## 21. [P10929 黑暗城堡](https://www.luogu.com.cn/problem/P10929)

`Dijkstra` `最短路 DAG` `计数`

### 题意

城堡房间与通道构成带权无向图，要求统计从 `1` 号房间出发的所有最短路生成树数量。

### 分析

这题不是直接数最短路条数，而是数“最短路生成树”的个数。区别在于：对每个点 `v`，你最终只需要在所有能保持最短路的前驱里选一个父亲边，就能把整棵最短路树定下来。

所以先跑一次 Dijkstra 求出每个点的最短距离。之后对每个点 `v
eq1`，去数有多少个邻点 `u` 满足 `dist[u]+w=dist[v]`；这些点就是 `v` 在最短路 DAG 上的合法前驱。

而为什么答案可以直接把这些个数相乘？因为每个点选哪个合法前驱，并不会改变别的点还能不能保持自己的最短距离。也就是说，最短路 DAG 上各点的父边选择是独立的。

### 核心代码

```cpp
dijkstra(1);
long long ans=1;
for(int v=2;v<=n;v++){
    int cnt=0;
    for(auto [u,w]:g[v]) if(dist[u]+w==dist[v]) cnt++;
    ans=ans*cnt%MOD;
}
```

### 复杂度

$O(m\log n)$。

---

# 三、Dijkstra 最短路

这一章先处理最标准的堆优化 Dijkstra、最短路树与最短路计数。

## 22. [CF1076D Edge Deletion](https://www.luogu.com.cn/problem/CF1076D)

`Dijkstra` `最短路树`

### 题意

删边后最多保留 `k` 条边，要求让尽可能多的点仍然保持与 `1` 号点相同的最短距离，并输出保留边编号。

### 分析

删边后还想让一个点保持原最短距离，它就必须还能沿着某条最短路链回到根。把所有点各选一条最短路前驱边后，就得到一棵最短路树；任何能被保住的点，都得连在这棵树上。

现在保留边数上限是 `k`，本质上是在这棵树里最多留下 `k` 条父边。若从根开始按层往下取边，每多保留一条树边，就会新增一个仍能保持最短距离的点，而且不会比别的选择更差。

所以这题最值得记住的是转换：**“删边但保最短路”先化成最短路树，再在树上挑最多 `k` 条有效父边。**

### 核心代码

```cpp
dijkstra();
queue<int> q; q.push(1);
while(!q.empty()&&ans.size()<k){
    int u=q.front(); q.pop();
    for(auto [v,id]:tree[u]){
        ans.push_back(id);
        if(ans.size()==k) break;
        q.push(v);
    }
}
```

### 复杂度

$O(m\log n)$。

---

## 23. [CF545E Paths and Trees](https://www.luogu.com.cn/problem/CF545E)

`Dijkstra` `最短路树`

### 题意

给定带权无向图和根 `s`，需要构造一棵最短路树，使所有点到 `s` 的距离保持最短，同时所选树边权值总和最小。

### 分析

这题先别急着想整棵树怎么一起优化。最短路树最重要的约束只有一个：对每个点 `v`，它的父边必须来自某条保持 `dist[v]` 不变的最短路入边。

一旦这个条件满足，点 `v` 选哪条父边并不会影响别的点还能不能保持自己的最短距离。因此总边权和最小化就被拆成了若干个独立子问题：每个点各自从合法前驱边里挑一条最轻的。

所以这题特别适合建立一个局部独立性的判断：**当每个点的最短路约束彼此独立时，全局最优树可以由各点的局部最优父边直接拼出来。**

### 核心代码

```cpp
dijkstra(s);
for(int v=1;v<=n;v++) if(v!=s){
    for(auto [u,w,id]:g[v])
        if(dist[u]+w==dist[v]&&w<best[v])
            best[v]=w,pre[v]=id;
    sum+=best[v];
}
```

### 复杂度

$O(m\log n)$。

---

## 24. [P5304 \[GXOI/GZOI2019\] 旅行者](https://www.luogu.com.cn/problem/P5304)

`Dijkstra` `多源最短路` `二进制分组`

### 题意

在有向图中给出 `k` 个特殊城市，要求求出任意两个不同特殊城市之间最短路长度的最小值。

### 分析

难点在于“任意两个不同特殊点之间”的最短路，若真去枚举点对再跑最短路会完全爆炸。真正该想的是：怎样在一次 Dijkstra 里同时代表一批起点，且保证每一对特殊点迟早会被区分开。

二进制分组正是干这件事。对某一位来说，把该位为 `0` 的特殊点接到超级源，跑一次正图最短路；再把该位为 `1` 的特殊点放到另一侧、在反图里跑一次。任意两点只要不同，总会在某一二进制位上分到两侧，于是它们之间的最短路就会在某一轮被统计到。

所以这题最值得迁移的是一种“批量分离”思维：**当需要考虑所有点对时，不一定枚举点对，也可以用若干轮二进制划分保证每对都被分开一次。**

### 核心代码

```cpp
for(int b=0;(1<<b)<k;b++){
    build_source(b,0); dijkstra(src,g);
    for(int x:spec) ans=min(ans,dist[x]);
    build_source(b,1); dijkstra(src,rg);
    for(int x:spec) ans=min(ans,dist[x]);
}
```

### 复杂度

$O(\log k\cdot m\log n)$。

---

## 25. [P4366 \[Code+#4\] 最短路](https://www.luogu.com.cn/problem/P4366)

`Dijkstra` `特殊建图` `位运算`

### 题意

城市之间默认可以按代价 $(i xor j)\times C$ 互达，另外还有若干条单向快捷通道。要求求出从起点到终点的最短路。

### 分析

完全图边数太大，关键是把 `xor` 代价拆成按位选择。建立一张按二进制分层的辅助图，从一个编号走到另一个编号的每一位翻转都会对应一条固定代价边，再和原有快捷通道一起跑 Dijkstra。

### 核心代码

```cpp
for(int x=1;x<=n;x++) link_number_to_trie(x);
for(int bit=0;bit<LOG;bit++)
    add_trie_edges(bit,1LL*c*(1<<bit));
for(auto [u,v,w]:extra) add_edge(id[u],id[v],w);
dijkstra(id[S]);
```

### 复杂度

$O((n\log n+m)\log(n\log n))$。

---

## 26. [UVA1048 Low Cost Air Travel](https://www.luogu.com.cn/problem/UVA1048)

`Dijkstra` `建图`

### 题意

每张联票都规定了一条固定飞行序列和价格，必须从首站开始乘坐，但可以在序列中任意后继城市下机。对每个询问，求到达目标城市的最小票价与方案。

### 分析

这题最容易被题面里的“联票”迷惑，以为状态要记“当前票坐到了第几站”。其实题目已经给出一个更强的自由度：每张联票必须从首站上车，但可以在之后任意一站下车。

这意味着一张联票本质上提供的是一组“从首站到后继各站”的同价跳跃边。只要把这些可能下车的位置全部连成普通有向边，原题就被完全翻译成了最短路问题。

所以这题最值得迁移的是建图意识：**当一个复杂操作允许你从同一个起点跳到若干目标，且代价相同，可以把它一次性展开成多条普通边，再交给最短路算法处理。**

### 核心代码

```cpp
for(auto &ticket:tickets)
    for(int i=1;i<(int)ticket.path.size();i++)
        g[ticket.path[0]].push_back({ticket.path[i],ticket.cost});
dijkstra(S);
while(t) route.push_back(t), t=pre[t];
reverse(route.begin(),route.end());
```

### 复杂度

$O(E\log V)$。

---

## 27. [UVA1078 Steam Roller](https://www.luogu.com.cn/problem/UVA1078)

`Dijkstra` `状态图`

### 题意

压路机在网格道路上行驶，转向与继续前进的代价不同，还要记录当前滚动方向与状态。要求求出起点到终点的最小时间。

### 分析

位置相同但朝向不同，后续可行决策完全不同，所以必须把方向一起放进状态。把 `(x,y,dir,state)` 看成图点，按题意连出直行、转弯与停机重启的转移后跑 Dijkstra 即可。

### 核心代码

```cpp
struct Node{int x,y,d,s; long long dis;};
priority_queue<Node> pq;
dist[sx][sy][4][2]=0; pq.push({sx,sy,4,0,0});
while(!pq.empty()){
    auto cur=pq.top(); pq.pop();
    if(cur.dis!=dist[cur.x][cur.y][cur.d][cur.s]) continue;
    relax_turn(cur); relax_go(cur);
}
```

### 复杂度

$O(nm\log(nm))$。

---

# 四、分层图与多状态最短路

一旦路径上同时受“优惠次数、货币、边数、最大值”这类状态约束，就把状态拆进点集，转成多层最短路。

## 28. [P13271 \[NOI2025\] 机器人](https://www.luogu.com.cn/problem/P13271)

`分层图` `Dijkstra` `状态图`

### 题意

机器人在路口 `x` 时，若当前参数为 `p`，就只能走 `x` 的第 `p` 条出边；参数可在 $1\sim k$ 间上下调整并支付代价。要求求出从仓库到礼堂的最小总代价。

### 分析

把 `(路口,参数)` 看成分层图节点：同一层之间按第 `p` 条出边连道路长度，竖向边表示把参数 `p` 调成 $p\pm1$ 的修改费用。这样所有操作都变成普通边权，直接 Dijkstra。

### 核心代码

```cpp
for(int u=1;u<=n;u++) for(int p=1;p<=k;p++){
    if(p<k) add(id(u,p),id(u,p+1),up[p]);
    if(p>1) add(id(u,p),id(u,p-1),down[p]);
    if(p<=(int)out[u].size())
        add(id(u,p),id(out[u][p-1].to,p),out[u][p-1].w);
}
dijkstra(id(S,1));
```

### 复杂度

$O((nk+m)\log(nk))$。

---

## 29. [P9751 \[CSP-J 2023\] 旅游巴士](https://www.luogu.com.cn/problem/P9751)

`分层图` `Dijkstra` `同余最短路`

### 题意

游客必须在时刻为 `k` 的倍数时进入景区，也必须在时刻为 `k` 的倍数时从 `n` 号点离开；每条边只能在开放时间 `a_i` 之后通过，且途中不能停留，求最早离开时间。

### 分析

时间是否能赶上巴士只和当前时刻对 `k` 取模有关，所以把节点扩成 $n\times k$ 层。走一条边前若当前时刻早于 `a_i`，只能沿环多转若干圈补时间；计算好下一层编号后跑 Dijkstra 即可。

### 核心代码

```cpp
while(!pq.empty()){
    auto [u,r,d]=pq.top(); pq.pop();
    if(d!=dist[u][r]) continue;
    for(auto [v,a]:g[u]){
        long long t=d;
        if(t<a) t+=((a-t+k-1)/k)*k;
        long long nd=t+1;
        int nr=nd%k;
        if(nd<dist[v][nr]) dist[v][nr]=nd,pq.push({v,nr,nd});
    }
}
```

### 复杂度

$O(mk\log(nk))$。

---

## 30. [AT_abc164_e \[ABC164E\] Two Currencies](https://www.luogu.com.cn/problem/AT_abc164_e)

`分层图` `Dijkstra` `状态图`

### 题意

每条道路会消耗银币和时间，每个城市还能花金币兑换银币并消耗时间。给定初始银币数，要求求出从 `1` 出发到其余各城的最短时间。

### 分析

银币数量会影响能否走边，所以把状态设成 `(城市,当前银币)`。银币超过阈值以后没有区分意义，可以统一截断到上界，再把“兑换一次”和“走一条路”都当成边跑 Dijkstra。

### 核心代码

```cpp
const int LIM=2500;
priority_queue<Node> pq;
dist[1][min(S,LIM)]=0; pq.push({1,min(S,LIM),0});
while(!pq.empty()){
    auto [u,c,d]=pq.top(); pq.pop();
    if(d!=dist[u][c]) continue;
    int nc=min(LIM,c+add[u]);
    relax(u,nc,d+cost[u]);
    for(auto [v,need,t]:g[u]) if(c>=need)
        relax(v,c-need,d+t);
}
```

### 复杂度

$O(nLIM\log(nLIM)+mLIM\log(nLIM))$。

---

## 31. [CF1473E Minimum Path](https://www.luogu.com.cn/problem/CF1473E)

`分层图` `Dijkstra`

### 题意

对每个点 `v`，要求求一条从 `1` 到 `v` 的路径，使路径代价为“边权和减去最大边再加上最小边”的最小值。

### 分析

把“减去一条边”和“额外加上一条边”视作两次特殊操作，分别对应免费一次、双倍一次。四层状态 `(u,free_used,double_used)` 足以表示是否已经使用过这两次操作，转移时在当前边上决定是否使用。

### 核心代码

```cpp
for(auto [v,w]:g[u]){
    relax(v,a,b,d+w);
    if(!a) relax(v,1,b,d);
    if(!b) relax(v,a,1,d+2*w);
    if(!a&&!b) relax(v,1,1,d+w);
}
```

### 复杂度

$O(m\log n)$。

---

## 32. [CF1915G Bicycles](https://www.luogu.com.cn/problem/CF1915G)

`分层图` `Dijkstra` `状态图`

### 题意

每个城市都可以买一辆自行车，骑车经过长度为 `w` 的道路会花费 $w\times s$，其中 `s` 是当前所骑自行车的速度参数。允许在经过的城市换车，要求最小总代价。

### 分析

决定后续花费的不是历史路径本身，而是“迄今为止买过的最优车速”。因此把状态设为 `(城市,当前最小速度)`，走边时费用加 $w\times speed$，到新城市时可以把速度更新为 `min(speed,s[v])`。

### 核心代码

```cpp
priority_queue<Node> pq;
dist[1][bike[1]]=0; pq.push({1,bike[1],0});
while(!pq.empty()){
    auto [u,s,d]=pq.top(); pq.pop();
    if(d!=dist[u][s]) continue;
    for(auto [v,w]:g[u]){
        int ns=min(s,bike[v]);
        long long nd=d+1LL*w*s;
        if(nd<dist[v][ns]) dist[v][ns]=nd,pq.push({v,ns,nd});
    }
}
```

### 复杂度

$O(n^2\log n+m n\log n)$。

---

## 33. [P1948 \[USACO08JAN\] Telephone Lines S](https://www.luogu.com.cn/problem/P1948)

`分层图` `二分` `0-1 BFS`

### 题意

在电话线网络里可以容忍至多 `k` 条“很长”的边，要求找一条从 `1` 到 `n` 的路线，使其中最长的那批边尽量短，输出这个最小阈值。

### 分析

二分答案 `x` 后，把边长 `>x` 的边视为代价 1，否则代价 0。若 0-1 BFS 算出从 `1` 到 `n` 经过的“超长边”条数不超过 `k`，说明阈值 `x` 可行。

### 核心代码

```cpp
bool check(int lim){
    deque<int> q; fill(cnt,cnt+n+1,INF);
    cnt[1]=0; q.push_back(1);
    while(!q.empty()){
        int u=q.front(); q.pop_front();
        for(auto [v,w]:g[u]){
            int c=cnt[u]+(w>lim);
            if(c<cnt[v]){
                cnt[v]=c;
                (w>lim)?q.push_back(v):q.push_front(v);
            }
        }
    }
    return cnt[n]<=k;
}
```

### 复杂度

$O((n+m)\log W)$。

---

## 34. [P4568 \[JLOI2011\] 飞行路线](https://www.luogu.com.cn/problem/P4568)

`分层图` `Dijkstra`

### 题意

城市之间有带权航线，旅途中至多可以把 `k` 段航线免费坐掉。要求求出从起点到终点的最小花费。

### 分析

这题表面上是航线优惠，实质上是路径上多了一种有限资源：你还剩多少次“免费坐”的机会。于是状态不能只记当前城市，还要记已经用了几次免费机会。

分层图正是把这种资源次数显式展开。状态 `(u,t)` 表示到达城市 `u` 且已经用了 `t` 次免费机会；沿一条航线走时，要么正常付费留在本层，要么在 `t<k` 时跨到下一层并付费 `0`。

这样所有“要不要在这条边上用券”的决策都被吸进了图结构里，外层只剩标准最短路。所以这题最值得形成的模板感是：**优惠次数受限时，把次数拆成层，选择优惠就等于跨层。**

### 核心代码

```cpp
for(int u=0;u<n;u++) for(int t=0;t<=k;t++)
    for(auto [v,w]:g[u]){
        add(id(u,t),id(v,t),w);
        if(t<k) add(id(u,t),id(v,t+1),0);
    }
dijkstra(id(s,0));
```

### 复杂度

$O(km\log(kn))$。

---

## 35. [P2939 \[USACO09FEB\] Revamping Trails G](https://www.luogu.com.cn/problem/P2939)

`分层图` `Dijkstra`

### 题意

从 `1` 到 `N` 的路上可以把至多 `K` 条小径整修成长度 `0`，要求求出整修后的最短路径长度。

### 分析

这题的限制是“最多有 `K` 条边可以免费走”，一看到“使用次数受限的优惠”就该想到把次数拆进状态。因为路径好坏不再只取决于当前在哪个点，还取决于已经用了多少次优惠。

于是把每个点复制成 `K+1` 层，状态 `(u,t)` 表示到达 `u` 时已经用了 `t` 次免费机会。普通走边留在本层并支付原权值，免费走一条边则跨到下一层且代价为 `0`。

所以这题最该形成条件反射的是：**当路径上有“还能用几次券 / 技能 / 免费机会”这类资源限制时，优先考虑分层图。**

### 核心代码

```cpp
priority_queue<Node> pq;
dist[1][0]=0; pq.push({1,0,0});
while(!pq.empty()){
    auto [u,t,d]=pq.top(); pq.pop();
    if(d!=dist[u][t]) continue;
    for(auto [v,w]:g[u]){
        relax(v,t,d+w);
        if(t<k) relax(v,t+1,d);
    }
}
```

### 复杂度

$O(km\log(kn))$。

---

## 36. [P4822 \[BJWC2012\] 冻结](https://www.luogu.com.cn/problem/P4822)

`分层图` `Dijkstra`

### 题意

从 `1` 到 `N` 的最短路上可以使用 `K` 张冻结券，每张券可把一条边的花费减半一次。要求求出最小总代价。

### 分析

和上一题同样是“优惠次数受限”的最短路，只不过这里用券后不是变成 `0`，而是把边权减半。状态结构却完全一样：当前在哪个点、已经用了多少张券。

因此分层图的意义并没有变。普通走边时留在原层并支付 `w`，使用一张冻结券时跨到下一层并支付 `w/2`。所有复杂约束都被吸收到状态图中后，外层算法仍然只是标准 Dijkstra。

这题很适合拿来建立一个统一视角：**分层图并不关心“优惠怎么定义”，只关心这个优惠是否能被表示成层与层之间的有限状态转移。**

### 核心代码

```cpp
for(int u=1;u<=n;u++) for(int t=0;t<=k;t++)
    for(auto [v,w]:g[u]){
        relax(v,t,dist[u][t]+w);
        if(t<k) relax(v,t+1,dist[u][t]+w/2);
    }
```

### 复杂度

$O(km\log(kn))$。

---

# 五、最短路综合应用

这一章集中放 Dijkstra 建模题：问题外壳各不相同，但本质都是“构图 + 松弛 + 代价定义”。

## 37. [P10947 \[BAPC 2006 资格赛\] Sightseeing](https://www.luogu.com.cn/problem/P10947)

`Dijkstra` `最短路 DAG` `计数`

### 题意

从固定起点 `S` 到终点 `F`，旅游巴士只允许走长度为最短路或最短路加 1 的路线。要求统计这样的不同路线条数。

### 分析

先求出 `S` 和 `F` 两侧的最短路。对每条边计算它相对最短路的“额外代价”是否为 0 或 1，再在按最短路距离排序的 DAG 上做 `dp[点][是否已经多走 1]` 计数即可。

### 核心代码

```cpp
dijkstra(S,ds); dijkstra(F,dt);
dp[S][0]=1;
for(int u:ord) for(auto [v,w]:g[u]){
    int extra=ds[u]+w+dt[v]-ds[F];
    if(extra==0) dp[v][0]+=dp[u][0], dp[v][1]+=dp[u][1];
    if(extra==1) dp[v][1]+=dp[u][0];
}
```

### 复杂度

$O(m\log n)$。

---

## 38. [U262369 选择最佳线路](https://www.luogu.com.cn/problem/U262369)

`Dijkstra` `多源最短路`

### 题意

公交站之间存在单向线路，给出若干个允许上车的起点和一个目标站 `s`，要求求出从任意可选起点到 `s` 的最短时间。

### 分析

这题和前面多起点最短路的关键完全一样：答案要求的是“从若干允许上车的站点中任选一个”到目标站的最短时间，而不是指定某个唯一源点。

只要把一个虚拟源连向所有合法起点，边权都设为 `0`，原题就被改写成了普通的单源最短路。之后跑一次 Dijkstra，目标站的距离自然就是所有起点中最优的那一个。

所以这种题最该形成模板感：**多个等价出发点，不要重复跑多次最短路，先试超级源统一建模。**

### 核心代码

```cpp
int src=0;
for(int x:start) g[src].push_back({x,0});
dijkstra(src);
cout<<dist[s];
```

### 复杂度

$O(m\log n)$。

---

## 39. [T441226 选择最佳线路](https://www.luogu.com.cn/problem/T441226)

`Dijkstra` `多源最短路`

### 题意

题意与“选择最佳线路”相同：给定若干可选起点和一个终点 `s`，求从任意起点到 `s` 的最短路。

### 分析

这类“有多个可能起点，问到终点的最短路”问题，最容易写成对每个起点各跑一次最短路。但真正更自然的做法，是把这些起点统一接到一个超级源上，边权设为 `0`。

这样一来，原题就被改写成了一个标准单源最短路：从超级源出发到终点的最短距离，恰好等于“所有候选起点中挑一个最优起点”的答案。

所以这题最该学会的是一个建模动作：**当题目有多个等价起点或终点时，不必重复跑最短路，常常只要补一个超级源 / 超级汇就能统一处理。**

### 核心代码

```cpp
int src=0;
for(int x:start) add_edge(src,x,0);
dijkstra(src);
answer=dist[s];
```

### 复杂度

$O(m\log n)$。

---

## 40. [P1462 通往奥格瑞玛的道路](https://www.luogu.com.cn/problem/P1462)

`二分` `Dijkstra` `最短路`

### 题意

每个城市有过路费，每条公路会损失血量。要求在总血量损失不超过 `b` 的前提下，从 `1` 到 `n` 的路径上最大过路费尽量小。

### 分析

把答案设成费用上限 `x`，只保留过路费 $\le x$ 的城市，再在剩余图上跑一遍按血量损失计权的 Dijkstra。若最短损失不超过 `b`，说明这个上限可行，于是二分 `x`。

### 核心代码

```cpp
bool check(int lim){
    if(cost[1]>lim||cost[n]>lim) return false;
    fill(dist,dist+n+1,INF); dist[1]=0;
    priority_queue<Node> pq; pq.push({1,0});
    while(!pq.empty()){
        auto [u,d]=pq.top(); pq.pop();
        if(d!=dist[u]) continue;
        for(auto [v,w]:g[u]) if(cost[v]<=lim&&d+w<dist[v])
            dist[v]=d+w,pq.push({v,dist[v]});
    }
    return dist[n]<=b;
}
```

### 复杂度

$O(m\log n\log V)$。

---

## 41. [P5764 \[CQOI2005\] 新年好](https://www.luogu.com.cn/problem/P5764)

`Dijkstra` `枚举`

### 题意

从 `1` 号站出发，要拜访给定的 5 个亲戚所在站点，顺序任意，求总路程最短的方案。

### 分析

这题真正的图上难点，其实只在“关键点之间的最短路”上。因为最后必须拜访的目标点只有 `5` 个，再加上起点 `1`，真正会出现在最优顺序里的关键位置总共也只有 `6` 个。

所以先从这 `6` 个关键点各跑一次 Dijkstra，拿到两两最短路，再把原问题缩成一个很小的排列枚举：从 `1` 出发，按某种顺序拜访那 `5` 个亲戚，路径总代价是多少。

因此这题最值得迁移的是“先缩后搜”的思路：**当原图很大，但真正要排列或 DP 的关键点极少时，先预处理关键点间距离，再在小状态空间里暴力 / DP。**

### 核心代码

```cpp
vector<int> key={1,a,b,c,d,e};
for(int i=0;i<6;i++) dijkstra(key[i],dis[i]);
sort(ord.begin(),ord.end());
do{
    long long cur=0,last=0;
    for(int x:ord) cur+=dis[last][x],last=x;
    ans=min(ans,cur);
}while(next_permutation(ord.begin(),ord.end()));
```

### 复杂度

$O(6m\log n+5!)$。

---

## 42. [P6822 \[PA 2012 Finals\] Tax](https://www.luogu.com.cn/problem/P6822)

`Dijkstra` `状态图`

### 题意

一条路径经过内部点的代价是进入边和离开边边权的较大值，起点只算第一条边，终点只算最后一条边。要求求出从 `1` 到 `n` 的最小总代价。

### 分析

代价取决于“上一条边的边权”，所以状态应放在有向边上。若当前是通过权值 `last` 的边来到 `u`，再走一条权值 `w` 的边去 `v`，新增代价就是 `max(last,w)`。

### 核心代码

```cpp
for(auto [v,w,id]:g[1]) dist[id]=w,pq.push({id,w});
while(!pq.empty()){
    auto [eid,d]=pq.top(); pq.pop();
    int u=to[eid], last=val[eid];
    for(auto [v,w,nid]:g[u]){
        long long nd=d+max(last,w);
        if(nd<dist[nid]) dist[nid]=nd,pq.push({nid,nd});
    }
}
```

### 复杂度

$O(m\log m)$。

---

## 43. [P11860 \[CCC 2025 Senior\] 熔岩路 / Floor is Lava](https://www.luogu.com.cn/problem/P11860)

`Dijkstra` `状态图` `建模`

### 题意

通过温度为 `c` 的隧道时，靴子的冷却等级必须恰好等于 `c`；在房间里可以花金币把冷却等级加减。要求求出从 `1` 到 `n` 的最小金币花费。

### 分析

真正有用的冷却等级只有各条隧道的温度。把每个房间与其 incident 隧道温度构成状态，房间内不同温度状态之间按差值连边，沿温度为 `c` 的隧道则在两端的 `c` 状态之间零代价转移。

### 核心代码

```cpp
for(int u=1;u<=n;u++){
    sort(tmp[u].begin(),tmp[u].end());
    for(int i=1;i<(int)tmp[u].size();i++){
        int a=id(u,i-1), b=id(u,i), d=tmp[u][i]-tmp[u][i-1];
        add(a,b,d), add(b,a,d);
    }
}
for(auto [u,v,c]:edges) add(pos[u][c],pos[v][c],0), add(pos[v][c],pos[u][c],0);
dijkstra(pos[1][0]);
```

### 复杂度

$O(m\log m)$。

---

## 44. [U262078 昂贵的聘礼](https://www.luogu.com.cn/problem/U262078)

`Dijkstra` `枚举` `最短路`

### 题意

每件物品可以直接用金币买，也可以先换来别的物品再降低价格；但所有交易对象的等级必须落在某个宽度受限的区间内。要求求出娶到酋长女儿所需的最少金币。

### 分析

这题最烦人的条件不是兑换关系，而是“所有参与交易的人等级必须落在一个宽度不超过 `m` 的区间里”。这说明真正的决策第一步不是走哪条边，而是先选哪一个合法等级窗口。

由于目标物品等级必须在窗口内，所以窗口左端点其实只需在 `lv[1]-m .. lv[1]` 间枚举。固定一个窗口后，所有等级不在窗口里的物品都被整批禁用，剩下的兑换关系和直接购买关系就变成了一张普通最短路图。

因此这题的结构非常清楚：**外层枚举合法等级区间，内层在该区间诱导出的交易图上跑最短路。** 一旦识别出这个“两层决策”，实现就顺了。

### 核心代码

```cpp
for(int low=lv[1]-m;low<=lv[1];low++){
    int high=low+m;
    fill(dist,dist+n+1,INF); dist[0]=0;
    priority_queue<Node> pq; pq.push({0,0});
    while(!pq.empty()){
        auto [u,d]=pq.top(); pq.pop();
        if(d!=dist[u]) continue;
        for(auto [v,w]:g[u]) if(low<=lv[v]&&lv[v]<=high&&d+w<dist[v])
            dist[v]=d+w,pq.push({v,dist[v]});
    }
    ans=min(ans,dist[1]);
}
```

### 复杂度

$O(nm\log n)$。

---

## 45. [P1629 邮递员送信](https://www.luogu.com.cn/problem/P1629)

`Dijkstra` `反图` `最短路`

### 题意

邮递员要从 `1` 出发把邮件分别送到 $2\sim n$，并且每送完一件都要回到 `1`。给定单向道路，要求总耗时最小。

### 分析

邮递员送每封信都要回到 `1`，所以总答案看起来像很多次往返叠加。真正该拆开的，是“去程”和“回程”这两组最短路。

从 `1` 到所有点的最短距离，直接在原图跑一次 Dijkstra 就够；而每个点回到 `1` 的最短距离，若你在原图逐点跑会太慢，但把所有边反向后，再从 `1` 跑一次 Dijkstra，得到的恰好就是原图里“各点到 `1`”的最短路。

所以这题最值得记住的是反图技巧：**当你需要很多个点到同一个终点的最短路时，往往把图反过来，从终点跑一次就能统一得到。**

### 核心代码

```cpp
dijkstra(1,g,dis1);
dijkstra(1,rg,dis2);
long long ans=0;
for(int i=2;i<=n;i++) ans+=dis1[i]+dis2[i];
```

### 复杂度

$O(m\log n)$。

---

## 46. [P1576 最小花费](https://www.luogu.com.cn/problem/P1576)

`Dijkstra` `乘法最短路`

### 题意

每条转账边都会扣掉一定百分比的手续费，要求计算最少需要转出多少钱，才能让终点账户实际收到 100 元。

### 分析

如果边的保留比例是 `p`，整条路径的到账比例就是若干 `p` 的乘积。于是问题变成最大化从 `A` 到 `B` 的乘积比例，可以直接跑“最大乘积版 Dijkstra”，最后输出 `100 / best[B]`。

### 核心代码

```cpp
priority_queue<pair<double,int>> pq;
best[A]=1.0; pq.push({1.0,A});
while(!pq.empty()){
    auto [r,u]=pq.top(); pq.pop();
    if(r<best[u]) continue;
    for(auto [v,p]:g[u]) if(best[v]<best[u]*p){
        best[v]=best[u]*p;
        pq.push({best[v],v});
    }
}
```

### 复杂度

$O(m\log n)$。

---

## 47. [P2886 \[USACO07NOV\] Cow Relays G](https://www.luogu.com.cn/problem/P2886)

`矩阵快速幂` `Floyd` `最短路`

### 题意

给定一张无向图，要求求出从 `S` 到 `E` 恰好经过 `N` 条边的最短路径长度。

### 分析

“恰好走 `N` 条边”这句话非常关键，因为它说明状态转移是按边数一层层叠加的，而不是普通最短路那种任意条边都行。

若把邻接矩阵看成一次走一条边的转移，那么走两条边、四条边、八条边都可以通过矩阵合成得到。只是这里的矩阵乘法不再是普通乘加，而是最短路里的 `min-plus` 半环：合并中转点取最小，路径长度做加法。

所以这题最重要的不是背 `min-plus` 这个词，而是认出：**“恰好若干步”的最短路，本质就是按步数做快速幂。**

### 核心代码

```cpp
Matrix mul(Matrix A,Matrix B){
    Matrix C(INF);
    for(int i=1;i<=tot;i++) for(int k=1;k<=tot;k++) if(A[i][k]<INF)
        for(int j=1;j<=tot;j++)
            C[i][j]=min(C[i][j],A[i][k]+B[k][j]);
    return C;
}
while(N){ if(N&1) ans=mul(ans,base); base=mul(base,base); N>>=1; }
```

### 复杂度

$O(tot^3\log N)$。

---

## 48. [P1522 \[USACO2.4\] 牛的旅行 Cow Tours](https://www.luogu.com.cn/problem/P1522)

`Floyd` `直径` `枚举`

### 题意

若干牧场构成多个连通块，现在允许额外连一条边。要求使新图的直径尽量小，并输出这个最小直径。

### 分析

先 Floyd 求每个连通块内部任意两点最短路，再求每个点的离心率与每个块的原直径。若连接不同连通块中的 `i,j`，新直径就是 `max(原直径, ecc[i]+|ij|+ecc[j])`，枚举取最小即可。

### 核心代码

```cpp
floyd();
for(int i=1;i<=n;i++) for(int j=1;j<=n;j++) if(dis[i][j]<INF)
    ecc[i]=max(ecc[i],dis[i][j]),dia[bel[i]]=max(dia[bel[i]],dis[i][j]);
for(int i=1;i<=n;i++) for(int j=1;j<=n;j++) if(dis[i][j]==INF)
    ans=min(ans,max({mx_dia,ecc[i]+calc(i,j)+ecc[j]}));
```

### 复杂度

$O(n^3)$。

---

## 49. [P4306 \[JSOI2010\] 连通数](https://www.luogu.com.cn/problem/P4306)

`Floyd` `bitset` `传递闭包`

### 题意

连通数定义为有向图中可达点对 `(u,v)` 的个数（包含 `u=v`）。给定图后要求输出它的连通数。

### 分析

这题表面在数“连通数”，其实本质只是问有多少有序点对满足可达。也就是说，一旦知道整张图的传递闭包，答案就只剩统计闭包矩阵里有多少个 `1`。

因此真正的工作是求可达性而不是距离。布尔 Floyd 正好能逐步扩张“允许经过哪些中转点”，而 `bitset` 则把一整行可达集合的并运算压成机器字并行。

所以这题非常适合和传递闭包模板绑定记忆：**先求 reachability，再把可达对数按行累计。**

### 核心代码

```cpp
for(int i=1;i<=n;i++) reach[i][i]=1;
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        if(reach[i][k]) reach[i]|=reach[k];
long long ans=0;
for(int i=1;i<=n;i++) ans+=reach[i].count();
```

### 复杂度

$O(\frac{n^3}{\omega})$。

---

## 50. [P1828 \[USACO3.2\] 香甜的黄油 Sweet Butter](https://www.luogu.com.cn/problem/P1828)

`Dijkstra` `最短路` `枚举`

### 题意

多头奶牛分布在不同牧场，要求选择一个牧场放糖，使所有奶牛走到那里所需的总距离最小。

### 分析

这题和 Best Spot 的结构很像：选一个汇合点，使所有奶牛走到这里的总代价最小。区别只在于这里图更稀疏、更适合对每个候选点跑 Dijkstra 而不是 Floyd。

固定一个候选牧场 `s` 后，总代价就是所有奶牛所在位置到 `s` 的最短距离和；若同一牧场上有多头奶牛，就用出现次数乘距离一起累加即可。

所以这题训练的是一层很常见的枚举框架：**先固定答案点，再把它的评价值写成“到一批特殊点的最短路和”，最后用最合适的全源 / 多次单源算法去实现。**

### 核心代码

```cpp
for(int s=1;s<=P;s++){
    dijkstra(s);
    long long cur=0;
    for(int i=1;i<=P;i++) cur+=1LL*cow_cnt[i]*dist[i];
    ans=min(ans,cur);
}
```

### 复杂度

$O(P(C+N)\log P)$。

---

## 51. [T478723 信使](https://www.luogu.com.cn/problem/T478723)

`Floyd` `最短路`

### 题意

指挥部在 `1` 号哨所，同时可以派出任意多名信使沿边传令。要求求出所有哨所都收到命令所需的最短时间。

### 分析

“可以同时派任意多名信使”这句话很容易让人多想，其实它只说明不同分支上的传递可以并行进行。于是总完成时间不会是所有路径长度之和，而只取决于最慢那个哨所什么时候收到消息。

因此问题马上简化成：求 `1` 号点到所有点的最短路，然后在这些最短距离里取最大值。点数较小时用 Floyd 很直接，若有不可达点则说明总有哨所收不到消息，答案就是 `-1`。

所以这题最该形成的直觉是：**当传播可以完全并行时，总时间通常是“单点最短到达时间”的最大值，而不是总和。**

### 核心代码

```cpp
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        for(int j=1;j<=n;j++)
            dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
int ans=0;
for(int i=1;i<=n;i++) ans=max(ans,dis[1][i]);
```

### 复杂度

$O(n^3)$。

---

## 52. [U167571 信使](https://www.luogu.com.cn/problem/U167571)

`Floyd` `最短路`

### 题意

题意与“信使”相同：指挥部在 `1` 号哨所，可以同时并行派信使，求最短多久能把命令传遍所有哨所。

### 分析

这题和前面的“信使”其实是同一个判断：既然可以同时派出任意多名信使，真正限制总完成时间的，就只剩最后一个收到消息的哨所。

因此答案绝不是把所有送信路线长度加起来，而是看 `1` 号点到所有点的最短到达时间里，最大的那一个是多少。点数小的时候直接 Floyd 最直观；若出现不可达点，则说明无论怎样并行派人都无法传遍全图。

所以这题最值得固化的直觉仍然是：**并行传播类问题，常把“总耗时”改写成“最短到达时间的最大值”。**

### 核心代码

```cpp
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        for(int j=1;j<=n;j++)
            dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
for(int i=1;i<=n;i++) ans=max(ans,dis[1][i]);
```

### 复杂度

$O(n^3)$。

---

# 六、最短路模板与最小环

最后把 Johnson、SPFA、Floyd 模板和最小环问题收在一起，方便统一回看。

## 53. [P6175 无向图的最小环问题](https://www.luogu.com.cn/problem/P6175)

`Floyd` `最小环`

### 题意

给定一张无向带权图，要求输出最小简单环的长度；若图中不存在环则输出 `No solution.`。

### 分析

和前面的最小环题完全同模：枚举中转点 `k` 时，先用仅经过 `<k` 点的最短路 `dis[i][j]` 去更新 `i-j-k-i` 形成的环，再把 `k` 纳入 Floyd 转移。

### 核心代码

```cpp
int ans=INF;
for(int k=1;k<=n;k++){
    for(int i=1;i<k;i++) for(int j=i+1;j<k;j++)
        ans=min(ans,dis[i][j]+g[i][k]+g[k][j]);
    for(int i=1;i<=n;i++) for(int j=1;j<=n;j++)
        dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
}
```

### 复杂度

$O(n^3)$。

---

## 54. [P5905 【模板】全源最短路（Johnson）](https://www.luogu.com.cn/problem/P5905)

`Johnson` `最短路模板`

### 题意

给定可能含负边但无负环的有向图，要求输出所有点对间的最短路长度。

### 分析

Johnson 先加超级源跑 Bellman-Ford / SPFA 求势能 `h`，把所有边重标成非负后，再从每个点出发跑一遍 Dijkstra。最后把结果减去势能差还原原图距离。

### 核心代码

```cpp
spfa(super);
for(auto &e:edges) e.w+=h[e.u]-h[e.v];
for(int s=1;s<=n;s++){
    dijkstra(s);
    for(int v=1;v<=n;v++)
        ans[s][v]=dis[v]-h[s]+h[v];
}
```

### 复杂度

$O(nm\log n)$。

---

## 55. [B3647 【模板】Floyd](https://www.luogu.com.cn/problem/B3647)

`Floyd` `模板`

### 题意

给定一张无向连通图，要求输出所有点对之间的最短路径长度。

### 分析

Floyd 最容易被背成三重循环，但真正要理解的是状态含义：`dis[i][j]` 不是抽象地表示最短路，而是表示“当前只允许经过编号不超过某个范围的中转点时，`i` 到 `j` 的最短距离”。

这样当你枚举新中转点 `k` 时，所有可能变优的路径都只有两种情况：要么不经过 `k`，保持原值；要么经过 `k`，于是长度变成 `dis[i][k] + dis[k][j]`。三重循环的转移因此就非常自然。

所以这题真正该记的是：**Floyd 的本质是按中转点集合逐步扩张状态，而不是机械三重循环。**

### 核心代码

```cpp
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        for(int j=1;j<=n;j++)
            dis[i][j]=min(dis[i][j],dis[i][k]+dis[k][j]);
```

### 复杂度

$O(n^3)$。

---

## 56. [P2910 \[USACO08OPEN\] Clear And Present Danger S](https://www.luogu.com.cn/problem/P2910)

`Floyd` `最短路`

### 题意

给定任意两岛之间直接航行的危险指数，以及必须按顺序经过的一串关键岛屿。要求求出满足顺序条件时的最小总危险指数。

### 分析

这题看起来有一串必须经过的岛屿，容易误以为要做路径规划 DP。其实顺序已经被题目固定死了，所以你并不需要决定“经过哪些点”，只需要知道“相邻两个关键岛屿之间最短怎么走”。

因此最核心的一步是先把原图变成任意两点之间的最短路闭包。点数不大时，直接 Floyd 求出所有点对最短路；之后把必须经过的序列按顺序拆成若干段，相邻两段最短路长度相加就是总答案。

所以这题训练的是一个常见转化：**当经过点序列已经固定时，整体路径问题往往能拆成若干段点对最短路的求和。**

### 核心代码

```cpp
floyd();
long long ans=0;
for(int i=1;i<m;i++) ans+=dis[a[i]][a[i+1]];
cout<<ans;
```

### 复杂度

$O(n^3)$。

---

## 57. [P2888 \[USACO07NOV\] Cow Hurdles S](https://www.luogu.com.cn/problem/P2888)

`Floyd` `minimax`

### 题意

每条有向道路有一个栏杆高度，询问多次 $A\to B$ 时，要求路径上最高栏杆尽量低，并输出这个最小可能高度。

### 分析

把最短路中的加法改成“路径最大边权”，转移改成 `dis[i][j]=min(dis[i][j],max(dis[i][k],dis[k][j]))`，就是 Floyd 的 minimax 版。

### 核心代码

```cpp
for(int k=1;k<=n;k++)
    for(int i=1;i<=n;i++)
        for(int j=1;j<=n;j++)
            dis[i][j]=min(dis[i][j],max(dis[i][k],dis[k][j]));
```

### 复杂度

$O(n^3)$。

---

## 58. [P2935 \[USACO09JAN\] Best Spot S](https://www.luogu.com.cn/problem/P2935)

`Floyd` `最短路` `枚举`

### 题意

给定若干头奶牛最喜欢的牧场，要求找一个牧场作为睡觉地点，使到所有这些喜欢牧场的平均路程最短。

### 分析

题目问的是找一个集合外的位置，使它到一组指定点的平均距离最小。真正的优化决策只有一个：最终选哪个牧场；而一旦候选牧场固定，它的代价就是到所有喜欢牧场的最短距离之和。

因此先求全源最短路，再枚举候选点就是顺理成章的做法。点数不大时 Floyd 最直接，之后对每个候选牧场把到所有喜欢牧场的距离累加，取总和最小者即可。

所以这题值得迁移的思路是：**当目标是从全体点里挑一个点，使它到某个点集的距离总代价最小，通常先预处理点对最短路，再做一层枚举。**

### 核心代码

```cpp
floyd();
int ans=1, best=INF;
for(int i=1;i<=P;i++){
    int cur=0;
    for(int x:fav) cur+=dis[i][x];
    if(cur<best) best=cur,ans=i;
}
```

### 复杂度

$O(P^3)$。

---

## 59. [P3371 【模板】单源最短路径（弱化版）](https://www.luogu.com.cn/problem/P3371)

`SPFA` `最短路模板`

### 题意

给定一张有向图和源点，要求输出源点到每个点的最短路径长度（弱化版）。

### 分析

弱化版单源最短路模板，本质上是在练“松弛”这件事。若通过 `u` 走到 `v` 能让 `dist[v]` 变得更小，就说明当前关于 `v` 的最短路认知被更新了，它以后也许还能继续帮助别人变优，于是要把它重新放回队列。

SPFA 的直觉版本就是：队列里只保留那些“最近刚刚被更新，可能继续产生影响”的点，而不是每轮都盲目扫描全部边。虽然最坏复杂度并不漂亮，但在弱化数据下足够通过。

所以这题最该记住的不是 SPFA 三个字母，而是最短路模板里最核心的动作：**发现更短路径，就立刻用它去触发后续松弛。**

### 核心代码

```cpp
queue<int> q; q.push(s); inq[s]=1; dist[s]=0;
while(!q.empty()){
    int u=q.front(); q.pop(); inq[u]=0;
    for(auto [v,w]:g[u]) if(dist[v]>dist[u]+w){
        dist[v]=dist[u]+w;
        if(!inq[v]) inq[v]=1,q.push(v);
    }
}
```

### 复杂度

$O(km)$。

---

## 60. [P3385 【模板】负环](https://www.luogu.com.cn/problem/P3385)

`SPFA` `负环`

### 题意

给定带负边的图，要求判断图中是否存在可达负环。

### 分析

判负环时，关键不是“队列里放了什么”，而是发现一条路径居然可以无限次继续变优。对一个没有负环的图来说，任意最短路都不可能经过超过 `n-1` 条边。

因此若某个点对应的最优距离在使用不少于 `n` 条边后仍然还能被继续松弛，就说明这条路径里一定绕了环，而且绕环后更优——这恰好就是负环。SPFA 实现里通常用“被成功松弛的边数 / 入队次数”来监控这一点。

所以这题最该理解的不是模板细节，而是判据来源：**超过 `n-1` 条边还能继续变优，唯一解释就是存在负环。**

### 核心代码

```cpp
queue<int> q;
for(int i=1;i<=n;i++) q.push(i),inq[i]=1;
while(!q.empty()){
    int u=q.front(); q.pop(); inq[u]=0;
    for(auto [v,w]:g[u]) if(dist[v]>dist[u]+w){
        dist[v]=dist[u]+w; cnt[v]=cnt[u]+1;
        if(cnt[v]>=n) return puts("YES"),0;
        if(!inq[v]) inq[v]=1,q.push(v);
    }
}
```

### 复杂度

$O(km)$。

---

## 61. [P4779 【模板】单源最短路径（标准版）](https://www.luogu.com.cn/problem/P4779)

`Dijkstra` `模板`

### 题意

给定一张非负权有向图和源点，要求输出源点到所有点的最短路。

### 分析

标准版单源最短路之所以换成 Dijkstra，关键不在“数据更强”，而在于边权非负这一结构已经足够保证贪心正确。

Dijkstra 的核心结论是：每次从堆里取出的、当前距离最小的未确定点，它的最短路已经最终确定了。因为所有边权都非负，不可能再绕一圈回来把它变得更短。

所以整个算法其实就是“不断确定一个最近点，然后用它去松弛邻边”。优先队列只是为了高效找到这个当前最近点。以后看到非负边权的单源最短路，第一反应就该是这套贪心。

### 核心代码

```cpp
priority_queue<Node> pq;
dist[s]=0; pq.push({s,0});
while(!pq.empty()){
    auto [u,d]=pq.top(); pq.pop();
    if(d!=dist[u]) continue;
    for(auto [v,w]:g[u]) if(dist[v]>d+w){
        dist[v]=d+w;
        pq.push({v,dist[v]});
    }
}
```

### 复杂度

$O(m\log n)$。

---
