import { storage } from './storage.js'

// 数据结构映射：把 musics 表的记录映射成统一的 Content 结构，
// 供 /api/content、/api/timeline、/api/tags 等聚合接口共用（此前在多个路由里各写了一份）。
export function musicToContent(m) {
  return {
    id: m.id,
    type: 'music',
    title: m.title,
    summary: `${m.artist} · ${m.album || '单曲'}`,
    cover: m.cover,
    tags: m.tags || [],
    createdAt: m.createdAt,
    updatedAt: m.createdAt,
    ext: { music: { artist: m.artist, album: m.album, audioUrl: m.audioUrl, duration: m.duration } }
  }
}

// 全部内容 = contents 表 + musics 表（音乐以 Content 形态参与列表、归档、标签统计）
export function allContent() {
  return [...storage.readContent(), ...storage.readMusic().map(musicToContent)]
}
