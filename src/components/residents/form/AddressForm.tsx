
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddressFormProps {
  street: string;
  setStreet: (value: string) => void;
  number: string;
  setNumber: (value: string) => void;
  complement: string;
  setComplement: (value: string) => void;
  neighborhood: string;
  setNeighborhood: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  zipCode: string;
  setZipCode: (value: string) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
  street, setStreet,
  number, setNumber,
  complement, setComplement,
  neighborhood, setNeighborhood,
  city, setCity,
  state, setState,
  zipCode, setZipCode
}) => {
  // Format CEP as 00000-000
  const formatZipCode = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="zipCode">CEP *</Label>
        <Input
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(formatZipCode(e.target.value))}
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
  );
};

export default AddressForm;
