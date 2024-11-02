import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      const q = query(collection(db, 'appointments'));
      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: `${data.patientName} - ${data.type}`,
          start: data.date.toDate(),
          end: new Date(data.date.toDate().getTime() + 60 * 60 * 1000), // 1 hour duration
          patientName: data.patientName,
          type: data.type,
          notes: data.notes
        };
      });
      setEvents(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  return (
    <div className="h-screen p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Calendário de Consultas</h2>
      </div>

      <div className="h-[calc(100vh-200px)]">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
          }}
        />
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{selectedEvent.title}</h3>
            <p className="mb-2">
              <strong>Data:</strong> {format(selectedEvent.start, "dd/MM/yyyy HH:mm")}
            </p>
            <p className="mb-2">
              <strong>Tipo:</strong> {selectedEvent.type}
            </p>
            {selectedEvent.notes && (
              <p className="mb-4">
                <strong>Observações:</strong> {selectedEvent.notes}
              </p>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}