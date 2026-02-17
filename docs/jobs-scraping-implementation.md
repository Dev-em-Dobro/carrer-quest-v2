# Job Scraping - Guia de Implementação

## 📋 Objetivo

Sistema de curadoria de vagas tech que:
- ✅ Extrai apenas **metadados** (título, empresa, stack, nível, localização)
- ✅ **Não salva** descrições completas, benefícios ou conteúdo protegido
- ✅ Redireciona sempre para o **site original**
- ✅ Mantém compliance legal (agregador, não clone)

---

## 🏗️ Arquitetura

```
┌─────────────┐
│   Gupy API  │ ← Fonte (portal.gupy.io)
└──────┬──────┘
  │
  ├──────────────┐
  ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  ┌───────────────┐
│ Remotive API │  │ RemoteOK API │  │ ProgramaThor    │  │ Trampos       │
└──────┬───────┘  └──────┬───────┘  └────────┬────────┘  └───────┬───────┘
  │                 │                  │                     │
  └─────────────────┴──────────────────┴─────────────────────┘
        ▼
┌──────────────────┐
│ Connectors       │ ← sources/gupy.ts + remotive.ts + remoteok.ts + programathor.ts + trampos.ts
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Normalizers     │ ← Padronização (normalizers.ts)
│  - Level         │
│  - Stack         │
│  - Location      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Deduplication   │ ← Fingerprint SHA256 (dedupe.ts)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Prisma Upsert   │ ← Persistência idempotente
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  GET /api/jobs   │ ← API para frontend
└──────────────────┘
```

---

## 🗄️ Schema (Prisma)

```prisma
enum JobLevel {
  ESTAGIO
  JUNIOR
  PLENO
  SENIOR
  OUTRO
}

enum JobSource {
  GUPY
  COMPANY_SITE
}

model Job {
  id          String    @id @default(cuid())
  title       String
  companyName String
  level       JobLevel
  stack       String[]
  location    String?
  isRemote    Boolean   @default(false)
  publishedAt DateTime?
  source      JobSource
  sourceUrl   String    // ✅ Link original
  fingerprint String    @unique // SHA256(title|company|sourceUrl)
  lastSeenAt  DateTime
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Índices críticos:**
- `fingerprint` (UNIQUE) → evita duplicatas
- `source` → filtro por origem
- `level` → filtro por senioridade
- `isRemote` → filtro remoto/presencial

---

## 🔌 Conector Gupy

**Arquivo:** `app/lib/jobs/sources/gupy.ts`

### Estratégia

1. **Fetch** de vagas da API pública da Gupy (paginado)
2. **Filtro** por palavras-chave tech (dev, frontend, backend, react, python, etc.)
3. **Exclusão** de não-tech (vendas, RH, financeiro, marketing)
4. **Extração** de stack do título (heurísticas)
5. **Retorno** no formato `RawSourceJob[]`

### Funções principais

```typescript
// Entry point
export async function fetchFromGupy(): Promise<RawSourceJob[]>

// Busca paginada
async function fetchGupyJobs(limit: number, maxPages: number): Promise<RawSourceJob[]>

