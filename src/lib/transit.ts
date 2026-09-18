import type { LatLon, RouteResult, RouteLeg } from '@/types';
import { TRAVEL_MODE_LABEL } from './routing';

interface Station {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

interface Edge {
  to: number;
  line: string;
  seconds: number;
}

interface Graph {
  stations: Station[];
  byId: Map<number, Station>;
  adjacency: Map<number, Edge[]>;
}

let graphPromise: Promise<Graph> | null = null;

function loadGraph(): Promise<Graph> {
  if (!graphPromise) {
    graphPromise = (async () => {
      const res = await fetch('/japan-stations.json');
      if (!res.ok) throw new Error(`车站数据加载失败 HTTP ${res.status}`);
      const data = await res.json();
      const stations: Station[] = data.stations ?? [];
      const byId = new Map<number, Station>();
      for (const s of stations) byId.set(s.id, s);
      const adjacency = new Map<number, Edge[]>();
      for (const e of data.edges ?? []) {
        addEdge(adjacency, e.from, { to: e.to, line: e.line, seconds: e.seconds });
        addEdge(adjacency, e.to, { to: e.from, line: e.line, seconds: e.seconds });
      }
      return { stations, byId, adjacency };
    })();
  }
  return graphPromise;
}

function addEdge(adj: Map<number, Edge[]>, from: number, edge: Edge) {
  let arr = adj.get(from);
  if (!arr) {
    arr = [];
    adj.set(from, arr);
  }
  arr.push(edge);
}

function haversine(a: LatLon, b: LatLon): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat);
  const la2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function findNearestStation(pos: LatLon, stations: Station[], maxDist = 3000): { station: Station; distMeters: number } | null {
  let best: Station | null = null;
  let bestDist = maxDist;
  for (const s of stations) {
    const d = haversine(pos, s);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best ? { station: best, distMeters: bestDist } : null;
}

// 简单二叉堆（元素 [priority, value]）
class MinHeap<T> {
  private a: [number, T][] = [];
  push(x: [number, T]) {
    this.a.push(x);
    let i = this.a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.a[p][0] <= this.a[i][0]) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }
  pop(): [number, T] | undefined {
    const top = this.a[0];
    const last = this.a.pop();
    if (this.a.length && last) {
      this.a[0] = last;
      let i = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < this.a.length && this.a[l][0] < this.a[m][0]) m = l;
        if (r < this.a.length && this.a[r][0] < this.a[m][0]) m = r;
        if (m === i) break;
        [this.a[m], this.a[i]] = [this.a[i], this.a[m]];
        i = m;
      }
    }
    return top;
  }
  get size() {
    return this.a.length;
  }
}

const WALK_SPEED = 1.25; // m/s ≈ 4.5 km/h
const TRANSFER_PENALTY = 180; // 换乘 3 分钟
const DWELL_PER_STATION = 60; // 每个中间站停站约 60 秒（计入边权，引导少换乘直达）

