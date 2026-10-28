// The kit's CSS Modules: vp pack compiles each into a class map (and injects its stylesheet)
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}
