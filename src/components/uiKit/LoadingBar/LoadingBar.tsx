import classes from './LoadingBar.module.css';

/** LM3 §24 — the M3 indeterminate linear progress indicator, on the top edge of a box whose data refreshes. */
export function LoadingBar() {
  return (
    <span className={classes.bar} aria-hidden>
      <span className={classes.primary}>
        <span className={classes.inner} />
      </span>
      <span className={classes.secondary}>
        <span className={classes.inner} />
      </span>
    </span>
  );
}
