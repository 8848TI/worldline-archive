// 全局唯一的音频引擎：单例 <audio>，供播放器 store 与 UI 组件共用。
// 好处：无论播放器 UI 挂在哪个组件，切换页面时音频都不会因组件卸载而中断。
export const audio = new Audio()
audio.preload = 'metadata'
