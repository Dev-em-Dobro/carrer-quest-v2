# Contrato de Webhook de Vagas (Automação n8n/Make)

## Endpoint

- Método: `POST`
- URL: `/api/jobs/webhook`
- Headers:
  - `x-webhook-secret: <JOBS_WEBHOOK_SECRET>`
  - ou `Authorization: Bearer <JOBS_WEBHOOK_SECRET>`

> Fallback aceito: `JOBS_BOOTSTRAP_SECRET`.

---

## Payload esperado

```json
{
  "runId": "run_2026_02_17_001",
  "sentAt": "2026-02-17T13:00:00.000Z",
  "jobs": [
    {
      "title": "Desenvolvedor Frontend React",
      "companyName": "Empresa X",
      "sourceUrl": "https://empresa.com/vagas/123",
      "level": "Júnior",
      "stack": ["react", "typescript", "next"],
      "location": "São Paulo - SP",
      "publishedAt": "2026-02-17T10:30:00.000Z",
      "source": "OTHER",
      "externalId": "email-12345",
      "connectorName": "email-automation"
    }
  ]
}
```

---

## Campos

### Obrigatórios (por vaga)

- `title` (string)
- `companyName` (string)
- `sourceUrl` (URL válida)

### Opcionais (por vaga)

- `level` (string livre, normalizado internamente para enum)
- `stack` (array de strings ou string CSV)
- `location` (string)
- `publishedAt` (ISO string)
- `source` (`LINKEDIN` | `GUPY` | `COMPANY_SITE` | `OTHER`) — default: `OTHER`
- `externalId` (string)
- `connectorName` (string, apenas metadado de rastreio)

### Opcionais (top-level)

- `runId` (string)
- `sentAt` (ISO string)

---

## Regras de persistência

- Normalização automática de:
  - senioridade (`normalizeLevel`)
  - stack (`normalizeStack`)
  - localização/remoto (`normalizeLocation`)
- Deduplicação por `fingerprint` (`title + company + sourceUrl`)
- Se `source + externalId` já existir, atualiza esse registro
- Retorno com contadores: `receivedCount`, `insertedCount`, `updatedCount`, `skippedCount`

---

## Exemplo cURL

```bash
curl -X POST "https://SEU_DOMINIO/api/jobs/webhook" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: SEU_JOBS_WEBHOOK_SECRET" \
  -d '{
    "runId": "run_001",
    "jobs": [
      {
        "title": "Estágio em Frontend",
        "companyName": "Tech Co",
        "sourceUrl": "https://techco.com/jobs/estagio-frontend",
        "level": "Estágio",
        "stack": ["react", "typescript"],
        "location": "Remoto",
        "source": "OTHER",
        "externalId": "mail-987"
      }
    ]
  }'
```
