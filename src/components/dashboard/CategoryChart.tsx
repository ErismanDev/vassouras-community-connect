
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { REQUEST_CATEGORY_LABELS } from '@/types/requests';
import { Loader2 } from 'lucide-react';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#FF6B6B'];

export function CategoryChart() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['request-categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('requests')
          .select('category');
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          return [];
        }
        
        const categories = data.reduce<Record<string, number>>((acc, item) => {
          if (item.category) {
            acc[item.category] = (acc[item.category] || 0) + 1;
          }
          return acc;
        }, {});
        
        return Object.entries(categories).map(([category, count], index) => ({
          name: REQUEST_CATEGORY_LABELS[category as keyof typeof REQUEST_CATEGORY_LABELS] || category,
          value: count,
          color: COLORS[index % COLORS.length]
        }));
      } catch (error) {
        console.error('Erro ao buscar categorias de solicitações:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    placeholderData: []
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Solicitações</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }
  
  if (isError || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Categorias de Solicitações</CardTitle>
          <CardDescription>Distribuição por tipos de solicitações</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorias de Solicitações</CardTitle>
        <CardDescription>Distribuição por tipos de solicitações</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} solicitações`, 'Quantidade']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
