---
title: "洛谷 图论综合专题精选解题报告"
subtitle: "🕸️ 从强连通、匹配到网络流与 DAG 的图论建模主线"
order: 3
icon: "🕸️"
---

# 洛谷 图论综合专题精选解题报告

这一组题从 2-SAT 与 Tarjan 一路走到匹配、网络流、最小生成树和 DAG 优化，表面上模型很多，但核心都在“先认图结构，再选正确的抽象层”：有时要先缩点，有时要把可行性改写成流量或匹配，有时则要把原图提炼成更稳定的 DAG。真正的门槛通常不是实现，而是建模转身的那一下。

# 一、图论综合建模

这几题外表常像最短路，但真正决定做法的是最小割、缩点 DAG 或更一般的图论模型。

## 1. [P2046 \[NOI2010\] 海拔](https://www.luogu.com.cn/problem/P2046)

`平面图` `最小割` `Dijkstra`

### 题意

城市路网是规则网格，道路代价已知。要求求出把城市从一侧切到另一侧所需付出的最小总代价。

### 分析

网格平面图的 `s-t` 最小割可以转成对偶图上的最短路。把每个面看成一个点，道路权当成相邻两个面对偶边的长度，再从两侧外部面之间跑 Dijkstra 就是答案。

### 核心代码

```cpp
for(each road){
    int a=face_left(road), b=face_right(road);
    add_edge(a,b,cost), add_edge(b,a,cost);
}
dijkstra(outer_up);
cout<<dist[outer_down];
```

### 复杂度

$O(n^2\log n)$。

---

## 2. [P4001 \[ICPC 2006 Beijing R\] 狼抓兔子](https://www.luogu.com.cn/problem/P4001)

`平面图` `最小割` `Dijkstra`

### 题意

兔子和狼位于网格图两端，三类道路都带有通过代价。要求求出阻断两端连通所需移除道路权值和的最小值。

### 分析

这题和网格最小割是同一模型：原图最小割等于对偶图最短路。把每条原图边转成连接左右两个面的对偶边，再在源点、汇点对应的外部面之间跑最短路即可。

### 核心代码

```cpp
for(each edge in grid){
    int u=left_face(edge), v=right_face(edge);
    dual[u].push_back({v,w});
    dual[v].push_back({u,w});
}
dijkstra(Sface);
ans=dist[Tface];
```

### 复杂度

$O(nm\log(nm))$。

---

## 3. [P1073 \[NOIP 2009 提高组\] 最优贸易](https://www.luogu.com.cn/problem/P1073)

`SCC` `DP` `最短路建模`

### 题意

城市有买卖价格和单双向道路，要求从 `1` 走到 `n` 的过程中先买后卖，求最大利润。

### 分析

在同一强连通分量里可以任意往返，所以先缩点。对 DAG 正向 DP 维护从 `1` 到该点途中见过的最低价格，反向 DP 维护从该点到 `n` 能遇到的最高卖价，两者差值取最大就是答案。

### 核心代码

```cpp
tarjan(); build_dag();
for(int x:topo){
    mn[x]=min(mn[x],low_price[x]);
    for(int y:dag[x]) mn[y]=min(mn[y],mn[x]);
}
for(int x:rtopo){
    mx[x]=max(mx[x],high_price[x]);
    for(int y:rdag[x]) mx[y]=max(mx[y],mx[x]);
}
```

### 复杂度

$O(n+m)$。

---

## 4. [P3008 \[USACO11JAN\] Roads and Planes G](https://www.luogu.com.cn/problem/P3008)

`Dijkstra` `拓扑排序` `最短路`

### 题意

城镇之间有双向非负道路和单向可能为负的航线，并保证航线不会形成可回到原点的环。要求求出源点到所有城镇的最短路。

### 分析

道路连通块内部没有负环，可以在每个块里正常跑 Dijkstra；航线只会把答案从前面的块传到后面的块，因此连通块缩成点后是一张 DAG。按拓扑序处理块：块内跑 Dijkstra，块间用航线松弛。

### 核心代码

```cpp
build_road_cc();
topo(comp_dag);
for(int c:ord){
    priority_queue<Node> pq;
    for(int x:ver[c]) if(dist[x]<INF) pq.push({x,dist[x]});
    run_inner_dijkstra(c,pq);
    for(int u:ver[c]) for(auto [v,w]:plane[u])
        if(dist[u]+w<dist[v]) dist[v]=dist[u]+w;
}
```

### 复杂度

$O((R+P)\log T)$。

---

# 二、2-SAT

只要出现二元选择、互斥与蕴含约束，就把变量和否定拆成点，转成强连通判定。

## 5. [AT_arc069_d \[ARC069F\] Flags](https://www.luogu.com.cn/problem/AT_arc069_d)

`2-SAT` `二分` `线段树`

### 题意

第 `i` 面旗子只能放在直线上的 `x_i` 或 `y_i` 位置，要求让任意两面旗子之间的最小距离尽可能大。

### 分析

