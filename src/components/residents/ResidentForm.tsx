
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import PersonalDataForm from './form/PersonalDataForm';
import AddressForm from './form/AddressForm';
import ElectoralDataForm from './form/ElectoralDataForm';
import DocumentUploader from './form/DocumentUploader';
import { useResidentForm } from './form/useResidentForm';

const ResidentForm: React.FC = () => {
  const {
    // Personal data
    name, setName,
    cpf, setCpf,
    rg, setRg,
    birthDate, setBirthDate,
    phone, setPhone,
    email, setEmail,
    
    // Address
    street, setStreet,
    number, setNumber,
    complement, setComplement,
    neighborhood, setNeighborhood,
    city, setCity,
    state, setState,
    zipCode, setZipCode,
    
    // Electoral data
    voterTitle, setVoterTitle,
    zone, setZone,
    section, setSection,
    
    // Documents
    documents, setDocuments,
    
    // Form state
    isSubmitting,
    
    // Methods
    handleSubmit,
    resetForm
  } = useResidentForm();
  
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Campos obrigatórios:</strong> Apenas Nome e CPF são obrigatórios para o cadastro inicial. 
            Os demais campos podem ser preenchidos posteriormente.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">
                Dados Pessoais
                <span className="ml-1 text-red-500">*</span>
              </TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="electoral">Dados Eleitorais</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>
            
            {/* Personal Data Tab */}
            <TabsContent value="personal" className="space-y-4 pt-4">
              <PersonalDataForm
                name={name} setName={setName}
                cpf={cpf} setCpf={setCpf}
                rg={rg} setRg={setRg}
                birthDate={birthDate} setBirthDate={setBirthDate}
                phone={phone} setPhone={setPhone}
                email={email} setEmail={setEmail}
              />
            </TabsContent>
            
            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4 pt-4">
              <div className="mb-2 text-sm text-gray-600">
                Todos os campos de endereço são opcionais
              </div>
              <AddressForm 
                street={street} setStreet={setStreet}
                number={number} setNumber={setNumber}
                complement={complement} setComplement={setComplement}
                neighborhood={neighborhood} setNeighborhood={setNeighborhood}
                city={city} setCity={setCity}
                state={state} setState={setState}
                zipCode={zipCode} setZipCode={setZipCode}
              />
            </TabsContent>
            
            {/* Electoral Data Tab */}
            <TabsContent value="electoral" className="space-y-4 pt-4">
              <div className="mb-2 text-sm text-gray-600">
                Todos os campos eleitorais são opcionais
              </div>
              <ElectoralDataForm 
                voterTitle={voterTitle} setVoterTitle={setVoterTitle}
                zone={zone} setZone={setZone}
                section={section} setSection={setSection}
              />
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4 pt-4">
              <div className="mb-2 text-sm text-gray-600">
                O upload de documentos é opcional
              </div>
              <DocumentUploader 
                documents={documents}
                setDocuments={setDocuments}
              />
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6 space-x-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
            >
              Limpar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-association-primary hover:bg-blue-700"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResidentForm;
