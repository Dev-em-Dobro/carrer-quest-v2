# LGPD - Operações de Dados (MVP)

## Endpoints

### Exportar dados do perfil

- Método: `POST`
- URL: `/api/profile`
- Body:

```json
{ "action": "export" }
```

Retorna snapshot com dados básicos do usuário autenticado e perfil.

### Limpar dados pessoais do perfil

- Método: `DELETE`
- URL: `/api/profile`

Remove dados pessoais do `UserProfile` (nome, links, cidade, resumo, experiências, stacks, certificações, idiomas e metadados de currículo), preservando apenas a conta de autenticação.

## Observações

- Ambos os endpoints exigem sessão autenticada.
- O fluxo de remoção total da conta (auth + sessões + contas OAuth) pode ser adicionado depois como etapa separada.