二分答案 `d`。若某两种摆法的距离小于 `d`，这两种选择不能同时成立，于是得到一个二元冲突子句；把所有冲突建成 2-SAT 后判断可行性，区间冲突可用线段树优化连边。

### 核心代码

```cpp
bool check(int d){
    init_sat();
    for(int i=1;i<=n;i++) for(int t=0;t<2;t++){
        auto [L,R]=conflict_range(i,t,d);
        seg_link(L,R,node(i,t^1));
    }
    tarjan();
    for(int i=1;i<=n;i++) if(scc[i<<1]==scc[i<<1|1]) return false;
    return true;
}
```

### 复杂度

$O(n\log^2 n\log V)$。

---

## 6. [UVA1146 Now or later](https://www.luogu.com.cn/problem/UVA1146)

`2-SAT` `二分`

### 题意

每个事件都有“现在做”或“稍后做”两种备选时刻，要求安排所有事件并最大化任意两次操作之间的最小时间间隔。

### 分析

二分最小间隔 `d`。若两个候选时刻相距小于 `d`，则这两个选择不能同时取，直接在 2-SAT 中连上互斥蕴含；检查可行即可。

### 核心代码

```cpp
bool check(int d){
    clear_graph();
    for(int i=1;i<=n;i++) for(int j=i+1;j<=n;j++)
        for(int a=0;a<2;a++) for(int b=0;b<2;b++)
            if(abs(tim[i][a]-tim[j][b])<d)
                add(id(i,a),id(j,b^1)), add(id(j,b),id(i,a^1));
    return satisfiable();
}
```

### 复杂度

$O(n^2\log V)$。

---

## 7. [CF587D Duff in Mafia](https://www.luogu.com.cn/problem/CF587D)

`2-SAT` `二分` `图论建模`

### 题意

要并行炸掉一批道路，使被炸道路构成匹配，且剩余图中同色道路两两不相邻。求最小可能的最大爆破时间，并构造一组方案。

### 分析

二分时间上限 `T`，只考虑 `t_i\le T` 的道路。每条道路是否被炸视作布尔变量：同端点可同时选两条、同色留下来的边若相邻也不合法，这些条件都能改写成 2-SAT 子句。

### 核心代码

```cpp
bool check(int lim){
    init_sat();
    for(auto &vec:incident) add_mutex(vec);
    for(auto &vec:color_edges) add_keep_constraints(vec,lim);
    if(!satisfiable()) return false;
    build_answer();
    return true;
}
```

### 复杂度

$O((n+m)\log m)$。

---

## 8. [P6378 \[PA 2010\] Riddle](https://www.luogu.com.cn/problem/P6378)

`2-SAT` `图论建模`

### 题意

无向图的点被划分成若干部分，每个部分必须恰好选一个关键点，并要求每条边至少有一个端点被选中。

### 分析

“某部分恰选一个点”可以用部分内的顺序变量拆成若干布尔选择，而边覆盖条件 `(u\lor v)` 就是标准 2-SAT 子句。把两类限制统一写成蕴含图后跑 SCC 判断即可。

### 核心代码

```cpp
for(each part){
    for(int i=1;i<sz;i++) add(prefix[i],prefix[i+1]);
    add_exactly_one(part_nodes);
}
for(auto [u,v]:edges){
    add(not_choose(u),choose(v));
    add(not_choose(v),choose(u));
}
```

### 复杂度

$O(n+m)$。

---

## 9. [P3825 \[NOI2017\] 游戏](https://www.luogu.com.cn/problem/P3825)

`2-SAT` `构造`

### 题意

每场游戏要选一辆赛车，地图会禁用某些车型，另外还有若干形如“若第 `i` 场用 `h_i`，则第 `j` 场必须用 `h_j`”的约束。要求判断是否存在合法安排并输出方案。

### 分析

对普通地图，每场实际上只剩两种可选赛车，可以映成一个布尔变量；少量 `x` 地图先枚举具体禁用关系。随后所有“若……则……”和“这辆车不能用”都能转成蕴含图，再按 SCC 结果构造答案。

### 核心代码

```cpp
for(auto [i,hi,j,hj]:rule){
    int a=literal(i,hi), b=literal(j,hj);
    add(a,b);
}
for(int i=1;i<=n;i++) add_forbidden(i);
if(satisfiable()) output_assignment();
```

### 复杂度

$O(2^d(n+m))$。

---

## 10. [P3513 \[POI 2011\] KON-Conspiracy](https://www.luogu.com.cn/problem/P3513)

`2-SAT` `计数` `图论建模`

### 题意

要把选中的人分成“阴谋者”和“支援组”两类：支援组必须两两认识，阴谋者必须两两互不认识，且两组都不能为空。要求判断是否可行，并统计方案数。

### 分析

设变量表示一个人是否进支援组。若两人不认识，就不能同时进支援组；若两人认识，就不能同时进阴谋组，这两类限制都能写成 2-SAT 子句。求出每个连通块的两种取值方式后，再做一遍方案计数。

### 核心代码

