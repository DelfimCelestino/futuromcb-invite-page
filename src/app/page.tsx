"use client";

import type React from "react";
import { useState } from "react";
import confetti from "canvas-confetti";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FloatingBubbles from "@/components/floating-bubbles";
import { TopLeftShape, BottomRightShape } from "@/components/decorative-shapes";
import { ModeToggle } from "@/components/mode-toggle";
import axios from "axios";

// Common neighborhoods in Nampula
const neighborhoods = [
  "Muahivire",
  "Namicopo",
  "Namutequeliua",
  "Napipine",
  "Carrupeia",
  "Muhala",
  "Muatala",
  "Natikiri",
  "Marrere",
  "Central",
  "Outro",
];

// Common business types
const businessTypes = [
  "Comerciante",
  "Agricultor",
  "Vendedor Ambulante",
  "Carpinteiro",
  "Mecânico",
  "Costureiro",
  "Cabeleireiro",
  "Pescador",
  "Motorista",
  "Outro",
];

export default function ParticipationForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact: "",
    business: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/invites/create",
        formData
      );
      console.log(response);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setIsSuccess(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error submitting form:", error);
        alert("Ocorreu um erro ao enviar o formulário.");
      } else {
        console.error("Error submitting form:", error);
        alert("Ocorreu um erro ao enviar o formulário.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({
      name: "",
      location: "",
      contact: "",
      business: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background transition-colors relative">
      <FloatingBubbles />
      <div className="absolute top-4 right-4 flex gap-2">
        <ModeToggle />
      </div>
      <Card className="w-full max-w-3xl relative overflow-hidden border-primary/20">
        <TopLeftShape />
        <BottomRightShape />

        <CardHeader className="text-center space-y-6 pb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">Mega Evento MCB</h1>
            <p className="text-xl font-semibold text-foreground">
              O Futuro é Agora
            </p>
          </div>

          <div className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              O Futuro MCB é a instituição financeira que está a transformar
              vidas no norte de Moçambique, tornando os serviços financeiros
              acessíveis para todos, especialmente para micro e pequenas
              empresas e agricultores.
            </p>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Você está Convidado!
              </h2>
              <p className="text-muted-foreground">
                Junte-se a nós para um dia extraordinário de conexões,
                oportunidades e celebração. Venha fazer parte desta jornada de
                transformação e descobrir como podemos construir juntos um
                futuro financeiro mais próspero.
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-6 flex-wrap text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span>15 de Março de 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>09:00 - 17:00</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Nampula - Pavilhão de Desportos</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <div className="max-w-md mx-auto">
            <h2 className="text-center text-lg font-semibold mb-6 text-foreground">
              Confirme sua Participação
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Localização (Bairro)</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    setFormData({ ...formData, location: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {neighborhoods.map((neighborhood) => (
                      <SelectItem key={neighborhood} value={neighborhood}>
                        {neighborhood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contacto</Label>
                <Input
                  id="contact"
                  required
                  maxLength={9}
                  value={formData.contact}
                  type="number"
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business">Negócio</Label>
                <Select
                  value={formData.business}
                  onValueChange={(value) =>
                    setFormData({ ...formData, business: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo de negócio" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((businessType) => (
                      <SelectItem key={businessType} value={businessType}>
                        {businessType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={isLoading} type="submit" className="w-full">
                {isLoading ? "Confirmando..." : "Confirmar Participação"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSuccess} onOpenChange={setIsSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Participação Confirmada!
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Estamos muito felizes em ter você conosco neste evento especial!
              Juntos, vamos construir um futuro financeiro mais inclusivo.
            </p>
            <p className="font-semibold text-foreground">
              Nos vemos em 15 de Março de 2025!
            </p>
            <Button onClick={handleClose} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
