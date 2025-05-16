
import React from 'react';
import { Form } from '@/components/ui/form';
import BoardMemberFormHeader from './board-members/BoardMemberFormHeader';
import { useBoardMemberForm } from './board-members/useBoardMemberForm';
import BoardMemberFields from './board-members/BoardMemberFields';
import BoardMemberActions from './board-members/BoardMemberActions';

interface BoardMemberFormProps {
  onClose: () => void;
  editingMember?: any;
}

const BoardMemberForm: React.FC<BoardMemberFormProps> = ({ onClose, editingMember }) => {
  const { form, isPending, onSubmit, handleUserDataChange, safeCancel } = useBoardMemberForm(onClose, editingMember);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <BoardMemberFormHeader isEditing={!!editingMember} onCancel={safeCancel} />

        <BoardMemberFields 
          form={form}
          handleUserDataChange={handleUserDataChange}
        />

        <BoardMemberActions 
          isPending={isPending}
          onCancel={safeCancel}
        />
      </form>
    </Form>
  );
};

export default BoardMemberForm;
