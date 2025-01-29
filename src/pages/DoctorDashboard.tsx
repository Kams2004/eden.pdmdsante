import React, { useState } from 'react';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import StatCards from '../components/Dashboard/StatCards';
import Actualities from '../components/Actualities/Actualities';
import MonthlyTransactions from '../components/Dashboard/MonthlyTransactions';
import WeeklyRevenue from '../components/Dashboard/WeeklyRevenue';
import StatusByChannel from '../components/Dashboard/StatusByChannel';
import PatientsView from '../components/Patients/PatientsView';
import RequestsView from '../components/Requests/RequestsView';
import SettingsView from '../components/Settings/SettingsView';
import backgroundImage from './61804.jpg'; // Replace with your background image

function DoctorDashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  const user = {
    name: "John Doe",
    initials: "JD"
  };

  const stats = {
    commission: {
      amount: 15750,
      count: 25,
      transactions: 42
    },
    patients: {
      total: 150,
      percentage: 75
    },
    examinations: {
      total: 85,
      percentage: 60
    }
  };

  const monthlyTransactions = {
    count: 1234,
    amount: 45678,
    total: 5678
  };

  const actualities = [
    {
      id: 1,
      title: "GRANDE MARCHE SPORTIVE",
      date: "Août 28, 2024",
      description: "Stop mal au dos",
      image: "https://pdmdsante.com/wp-content/uploads/2024/08/348696789_839602104174286_8189664223497806589_n-1080x675.jpg?w=500&auto=format",
      link: "https://pdmdsante.com/grande-marche-sportive/"
    },
    {
      id: 2,
      title: "la lutte contre le paludisme",
      date: "Avr 25, 2024",
      description: "Le partenariat « Faire reculer le paludisme » a été créé en 1998. Il fédère les efforts de l’OMS, de l’UNICEF, de la Banque mondiale, du PNUD et d’autres partenaires.",
      image: "https://pdmdsante.com/wp-content/uploads/2024/08/Paludisme.jpg?w=500&auto=format",
      link: "https://pdmdsante.com/journee-mondiale-de-lutte-contre-le-paludisme/"
    },
    {
      id: 3,
      title: "Pour une santé durable, investir dans la prévention",
      date: "Avr 22, 2024",
      description: "Commencez à Comment promouvoir une santé durable en 2024? Il faudrait peut-être sortir du vieux paradigme ne consistant qu’à viser une réduction du nombre de maladies, et s’interroger davantage sur la prévention.",
      image: "https://pdmdsante.com/wp-content/uploads/2024/08/i36115_Prevention_sante.jpg?w=500&auto=format",
      link: "https://pdmdsante.com/pour-une-sante-durable-investir-dans-la-prevention/"
    },
    {
      id: 4,
      title: "Octobre rose 2023",
      date: "Oct 2, 2023",
      description: "Pediatric wing renovation completed with improved facilities.",
      image: "https://pdmdsante.com/wp-content/uploads/2024/08/Octobre-rose-2023-version-francaise-1080x675.jpg?w=500&auto=format",
      link: "https://pdmdsante.com/octobre-rose-2022/"
    },
    {
      id: 5,
      title: "La sensibilisation de l’autisme",
      date: "2024-03-11",
      description: "Le 2 avril a lieu la Journée mondiale de sensibilisation à l’autisme. Elle vise à mieux informer le grand public sur les réalités de ce trouble du développement.",
      image: "https://pdmdsante.com/wp-content/uploads/2024/08/432919160_1024794772552842_618098978210027113_n-940x675.jpg?w=500&auto=format",
      link: "https://pdmdsante.com/journee-mondiale-de-la-sensibilisation-de-lautisme/"
    },
    {
      id: 6,
      title: "Grande compagne de prise en charge des lombalgies et des Cervicalgies",
      date: "Du 12 au 18 Juin 2023",
      description: "Grande campagne de prise en charge des Lombalgies (mal de dos) des cervicalgies, des patients souffrants de hernie discale (sciatalgie-sciatique/cervicobrachialgie)…Avec une réduction de 30% sur les tarifs régulièrement appliqués.",
      image: "https://pdmdsante.com/wp-content/uploads/2023/06/349642424_949889916054279_1739287961669853403_n-763x675.jpg?w=500&auto=format",
      link: "https://pdmdsante.com/grande-compagne-de-prise-en-charge-des-lombalgies-et-des-cervicalgies/"
    }
  ];

  const handleMenuClick = (view: string) => {
    setCurrentView(view.toLowerCase());
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundColor: '#002b36',
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header showLanguages={showLanguages} setShowLanguages={setShowLanguages} />
      </div>

      <div className="pt-24 px-4 pb-4 flex">
        <Sidebar
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          user={user}
          onMenuClick={handleMenuClick}
          currentView={currentView}
        />

        <main className="ml-24 w-full transition-all duration-300">
          <div className="h-full overflow-y-auto no-scrollbar">
            {currentView === 'dashboard' && (
              <div className="grid grid-cols-1 gap-4">
                <StatCards
                  stats={stats}
                  showAmount={showAmount}
                  setShowAmount={setShowAmount}
                />

                <Actualities actualities={actualities} />

                <MonthlyTransactions data={monthlyTransactions} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <WeeklyRevenue />
                  <StatusByChannel />
                </div>
              </div>
            )}

            {currentView === 'patients' && <PatientsView />}
            {currentView === 'requests' && <RequestsView />}
            {currentView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DoctorDashboard;
