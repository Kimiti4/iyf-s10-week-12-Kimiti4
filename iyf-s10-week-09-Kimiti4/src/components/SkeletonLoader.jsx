/**
 * 🔹 Skeleton Loading Component
 * Modern shimmer effect for better UX during data fetching
 */

import { motion } from 'framer-motion';
import './SkeletonLoader.css';

export function PostCardSkeleton() {
    return (
        <div className="skeleton-post-card">
            {/* Header with avatar and name */}
            <div className="skeleton-header">
                <div className="skeleton-avatar" />
                <div className="skeleton-author-info">
                    <div className="skeleton-line skeleton-name" />
                    <div className="skeleton-line skeleton-time" />
                </div>
            </div>

            {/* Content */}
            <div className="skeleton-content">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line skeleton-text" />
                <div className="skeleton-line skeleton-text short" />
            </div>

            {/* Image placeholder */}
            <div className="skeleton-image" />

            {/* Tags */}
            <div className="skeleton-tags">
                <div className="skeleton-tag" />
                <div className="skeleton-tag" />
                <div className="skeleton-tag" />
            </div>

            {/* Action buttons */}
            <div className="skeleton-actions">
                <div className="skeleton-action-btn" />
                <div className="skeleton-action-btn" />
                <div className="skeleton-action-btn" />
                <div className="skeleton-action-btn" />
            </div>
        </div>
    );
}

export function FeedSkeleton({ count = 3 }) {
    return (
        <div className="feed-skeleton-container">
            {Array.from({ length: count }).map((_, index) => (
                <PostCardSkeleton key={index} />
            ))}
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="skeleton-sidebar">
            <div className="skeleton-section">
                <div className="skeleton-line skeleton-section-title" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton-nav-item">
                        <div className="skeleton-icon" />
                        <div className="skeleton-line skeleton-nav-text" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function EventCardSkeleton() {
    return (
        <div className="skeleton-event-card">
            <div className="skeleton-event-image" />
            <div className="skeleton-event-content">
                <div className="skeleton-line skeleton-event-title" />
                <div className="skeleton-line skeleton-event-date" />
                <div className="skeleton-line skeleton-event-location" />
                <div className="skeleton-event-footer">
                    <div className="skeleton-badge" />
                    <div className="skeleton-badge" />
                </div>
            </div>
        </div>
    );
}

export default {
    PostCardSkeleton,
    FeedSkeleton,
    SidebarSkeleton,
    EventCardSkeleton
};
