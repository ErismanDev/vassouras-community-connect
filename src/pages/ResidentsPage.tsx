
import React from 'react';
import ResidentForm from '../components/residents/ResidentForm';

const ResidentsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cadastro de Moradores</h1>
        <p className="text-gray-500 mt-1">
          Preencha os dados para cadastrar um novo morador
        </p>
      </div>
      
      <ResidentForm />
    </div>
  );
};

export default ResidentsPage;