```cpp
for(int i=1;i<=n;i++) for(int j=i+1;j<=n;j++){
    if(kn[i][j]) add(i_false,j_true), add(j_false,i_true);
    else add(i_true,j_false), add(j_true,i_false);
}
tarjan();
count_components();
```

### 复杂度

$O(n^2)$。

---

## 11. [UVA11294 Wedding](https://www.luogu.com.cn/problem/UVA11294)

`2-SAT` `模板`

### 题意

婚礼上每对夫妻中必须恰好有一人出席，同时若两个人彼此讨厌，则他们不能同时出席。要求判断是否存在安排并输出一组可行方案。

### 分析

把每个人是否出席当成布尔变量，夫妻约束是“二选一”，敌对关系是“不能同时为真”。按 2-SAT 建蕴含图，Tarjan 缩点后若 `x` 与 `¬x` 同 SCC 则无解，否则按 SCC 拓扑序赋值。

### 核心代码

```cpp
for(int i=0;i<n;i++){
    add(i_husband,not_wife);
    add(i_wife,not_husband);
}
for(auto [a,b]:hate){
    add(a,opp(b));
    add(b,opp(a));
}
solve_2sat();
```

### 复杂度

$O(n+m)$。

---

## 12. [P3209 \[HNOI2010\] 平面图判定](https://www.luogu.com.cn/problem/P3209)

`2-SAT` `平面图` `区间相交`

### 题意

无向图已知含有一条包含所有顶点的哈密顿回路，要求判断其余弦边能否分别画在环内或环外而互不相交，从而判断图是否平面。

### 分析

每条弦只有“画在内侧”或“画在外侧”两种选择。若两条弦在环上交叉，则它们不能画在同侧，于是得到一个异色约束，整题就化成弦交图是否二分，也可以直接写成 2-SAT。

### 核心代码

```cpp
for(int i=1;i<=m;i++) for(int j=i+1;j<=m;j++)
    if(cross(ch[i],ch[j])){
        add(in(i),out(j)); add(in(j),out(i));
        add(out(i),in(j)); add(out(j),in(i));
    }
cout<<(satisfiable()?"YES":"NO");
```

### 复杂度

$O(m^2)$。

---

## 13. [CF27D Ring Road 2](https://www.luogu.com.cn/problem/CF27D)

`2-SAT` `环上弦` `构造`

### 题意

城市在一个环上，新修的道路是连接两点的弦，每条弦只能画在环内或环外，要求使任意两条道路除了端点外都不相交，并输出一种内外分配方案。

### 分析

两条弦若在圆上交叉，就必须放在不同侧。于是每条弦是一个布尔变量，交叉关系转成 `x_i\oplus x_j` 型限制，在 2-SAT / 二分染色图上都能解决。

### 核心代码

```cpp
for(int i=1;i<=m;i++) for(int j=i+1;j<=m;j++) if(cross(i,j)){
    add(i_in,j_out); add(j_in,i_out);
    add(i_out,j_in); add(j_out,i_in);
}
solve_2sat();
```

### 复杂度

$O(m^2)$。

---

## 14. [P3007 \[USACO11JAN\] The Continental Cowngress G](https://www.luogu.com.cn/problem/P3007)

`2-SAT` `强制赋值`

### 题意

每头奶牛对两个议案分别给出赞成/反对偏好，要求最终结果至少满足她的一个愿望。若存在合法方案，还要判断每个议案是必定通过、必定否决还是两者皆可。

### 分析

每条偏好就是一个二元子句。先用 2-SAT 判断可行，再在缩点 DAG 上看 `x` 是否能推出 `¬x`、或 `¬x` 能推出 `x`：若前者成立则该议案必假，后者成立则必真，否则答案为 `?`。

### 核心代码

```cpp
build_implication();
tarjan(); build_scc_dag();
for(int i=1;i<=n;i++){
    if(reach[pos(i,1)][pos(i,0)]) ans[i]='Y';
    else if(reach[pos(i,0)][pos(i,1)]) ans[i]='N';
    else ans[i]='?';
}
```

### 复杂度

$O((n+m)^2)$。

---

## 15. [P5782 \[POI 2001 R2\] 和平委员会](https://www.luogu.com.cn/problem/P5782)

`2-SAT` `模板`

### 题意

每个党派有两名代表，和平委员会要求每个党派恰好选一人，同时互相厌恶的两名代表不能同时入选。要求输出一组可行代表名单。

### 分析

每个党派的两位代表天然是一对互斥选择，讨厌关系则是“不能同真”。把它们全部写进蕴含图，跑 Tarjan 判断可行并按 SCC 拓扑序输出选中的代表即可。

### 核心代码

```cpp
for(int i=1;i<=n;i++){
    add(rep(i,0),not_rep(i,1));
    add(rep(i,1),not_rep(i,0));
}
for(auto [a,b]:hate){
    add(a,opp(b)); add(b,opp(a));
}
solve_2sat();
```

### 复杂度

$O(n+m)$。

---

## 16. [P4782 【模板】2-SAT](https://www.luogu.com.cn/problem/P4782)

`2-SAT` `模板`

### 题意

