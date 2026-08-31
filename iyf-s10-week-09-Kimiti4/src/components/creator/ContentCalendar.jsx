import { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ContentCalendar({ posts = [], jams = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const events = useMemo(() => {
    const map = {};
    for (const post of posts) {
      const d = new Date(post.createdAt).toDateString();
      if (!map[d]) map[d] = [];
      map[d].push({ type: 'post', title: post.title || 'Post' });
    }
    for (const jam of jams) {
      const d = new Date(jam.createdAt || jam.startDate).toDateString();
      if (!map[d]) map[d] = [];
      map[d].push({ type: 'jam', title: jam.title || 'Jam' });
    }
    return map;
  }, [posts, jams]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="content-calendar">
      <div className="content-calendar-header">
        <button onClick={prevMonth} aria-label="Previous month"><FaChevronLeft /></button>
        <h3>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
        <button onClick={nextMonth} aria-label="Next month"><FaChevronRight /></button>
      </div>
      <div className="content-calendar-grid">
        {DAYS.map((d) => (
          <div key={d} className="content-calendar-day-label">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} className="content-calendar-cell empty" />;
          const dateStr = new Date(year, month, day).toDateString();
          const dayEvents = events[dateStr] || [];
          return (
            <div key={day} className={`content-calendar-cell ${dayEvents.length > 0 ? 'has-events' : ''}`}>
              <span className="content-calendar-day">{day}</span>
              {dayEvents.length > 0 && (
                <div className="content-calendar-dots">
                  {dayEvents.slice(0, 3).map((e, j) => (
                    <span key={j} className={`content-calendar-dot ${e.type}`} title={e.title} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
