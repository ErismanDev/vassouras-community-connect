
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  QrCode,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: 'pix' | 'bank_transfer' | 'credit_card' | 'cash';
  name: string;
  description: string;
  details: string;
  icon: React.ReactNode;
  active: boolean;
}

const PaymentMethodsSection: React.FC = () => {
  const [copiedText, setCopiedText] = useState<string>('');

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pix',
      type: 'pix',
      name: 'PIX',
      description: 'Transferência instantânea',
      details: 'associacao@email.com',
      icon: <QrCode className="h-6 w-6" />,
      active: true
    },
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      name: 'Transferência Bancária',
      description: 'Banco do Brasil',
      details: 'Agência: 1234-5 | Conta: 12345-6',
      icon: <Banknote className="h-6 w-6" />,
      active: true
    },
    {
      id: 'credit_card',
      type: 'credit_card',
      name: 'Cartão de Crédito',
      description: 'Em desenvolvimento',
      details: 'Aguarde implementação',
      icon: <CreditCard className="h-6 w-6" />,
      active: false
    },
    {
      id: 'cash',
      type: 'cash',
      name: 'Dinheiro',
      description: 'Pagamento presencial',
      details: 'Na administração do condomínio',
      icon: <Banknote className="h-6 w-6" />,
      active: true
    }
  ];

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success(`${label} copiado para a área de transferência!`);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (error) {
      toast.error('Erro ao copiar para a área de transferência');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Formas de Pagamento</h2>
        <p className="text-muted-foreground">
          Escolha a forma de pagamento mais conveniente para você.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className={`relative ${!method.active ? 'opacity-60' : ''}`}>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                {method.icon}
                <div>
                  <CardTitle className="text-lg">{method.name}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </div>
              </div>
              <div className="ml-auto">
                <Badge variant={method.active ? 'default' : 'secondary'}>
                  {method.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm font-medium">{method.details}</p>
                
                {method.active && method.type === 'pix' && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(method.details, 'Chave PIX')}
                      className="flex items-center space-x-1"
                    >
                      {copiedText === method.details ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span>Copiar chave PIX</span>
                    </Button>
                  </div>
                )}
                
                {method.active && method.type === 'bank_transfer' && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(method.details, 'Dados bancários')}
                      className="flex items-center space-x-1"
                    >
                      {copiedText === method.details ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span>Copiar dados</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instruções para Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">PIX</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Copie a chave PIX acima</li>
              <li>• Acesse seu aplicativo bancário</li>
              <li>• Faça a transferência PIX</li>
              <li>• Guarde o comprovante</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Transferência Bancária</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Use os dados bancários informados</li>
              <li>• Confirme o nome do favorecido</li>
              <li>• Guarde o comprovante da transferência</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Pagamento em Dinheiro</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Dirija-se à administração do condomínio</li>
              <li>• Horário: Segunda a Sexta, 9h às 17h</li>
              <li>• Solicite recibo de pagamento</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodsSection;
