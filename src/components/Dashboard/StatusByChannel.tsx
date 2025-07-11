import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosInstance from "../../api/axioConfig";

const StatusByChannel: React.FC = () => {
  const [channelData, setChannelData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        const userData = localStorage.getItem('userData');
        if (!userData) {
          console.error('No user data found in localStorage');
          return;
        }

        const { doctor_id } = JSON.parse(userData);
        const response = await axiosInstance.get(`gnu_doctor/${doctor_id}/exams-patients`);
        const { data_patients } = response.data;

        const channelCounts = data_patients.reduce((acc: any, patientData: any) => {
          const examType = patientData[Object.keys(patientData)[0]][0];
          const amount = parseFloat(patientData[Object.keys(patientData)[0]][1]);

          if (!acc[examType]) {
            acc[examType] = { channel: examType, value: 0 };
          }
          acc[examType].value += amount;
          return acc;
        }, {});

        // Convert the object to an array and sort by value in descending order
        const formattedChannelData = Object.values(channelCounts).sort((a, b) => b.value - a.value);

        setChannelData(formattedChannelData);
      } catch (error) {
        console.error('Error fetching status by channel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            <span className="text-sm">Loading channel data...</span>
          </div>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Status by Channel</h3>
      <div className="h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default StatusByChannel;
