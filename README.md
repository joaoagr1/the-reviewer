# The Reviewer

Aplicação desktop local para revisão de documentos por **personas treinadas** com estilo e preferências reais de revisores. Tudo roda 100% local via [Ollama](https://ollama.com).

## Como funciona

1. Crie uma **persona** (ex: "Chefe Rafael") com descrição do estilo dele
2. Adicione exemplos de documentos que ele já revisou (original → revisado)
3. Opcionalmente, use "Analisar Estilo com IA" para gerar regras automaticamente
4. Submeta um documento novo — a persona o reescreve no estilo esperado

## Pré-requisitos

- [Node.js](https://nodejs.org) v20+
- [pnpm](https://pnpm.io) v10+
- [Rust](https://rustup.rs) (toolchain estável)
- [Ollama](https://ollama.com) instalado e rodando

### Dependências do sistema (Linux)

```bash
sudo apt install -y libglib2.0-dev libgtk-3-dev libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev libwebkit2gtk-4.1-dev
```

## Instalação

```bash
# Clone o repositório
git clone https://github.com/joaoagr1/the-reviewer.git
cd the-reviewer

# Instale as dependências
pnpm install
```

## Executar em desenvolvimento

```bash
# Em um terminal: inicie o Ollama
ollama serve

# Baixe um modelo (se ainda não tiver)
ollama pull llama3.2

# Em outro terminal: inicie o app
pnpm tauri dev
```

## Build para produção

```bash
pnpm tauri build
```

O binário gerado estará em `src-tauri/target/release/`.

## Executar testes

```bash
# Testes frontend (Vitest)
pnpm test

# Testes backend (Rust)
cd src-tauri && cargo test

# Cobertura
pnpm test:coverage
```

## Stack

| Camada | Tecnologia |
|---|---|
| Desktop | Tauri v2 |
| Frontend | React + TypeScript + Tailwind CSS |
| Estado | Zustand |
| LLM | Ollama (local) |
| Persistência | Filesystem JSON |
| Testes | Vitest + Testing Library + Rust tests |

## Dados salvos

Os dados são salvos localmente em:

- **Linux:** `~/.local/share/the-reviewer/`
- **macOS:** `~/Library/Application Support/the-reviewer/`
- **Windows:** `%APPDATA%\the-reviewer\`
