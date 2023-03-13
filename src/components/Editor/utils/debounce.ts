let timer: NodeJS.Timeout;
export default function debounce(func: Function, timeout = 300) {
  clearTimeout(timer);
  timer = setTimeout(() => { func(); }, timeout);
}
