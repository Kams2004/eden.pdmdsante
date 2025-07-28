// import React, { useState, useEffect } from 'react';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import axiosInstance from "../../api/axioConfig";

// const WeeklyRevenue: React.FC = () => {
//   const [weeklyData, setWeeklyData] = useState([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     const fetchWeeklyData = async () => {
//       try {
//         setLoading(true);
        
//         const userData = localStorage.getItem('userData');
//         if (!userData) {
//           console.error('No user data found in localStorage');
//           return;
//         }

//         const { doctor_id } = JSON.parse(userData);
//         const response = await axiosInstance.get(`gnu_doctor/${doctor_id}/exams-patients`);
//         const { data_patients } = response.data;

//         // Sort data by date
//         const sortedData = data_patients.map((patientData: any) => {
//           const dateString = patientData[Object.keys(patientData)[0]][2];
//           return {
//             date: new Date(dateString),
//             amount: parseFloat(patientData[Object.keys(patientData)[0]][1])
//           };
//         }).sort((a, b) => a.date - b.date);

//         // Function to get the week number in the year
//         const getWeekNumber = (date) => {
//           const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
//           const pastDaysOfYear = (date - firstDayOfYear) / (1000 * 60 * 60 * 24);
//           return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
//         };

//         // Group data by week
//         const weeklyRevenueMap = sortedData.reduce((acc, { date, amount }) => {
//           const weekNumber = getWeekNumber(date);
//           const year = date.getFullYear();
//           const weekKey = `${year}-W${weekNumber}`;

//           if (!acc[weekKey]) {
//             acc[weekKey] = { week: weekKey, revenue: 0 };
//           }
//           acc[weekKey].revenue += amount;
//           return acc;
//         }, {});

//         // Convert the object to an array and sort by week number
//         const weeklyRevenueData = Object.values(weeklyRevenueMap).sort((a, b) => {
//           const weekA = parseInt(a.week.split('-W')[1]);
//           const weekB = parseInt(b.week.split('-W')[1]);
//           return weekA - weekB;
//         });

//         setWeeklyData(weeklyRevenueData);
//       } catch (error) {
//         console.error('Error fetching weekly revenue data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWeeklyData();
//   }, []);

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 relative">
//       <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Revenue</h3>
//       <div className="h-[300px] relative">
//         {loading ? (
//           <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
//             <div className="flex flex-col items-center">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
//               <span className="text-sm text-gray-600">Loading weekly revenue...</span>
//             </div>
//           </div>
//         ) : weeklyData.length === 0 ? (
//           <div className="absolute inset-0 flex items-center justify-center">
//             <div className="text-center">
//               <div className="text-gray-400 mb-2">📊</div>
//               <span className="text-sm text-gray-500">No revenue data available</span>
//             </div>
//           </div>
//         ) : (
//           <ResponsiveContainer width="100%" height="100%">
//             <AreaChart data={weeklyData}>
//               <defs>
//                 <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
//                   <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="week" />
//               <YAxis />
//               <Tooltip />
//               <Area
//                 type="monotone"
//                 dataKey="revenue"
//                 stroke="#3B82F6"
//                 fillOpacity={1}
//                 fill="url(#colorRevenue)"
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         )}
//       </div>
//     </div>
//   );
// };

// export default WeeklyRevenue;