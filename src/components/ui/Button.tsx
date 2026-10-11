import type { ComponentPropsWithoutRef } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'ghost' | 'outline';

type LinkProps = ComponentPropsWithoutRef<'a'> & {
  href: string;
  external?: boolean;
  variant?: ButtonVariant;
};

type NativeButtonProps = ComponentPropsWithoutRef<'button'> & {
  href?: never;
  external?: never;
  variant?: ButtonVariant;
};

export type ButtonProps = LinkProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  if (props.href !== undefined) {
    const { className, external, rel, variant = 'primary', ...linkProps } = props;

    return (
      <a
        {...linkProps}
        className={['ui-button', `ui-button--${variant}`, className].filter(Boolean).join(' ')}
        rel={external ? `${rel ? `${rel} ` : ''}noopener noreferrer` : rel}
      />
    );
  }

  const { className, variant = 'primary', ...buttonProps } = props;

  return (
    <button
      type="button"
      {...buttonProps}
      className={['ui-button', `ui-button--${variant}`, className].filter(Boolean).join(' ')}
    />
  );
}

export default Button;
