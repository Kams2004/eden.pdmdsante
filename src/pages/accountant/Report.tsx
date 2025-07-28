import { useState } from 'react';
import DatePicker from "react-datepicker";
import { Search, Filter, RefreshCcw, Printer, ArrowRight } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  speciality: string;
  totalCommission: number;
  selected?: boolean;
}

const Report: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [synthesisData, setSynthesisData] = useState<Doctor[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const demoDoctors: Doctor[] = [
    {
      id: "D1",
      name: "Dr. John Smith",
      speciality: "Cardiology",
      totalCommission: 5000.00
    },
    // Add more demo data
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const handleSynthesis = () => {
    const selected = demoDoctors.filter(doc => selectedDoctors.includes(doc.id));
    setSynthesisData(selected);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(demoDoctors.map(doc => doc.id));
    }
    setSelectAll(!selectAll);
  };

  const totalSynthesisCommission = synthesisData.reduce((sum, doc) => sum + doc.totalCommission, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                className="px-3 py-2 border rounded-lg"
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                className="px-3 py-2 border rounded-lg"
                placeholderText="Select end date"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    className="rounded"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-left">Speciality</th>
                <th className="px-4 py-2 text-left">Commission</th>
              </tr>
            </thead>
            <tbody>
              {demoDoctors.map((doctor) => (
                <tr key={doctor.id} className="border-b">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedDoctors.includes(doctor.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDoctors([...selectedDoctors, doctor.id]);
                        } else {
                          setSelectedDoctors(selectedDoctors.filter(id => id !== doctor.id));
                        }
                      }}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-2">{doctor.name}</td>
                  <td className="px-4 py-2">{doctor.speciality}</td>
                  <td className="px-4 py-2">{formatCurrency(doctor.totalCommission)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Selected: {selectedDoctors.length} doctors
            </p>
            <button
              onClick={handleSynthesis}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
            >
              Synthesis
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Synthesis</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Doctor</th>
                <th className="px-4 py-2 text-right">Total Commission</th>
              </tr>
            </thead>
            <tbody>
              {synthesisData.map((doctor) => (
                <tr key={doctor.id} className="border-b">
                  <td className="px-4 py-2">{doctor.name}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(doctor.totalCommission)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 border-t pt-4">
            <p className="text-xl font-bold text-right">
              Total Synthesis: {formatCurrency(totalSynthesisCommission)}
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Print Synthesis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;