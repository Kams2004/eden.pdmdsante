import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    dashboard: 'Dashboard',
    users: 'Users',
    roles: 'Roles',
    doctors: 'Doctors',
    requests: 'Requests',
    settings: 'Settings',
    patients: 'Patients',
    report: 'Report',
    addNew: 'Add New',
    edit: 'Edit',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    search: 'Search',
    filter: 'Filter',
    reset: 'Reset',
    status: 'Status',
    actions: 'Actions',
    welcome: 'Welcome',
    logout: 'Logout',
    // Add more translations as needed
  },
  fr: {
    dashboard: 'Tableau de bord',
    users: 'Utilisateurs',
    roles: 'Rôles',
    doctors: 'Médecins',
    requests: 'Demandes',
    settings: 'Paramètres',
    patients: 'Patients',
    report: 'Rapport',
    addNew: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    save: 'Enregistrer',
    search: 'Rechercher',
    filter: 'Filtrer',
    reset: 'Réinitialiser',
    status: 'Statut',
    actions: 'Actions',
    welcome: 'Bienvenue',
    logout: 'Déconnexion',
    // Add more translations as needed
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};