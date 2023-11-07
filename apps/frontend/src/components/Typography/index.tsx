import { ReactNode } from 'react';

type TypographyProps = {
  children: ReactNode;
  className?: string;
};

export function TypographyH1({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <h1
      className={`scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ${className}`}
      {...props}
    >
      {children}
    </h1>
  );
}
export function TypographyH2({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <h2
      className={`scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}
export function TypographyH3({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <h3
      className={`scroll-m-20 text-2xl font-semibold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}
export function TypographyH4({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <h4
      className={`scroll-m-20 text-xl font-semibold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h4>
  );
}
export function TypographyH5({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <h5
      className={`scroll-m-20 text-lg font-semibold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}
export function TypographyH6({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <h6
      className={`scroll-m-20 text-base font-semibold tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h6>
  );
}
export function TypographyP({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <p
      className={`leading-7 [&:not(:first-child)]:mt-6 ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
export function TypographyInlineCode({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={`bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold ${className}`}
      {...props}
    >
      {children}
    </code>
  );
}
export function TypographyList({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <ul className={`my-6 ml-6 list-disc [&>li]:mt-2 ${className}`} {...props}>
      {children}
    </ul>
  );
}
export function TypographyLead({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <p className={`text-muted-foreground text-xl ${className}`} {...props}>
      {children}
    </p>
  );
}
export function TypographyLarg({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <div className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </div>
  );
}
export function TypographySmall({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <small
      className={`text-sm font-medium leading-none ${className}`}
      {...props}
    >
      {children}
    </small>
  );
}

export function TypographyMuted({
  children,
  className,
  ...props
}: TypographyProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <p className={`text-muted-foreground text-sm ${className}`} {...props}>
      {children}
    </p>
  );
}
