/**
 *  Enhanced Community Events & Meetups
 * Organize and discover local community events with full details
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers, 
  FaClock, 
  FaTicketAlt,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaUserTie,
  FaMicrophone,
  FaMusic,
  FaStar,
  FaShareAlt,
  FaBookmark,
  FaFilter,
  FaThLarge,
  FaList
} from 'react-icons/fa';
import logger from '../utils/logger';
import './CommunityEvents.css';

// Mock data for development
const getMockEvents = () => [
  {
    _id: '1',
    title: 'Community Tech Workshop',
    description: 'Learn the latest web development technologies in this hands-on workshop. Perfect for beginners and intermediate developers.',
    date: '2026-05-15',
    time: '2:00 PM - 5:00 PM',
    location: 'Nairobi Innovation Hub, Westlands',
    category: 'workshop',
    status: 'confirmed',
    image: '',
    organizer: 'Tech Community KE',
    hosts: ['John Kamau', 'Sarah Wanjiku'],
    performers: ['David Ochieng - React Expert', 'Mary Akinyi - UX Designer'],
    guests: ['Prof. James Mwangi - Tech Policy'],
    attendees: ['user1', 'user2', 'user3', 'user4', 'user5'],
    maxAttendees: 50,
    ticketPrice: 'Free'
  },
  {
    _id: '2',
    title: 'Youth Empowerment Conference',
    description: 'Annual conference bringing together young leaders, entrepreneurs, and change-makers across East Africa.',
    date: '2026-05-22',
    time: '9:00 AM - 6:00 PM',
    location: 'KICC, Nairobi CBD',
    category: 'conference',
    status: 'confirmed',
    image: '',
    organizer: 'Youth Leadership Foundation',
    hosts: ['Grace Muthoni', 'Peter Odhiambo'],
    performers: ['DJ Savara - Opening Act', 'Spoken Word Poets Collective'],
    guests: ['Hon. Cabinet Secretary - Youth Affairs', 'UN Representative'],
    attendees: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8'],
    maxAttendees: 500,
    ticketPrice: 500
  },
  {
    _id: '3',
    title: 'Music & Arts Festival',
    description: 'Celebrate local talent with live music, art exhibitions, food stalls, and cultural performances.',
    date: '2026-06-01',
    time: '12:00 PM - 10:00 PM',
    location: 'Uhuru Park, Nairobi',
    category: 'concert',
    status: 'pending',
    image: '',
    organizer: 'Nairobi Arts Council',
    hosts: ['Cultural Committee'],
    performers: ['Sauti Sol', 'Nadia Mukami', 'Khaligraph Jones', 'Local Dance Troupes'],
    guests: ['County Governor', 'Minister of Culture'],
    attendees: ['user1', 'user2', 'user3'],
    maxAttendees: 5000,
    ticketPrice: 200
  },
  {
    _id: '4',
    title: 'Community Cleanup Drive',
    description: 'Join us for a monthly community cleanup. Help keep our neighborhoods clean and beautiful!',
    date: '2026-05-10',
    time: '7:00 AM - 11:00 AM',
    location: 'Kibera Community Center',
    category: 'volunteer',
    status: 'confirmed',
    image: '',
    organizer: 'Green Kenya Initiative',
    hosts: ['Volunteer Coordinators'],
    performers: [],
    guests: [],
    attendees: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10', 'user11', 'user12'],
    maxAttendees: 100,
    ticketPrice: 'Free'
  },
  {
    _id: '5',
    title: 'Digital Skills Training',
    description: 'Free training on digital literacy, online safety, and basic computer skills for community members.',
    date: '2026-05-18',
    time: '10:00 AM - 2:00 PM',
    location: 'Community Library, Eastlands',
    category: 'training',
    status: 'confirmed',
    image: '',
    organizer: 'Digital Inclusion Project',
    hosts: ['Trainer Team'],
    performers: [],
    guests: ['Library Director'],
    attendees: ['user1', 'user2', 'user3', 'user4'],
    maxAttendees: 30,
    ticketPrice: 'Free'
  },
  {
    _id: '6',
    title: 'Friday Night Social Meetup',
    description: 'Relax and network with fellow community members. Drinks, snacks, and good conversation!',
    date: '2026-05-09',
    time: '6:00 PM - 10:00 PM',
    location: 'Java House, Sarit Centre',
    category: 'social',
    status: 'confirmed',
    image: '',
    organizer: 'JamiiLink Social Club',
    hosts: ['Community Managers'],
    performers: [],
    guests: [],
    attendees: ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7'],
    maxAttendees: 25,
    ticketPrice: 'Pay Your Own'
  }
];

export default function CommunityEvents({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filter, setFilter] = useState('all');
  const [bookmarked, setBookmarked] = useState(new Set());
  const [rsvpedEvents, setRsvpedEvents] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events');
      
      if (!res.ok) {
        logger.warn('Events API not available, using mock data for development');
        setEvents(getMockEvents());
        return;
      }
      
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      logger.warn('Error fetching events, using mock data:', error.message);
      setEvents(getMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = (eventId) => {
    setBookmarked(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const handleRSVP = (eventId) => {
    setRsvpedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { icon: <FaCheckCircle />, color: '#10b981', label: 'Confirmed', bg: '#ecfdf5' },
      pending: { icon: <FaHourglassHalf />, color: '#f59e0b', label: 'Pending', bg: '#fef3c7' },
      cancelled: { icon: <FaTimesCircle />, color: '#ef4444', label: 'Cancelled', bg: '#fee2e2' }
    };
    return badges[status] || badges.pending;
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : filter === 'confirmed' || filter === 'pending' || filter === 'cancelled'
      ? events.filter(event => event.status === filter)
      : events.filter(event => event.category === filter);

  const eventCategories = ['all', 'confirmed', 'pending', 'workshop', 'meetup', 'concert', 'conference', 'training', 'social', 'volunteer'];

  if (loading) {
    return (
      <div className="events-loading">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="community-events">
      {/* Header */}
      <div className="events-header">
        <div className="header-content">
          <h2> Community Events & Meetups</h2>
          <p className="header-subtitle">Discover and organize events in your community</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <FaThLarge />
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <FaList />
            </button>
          </div>
          <motion.button
            className="create-event-btn"
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Create Event
          </motion.button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-label">
          <FaFilter /> Filter:
        </div>
        <div className="filter-buttons">
          {eventCategories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? '🌐 All' : 
               cat === 'confirmed' ? '✅ Confirmed' :
               cat === 'pending' ? ' Pending' :
               cat === 'cancelled' ? '❌ Cancelled' :
               `#${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid/List */}
      <div className={`events-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
        {filteredEvents.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h3>No events found</h3>
            <p>Try changing the filter or create a new event!</p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const statusInfo = getStatusBadge(event.status);
            const isBookmarked = bookmarked.has(event._id);
            const isRsvped = rsvpedEvents.has(event._id);
            
            return (
              <motion.div
                key={event._id}
                className={`event-card ${event.status === 'confirmed' ? 'confirmed-event' : ''} ${viewMode === 'list' ? 'event-card-list' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
                transition={{ duration: 0.2 }}
              >
                {/* Event Image */}
                <div className="event-image">
                  {event.image ? (
                    <img src={event.image} alt={event.title} />
                  ) : (
                    <div className="event-placeholder">🎉</div>
                  )}
                  <span className={`event-category ${event.category}`}>
                    {event.category}
                  </span>
                  <div className="event-status-badge" style={{ background: statusInfo.bg, color: statusInfo.color }}>
                    {statusInfo.icon} {statusInfo.label}
                  </div>
                </div>
                
                {/* Event Details */}
                <div className="event-details">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  
                  {/* Event Meta */}
                  <div className="event-meta">
                    <div className="meta-row">
                      <FaCalendarAlt className="meta-icon" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="meta-row">
                      <FaClock className="meta-icon" />
                      <span>{event.time || 'TBD'}</span>
                    </div>
                    <div className="meta-row">
                      <FaMapMarkerAlt className="meta-icon" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Event Organizer */}
                  {event.organizer && (
                    <div className="event-team">
                      <div className="team-label"> Organizer</div>
                      <div className="team-member primary">{event.organizer}</div>
                    </div>
                  )}
                  
                  {/* Event Hosts */}
                  {(event.hosts && event.hosts.length > 0) && (
                    <div className="event-team">
                      <div className="team-label">🎭 Hosts</div>
                      <div className="team-members">
                        {event.hosts.map((host, idx) => (
                          <span key={idx} className="team-member-badge">{host}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Performers */}
                  {(event.performers && event.performers.length > 0) && (
                    <div className="event-team">
                      <div className="team-label"> Performers</div>
                      <div className="team-members">
                        {event.performers.map((performer, idx) => (
                          <span key={idx} className="team-member-badge performer">{performer}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Special Guests */}
                  {(event.guests && event.guests.length > 0) && (
                    <div className="event-team">
                      <div className="team-label">⭐ Special Guests</div>
                      <div className="team-members">
                        {event.guests.map((guest, idx) => (
                          <span key={idx} className="team-member-badge guest">{guest}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attendees Count */}
                  <div className="event-attendees">
                    <FaUsers className="attendees-icon" />
                    <span className="attendees-count">
                      {event.attendees?.length || 0} / {event.maxAttendees || '∞'} attending
                    </span>
                  </div>

                  {/* Ticket Info */}
                  {event.ticketPrice && (
                    <div className="event-ticket">
                      <FaTicketAlt className="ticket-icon" />
                      <span className="ticket-price">
                        {event.ticketPrice === 'Free' || event.ticketPrice === 0 ? ' Free Event' : 
                         event.ticketPrice === 'Pay Your Own' ? '💳 Pay Your Own' : 
                         ` KES ${event.ticketPrice}`}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="event-actions">
                    <motion.button
                      className={`rsvp-button ${isRsvped ? 'rsvped' : ''}`}
                      onClick={() => handleRSVP(event._id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isRsvped ? '✓ RSVPed' : ' RSVP Now'}
                    </motion.button>
                    
                    <motion.button
                      className="icon-btn bookmark-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(event._id);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
                    >
                      <FaBookmark className={isBookmarked ? 'bookmarked' : ''} />
                    </motion.button>
                    
                    <motion.button
                      className="icon-btn share-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          navigator.share({
                            title: event.title,
                            text: event.description,
                            url: window.location.href
                          }).catch(err => logger.debug('Share cancelled'));
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('✅ Event link copied to clipboard!');
                        }
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Share event"
                    >
                      <FaShareAlt />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
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
              <form className="event-form" onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
                setShowCreateModal(false);
              }}>
                <div className="form-group">
                  <label>Event Title *</label>
                  <input type="text" placeholder="Enter event title" required />
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea placeholder="Describe your event" rows="4" required></textarea>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" required />
                  </div>
                  
                  <div className="form-group">
                    <label>Time *</label>
                    <input type="text" placeholder="e.g., 2:00 PM - 5:00 PM" required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select required>
                    <option value="">Select Category</option>
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="training">Training</option>
                    <option value="social">Social</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="concert">Concert</option>
                    <option value="conference">Conference</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Location *</label>
                  <input type="text" placeholder="Event venue or address" required />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Max Attendees</label>
                    <input type="number" placeholder="Leave empty for unlimited" min="1" />
                  </div>
                  
                  <div className="form-group">
                    <label>Ticket Price</label>
                    <input type="text" placeholder="Free or KES amount" />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Event Status</label>
                  <select defaultValue="pending">
                    <option value="pending">Pending Approval</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>👤 Organizer *</label>
                  <input type="text" placeholder="Who is organizing this event?" required />
                </div>

                <div className="form-group">
                  <label>🎭 Hosts (comma-separated)</label>
                  <input type="text" placeholder="e.g., John Doe, Jane Smith" />
                </div>

                <div className="form-group">
                  <label>🎤 Performers (comma-separated)</label>
                  <input type="text" placeholder="e.g., DJ Savara, Sauti Sol" />
                </div>

                <div className="form-group">
                  <label>⭐ Special Guests (comma-separated)</label>
                  <input type="text" placeholder="e.g., Governor, Minister" />
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    Create Event
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
