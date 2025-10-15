# MerchMagic – Mockup Wizard

Projeto MVP de um gerador de mockups de camisetas desenvolvido com Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, Zod, fabric.js e bibliotecas auxiliares (shadcn/ui, lucide-react, JSZip e FileSaver).

## Estrutura

```
/apps/web
  app/
  components/
  lib/
  public/
```

## Pré-requisitos

- Node.js 18+
- pnpm 8+

## Instalação

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

O app ficará disponível em `http://localhost:3000`.

## Build de produção

```bash
pnpm build
pnpm start
```

## Lint e verificação de tipos

```bash
pnpm lint
pnpm typecheck
```

## Uso

1. Escolha tipo de camiseta, cor e envie uma estampa (PNG ou SVG até 10 MB).
2. Posicione, redimensione e rotacione a arte no canvas interativo.
3. Defina o modelo de IA simulado e o número de variações.
4. Gere as prévias, faça o download individual (PNG) ou exporte tudo em um ZIP.

Todos os estados são controlados via Zustand, com validações leves em Zod e presets de estilo simulando modelos de IA.
