
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PersonalDataFormProps {
  name: string;
  setName: (value: string) => void;
  cpf: string;
  setCpf: (value: string) => void;
  rg: string;
  setRg: (value: string) => void;
  birthDate: string;
  setBirthDate: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
}

const PersonalDataForm: React.FC<PersonalDataFormProps> = ({
  name, setName,
  cpf, setCpf,
  rg, setRg,
  birthDate, setBirthDate,
  phone, setPhone,
  email, setEmail
}) => {
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

  return (
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
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
    </div>
  );
};

export default PersonalDataForm;
