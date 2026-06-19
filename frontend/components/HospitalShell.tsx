import React, { useState } from 'react';
import Navigation from './Navigation';
import Dashboard from './Dashboard';
import RegisterPatient from './RegisterPatient';
import DataExchange from './DataExchange';
import OntologyMap from './OntologyMap';
import FederatedDashboard from './FederatedDashboard';
import UpdateRecords from './UpdateRecords';
import SecurityLogs from './SecurityLogs';
import AIAssistant from './AIAssistant';

interface HospitalShellProps {
  hospitalId: string;
}

const HospitalShell: React.FC<HospitalShellProps> = ({ hospitalId }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard hospitalId={hospitalId} />;
      case 'register':
        return <RegisterPatient />;
      case 'exchange':
        return <DataExchange hospitalId={hospitalId} />;
      case 'update':
        return <UpdateRecords hospitalId={hospitalId} />;
      case 'ontology':
        return <OntologyMap />;
      case 'diagnosis':
        return <AIAssistant />;
      case 'federated':
        return <FederatedDashboard />;
      case 'logs':
        return <SecurityLogs hospitalId={hospitalId} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020617]">
      {/* Sidebar Navigation */}
      <div className="fixed inset-y-0 left-0 w-80 z-50">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} hospitalId={hospitalId} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 ml-80 min-h-screen overflow-y-auto">
        <div className="p-12 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default HospitalShell;