给定若干形如“变量 `x_i` 取某真值或变量 `x_j` 取某真值”的条件，要求判断整个 2-SAT 公式是否有解，并给出一组赋值。

### 分析

对每个子句 `(a\lor b)` 连两条蕴含边 `¬a\to b`、`¬b\to a`。若某变量与其否定落在同一 SCC 中则无解，否则按 SCC 拓扑序逆序确定真假。

### 核心代码

```cpp
void add_or(int a,int b){
    add(a^1,b); add(b^1,a);
}
tarjan();
for(int i=0;i<n;i++){
    if(scc[i<<1]==scc[i<<1|1]) bad();
    val[i]=scc[i<<1]<scc[i<<1|1];
}
```

### 复杂度

$O(n+m)$。

---

## 17. [P4171 \[JSOI2010\] 满汉全席](https://www.luogu.com.cn/problem/P4171)

`2-SAT` `图论建模`

### 题意

每种材料都可以做成满式或汉式，评审给出若干“至少满足其中一道菜”的要求。需要判断参赛者是否能做出不会被淘汰的满汉全席。

### 分析

把每种材料的“满式/汉式”看成一个布尔变量，每位评审的偏好就是一个二元子句。于是整题是标准 2-SAT，只需判断是否存在满足所有评审的做法。

### 核心代码

```cpp
for(auto [a,b]:judge){
    int x=literal(a), y=literal(b);
    add(x^1,y); add(y^1,x);
}
cout<<(satisfiable()?"GOOD":"BAD");
```

### 复杂度

$O(n+m)$。

---

# 三、二分图与网络流

匹配、染色和流量问题虽然模型不同，但都在处理“边能不能被同时选”。

## 18. [P3386 【模板】二分图最大匹配](https://www.luogu.com.cn/problem/P3386)

`二分图` `最大匹配`

### 题意

给定一个左右部大小分别为 `n,m` 的二分图，要求输出最大匹配边数。

### 分析

模板题直接上 Hopcroft-Karp。分层 BFS 找到所有最短增广路长度，再用 DFS 在分层图里批量增广。

### 核心代码

```cpp
bool bfs(){
    queue<int> q;
    for(int i=1;i<=n;i++) if(!mx[i]) dep[i]=0,q.push(i); else dep[i]=-1;
    while(!q.empty()){
        int u=q.front(); q.pop();
        for(int v:g[u]) if(my[v]&&dep[my[v]]==-1) dep[my[v]]=dep[u]+1,q.push(my[v]);
    }
    return true;
}
```

### 复杂度

$O(m\sqrt n)$。

---

## 19. [P2756 飞行员配对方案问题](https://www.luogu.com.cn/problem/P2756)

`二分图` `最大匹配`

### 题意

外籍飞行员只能与英国飞行员配对，给出可配合关系，要求构造最大配对方案并输出匹配。

### 分析

本质还是二分图最大匹配。左右部已经天然给出，用增广路或 Hopcroft-Karp 求最大匹配后，把 `match[v]` 反向输出即可。

### 核心代码

```cpp
bool dfs(int u){
    for(int v:g[u]) if(!vis[v]){
        vis[v]=1;
        if(!match[v]||dfs(match[v])){
            match[v]=u; return true;
        }
    }
    return false;
}
```

### 复杂度

$O(nm)$。

---

## 20. [U248878 染色法判定二分图](https://www.luogu.com.cn/problem/U248878)

`二分图` `染色`

### 题意

给定一个可能含重边和自环的无向图，要求判断它是否是二分图。

### 分析

从每个未染色点出发做 BFS/DFS 二染色。遇到自环或一条边两端颜色相同，就说明图中存在奇环，不是二分图。

### 核心代码

```cpp
bool dfs(int u,int c){
    col[u]=c;
    for(int v:adj[u]){
        if(!col[v]&&!dfs(v,3-c)) return false;
        if(col[v]==c) return false;
    }
    return true;
}
```

### 复杂度

$O(n+m)$。

---

## 21. [U169194 【模板】二分图判定](https://www.luogu.com.cn/problem/U169194)

`二分图` `染色`

### 题意

给定同学之间的熟悉关系，要求判断能否把所有人分到两个考场，使任意熟悉的两人都不在同一考场。

### 分析

这就是二分图判定。把同学看成点、熟悉关系看成边，整张图能否二染色等价于是否能这样分考场。

### 核心代码

```cpp
queue<int> q;
for(int s=1;s<=n;s++) if(!col[s]){
    col[s]=1; q.push(s);
    while(!q.empty()){
        int u=q.front(); q.pop();
        for(int v:adj[u]){
            if(!col[v]) col[v]=3-col[u],q.push(v);
            else if(col[v]==col[u]) bad=1;
        }
    }
}
```

### 复杂度

$O(n+m)$。

---

## 22. [P1330 封锁阳光大学](https://www.luogu.com.cn/problem/P1330)

`二分图` `最小点覆盖`

### 题意

无向图上要放河蟹封锁一些点，任一道路至少有一个端点被封锁，且相邻点不能同时放河蟹。要求最少需要多少只河蟹，不可行则输出 `Impossible`。

