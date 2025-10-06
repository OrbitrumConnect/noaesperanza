import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, AlertCircle, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  patient_name: string;
  patient_email: string;
  status: string;
  payment_status: string;
  amount: number;
  consultation_type: string;
  doctor_notes?: string;
  created_at: string;
}

interface AdminCalendarViewProps {
  onBack: () => void;
}

const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [newAppointment, setNewAppointment] = useState({
    patient_name: '',
    patient_email: '',
    appointment_date: '',
    appointment_time: '',
    consultation_type: 'presencial',
    amount: 800,
    status: 'confirmed',
    payment_status: 'paid',
    doctor_notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadAppointments();
  }, [currentDate]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const startDate = startOfMonth(currentDate);
      const endDate = endOfMonth(currentDate);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
        .lte('appointment_date', format(endDate, 'yyyy-MM-dd'))
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast({
        title: "Erro ao carregar agenda",
        description: "Não foi possível carregar os agendamentos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: status as any } : apt
        )
      );

      toast({
        title: "Status atualizado",
        description: `Consulta marcada como ${status}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive",
      });
    }
  };

  const saveNotes = async () => {
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ doctor_notes: doctorNotes })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id ? { ...apt, doctor_notes: doctorNotes } : apt
        )
      );

      toast({
        title: "Anotações salvas",
        description: "As observações foram registradas com sucesso",
      });
      
      setShowNoteModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Erro ao salvar anotações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as anotações",
        variant: "destructive",
      });
    }
  };

  const addManualAppointment = async () => {
    try {
      // Validação básica
      if (!newAppointment.patient_name || !newAppointment.patient_email || 
          !newAppointment.appointment_date || !newAppointment.appointment_time) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha nome, email, data e horário",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          patient_name: newAppointment.patient_name,
          patient_email: newAppointment.patient_email,
          appointment_date: newAppointment.appointment_date,
          appointment_time: newAppointment.appointment_time,
          consultation_type: newAppointment.consultation_type,
          amount: newAppointment.amount,
          status: newAppointment.status,
          payment_status: newAppointment.payment_status,
          doctor_notes: newAppointment.doctor_notes,
          user_id: '00000000-0000-0000-0000-000000000000' // placeholder para consultas manuais
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setAppointments(prev => [...prev, data]);

      toast({
        title: "Consulta adicionada!",
        description: `${newAppointment.patient_name} - ${newAppointment.appointment_date} às ${newAppointment.appointment_time}`,
      });

      // Resetar formulário
      setNewAppointment({
        patient_name: '',
        patient_email: '',
        appointment_date: '',
        appointment_time: '',
        consultation_type: 'presencial',
        amount: 800,
        status: 'confirmed',
        payment_status: 'paid',
        doctor_notes: ''
      });

      setShowAddAppointmentModal(false);
      
      // Recarregar agenda
      await loadAppointments();

    } catch (error) {
      console.error('Erro ao adicionar consulta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a consulta",
        variant: "destructive",
      });
    }
  };

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(parseISO(apt.appointment_date), date)
    );
  };

  const getDayAppointments = () => {
    if (!selectedDate) return [];
    return getAppointmentsForDate(selectedDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'completed': return 'Realizada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              ← Voltar ao Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary">📅 Agenda Profissional</h1>
              <p className="text-muted-foreground">Gestão completa de consultas - Dra. Dayana</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              ← Mês Anterior
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              Próximo Mês →
            </Button>
            <Button
              onClick={() => setShowAddAppointmentModal(true)}
              className="ml-4 bg-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendário Mensal
                </CardTitle>
                <CardDescription>
                  Clique em um dia para ver os agendamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Week days header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map(day => {
                    const dayAppointments = getAppointmentsForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    
                    return (
                      <motion.button
                        key={day.toISOString()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedDate(day)}
                        onMouseEnter={(e) => {
                          if (dayAppointments.length > 0) {
                            setHoveredDay(day);
                            setMousePosition({ x: e.clientX, y: e.clientY });
                          }
                        }}
                        onMouseLeave={() => setHoveredDay(null)}
                        onMouseMove={(e) => {
                          if (hoveredDay && dayAppointments.length > 0) {
                            setMousePosition({ x: e.clientX, y: e.clientY });
                          }
                        }}
                        className={`
                          relative p-3 text-sm rounded-lg border transition-all
                          ${isSelected ? 'bg-primary text-primary-foreground border-primary' : ''}
                          ${isToday(day) ? 'bg-secondary border-secondary-foreground' : ''}
                          ${!isCurrentMonth ? 'opacity-30' : ''}
                          ${dayAppointments.length > 0 ? 'border-primary/30' : 'border-border'}
                          hover:bg-muted/50
                        `}
                      >
                        <div className="font-medium">{format(day, 'd')}</div>
                        {dayAppointments.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dayAppointments.slice(0, 3).map((apt, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${getStatusColor(apt.status)}`}
                              />
                            ))}
                            {dayAppointments.length > 3 && (
                              <span className="text-xs">+{dayAppointments.length - 3}</span>
                            )}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Hover Tooltip */}
                {hoveredDay && getAppointmentsForDate(hoveredDay).length > 0 && (
                  <div
                    className="fixed z-[100] bg-card border border-border rounded-lg p-3 shadow-lg pointer-events-none max-w-xs"
                    style={{
                      left: mousePosition.x + 10,
                      top: mousePosition.y - 10,
                      transform: 'translateY(-100%)'
                    }}
                  >
                    <div className="text-sm font-medium mb-2">
                      {format(hoveredDay, 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    <div className="space-y-2">
                      {getAppointmentsForDate(hoveredDay).map((apt, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(apt.status)}`} />
                            <span className="font-medium">{apt.patient_name}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {apt.appointment_time.slice(0, 5)}
                          </span>
                        </div>
                      ))}
                      {getAppointmentsForDate(hoveredDay).length > 5 && (
                        <div className="text-xs text-muted-foreground text-center pt-1 border-t">
                          +{getAppointmentsForDate(hoveredDay).length - 5} mais...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Day appointments */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione um dia'}
                </CardTitle>
                <CardDescription>
                  {selectedDate ? `${getDayAppointments().length} consulta(s) agendada(s)` : 'Clique em um dia no calendário'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedDate ? (
                  getDayAppointments().length > 0 ? (
                    getDayAppointments().map(appointment => (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`} />
                            <span className="font-medium">{appointment.appointment_time.slice(0, 5)}</span>
                          </div>
                          <Badge variant={appointment.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {appointment.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.patient_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{appointment.patient_email}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm font-medium">R$ {appointment.amount.toFixed(2).replace('.', ',')}</span>
                          <div className="flex gap-1">
                            {appointment.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setDoctorNotes(appointment.doctor_notes || '');
                                setShowNoteModal(true);
                              }}
                            >
                              📝
                            </Button>
                          </div>
                        </div>
                        
                        <Badge variant="outline">
                          {getStatusText(appointment.status)}
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma consulta agendada</p>
                      <p className="text-sm">para este dia</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Selecione uma data</p>
                    <p className="text-sm">para ver os agendamentos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Mês</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total de Consultas</span>
                  <span className="font-bold">{appointments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Confirmadas</span>
                  <span className="font-bold text-green-600">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pendentes</span>
                  <span className="font-bold text-yellow-600">
                    {appointments.filter(a => a.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Receita</span>
                  <span className="font-bold text-primary">
                    R$ {appointments.reduce((sum, apt) => sum + apt.amount, 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Notes Modal */}
        {showNoteModal && selectedAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Observações Médicas</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowNoteModal(false)}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{selectedAppointment.patient_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(selectedAppointment.appointment_date), 'dd/MM/yyyy')} às {selectedAppointment.appointment_time.slice(0, 5)}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="notes">Anotações da Consulta</Label>
                  <Textarea
                    id="notes"
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Registre observações sobre a consulta..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowNoteModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveNotes}>
                    Salvar Observações
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Appointment Modal */}
        {showAddAppointmentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}  
              className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">➕ Adicionar Nova Consulta</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowAddAppointmentModal(false)}>
                  ✕
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient_name">Nome do Paciente *</Label>
                    <Input
                      id="patient_name"
                      value={newAppointment.patient_name}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, patient_name: e.target.value }))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient_email">Email *</Label>
                    <Input
                      id="patient_email"
                      type="email"
                      value={newAppointment.patient_email}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, patient_email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointment_date">Data *</Label>
                    <Input
                      id="appointment_date"
                      type="date"
                      value={newAppointment.appointment_date}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="appointment_time">Horário *</Label>
                    <Input
                      id="appointment_time"
                      type="time"
                      value={newAppointment.appointment_time}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="consultation_type">Tipo de Consulta</Label>
                    <select
                      id="consultation_type"
                      value={newAppointment.consultation_type}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, consultation_type: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="presencial">Presencial</option>
                      <option value="online">Online</option>
                      <option value="retorno">Retorno</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor (R$)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newAppointment.amount}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      placeholder="800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status da Consulta</Label>
                    <select
                      id="status"
                      value={newAppointment.status}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="pending">Pendente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="completed">Realizada</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="payment_status">Status Pagamento</Label>
                    <select
                      id="payment_status"
                      value={newAppointment.payment_status}
                      onChange={(e) => setNewAppointment(prev => ({ ...prev, payment_status: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="paid">Pago</option>
                      <option value="pending">Pendente</option>
                      <option value="failed">Falhado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="doctor_notes">Observações (opcional)</Label>
                  <Textarea
                    id="doctor_notes"
                    value={newAppointment.doctor_notes}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, doctor_notes: e.target.value }))}
                    placeholder="Observações sobre a consulta..."
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowAddAppointmentModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addManualAppointment} className="bg-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Consulta
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCalendarView;