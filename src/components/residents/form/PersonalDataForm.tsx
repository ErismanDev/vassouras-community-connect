
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
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    setCpf(formatted);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Nome Completo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome completo"
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cpf" className="text-sm font-medium">
          CPF <span className="text-red-500">*</span>
        </Label>
        <Input
          id="cpf"
          type="text"
          value={cpf}
          onChange={handleCpfChange}
          placeholder="000.000.000-00"
          maxLength={14}
          required
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rg" className="text-sm font-medium">
          RG <span className="text-gray-400">(opcional)</span>
        </Label>
        <Input
          id="rg"
          type="text"
          value={rg}
          onChange={(e) => setRg(e.target.value)}
          placeholder="Digite o RG"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate" className="text-sm font-medium">
          Data de Nascimento <span className="text-gray-400">(opcional)</span>
        </Label>
        <Input
          id="birthDate"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">
          Telefone <span className="text-gray-400">(opcional)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="(00) 00000-0000"
          maxLength={15}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          E-mail <span className="text-gray-400">(opcional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite o e-mail"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default PersonalDataForm;
