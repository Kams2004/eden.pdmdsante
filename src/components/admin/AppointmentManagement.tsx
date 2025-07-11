import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Search, Filter, User, Calendar as CalendarIcon } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  availabilities: {
    id: string;
    start: string;
    end: string;
    daysOfWeek: number[];
  }[];
}

interface Appointment {
  id: string;
  doctorId: string;
  patientName: string;
  start: string;
  end: string;
  status: 'scheduled' | 'cancelled' | 'completed';
}

const AppointmentManagement: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dr. John Smith',
      speciality: 'Cardiology',
      availabilities: [
        {
          id: '1',
          start: '09:00',
          end: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5]
        }
      ]
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      speciality: 'Neurology',
      availabilities: [
        {
          id: '1',
          start: '10:00',
          end: '18:00',
          daysOfWeek: [1, 3, 5]
        }
      ]
    }
  ]);

  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      doctorId: '1',
      patientName: 'John Doe',
      start: '2024-03-20T09:00:00',
      end: '2024-03-20T10:00:00',
      status: 'scheduled'
    }
  ]);

  const handleDateSelect = (selectInfo: any) => {
    setShowModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    console.log(clickInfo.event);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Appointment Management</h1>
        <div className="flex gap-4">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button className="px-4 py-2 border rounded-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Doctors List */}
        <div className="col-span-1 bg-white rounded-xl shadow-md p-4 space-y-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            Doctors
          </h2>
          <div className="space-y-2">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor.id)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedDoctor === doctor.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <p className="font-medium">{doctor.name}</p>
                <p className="text-sm text-gray-600">{doctor.speciality}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar View */}
        <div className="col-span-3 bg-white rounded-xl shadow-md p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={[
              // Show selected doctor's availabilities
              ...(selectedDoctor
                ? doctors
                    .find(d => d.id === selectedDoctor)
                    ?.availabilities.map(avail => ({
                      title: 'Available',
                      startTime: avail.start,
                      endTime: avail.end,
                      daysOfWeek: avail.daysOfWeek,
                      backgroundColor: '#e2e8f0',
                      textColor: '#1e293b',
                      classNames: ['availability']
                    })) || []
                : []),
              // Show appointments for selected doctor
              ...appointments
                .filter(apt => !selectedDoctor || apt.doctorId === selectedDoctor)
                .map(apt => ({
                  id: apt.id,
                  title: `Appointment - ${apt.patientName}`,
                  start: apt.start,
                  end: apt.end,
                  className: `status-${apt.status}`
                }))
            ]}
            select={handleDateSelect}
            eventClick={handleEventClick}
          />
        </div>
      </div>

      {/* Modal for scheduling appointments */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Schedule Appointment</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <CalendarIcon className="w-6 h-6" />
              </button>
            </div>
            <form className="space-y-4">
              {/* Add appointment form fields */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;