export const getCursorStyle = (i: number) => {
  let cursor = 'default';
  switch (i) {
    case 0:
    case 2:
      cursor = 'nwse-resize';
      break;
    case 1:
    case 3:
      cursor = 'nesw-resize';
      break;
    case 4:
    case 6:
      cursor = 'ns-resize';
      break;
    case 5:
    case 7:
      cursor = 'ew-resize';
      break;
    case 8:
      cursor = 'move';
      break;
    default:
      break;
  }
  return cursor;
};
