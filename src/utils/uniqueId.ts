
export function uniqueId(prefix: string) {
  const key = 'idCounter'
  const counter = parseInt(localStorage.getItem(key) || '0', 10) + 1
  localStorage.setItem(key, counter.toString())
  return `${prefix}${counter}`
}