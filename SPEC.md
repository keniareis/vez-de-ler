# Vez de Ler — Spec Funcional

> Documentação de requisitos do organizador mensal de escalas para celebrações.

#react #frontend #sem-backend

## Problema que o app resolve

Toda igreja/paróquia precisa montar, todo mês, uma escala com quem vai ler e quem vai ser ministro em cada celebração, além de quem é o celebrante daquele dia. Hoje esse trabalho normalmente é feito à mão (papel, planilha ou grupo de WhatsApp), o que traz alguns problemas recorrentes:

- **Favoritismo ou esquecimento**: sem um critério claro, as mesmas pessoas acabam sendo escaladas com mais frequência, enquanto outras ficam de fora por vários meses seguidos.
- **Conflito de papéis no mesmo dia**: é fácil escalar sem querer a mesma pessoa como celebrante e como leitor na mesma celebração.
- **Trabalho manual repetitivo**: recriar a lista de datas do mês e redistribuir nomes à mão consome tempo todo mês.
- **Falta de um documento fácil de compartilhar**: depois de definida a escala, é preciso um formato limpo para imprimir e afixar no mural da igreja ou enviar aos grupos.

**Vez de Ler** resolve isso automatizando o sorteio (de forma equilibrada e respeitando a restrição de que o celebrante do dia não pode ser leitor no mesmo dia) e gerando, ao final, um PDF pronto para impressão/compartilhamento, com a identidade visual da PASCOM.

## Visão geral

Aplicação de página única (SPA) em **React**, executada inteiramente no navegador. Serve para montar o cronograma mensal de celebrações de uma igreja/comunidade, sortear de forma equilibrada quem serão os **leitores**, **ministros** e o **celebrante** em cada data, e exportar o resultado em **PDF**.

**Importante — escopo técnico:** este é um projeto **somente de frontend**. Não há backend, API, banco de dados ou autenticação. Todos os dados (datas, nomes, cronograma) existem apenas na memória do navegador durante o uso e são perdidos ao fechar/recarregar a página. Se no futuro for necessário salvar dados entre sessões ou dispositivos (ex.: histórico de escalas, múltiplos usuários editando ao mesmo tempo, envio automático de notificações), **isso exige um backend** e deve ser tratado como um requisito à parte.

## Identidade visual

O app segue as cores da logomarca da **PASCOM** (Igreja Católica Santo Antônio — Povoado Boa Lembrança):

- **Dourado** `#F5A81C` — acentos, faixa superior, destaques
- **Azul** `#0086C3` — cor primária (botões principais, cabeçalho da tabela)
- **Verde** `#52B947` — botões secundários e destaques complementares
- Fundo claro e texto em tom de tinta escura para contraste e leitura fácil

A logomarca da PASCOM aparece no topo da tela (dentro do app) e no cabeçalho do PDF gerado, mantendo a identidade da comunidade em qualquer documento compartilhado.

Tipografia: títulos em fonte serifada (remete a um documento/boletim litúrgico), texto de apoio em fonte sem serifa para leitura rápida em tela pequena.

## Requisitos funcionais

### 1. Configuração do mês

- Selecionar o **mês** e o **ano** de referência da escala.
- Informar o **nome da igreja/comunidade** (opcional, usado no cabeçalho do PDF).

### 2. Datas das celebrações

- Selecionar os **dias da semana** em que há celebração (ex.: domingo, quarta-feira).
- Gerar automaticamente **todas as datas do mês** que caem nos dias da semana selecionados.
- Permitir **adicionar datas avulsas** manualmente (celebrações fora do padrão semanal, como uma festa ou solenidade).
- Permitir **remover** qualquer data da lista antes do sorteio.

### 3. Cadastro de pessoas

- Cada categoria (leitores, ministros, celebrantes) tem um campo de texto + botão **Adicionar** — nada de digitar uma lista inteira de uma vez, para ficar intuitivo para qualquer pessoa usar, inclusive no celular.
- Cada nome adicionado aparece como uma etiqueta (chip) colorida por categoria, com um botão **×** para remover.
- Definir **quantos leitores** participam de cada celebração.
- Definir **quantos ministros** participam de cada celebração.

### 4. Sorteio

- Sortear automaticamente, para cada data, quem serão os leitores, os ministros e o celebrante.
- Distribuição **equilibrada**: os nomes são embaralhados e revezados, evitando repetir alguém antes que todos os outros da lista já tenham participado.
- Dentro de uma mesma celebração, os leitores sorteados não se repetem entre si (nomes distintos no mesmo dia).
- Permitir **sortear novamente** sem perder as configurações (datas e listas de nomes permanecem).

### 5. Regras de negócio / restrições

- **O celebrante do dia não pode ser escalado como leitor na mesma data.** Ao sortear os leitores daquele dia, o nome do celebrante é excluído do sorteio de leitor para aquela data específica (ele continua elegível como leitor em outras datas).

### 6. Visualização e edição pontual

- Exibir o cronograma sorteado em uma tabela na tela, com colunas: **Data**, **Leitor(es)**, **Ministro(s)** e **Celebrante**.
- Mostrar o dia da semana ao lado de cada data.
- **Editar manualmente uma célula específica**: tocar em um nome no cronograma já sorteado abre uma lista suspensa com as pessoas disponíveis daquela categoria, permitindo trocar só aquele nome sem precisar sortear tudo de novo. As opções de leitor/ministro em cada dia já excluem quem foi escalado nas outras posições do mesmo dia, evitando duplicidade.

### 7. Exportação em PDF

- Gerar um arquivo **PDF** do cronograma completo, contendo:
  - Título e nome da igreja/comunidade, mês e ano.
  - Tabela com data, leitores, ministros e celebrante.
  - Paginação automática quando o cronograma não couber em uma página.
- O PDF é gerado e baixado diretamente no navegador (sem envio a servidor).

### 8. Experiência de uso

- Interface em **página única**, dividida em passos claros: (1) datas, (2) leitores, (3) ministros, (4) celebrantes, (5) resultado do sorteio.
- Responsiva, pensada para uso em celular. Ver `ACCESSIBILITY_SPEC.md` para os requisitos detalhados de acessibilidade mobile.

## Fora de escopo (por ora)

- Login/autenticação de usuários.
- Salvar cronogramas anteriores ou histórico entre sessões.
- Notificações automáticas (e-mail/WhatsApp) para as pessoas escaladas.
- Qualquer um desses itens, se solicitado depois, exigirá backend — a decisão de adicionar backend deve ser explicitamente avisada antes de implementada.

## Referência de implementação anterior

Um protótipo funcional (React via CDN + Babel standalone, arquivo único, sem build) existe em `C:\Users\KeniaReis\Downloads\organizador.html`. A lógica de sorteio, geração de PDF e todo o comportamento funcional descrito acima já está validada nesse protótipo — a reimplementação em Vite (ver plano de implementação) porta essa lógica para módulos testáveis, sem mudar o comportamento funcional, e corrige as lacunas de acessibilidade listadas em `ACCESSIBILITY_SPEC.md`.
