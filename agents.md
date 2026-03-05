Guidelines for AI agents collaborating on this repository.

Este projeto usa **IA como parceira de pair programming**, não como gerador autônomo de sistemas.
O objetivo é **software em qualidade de produção**, não protótipos.

- A IA atua como **driver** (implementa código + testes + refactors pequenos).
- O humano atua como **navigator** (arquitetura, prioridades, produto, correções e decisões finais).

> Regra de ouro: **nenhuma mudança entra sem testes e sem passar no CI**.

---

## 1) Princípios (XP + IA)

### 1.1 IA é Pair Programmer (não arquiteta sozinha)
A IA:
- implementa detalhes e testes
- sugere alternativas simples
- faz refactoring incremental

A IA **não pode**:
- tomar decisões arquiteturais grandes sozinha
- introduzir frameworks, camadas, “plataformas internas”, ou reestruturar o repo por “higiene”

Se a solução parecer complexa, **proponha a versão mais simples primeiro** e aponte riscos.

### 1.2 Extreme Programming (XP) obrigatório
Práticas mandatórias:
- **TDD**
- **Small releases**
- **Continuous Integration**
- **Continuous refactoring**
- **Simple design**
- **Pair programming**

---

## 2) Definição de Pronto (DoD)

Uma alteração só está pronta quando:
1. Há teste(s) cobrindo o comportamento novo/alterado (RED → GREEN).
2. Build compila e roda localmente.
3. Suite de testes passa.
4. Linters/formatters passam.
5. CI passa.
6. Erros são tratados (sem falhas silenciosas).
7. Logs/telemetria mínima quando aplicável.
8. Documentação atualizada se muda uso, contrato, arquitetura ou DX.
9. Mudança é pequena o suficiente para reverter isoladamente.

---

## 3) Workflow (sempre)

### 3.1 TDD (ciclo obrigatório)
1) **RED**: escreva um teste que falha
2) **GREEN**: implemente o mínimo para passar
3) **REFACTOR**: melhore o design mantendo testes verdes

Nunca implemente “feature grande” sem testes.

### 3.2 Commits pequenos (Small Releases)
Cada commit deve:
- compilar
- passar testes
- passar CI
- ser deployável
- ter **uma intenção**

Evitar commits gigantes com múltiplas preocupações.

### 3.3 Integrações: finas e testáveis
- Coloque I/O (rede, FS, DB, APIs) na borda.
- O domínio deve ser **determinístico** e fácil de testar.
- Integrações devem ter: **timeouts**, validação, limites e tratamento de erro.

---

## 4) Design de Código

### 4.1 Preferir simplicidade
Evitar:
- abstrações desnecessárias
- otimização prematura
- state machines complexas sem necessidade
- “arquitetura para o futuro”

Preferir:
- funções pequenas
- lógica explícita
- módulos coesos
- legibilidade > esperteza

### 4.2 Tamanho de arquivos
Guidelines:
- < 200 linhas: ideal
- < 400 linhas: aceitável
- ≥ 500 linhas: **refatorar**

### 4.3 Composição > herança
Use composição, DI simples, funções reutilizáveis.
Traits/interfaces só com 2+ implementações reais (ou motivo claro de testes).

---

## 5) Testes

### 5.1 Requisitos
- Todo comportamento novo deve ter teste.
- Correção de bug: teste que falha antes, passa depois.
- Testes determinísticos (sem depender de rede/tempo real sem controle).

### 5.2 Pirâmide recomendada
1) Unit (maioria)
2) Service/Component
3) Integration (mínimo necessário)
E2E só quando indispensável.

### 5.3 Cobertura
Metas recomendadas:
- Regra de negócio: **≥ 90%**
- Bordas de integração: foco em contratos e cenários críticos

> Cobertura não é fetiche: cobre edge cases reais.

---

## 6) Erros, Logs e Observabilidade

### 6.1 Erros
- Nunca engolir erro silenciosamente.
- Operações externas devem retornar erros explícitos.
- Mensagens para usuário devem ser “human-friendly” na camada correta.

### 6.2 Logs
Logs devem incluir:
- operação
- identificadores relevantes
- motivo de falha

Evitar logs excessivos e dados sensíveis.

### 6.3 Observabilidade mínima (quando aplicável)
- rastrear falhas
- rastrear retries
- medir latência de fluxos críticos

---

## 7) Segurança (não negociável)

Verificar sempre:
- validação de input
- injection (SQL/command/template)
- path traversal
- unsafe file ops
- limites (tamanho/tempo)
- defaults seguros

Nunca confie em input externo.

---

## 8) Convenção de commits

Formato:
`<type>: <short description>`

Tipos:
- add: new feature
- fix: bug fix
- refactor: internal improvement
- test: tests added or improved
- docs: documentation changes
- chore: maintenance tasks
- security: security fixes
- infra: deployment or infrastructure

Exemplos:
- `add: agent persona storage`
- `fix: response parsing bug`
- `refactor: extract prompt builder`
- `test: add style transformation tests`
- `security: sanitize user input`

---

## 9) Code Review (auto-check do agente)

Antes de finalizar:
- [ ] Existe teste cobrindo a mudança?
- [ ] A solução é a mais simples possível?
- [ ] Segue padrões do repo?
- [ ] Não introduziu duplicação óbvia?
- [ ] Tratou erros e limites?
- [ ] CI deve passar?

---

## 10) Anti-patterns (proibidos)
- gerar sistema inteiro num “one-shot”
- escrever feature sem testes
- refatorar gigante sem testes
- “arquitetura especulativa”
- falhas silenciosas
- arquivos gigantes

---

## 11) Regra final
Prioridade:
1) correção
2) simplicidade
3) testabilidade
4) manutenibilidade

Velocidade vem do processo: **TDD + commits pequenos + CI verde**.
```