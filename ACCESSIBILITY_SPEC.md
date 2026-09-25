# Especificação de Acessibilidade Mobile — Vez de Ler

> Complementa a spec funcional do app (organizador de escalas). Define os requisitos de acessibilidade que `organizador.html` precisa atender, com foco em uso no celular (toque, leitor de tela móvel, zoom).
>
> **Padrão de referência:** WCAG 2.1, nível AA, mais as recomendações de alvo de toque do WCAG 2.5.5 (44×44px). Testado com VoiceOver (iOS) e TalkBack (Android), que são os leitores de tela reais que a comunidade vai usar.

#react #frontend #acessibilidade #mobile

---

# Diagnóstico do arquivo atual

Revisão de `organizador.html` (827 linhas, React via Babel standalone + jsPDF, sem build step). Achados concretos, do mais crítico ao menos crítico:

1. **Documento HTML incompleto.** O arquivo começa direto em `<div id="root">`, sem `<!DOCTYPE html>`, `<html lang="pt-BR">`, `<head>`, `<title>` ou `<meta name="viewport">`. Sem a meta viewport, o celular renderiza a página como se fosse desktop (~980px) e o usuário precisa dar zoom manual para tudo — isso sozinho já quebra o objetivo de "focado para celular".
2. **Nenhum estilo de foco visível.** O CSS não tem uma única regra `:focus` ou `:focus-visible` em todo o arquivo. Quem navega por teclado (ou usa teclado bluetooth no celular) não vê onde está o foco.
3. **Rótulos não associados aos campos.** Todo `<label>` é solto — sem `htmlFor` apontando para um `id` no input/select correspondente. Leitor de tela não anuncia "Mês" ao focar o select de mês, por exemplo; só lê o valor.
4. **Célula editável da tabela não é operável por teclado.** `<span className="cell-editable" onClick={...}>` (linhas ~767, 790, 806) só responde a clique/toque de mouse. Não tem `role="button"`, `tabIndex`, nem `onKeyDown` para Enter/Espaço — quem usa teclado ou leitor de tela não consegue trocar um nome escalado.
5. **Estado dos botões de dia da semana não é anunciado.** Os botões `.wd-btn` (linha 616) mudam de cor quando ativos, mas não têm `aria-pressed`. Leitor de tela não sabe se "Dom" está selecionado ou não — e a distinção depende só de cor (ver item 8).
6. **Tabela sem semântica de cabeçalho.** `<th>` sem `scope="col"` e sem `<caption>`. Em uma tabela rolável horizontalmente (`.table-scroll`), isso dificulta a leitura por leitor de tela linha a linha.
7. **Sem feedback de estado para leitor de tela.** Sortear o cronograma, trocar um nome numa célula ou gerar o PDF não anuncia nada (`aria-live` ausente). Quem não vê a tela não sabe se a ação aconteceu.
8. **`aria-label="Remover"` genérico.** Os botões de remover chip (linhas 663, 692, 717) usam sempre o mesmo texto "Remover", sem o nome da pessoa. Com vários chips, o leitor de tela não diferencia qual "Remover" está sendo ativado.
9. **Contraste de cor insuficiente em pontos específicos** (calculado sobre as variáveis CSS do arquivo):
   - Texto verde do "kicker" (`--green #52B947` sobre branco, 12.5px bold): **~2,5:1** — precisa de 4,5:1.
   - Número dentro do círculo dourado dos títulos de seção (`--white` sobre `--gold #F5A81C`, 12px): **~2,0:1** — precisa de 4,5:1 (ou 3:1 se tratado como puramente decorativo, o que não é o caso aqui, pois carrega o número do passo).
   - Texto branco do botão primário (`--white` sobre `--blue #0086C3`, 15px bold): **~4,0:1** — abaixo de 4,5:1 (só dispensaria com 18,66px bold ou mais).
10. **Nenhum motivo explicado para o botão desabilitado.** "Sortear cronograma" fica `disabled` sem `aria-describedby` apontando para a dica ("Adicione datas, leitores..."), então quem usa leitor de tela só ouve "desabilitado", sem saber o quê falta.
11. **Grupo de dias da semana sem agrupamento semântico.** É uma lista de botões soltos, não um `<fieldset>`/`<legend>` nem um grupo com `role="group"` + `aria-label`, então leitor de tela não anuncia que pertencem a "Dias da semana com celebração".

