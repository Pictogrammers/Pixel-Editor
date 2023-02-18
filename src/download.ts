export default function download(filename: string, text: string) {
  const element = document.createElement('a');
  let mime = 'text/plain';
  const extension = filename.match(/\.([^\.])+$/);
  switch(extension && extension[1]) {
    case 'svg':
      mime = 'image/svg+xml';
      break;
    case 'png':
      mime = 'image/png';
      break;
  }
  element.setAttribute('href', `data:${mime};charset=utf-8,` + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}