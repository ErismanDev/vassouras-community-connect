import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Search, FileText, UserRound, MapPin, User, Mail, Phone } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Resident {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  birth_date: string;
  phone: string;
  email: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  voter_title: string;
  electoral_zone: string;
  electoral_section: string;
  id_document_url: string;
  proof_of_residence_url: string;
  created_at: string;
  status: string;
}

const ResidentsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  const { data: residents, isLoading, error } = useQuery({
    queryKey: ['residents'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('residents')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        return data as Resident[];
      } catch (error) {
        console.error('Erro ao buscar moradores:', error);
        throw error;
      }
    }
  });

  const filteredResidents = residents?.filter(resident => {
    const searchLower = searchTerm.toLowerCase();
    return (
      resident.name.toLowerCase().includes(searchLower) ||
      resident.cpf.includes(searchTerm) ||
      resident.rg.toLowerCase().includes(searchLower) ||
      resident.email.toLowerCase().includes(searchLower) ||
      resident.phone.includes(searchTerm) ||
      resident.street.toLowerCase().includes(searchLower) ||
      resident.neighborhood.toLowerCase().includes(searchLower) ||
      resident.city.toLowerCase().includes(searchLower)
    );
  });

  // Formatar CPF como 000.000.000-00
  const formatCpf = (cpf: string) => {
    if (!cpf || cpf.length !== 11) return cpf;
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
  };

  // Formatar telefone como (00) 00000-0000
  const formatPhone = (phone: string) => {
    if (!phone) return phone;
    if (phone.length === 11) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
    if (phone.length === 10) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  // Formatar CEP como 00000-000
  const formatZipCode = (zipCode: string) => {
    if (!zipCode || zipCode.length !== 8) return zipCode;
    return `${zipCode.slice(0, 5)}-${zipCode.slice(5)}`;
  };

  // Formatar data como dd/mm/yyyy
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg font-medium">Carregando moradores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-red-500">Erro ao carregar moradores. Por favor, tente novamente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <UserRound className="h-6 w-6" />
          Moradores Cadastrados
        </h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar morador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {(!residents || residents.length === 0) ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhum morador cadastrado ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Bairro</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents?.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell className="font-medium">{resident.name}</TableCell>
                      <TableCell>{formatCpf(resident.cpf)}</TableCell>
                      <TableCell>{resident.email}</TableCell>
                      <TableCell>{formatPhone(resident.phone)}</TableCell>
                      <TableCell>{resident.neighborhood}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedResident(resident)}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Ver detalhes</span>
                            </Button>
                          </DialogTrigger>
                          {selectedResident && (
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-semibold flex items-center">
                                  <User className="mr-2 h-5 w-5" />
                                  {selectedResident.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Detalhes completos do morador
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium">Dados Pessoais</h3>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-sm text-gray-500">CPF</p>
                                      <p>{formatCpf(selectedResident.cpf)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">RG</p>
                                      <p>{selectedResident.rg}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Data de Nascimento</p>
                                      <p>{formatDate(selectedResident.birth_date)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Telefone</p>
                                      <p>{formatPhone(selectedResident.phone)}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-sm text-gray-500">Email</p>
                                      <p className="break-words">{selectedResident.email}</p>
                                    </div>
                                  </div>
                                  
                                  <h3 className="text-lg font-medium pt-2">Dados Eleitorais</h3>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-sm text-gray-500">Título de Eleitor</p>
                                      <p>{selectedResident.voter_title}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Zona</p>
                                      <p>{selectedResident.electoral_zone}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Seção</p>
                                      <p>{selectedResident.electoral_section}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium">Endereço</h3>
                                  <div className="grid grid-cols-1 gap-2">
                                    <div>
                                      <p className="text-sm text-gray-500">Endereço Completo</p>
                                      <p>
                                        {selectedResident.street}, {selectedResident.number}
                                        {selectedResident.complement ? `, ${selectedResident.complement}` : ''}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Bairro</p>
                                      <p>{selectedResident.neighborhood}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Cidade/Estado</p>
                                      <p>{selectedResident.city}/{selectedResident.state}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">CEP</p>
                                      <p>{formatZipCode(selectedResident.zip_code)}</p>
                                    </div>
                                  </div>
                                  
                                  <h3 className="text-lg font-medium pt-2">Documentos</h3>
                                  <div className="grid grid-cols-1 gap-2">
                                    <div>
                                      <p className="text-sm text-gray-500">Documento de Identidade</p>
                                      <a 
                                        href={selectedResident.id_document_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        Ver documento
                                      </a>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Comprovante de Residência</p>
                                      <a 
                                        href={selectedResident.proof_of_residence_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        Ver documento
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <div className="text-sm text-gray-500">
            Total de moradores: {filteredResidents?.length || 0}
          </div>
        </>
      )}
    </div>
  );
};

export default ResidentsList; 