-- 世界线存档 · SQLite 表结构
-- 说明：字段与现有 server/data/*.json 一一对应，便于后续把 storage.js 从 JSON 文件切到 SQLite。
-- 约定：
--   * tags / extra / children / value 这类数组或嵌套对象，统一以「JSON 字符串」存在 TEXT 列里，
--     前端拿到的结构不变；将来需要按标签检索，再用 SQLite 的 json_each() 或拆关联表。
--   * 时间字段沿用 ISO8601 字符串（如 2026-09-18T01:56:58.894Z），不要改成数字时间戳，
--     前端的排序与格式化都依赖这个格式。
--   * 音视频 / 图片文件本身不进库，uploads/ 里存文件，库里只存 URL。

-- ── 文章 / 随笔 / 动漫 / 影视 / 漫画 / 壁纸 / 项目 / 工具（对应 content.json）──
CREATE TABLE IF NOT EXISTS contents (
  id         TEXT PRIMARY KEY,            -- 沿用原 id，如 essay-mu59lhqq、a1
  type       TEXT NOT NULL,               -- essay / code / anime / movie / drama / manga / wallpaper / project / tool
  title      TEXT NOT NULL DEFAULT '',
  summary    TEXT NOT NULL DEFAULT '',
  cover      TEXT NOT NULL DEFAULT '',
  tags       TEXT NOT NULL DEFAULT '[]',  -- JSON 数组，如 ["奇幻","治愈"]
  extra      TEXT NOT NULL DEFAULT '{}',  -- 对应 JSON 里的 ext 对象（media / project / tool / music 等）
  created_at TEXT,                        -- ISO8601
  updated_at TEXT                         -- ISO8601
);

CREATE INDEX IF NOT EXISTS idx_contents_type       ON contents(type);
CREATE INDEX IF NOT EXISTS idx_contents_created_at ON contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contents_updated_at ON contents(updated_at DESC);

-- ── 音乐收藏（对应 music.json）──
CREATE TABLE IF NOT EXISTS musics (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL DEFAULT '',
  artist     TEXT NOT NULL DEFAULT '',
  album      TEXT NOT NULL DEFAULT '',
  cover      TEXT NOT NULL DEFAULT '',
  audio_url  TEXT NOT NULL DEFAULT '',    -- 对应 JSON 的 audioUrl，指向 uploads/ 或外链
  duration   INTEGER NOT NULL DEFAULT 0,  -- 秒，0 表示未知
  tags       TEXT NOT NULL DEFAULT '[]',
  created_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_musics_created_at ON musics(created_at DESC);

-- ── 两级标签体系：大类 / 子小类（对应 tag-categories.json）──
CREATE TABLE IF NOT EXISTS tag_categories (
  name     TEXT PRIMARY KEY,              -- 大类名，如 "动漫"
  children TEXT NOT NULL DEFAULT '[]',    -- JSON 数组，如 ["日漫","国漫"]
  sort     INTEGER NOT NULL DEFAULT 0     -- 保持 JSON 里的排列顺序
);

-- ── 站点设置（对应 settings.json）：一个顶层 key 一行，value 存该 key 的 JSON ──
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,                 -- 如 "hero"
  value TEXT NOT NULL DEFAULT '{}'
);

-- ── 元信息：记录表结构版本，方便以后写升级脚本 ──
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT
);

INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version', '1');
