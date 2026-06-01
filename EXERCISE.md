## Repo → https://github.com/caio-moloni-qa/BeeTees-playwright-training

Objetivo do programa

- Exercitar uma implementação ponta-a-ponta com mentalidade de **QA Engineer global**
- Evoluir pensamento crítico, estratégia de qualidade e estrutura de automação
- Garantir cobertura de fluxos migrados (**React.js**).
- Implementar **CI/CD** para os testes de Playwright

## Antes de começar (pré-requisitos obrigatórios)

1. Ler e executar o setup do projeto ([README.md](http://README.md))
2. Estudar as regras de negócio em `mcps/rules/BUSINESS_RULES.md`
3. Revisar specs e padrões existentes em `playwright/tests/`
4. Fazer um ciclo de **black box testing** na nova arquitetura/aplicação
5. Explorar o código (React) e entender como/onde inserir `data-test-id`
6. Entender o uso atual do banco (migrations, seed, setup)

## Expectativas gerais

### Qualidade e postura técnica

- Decisões justificadas (por que esses cenários? por que essa abordagem?)
- Clareza na comunicação (README/descrição da estratégia e do raciocínio)
- Organização do repositório e consistência com padrões existentes
- Testes confiáveis (estáveis, determinísticos, com assertions objetivas)

### Critérios mínimos de aceite (Definition of Done)

- O projeto roda localmente com o fluxo recomendado (incluindo DB quando aplicável)
- Os testes criados:
    - Passam localmente de forma consistente
    - Estão organizados e legíveis
    - Possuem comentários/contexto quando necessário
    - Cobrem pelo menos 1 fluxo crítico **pós-migration**
- A entrega descreve:
    - Estratégia utilizada
    - Cenários priorizados e justificativa
    - Melhorias arquiteturais feitas (se houver)
    - Principais dificuldades e aprendizados

## Desafio 1 — Novos testes automatizados (Playwright)

### Objetivo

Criar novos testes automatizados em **Playwright** para cobrir fluxos críticos não cobertos, principalmente em telas/fluxos migrados para **React.js**.

### O que se espera que você faça

- Mapear fluxos existentes e o comportamento atual (incluindo regras de negócio)
- Identificar lacunas de cobertura e priorizar cenários críticos
- Implementar testes:
    - ✅ Fluxos positivos
    - ❌ Fluxos negativos
    - 🖥️ Validações de UI
    - 💾 Persistência de dados (quando aplicável)
    - 📋 Regras de negócio relevantes
    - 🔗 Integração frontend/backend (quando fizer sentido)
- Reutilizar estrutura existente (fixtures/helpers/page objects), evitando duplicação
- Propor e aplicar melhorias na arquitetura de automação quando necessário

### Entregáveis esperados (D1)

- Novos testes implementados (código)
- Descrição da estratégia (ex.: pirâmide de testes, critérios de priorização, risco)
- Lista de cenários adicionados e motivação (impacto/risco/frequência)
- Melhorias arquiteturais realizadas (com racional e impacto)
- Evidências mínimas:
    - Como rodar os testes (comandos)
    - Resultados locais (ex.: reporte/print/log conforme padrão do projeto)

### Critérios de avaliação (D1)

- Relevância dos cenários escolhidos (foco em criticidade)
- Robustez (flakiness baixo, waits adequados, assertions boas)
- Legibilidade/manutenibilidade (padrões, nomes, estrutura)
- Uso correto de seletores (preferência por `data-test-id`)
- Aderência às regras de negócio e comportamento real da aplicação

## Desafio 2 — CI/CD com GitHub Actions

### Objetivo

Integrar os testes Playwright em uma **pipeline de CI/CD** via GitHub Actions, gerando relatórios e atuando como barreira de qualidade em pushes e pull requests.

### Regras importantes

- Usar os scripts existentes no `package.json` como padrão oficial:
    - `test` → `playwright test`
    - `test:ui` → `playwright test --ui`
    - `test:headed` → `playwright test --headed`
    - `test:report` → `playwright show-report`
- A workflow deve ser criada em `.github/workflows/` com nome `playwright-tests.yml`

### O que a pipeline precisa fazer

- Rodar automaticamente em:
    - `push` (branches conforme estratégia definida)
    - `pull_request` (abertura e atualizações)
- Preparar ambiente:
    - Node.js
    - Instalar dependências (`npm install`)
    - Instalar browsers do Playwright (quando necessário)
    - Configurar variáveis de ambiente necessárias
- Preparar banco:
    - `npm run db:migrate`
    - `npm run db:seed`
    - `npm run db:setup` (se adotado como padrão)
- Subir aplicação:
    - `npm run dev:all` (API :3001, UI :5173)
- Executar testes Playwright via scripts do `package.json`
- Publicar resultados:
    - Relatórios como **artifact** para download após execução
    - Logs claros em caso de falha (para facilitar triagem)

### Entregáveis esperados (D2)

- Workflow funcional no GitHub Actions
- Execução automatizada em PR/push conforme definido
- Artifact com relatório (Playwright report)
- Documentação curta:
    - Como funciona o gatilho (branches/eventos)
    - Como acessar o relatório/artifact
    - Observações de ambiente (ex.: variáveis, dependências)

### Critérios de avaliação (D2)

- Pipeline confiável (reprodutível, com etapas bem definidas)
- Aderência aos scripts oficiais do projeto (sem comandos “paralelos” desnecessários)
- Diagnóstico facilitado (logs + artifacts)
- Barreira de qualidade efetiva (falhas bloqueiam/alertam antes do merge)

## Organização da entrega

### Branch de trabalho

- Entregar na branch:

`feature/migration-scenarios-worflows-NOME_DO_ALUNO`

### O que deve estar claro no PR

- Resumo do que foi feito (testes + CI)
- Cenários adicionados (lista)
- Como rodar localmente
- Como validar no CI (o que esperar da execução)

## Bônus (opcional)

- Execução em múltiplos browsers
- Paralelismo
- Cache de dependências
- Retry automático (com justificativa)
- Integração com Allure
- Publicar relatório via GitHub Pages
- Notificações (Slack/Teams)
- Agendamento com cron