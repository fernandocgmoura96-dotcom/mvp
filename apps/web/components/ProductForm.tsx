"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDesignStore } from "@/lib/store";
import { SHIRT_COLORS, SHIRT_TYPES } from "@/lib/color";
import { MAX_MB, uploadSchema } from "@/lib/validators";
import { useToast } from "@/components/ui/use-toast";
import type { ShirtType } from "@/lib/types";

export function ProductForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isReading, setIsReading] = useState(false);
  const shirtType = useDesignStore((state) => state.shirtType);
  const colorHex = useDesignStore((state) => state.colorHex);
  const upload = useDesignStore((state) => state.upload);
  const setProduct = useDesignStore((state) => state.actions.setProduct);
  const setUpload = useDesignStore((state) => state.actions.setUpload);

  const handleFile = useCallback(
    async (file?: File | null) => {
      if (!file) return;
      try {
        uploadSchema.parse(file);
      } catch (error: any) {
        toast({
          title: "Upload inválido",
          description: error?.errors?.[0]?.message ?? "Verifique o arquivo.",
        });
        return;
      }
      setIsReading(true);
      try {
        if (file.type === "image/svg+xml") {
          const text = await file.text();
          setUpload({
            name: file.name,
            dataUrl: text,
            isSvg: true,
          });
        } else {
          const reader = new FileReader();
          const dataUrl: string = await new Promise((resolve, reject) => {
            reader.onerror = () => reject(reader.error);
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          setUpload({
            name: file.name,
            dataUrl,
            isSvg: false,
          });
        }
        toast({
          title: "Upload concluído",
          description: `${file.name} pronto para posicionamento`,
          duration: 2500,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: "Erro ao ler arquivo",
          description: "Tente novamente com outro arquivo",
        });
      } finally {
        setIsReading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [setUpload, toast],
  );

  return (
    <Card aria-labelledby="produto-form">
      <CardHeader>
        <CardTitle id="produto-form">Selecione o produto</CardTitle>
        <CardDescription>Defina tipo, cor e carregue a estampa da camiseta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="shirtType">Tipo de camiseta</Label>
            <Select value={shirtType} onValueChange={(value) => setProduct(value as ShirtType, colorHex)}>
              <SelectTrigger id="shirtType" aria-label="Selecionar tipo de camiseta">
                <SelectValue placeholder="Escolha um modelo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SHIRT_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Cor</Label>
            <Select value={colorHex} onValueChange={(value) => setProduct(shirtType, value)}>
              <SelectTrigger id="color" aria-label="Selecionar cor da camiseta">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHIRT_COLORS.map((color) => (
                  <SelectItem key={color.hex} value={color.hex}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: color.hex }}
                        aria-hidden
                      />
                      {color.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" aria-hidden /> Upload da estampa
          </Label>
          <Input
            ref={fileInputRef}
            id="upload"
            type="file"
            accept=".png,.svg"
            onChange={(event) => handleFile(event.target.files?.[0])}
            disabled={isReading}
            aria-describedby="upload-help"
          />
          <p id="upload-help" className="text-xs text-muted-foreground">
            Formatos suportados: PNG ou SVG até {MAX_MB}MB.
          </p>
          {upload ? (
            <div className="flex items-center justify-between rounded-md border bg-muted/40 p-3 text-sm">
              <span className="truncate" aria-live="polite">
                {upload.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUpload(undefined)}
                aria-label="Remover arquivo"
              >
                Remover
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum arquivo selecionado ainda.</p>)
          }
        </div>
      </CardContent>
    </Card>
  );
}
