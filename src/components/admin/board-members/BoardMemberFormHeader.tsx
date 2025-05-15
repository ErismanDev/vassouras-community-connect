
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface BoardMemberFormHeaderProps {
  isEditing: boolean;
  onCancel: () => void;
}

const BoardMemberFormHeader: React.FC<BoardMemberFormHeaderProps> = ({ isEditing, onCancel }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold">
        {isEditing ? 'Editar Membro da Diretoria' : 'Adicionar Membro da Diretoria'}
      </h3>
      <Button variant="ghost" onClick={onCancel} size="sm">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default BoardMemberFormHeader;