### 分析

图若不是二分图就无解。对每个连通块二染色后，取较小颜色类就是该块的最小点覆盖大小（本题边都要被覆盖且不能选相邻点），把各块答案累加即可。

### 核心代码

```cpp
bool dfs(int u,int c){
    col[u]=c; cnt[c]++;
    for(int v:adj[u]){
        if(!col[v]&&!dfs(v,3-c)) return false;
        if(col[v]==c) return false;
    }
    return true;
}
```

### 复杂度

$O(n+m)$。

---

## 23. [P3381 【模板】最小费用最大流](https://www.luogu.com.cn/problem/P3381)

`费用流` `最小费用最大流`

### 题意

给定带容量和单位费用的网络，要求求出从源点到汇点的最大流以及在该最大流下的最小费用。

### 分析

模板题直接跑最小费用最大流。每轮用 SPFA / Dijkstra 找一条最短增广路，沿路增广可行的最大流量并累加费用，直到汇点不可达为止。

### 核心代码

```cpp
while(spfa(s,t)){
    int f=INF;
    for(int v=t;v!=s;v=pre[v]) f=min(f,e[preid[v]].cap);
    flow+=f; cost+=1LL*f*dis[t];
    for(int v=t;v!=s;v=pre[v]){
        e[preid[v]].cap-=f;
        e[preid[v]^1].cap+=f;
    }
}
```

### 复杂度

$O(Fm\cdot SPFA)$。

---

## 24. [P1344 \[USACO4.4\] 追查坏牛奶 Pollutant Control](https://www.luogu.com.cn/problem/P1344)

`最大流` `最小割`

### 题意

牛奶运输网络是有向图，要求阻断污染牛奶从源仓库送到目标零售商，并在切断运输能力最小的前提下，再让切断的卡车数量最少。

### 分析

把每条边容量设成 `cap*BASE+1`，大容量部分保证先最小化总运输能力，低位的 `1` 再在能力最优时最小化边数。随后求一次最大流，得到的最小割值就同时编码了两层目标。

### 核心代码

```cpp
const int BASE=1001;
for(auto [u,v,c]:edge) add_edge(u,v,c*BASE+1);
long long cut=dinic(s,t);
cout<<cut/BASE<<" "<<cut%BASE;
```

### 复杂度

$O(E\sqrt V)$。

---

## 25. [P3376 【模板】网络最大流](https://www.luogu.com.cn/problem/P3376)

`最大流` `Dinic`

### 题意

给定网络及源汇点，要求求出网络最大流。

### 分析

模板题直接 Dinic：BFS 建分层图，DFS 在分层图上尽量多地推流；层图耗尽后重建，直到汇点不可达。

### 核心代码

```cpp
while(bfs()){
    memcpy(cur,head,sizeof head);
    while(int f=dfs(s,t,INF)) maxflow+=f;
}
int dfs(int u,int t,int f){
    if(u==t||!f) return f;
    for(int &i=cur[u];i;i=e[i].nxt) if(e[i].cap&&dep[e[i].to]==dep[u]+1){
        int w=dfs(e[i].to,t,min(f,e[i].cap));
        if(w) return e[i].cap-=w,e[i^1].cap+=w,w;
    }
    return 0;
}
```

### 复杂度

$O(EV^2)$。

---

# 四、图的连通性

这一章集中处理 Tarjan 体系：割点、桥、点双、边双、缩点与强连通分量。

## 26. [P8435 【模板】点双连通分量](https://www.luogu.com.cn/problem/P8435)

`Tarjan` `点双连通分量`

### 题意

给定无向图，要求输出全部点双连通分量的个数以及每个分量包含的点。

### 分析

Tarjan 维护 `dfn/low` 和一条边栈。当搜索树上一条边 `(u,v)` 满足 `low[v]\ge dfn[u]` 时，就从栈中弹到 `(u,v)` 为止，这一批边涉及到的顶点正好构成一个点双连通分量。

### 核心代码

```cpp
void tarjan(int u,int in){
    dfn[u]=low[u]=++idx;
    for(int i=head[u];i;i=e[i].nxt){
        int v=e[i].to;
        if(!dfn[v]){
            st.push({u,v}); tarjan(v,i); low[u]=min(low[u],low[v]);
            if(low[v]>=dfn[u]) pop_bcc(u,v);
        }else if(i!=(in^1)&&dfn[v]<dfn[u]){
            st.push({u,v}); low[u]=min(low[u],dfn[v]);
        }
    }
}
```

### 复杂度

$O(n+m)$。

---

## 27. [P8436 【模板】边双连通分量](https://www.luogu.com.cn/problem/P8436)

`Tarjan` `边双连通分量`

### 题意

给定无向图，要求输出全部边双连通分量的个数以及每个分量包含的点。

### 分析

先用 Tarjan 找出所有桥。删去这些桥后，图中每个剩余连通块就是一个边双连通分量，因此再做一次 DFS / BFS 收集各块顶点即可。

### 核心代码

