# 🎯 CareerQuest - Skill Reference Guide

**Guia centralizado de boas práticas, patterns e lições aprendidas durante o desenvolvimento do projeto.**

---

## 📋 Índice

1. [Visão Geral do Projeto](#visão-geral)
2. [Stack Tecnológica](#stack)
3. [Arquitetura e Organização](#arquitetura)
4. [Next.js Patterns](#nextjs-patterns)
5. [React Best Practices](#react-best-practices)
6. [TypeScript Patterns](#typescript-patterns)
7. [Tailwind CSS v4](#tailwind-css-v4)
8. [Style Helpers System](#style-helpers)
9. [SonarQube Compliance](#sonarqube)
10. [Troubleshooting](#troubleshooting)

---

## 🎮 Visão Geral {#visão-geral}

**CareerQuest** é uma plataforma gamificada de progressão de carreira para desenvolvedores, construída com Next.js 16, React 19 e TailwindCSS v4.

### Características Principais
- ✅ Dark mode nativo
- ✅ Design system personalizado (cores primary, secondary, accent)
- ✅ Componentes modulares e reutilizáveis
- ✅ Type-safe com TypeScript
- ✅ SonarQube compliant (zero code smells)
- ✅ Responsive design (mobile-first)

---

## 🛠️ Stack Tecnológica {#stack}

```json
{
  "next": "16.1.6",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "typescript": "^5"
}
```

### Decisões Técnicas

**Por que Next.js 16?**
- App Router (Server Components por padrão)
- Turbopack (build mais rápido)
- Melhor performance e SEO

**Por que React 19?**
- Novas features (use, useFormStatus, etc.)
- Melhor SSR/RSC
- Concurrent rendering otimizado

**Por que Tailwind v4?**
- CSS-first configuration
- Melhor performance de build
- Syntax mais moderna

---

## 🏗️ Arquitetura e Organização {#arquitetura}

### Estrutura de Diretórios

```
app/
├── globals.css              # Estilos globais + custom utilities
├── layout.tsx               # Root layout (fonts, dark mode)
├── page.tsx                 # Dashboard principal
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # Top header com level progress
│   │   └── Sidebar.tsx     # Navigation sidebar
│   └── dashboard/
│       ├── JobCard.tsx
│       ├── SearchFilterBar.tsx
│       ├── SkillGapCard.tsx
│       ├── TopPeersCard.tsx
│       └── WeeklyOutputCard.tsx
├── lib/
│   ├── constants.ts         # Configurações e constantes
│   ├── mockData.ts          # Dados de desenvolvimento
│   └── styleHelpers.ts      # Utilitários de estilo
└── types/
    └── index.ts             # TypeScript interfaces

docs/
├── prd.md                   # Product Requirements
└── skills/
    └── project-guide.md     # Este arquivo
```

### Princípios de Organização

#### 1. **Separação por Funcionalidade**
```typescript
// ✅ BOM: Componentes agrupados por feature
app/components/dashboard/JobCard.tsx
app/components/layout/Sidebar.tsx

// ❌ RUIM: Tudo junto
app/components/JobCard.tsx
app/components/Sidebar.tsx
```

#### 2. **Colocação Estratégica**
- `components/` → UI components
- `lib/` → Utilities e business logic
- `types/` → TypeScript definitions
- `docs/` → Documentação

#### 3. **Nomes Descritivos**
```typescript
// ✅ BOM: Nome descreve o propósito
getJobBadgeStyles()
getPeerRankClass()

// ❌ RUIM: Nome genérico
getStyles()
getClass()
```

---

## ⚡ Next.js Patterns {#nextjs-patterns}

### App Router (Next.js 16)

#### Server Components (Padrão)
```typescript
// app/page.tsx - Server Component por padrão
export default function Home() {
    // Pode fazer fetch direto aqui
    // Não precisa de useEffect
    return <div>...</div>
}
```

#### Client Components
```typescript
// Use 'use client' apenas quando necessário
'use client';

import { useState } from 'react';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    // Interactive components precisam ser client
    return <input value={query} onChange={e => setQuery(e.target.value)} />
}
```

### Quando usar 'use client'

✅ **PRECISA de 'use client':**
- Hooks (useState, useEffect, useContext)
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)
- Interatividade do usuário

❌ **NÃO PRECISA de 'use client':**
- Apenas renderização
- Props estáticas
- Data fetching (use Server Components)
- SEO-critical content

### Layout e Metadata

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CareerQuest - Your Career Dashboard',
    description: 'AI-powered career progression platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="dark">
            <body>{children}</body>
        </html>
    );
}
```

### Font Optimization

```typescript
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    display: 'swap', // FOUT prevention
});

const jetbrainsMono = JetBrains_Mono({
    variable: '--font-jetbrains-mono',
    subsets: ['latin'],
    display: 'swap',
});

// Uso no body
<body className={`${inter.variable} ${jetbrainsMono.variable}`}>
```

### Lições Aprendidas

#### ✅ DO: Componentes Pequenos e Focados
```typescript
// Cada componente tem uma responsabilidade
export default function JobCard({ job }: { job: Job }) {
    return <div>...</div>
}
```

#### ❌ DON'T: Componentes Gigantes
```typescript
// Evite componentes que fazem múltiplas coisas
export default function Dashboard() {
    // 500 linhas de código...
}
```

---

## ⚛️ React Best Practices {#react-best-practices}

### Props Imutáveis (SonarQube Rule)

```typescript
// ✅ BOM: Props com Readonly
interface JobCardProps {
    readonly job: Job;
}

export default function JobCard({ job }: Readonly<JobCardProps>) {
    // job não pode ser modificado
}
```

### Extração de Lógica Complexa

```typescript
// ❌ RUIM: Ternário aninhado inline
<span className={peer.isCurrentUser ? 'text-amber-600' : peer.rank === 1 ? 'text-primary' : 'text-slate-500'}>

// ✅ BOM: Função extraída
function getPeerRankClass(isCurrentUser: boolean, rank: number): string {
    if (isCurrentUser) return 'text-amber-600 dark:text-secondary';
    if (rank === 1) return 'text-slate-400 dark:text-secondary';
    return 'text-slate-400 dark:text-slate-500';
}

<span className={getPeerRankClass(peer.isCurrentUser, peer.rank)}>
```

### Keys Únicas em Listas

```typescript
// ❌ RUIM: Index como key
{jobs.map((job, index) => (
    <JobCard key={index} job={job} />
))}

// ✅ BOM: ID único como key
{jobs.map(job => (
    <JobCard key={job.id} job={job} />
))}

// ✅ BOM: Compound key
{job.tags.map(tag => (
    <span key={`${job.id}-${tag}`}>{tag}</span>
))}
```

### Conditional Rendering

```typescript
// ✅ BOM: Early return
if (!data) return <Loading />;
return <Content data={data} />;

// ✅ BOM: Ternário simples
{isLoading ? <Spinner /> : <Data />}

// ❌ RUIM: Ternário complexo aninhado
{isLoading ? <Spinner /> : data ? data.items.length ? <List /> : <Empty /> : <Error />}
```

### State Management

```typescript
// Para este projeto, props drilling é suficiente
// Não precisamos Redux/Zustand ainda

export default function Home() {
    // Dados mockados passados via props
    return (
        <div>
            <Sidebar user={mockUserProfile} />
            <Header user={mockUserProfile} title="Overview" />
        </div>
    )
}
```

---

## 📘 TypeScript Patterns {#typescript-patterns}

### Interfaces Centralizadas

```typescript
// app/types/index.ts

export interface Job {
    readonly id: string;
    readonly title: string;
    readonly company: string;
    readonly location: string;
    readonly salary: string;
    readonly type: 'match' | 'skill-gap' | 'promoted';
    readonly matchPercentage?: number;
    readonly tags: string[];
    readonly logo?: string;
}

export interface UserProfile {
    readonly name: string;
    readonly role: string;
    readonly avatar?: string;
    readonly level: number;
    readonly levelName: string;
    readonly levelProgress: number;
}
```

### Type-Safe Constants

```typescript
// ❌ RUIM: String literals
const JOB_ICONS = {
    match: 'cloud',
    'skill-gap': 'deployed_code',
};

// ✅ BOM: Record type
const JOB_ICONS: Record<Job['type'], string> = {
    match: 'cloud',
    'skill-gap': 'deployed_code',
    promoted: 'dataset',
} as const;
```

### Utility Types

```typescript
// Extrair tipos de union
type JobType = Job['type']; // 'match' | 'skill-gap' | 'promoted'

// Partial props
type PartialJob = Partial<Job>;

// Required props
type RequiredJob = Required<Job>;

// Pick specific properties
type JobSummary = Pick<Job, 'id' | 'title' | 'company'>;

// Omit properties
type JobWithoutId = Omit<Job, 'id'>;
```

### Readonly Props Pattern

```typescript
// SEMPRE use Readonly em props de componentes
interface CardProps {
    readonly title: string;
    readonly data: readonly Item[];
}

function Card({ title, data }: Readonly<CardProps>) {
    // title e data não podem ser modificados
}
```

---

## 🎨 Tailwind CSS v4 {#tailwind-css-v4}

### Diferenças Importantes da v3

#### ❌ NÃO funciona mais (v3 style):
```typescript
// tailwind.config.ts
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: '#58cc02', // ❌ Não funciona em v4
            }
        }
    }
}
```

#### ✅ Funciona (v4 style):
```css
/* app/globals.css */
@import "tailwindcss";

:root {
    --color-primary: #58cc02;
}

@layer utilities {
    .bg-primary { background-color: var(--color-primary); }
    .text-primary { color: var(--color-primary); }
    .border-primary { border-color: var(--color-primary); }
}
```

### Custom Colors System

```css
/* globals.css */
:root {
    --color-primary: #58cc02;     /* Verde Duolingo */
    --color-secondary: #ffc800;   /* Amarelo */
    --color-accent: #1cb0f6;      /* Azul */
    --color-background-dark: #131f24;
    --color-surface-dark: #202f36;
}
```

### Opacity Variants

```css
/* Defina manualmente cada variante */
.bg-primary\/10 { background-color: rgb(88 204 2 / 0.1); }
.bg-primary\/20 { background-color: rgb(88 204 2 / 0.2); }
.bg-primary\/30 { background-color: rgb(88 204 2 / 0.3); }

/* Dark mode */
.dark .dark\:bg-primary\/20 { background-color: rgb(88 204 2 / 0.2); }
```

### Hover States

```css
/* Hover direto */
.hover\:border-primary:hover { border-color: var(--color-primary); }

/* Dark mode hover */
.dark .dark\:hover\:border-primary:hover { 
    border-color: var(--color-primary); 
}

/* Group hover */
.group:hover .group-hover\:text-primary { 
    color: var(--color-primary); 
}
```

### Dark Mode

```typescript
// layout.tsx - adicione 'dark' na tag html
<html lang="en" className="dark">
```

```tsx
// Uso em componentes
<div className="bg-white dark:bg-surface-dark text-slate-900 dark:text-white">
```

---

## 🎨 Style Helpers System {#style-helpers}

### Conceito

Centralizar lógica de estilo para evitar duplicação e facilitar manutenção.

### Implementação

```typescript
// app/lib/styleHelpers.ts

const JOB_ICONS: Record<Job['type'], string> = {
    match: 'cloud',
    'skill-gap': 'deployed_code',
    promoted: 'dataset',
} as const;

export function getJobIcon(jobType: Job['type']): string {
    return JOB_ICONS[jobType] || 'work';
}

export function getJobBadgeStyles(jobType: Job['type']): string {
    const styles: Record<Job['type'], string> = {
        match: 'bg-green-100 dark:bg-primary/20 text-green-800 dark:text-primary',
        'skill-gap': 'bg-amber-100 dark:bg-secondary/20 text-amber-800 dark:text-secondary',
        promoted: 'bg-blue-100 dark:bg-accent/20 text-blue-800 dark:text-accent',
    };
    return styles[jobType];
}
```

### Uso

```typescript
import { getJobIcon, getJobBadgeStyles } from '@/app/lib/styleHelpers';

export default function JobCard({ job }: { job: Job }) {
    return (
        <div>
            <span className="material-symbols-outlined">
                {getJobIcon(job.type)}
            </span>
            <span className={getJobBadgeStyles(job.type)}>
                Badge
            </span>
        </div>
    );
}
```

### Benefícios

1. ✅ **DRY** - Não repete lógica
2. ✅ **Type-Safe** - TypeScript garante tipos corretos
3. ✅ **Testável** - Funções isoladas são fáceis de testar
4. ✅ **Manutenível** - Mudança em um lugar afeta tudo
5. ✅ **Documentável** - JSDoc em cada função

---

## ✅ SonarQube Compliance {#sonarqube}

### Regras Implementadas

#### 1. Props devem ser readonly
```typescript
// ❌ RUIM
interface Props {
    user: User;
}

// ✅ BOM
interface Props {
    readonly user: User;
}

// ✅ MELHOR
function Component({ user }: Readonly<Props>) { }
```

#### 2. Extrair ternários complexos
```typescript
// ❌ RUIM: Nested ternary
const className = isActive ? 'active' : isDisabled ? 'disabled' : 'default';

// ✅ BOM: Function extraction
function getStatusClass(isActive: boolean, isDisabled: boolean): string {
    if (isActive) return 'active';
    if (isDisabled) return 'disabled';
    return 'default';
}
```

#### 3. Keys únicas em arrays
```typescript
// ❌ RUIM: Index as key
{items.map((item, i) => <Item key={i} />)}

// ✅ BOM: Unique identifier
{items.map(item => <Item key={item.id} />)}
```

#### 4. Classes Tailwind modernas
```typescript
// ❌ Deprecated
className="flex-grow flex-shrink-0"

// ✅ Moderno
className="grow shrink-0"
```

#### 5. Funções puras e isoladas
```typescript
// ✅ Pure function - fácil de testar
export function calculatePercentage(current: number, total: number): string {
    if (total === 0) return '0%';
    return `${Math.round((current / total) * 100)}%`;
}

// ❌ Side effects - difícil de testar
function updatePercentage(current: number, total: number) {
    document.getElementById('percent').textContent = `${current/total * 100}%`;
}
```

---

## 🐛 Troubleshooting {#troubleshooting}

### Problema: Port 3000 ocupado

```powershell
# Encontrar processo
Get-Process | Where-Object {$_.ProcessName -eq "node"}

# Ou encontrar por porta
netstat -ano | findstr :3000

# Matar processo
taskkill /F /PID <PID>
```

### Problema: Lock file do Next.js

```powershell
# Remover lock
Remove-Item -Force ".next/dev/lock"

# Restart dev server
npm run dev
```

### Problema: Cores customizadas não aparecem

**Causa**: Tailwind v4 requer definição manual em CSS

**Solução**:
```css
/* globals.css */
@layer utilities {
    .bg-primary { background-color: var(--color-primary); }
    /* Defina TODAS as variantes necessárias */
}
```

### Problema: TypeScript errors em componentes

**Causa**: Props sem readonly ou tipos incorretos

**Solução**:
```typescript
interface Props {
    readonly data: Data; // Sempre readonly
}

function Component({ data }: Readonly<Props>) { }
```

### Problema: Hooks em Server Components

**Erro**: `You're importing a component that needs useState...`

**Solução**: Adicione `'use client'` no topo
```typescript
'use client';

import { useState } from 'react';
```

### Problema: CSS não recompila

**Solução**: 
1. Pare o dev server (Ctrl+C)
2. Remova `.next` folder
3. Restart: `npm run dev`

---

## 📚 Recursos e Referências

### Documentação Oficial
- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Ferramentas
- [SonarQube](https://www.sonarqube.org)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io)

### Livros Recomendados
- **Clean Code** - Robert C. Martin
- **The Pragmatic Programmer** - Hunt & Thomas
- **Refactoring** - Martin Fowler

---

## 🎯 Checklist de Desenvolvimento

### Ao criar um novo componente:
- [ ] ✅ Definir interface com `readonly` props
- [ ] ✅ Adicionar `'use client'` se usar hooks/interatividade
- [ ] ✅ Usar types do `app/types/index.ts`
- [ ] ✅ Extrair lógica complexa em funções nomeadas
- [ ] ✅ Usar helpers de `styleHelpers.ts` quando aplicável
- [ ] ✅ Keys únicas em listas (não usar index)
- [ ] ✅ Classes Tailwind modernas (grow vs flex-grow)
- [ ] ✅ Suporte dark mode (`dark:` prefix)
- [ ] ✅ Responsive design (mobile-first)
- [ ] ✅ Documentação JSDoc se for utility

### Ao fazer commit:
- [ ] ✅ Compilação TypeScript sem erros
- [ ] ✅ ESLint sem warnings
- [ ] ✅ SonarQube clean (zero code smells)
- [ ] ✅ Testar no navegador (funcionalidade + visual)
- [ ] ✅ Testar dark mode
- [ ] ✅ Testar responsivo (mobile/tablet/desktop)

---

## 🚀 Próximos Passos

### Features Planejadas
- [ ] Autenticação (NextAuth.js)
- [ ] API routes para dados reais
- [ ] Database integration (Prisma + PostgreSQL)
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Deployment (Vercel)

### Melhorias Técnicas
- [ ] Error boundaries
- [ ] Loading states consistentes
- [ ] Toast notifications system
- [ ] Form validation library
- [ ] Animation system
- [ ] Accessibility audit (WCAG)

---

**Criado em**: 11 de fevereiro de 2026  
**Versão**: 1.0.0  
**Status**: ✅ Implementado e Documentado

**Mantenha este documento atualizado à medida que o projeto evolui!**
