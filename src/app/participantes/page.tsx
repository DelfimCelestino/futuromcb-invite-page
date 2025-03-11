"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, Search, FileSpreadsheet, FileDown } from "lucide-react";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import axios from "axios";

// Tipo para os participantes
interface Participant {
  id: string;
  name: string;
  location: string;
  contact: string;
  business: string;
  date: string;
}

export default function ParticipantsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortField, setSortField] = useState<"name" | "date">("date");
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Expectativa estática de participantes
  const expectedParticipants = 1000;

  // Filtrar e ordenar participantes
  const filteredAndSortedParticipants = participants
    .filter((participant) =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortOrder === "asc"
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
    });

  const toggleSort = (field: "name" | "date") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  async function getParticipants() {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/invites"
      );
      setParticipants(response.data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching participants:", error);
      }
      console.error("Error fetching participants:", error);
    }
  }

  useEffect(() => {
    getParticipants();
  }, []);

  const exportToExcel = () => {
    const ws = utils.json_to_sheet(
      filteredAndSortedParticipants.map((p) => ({
        Nome: p.name,
        Localização: p.location,
        Contacto: p.contact,
        Negócio: p.business || "-",
        "Data de Registro": new Date(p.date).toLocaleDateString("pt-PT"),
      }))
    );
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Participantes");
    writeFile(wb, "participantes-mcb.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Adicionar título
    doc.setFontSize(16);
    doc.text("Lista de Participantes - MCB", 14, 15);

    // Adicionar data de exportação
    doc.setFontSize(10);
    doc.text(`Exportado em: ${new Date().toLocaleDateString("pt-PT")}`, 14, 22);

    autoTable(doc, {
      startY: 30,
      head: [
        ["Nome", "Localização", "Contacto", "Negócio", "Data de Registro"],
      ],
      body: filteredAndSortedParticipants.map((p) => [
        p.name,
        p.location,
        p.contact,
        p.business || "-",
        new Date(p.date).toLocaleDateString("pt-PT"),
      ]),
    });

    doc.save("participantes-mcb.pdf");
  };

  // Calcular percentagem alcançada
  const percentageReached = (participants.length / expectedParticipants) * 100;

  // Calcular participantes restantes
  const remainingParticipants = expectedParticipants - participants.length;

  // Dados para o gráfico de localizações
  const locationData = participants.reduce((acc, participant) => {
    acc[participant.location] = (acc[participant.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Obter as 5 localizações mais comuns
  const topLocations = Object.entries(locationData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-background">
      {/* Dashboard de Estatísticas */}
      <div className="grid gap-2 sm:gap-4 mb-4 sm:mb-6 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 overflow-hidden">
          <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
            <CardTitle className="text-sm sm:text-lg font-medium truncate">
              Total de Participantes
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm truncate">
              Participantes confirmados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold truncate">
              {participants.length}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              de {expectedParticipants} esperados
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 overflow-hidden">
          <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
            <CardTitle className="text-sm sm:text-lg font-medium truncate">
              Meta Alcançada
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm truncate">
              Percentagem de participação
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold truncate">
              {percentageReached.toFixed(1)}%
            </div>
            <Progress value={percentageReached} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 overflow-hidden">
          <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
            <CardTitle className="text-sm sm:text-lg font-medium truncate">
              Participantes Restantes
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm truncate">
              Para atingir a meta
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold truncate">
              {remainingParticipants}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              {remainingParticipants > 0
                ? "participantes necessários"
                : "meta atingida!"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 overflow-hidden">
          <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
            <CardTitle className="text-sm sm:text-lg font-medium truncate">
              Taxa de Crescimento
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm truncate">
              Novos participantes por dia
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-3xl font-bold truncate">
              {participants.length > 0
                ? Math.ceil(
                    participants.length /
                      Math.max(
                        1,
                        Math.ceil(
                          (new Date().getTime() -
                            new Date(
                              participants.reduce(
                                (min, p) =>
                                  new Date(p.date) < new Date(min)
                                    ? p.date
                                    : min,
                                participants[0].date
                              )
                            ).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      )
                  )
                : 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1 truncate">
              participantes/dia
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Expectativa vs Realidade */}
      <div className="grid gap-2 sm:gap-4 mb-4 sm:mb-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="p-2 sm:p-4">
            <CardTitle className="text-sm sm:text-lg truncate">
              Expectativa vs Realidade
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm truncate">
              Comparação entre participantes esperados e confirmados
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 h-60 sm:h-80">
            <ParticipantsComparisonChart
              actual={participants.length}
              expected={expectedParticipants}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-2 sm:p-4">
            <CardTitle className="text-sm sm:text-lg truncate">
              Top 5 Localizações
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm truncate">
              Distribuição geográfica dos participantes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 h-60 sm:h-80">
            <LocationsChart locations={topLocations} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1 sm:space-y-2 p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-lg sm:text-2xl font-bold text-primary truncate">
              Lista de Participantes Confirmados
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={exportToExcel}
              >
                <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Excel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                onClick={exportToPDF}
              >
                <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">PDF</span>
              </Button>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            Total de participantes: {filteredAndSortedParticipants.length}
            {searchTerm && ` (filtrados de ${participants.length})`}
          </p>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 sm:pl-8 text-xs sm:text-sm h-8 sm:h-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort("name")}
                className={`text-xs sm:text-sm h-8 sm:h-10 ${
                  sortField === "name" ? "border-primary" : ""
                }`}
              >
                Nome
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleSort("date")}
                className={`text-xs sm:text-sm h-8 sm:h-10 ${
                  sortField === "date" ? "border-primary" : ""
                }`}
              >
                Data
                <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Nome</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Localização
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Contacto</TableHead>
                  <TableHead className="text-xs sm:text-sm">Negócio</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    Data de Registro
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-4">
                      {participant.name}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                      {participant.location}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                      {participant.contact}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                      {participant.business || "-"}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                      {new Date(participant.date).toLocaleDateString("pt-PT")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para o gráfico de comparação
function ParticipantsComparisonChart({
  actual,
  expected,
}: {
  actual: number;
  expected: number;
}) {
  useEffect(() => {
    // Função para redimensionar o canvas
    const resizeCanvas = () => {
      const canvas = document.getElementById(
        "comparison-chart"
      ) as HTMLCanvasElement;
      if (!canvas) return;

      const container = canvas.parentElement;
      if (!container) return;

      // Ajustar o tamanho do canvas ao container
      const width = container.clientWidth;
      canvas.width = width;
      canvas.height = container.clientHeight;

      renderChart();
    };

    // Função para renderizar o gráfico
    const renderChart = () => {
      const canvas = document.getElementById(
        "comparison-chart"
      ) as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Definir dimensões
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = Math.min(width * 0.3, 100); // Limitar largura máxima da barra
      const maxValue = Math.max(expected, actual);

      // Calcular escala para valores muito grandes
      const scale = maxValue > 10000 ? 1000 : maxValue > 1000 ? 100 : 1;
      const scaleText = scale > 1 ? ` (x${scale})` : "";

      // Desenhar barras
      // Barra de expectativa
      const expectedHeight = (expected / maxValue) * (height * 0.7);
      ctx.fillStyle = "#94a3b8"; // Cor cinza
      ctx.fillRect(
        width * 0.25 - barWidth / 2,
        height - expectedHeight - 40,
        barWidth,
        expectedHeight
      );

      // Barra de realidade
      const actualHeight = (actual / maxValue) * (height * 0.7);
      ctx.fillStyle = "#3b82f6"; // Cor azul
      ctx.fillRect(
        width * 0.75 - barWidth / 2,
        height - actualHeight - 40,
        barWidth,
        actualHeight
      );

      // Adicionar texto
      ctx.fillStyle = "#000";
      const fontSize = Math.max(10, Math.min(14, width / 30)); // Tamanho de fonte responsivo
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";

      // Texto para expectativa
      ctx.fillText("Expectativa", width * 0.25, height - 10);
      ctx.fillText(
        formatNumber(expected),
        width * 0.25,
        height - expectedHeight - 50
      );

      // Texto para realidade
      ctx.fillText("Realidade", width * 0.75, height - 10);
      ctx.fillText(
        formatNumber(actual),
        width * 0.75,
        height - actualHeight - 50
      );

      // Adicionar linha de meta
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(width * 0.1, height - expectedHeight - 40);
      ctx.lineTo(width * 0.9, height - expectedHeight - 40);
      ctx.stroke();

      // Texto de meta
      ctx.fillStyle = "#ef4444";
      ctx.fillText("Meta", width * 0.1, height - expectedHeight - 50);

      // Adicionar percentagem alcançada
      const percentage = ((actual / expected) * 100).toFixed(1);
      ctx.font = `bold ${fontSize + 2}px Arial`;
      ctx.fillStyle = "#000";
      ctx.fillText(
        `${percentage}% Alcançado${scaleText}`,
        width * 0.5,
        height * 0.15
      );
    };

    // Função para formatar números grandes
    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num.toString();
    };

    // Renderizar inicialmente
    resizeCanvas();

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", resizeCanvas);

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [actual, expected]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas id="comparison-chart" className="max-w-full max-h-full"></canvas>
    </div>
  );
}

// Componente para o gráfico de localizações
function LocationsChart({ locations }: { locations: [string, number][] }) {
  useEffect(() => {
    // Função para redimensionar o canvas
    const resizeCanvas = () => {
      const canvas = document.getElementById(
        "locations-chart"
      ) as HTMLCanvasElement;
      if (!canvas || locations.length === 0) return;

      const container = canvas.parentElement;
      if (!container) return;

      // Ajustar o tamanho do canvas ao container
      const width = container.clientWidth;
      canvas.width = width;
      canvas.height = container.clientHeight;

      renderChart();
    };

    // Função para renderizar o gráfico
    const renderChart = () => {
      const canvas = document.getElementById(
        "locations-chart"
      ) as HTMLCanvasElement;
      if (!canvas || locations.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Definir dimensões
      const width = canvas.width;
      const height = canvas.height;
      const maxLocations = Math.min(locations.length, 5); // Limitar a 5 localizações
      const barHeight = Math.min(height * 0.12, height / (maxLocations + 2)); // Altura responsiva
      const spacing = Math.min(height * 0.05, barHeight / 2);
      const maxValue = Math.max(...locations.map((loc) => loc[1]));

      // Calcular escala para valores muito grandes
      const scale = maxValue > 10000 ? 1000 : maxValue > 1000 ? 100 : 1;
      const scaleText = scale > 1 ? ` (x${scale})` : "";

      // Cores para as barras
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

      // Calcular tamanho de fonte responsivo
      const fontSize = Math.max(8, Math.min(12, width / 40));

      // Desenhar barras
      const displayLocations = locations.slice(0, maxLocations);
      displayLocations.forEach((location, index) => {
        const [name, value] = location;
        const barWidth = (value / maxValue) * (width * 0.6);
        const y = spacing + index * (barHeight + spacing);

        // Barra
        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(width * 0.3, y, barWidth, barHeight);

        // Nome da localização (truncado se necessário)
        ctx.fillStyle = "#000";
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "right";
        let displayName = name;
        if (ctx.measureText(name).width > width * 0.25) {
          // Truncar nome se for muito longo
          displayName = name.substring(0, 10) + "...";
        }
        ctx.fillText(displayName, width * 0.28, y + barHeight / 2 + 4);

        // Valor
        ctx.textAlign = "left";
        ctx.fillText(
          formatNumber(value),
          width * 0.3 + barWidth + 5,
          y + barHeight / 2 + 4
        );
      });

      // Título
      ctx.fillStyle = "#000";
      ctx.font = `bold ${fontSize + 2}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(
        `Distribuição por Localização${scaleText}`,
        width * 0.5,
        height * 0.95
      );
    };

    // Função para formatar números grandes
    const formatNumber = (num: number) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num.toString();
    };

    // Renderizar inicialmente
    resizeCanvas();

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", resizeCanvas);

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [locations]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <canvas id="locations-chart" className="max-w-full max-h-full"></canvas>
    </div>
  );
}
