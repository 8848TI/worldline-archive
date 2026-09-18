// 全局唯一的音频引擎：单例 <audio>，供播放器 store 与 UI 组件共用。
// 好处：无论播放器 UI 挂在哪个组件，切换页面时音频都不会因组件卸载而中断。
export const audio = new Audio()
// preload 用 auto：恢复上次播放进度时需要在暂停态下 seek，
// 若只预加载 metadata，浏览器不会去取目标位置的数据，seek 会被忽略。
audio.preload = 'auto'
