import React from "react";

const users = [
  { id: "1", name: "João", email: "joao@email.com" },
  { id: "2", name: "Maria", email: "maria@email.com" },
];

interface TestUserSelectProps {
  value: string;
  onChange: (value: string) => void;
  onUserDataChange?: (userData: { name?: string; email: string }) => void;
}

export default function TestUserSelect({ value, onChange, onUserDataChange }: TestUserSelectProps) {
  // Referência para verificar se o componente ainda está montado
  const isMounted = React.useRef(true);
  
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    onChange(selectedId);
    const user = users.find(u => u.id === selectedId);
    if (user && onUserDataChange && isMounted.current) {
      onUserDataChange({ name: user.name, email: user.email });
    }
  };

  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={handleChange}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Selecione um usuário</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.email})
          </option>
        ))}
      </select>
    </div>
  );
} 