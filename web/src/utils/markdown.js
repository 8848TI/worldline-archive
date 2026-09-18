import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'

// 只注册常用语言，避免打包整个 highlight.js（体积从约 1MB 降到约 100KB）。
// 需要新语言时在这里补一行 import + 注册即可。
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml' // html / vue 模板
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import sql from 'highlight.js/lib/languages/sql'
import markdown from 'highlight.js/lib/languages/markdown'
import yaml from 'highlight.js/lib/languages/yaml'
import diff from 'highlight.js/lib/languages/diff'

const LANGS = { javascript, typescript, xml, css, json, bash, python, java, go, sql, markdown, yaml, diff }
for (const [name, def] of Object.entries(LANGS)) hljs.registerLanguage(name, def)

// 常见别名，保证 ```js / ```vue / ```sh 这类写法也能高亮
hljs.registerAliases(['js', 'jsx', 'mjs', 'cjs'], { languageName: 'javascript' })
hljs.registerAliases(['ts', 'tsx'], { languageName: 'typescript' })
hljs.registerAliases(['html', 'vue', 'svg'], { languageName: 'xml' })
hljs.registerAliases(['sh', 'shell', 'zsh', 'console'], { languageName: 'bash' })
hljs.registerAliases(['py'], { languageName: 'python' })
hljs.registerAliases(['yml'], { languageName: 'yaml' })
hljs.registerAliases(['md'], { languageName: 'markdown' })

// 全站统一 Markdown 渲染器：支持代码高亮、链接、换行、表格、HTML。
// 页面层调用 renderMarkdown(text) 即可得到渲染后的 HTML。
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: false,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch (e) {
        /* 高亮失败则回退为转义输出 */
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

export function renderMarkdown(src) {
  return md.render(src || '')
}
