"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useDesignStore } from "@/lib/store";
import { listPresets, modelLabel } from "@/lib/presets";
import type { ModelId } from "@/lib/types";

export function ModelSelector() {
  const model = useDesignStore((state) => state.model);
  const variations = useDesignStore((state) => state.variations);
  const setModel = useDesignStore((state) => state.actions.setModel);
  const setVariations = useDesignStore((state) => state.actions.setVariations);
  const options = listPresets();

  return (
    <Card aria-labelledby="modelo-ia">
      <CardHeader>
        <CardTitle id="modelo-ia">Modelo de IA</CardTitle>
        <CardDescription>
          Escolha o estilo de mockup simulado e quantas variações deseja gerar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="model-select">Modelo</Label>
          <Select value={model} onValueChange={(value) => setModel(value as ModelId)}>
            <SelectTrigger id="model-select" aria-label="Selecionar modelo de IA">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="variations-slider">Variações</Label>
            <span className="text-sm text-muted-foreground">{variations}</span>
          </div>
          <Slider
            id="variations-slider"
            min={1}
            max={4}
            step={1}
            value={[variations]}
            onValueChange={([value]) => setVariations(value)}
            aria-valuetext={`${variations} variações`}
          />
          <p className="text-xs text-muted-foreground">
            {modelLabel(model)} gera estilos diferentes com base no canvas atual.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
