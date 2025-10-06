import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, BookOpen, Search, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import scientificWorks from "@/data/scientificWorks.json";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  relatedWorks?: any[];
}

interface ChatbotRAGProps {
  onWorkSelect: (work: any) => void;
}

export const ChatbotRAG = ({ onWorkSelect }: ChatbotRAGProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Olá! Sou o assistente virtual do Congresso WCTCIM 2025. Posso ajudá-lo a encontrar trabalhos científicos, relatos de caso e experiências. Como posso ajudá-lo hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Função simples de busca semântica (em produção, usaria embeddings reais)
  const searchWorks = (query: string) => {
    const queryLower = query.toLowerCase();
    const results = scientificWorks.filter(work => {
      const searchableText = [
        work.title,
        work.abstract,
        ...work.keywords,
        ...work.authors.map((a: any) => a.name),
        work.institution
      ].join(' ').toLowerCase();

      return searchableText.includes(queryLower);
    });

    return results.slice(0, 5); // Retorna até 5 resultados mais relevantes
  };

  // Função para gerar resposta do bot
  const generateBotResponse = (userMessage: string): { content: string; relatedWorks: any[] } => {
    const query = userMessage.toLowerCase();
    let content = "";
    let relatedWorks: any[] = [];

    // Respostas para perguntas específicas
    if (query.includes('pediatria') || query.includes('criança') || query.includes('infantil')) {
      relatedWorks = searchWorks('pediatria criança infantil');
      content = `Encontrei ${relatedWorks.length} trabalhos relacionados à pediatria e cuidados infantis. Aqui estão os principais:`;
    } else if (query.includes('oncologia') || query.includes('câncer') || query.includes('cancer')) {
      relatedWorks = searchWorks('oncologia câncer cancer');
      content = `Encontrei ${relatedWorks.length} trabalhos sobre oncologia e tratamento do câncer. Aqui estão os principais:`;
    } else if (query.includes('ansiedade') || query.includes('depressão') || query.includes('saúde mental')) {
      relatedWorks = searchWorks('ansiedade depressão saúde mental');
      content = `Encontrei ${relatedWorks.length} trabalhos sobre saúde mental, ansiedade e depressão. Aqui estão os principais:`;
    } else if (query.includes('acupuntura') || query.includes('acupuncture')) {
      relatedWorks = searchWorks('acupuntura acupuncture');
      content = `Encontrei ${relatedWorks.length} trabalhos sobre acupuntura. Aqui estão os principais:`;
    } else if (query.includes('medicina tradicional') || query.includes('medicina chinesa')) {
      relatedWorks = searchWorks('medicina tradicional chinesa');
      content = `Encontrei ${relatedWorks.length} trabalhos sobre medicina tradicional chinesa. Aqui estão os principais:`;
    } else if (query.includes('ayurveda') || query.includes('ayurvédica')) {
      relatedWorks = searchWorks('ayurveda ayurvédica');
      content = `Encontrei ${relatedWorks.length} trabalhos sobre Ayurveda. Aqui estão os principais:`;
    } else if (query.includes('homeopatia') || query.includes('homeopática')) {
      relatedWorks = searchWorks('homeopatia homeopática');
      content = `Encontrei ${relatedWorks.length} trabalhos sobre homeopatia. Aqui estão os principais:`;
    } else if (query.includes('fitoterapia') || query.includes('plantas medicinais')) {
      relatedWorks = searchWorks('fitoterapia plantas medicinais');
      content = `Encontrei ${relatedWorks.length} trabalhos sobre fitoterapia e plantas medicinais. Aqui estão os principais:`;
    } else if (query.includes('mindfulness') || query.includes('meditação')) {
      relatedWorks = searchWorks('mindfulness meditação');
      content = `Encontrei ${relatedWorks.length} trabalhos sobre mindfulness e meditação. Aqui estão os principais:`;
    } else if (query.includes('relato de experiência') || query.includes('relato de caso')) {
      relatedWorks = searchWorks('relato experiência caso');
      content = `Encontrei ${relatedWorks.length} relatos de experiência e casos clínicos. Aqui estão os principais:`;
    } else if (query.includes('trabalhos científicos') || query.includes('pesquisas')) {
      relatedWorks = scientificWorks.filter(w => w.category === 'científico').slice(0, 5);
      content = `Encontrei ${relatedWorks.length} trabalhos científicos. Aqui estão os principais:`;
    } else if (query.includes('apresentação oral') || query.includes('oral')) {
      relatedWorks = scientificWorks.filter(w => w.modality === 'oral').slice(0, 5);
      content = `Encontrei ${relatedWorks.length} apresentações orais. Aqui estão as principais:`;
    } else if (query.includes('pôster') || query.includes('poster')) {
      relatedWorks = scientificWorks.filter(w => w.modality === 'pôster').slice(0, 5);
      content = `Encontrei ${relatedWorks.length} pôsteres. Aqui estão os principais:`;
    } else if (query.includes('vídeo') || query.includes('video')) {
      relatedWorks = scientificWorks.filter(w => w.modality === 'vídeo').slice(0, 5);
      content = `Encontrei ${relatedWorks.length} apresentações em vídeo. Aqui estão as principais:`;
    } else {
      // Busca geral
      relatedWorks = searchWorks(userMessage);
      if (relatedWorks.length > 0) {
        content = `Encontrei ${relatedWorks.length} trabalhos relacionados à sua pergunta. Aqui estão os principais:`;
      } else {
        content = `Não encontrei trabalhos específicos para sua pergunta. Tente usar termos como: pediatria, oncologia, acupuntura, medicina tradicional, ayurveda, homeopatia, fitoterapia, mindfulness, ou relatos de experiência.`;
      }
    }

    return { content, relatedWorks };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simular delay de processamento
    setTimeout(() => {
      const { content, relatedWorks } = generateBotResponse(inputValue);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
        relatedWorks
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          Assistente Virtual
          <Badge variant="secondary" className="ml-auto">
            IA
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                
                {/* Trabalhos Relacionados */}
                {message.relatedWorks && message.relatedWorks.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.relatedWorks.map((work) => (
                      <div
                        key={work.id}
                        className="p-2 bg-white rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => onWorkSelect(work)}
                      >
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-800 line-clamp-1">
                              {work.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {work.authors[0].name} • {work.schedule.room} • Dia {work.schedule.day}
                            </p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {work.modality}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {work.category.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pergunte sobre trabalhos, temas, autores..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Sugestões Rápidas */}
          <div className="mt-2 flex flex-wrap gap-1">
            {['Pediatria', 'Oncologia', 'Acupuntura', 'Ayurveda'].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={() => setInputValue(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
