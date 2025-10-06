import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, User, CheckCircle } from "lucide-react";
import { format, addDays, setHours, setMinutes, isSameDay, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [isLoading, setIsLoading] = useState(false);

  // Gerar horários disponíveis da Dra (simulando dados reais)
  useEffect(() => {
    generateAvailableSchedule();
  }, []);

  const generateAvailableSchedule = () => {
    const schedule: AvailableDay[] = [];
    const today = new Date();
    
    // Gerar próximos 30 dias
    for (let i = 1; i <= 30; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      
      // Dra atende Seg a Sex (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const timeSlots = generateTimeSlotsForDay(date);
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

  const generateTimeSlotsForDay = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const existingAppointments = getExistingAppointments(date);
    
    // Horários de manhã: 8h às 12h
    for (let hour = 8; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const appointmentKey = `${format(date, 'yyyy-MM-dd')}_${timeString}`;
        
        slots.push({
          time: timeString,
          available: !existingAppointments.includes(appointmentKey),
          patientName: existingAppointments.includes(appointmentKey) ? 'Ocupado' : undefined
        });
      }
    }
    
    // Horários de tarde: 14h às 18h
    for (let hour = 14; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const appointmentKey = `${format(date, 'yyyy-MM-dd')}_${timeString}`;
        
        slots.push({
          time: timeString,
          available: !existingAppointments.includes(appointmentKey),
          patientName: existingAppointments.includes(appointmentKey) ? 'Ocupado' : undefined
        });
      }
    }
    
    return slots;
  };

  const getExistingAppointments = (date: Date): string[] => {
    // Buscar agendamentos existentes do localStorage (simulando Supabase)
    const appointments = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const dateString = format(date, 'yyyy-MM-dd');
    
    return appointments
      .filter((apt: any) => apt.date === dateString)
      .map((apt: any) => `${apt.date}_${apt.time}`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleScheduleAppointment = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setIsLoading(true);
    
    // Simular chamada à API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Salvar agendamento
    const appointments = JSON.parse(localStorage.getItem('doctorAppointments') || '[]');
    const newAppointment = {
      id: Date.now().toString(),
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      patientName,
      patientEmail,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      notes: ''
    };
    
    appointments.push(newAppointment);
    localStorage.setItem('doctorAppointments', JSON.stringify(appointments));
    
    setIsLoading(false);
    onScheduleSuccess(selectedDate, selectedTime);
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
              </div>
              <Button 
                onClick={handleScheduleAppointment}
                loading={isLoading}
                loadingText="Agendando..."
                className="min-w-[120px]"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar Agendamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>📋 Sua consulta será confirmada automaticamente</p>
        <p>📧 Você receberá um e-mail de confirmação</p>
        <p>⏰ Lembre-se: chegue 15 minutos antes do horário</p>
      </div>
    </div>
  );
}