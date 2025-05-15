
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { DocumentPreview } from './DocumentUploader';

export const useResidentForm = () => {
  const { user } = useAuth();
  
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
  
  const uploadFileToStorage = async (file: File, path: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('resident-documents')
      .upload(filePath, file);
      
    if (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw new Error(`Erro no upload: ${error.message}`);
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('resident-documents')
      .getPublicUrl(filePath);
      
    return publicUrlData.publicUrl;
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
      // Upload dos documentos para o Storage
      const idDocumentUrl = await uploadFileToStorage(
        documents.idDocument.file, 
        'identity-documents'
      );
      
      const proofOfResidenceUrl = await uploadFileToStorage(
        documents.proofOfResidence.file,
        'proof-of-residence'
      );
      
      // Dados para inserção no banco
      const residentData = {
        // Dados pessoais
        name,
        cpf: cpf.replace(/\D/g, ''), // Remove formatação
        rg,
        birth_date: birthDate,
        phone: phone.replace(/\D/g, ''), // Remove formatação
        email,
        
        // Endereço
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zip_code: zipCode.replace(/\D/g, ''), // Remove formatação
        
        // Dados eleitorais
        voter_title: voterTitle,
        electoral_zone: zone,
        electoral_section: section,
        
        // Documentos
        id_document_url: idDocumentUrl,
        proof_of_residence_url: proofOfResidenceUrl,
        
        // Metadados
        created_by: user?.id,
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      // Inserção no banco de dados
      const { data, error } = await supabase
        .from('residents')
        .insert([residentData])
        .select();
      
      if (error) {
        console.error('Erro ao inserir morador:', error);
        throw new Error(`Erro ao salvar: ${error.message}`);
      }
      
      toast.success('Morador cadastrado com sucesso!');
      resetForm();
    } catch (error: any) {
      toast.error(`Erro ao cadastrar morador: ${error.message}`);
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
  
  return {
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
  };
};