---

# Requisitos de acessibilidade

## 1. Documento e metadados — **Crítico**

- Envolver o conteúdo em `<!DOCTYPE html><html lang="pt-BR"><head>...</head><body>`.
- `<meta charset="utf-8">` e `<meta name="viewport" content="width=device-width, initial-scale=1">` — **sem** `maximum-scale` ou `user-scalable=no` (isso bloquearia o zoom, que é uma necessidade de acessibilidade).
- `<title>` descritivo (ex.: "Vez de Ler — Organizador de Escalas").

## 2. Estrutura semântica — **Alto**

- Um único `<h1>` (o "Vez de Ler" do masthead); os títulos de cada card viram `<h2>` (já são, manter).
- Envolver o masthead em `<header>` e o conteúdo principal em `<main>`.
- A lista de datas (`.datelist`) e a lista de chips já usam `<ul>`/`<span>` — trocar os chips de `<span>` solto por `<ul><li>` quando representam uma coleção (leitores, ministros, celebrantes), para leitor de tela anunciar "lista com N itens".
- Agrupar os botões de dia da semana em `<fieldset>` + `<legend>` (ou `role="group"` + `aria-labelledby`) associado ao texto "Dias da semana com celebração".

## 3. Formulários e rótulos — **Crítico**

- Todo `<label>` recebe `htmlFor="algum-id"` e o campo correspondente recebe esse `id`. Aplica-se a: nome da igreja, mês, ano, adicionar leitor/ministro/celebrante, leitores por celebração, ministros por celebração, data avulsa.
- Campos numéricos (`leitoresPorCel`, `ministrosPorCel`, `ano`) mantêm `min`/`max` já existentes e ganham `aria-valuemin`/`aria-valuemax` implícitos do próprio `type="number"` — não precisa de nada extra além do `label` associado.
- Placeholder nunca substitui `label` (já não substitui hoje — manter assim).

## 4. Navegação por teclado — **Crítico**

- Todo elemento interativo (chips de remover, célula editável, botão de dia da semana, linha de data) precisa ser alcançável via `Tab` e operável via `Enter`/`Espaço`, sem depender de clique de mouse.
- Trocar `<span className="cell-editable" onClick>` por `<button type="button" className="cell-editable">` (ou `<span role="button" tabIndex={0} onKeyDown={...}>` se não puder ser `<button>` por causa do layout inline). O `<select>` que aparece ao editar já é nativamente acessível — o problema é só chegar até ele.
- Adicionar `:focus-visible` global no CSS com contorno visível (mín. 2px, contraste ≥3:1 contra o fundo adjacente) para todo `button`, `input`, `select`, `a`, e os elementos com `role="button"` adicionados acima.
- Ordem de tabulação deve seguir a ordem visual (passos 1→5); nenhum `tabIndex` positivo customizado.

## 5. Leitores de tela / ARIA — **Alto**

- `aria-pressed={diasSelecionados.has(i)}` em cada `.wd-btn`.
- Região `aria-live="polite"` (pode ser um `<div>` visualmente oculto) que anuncia: "Cronograma sorteado com N celebrações", ao editar uma célula "X definido como leitor em [data]", e ao baixar o PDF "PDF gerado: [nome do arquivo]".
- `aria-label` dos botões de remover passa a incluir o nome: `` `Remover ${nome}` `` em vez de `"Remover"` fixo; o de remover data vira `` `Remover celebração de ${formatDateBR(iso)}` ``.
- `<th scope="col">` em todas as colunas da tabela de cronograma; `<caption className="sr-only">` descrevendo "Cronograma de leitores, ministros e celebrante por data".
- Botão "Sortear cronograma" desabilitado ganha `aria-describedby` apontando para o `id` da dica que explica o que falta preencher.

## 6. Toque e ergonomia mobile — **Alto**

