import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CommunityEvents.css';

/**
 *  Community Events & Meetups
 * Organize and discover local community events
 */

export default function CommunityEvents({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div className="community-events">
      {/* Header */}
      <div className="events-header">
        <h2>🎉 Community Events</h2>
        <motion.button
          className="create-event-btn"
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          + Create Event
        </motion.button>
      </div>

      {/* Events Grid */}
      <div className="events-grid">
        {events.map((event) => (
          <motion.div
            key={event._id}
            className="event-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedEvent(event)}
          >
            <div className="event-image">
              {event.image ? (
                <img src={event.image} alt={event.title} />
              ) : (
                <div className="event-placeholder">📅</div>
              )}
              <span className={`event-category ${event.category}`}>
                {event.category}
              </span>
            </div>
            
            <div className="event-details">
              <h3>{event.title}</h3>
              <p className="event-description">{event.description}</p>
              
              <div className="event-meta">
                <span className="meta-item">
                  📅 {new Date(event.date).toLocaleDateString()}
                </span>
                <span className="meta-item">
                  📍 {event.location}
                </span>
                <span className="meta-item">
                  👥 {event.attendees?.length || 0} attending
                </span>
              </div>

              <motion.button
                className="rsvp-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                RSVP Now
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Create New Event</h2>
              <form className="event-form">
                <input type="text" placeholder="Event Title" required />
                <textarea placeholder="Description" rows="4" required></textarea>
                <input type="datetime-local" required />
                <input type="text" placeholder="Location" required />
                <select required>
                  <option value="">Select Category</option>
                  <option value="workshop">Workshop</option>
                  <option value="meetup">Meetup</option>
                  <option value="training">Training</option>
                  <option value="social">Social</option>
                  <option value="volunteer">Volunteer</option>
                </select>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit">Create Event</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
