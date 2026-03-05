# The Reviewer — Documento de Projeto

> Aplicação desktop local para revisão de documentos por personas treinadas com estilo e preferências reais de revisores.

---

## 1) Visão Geral

**The Reviewer** é uma aplicação desktop que permite ao usuário criar **personas de revisores** (ex: chefe, cliente, professor) treinadas com exemplos reais de documentos e instruções de estilo. O usuário submete um documento e a persona o **reescreve/edita** conforme o estilo esperado pelo revisor simulado.

Tudo roda **100% local** via [Ollama](https://ollama.com).

---

## 2) Problema que Resolve

Antes de entregar um documento importante, o usuário precisa antecipar como o revisor reagirá e o que ele mudaria. Hoje isso exige esperar pelo feedback real ou tentar imaginar sozinho.

**The Reviewer** simula esse feedback antecipando a revisão com base no histórico e preferências do revisor.

---

## 3) Stack

| Camada       | Tecnologia                        |
|--------------|-----------------------------------|
| Desktop shell | [Tauri v2](https://tauri.app)    |
| Frontend     | React + TypeScript                |
| Estilo UI    | Tailwind CSS                      |
| State        | Zustand                           |
| LLM local    | Ollama (via SDK JS oficial)       |
| Persistência | Sistema de arquivos local (JSON)  |
| Testes (FE)  | Vitest + Testing Library          |
| Testes (BE)  | Rust built-in tests               |
| Linter/fmt   | ESLint + Prettier + rustfmt       |
| CI           | GitHub Actions                    |

> O backend Tauri (Rust) é responsável apenas por I/O: leitura/escrita de arquivos e chamadas ao sistema. A lógica de negócio fica no frontend TypeScript, testável via Vitest.

---

## 4) Conceitos do Domínio

### 4.1 Persona
Representa um revisor real simulado.

```
Persona {
  id: string (uuid)
  name: string
  description: string         // quem é essa pessoa
  systemPrompt: string        // instrução base gerada a partir de regras + exemplos
  rules: Rule[]               // regras de estilo explícitas (manual ou geradas por IA)
  examples: Example[]         // pares (documento original → revisado)
  model: string               // modelo Ollama a usar (ex: llama3.2)
  createdAt: string
  updatedAt: string
}
```

### 4.2 Rule (regra de estilo)
```
Rule {
  id: string
  text: string        // ex: "Nunca use voz passiva"
  source: "manual" | "generated"   // se foi escrita pelo usuário ou gerada pela IA
}
```

### 4.3 Example (par de treinamento)
```
Example {
  id: string
  original: string    // documento antes da revisão
  revised: string     // documento como o revisor escreveria
  notes: string       // observações opcionais sobre o estilo
}
```

### 4.3 Review
```
Review {
  id: string
  personaId: string
  inputDocument: string
  outputDocument: string
  createdAt: string
}
```

---

## 5) Estrutura de Pastas

```
the-reviewer/
├── src-tauri/                  # Backend Rust (Tauri)
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands/
│   │   │   ├── persona.rs      # CRUD de personas no filesystem
│   │   │   └── review.rs       # salvar/listar reviews
│   │   └── fs/
│   │       └── storage.rs      # leitura/escrita JSON
│   └── Cargo.toml
├── src/                        # Frontend React + TS
│   ├── main.tsx
│   ├── App.tsx
│   ├── domain/
│   │   ├── persona.ts          # tipos + validações do domínio (Persona, Rule, Example)
│   │   ├── review.ts
│   │   └── prompt.ts           # buildSystemPrompt: descrição + regras + exemplos
│   ├── services/
│   │   ├── ollamaService.ts    # integração com Ollama SDK (review + análise de estilo)
│   │   └── personaService.ts   # chamadas aos commands Tauri
│   ├── store/
│   │   ├── personaStore.ts     # Zustand: estado de personas
│   │   └── reviewStore.ts      # Zustand: estado de reviews
│   ├── components/
│   │   ├── personas/
│   │   │   ├── PersonaList.tsx
│   │   │   ├── PersonaForm.tsx
│   │   │   ├── RulesEditor.tsx         # adicionar/editar/remover regras manuais
│   │   │   ├── GeneratedRulesModal.tsx # confirmação de regras geradas por IA
│   │   │   └── ExampleEditor.tsx
│   │   └── review/
│   │       ├── DocumentInput.tsx
│   │       ├── ReviewResult.tsx
│   │       └── DiffViewer.tsx
│   ├── pages/
│   │   ├── PersonasPage.tsx
│   │   └── ReviewPage.tsx
│   └── __tests__/
│       ├── domain/
│       └── services/
├── agents.md
├── project.md
└── package.json
```

---

## 6) Fluxos Principais

### 6.1 Criar Persona

```
Usuário
  │
  ├─ Acessa "Personas" → clica "Nova Persona"
  │
  ├─ Preenche:
  │     - Nome (ex: "Chefe Rafael")
  │     - Descrição (ex: "Gosta de textos objetivos, sem jargões, com bullet points")
  │     - Modelo Ollama (ex: llama3.2)
  │
  ├─ Adiciona exemplos (opcional mas recomendado):
  │     - Cola documento original
  │     - Cola como o revisor reescreveria
  │     - Adiciona notas de estilo
  │
  ├─ Clica "Salvar"
  │
  └─ Sistema:
        - Valida campos obrigatórios
        - Gera systemPrompt a partir da descrição + exemplos
        - Persiste persona em JSON via Tauri command
        - Redireciona para lista de personas
```

### 6.2 Revisar Documento

```
Usuário
  │
  ├─ Acessa "Revisar"
  │
  ├─ Seleciona uma persona da lista
  │
  ├─ Cola ou carrega o documento a ser revisado
  │
  ├─ Clica "Revisar"
  │
  └─ Sistema:
        - Valida documento (não vazio, tamanho máximo)
        - Monta prompt: systemPrompt da persona + exemplos few-shot + documento
        - Envia para Ollama via SDK (streaming)
        - Exibe resultado em tempo real (streaming)
        - Ao finalizar: mostra diff (original vs revisado)
        - Salva review no histórico
```

### 6.3 Geração do System Prompt

```
buildSystemPrompt(persona: Persona): string

1. Começa com a descrição da persona
2. Se há regras:
   - Adiciona seção "REGRAS DE ESTILO" com cada regra em bullet
3. Se há exemplos:
   - Adiciona seção "EXEMPLOS" com cada par "ORIGINAL / REVISADO"
4. Instrução final:
   - "Revise o documento a seguir seguindo as regras e o estilo acima.
      Retorne apenas o documento revisado, sem comentários adicionais."
```

Exemplo gerado:
```
Você é Rafael, chefe de produto. Prefere textos diretos e sem jargões.

REGRAS DE ESTILO:
- Nunca use voz passiva
- Parágrafos com no máximo 3 linhas
- Substitua listas longas por bullet points
- Sempre termine com call-to-action

EXEMPLOS:

Exemplo 1:
ORIGINAL:
[texto original]

REVISADO:
[texto revisado]

Revise o documento a seguir seguindo as regras e o estilo acima.
Retorne apenas o documento revisado, sem comentários adicionais.
```

### 6.4 Gerenciar Regras de Estilo (manual)

```
Usuário (na tela de edição da persona)
  │
  ├─ Seção "Regras de Estilo"
  │
  ├─ Clica "Adicionar Regra"
  │     - Campo de texto livre (ex: "Nunca use voz passiva")
  │
  ├─ Pode editar ou remover regras existentes
  │     - Regras manuais têm badge "Manual"
  │     - Regras geradas por IA têm badge "Gerada por IA"
  │
  └─ Ao salvar persona: system prompt é regerado com todas as regras
```

### 6.5 Analisar Estilo e Gerar Regras (IA)

```
Usuário (na tela de edição da persona, após adicionar ≥ 1 exemplo)
  │
  ├─ Clica "Analisar Estilo com IA"
  │
  └─ Sistema:
        - Valida que há pelo menos 1 exemplo
        - Monta prompt de análise:
            "Analise os pares abaixo e extraia as regras de estilo aplicadas.
             Retorne uma lista objetiva de regras, uma por linha."
        - Envia ao Ollama (modelo da persona)
        - Exibe regras sugeridas numa modal de confirmação
        - Usuário pode:
            ✓ Aceitar todas
            ✓ Aceitar individualmente (checkbox por regra)
            ✗ Rejeitar individualmente
            ✎ Editar texto de cada regra antes de confirmar
        - Regras confirmadas são adicionadas à persona com source: "generated"
        - System prompt é regerado automaticamente
```

### 6.6 Gerenciar Exemplos de Treinamento

```
Usuário (na tela de edição da persona)
  │
  ├─ Clica "Adicionar Exemplo"
  │     - Campo: Documento original
  │     - Campo: Documento revisado
  │     - Campo: Notas (opcional)
  │
  ├─ Pode editar ou remover exemplos existentes
  │
  └─ Ao salvar persona: system prompt é regerado com todos os exemplos e regras
```

### 6.7 Histórico de Reviews

```
Usuário
  │
  ├─ Acessa histórico de uma persona
  │
  └─ Vê lista de reviews anteriores:
        - Data
        - Trecho do documento original
        - Botão para abrir review completo (original + revisado + diff)
```

---

## 7) Integração com Ollama

### 7.1 Requisitos
- Ollama instalado e rodando localmente (`http://localhost:11434`)
- Modelo escolhido já baixado (`ollama pull <model>`)

### 7.2 Contrato da chamada

```typescript
// services/ollamaService.ts
interface ReviewRequest {
  model: string
  systemPrompt: string
  document: string
}

interface ReviewResponse {
  text: string        // documento revisado completo
  done: boolean
}

// Usa streaming para exibir resultado em tempo real
async function* streamReview(req: ReviewRequest): AsyncGenerator<string>
```

### 7.3 Tratamento de erros
- Ollama offline → mensagem clara: "Ollama não está rodando. Inicie com `ollama serve`."
- Modelo não encontrado → mensagem: "Modelo X não encontrado. Execute `ollama pull X`."
- Timeout (> 60s sem resposta) → cancela e informa usuário
- Resposta vazia → informa usuário e não salva review

---

## 8) Persistência (Filesystem)

Dados salvos em JSON no diretório de dados do app (via Tauri `app_data_dir`):

```
~/.local/share/the-reviewer/    (Linux)
~/Library/Application Support/the-reviewer/   (macOS)
%APPDATA%\the-reviewer\         (Windows)

├── personas/
│   ├── <uuid>.json             # uma persona por arquivo
└── reviews/
    └── <uuid>.json             # um review por arquivo
```

### Operações Tauri (Rust commands)

| Command              | Descrição                        |
|----------------------|----------------------------------|
| `list_personas`      | Lista todas as personas          |
| `get_persona`        | Busca persona por ID             |
| `save_persona`       | Cria ou atualiza persona         |
| `delete_persona`     | Remove persona e seus reviews    |
| `save_review`        | Persiste um review               |
| `list_reviews`       | Lista reviews de uma persona     |

---

## 9) Segurança

- Validar tamanho máximo de documento (ex: 50.000 chars) antes de enviar ao Ollama
- Sanitizar paths antes de qualquer operação de filesystem (Tauri já previne path traversal, mas validar no Rust também)
- Nenhum dado enviado para fora da máquina
- Sem autenticação necessária (app local single-user)
- Não logar conteúdo de documentos

---

## 10) Roadmap de Entregas (Small Releases)

Cada milestone é deployável e testado de forma independente.

### M1 — Scaffold + CI
- [ ] Projeto Tauri + React + TypeScript inicializado
- [ ] Vitest configurado com teste de exemplo passando
- [ ] ESLint + Prettier configurados
- [ ] GitHub Actions: build + test no push

### M2 — Domínio de Personas
- [ ] Tipos `Persona` e `Example` definidos e testados
- [ ] `buildSystemPrompt()` implementada com testes (TDD)
- [ ] Validações de domínio testadas

### M3 — Persistência de Personas
- [ ] Commands Rust: `save_persona`, `get_persona`, `list_personas`, `delete_persona`
- [ ] Testes unitários Rust para storage
- [ ] `personaService.ts` mockando Tauri em testes

### M4 — UI de Personas
- [ ] `PersonasPage`: lista, criar, editar, deletar personas
- [ ] `RulesEditor`: adicionar/editar/remover regras manuais
- [ ] `ExampleEditor`: adicionar/remover exemplos de treinamento
- [ ] Testes de componente com Testing Library

### M5 — Integração Ollama
- [ ] `ollamaService.ts` com streaming para revisão
- [ ] `analyzeStyle()`: chamada ao Ollama para extrair regras dos exemplos
- [ ] `GeneratedRulesModal`: confirmação/edição das regras geradas
- [ ] Tratamento de erros (offline, modelo ausente, timeout)
- [ ] Testes com mock do Ollama SDK

### M6 — Fluxo de Revisão
- [ ] `ReviewPage`: selecionar persona, inserir documento, revisar
- [ ] Exibição em streaming do resultado
- [ ] `DiffViewer`: comparação visual original vs revisado
- [ ] Persistência do review no histórico

### M7 — Histórico e Polimento
- [ ] Histórico de reviews por persona
- [ ] Verificação de status do Ollama na inicialização
- [ ] UX: loading states, mensagens de erro amigáveis
- [ ] README de instalação e uso

---

## 11) Convenção de Commits

Seguindo `agents.md`:

```
add: persona domain types and validation
add: buildSystemPrompt with few-shot examples
test: persona domain edge cases
add: tauri commands for persona storage
add: ollama streaming service
fix: timeout handling on ollama response
refactor: extract prompt builder module
```

---

## 12) Definition of Done

Uma feature só está pronta quando (conforme `agents.md`):

1. Teste(s) cobrindo o comportamento (RED → GREEN)
2. Build compila localmente (`npm run tauri build` ou `npm run dev`)
3. Suite de testes passa (`npm run test`)
4. Linters passam (`npm run lint`)
5. CI passa
6. Erros tratados explicitamente
7. Sem dados sensíveis em logs
8. Documentação atualizada se muda contrato ou DX
9. Commit pequeno com uma única intenção
