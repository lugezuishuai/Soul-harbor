export function filterEvent(e: Event) {
  e.stopPropagation();
  e.preventDefault();
}
