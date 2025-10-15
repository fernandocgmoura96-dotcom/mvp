"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Stepper } from "@/components/Stepper";
import { ProductForm } from "@/components/ProductForm";
import { PositionerCanvas } from "@/components/PositionerCanvas";
import { ModelSelector } from "@/components/ModelSelector";
import { ResultsGrid } from "@/components/ResultsGrid";
import { Toolbar } from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDesignStore } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";

const STEP_TITLES: Record<1 | 2 | 3 | 4, string> = {
  1: "Produto & Arte",
  2: "Posicionamento",
  3: "Modelo de IA",
  4: "Resultados & Exportar",
};

export default function Page() {
  const step = useDesignStore((state) => state.step);
  const upload = useDesignStore((state) => state.upload);
  const isGenerating = useDesignStore((state) => state.isGenerating);
  const variations = useDesignStore((state) => state.variations);
  const { toast } = useToast();
  const { setStep, generateResults, reset } = useDesignStore((state) => state.actions);

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(upload);
    if (step === 2) return Boolean(upload);
    return true;
  }, [step, upload]);

  const nextStep = () => {
    if (step < 4) {
      setStep((step + 1) as 1 | 2 | 3 | 4);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleGenerate = async () => {
    if (!upload) {
      toast({
        title: "Adicione uma estampa",
        description: "Carregue uma arte antes de gerar as prévias.",
      });
      return;
    }
    const before = useDesignStore.getState().results.length;
    await generateResults();
    const after = useDesignStore.getState().results.length;
    if (after > before) {
      toast({
        title: "Mockups gerados",
        description: `Criamos ${after} variação(ões).`,
      });
    }
  };

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">MerchMagic</h1>
        <p className="text-sm text-muted-foreground">
          Conduzimos você em quatro passos para gerar mockups profissionais de camisetas.
        </p>
      </div>
      <Stepper />

      <section aria-labelledby="wizard-step" className="flex flex-1 flex-col gap-6">
        <header>
          <h2 id="wizard-step" className="text-xl font-semibold">
            {STEP_TITLES[step]}
          </h2>
        </header>
        <div className="flex flex-1 flex-col gap-6">
          {step === 1 && <ProductForm />}
          {step === 2 && (
            <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
              <div className="space-y-4">
                <PositionerCanvas />
              </div>
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Área de impressão</CardTitle>
                  <CardDescription>
                    Arraste, redimensione e rotacione sua arte dentro dos limites pontilhados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Toolbar />
                  <Separator />
                  <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
                    <li>Use os cantos para redimensionar proporcionalmente.</li>
                    <li>A rotação está disponível pelo controle externo.</li>
                    <li>A arte não ultrapassa a área de impressão.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
          {step === 3 && <ModelSelector />}
          {step === 4 && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gerar prévias</CardTitle>
                  <CardDescription>
                    Criaremos {variations} versão(ões) com base no canvas atual e no modelo selecionado.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Certifique-se de que o posicionamento está correto antes de gerar.
                  </p>
                  <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    aria-live="polite"
                  >
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                    Gerar prévias
                  </Button>
                </CardContent>
              </Card>
              <ResultsGrid />
            </div>
          )}
        </div>
      </section>

      <footer className="mt-10 flex items-center justify-between border-t pt-4">
        <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 1}>
          Voltar
        </Button>
        {step < 4 ? (
          <Button type="button" onClick={nextStep} disabled={!canContinue}>
            Continuar
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={reset}>
            Recomeçar
          </Button>
        )}
      </footer>
    </main>
  );
}
