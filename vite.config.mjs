import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── BGM 扫描插件：构建/开发时扫描 public/BGM/ 子文件夹，生成 manifest.json ──
function bgmScannerPlugin() {
  const BGM_DIR = path.resolve(__dirname, 'public/BGM');
  const AUDIO_EXTS = new Set(['.mp3', '.ogg', '.wav', '.flac', '.m4a']);
  const COVER_EXTS = ['.jpg', '.png'];

  function scan() {
    const manifestPath = path.join(BGM_DIR, 'manifest.json');
    if (!fs.existsSync(BGM_DIR)) fs.mkdirSync(BGM_DIR, { recursive: true });
    const entries = fs.readdirSync(BGM_DIR, { withFileTypes: true });
    const categoryDirs = entries.filter((e) => e.isDirectory());
    const tracksByCategory = {};

    for (const dir of categoryDirs) {
      const category = dir.name;
      const dirPath = path.join(BGM_DIR, category);
      const files = fs.readdirSync(dirPath);
      const coverMap = new Map();
      for (const f of files) {
        const ext = path.extname(f).toLowerCase();
        if (COVER_EXTS.includes(ext)) {
          const base = f.slice(0, f.length - ext.length);
          if (!coverMap.has(base)) coverMap.set(base, ext);
        }
      }
      for (const f of files) {
        const ext = path.extname(f).toLowerCase();
        if (!AUDIO_EXTS.has(ext)) continue;
        const baseName = f.slice(0, f.length - ext.length);
        const coverExt = coverMap.get(baseName);
        if (!tracksByCategory[category]) tracksByCategory[category] = [];
        tracksByCategory[category].push({
          category,
          title: baseName,
          audioUrl: `/BGM/${category}/${f}`,
          ...(coverExt ? { coverUrl: `/BGM/${category}/${baseName}${coverExt}` } : {}),
        });
      }
    }
    const categories = Object.keys(tracksByCategory).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { sensitivity: 'base' }));
    const totalTracks = Object.values(tracksByCategory).reduce((s, t) => s + t.length, 0);
    fs.writeFileSync(manifestPath, JSON.stringify({ categories, tracksByCategory }, null, 2), 'utf-8');
    console.log(`[bgm-scanner] 已扫描 ${totalTracks} 首 BGM，${categories.length} 个分类：${categories.join('、') || '(无)'}`);
  }

  return {
    name: 'bgm-scanner',
    buildStart() { scan(); },
    configureServer(server) {
      scan();
      const watcher = server.watcher;
      if (fs.existsSync(BGM_DIR)) {
        watcher.add(BGM_DIR);
        const onBgmChange = (filePath) => {
          if (filePath.startsWith(BGM_DIR) && !filePath.endsWith('manifest.json')) {
            console.log('[bgm-scanner] 检测到 BGM 目录变化，重新扫描...');
            scan();
          }
        };
        watcher.on('change', onBgmChange);
        watcher.on('add', onBgmChange);
        watcher.on('unlink', onBgmChange);
        watcher.on('addDir', onBgmChange);
        watcher.on('unlinkDir', onBgmChange);
      }
    },
  };
}

// ── 手机壁纸扫描插件 ──
function bizhiScannerPlugin() {
  const BIZHI_DIR = path.resolve(__dirname, 'public/bizhi');
  const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.bmp', '.svg']);

  function scan() {
    const manifestPath = path.join(BIZHI_DIR, 'manifest.json');
    if (!fs.existsSync(BIZHI_DIR)) fs.mkdirSync(BIZHI_DIR, { recursive: true });
    const files = fs.readdirSync(BIZHI_DIR, { withFileTypes: true })
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((name) => {
        const ext = path.extname(name).toLowerCase();
        return IMAGE_EXTS.has(ext) && !name.endsWith('manifest.json');
      })
      .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN', { sensitivity: 'base' }));
    const isNumeric = (name) => {
      const stem = name.slice(0, name.length - path.extname(name).length);
      return /^\d+$/.test(stem);
    };
    const defaults = files.filter(isNumeric);
    const builtins = files.filter((f) => !isNumeric(f));
    fs.writeFileSync(manifestPath, JSON.stringify({ defaults, builtins }, null, 2), 'utf-8');
    console.log(`[bizhi-scanner] 已扫描手机壁纸：默认 ${defaults.length} 张，内置 ${builtins.length} 张`);
  }

  return {
    name: 'bizhi-scanner',
    buildStart() { scan(); },
    configureServer(server) {
      scan();
      const watcher = server.watcher;
      if (fs.existsSync(BIZHI_DIR)) {
        watcher.add(BIZHI_DIR);
        const onBizhiChange = (filePath) => {
          if (filePath.startsWith(BIZHI_DIR) && !filePath.endsWith('manifest.json')) {
            console.log('[bizhi-scanner] 检测到 bizhi 目录变化，重新扫描...');
            scan();
          }
        };
        watcher.on('change', onBizhiChange);
        watcher.on('add', onBizhiChange);
        watcher.on('unlink', onBizhiChange);
      }
    },
  };
}

// ── PMTiles Range 插件：为 japan.pmtiles 提供 HTTP Range（Byte Serving）──
function pmtilesRangePlugin() {
  const FILE = path.resolve(__dirname, 'public/japan.pmtiles');
  return {
    name: 'pmtiles-range',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || req.url.split('?')[0] !== '/japan.pmtiles') return next();
        let stat;
        try {
          stat = fs.statSync(FILE);
        } catch {
          return next();
        }
        const mime = 'application/octet-stream';
        const range = req.headers.range;
        res.setHeader('Accept-Ranges', 'bytes');
        if (range) {
          const m = /bytes=(\d+)-(\d*)/.exec(range);
          const start = m ? parseInt(m[1], 10) : 0;
          let end = m && m[2] ? parseInt(m[2], 10) : stat.size - 1;
          if (end >= stat.size) end = stat.size - 1;
          res.statusCode = 206;
          res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
          res.setHeader('Content-Length', end - start + 1);
          res.setHeader('Content-Type', mime);
          fs.createReadStream(FILE, { start, end }).pipe(res);
        } else {
          res.setHeader('Content-Length', stat.size);
          res.setHeader('Content-Type', mime);
          fs.createReadStream(FILE).pipe(res);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), bgmScannerPlugin(), bizhiScannerPlugin(), pmtilesRangePlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
