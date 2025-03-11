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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="min-h-screen p-4 bg-background">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary">
              Lista de Participantes Confirmados
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={exportToExcel}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={exportToPDF}
              >
                <FileDown className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground">
            Total de participantes: {filteredAndSortedParticipants.length}
            {searchTerm && ` (filtrados de ${participants.length})`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => toggleSort("name")}
              className={sortField === "name" ? "border-primary" : ""}
            >
              Nome
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => toggleSort("date")}
              className={sortField === "date" ? "border-primary" : ""}
            >
              Data
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Negócio</TableHead>
                  <TableHead>Data de Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-medium">
                      {participant.name}
                    </TableCell>
                    <TableCell>{participant.location}</TableCell>
                    <TableCell>{participant.contact}</TableCell>
                    <TableCell>{participant.business || "-"}</TableCell>
                    <TableCell>
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
