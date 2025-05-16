
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

interface BoardMemberActionsProps {
  isPending: boolean;
  onCancel: () => void;
}

const BoardMemberActions: React.FC<BoardMemberActionsProps> = ({ isPending, onCancel }) => {
  return (
    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar
          </>
        )}
      </Button>
    </div>
  );
};

export default BoardMemberActions;
