import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Calendar, Plus, Clock, Users, User } from 'lucide-react';

const MeetingScheduler = ({ role }) => {
  const { currentUser, getUsersByRole, getUserById } = useAuth();
  const { addMeeting, updateMeeting, getMeetingsByUser } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    duration: 60,
    attendees: []
  });

  const targetUsers = role === 'admin' ? getUsersByRole('hr') : getUsersByRole('employee').filter(emp => emp.createdBy === currentUser._id);
  const myMeetings = getMeetingsByUser(currentUser._id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dateTime || formData.attendees.length === 0) {
      alert('Please fill in all required fields and select at least one attendee');
      return;
    }

    addMeeting({
      ...formData,
      scheduledBy: currentUser._id
    });

    setFormData({
      title: '',
      description: '',
      dateTime: '',
      duration: 60,
      attendees: []
    });
    setShowAddForm(false);
  };

  const handleAttendeeChange = (userId) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(userId)
        ? prev.attendees.filter(id => id !== userId)
        : [...prev.attendees, userId]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-4 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {role === 'employee' ? 'My Meetings' : 'Meeting Scheduler'}
            </h2>
          </div>
          {role !== 'employee' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-medium text-sm sm:text-base">Schedule Meeting</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-8">
        {showAddForm && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 border-2 border-blue-100 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900">Schedule New Meeting</h3>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter meeting title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Attendees * (Select {role === 'admin' ? 'HR' : 'Employee'} members)
                </label>
                <div className="space-y-2 sm:space-y-3 max-h-48 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
                  {targetUsers.map(user => (
                    <label key={user._id} className="flex items-center space-x-2 sm:space-x-3 p-1 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.attendees.includes(user._id)}
                        onChange={() => handleAttendeeChange(user._id)}
                        className="rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 sm:h-5 sm:w-5"
                      />
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none text-sm sm:text-base"
                  rows="4"
                  placeholder="Enter meeting description"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  Schedule Meeting
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {myMeetings.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="p-4 sm:p-6 bg-gray-100 rounded-full w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">No Meetings Scheduled</h3>
            <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto px-4">
              {role === 'employee' 
                ? 'You have no meetings scheduled yet. Check back later for updates.' 
                : 'Schedule your first meeting to get started with your team.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {myMeetings.map((meeting) => {
              const organizer = getUserById(meeting.scheduledBy);
              
              return (
                <div key={meeting._id} className="border-2 border-gray-100 rounded-xl p-4 sm:p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 bg-white">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 lg:mr-6">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{meeting.title}</h3>
                        <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider w-fit ${getStatusColor(meeting.status)}`}>
                          {meeting.status}
                        </span>
                      </div>
                      
                      {meeting.description && (
                        <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">{meeting.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-blue-100 rounded">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">
                            {role === 'employee' 
                              ? `By: ${organizer?.name}` 
                              : `You (Organizer)`
                            }
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-green-100 rounded">
                            <Calendar className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="font-medium">{new Date(meeting.dateTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-yellow-100 rounded">
                            <Clock className="w-4 h-4 text-yellow-600" />
                          </div>
                          <span className="font-medium">
                            {new Date(meeting.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({meeting.duration}m)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-purple-100 rounded">
                            <Users className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="font-medium">{meeting.attendees.length} attendees</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                      {role !== 'employee' && meeting.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => updateMeeting(meeting.id, { status: 'completed' })}
                            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all duration-200 transform hover:scale-105 text-center"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() => updateMeeting(meeting.id, { status: 'cancelled' })}
                            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 transform hover:scale-105 text-center"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {meeting.status === 'scheduled' && meeting.googleMeetLink && (
                        <a
                          href={meeting.googleMeetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-center shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {meeting.attendees.map(attendeeId => {
                        const attendee = getUserById(attendeeId);
                        return attendee ? (
                          <span key={attendeeId} className="px-2 sm:px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-xs sm:text-sm font-medium rounded-full shadow-sm">
                            {attendee.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingScheduler;