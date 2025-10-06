import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User, Edit3, Save, X } from 'lucide-react';

interface UserProfile {
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  weight?: number;
  height?: number;
  occupation?: string;
  emergency_contact?: string;
  emergency_phone?: string;
}

interface UserProfileEditProps {
  userId: string;
  onCancel: () => void;
  onSave: () => void;
}

export default function UserProfileEdit({ userId, onCancel, onSave }: UserProfileEditProps) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Erro ao carregar perfil');
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar perfil:', error);
        toast.error('Erro ao salvar perfil');
        return;
      }

      toast.success('Perfil atualizado com sucesso!');
      onSave();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Carregando Perfil...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Editar Perfil
        </CardTitle>
        <CardDescription>
          Atualize suas informações pessoais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={profile.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={profile.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de Nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={profile.birth_date || ''}
              onChange={(e) => handleInputChange('birth_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gênero</Label>
            <Select onValueChange={(value) => handleInputChange('gender', value)} value={profile.gender || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
                <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Profissão</Label>
            <Input
              id="occupation"
              value={profile.occupation || ''}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              placeholder="Sua profissão"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={profile.weight || ''}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || null)}
              placeholder="75.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={profile.height || ''}
              onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || null)}
              placeholder="175"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Contato de Emergência</Label>
            <Input
              id="emergency_contact"
              value={profile.emergency_contact || ''}
              onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
              placeholder="Nome do contato de emergência"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_phone">Telefone de Emergência</Label>
            <Input
              id="emergency_phone"
              value={profile.emergency_phone || ''}
              onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}