- Todo alvo de toque (botões, chips de remover, `×` de remover data, botões de dia da semana) com no mínimo **44×44px** de área clicável — hoje `.wd-btn` tem `min-height:40px`, abaixo do recomendado; ajustar para 44px. `.del` e o `×` dos chips têm padding que compensa parcialmente via área de clique negativa (`margin:-8px -10px`), mas vale conferir com DevTools em modo mobile que a área real bate 44px.
- Nenhuma interação pode depender só de `:hover` (já é o caso — `.cell-editable:hover` é só reforço visual, não a única pista; ver item 7 sobre reforçar além da cor).
- Espaçamento mínimo entre alvos de toque adjacentes (ex.: chips lado a lado) para evitar toque acidental no vizinho.

## 7. Contraste de cor — **Crítico**

Ajustar as três combinações identificadas no diagnóstico para atingir AA (4,5:1 texto normal / 3:1 texto grande ou 18,66px+ bold):

- Kicker verde: escurecer para algo como `#2F7A28` sobre branco (ou manter `--green` só como sublinhado/ícone, não como cor de texto).
- Número no círculo dourado: usar `--ink` (escuro) no texto em vez de branco, ou escurecer o fundo do círculo para `--gold-dark`/mais escuro ainda.
- Texto branco do botão primário: escurecer `--blue` para o botão especificamente (ex.: usar `--blue-dark` como fundo do botão primário) ou aumentar o peso/tamanho da fonte para 18,66px+ bold.
- Validar as demais combinações com uma ferramenta de contraste (WebAIM Contrast Checker ou o auditor de Contrast do Chrome DevTools) sempre que uma cor nova for introduzida.

## 8. Não depender só de cor — **Médio**

- Estado "ativo" dos botões de dia da semana: hoje é só mudança de fundo/cor de texto. Adicionar um segundo sinal (ex.: um ✓ antes da sigla do dia, ou `aria-pressed` já cobre a parte de leitor de tela — mas quem enxerga e tem baixa percepção de cor também precisa do sinal visual extra).
- Linhas pares da tabela (`nth-child(even)`) usam só cor de fundo para separar visualmente — isso é aceitável (não é a única forma de entender a tabela), manter.

## 9. Zoom e reflow — **Alto**

- Com a meta viewport correta (item 1), validar que a página funciona até 400% de zoom / largura efetiva de 320px sem quebrar layout nem exigir rolagem horizontal — exceto a tabela de cronograma, que já assume rolagem horizontal intencional dentro de `.table-scroll` (isso é aceitável pelo WCAG 1.4.10, que permite rolagem em conteúdo tabular).

## 10. Compatibilidade com leitor de tela móvel — **Alto**

- Testar o fluxo completo (passos 1 a 5 + edição de célula + download do PDF) com VoiceOver no iOS e TalkBack no Android antes de considerar pronto. Simulador de desktop com leitor de tela desktop não é suficiente — o comportamento de foco em `<select>` e o gesto de ativação variam entre mobile e desktop.

---

# Critérios de aceite

- [ ] Fluxo completo (passos 1 a 5) navegável só com teclado (`Tab`/`Shift+Tab`/`Enter`/`Espaço`), sem mouse.
- [ ] Fluxo completo navegável com VoiceOver (iOS) e TalkBack (Android), com anúncios coerentes em cada ação.
- [ ] Todas as combinações texto/fundo relevantes com contraste ≥ 4,5:1 (texto normal) ou 3:1 (texto grande/ícones funcionais).
- [ ] Zoom do navegador até 400% sem perda de conteúdo ou funcionalidade, sem rolagem horizontal na página (exceto a tabela).
- [ ] Nenhum alvo de toque interativo menor que 44×44px.
- [ ] Auditoria automatizada (Lighthouse Accessibility ou axe DevTools) sem violações críticas/graves.

---

# Fora de escopo desta spec

- Tradução para outros idiomas / internacionalização do leitor de tela.
- Suporte a navegadores sem `:focus-visible` (usar `:focus` como fallback é suficiente, sem exigir polyfill).
- Testes automatizados de acessibilidade em pipeline de CI — pode virar um requisito futuro separado, já que hoje não há backend nem pipeline (ver spec funcional).