// Filtros
function isTechJob(jobName: string): boolean
function extractStackFromJobName(jobName: string): string[]
```

### Keywords tech (exemplos)

- **Linguagens:** javascript, typescript, python, java, kotlin, go, rust, php, ruby
- **Frameworks:** react, vue, angular, next, node, django, spring, laravel
- **Roles:** desenvolvedor, developer, frontend, backend, fullstack, devops, qa, data engineer

### Keywords de exclusão

- vendas, sales, marketing, rh, human resources, financeiro, finance, jurídico, legal, administrativo

---

## 🔧 Normalizers

**Arquivo:** `app/lib/jobs/normalizers.ts`

### `normalizeLevel(raw: string | null): JobLevel`

Mapeia strings variadas para enum:
- "Estágio", "Estagiário", "Intern" → `ESTAGIO`
- "Júnior", "Jr", "Junior" → `JUNIOR`
- "Pleno", "Pl", "Mid" → `PLENO`
- "Sênior", "Sr", "Senior", "Lead" → `SENIOR`
- Default → `OUTRO`

### `normalizeStack(raw: string | string[] | null): string[]`

- Converte para array
- Remove duplicatas
- Lowercase
- Retorna array limpo

### `normalizeLocation(raw: string | null): { location: string | null; isRemote: boolean }`

- Detecta "remoto", "remote", "home office" → `isRemote: true`
- Retorna localização formatada

---

## 🔐 Deduplicação

**Arquivo:** `app/lib/jobs/dedupe.ts`

```typescript
export function buildJobFingerprint(data: {
  title: string;
  companyName: string;
  sourceUrl: string;
}): string
```

- Concatena `title|companyName|sourceUrl`
- Gera SHA256 hash
- UNIQUE constraint no banco evita duplicatas

---

## 🚀 Bootstrap

**Arquivo:** `app/lib/jobs/bootstrap.ts`

### `bootstrapInitialJobs()`

Processo idempotente:
1. Fetch vagas do conector (`fetchFromGupy()`)
2. Para cada vaga:
   - Normaliza dados
   - Gera fingerprint
   - **Upsert** (cria se novo, atualiza se existe)
3. Retorna contadores: `{ fetchedCount, insertedCount, updatedCount, skippedCount }`

**Idempotência:** Executar múltiplas vezes não cria duplicatas.

---

## 🔒 API Endpoints

### `POST /api/jobs/bootstrap`

**Proteção:** Header `x-bootstrap-secret` (env: `JOBS_BOOTSTRAP_SECRET`)

**Uso:**
```bash
curl -X POST http://localhost:3000/api/jobs/bootstrap \
  -H "x-bootstrap-secret: your-secret-here"
```

**Response:**
```json
{
  "status": "ok",
  "fetchedCount": 120,
  "insertedCount": 45,
  "updatedCount": 75,
  "skippedCount": 0
}
```

### `GET /api/jobs`

**Query Params:**
- `level` → `estagio|junior|pleno|senior`
- `source` → `gupy|company_site`
- `remote` → `true|false`
- `q` → busca por título/empresa (SQL `ILIKE %query%`)
- `limit` → máximo de resultados (default: 50)

**Response:**
```json
[
  {
    "id": "clxy123",
    "title": "Desenvolvedor Frontend React",
    "companyName": "Tech Corp",
    "level": "PLENO",
    "stack": ["react", "typescript", "next"],
    "location": "São Paulo, SP",
    "isRemote": false,
    "publishedAt": "2026-02-10T10:00:00Z",
    "source": "GUPY",
    "sourceUrl": "https://techcorp.gupy.io/jobs/123456",
    "createdAt": "2026-02-15T08:30:00Z"
  }
]
```

---

## 🎨 Frontend Integration

**Componente:** `app/components/dashboard/CuratedJobCard.tsx`

### Elementos obrigatórios

```tsx
<div className="job-card">
  <h3>{job.title}</h3>
  <p>{job.companyName}</p>
  <div className="tags">
    {job.stack.map(tech => <span key={tech}>{tech}</span>)}
  </div>
  
  {/* ✅ COMPLIANCE: Sempre redirecionar para fonte original */}
  <a 
    href={job.sourceUrl} 
    target="_blank" 
    rel="noopener noreferrer"
  >
    Ver vaga completa no site original →
  </a>
  
  {/* ✅ Crédito à fonte */}
  <small>Fonte: {sourceLabel[job.source]}</small>
</div>
```

**Mapeamentos de label:**
```typescript
const levelLabel = {
  ESTAGIO: "Estágio",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  OUTRO: "Outro"
};

const sourceLabel = {
  GUPY: "Gupy",
  COMPANY_SITE: "Site da Empresa"
};
```

---

## ⚙️ Setup

### 1. Environment Variables

```env
# .env
DATABASE_URL="postgresql://..."
JOBS_BOOTSTRAP_SECRET="your-random-secret-256-bits"

