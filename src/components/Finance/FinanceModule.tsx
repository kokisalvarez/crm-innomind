import React, { useState } from 'react';
import { FinanceProvider } from '../../context/FinanceContext';
import FinanceDashboard from './FinanceDashboard';
import TransactionTable from './TransactionTable';
import TransactionForm from './TransactionForm';
import InvoiceManager from './InvoiceManager';
import BudgetManager from './BudgetManager';
import ReportsManager from './ReportsManager';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  FileText, 
  Target, 
  BarChart3,
  Plus
} from 'lucide-react';

const FinanceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const tabs = [
    { id: 'dashboard', name: 'Panel', icon: LayoutDashboard },
    { id: 'transactions', name: 'Transacciones', icon: ArrowUpDown },
    { id: 'invoices', name: 'Facturas', icon: FileText },
    { id: 'budgets', name: 'Presupuestos', icon: Target },
    { id: 'reports', name: 'Reportes', icon: BarChart3 }
  ];

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleCloseForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FinanceDashboard />;
      case 'transactions':
        return <TransactionTable onEditTransaction={handleEditTransaction} />;
      case 'invoices':
        return <InvoiceManager />;
      case 'budgets':
        return <BudgetManager />;
      case 'reports':
        return <ReportsManager />;
      default:
        return <FinanceDashboard />;
    }
  };

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {activeTab === 'transactions' && (
                <button
                  onClick={() => setShowTransactionForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Transacción</span>
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </main>

        {/* Transaction Form Modal */}
        <TransactionForm
          isOpen={showTransactionForm}
          onClose={handleCloseForm}
          editTransaction={editingTransaction}
        />
      </div>
    </FinanceProvider>
  );
};

export default FinanceModule;