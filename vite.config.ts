import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// ── BGM 扫描插件：构建/开发时扫描 public/BGM/，生成 manifest.json ──
function bgmScannerPlugin(): Plugin {
  const BGM_DIR = path.resolve(__dirname, 'public/BGM');
  const AUDIO_EXTS = new Set(['.mp3', '.ogg', '.wav', '.flac', '.m4a']);
  const COVER_EXTS = ['.jpg', '.png'];

  function scan() {
    const manifestPath = path.join(BGM_DIR, 'manifest.json');

    if (!fs.existsSync(BGM_DIR)) {
      fs.mkdirSync(BGM_DIR, { recursive: true });
    }

    // 读取 order.txt
    const orderPath = path.join(BGM_DIR, 'order.txt');
    const categoryOrder: string[] = [];
    if (fs.existsSync(orderPath)) {
      const lines = fs.readFileSync(orderPath, 'utf-8').split('\n').filter(Boolean);
      for (const line of lines) {
        const m = line.match(/^\d+[、,.]\s*(.+)/);
        if (m) categoryOrder.push(m[1].trim());
      }
    }

    // 扫描文件
    const allFiles = fs.existsSync(BGM_DIR) ? fs.readdirSync(BGM_DIR) : [];
    const audioFiles = allFiles.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return AUDIO_EXTS.has(ext) && f.includes('_');
    });

    // 构建分类 map
    const categorySet = new Set<string>();
    const tracksByCategory: Record<string, Array<{
      category: string;
      title: string;
      audioUrl: string;
      coverUrl?: string;
    }>> = {};

    for (const file of audioFiles) {
      const firstUnderscore = file.indexOf('_');
      const category = file.slice(0, firstUnderscore);
      const rest = file.slice(firstUnderscore + 1);
      const ext = path.extname(rest);
      const title = rest.slice(0, rest.length - ext.length);

      // 查找封面：同名 jpg 或 png
      const baseName = file.slice(0, file.length - path.extname(file).length);
      let coverUrl: string | undefined;
      for (const cext of COVER_EXTS) {
        const coverFile = baseName + cext;
        if (allFiles.includes(coverFile)) {
          coverUrl = `/BGM/${coverFile}`;
          break;
        }
      }

      categorySet.add(category);
      if (!tracksByCategory[category]) tracksByCategory[category] = [];
      tracksByCategory[category].push({
        category,
        title,
        audioUrl: `/BGM/${file}`,
        ...(coverUrl ? { coverUrl } : {}),
      });
    }

    // 排序分类：order.txt 中的在前，其余按字母序
    const orderedCategories: string[] = [];
    for (const cat of categoryOrder) {
      if (categorySet.has(cat)) orderedCategories.push(cat);
    }
    for (const cat of [...categorySet].sort()) {
      if (!orderedCategories.includes(cat)) orderedCategories.push(cat);
    }

    const manifest = { categories: orderedCategories, tracksByCategory };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    console.log(`[bgm-scanner] 已扫描 ${audioFiles.length} 首 BGM，${orderedCategories.length} 个分类`);
  }

  return {
    name: 'bgm-scanner',
    buildStart() { scan(); },
    configureServer(server) {
      scan();
      // 监听目录变化，自动重新扫描
      const watcher = server.watcher;
      if (fs.existsSync(BGM_DIR)) {
        watcher.add(BGM_DIR);
        watcher.on('change', (filePath) => {
          if (filePath.startsWith(BGM_DIR) && !filePath.endsWith('manifest.json')) {
            console.log('[bgm-scanner] 检测到 BGM 目录变化，重新扫描...');
            scan();
          }
        });
        watcher.on('add', (filePath) => {
          if (filePath.startsWith(BGM_DIR) && !filePath.endsWith('manifest.json')) {
            scan();
          }
        });
        watcher.on('unlink', (filePath) => {
          if (filePath.startsWith(BGM_DIR) && !filePath.endsWith('manifest.json')) {
            scan();
          }
        });
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
