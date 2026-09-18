// 按需注册 Element Plus 图标：只注册项目实际用到的那些，
// 避免把整个图标库（约 300KB）打进包里。
// 新增图标：在下面 import + 加进 icons 对象即可（组件内部也可自行 import 使用）。
import {
  ArrowDown,
  ArrowLeftBold,
  ArrowRightBold,
  Clock,
  Document,
  Film,
  FolderOpened,
  Headset,
  House,
  Menu,
  Moon,
  Sunny,
  Tickets,
  User,
  VideoPause,
  VideoPlay,
  ZoomIn
} from '@element-plus/icons-vue'

const icons = {
  ArrowDown,
  ArrowLeftBold,
  ArrowRightBold,
  Clock,
  Document,
  Film,
  FolderOpened,
  Headset,
  House,
  Menu,
  Moon,
  Sunny,
  Tickets,
  User,
  VideoPause,
  VideoPlay,
  ZoomIn
}

export default {
  install(app) {
    for (const [name, component] of Object.entries(icons)) {
      app.component(name, component)
    }
  }
}
