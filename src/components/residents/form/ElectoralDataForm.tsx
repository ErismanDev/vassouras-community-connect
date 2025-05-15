
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ElectoralDataFormProps {
  voterTitle: string;
  setVoterTitle: (value: string) => void;
  zone: string;
  setZone: (value: string) => void;
  section: string;
  setSection: (value: string) => void;
}

const ElectoralDataForm: React.FC<ElectoralDataFormProps> = ({
  voterTitle, setVoterTitle,
  zone, setZone,
  section, setSection
}) => {
  return (
    <>
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
    </>
  );
};

export default ElectoralDataForm;
