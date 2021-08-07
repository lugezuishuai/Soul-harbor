export function scrollToTop(top: number, needScroll = false) {
  const items = document.querySelectorAll('#root,body,html');
  Array.from(items).some((e: any) => {
    if (e) {
      if (needScroll) {
        const scrollBehavior = e.style['scroll-behavior'];
        e.style['scroll-behavior'] = 'smooth';
        e.scrollTop = top;
        e.style['scroll-behavior'] = scrollBehavior;
      } else {
        e.scrollTop = top;
      }
      return true;
    } else {
      return false;
    }
  });
}

export function getOffsetTop(dom: HTMLElement, top = 0): number {
  const offsetTop = dom.offsetTop + top;

  if (dom.offsetParent) {
    return getOffsetTop(dom.offsetParent as any, offsetTop);
  }

  return offsetTop;
}
