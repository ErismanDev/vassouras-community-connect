
import React from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ResidentForm from '../components/residents/ResidentForm';

const ResidentsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cadastro de Moradores</h1>
        <p className="text-gray-500 mt-1">
          Preencha os dados para cadastrar um novo morador
        </p>
      </div>
      
      <ResidentForm />
    </DashboardLayout>
  );
};

export default ResidentsPage;
