/** A modal's main action (AppModal `mainAction`): Save, Create, Send. */
export interface AppModalAction {
  label: string;
  onClick?: () => void;
  /** Submits the form with this id — the button is type="submit" form="…", so it works from outside the form. */
  form?: string;
  loading?: boolean;
  disabled?: boolean;
}

/** The main action's Button props, the same in the action row and in the phone header. */
export const mainActionProps = ({ onClick, form, loading, disabled }: AppModalAction) =>
  ({ type: form ? 'submit' : 'button', form, onClick, loading, disabled }) as const;

// With actions the body lays out its own scroller and action row (Dialog.module.css), so the theme's body padding and
// scrolling are off; globals.css leaves a body that sets its own overflow alone
export const BODY_WITH_ACTIONS = {
  body: { display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 },
} as const;
