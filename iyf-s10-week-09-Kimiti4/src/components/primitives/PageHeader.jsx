/**
 * PageHeader — Shared page title / actions strip.
 *
 * Use at the top of content pages for consistent hierarchy.
 *
 * @module components/primitives/PageHeader
 */

import './PageHeader.css';

export default function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className = '',
  ...props
}) {
  return (
    <header className={`page-header ${className}`} {...props}>
      <div className="page-header__text">
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        {title && <h1 className="page-header__title">{title}</h1>}
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}