export async function getTransitRoute(from: LatLon, to: LatLon): Promise<RouteResult> {
  const graph = await loadGraph();
  const origin = findNearestStation(from, graph.stations);
  if (!origin) throw new Error('起点附近 3km 内没有车站');
  const dest = findNearestStation(to, graph.stations);
  if (!dest) throw new Error('目的地附近 3km 内没有车站');

  const originId = origin.station.id;
  const destId = dest.station.id;

  // Dijkstra
  const dist = new Map<number, number>();
  const prev = new Map<number, { node: number; line: string }>();
  const lineOf = new Map<number, string>(); // 到达该节点所用的线路
  const heap = new MinHeap<number>();
  dist.set(originId, 0);
  heap.push([0, originId]);

  while (heap.size > 0) {
    const [d, u] = heap.pop()!;
    if (d > (dist.get(u) ?? 0)) continue;
    if (u === destId) break;
    const edges = graph.adjacency.get(u);
    if (!edges) continue;
    const uLine = lineOf.get(u);
    for (const e of edges) {
      // 换线（线路名不同）加换乘惩罚，引导少换乘、优先直达
      const transfer = uLine && uLine !== e.line ? TRANSFER_PENALTY : 0;
      // 边权 = 行车时间 + 停站时间 + 换乘惩罚
      const nd = d + e.seconds + DWELL_PER_STATION + transfer;
      const cur = dist.get(e.to);
      if (cur === undefined || nd < cur) {
        dist.set(e.to, nd);
        prev.set(e.to, { node: u, line: e.line });
        lineOf.set(e.to, e.line);
        heap.push([nd, e.to]);
      }
    }
  }

  if (!dist.has(destId)) throw new Error('无法到达目的地（电车网络不连通）');

  // 回溯路径
  const pathIds: number[] = [];
  const pathLines: string[] = [];
  let cur = destId;
  while (cur !== originId) {
    const p = prev.get(cur);
    if (!p) break;
    pathIds.push(cur);
    pathLines.push(p.line);
    cur = p.node;
  }
  pathIds.push(originId);
  pathIds.reverse();
  pathLines.reverse(); // pathLines[i] = 从 pathIds[i] 到 pathIds[i+1] 的线路

  // 组装 train 腿：把连续相同线路的边合并为一段
  const trainLegs: RouteLeg[] = [];
  let i = 0;
  while (i < pathLines.length) {
    const line = pathLines[i];
    let j = i;
    while (j < pathLines.length && pathLines[j] === line) j++;
    // 边 [i, j) 覆盖车站 [i, j]
    let meters = 0;
    for (let k = i; k < j; k++) {
      const a = graph.byId.get(pathIds[k]);
      const b = graph.byId.get(pathIds[k + 1]);
      if (a && b) meters += haversine(a, b);
    }
    const seconds = Math.round((dist.get(pathIds[j]) ?? 0) - (dist.get(pathIds[i]) ?? 0));
    const first = graph.byId.get(pathIds[i]);
    const last = graph.byId.get(pathIds[j]);
    if (first && last) {
      trainLegs.push({
        mode: 'train',
        fromName: first.name,
        toName: last.name,
        line,
        distanceMeters: Math.round(meters),
        durationSeconds: seconds,
      });
    }
    i = j;
  }

  const transferCount = Math.max(0, trainLegs.length - 1);

  // 步行腿
  const walk1Seconds = Math.round(origin.distMeters / WALK_SPEED);
  const walk2Seconds = Math.round(dest.distMeters / WALK_SPEED);

  const legs: RouteLeg[] = [];
  if (origin.distMeters > 30) {
    legs.push({ mode: 'walking', fromName: '当前位置', toName: origin.station.name, distanceMeters: Math.round(origin.distMeters), durationSeconds: walk1Seconds });
  }
  legs.push(...trainLegs);
  if (dest.distMeters > 30) {
    legs.push({ mode: 'walking', fromName: dest.station.name, toName: '目的地', distanceMeters: Math.round(dest.distMeters), durationSeconds: walk2Seconds });
  }

  const trainSeconds = trainLegs.reduce((s, l) => s + l.durationSeconds, 0);
  // 换乘惩罚已在 Dijkstra 边权中计入（dist 差包含它），此处不再重复相加
  const totalSeconds = walk1Seconds + walk2Seconds + trainSeconds;
  const totalMeters = Math.round(origin.distMeters + dest.distMeters + trainLegs.reduce((s, l) => s + l.distanceMeters, 0));

  // 合并几何：起点 → 各站 → 终点
  const geometry: [number, number][] = [[from.lon, from.lat]];
  for (const id of pathIds) {
    const st = graph.byId.get(id);
    if (st) geometry.push([st.lon, st.lat]);
  }
  geometry.push([to.lon, to.lat]);

  // 摘要
  const parts: string[] = [];
  if (origin.distMeters > 30) parts.push(`步行${Math.round(origin.distMeters)}m 至 ${origin.station.name}`);
  for (const l of trainLegs) {
    parts.push(`${l.line} ${l.fromName} → ${l.toName}`);
  }
  if (dest.distMeters > 30) parts.push(`步行${Math.round(dest.distMeters)}m 至目的地`);
  if (transferCount > 0) parts.push(`换乘 ${transferCount} 次`);

  const summary = `${parts.join(' → ')}（约 ${Math.round(totalSeconds / 60)} 分钟）`;

  return {
    mode: 'transit',
    distanceMeters: totalMeters,
    durationSeconds: totalSeconds,
    geometry,
    legs,
    summary,
  };
}

export function formatTransitSummary(result: RouteResult): string {
  return result.summary || `${TRAVEL_MODE_LABEL[result.mode]} 约 ${Math.round(result.durationSeconds / 60)} 分钟`;
}
