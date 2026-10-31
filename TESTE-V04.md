# Roteiro de validação do ai-workflow-kit v0.4.0

Protótipo: `mini-tarefas` (CLI de tarefas, Node >= 18, sem dependências, `npm test` com 5 testes).
O kit v0.4.0 já está instalado (`.claude/`, `AGENTS.md`, `docs/`), com `gitEmail` definido no `.claude/workflow.json`.

Abra o Claude Code **nesta pasta** e siga os passos em ordem. Marque cada caixa.

## 0. Já verificado automaticamente (hooks)
- [x] `.mcp.json` com token literal: bloqueado; com `${VAR}`: liberado
- [x] `git commit` com email diferente do `gitEmail`: bloqueado; com o email certo: liberado
- [x] SessionStart avisa quando o email diverge do `gitEmail`
- [x] push na `main`: bloqueado

## 1. Sessão nova
- [ ] O início da sessão mostra `[workflow] branch: main ...`, o que confirma que o hook SessionStart rodou
- [ ] Pergunte: "quais comandos de teste este projeto usa?". Se a resposta vier do `AGENTS.md` sem você citá-lo, o `@AGENTS.md` está sendo lido (pendência da v0.3.2)

## 2. `/wf-init`: regra `[a confirmar]`
O `AGENTS.md` tem 7 `TODO(init)`. O README não diz para que serve o projeto nem a arquitetura.
- [ ] O que veio de arquivo é citado como fato (ex.: `npm test` lido do `package.json`)
- [ ] O que foi deduzido termina com `[a confirmar]` (ex.: propósito, convenções)
- [ ] O relatório final lista os `[a confirmar]` numerados

## 3. `/wf-spec`: suposições primeiro
Feature sugerida (pequena, com 3 ACs naturais):

    /wf-spec "remover tarefa pelo id (comando rm <id>), com erro claro para id inexistente"

- [ ] **Antes** de qualquer pergunta aparece a lista A1…An, com fonte (`said by user` / `read in <arquivo>` / `guess`)
- [ ] Nenhuma pergunta é sobre algo já marcado `read in`
- [ ] `docs/specs/001-*/spec.md` tem a tabela *Assumptions* no topo, com status por item
- [ ] Aprove a spec

## 4. `/wf-plan` e `/wf-build`
- [ ] Rode `/wf-plan`, aprove, e depois `/wf-build` até todas as tarefas fecharem (teste primeiro)
- [ ] O build cria uma branch (`feat/...`), porque o guard bloqueia commit direto na `main`? Se ele tentar push na `main`, deve ser barrado

## 5. `/wf-review`: `arquivo:linha` (critério de pronta da v0.4)
- [ ] A tabela do eixo Spec tem colunas `AC | implemented at | tested at | status`
- [ ] Todo AC tem `path:line` nas duas colunas (ex.: `src/tasks.js:18`, `test/tasks.test.js:30`)
- [ ] O fim mostra `AC covered: n/total`, com n = total

## 6. Prova negativa
Apague (sem commitar) o teste de um dos ACs, por exemplo o de id inexistente, e rode `/wf-review` de novo.
- [ ] Esse AC sai como `not covered`, com severidade major ou blocker
- [ ] `AC covered` cai para n-1/total
- [ ] Restaure o teste: `git checkout -- test/`

## Resultado
A v0.4.0 está validada quando os passos 5 e 6 passam. Falhou algo? Anote o passo e a saída: o ajuste vai para uma v0.4.1.
