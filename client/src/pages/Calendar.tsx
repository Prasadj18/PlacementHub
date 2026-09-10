import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, Video, MapPin, ArrowRight,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import { Event } from '../types';

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    eventsApi.getAll()
      .then((res) => setEvents(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day: number): Event[] => {
    return events.filter((e) => {
      const d = new Date(e.dateTime);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const now = new Date();
  const upcomingEvents = events
    .filter((e) => new Date(e.dateTime) >= now)
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 8);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">View all placement events</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-6)' }}>
        {/* Calendar Grid */}
        <div className="card">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-6)',
          }}>
            <button className="btn btn-ghost btn-icon" onClick={prevMonth}><ChevronLeft size={20} /></button>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{monthName}</h3>
            <button className="btn btn-ghost btn-icon" onClick={nextMonth}><ChevronRight size={20} /></button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 2,
          }}>
            {/* Day headers */}
            {days.map((d) => (
              <div key={d} style={{
                textAlign: 'center',
                padding: 'var(--space-2)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
              }}>
                {d}
              </div>
            ))}

            {/* Blanks */}
            {blanks.map((b) => (
              <div key={`blank-${b}`} style={{ padding: 'var(--space-2)', minHeight: 80 }} />
            ))}

            {/* Dates */}
            {dates.map((day) => {
              const dayEvents = getEventsForDate(day);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

              return (
                <div key={day} style={{
                  padding: 'var(--space-2)',
                  minHeight: 80,
                  borderRadius: 'var(--radius-sm)',
                  border: isToday ? '2px solid var(--color-primary)' : '1px solid var(--color-border-light)',
                  background: isToday ? 'var(--color-primary-light)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                  cursor: dayEvents.length > 0 ? 'pointer' : 'default',
                }}>
                  <span style={{
                    fontSize: '0.8125rem',
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'var(--color-primary)' : 'var(--color-text)',
                  }}>
                    {day}
                  </span>
                  <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayEvents.slice(0, 2).map((event) => (
                      <div key={event.id} style={{
                        fontSize: '0.625rem',
                        padding: '1px 4px',
                        borderRadius: 'var(--radius-sm)',
                        background: event.type === 'INTERVIEW' ? '#e0e7ff' :
                          event.type === 'OA' ? '#fef3c7' :
                            event.type === 'PPT' ? '#ede9fe' :
                              event.type === 'RESULT' ? '#d1fae5' : '#f1f5f9',
                        color: event.type === 'INTERVIEW' ? '#4338ca' :
                          event.type === 'OA' ? '#b45309' :
                            event.type === 'PPT' ? '#6d28d9' :
                              event.type === 'RESULT' ? '#065f46' : '#475569',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 500,
                      }}>
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span style={{ fontSize: '0.5625rem', color: 'var(--color-text-tertiary)' }}>
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CalendarDays size={18} style={{ color: 'var(--color-primary)' }} />
              Upcoming Events
            </h3>
          </div>

          {upcomingEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {upcomingEvents.map((event) => (
                <Link to={`/companies/${event.companyId}`} key={event.id} style={{
                  display: 'block',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-light)',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className={`badge badge-${event.type === 'OA' ? 'event-oa' : event.type.toLowerCase()}`} style={{ fontSize: '0.5625rem' }}>
                      {event.type}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{event.company.name}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: 4 }}>{event.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={12} />
                      {new Date(event.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} {formatTime(event.dateTime)}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {event.isOnline ? <Video size={12} /> : <MapPin size={12} />}
                      {event.isOnline ? 'Online' : (event.venue || 'TBD')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              No upcoming events
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
