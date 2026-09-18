import { useCallback, useEffect, useRef, useState } from 'react';
import { Map as MapLibreMap, Marker as MapLibreMarker, NavigationControl, addProtocol } from 'maplibre-gl';
import type { MapMouseEvent, MapGeoJSONFeature, PointLike, GeoJSONSource } from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import './realmap.css';
import { JAPAN_MAP_STYLE, POI_EMOJI_LIST, poiEmoji } from '@/lib/mapStyle';
import { selectPois, loadPoiSettings, savePoiSettings } from '@/lib/poiSelection';
import type { PoiSettings, PoiCandidate } from '@/lib/poiSelection';
import { PoiSettingsCard } from './PoiSettingsCard';
import type { LatLon, RouteResult } from '@/types';

interface RealMapProps {
  view?: 'city' | 'national';
  playerPosition: LatLon;
  destination: LatLon | null;
  route?: RouteResult | null;
  onMapClick?: (pos: LatLon, name?: string) => void;
  showControls?: boolean;
  className?: string;
}

// 全日本概览中心（用于全国视图）
const JAPAN_CENTER: LatLon = { lat: 36.5, lon: 138.0 };

const ROUTE_COLOR: Record<string, string> = {
  walking: '#0EA5E9',
  driving: '#F43F5E',
  cycling: '#22C55E',
  transit: '#8B5CF6',
};

// 从点击处的已渲染要素里取一个地名（优先 place > 运行时 POI > 道路名）
function resolvePlaceName(features: MapGeoJSONFeature[]): string | null {
  const nameOf = (props: Record<string, unknown> | null | undefined) =>
    (props?.['name:zh-Hans'] as string) || (props?.name as string) || (props?.['name:zh'] as string) || null;
  for (const f of features) if (f.sourceLayer === 'place') { const n = nameOf(f.properties as Record<string, unknown>); if (n) return n; }
  for (const f of features) if (f.source === 'active-poi-label' || f.source === 'active-poi-icon') { const n = nameOf(f.properties as Record<string, unknown>); if (n) return n; }
  for (const f of features) if (f.sourceLayer === 'transportation_name') { const n = nameOf(f.properties as Record<string, unknown>); if (n) return n; }
  return null;
}

// 注册一次 pmtiles 协议（模块级）
let protocolRegistered = false;
function ensureProtocol() {
  if (protocolRegistered) return;
  const protocol = new Protocol();
  addProtocol('pmtiles', protocol.tile);
  protocolRegistered = true;
}

// 玩家标记：天空蓝圆点 + 呼吸环
function buildPlayerEl(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'realmap-player';
  el.innerHTML = `
    <span class="realmap-player__pulse"></span>
    <span class="realmap-player__dot"></span>
  `;
  return el;
}

// 目的地标记：珊瑚色定位点
function buildDestinationEl(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'realmap-dest';
  el.innerHTML = `<span class="realmap-dest__dot"></span>`;
  return el;
}

// 把 emoji 渲染成带白色光晕的位图图标（供 MapLibre addImage 使用）
function renderEmojiIcon(emoji: string): ImageData | null {
  const size = 48;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.font = '38px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // 白色光晕提高在浅色底图上的可读性
  ctx.shadowColor = 'rgba(255,255,255,0.95)';
  ctx.shadowBlur = 4;
  ctx.fillText(emoji, size / 2, size / 2 + 1);
  return ctx.getImageData(0, 0, size, size);
}

// 将 POI 分类 emoji 注入地图图标集（在 style 加载完成后调用）
function registerEmojiIcons(map: MapLibreMap) {
  for (const emoji of POI_EMOJI_LIST) {
    const id = `emoji:${emoji}`;
    if (map.hasImage(id)) continue;
    const img = renderEmojiIcon(emoji);
    if (img) map.addImage(id, img);
  }
}

