export function scrollToTop(top: number, selector = '#root,body,html', needScroll = false) {
  const items = document.querySelectorAll(selector);
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

export function getRelativePosition(target: HTMLElement, container: HTMLElement) {
  const offset = { x: -1, y: -1 };
  if (target.compareDocumentPosition(container) & Node.DOCUMENT_POSITION_CONTAINS) {
    const offsetParent = target.offsetParent;
    if (!offsetParent) {
      return offset;
    }
    offset.x = target.offsetLeft;
    offset.y = target.offsetTop;

    if (offsetParent === container) {
      return offset;
    } else {
      const result = getRelativePosition(offsetParent as HTMLElement, container);
      offset.x += result.x;
      offset.y += result.y;
    }
  }

  return offset;
}

export function getOffsetTop(dom: HTMLElement, top = 0, className = ''): number {
  const offsetTop = dom.offsetTop + top;
  const domParent = dom.offsetParent;

  if (domParent) {
    if (!className) {
      return getOffsetTop(domParent as any, offsetTop);
    } else {
      if (!domParent.className.split(' ').includes(className)) {
        return getOffsetTop(domParent as any, offsetTop, className);
      }
    }
  }

  return offsetTop;
}

export function getOffsetLeft(dom: HTMLElement, left = 0, className = ''): number {
  const offsetLeft = dom.offsetLeft + left;
  const domParent = dom.offsetParent;

  if (domParent) {
    if (!className) {
      return getOffsetLeft(domParent as any, offsetLeft);
    } else {
      if (!domParent.className.split(' ').includes(className)) {
        return getOffsetLeft(domParent as any, offsetLeft, className);
      }
    }
  }

  return offsetLeft;
}