```cpp
void tarjan(int u,int in){
    dfn[u]=low[u]=++idx;
    for(int i=head[u];i;i=e[i].nxt){
        int v=e[i].to;
        if(!dfn[v]) tarjan(v,i),low[u]=min(low[u],low[v]),bridge[i]=bridge[i^1]=(low[v]>dfn[u]);
        else if(i!=(in^1)) low[u]=min(low[u],dfn[v]);
    }
}
```

### 复杂度

$O(n+m)$。

---

## 28. [P2860 \[USACO06JAN\] Redundant Paths G](https://www.luogu.com.cn/problem/P2860)

`桥` `边双` `树形结论`

### 题意

当前牧场图只保证连通。要求最少再修多少条路，才能让任意两点之间都存在至少两条边不相交的路径。

### 分析

先缩成桥树。要让整张图边双连通，只需把桥树的叶子两两配对连边，答案就是 `\lceil leaf/2\rceil`。

### 核心代码

```cpp
tarjan_bridge();
build_bridge_tree();
int leaf=0;
for(int i=1;i<=bcc_cnt;i++) if(deg[i]==1) leaf++;
cout<<(leaf+1)/2;
```

### 复杂度

$O(n+m)$。

---

## 29. [T103481 【模板】割边](https://www.luogu.com.cn/problem/T103481)

`Tarjan` `割边`

### 题意

给定无向图，要求输出割边数量。

### 分析

对树边 `(u,v)`，若 `low[v]>dfn[u]`，删掉这条边后 `v` 子树无法再回到 `u` 或其祖先，因此它就是桥。模板里只需统计这样的边数。

### 核心代码

```cpp
void tarjan(int u,int in){
    dfn[u]=low[u]=++idx;
    for(int i=head[u];i;i=e[i].nxt){
        int v=e[i].to;
        if(!dfn[v]) tarjan(v,i),low[u]=min(low[u],low[v]),ans+=low[v]>dfn[u];
        else if(i!=(in^1)) low[u]=min(low[u],dfn[v]);
    }
}
```

### 复杂度

$O(n+m)$。

---

## 30. [U582665 【模板】割边](https://www.luogu.com.cn/problem/U582665)

`Tarjan` `割边`

### 题意

给定无向图，要求按字典序输出所有割边。

### 分析

仍然是桥模板。先通过 `low[v]>dfn[u]` 标记所有桥，再把对应端点按从小到大排序输出即可。

### 核心代码

```cpp
if(low[v]>dfn[u]){
    int a=min(u,v), b=max(u,v);
    bridge.push_back({a,b});
}
sort(bridge.begin(),bridge.end());
```

### 复杂度

$O(n+m)$。

---

## 31. [P1656 炸铁路](https://www.luogu.com.cn/problem/P1656)

`Tarjan` `割边`

### 题意

铁路网连通，要求找出所有一旦炸毁就会使图不再连通的关键铁路。

### 分析

关键铁路就是桥。对每条 DFS 树边检查 `low[v]>dfn[u]`，满足时记录这条边，最后按题目要求排序输出。

### 核心代码

```cpp
tarjan(1,0);
for(auto [u,v]:bridge) cout<<u<<" "<<v<<"\n";
```

### 复杂度

$O(n+m)$。

---

## 32. [P3388 【模板】割点（割顶）](https://www.luogu.com.cn/problem/P3388)

`Tarjan` `割点`

### 题意

给定无向图，要求求出所有割点。

### 分析

对 DFS 树边 `(u,v)`，若 `low[v]\ge dfn[u]`，说明 `v` 子树不能绕回 `u` 的祖先，删除 `u` 会断开这部分；根节点则要有至少两个子树才算割点。

### 核心代码

```cpp
void tarjan(int u,int fa){
    dfn[u]=low[u]=++idx; int child=0;
    for(int v:adj[u]){
        if(!dfn[v]){
            tarjan(v,u); low[u]=min(low[u],low[v]); child++;
            if(fa&&low[v]>=dfn[u]) cut[u]=1;
        }else if(v!=fa) low[u]=min(low[u],dfn[v]);
    }
    if(!fa&&child>=2) cut[u]=1;
}
```

### 复杂度

$O(n+m)$。

---

## 33. [P3469 \[POI 2008\] BLO-Blockade](https://www.luogu.com.cn/problem/P3469)

`Tarjan` `割点` `统计`

### 题意

对于每个点 `i`，删去与 `i` 相连的所有边后，要求统计有多少个有序点对 `(x,y)` 不再连通。

### 分析

删边后，`i` 自己会与其他 `n-1` 个点全部断开，贡献 `2(n-1)`。若 `i` 是割点，它把图拆成若干块，设这些块大小为 `s_1,s_2,...`，额外断开的有序点对数就是 `\sum s_j\cdot (rest-s_j)`。

### 核心代码

