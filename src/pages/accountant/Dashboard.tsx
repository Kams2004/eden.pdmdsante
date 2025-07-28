
import { Users, UserCheck, ArrowLeftRight, Activity, Calendar, Bell } from 'lucide-react';

interface DashboardProps {
  stats: {
    totalTransactions: number;
    pendingPayments: number;
    completedPayments: number;
    monthlyGrowth: number;
  };
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const recentTransactions = [
    { id: 1, doctor: "Dr. John Smith", amount: 1500, date: "2024-03-15" },
    { id: 2, doctor: "Dr. Sarah Johnson", amount: 2300, date: "2024-03-14" },
    { id: 3, doctor: "Dr. Michael Brown", amount: 1800, date: "2024-03-13" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <StatCard
          title="Total Doctors"
          value="45"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Patients"
          value="1,234"
          icon={UserCheck}
          color="bg-green-500"
        />
        <StatCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={ArrowLeftRight}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{transaction.doctor}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <span className="font-semibold text-green-600">
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">System Status</h3>
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium">Next Payment Processing</span>
              </div>
              <span className="text-sm text-gray-600">March 25, 2024</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium">System Status</span>
              </div>
              <span className="text-sm text-green-600">Operational</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Pending Approvals</h3>
          <button className="text-sm text-blue-500 hover:text-blue-600">View all</button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Doctor</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Type</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-3">Dr. John Smith</td>
              <td className="px-4 py-3">Commission</td>
              <td className="px-4 py-3">{formatCurrency(1500)}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;