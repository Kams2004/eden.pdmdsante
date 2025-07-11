import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar, Clock, Users, X } from 'lucide-react';

interface Availability {
  id: string;
  start: string;
  end: string;
  daysOfWeek: number[];
}

const dayColors = [
  '#FFADAD', 
  '#FFD6A5', 
  '#FDFFB6', 
  '#CAFFBF', 
  '#9BF6FF', 
  '#A0C4FF', 
  '#BDB2FF'
];

const DoctorAppointments: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [showModal, setShowModal] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [availabilityForm, setAvailabilityForm] = useState({
    start: '',
    end: '',
    daysOfWeek: [] as number[],
  });

  const handleAddAvailability = () => {
    const newAvailability: Availability = {
      id: String(Date.now()),
      start: availabilityForm.start,
      end: availabilityForm.end,
      daysOfWeek: availabilityForm.daysOfWeek,
    };
    setAvailabilities([...availabilities, newAvailability]);
    setShowModal(false);
    setAvailabilityForm({ start: '', end: '', daysOfWeek: [] });
  };

  const handleDeleteAvailability = (id: string) => {
    setAvailabilities(availabilities.filter(avail => avail.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appointments Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
            className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50"
          >
            {view === 'calendar' ? <Clock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
            {view === 'calendar' ? 'Switch to List' : 'Switch to Calendar'}
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" /> Add Availability
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {view === 'calendar' ? (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            events={availabilities.flatMap(avail =>
              avail.daysOfWeek.map(day => ({
                title: `Available (${avail.start} - ${avail.end})`,
                startTime: avail.start,
                endTime: avail.end,
                daysOfWeek: [day],
                backgroundColor: dayColors[day],
                textColor: '#000000',
              }))
            )}
          />
        ) : (
          <div className="space-y-4">
            {availabilities.map((availability) => (
              <div key={availability.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Users className="w-5 h-5 text-green-500" />
                  <div>
                    <h3 className="font-medium">Availability</h3>
                    <p className="text-sm text-gray-600">{availability.start} - {availability.end}</p>
                    <p className="text-sm text-gray-500">Days: {availability.daysOfWeek.map(day => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]).join(', ')}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteAvailability(availability.id)} className="text-red-500 hover:text-red-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Availability</h2>
            <form className="space-y-4">
              <label className="block">
                Start Time:
                <input
                  type="time"
                  className="block w-full p-2 border rounded"
                  value={availabilityForm.start}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, start: e.target.value })}
                />
              </label>
              <label className="block">
                End Time:
                <input
                  type="time"
                  className="block w-full p-2 border rounded"
                  value={availabilityForm.end}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, end: e.target.value })}
                />
              </label>
              <label className="block">
                Days of the Week:
                <select
                  multiple
                  className="block w-full p-2 border rounded"
                  onChange={(e) =>
                    setAvailabilityForm({
                      ...availabilityForm,
                      daysOfWeek: Array.from(e.target.selectedOptions, (opt) => Number(opt.value)),
                    })
                  }
                >
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  onClick={handleAddAvailability}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;