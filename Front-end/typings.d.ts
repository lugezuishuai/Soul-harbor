declare module '*.css';
declare module '*.less';
declare module '*.md';
declare module '*.png' {
  const content: any;
  export default content;
}
declare module '*.json' {
  const value: any;
  export default value;
}
declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGAttributes<React.ReactSVGElement>>;
  export default ReactComponent;
}
