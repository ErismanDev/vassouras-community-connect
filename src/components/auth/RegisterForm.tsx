
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Lock, Mail, User, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('resident');
  const [isDirector, setIsDirector] = useState(false);
  const [directorPosition, setDirectorPosition] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const { register, loading } = useAuth();

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return false;
    }
    if (password.length < 8) {
      setPasswordError('A senha deve ter pelo menos 8 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswords()) {
      return;
    }
    
    try {
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await register(name, email, password, role);
      
      if (authError) {
        throw authError;
      }
      
      if (authData) {
        // Create resident record linked to the user account
        const { error: residentError } = await supabase
          .from('residents')
          .insert({
            name,
            email,
            user_id: authData.user.id,
            is_director: isDirector,
            director_position: isDirector ? directorPosition : null,
            // Add minimum required fields with default values
            cpf: '',
            rg: '',
            phone: '',
            birth_date: new Date().toISOString().split('T')[0],
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zip_code: '',
            voter_title: '',
            electoral_zone: '',
            electoral_section: '',
            id_document_url: '',
            proof_of_residence_url: '',
            status: 'pending'
          });

        if (residentError) {
          console.error('Error creating resident record:', residentError);
          toast.error('Conta criada, mas houve um erro ao registrar como morador. Por favor, atualize seu perfil.');
        }
        
        // If user is a director, add to board_members table
        if (isDirector && directorPosition) {
          const { error: boardError } = await supabase
            .from('board_members')
            .insert({
              user_id: authData.user.id,
              position: directorPosition,
              term_start: new Date().toISOString().split('T')[0]
            });
            
          if (boardError) {
            console.error('Error creating board member record:', boardError);
            toast.error('Conta criada, mas houve um erro ao registrar como diretor. Por favor, contate o administrador.');
          }
        }
        
        toast.success('Registro realizado com sucesso!');
      }
    } catch (error) {
      // Error is handled in the auth context
      console.error('Registration error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-association-primary">
          Associação de Moradores
        </CardTitle>
        <CardTitle className="text-xl font-semibold text-center">Criar Conta</CardTitle>
        <CardDescription className="text-center">
          Preencha os campos abaixo para criar sua conta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seunome@exemplo.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="sr-only">
                  {showPassword ? "Esconder senha" : "Mostrar senha"}
                </span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {passwordError && (
              <p className="text-sm font-medium text-destructive">{passwordError}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Usuário</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resident">Morador</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="isDirector" 
              checked={isDirector}
              onCheckedChange={(checked) => setIsDirector(checked === true)}
            />
            <Label htmlFor="isDirector" className="cursor-pointer">
              Sou membro da diretoria
            </Label>
          </div>
          
          {isDirector && (
            <div className="space-y-2">
              <Label htmlFor="directorPosition">Cargo na Diretoria</Label>
              <Input
                id="directorPosition"
                type="text"
                placeholder="Ex: Presidente, Tesoureiro, etc."
                value={directorPosition}
                onChange={(e) => setDirectorPosition(e.target.value)}
                required={isDirector}
              />
            </div>
          )}
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-2 items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Nota: Todas as contas serão verificadas antes da aprovação final. Após o cadastro, complete seu perfil com todos os dados necessários.
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-association-primary hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-center w-full text-sm">
          Já tem uma conta?{" "}
          <Link to="/login" className="font-medium text-association-primary hover:underline">
            Entre aqui
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
