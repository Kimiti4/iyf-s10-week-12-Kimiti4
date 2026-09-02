/**
 * Card — Canonical card layout primitive.
 *
 * Provides Header/Body/Footer slots for consistent card structure.
 * Used by PostCard, JamCard, ContributionCard, AlertCard.
 *
 * @module components/primitives/Card
 */

import './Card.css';

export default function Card({ children, variant = 'default', className = '', ...props }) {
  return (
    <article className={`card card--${variant} ${className}`} {...props}>
      {children}
    </article>
  );
}

function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`card-header ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardBody({ children, className = '', ...props }) {
  return (
    <div className={`card-body ${className}`} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`card-footer ${className}`} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