```cpp
void tarjan(int u,int fa){
    dfn[u]=low[u]=++idx; sz[u]=1; long long sum=0;
    for(int v:adj[u]) if(v!=fa){
        if(!dfn[v]){
            tarjan(v,u); sz[u]+=sz[v]; low[u]=min(low[u],low[v]);
            if(low[v]>=dfn[u]) ans[u]+=1LL*sz[v]*(n-sz[v]), sum+=sz[v];
        }else low[u]=min(low[u],dfn[v]);
    }
    ans[u]+=1LL*(n-1-sum)*(sum+1);
}
```

### 复杂度

$O(n+m)$。

---

## 34. [P2812 校园网络【\[USACO\]Network of Schools加强版】](https://www.luogu.com.cn/problem/P2812)

`SCC` `缩点`

### 题意

学校网络是有向图。要求先求最少选多少所学校作为软件源点能让所有学校都能用上软件，再求最少加多少条线路能让任意学校都能到达所有学校。

### 分析

先缩成 SCC DAG。第一个答案是入度为 0 的 SCC 个数；第二个答案是在 SCC 数大于 1 时取 `max(入度为0的 SCC 数, 出度为0的 SCC 数)`，否则为 0。

### 核心代码

```cpp
tarjan();
for(auto [u,v]:edges) if(scc[u]!=scc[v]){
    indeg[scc[v]]++; outdeg[scc[u]]++;
}
for(int i=1;i<=sc;i++) in0+=!indeg[i], out0+=!outdeg[i];
cout<<in0<<"\n"<<(sc==1?0:max(in0,out0));
```

### 复杂度

$O(n+m)$。

---

## 35. [P2341 \[USACO03FALL / HAOI2006\] 受欢迎的牛 G](https://www.luogu.com.cn/problem/P2341)

`SCC` `缩点`

### 题意

若一头牛被所有牛喜欢，则它是“受欢迎的牛”。给定有向喜欢关系，要求输出受欢迎的牛有多少头。

### 分析

喜欢关系可传递，所以先缩点。若缩点 DAG 中唯一的出度为 0 的 SCC 存在，那么这个 SCC 中所有牛都能被其他 SCC 到达；若这样的 SCC 不唯一，则答案为 0。

### 核心代码

```cpp
tarjan();
for(auto [u,v]:edges) if(scc[u]!=scc[v]) outdeg[scc[u]]++;
int sink=0;
for(int i=1;i<=sc;i++) if(!outdeg[i]){
    if(sink) return cout<<0,0;
    sink=i;
}
cout<<siz[sink];
```

### 复杂度

$O(n+m)$。

---

## 36. [P3387 【模板】缩点](https://www.luogu.com.cn/problem/P3387)

`SCC` `缩点` `DAG DP`

### 题意

有向图每个点有权值，允许重复走边但点权只算一次。要求求出能取得的最大点权和。

### 分析

重复经过一个 SCC 不会增加额外收益，因此先缩点，把每个 SCC 的点权和并起来。缩点后是 DAG，直接按拓扑序做最长路 DP。

### 核心代码

```cpp
tarjan(); build_dag();
queue<int> q;
for(int i=1;i<=sc;i++) if(!indeg[i]) dp[i]=sum[i], q.push(i);
while(!q.empty()){
    int u=q.front(); q.pop();
    for(int v:dag[u]){
        dp[v]=max(dp[v],dp[u]+sum[v]);
        if(--indeg[v]==0) q.push(v);
    }
}
```

### 复杂度

$O(n+m)$。

---

## 37. [P2863 \[USACO06JAN\] The Cow Prom S](https://www.luogu.com.cn/problem/P2863)

`SCC` `Tarjan`

### 题意

给定有向图，要求统计点数大于 `1` 的强连通分量个数。

### 分析

Tarjan 跑出所有 SCC 后，直接统计每个 SCC 的大小，`size\ge2` 的分量个数就是答案。

### 核心代码

```cpp
tarjan();
int ans=0;
for(int i=1;i<=sc;i++) ans+=siz[i]>=2;
cout<<ans;
```

### 复杂度

$O(n+m)$。

---

## 38. [B3609 \[图论与代数结构 701\] 强连通分量](https://www.luogu.com.cn/problem/B3609)

`SCC` `Tarjan`

### 题意

给定一张可能含重边和自环的有向图，要求输出全部强连通分量。

### 分析

这是 Tarjan 模板题。用时间戳和栈维护 DFS 过程，当 `dfn[u]=low[u]` 时弹出一个完整 SCC 并收集其中的点。

### 核心代码

```cpp
void tarjan(int u){
    dfn[u]=low[u]=++idx; st.push(u); ins[u]=1;
    for(int v:adj[u]){
        if(!dfn[v]) tarjan(v), low[u]=min(low[u],low[v]);
        else if(ins[v]) low[u]=min(low[u],dfn[v]);
    }
    if(dfn[u]==low[u]) pop_scc(u);
}
```

### 复杂度

$O(n+m)$。

---

# 五、最小生成树

生成树问题核心在于“选哪些边连通全图且代价最优”，严格次小生成树则是在 MST 上做路径替换。

## 39. [P4180 \[BJWC2010\] 严格次小生成树](https://www.luogu.com.cn/problem/P4180)

