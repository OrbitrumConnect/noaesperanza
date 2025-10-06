import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PlanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  planData: any;
  onSave: () => void;
}

export default function PlanEditModal({ isOpen, onClose, planData, onSave }: PlanEditModalProps) {
  const [editedPlan, setEditedPlan] = useState(planData);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (planData) {
      setEditedPlan(planData);
    }
  }, [planData]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const updateData = {
        plan_name: editedPlan.plan_name,
        meal_plans: editedPlan.meal_plans,
        biohacking_practices: editedPlan.biohacking,
        microverdes_schedule: editedPlan.microgreens,
        frequency_therapy: editedPlan.frequencies,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('educational_plans')
        .update(updateData)
        .eq('id', editedPlan.id);

      if (error) {
        console.error('Erro ao salvar plano:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações do plano.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Plano atualizado!",
        description: "As alterações foram salvas com sucesso."
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMealPlan = (mealType: string, field: string, value: string) => {
    setEditedPlan(prev => ({
      ...prev,
      meal_plans: {
        ...prev.meal_plans,
        [mealType]: {
          ...prev.meal_plans[mealType],
          [field]: value
        }
      }
    }));
  };

  const updateBiohacking = (period: string, value: string) => {
    setEditedPlan(prev => ({
      ...prev,
      biohacking: {
        ...prev.biohacking,
        [period]: value
      }
    }));
  };

  const updateMicrogreens = (field: string, value: any) => {
    setEditedPlan(prev => ({
      ...prev,
      microgreens: {
        ...prev.microgreens,
        [field]: value
      }
    }));
  };

  const updateFrequency = (period: string, field: string, value: string) => {
    setEditedPlan(prev => ({
      ...prev,
      frequencies: {
        ...prev.frequencies,
        [period]: {
          ...prev.frequencies[period],
          [field]: value
        }
      }
    }));
  };

  if (!editedPlan) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🩺 Editar Plano - {editedPlan.plan_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nome do Plano */}
          <div className="space-y-2">
            <Label>Nome do Plano</Label>
            <Input
              value={editedPlan.plan_name}
              onChange={(e) => setEditedPlan(prev => ({ ...prev, plan_name: e.target.value }))}
              placeholder="Ex: Plano de Bem-estar MEV"
            />
          </div>

          {/* Refeições */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">🍽️ Plano Alimentar</h3>
            
            {Object.entries(editedPlan.meal_plans || {}).map(([mealType, meal]: [string, any]) => (
              <div key={mealType} className="p-4 border rounded-lg bg-muted/20">
                <h4 className="font-medium mb-3 capitalize">
                  {mealType === 'breakfast' && '🌅 Café da Manhã'}
                  {mealType === 'lunch' && '🍽️ Almoço'}
                  {mealType === 'snack' && '🥗 Lanches'}
                  {mealType === 'dinner' && '🌙 Jantar'}
                </h4>
                <div className="space-y-2">
                  <Input
                    value={meal.name || ''}
                    onChange={(e) => updateMealPlan(mealType, 'name', e.target.value)}
                    placeholder="Nome da refeição"
                  />
                  <Textarea
                    value={meal.description || ''}
                    onChange={(e) => updateMealPlan(mealType, 'description', e.target.value)}
                    placeholder="Descrição detalhada da refeição..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Biohacking */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary">⚡ Práticas de Biohacking</h3>
            
            {Object.entries(editedPlan.biohacking || {}).map(([period, practice]: [string, any]) => (
              <div key={period} className="space-y-2">
                <Label className="capitalize">
                  {period === 'morning' && '🌅 Manhã'}
                  {period === 'afternoon' && '☀️ Tarde'}
                  {period === 'evening' && '🌙 Noite'}
                </Label>
                <Input
                  value={practice || ''}
                  onChange={(e) => updateBiohacking(period, e.target.value)}
                  placeholder={`Prática para ${period}`}
                />
              </div>
            ))}
          </div>

          {/* Microverdes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-accent">🌱 Microverdes</h3>
            
            <div className="space-y-3">
              <div>
                <Label>Tipos de Microverdes</Label>
                <Input
                  value={editedPlan.microgreens?.type?.join(', ') || ''}
                  onChange={(e) => updateMicrogreens('type', e.target.value.split(', ').filter(Boolean))}
                  placeholder="Ex: Brócolis, Rúcula, Alfafa"
                />
              </div>
              
              <div>
                <Label>Como Usar</Label>
                <Input
                  value={editedPlan.microgreens?.usage || ''}
                  onChange={(e) => updateMicrogreens('usage', e.target.value)}
                  placeholder="Ex: Adicionar nas saladas e smoothies"
                />
              </div>
              
              <div>
                <Label>Benefícios</Label>
                <Input
                  value={editedPlan.microgreens?.benefits || ''}
                  onChange={(e) => updateMicrogreens('benefits', e.target.value)}
                  placeholder="Ex: Rico em enzimas e antioxidantes"
                />
              </div>
            </div>
          </div>

          {/* Frequências */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-success">🎵 Terapia de Frequências</h3>
            
            {Object.entries(editedPlan.frequencies || {}).map(([period, freq]: [string, any]) => (
              <div key={period} className="p-3 border rounded-lg bg-muted/10">
                <Label className="capitalize block mb-2">
                  {period === 'morning' && '🌅 Manhã'}
                  {period === 'evening' && '🌙 Tarde/Noite'}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={freq?.hz || ''}
                    onChange={(e) => updateFrequency(period, 'hz', e.target.value)}
                    placeholder="Ex: 528Hz"
                  />
                  <Input
                    value={freq?.purpose || ''}
                    onChange={(e) => updateFrequency(period, 'purpose', e.target.value)}
                    placeholder="Ex: Frequência do Amor"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}