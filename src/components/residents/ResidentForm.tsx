
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface DocumentPreview {
  name: string;
  url: string;
  file: File;
}

const ResidentForm: React.FC = () => {
  // Personal data state
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Address state
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  // Electoral data state
  const [voterTitle, setVoterTitle] = useState('');
  const [zone, setZone] = useState('');
  const [section, setSection] = useState('');
  
  // Documents state
  const [documents, setDocuments] = useState<Record<string, DocumentPreview | null>>({
    idDocument: null,
    proofOfResidence: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format CPF as 000.000.000-00
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };
  
  // Format phone number as (00) 00000-0000
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };
  
  // Format CEP as 00000-000
  const formatZipCode = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };
  
  // Handle file uploads
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Tipo de arquivo inválido. Use JPG, PNG ou PDF.');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. O limite é 5MB.');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setDocuments(prev => ({
      ...prev,
      [documentType]: {
        name: file.name,
        url,
        file,
      }
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validation
    if (!name || !cpf || !rg || !birthDate || !phone || !email) {
      toast.error('Preencha todos os campos pessoais obrigatórios.');
      setIsSubmitting(false);
      return;
    }
    
    if (!street || !number || !neighborhood || !city || !state || !zipCode) {
      toast.error('Preencha todos os campos de endereço obrigatórios.');
      setIsSubmitting(false);
      return;
    }
    
    if (!voterTitle || !zone || !section) {
      toast.error('Preencha todos os dados eleitorais obrigatórios.');
      setIsSubmitting(false);
      return;
    }
    
    if (!documents.idDocument || !documents.proofOfResidence) {
      toast.error('Upload de todos os documentos é obrigatório.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Simulate API call - In a real app, you would send this to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Morador cadastrado com sucesso!');
      
      // In a real app, you might redirect or clear the form
      // For demo purposes, we'll just reset the form
      resetForm();
    } catch (error) {
      toast.error('Erro ao cadastrar morador. Tente novamente.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    // Reset all form fields to initial state
    setName('');
    setCpf('');
    setRg('');
    setBirthDate('');
    setPhone('');
    setEmail('');
    setStreet('');
    setNumber('');
    setComplement('');
    setNeighborhood('');
    setCity('');
    setState('');
    setZipCode('');
    setVoterTitle('');
    setZone('');
    setSection('');
    setDocuments({
      idDocument: null,
      proofOfResidence: null,
    });
  };
  
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="electoral">Dados Eleitorais</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>
            
            {/* Personal Data Tab */}
            <TabsContent value="personal" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    maxLength={14}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rg">RG *</Label>
                  <Input
                    id="rg"
                    value={rg}
                    onChange={(e) => setRg(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    maxLength={15}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(formatZipCode(e.target.value))}
                    maxLength={9}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="street">Rua *</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Electoral Data Tab */}
            <TabsContent value="electoral" className="space-y-4 pt-4">
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
                <p className="text-yellow-800 text-sm">
                  Os dados eleitorais são obrigatórios e tratados com confidencialidade.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voterTitle">Título de Eleitor *</Label>
                  <Input
                    id="voterTitle"
                    value={voterTitle}
                    onChange={(e) => setVoterTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zone">Zona *</Label>
                  <Input
                    id="zone"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="section">Seção *</Label>
                  <Input
                    id="section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Document Upload */}
                <div className="space-y-2">
                  <Label htmlFor="idDocument">RG/Documento de Identidade *</Label>
                  <div className="border border-dashed border-gray-300 rounded-md p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        {documents.idDocument ? (
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {documents.idDocument.name}
                            </p>
                            {documents.idDocument.file.type.startsWith('image/') && (
                              <div className="mt-2 max-h-32 overflow-hidden">
                                <img 
                                  src={documents.idDocument.url} 
                                  alt="Preview" 
                                  className="h-auto max-w-full rounded-md"
                                />
                              </div>
                            )}
                            {documents.idDocument.file.type === 'application/pdf' && (
                              <div className="mt-2 text-gray-500">
                                Arquivo PDF
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => setDocuments(prev => ({ ...prev, idDocument: null }))}
                            >
                              Remover
                            </Button>
                          </div>
                        ) : (
                          <label 
                            htmlFor="idDocument" 
                            className="cursor-pointer text-center block w-full"
                          >
                            <div className="space-y-2">
                              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-association-primary">
                                  Clique para fazer upload
                                </p>
                                <p className="text-xs text-gray-500">
                                  JPG, PNG ou PDF (máx. 5MB)
                                </p>
                              </div>
                            </div>
                            <Input
                              id="idDocument"
                              type="file"
                              accept="image/jpeg,image/png,application/pdf"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'idDocument')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Proof of Residence Upload */}
                <div className="space-y-2">
                  <Label htmlFor="proofOfResidence">Comprovante de Residência *</Label>
                  <div className="border border-dashed border-gray-300 rounded-md p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-center">
                        {documents.proofOfResidence ? (
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {documents.proofOfResidence.name}
                            </p>
                            {documents.proofOfResidence.file.type.startsWith('image/') && (
                              <div className="mt-2 max-h-32 overflow-hidden">
                                <img 
                                  src={documents.proofOfResidence.url} 
                                  alt="Preview" 
                                  className="h-auto max-w-full rounded-md"
                                />
                              </div>
                            )}
                            {documents.proofOfResidence.file.type === 'application/pdf' && (
                              <div className="mt-2 text-gray-500">
                                Arquivo PDF
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => setDocuments(prev => ({ ...prev, proofOfResidence: null }))}
                            >
                              Remover
                            </Button>
                          </div>
                        ) : (
                          <label 
                            htmlFor="proofOfResidence" 
                            className="cursor-pointer text-center block w-full"
                          >
                            <div className="space-y-2">
                              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-association-primary">
                                  Clique para fazer upload
                                </p>
                                <p className="text-xs text-gray-500">
                                  JPG, PNG ou PDF (máx. 5MB)
                                </p>
                              </div>
                            </div>
                            <Input
                              id="proofOfResidence"
                              type="file"
                              accept="image/jpeg,image/png,application/pdf"
                              className="hidden"
                              onChange={(e) => handleFileChange(e, 'proofOfResidence')}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
