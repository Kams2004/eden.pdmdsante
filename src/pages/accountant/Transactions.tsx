// import { useState, useRef } from 'react';
// import DatePicker from "react-datepicker";
// import { Search, Filter, RefreshCcw, Printer, ChevronLeft, ChevronRight, FileText, User } from 'lucide-react';

// interface Transaction {
//   id: string;
//   doctor: string;
//   date: Date;
//   description: string;
//   amount: number;
//   status: string;
// }

// const Transactions: React.FC = () => {
//   const [startDate, setStartDate] = useState<Date | null>(null);
//   const [endDate, setEndDate] = useState<Date | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const printRef = useRef(null);

//   const demoTransactions: Transaction[] = Array.from({ length: 30 }, (_, i) => ({
//     id: `T${i + 1}`,
//     doctor: `Dr. ${['John Smith', 'Sarah Johnson', 'Michael Brown'][i % 3]}`,
//     date: new Date("2024-03-" + (i % 28 + 1).toString().padStart(2, '0')),
//     description: `Transaction ${i + 1}`,
//     amount: Math.floor(Math.random() * 50000) + 1000,
//     status: i % 2 === 0 ? "Completed" : "Pending"
//   }));

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'XOF'
//     }).format(amount);
//   };

//   const totalPages = Math.ceil(demoTransactions.length / itemsPerPage);

//   const handlePrint = () => {
//     const printContent = printRef.current;
//     const newWin = window.open('', '_blank');
//     newWin.document.write('<html><head><title>Transactions Report</title>');
//     newWin.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f4f4f4; }</style>');
//     newWin.document.write('</head><body>');
//     newWin.document.write(printContent.innerHTML);
//     newWin.document.write('</body></html>');
//     newWin.document.close();
//     newWin.print();
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <div className="flex justify-end gap-2 mb-4">
//           <button onClick={handlePrint} className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2">
//             <Printer className="w-4 h-4" />
//             Print
//           </button>
//         </div>
//         <div ref={printRef} className="overflow-x-auto">
//           <table className="w-full border-collapse bg-white text-left shadow-sm">
//             <thead>
//               <tr className="bg-gray-100 border-b">
//                 <th className="px-4 py-3">Doctor</th>
//                 <th className="px-4 py-3">Description</th>
//                 <th className="px-4 py-3">Amount</th>
//                 <th className="px-4 py-3">Status</th>
//                 <th className="px-4 py-3 text-right">Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {demoTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((transaction) => (
//                 <tr key={transaction.id} className="border-b hover:bg-gray-50">
//                   <td className="px-4 py-3 flex items-center gap-2">
//                     <User className="w-5 h-5 text-gray-500" />
//                     {transaction.doctor}
//                   </td>
//                   <td className="px-4 py-3">{transaction.description}</td>
//                   <td className="px-4 py-3">{formatCurrency(transaction.amount)}</td>
//                   <td className={`px-4 py-3 font-semibold ${transaction.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>{transaction.status}</td>
//                   <td className="px-4 py-3 text-right text-gray-500">{transaction.date.toLocaleDateString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <div className="mt-4 flex justify-center items-center gap-4">
//           <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded-lg flex items-center hover:bg-gray-200">
//             <ChevronLeft className="w-5 h-5" />
//           </button>
//           <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Page {currentPage} of {totalPages}</span>
//           <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-lg flex items-center hover:bg-gray-200">
//             <ChevronRight className="w-5 h-5" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Transactions;