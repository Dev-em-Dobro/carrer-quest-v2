# CareerQuest (MVP)

Hub de oportunidades para estudantes e iniciantes em tecnologia, com foco em vagas de entrada (estágio/júnior), análise de aderência por skills e ingestão automática de vagas.

## Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL
- Better Auth (email/senha + social)

## Funcionalidades implementadas

- Autenticação:
	- login/cadastro com email/senha
	- login social (Google/LinkedIn, quando configurado)
- Dashboard e perfil:
	- upload de currículo em PDF
	- extração de dados para preencher perfil
	- status de aptidão e gap de skills
- Job Board:
	- listagem de vagas com filtros
	- modelo de trabalho (remoto/híbrido/presencial)
	- paginação e ordenação
- Ingestão de vagas:
	- conectores Gupy, Remotive, RemoteOK, ProgramaThor, Trampos e Adzuna
	- deduplicação por fingerprint
	- bootstrap protegido por segredo
	- endpoint de webhook para automação externa (n8n/Make)
- LGPD (MVP):
	- exportação de dados de perfil
	- limpeza de dados pessoais do perfil
- Telas MVP adicionais:
	- `/assessments`
	- `/analytics`

## Estrutura de rotas principais

- `/` Dashboard
- `/jobs` Job Board
- `/perfil` Perfil
- `/assessments` Skill Assessments
- `/analytics` Analytics
- `/login` Login
- `/cadastro` Cadastro

## Setup local

1. Instalar dependências:

```bash
npm install
```

2. Configurar `.env` com, no mínimo:

```env
DATABASE_URL="postgresql://..."

BETTER_AUTH_SECRET="segredo-forte"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

JOBS_BOOTSTRAP_SECRET="seu-segredo-bootstrap"
CRON_SECRET="seu-segredo-cron"

# Conectores opcionais
JOBS_CONNECTOR_REMOTIVE="false"
JOBS_CONNECTOR_REMOTEOK="false"
JOBS_CONNECTOR_PROGRAMATHOR="false"
JOBS_CONNECTOR_TRAMPOS="false"
JOBS_CONNECTOR_ADZUNA="false"

# Adzuna (obrigatório se JOBS_CONNECTOR_ADZUNA=true)
ADZUNA_APP_ID="..."
ADZUNA_APP_KEY="..."
ADZUNA_COUNTRY="br"
ADZUNA_WHERE=""
ADZUNA_WHAT="software developer"
ADZUNA_WHAT_EXCLUDE=""

# Social login (opcional)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
LINKEDIN_CLIENT_ID="..."
LINKEDIN_CLIENT_SECRET="..."
```

3. Preparar banco:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Subir app:

```bash
npm run dev
```

## Comandos úteis

- Rodar bootstrap de vagas via API local:

```bash
curl -X POST http://localhost:3000/api/jobs/bootstrap \
	-H "x-bootstrap-secret: $JOBS_BOOTSTRAP_SECRET"
```

- Ver Prisma Studio:

```bash
npm run prisma:studio
```

## Troubleshooting

- Erro de lock no Next (`.next/dev/lock`):

```bash
pkill -f "next dev" || true
rm -f .next/dev/lock
npm run dev
```

- Se houver conflito de porta 3000:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
```

## Documentação interna

- `docs/prd.md` — PRD do produto
- `docs/jobs-scraping-implementation.md` — pipeline de ingestão
- `docs/jobs-webhook-contract.md` — contrato do webhook
- `docs/lgpd-operations.md` — operações LGPD MVP
