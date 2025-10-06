import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock, User, CheckCircle, Video, MapPin } from "lucide-react";
import { format, addDays, setHours, setMinutes, isSameDay, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

interface TimeSlot {
  time: string;
  available: boolean;
  patientName?: string;
}

interface AvailableDay {
  date: Date;
  timeSlots: TimeSlot[];
}

interface AppointmentSchedulerProps {
  onScheduleSuccess: (date: Date, time: string) => void;
  onCancel?: () => void;
  patientName: string;
  patientEmail: string;
}

export default function AppointmentScheduler({ onScheduleSuccess, onCancel, patientName, patientEmail }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<'presencial' | 'online'>('presencial');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabaseAuth();

  // Gerar horários disponíveis da Dra (agora usando dados reais do Supabase)
  useEffect(() => {
    generateAvailableSchedule();
  }, []);

  const generateAvailableSchedule = async () => {
    const schedule: AvailableDay[] = [];
    const today = new Date();
    
    // Buscar agendamentos existentes do Supabase
    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('appointment_date, appointment_time')
      .gte('appointment_date', format(today, 'yyyy-MM-dd'));
    
    // Gerar próximos 30 dias
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      
      // Dra atende Seg a Sex (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const timeSlots = await generateTimeSlotsForDay(date, existingAppointments || []);
        if (timeSlots.some(slot => slot.available)) {
          schedule.push({
            date,
            timeSlots
          });
        }
      }
    }
    
    setAvailableDays(schedule);
  };

  const generateTimeSlotsForDay = async (date: Date, existingAppointments: any[]): Promise<TimeSlot[]> => {
    const slots: TimeSlot[] = [];
    const dateString = format(date, 'yyyy-MM-dd');
    
    const occupiedTimes = existingAppointments
      .filter(apt => apt.appointment_date === dateString)
      .map(apt => apt.appointment_time);
    
    // Horários de manhã: 8h às 12h (de hora em hora)
    for (let hour = 8; hour <= 11; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00:00`;
      const displayTime = `${hour.toString().padStart(2, '0')}:00`;
      
      slots.push({
        time: displayTime,
        available: !occupiedTimes.includes(timeString),
        patientName: occupiedTimes.includes(timeString) ? 'Ocupado' : undefined
      });
    }
    
    // Horários de tarde: 14h às 17h (de hora em hora)
    for (let hour = 14; hour <= 17; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00:00`;
      const displayTime = `${hour.toString().padStart(2, '0')}:00`;
      
      slots.push({
        time: displayTime,
        available: !occupiedTimes.includes(timeString),
        patientName: occupiedTimes.includes(timeString) ? 'Ocupado' : undefined
      });
    }
    
    return slots;
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleConsultationTypeChange = (value: string) => {
    if (value === 'presencial' || value === 'online') {
      setConsultationType(value);
    }
  };

  const getConsultationPrice = () => {
    return consultationType === 'presencial' ? 800.00 : 600.00;
  };

  const handleScheduleAppointment = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setIsLoading(true);
    
    try {
      // Criar agendamento direto - processo manual para consultas presenciais
      const appointmentData = {
        user_id: user?.id || crypto.randomUUID(), // Fallback para guest
        patient_name: patientName,
        patient_email: patientEmail,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime + ':00',
        consultation_type: consultationType,
        amount: getConsultationPrice(),
        status: 'pending',
        payment_status: 'pending'
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Agendamento Solicitado!",
        description: `Nossa equipe entrará em contato para confirmar horário e pagamento - ${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}`,
      });

      // Refresh available schedule after booking
      await generateAvailableSchedule();

      // Call success callback
      onScheduleSuccess(selectedDate, selectedTime);

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime("");

    } catch (error: any) {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedDaySlots = () => {
    if (!selectedDate) return [];
    
    const daySchedule = availableDays.find(day => 
      isSameDay(day.date, selectedDate)
    );
    
    return daySchedule?.timeSlots || [];
  };

  const isDateAvailable = (date: Date) => {
    return availableDays.some(day => isSameDay(day.date, date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        {onCancel && (
          <div className="flex justify-start">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex items-center gap-2 text-muted-foreground"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-2">Agendar Consulta com Dra. Dayana</h2>
          <p className="text-muted-foreground">Selecione o dia e horário de sua preferência</p>
        </div>
      </div>

      {/* Tipo de Consulta */}
      <Card className="border-primary/10 bg-primary/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            Tipo de Consulta
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Escolha o formato que melhor atende suas necessidades
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup value={consultationType} onValueChange={handleConsultationTypeChange} className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-background/50 transition-colors">
              <RadioGroupItem value="presencial" id="presencial" />
              <Label htmlFor="presencial" className="flex items-center gap-3 cursor-pointer flex-1">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">Consulta Presencial</div>
                  <div className="text-sm text-muted-foreground">Consultório da Dra. Dayana</div>
                  <div className="text-sm font-medium text-primary">R$ 800,00</div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-background/50 transition-colors">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                <Video className="w-5 h-5 text-accent" />
                <div>
                  <div className="font-medium">Consulta Online</div>
                  <div className="text-sm text-muted-foreground">Videochamada pelo Google Meet</div>
                  <div className="text-sm font-medium text-accent">R$ 600,00</div>
                </div>
              </Label>
            </div>
          </RadioGroup>
          
          {/* Informações sobre o tipo selecionado */}
          <div className="mt-4 p-4 rounded-lg bg-background/50 border">
            {consultationType === 'presencial' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Consulta Presencial</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  📍 <strong>Local:</strong> Consultório da Dra. Dayana Brazão<br/>
                  🏥 <strong>Endereço:</strong> Será enviado após confirmação<br/>
                  ⏱️ <strong>Duração:</strong> 1h30min de consulta completa<br/>
                  📋 <strong>Inclui:</strong> Exame físico + Avaliação ortomolecular
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <Video className="w-4 h-4" />
                  <span className="font-medium">Consulta Online</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  💻 <strong>Plataforma:</strong> Google Meet (link será enviado)<br/>
                  🌐 <strong>Requisitos:</strong> Internet estável + câmera<br/>
                  ⏱️ <strong>Duração:</strong> 1h15min de consulta virtual<br/>
                  📋 <strong>Inclui:</strong> Anamnese completa + Orientações detalhadas
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Escolha o Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={ptBR}
              disabled={(date) => 
                date < new Date() || 
                date.getDay() === 0 || 
                date.getDay() === 6 || 
                !isDateAvailable(date)
              }
              className="rounded-md border pointer-events-auto"
              modifiers={{
                available: (date) => isDateAvailable(date)
              }}
              modifiersStyles={{
                available: { backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }
              }}
            />
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/10 border border-primary rounded"></div>
                <span>Dias disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span>Indisponível</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Horários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horários Disponíveis
            </CardTitle>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-center text-muted-foreground py-8">
                Selecione um dia no calendário
              </p>
            ) : (
              <div className="space-y-4">
                {/* Manhã */}
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">Manhã</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getSelectedDaySlots()
                      .filter(slot => parseInt(slot.time.split(':')[0]) < 12)
                      .map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className="h-auto py-2"
                        >
                          {slot.time}
                        </Button>
                      ))}
                  </div>
                </div>

                {/* Tarde */}
                <div>
                  <h4 className="font-medium mb-3 text-sm text-muted-foreground">Tarde</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {getSelectedDaySlots()
                      .filter(slot => parseInt(slot.time.split(':')[0]) >= 14)
                      .map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => handleTimeSelect(slot.time)}
                          className="h-auto py-2"
                        >
                          {slot.time}
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmação */}
      {selectedDate && selectedTime && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">Confirmação do Agendamento</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Data:</strong> {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Horário:</strong> {selectedTime} (Horário de Brasília)
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Paciente:</strong> {patientName}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Tipo:</strong> {consultationType === 'presencial' ? 'Consulta Presencial' : 'Consulta Online'}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Valor:</strong> R$ {getConsultationPrice().toFixed(2).replace('.', ',')}
                </p>
              </div>
                <Button 
                  onClick={handleScheduleAppointment}
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isLoading ? "Enviando..." : "Solicitar Agendamento"}
                </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>📋 Após solicitação, nossa equipe entrará em contato</p>
        <p>💰 Pagamento será confirmado diretamente com a equipe</p>
        <p>📧 Instruções detalhadas serão enviadas por e-mail</p>
        <p>⏰ Chegue 15 minutos antes do horário marcado</p>
      </div>
    </div>
  );
}