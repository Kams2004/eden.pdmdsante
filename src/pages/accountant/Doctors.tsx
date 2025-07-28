// import { useState } from 'react';
// import DatePicker from "react-datepicker";
// import { Search, Filter, RefreshCcw, Printer } from 'lucide-react';

// interface Patient {
//   id: string;
//   name: string;
//   examination: string;
//   commission: number;
//   date: Date;
//   selected?: boolean;
// }

// const Doctors: React.FC = () => {
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;

//   const demoPatients: Patient[] = [
//     {
//       id: "P1",
//       name: "John Smith",
//       examination: "MRI Scan",
//       commission: 150.00,
//       date: new Date("2024-03-15")
//     },
//     // Add more demo data
//   ];

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'XOF'
//     }).format(amount);
//   };

//   const totalCommissions = demoPatients.reduce((sum, patient) => sum + patient.commission, 0);
//   const totalPages = Math.ceil(demoPatients.length / itemsPerPage);

//   const handlePrint = () => {
//     // Implement print functionality
//   };

//   const handleReset = () => {
//     setStartDate(null);
//     setEndDate(null);
//     setSearchTerm('');
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={setStartDate}
//                 className="px-3 py-2 border rounded-lg"
//                 placeholderText="Select start date"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
//               <DatePicker
//                 selected={endDate}
//                 onChange={setEndDate}
//                 className="px-3 py-2 border rounded-lg"
//                 placeholderText="Select end date"
//               />
//             </div>
//           </div>

//           <div className="relative w-64">
//             <input
//               type="text"
//               placeholder="Search doctor..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border rounded-lg"
//             />
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//           </div>
//         </div>

//         <div className="flex justify-end gap-2 mb-6">
//           <button className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2">
//             <Filter className="w-4 h-4" />
//             Filter
//           </button>
//           <button onClick={handleReset} className="px-4 py-2 border rounded-lg flex items-center gap-2">
//             <RefreshCcw className="w-4 h-4" />
//             Reset
//           </button>
//           <button onClick={handlePrint} className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2">
//             <Printer className="w-4 h-4" />
//             Print
//           </button>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b">
//                 <th className="px-4 py-2 text-left">
//                   <input type="checkbox" className="rounded" />
//                 </th>
//                 <th className="px-4 py-2 text-left">Patient</th>
//                 <th className="px-4 py-2 text-left">Examination</th>
//                 <th className="px-4 py-2 text-left">Commission</th>
//                 <th className="px-4 py-2 text-left">Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {demoPatients.map((patient) => (
//                 <tr key={patient.id} className="border-b">
//                   <td className="px-4 py-2">
//                     <input
//                       type="checkbox"
//                       checked={selectedPatients.includes(patient.id)}
//                       onChange={(e) => {
//                         if (e.target.checked) {
//                           setSelectedPatients([...selectedPatients, patient.id]);
//                         } else {
//                           setSelectedPatients(selectedPatients.filter(id => id !== patient.id));
//                         }
//                       }}
//                       className="rounded"
//                     />
//                   </td>
//                   <td className="px-4 py-2">{patient.name}</td>
//                   <td className="px-4 py-2">{patient.examination}</td>
//                   <td className="px-4 py-2">{formatCurrency(patient.commission)}</td>
//                   <td className="px-4 py-2">{patient.date.toLocaleDateString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         <div className="mt-4 flex justify-end">
//           <p className="text-lg font-bold">
//             Total Commission: {formatCurrency(totalCommissions)}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Doctors;
