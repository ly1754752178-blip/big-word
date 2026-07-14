import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// ── BGM 扫描插件：构建/开发时扫描 public/BGM/ 子文件夹，生成 manifest.json ──
// 每个子文件夹 = 一个情景词分类，文件夹名 = 分类名，内放 mp3 和同名封面图
function bgmScannerPlugin(): Plugin {
  const BGM_DIR = path.resolve(__dirname, 'public/BGM');
  const AUDIO_EXTS = new Set(['.mp3', '.ogg', '.wav', '.flac', '.m4a']);
  const COVER_EXTS = ['.jpg', '.png'];

  function scan() {
    const manifestPath = path.join(BGM_DIR, 'manifest.json');

    if (!fs.existsSync(BGM_DIR)) {
      fs.mkdirSync(BGM_DIR, { recursive: true });
    }

    const entries = fs.readdirSync(BGM_DIR, { withFileTypes: true });
    const categoryDirs = entries.filter((e) => e.isDirectory());

    const tracksByCategory: Record<string, Array<{
      category: string;
      title: string;
      audioUrl: string;
      coverUrl?: string;
    }>> = {};

    for (const dir of categoryDirs) {
      const category = dir.name;
      const dirPath = path.join(BGM_DIR, category);
      const files = fs.readdirSync(dirPath);

      // 建立封面索引：basename → ext
      const coverMap = new Map<string, string>();
      for (const f of files) {
        const ext = path.extname(f).toLowerCase();
        if (COVER_EXTS.includes(ext)) {
          const base = f.slice(0, f.length - ext.length);
          if (!coverMap.has(base)) coverMap.set(base, ext); // 先遇见的优先（jpg 排前面）
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

    // 按文件夹名称排序（中文按拼音，英文按字母）
    const categories = Object.keys(tracksByCategory).sort((a, b) =>
      a.localeCompare(b, 'zh-Hans-CN', { sensitivity: 'base' })
    );

    const totalTracks = Object.values(tracksByCategory).reduce((s, t) => s + t.length, 0);
    const manifest = { categories, tracksByCategory };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
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
        const onBgmChange = (filePath: string) => {
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

export default defineConfig({
  plugins: [react(), bgmScannerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
