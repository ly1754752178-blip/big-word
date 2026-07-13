// ============================================================
// SillyTavern 核心模块统一入口
// ============================================================

// 类型
export * from './types';

// 数据库
export {
  initializeDatabase,
  getLorebooks,
  getLorebook,
  saveLorebook,
  deleteLorebook,
  getPresets,
  getPreset,
  savePreset,
  deletePreset,
  getSettings,
  saveSettings,
  getChats,
  getChat,
  saveChat,
  deleteChat,
  ensureSettings,
} from './database';

// 世界书引擎
export { scanLorebooks, formatLorebookInjections } from './lorebook-engine';
export type { LorebookMatch, LorebookEngineConfig } from './lorebook-engine';

// Prompt 组装
export {
  assemblePrompt,
  DEFAULT_PROMPT_ORDER,
} from './prompt-assembler';
export type { AssemblePromptParams, AssemblePromptResult } from './prompt-assembler';

// 流式解析
export {
  createStreamParser,
  createSimpleStreamParser,
  DEFAULT_TAGS,
} from './stream-parser';
export type { TagDefinition, SimpleStreamParser } from './stream-parser';

// 变量合并
export { deepMerge, extractVariables, mergeVariables } from './vars-merger';

// API 路由
export {
  callPrimaryApi,
  callSecondaryApi,
  routeApiCall,
  DEFAULT_OUTPUT_FORMAT,
} from './api-router';
export type { RouteRequest, RouteOptions, ApiCallResult } from './api-router';

// 导入导出
export {
  importLorebook,
  exportLorebook,
  importPreset,
  exportPreset,
  detectImportFormat,
} from './importer';

// 编辑器工具
export {
  createDefaultEntry,
  createDefaultLorebook,
  applyEntryDefaults,
  updateEntry,
  removeEntry,
  movePromptItem,
  clampNumber,
} from './editor-utils';
