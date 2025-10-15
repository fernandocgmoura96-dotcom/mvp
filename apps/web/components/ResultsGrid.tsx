"use client";

import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDesignStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";

export function ResultsGrid() {
  const results = useDesignStore((state) => state.results);
  const [selected, setSelected] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleSelection = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleDownload = (dataUrl: string, name: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = name;
    link.click();
  };

  const downloadZip = async () => {
    const targets = selected.length
      ? results.filter((result) => selected.includes(result.id))
      : results;
    if (!targets.length) {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Gere prévias antes de exportar.",
      });
      return;
    }
    const zip = new JSZip();
    targets.forEach((result, index) => {
      const base64 = result.dataUrl.split(",")[1] ?? "";
      zip.file(`mockup_${index + 1}.png`, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "merchmagic-export.zip");
    toast({ title: "Exportação concluída", description: "ZIP baixado com sucesso." });
  };

  if (!results.length) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Gere prévias para visualizar os mockups aqui.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => {
          const isSelected = selected.includes(result.id);
          return (
            <Card key={result.id} className={isSelected ? "border-primary" : undefined}>
              <CardContent className="space-y-3 p-3">
                <div className="relative">
                  <img
                    src={result.dataUrl}
                    alt={`Mockup ${index + 1}`}
                    className="h-auto w-full rounded-md object-cover"
                  />
                  <label className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-background/80 px-2 py-1 text-xs font-medium shadow">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5"
                      checked={isSelected}
                      onChange={() => toggleSelection(result.id)}
                      aria-label={`Selecionar mockup ${index + 1}`}
                    />
                    Selecionar
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mockup {index + 1}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(result.dataUrl, `mockup_${index + 1}.png`)}
                    aria-label={`Baixar mockup ${index + 1}`}
                  >
                    <Download className="mr-2 h-4 w-4" aria-hidden /> PNG
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {selected.length > 0
            ? `${selected.length} mockup(s) selecionados`
            : "Nenhuma seleção: exportaremos todos"}
        </p>
        <Button type="button" onClick={downloadZip} variant="default">
          <Download className="mr-2 h-4 w-4" aria-hidden /> Exportar ZIP
        </Button>
      </div>
    </div>
  );
}