export function RealMap({ view = 'city', playerPosition, destination, route = null, onMapClick, showControls = true, className = '' }: RealMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const playerMarkerRef = useRef<MapLibreMarker | null>(null);
  const destMarkerRef = useRef<MapLibreMarker | null>(null);
  const clickHandlerRef = useRef<((e: MapMouseEvent) => void) | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const playerRef = useRef(playerPosition);

  const [mapError, setMapError] = useState<string | null>(null);
  const [settings, setSettings] = useState<PoiSettings>(() => loadPoiSettings());
  const settingsRef = useRef(settings);

  // —— 依据当前设置 + 玩家位置，挑选要显示的 emoji POI ——
  const refreshPois = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const iconSrc = map.getSource('active-poi-icon') as GeoJSONSource | undefined;
    const labelSrc = map.getSource('active-poi-label') as GeoJSONSource | undefined;
    if (!iconSrc || !labelSrc) return;
    const features = map.querySourceFeatures('japan', { sourceLayer: 'poi', filter: ['has', 'name'] });
    const cands: PoiCandidate[] = [];
    for (const f of features) {
      const g = f.geometry as GeoJSON.Geometry | undefined;
      if (!g || g.type !== 'Point') continue;
      const [lng, lat] = (g as GeoJSON.Point).coordinates;
      const props = (f.properties ?? {}) as Record<string, unknown>;
      cands.push({
        lng,
        lat,
        name: (props['name:zh-Hans'] as string) || (props.name as string) || (props['name:zh'] as string) || '',
        cls: (props.class as string) || '',
        sub: (props.subclass as string) || '',
        rank: Number(props.rank) || 0,
      });
    }
    const s = settingsRef.current;
    const iconSel = selectPois(cands, playerRef.current, s.icon);
    const labelSel = selectPois(cands, playerRef.current, s.label);

    const iconFc: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: iconSel.map((p) => ({
        type: 'Feature',
        properties: { name: p.name, icon: `emoji:${poiEmoji(p.cls, p.sub)}` },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      })),
    };
    const labelFc: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: labelSel.map((p) => ({
        type: 'Feature',
        properties: { name: p.name },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      })),
    };
    iconSrc.setData(iconFc);
    labelSrc.setData(labelFc);
  }, []);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current != null) window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null;
      refreshPois();
    }, 160);
  }, [refreshPois]);

  // 初始化地图（仅一次）
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    ensureProtocol();

    const isCity = view === 'city';
    const map = new MapLibreMap({
      container: containerRef.current,
      style: JAPAN_MAP_STYLE,
      center: isCity ? [playerPosition.lon, playerPosition.lat] : [JAPAN_CENTER.lon, JAPAN_CENTER.lat],
      zoom: isCity ? 13 : 5,
      minZoom: 3,
      maxZoom: 16,
      attributionControl: false,
    });
    if (showControls) {
      map.addControl(new NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    }
    map.on('error', (e) => {
      const msg = e && e.error ? e.error.message : String(e);
      console.error('[map error]', msg);
      setMapError(msg);
    });
    // 样式加载完成后：注入 emoji 图标 + 建运行时 POI 图层 + 挂引擎监听
    map.on('load', () => {
      registerEmojiIcons(map);
      // 图标层（emoji）
      map.addSource('active-poi-icon', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'active-poi-icon',
        type: 'symbol',
        source: 'active-poi-icon',
        minzoom: 14,
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': 0.3,
          'icon-allow-overlap': false,
        },
      });
      // 名称层（文本）
      map.addSource('active-poi-label', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      map.addLayer({
        id: 'active-poi-label',
        type: 'symbol',
        source: 'active-poi-label',
        minzoom: 14,
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 10.5,
          'text-anchor': 'top',
          'text-offset': [0, 0.8],
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#4A4A4A',
          'text-halo-color': 'rgba(255,255,255,0.9)',
          'text-halo-width': 1,
        },
      });
      map.on('moveend', scheduleRefresh);
      map.on('zoomend', scheduleRefresh);
      map.on('idle', scheduleRefresh);
      refreshPois();
    });
    mapRef.current = map;

    // 处理容器尺寸变化
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      if (refreshTimerRef.current != null) window.clearTimeout(refreshTimerRef.current);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      playerMarkerRef.current = null;
      destMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 玩家位置变化 → 更新标记 + 重算 POI
  useEffect(() => {
    playerRef.current = playerPosition;
    const map = mapRef.current;
    if (!map) return;
    if (!playerMarkerRef.current) {
      playerMarkerRef.current = new MapLibreMarker({ element: buildPlayerEl(), anchor: 'center' })
        .setLngLat([playerPosition.lon, playerPosition.lat])
        .addTo(map);
    } else {
      playerMarkerRef.current.setLngLat([playerPosition.lon, playerPosition.lat]);
    }
    scheduleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerPosition]);

  // 设置变化 → 持久化 + 重算 POI
  useEffect(() => {
    settingsRef.current = settings;
    savePoiSettings(settings);
    scheduleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // 更新点击回调
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (clickHandlerRef.current) map.off('click', clickHandlerRef.current);
    if (onMapClick) {
      const handler = (e: MapMouseEvent) => {
        const pos = { lat: e.lngLat.lat, lon: e.lngLat.lng };
        // 先精确命中，再用 50px 范围兜底，尽量反查出地名
        let name = resolvePlaceName(map.queryRenderedFeatures(e.point));
        if (!name) {
          const bbox: [PointLike, PointLike] = [
            [e.point.x - 25, e.point.y - 25],
            [e.point.x + 25, e.point.y + 25],
          ];
          name = resolvePlaceName(map.queryRenderedFeatures(bbox));
        }
        onMapClick(pos, name ?? undefined);
      };
      clickHandlerRef.current = handler;
      map.on('click', handler);
    } else {
      clickHandlerRef.current = null;
    }
    return () => {
      if (clickHandlerRef.current) map.off('click', clickHandlerRef.current);
    };
  }, [onMapClick]);

  // 更新目的地标记
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (destination) {
      if (!destMarkerRef.current) {
        destMarkerRef.current = new MapLibreMarker({ element: buildDestinationEl(), anchor: 'center' })
          .setLngLat([destination.lon, destination.lat])
          .addTo(map);
      } else {
        destMarkerRef.current.setLngLat([destination.lon, destination.lat]);
      }
    } else if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination]);

  // 更新路线
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (route && route.geometry.length > 1) {
      const geojson = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: route.geometry,
        },
      };
      const existing = map.getSource('route') as GeoJSONSource | undefined;
      if (existing) {
        existing.setData(geojson);
      } else {
        map.addSource('route', { type: 'geojson', data: geojson });
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': ROUTE_COLOR[route.mode] ?? '#F43F5E',
            'line-width': 4,
            'line-opacity': 0.9,
            ...(route.mode === 'walking' ? { 'line-dasharray': [1, 1.6] } : {}),
          },
        });
      }
    } else {
      if (map.getLayer('route-line')) map.removeLayer('route-line');
      if (map.getSource('route')) map.removeSource('route');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="realmap" />
      {mapError && (
        <div className="absolute inset-x-2 top-2 z-30 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600 shadow-soft">
          地图加载失败：{mapError}
        </div>
      )}
      {showControls && <PoiSettingsCard settings={settings} onChange={setSettings} />}
    </div>
  );
}