# Conectores opcionais (default: false)
JOBS_CONNECTOR_REMOTIVE="false"
JOBS_CONNECTOR_REMOTEOK="false"
JOBS_CONNECTOR_PROGRAMATHOR="false"
JOBS_CONNECTOR_TRAMPOS="false"
CRON_SECRET="defina-um-segredo-forte"
```

### 1.1 Conectores disponíveis

- `Gupy` (sempre ativo no bootstrap)
- `Remotive` (opcional via `JOBS_CONNECTOR_REMOTIVE=true`)
- `RemoteOK` (opcional via `JOBS_CONNECTOR_REMOTEOK=true`)
- `ProgramaThor` (opcional via `JOBS_CONNECTOR_PROGRAMATHOR=true`)
- `Trampos` (opcional via `JOBS_CONNECTOR_TRAMPOS=true`)

Todos seguem a mesma regra de compliance da Gupy: apenas metadados + redirecionamento para URL original.

### 1.2 Curadoria semanal automática

O projeto está preparado para rodar ingestão semanal via `vercel.json`:

- Path: `/api/jobs/bootstrap`
- Schedule: `0 9 * * 1` (toda segunda-feira, 09:00 UTC)

Para autenticação automática, configure `CRON_SECRET` no ambiente de deploy.
O endpoint aceita `Authorization: Bearer <CRON_SECRET>` (cron) e também `x-bootstrap-secret` (manual).

### 2. Database Migration

```bash
npx prisma generate
npx prisma migrate dev --name add-jobs-phase1
```

### 3. Bootstrap (primeira carga)

```bash
curl -X POST http://localhost:3000/api/jobs/bootstrap \
  -H "x-bootstrap-secret: your-secret-here"
```

### 4. Frontend (consumir API)

```tsx
// app/page.tsx
import { prisma } from '@/app/lib/prisma';

export default async function DashboardPage() {
  const jobs = await prisma.job.findMany({
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 10
  });

  return (
    <div>
      {jobs.map(job => (
        <CuratedJobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
```

---

## 📈 Próximas Fases

### Phase 2: Ingestion Recorrente
- Endpoint `POST /api/jobs/ingest` (protegido)
- Cron job (Vercel Cron ou GitHub Actions) a cada 3-6h
- Log em `JobIngestionLog` (timestamp, source, count, status)

### Phase 3: Qualidade de Dados
- Dicionário de sinônimos de stacks (React.js → React)
- Merge de vagas similares (mesmo fingerprint)
- Validação de URLs (check 404s)
- Filtros avançados de API (salary range, seniority combos)

### Phase 4: Múltiplas Fontes
- Conector LinkedIn (`sources/linkedin.ts`)
- Conector ATS/parcerias oficiais (`sources/partner-ats.ts`)
- Conector sites próprios (`sources/company-site.ts`)
- Rate limiting por fonte
- Circuit breakers para fontes instáveis

---

## ✅ Checklist de Compliance

Antes de cada novo conector:

- [ ] Extrai **apenas metadados públicos**
- [ ] **Não** salva descrição completa da vaga
- [ ] **Não** salva benefícios detalhados
- [ ] **Não** salva informações proprietárias
- [ ] Redireciona para `sourceUrl` original
- [ ] Exibe crédito à fonte (Gupy, LinkedIn, etc.)
- [ ] Respeita robots.txt (se scraping HTML)
- [ ] Rate limiting apropriado
- [ ] User-Agent identificável

---

## 🔍 Troubleshooting

### "Bootstrap retorna 0 vagas"
- Verificar se API da Gupy mudou estrutura
- Checar logs no console (`[Gupy] ...`)
- Testar URL manualmente: `https://portal.gupy.io/api/v1/jobs?sortBy=publishedDate&order=desc&page=1&limit=10`

### "Vagas duplicadas no banco"
- Verificar índice UNIQUE em `fingerprint`
- Confirmar que `dedupe.ts` está sendo usado
- Checar se `sourceUrl` é consistente (normalização de URL)

### "Nenhuma vaga tech aparece"
- Revisar `TECH_KEYWORDS` em `gupy.ts`
- Adicionar palavras faltantes
- Reduzir `EXCLUDE_KEYWORDS` se muito restritivo

### "API /jobs não retorna dados"
- Verificar se bootstrap foi executado
- Checar tabela `Job` no banco: `npx prisma studio`
- Verificar logs de erro no servidor

---

## 📝 Referências

- **Gupy Portal:** https://portal.gupy.io/job-search/sortBy=publishedDate
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Plano Técnico Completo:** [docs/scraping-vagas-plano-tecnico.md](./scraping-vagas-plano-tecnico.md)
