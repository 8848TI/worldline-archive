// 缩略图地址约定：与后端 utils/imageProcess.js 保持一致
//   /uploads/abc.jpg  →  /uploads/abc.thumb.webp
// 仅对本站上传（/uploads/ 开头）生效；外链图片（如占位图服务）原样返回。
export function thumbUrl(url) {
  if (!url || typeof url !== 'string') return url
  if (!url.startsWith('/uploads/')) return url
  if (/\.thumb\.webp$/i.test(url)) return url
  return url.replace(/\.[a-z0-9]+$/i, '.thumb.webp')
}