`最小生成树` `LCA` `严格次小生成树`

### 题意

给定带权无向图，要求求出严格次小生成树的权值，也就是权值大于最小生成树且尽量小的生成树。

### 分析

先 Kruskal 求 MST。对每条非树边 `(u,v,w)`，若把它加入 MST，会形成一条环，必须删去路径上的某条最大边；为了满足“严格次小”，还要同时维护路径上的最大值与严格次大值，避免权值相等时仍得到原 MST。

### 核心代码

```cpp
kruskal();
dfs_mst(1,0);
for(auto [u,v,w]:extra){
    auto [mx,sec]=query_path_max2(u,v);
    if(w>mx) ans=min(ans,mst+w-mx);
    else if(w>sec) ans=min(ans,mst+w-sec);
}
```

### 复杂度

$O(m\log n)$。

---

## 40. [P3366 【模板】最小生成树](https://www.luogu.com.cn/problem/P3366)

`最小生成树` `Kruskal`

### 题意

给定无向图，要求求出最小生成树权值；如果图不连通则输出 `orz`。

### 分析

模板题直接 Kruskal。按边权从小到大枚举，用并查集判断两个端点是否已连通，若不连通就把这条边加入生成树。

### 核心代码

```cpp
sort(edges.begin(),edges.end());
for(auto [u,v,w]:edges) if(find(u)!=find(v)){
    unite(u,v); ans+=w; cnt++;
}
if(cnt!=n-1) cout<<"orz";
else cout<<ans;
```

### 复杂度

$O(m\log m)$。

---

# 六、拓扑排序与 DAG

当依赖关系决定了边方向，就要先固定拓扑序，再在线性顺序上做 DP 或构造。

## 41. [B3644 【模板】拓扑排序 / 家谱树](https://www.luogu.com.cn/problem/B3644)

`拓扑排序` `模板`

### 题意

给定一张有向无环图，要求输出一个合法的拓扑序；题面也可理解为按照家谱关系排出先后顺序。

### 分析

Kahn 算法模板：先把所有入度为 0 的点入队，每次弹出一个点写入答案，再把它的出边终点入度减一，新的入度 0 点继续入队。

### 核心代码

```cpp
queue<int> q;
for(int i=1;i<=n;i++) if(!indeg[i]) q.push(i);
while(!q.empty()){
    int u=q.front(); q.pop(); ord.push_back(u);
    for(int v:adj[u]) if(--indeg[v]==0) q.push(v);
}
```

### 复杂度

$O(n+m)$。

---

## 42. [P1807 最长路](https://www.luogu.com.cn/problem/P1807)

`拓扑排序` `DAG DP`

### 题意

给定一个 DAG，要求求出从 `1` 到 `n` 的最长路径长度；若不可达则输出 `-1`。

### 分析

拓扑序保证转移方向合法。按拓扑序枚举每个点，用 `dp[u]` 去更新所有后继 `v` 的最长路即可。

### 核心代码

```cpp
topo_sort();
fill(dp,dp+n+1,-INF); dp[1]=0;
for(int u:ord) if(dp[u]>-INF)
    for(auto [v,w]:g[u]) dp[v]=max(dp[v],dp[u]+w);
cout<<(dp[n]<0?-1:dp[n]);
```

### 复杂度

$O(n+m)$。

---

## 43. [P4017 最大食物链计数](https://www.luogu.com.cn/problem/P4017)

`拓扑排序` `DAG DP` `计数`

### 题意

食物链关系构成 DAG，要求统计从所有入度为 0 的生物到所有出度为 0 的生物的路径条数。

### 分析

把入度为 0 的点都看成起点，初值设为 1。随后按拓扑序转移路径计数，最后把所有出度为 0 节点的 `dp` 累加就是答案。

### 核心代码

```cpp
for(int i=1;i<=n;i++) if(!indeg[i]) dp[i]=1,q.push(i);
while(!q.empty()){
    int u=q.front(); q.pop();
    for(int v:adj[u]){
        dp[v]=(dp[v]+dp[u])%MOD;
        if(--indeg[v]==0) q.push(v);
    }
}
```

### 复杂度

$O(n+m)$。

---

## 44. [CF1385E Directing Edges](https://www.luogu.com.cn/problem/CF1385E)

`拓扑排序` `构造`

### 题意

部分边方向已确定，部分边仍未定。要求判断能否给所有未定边定向，使整张图无环；若可以则输出一种定向方案。

### 分析

先只看已定向边做拓扑排序。若它们自身有环则直接无解；否则得到一个拓扑序后，所有未定边都按“拓扑序靠前的点指向靠后的点”定向即可保证整图仍为 DAG。

### 核心代码

```cpp
if(!topo(directed_edges)) return puts("NO"),0;
cout<<"YES\n";
for(auto [u,v]:fixed) cout<<u<<" "<<v<<"\n";
for(auto [u,v]:freee){
    if(pos[u]<pos[v]) cout<<u<<" "<<v<<"\n";
    else cout<<v<<" "<<u<<"\n";
}
```

### 复杂度

$O(n+m)$。

---
