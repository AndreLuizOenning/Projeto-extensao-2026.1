# Backend Holding Finance

## Variáveis de ambiente
Use `.env` baseado em `.env.example`.

Variáveis obrigatórias:
- `JWT_SECRET` (mínimo 32 caracteres)
- `ADMIN_INITIAL_PASSWORD` (mínimo 8 caracteres, usada apenas no seed inicial)

Variáveis recomendadas:

- `CORS_ORIGIN` (lista de origens permitidas separadas por vírgula, ex.: `http://localhost:5173,http://localhost:8080`)

## Mapeamento Frontend x Backend (compatibilidade inicial)
- `front/pages/login`: usa CPF/senha -> `POST /auth/login`.
- `front/pages/empresas` e `patrimonio`: CRUD empresa -> `/empresas`.
- `front/pages/entidades`: CRUD -> `/entidades`.
- `front/pages/lancamentos`: contas a pagar/receber -> `/titulos` + `/:id/baixas`.

## Inconsistências já identificadas
1. Front usa `empresaId`, `entidadeId`, `contaBancaria` (camelCase/string), backend usa chaves relacionais snake_case (`empresa_id`, `entidade_id`, `conta_bancaria_id`).
2. Front não possui cadastro formal de bancos/contas bancárias ainda.
3. Front permite exclusão de empresa sem regra de bloqueio; backend usa inativação.

## Execução
```bash
npm i
npm run migrate
npm run seed
npm run dev
```


## CORS local (frontend Vite)
Para o frontend local (`http://localhost:5173` ou `http://localhost:8080`) acessar o backend, configure no `.env`:

```env
CORS_ORIGIN=http://localhost:5173,http://localhost:8080
```

No ambiente de desenvolvimento, se `CORS_ORIGIN` não for definido, o backend libera automaticamente essas duas origens locais.
