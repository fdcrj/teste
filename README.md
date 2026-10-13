# Mapa de Degustação — catálogo de cervejas

Aplicativo web estático, em português, que lê a planilha compartilhada do evento. O arquivo principal é um HTML autônomo: CSS e JavaScript estão dentro de `index.html`, sem etapa de compilação.

## Abas utilizadas

A aba **Geral** contém os totais por confraria, o volume total do evento e a média por pessoa. Ela não traz os registros completos de cada cerveja. Por isso, a interface também lê **ALL CERVEJAS**, que contém os nomes, cervejeiros, categorias, estilos, volumes e valores de ABV, IBU e EBC. O app usa os dados da planilha em tempo real; não inclui uma cópia estática do catálogo.

O volume total do evento e a média por pessoa são os valores informados em **Geral**. O total de litros e a quantidade de cervejas nos cards, na tabela e nos gráficos são calculados sobre os registros detalhados que correspondem aos filtros. O app compara as abas e exibe um aviso se os totais de litros, quantidade de cervejas ou pendências ABV/IBU/EBC divergirem.

Na leitura usada para preparar esta versão, **Geral** informa 122 cervejas e 3.369 L, enquanto **ALL CERVEJAS** retorna 126 registros nomeados que somam 3.324 L. A contagem de campos pendentes também difere entre as abas. Esses valores podem mudar quando a planilha for atualizada; a faixa de aviso do app faz a comparação novamente a cada sincronização.

## Arquivos

```text
.
├── index.html          # Aplicação completa; pronto para hospedagem estática
├── README.md           # Este guia
├── .nojekyll           # Evita processamento Jekyll no GitHub Pages
├── package.json        # Dependência do proxy privado opcional para Vercel
├── vercel.json         # Configuração opcional da função Vercel
└── api/
    └── planilha.js     # Proxy somente-leitura opcional para planilha privada
```

Não é necessário `app.py` ou `requirements.txt`: a versão recomendada é estática. A pasta `api/` e a dependência `googleapis` são necessárias somente se você optar pelo modo proxy privado na Vercel.

## Funcionalidades

- Filtros por confraria, categoria da planilha, estilo BJCP, faixa de ABV, IBU e EBC e busca textual por cerveja, cervejeiro, descrição, confraria ou número da chopeira.
- Cards atualizados conforme os filtros, além da média global por pessoa informada pela planilha.
- Gráfico interativo de ABV × IBU; gráficos de litros por confraria e quantidade por estilo. Clique nos pontos e barras para abrir uma ficha ou aplicar um filtro.
- Alertas visuais para ABV, IBU ou EBC ausente.
- Exportação CSV da seleção atual e impressão do cardápio, com opção **Salvar como PDF** no diálogo de impressão.
- Cartão de notas para aroma, sabor e impressão geral. As avaliações ficam no `localStorage` do navegador atual; não são enviadas à planilha e não acompanham o usuário em outro dispositivo.
- Atualização automática a cada cinco minutos e botão para sincronizar manualmente.

## Configuração recomendada: planilha pública somente para leitura

A planilha indicada já permite leitura pública. Para usar a mesma fonte em outro projeto, abra **Compartilhar** no Google Sheets e defina **Acesso geral → Qualquer pessoa com o link → Leitor**. Não é necessária chave de API para o modo público padrão.

Mantenha, em `index.html`:

```js
const CONFIG = {
  spreadsheetId: "1S_ajLE6RhxOfa771lQaWYcAKhK_BnS1fRC9lLhABLx4",
  dataMode: "public",
  sheetsApiKey: "",
  detailTab: "ALL CERVEJAS",
  summaryTab: "Geral",
  // ...
};
```

Se sua planilha tiver outros nomes de abas, altere `detailTab` e `summaryTab`. A leitura pública usa o endpoint do Google Visualization por JSONP, apropriado para uma hospedagem estática sem backend. Qualquer pessoa que consiga abrir o app poderá ver os dados que a planilha compartilha publicamente.

### Alternativa: chave da Google Sheets API para dados públicos

Uma chave de API **não concede acesso a uma planilha privada**. Ela pode ser usada para ler uma planilha que já é pública. Para configurar:

1. No Google Cloud Console, crie ou escolha um projeto e ative **Google Sheets API**.
2. Crie uma chave em **APIs e serviços → Credenciais → Criar credenciais → Chave de API**.
3. Restrinja a chave à API **Google Sheets API** e aos domínios de hospedagem do app, usando restrição de referenciador HTTP.
4. Em `index.html`, defina `dataMode: "api-key"` e preencha `sheetsApiKey`.
5. Faça o commit da alteração e publique novamente.

A chave ficará visível no JavaScript baixado pelo navegador. Portanto, use essa opção **somente para uma planilha pública**, aplique as restrições acima e nunca a trate como segredo.

### Alternativa: planilha privada pela função de servidor da Vercel

Não coloque uma chave JSON de conta de serviço em `index.html`, no GitHub ou em outro arquivo público. HTML estático não consegue esconder credenciais. Para a leitura privada, use a função `api/planilha.js` incluída neste projeto:

1. No Google Cloud Console, ative a Google Sheets API e crie uma conta de serviço. Baixe a chave JSON.
2. Copie o e-mail da conta de serviço e compartilhe a planilha com esse e-mail como **Leitor**.
3. Importe o repositório na Vercel e, nas configurações do projeto, adicione as variáveis de ambiente `GOOGLE_SERVICE_ACCOUNT_JSON` (o JSON completo da chave) e `GOOGLE_SHEET_ID` (o ID da planilha).
4. Em `index.html`, troque `dataMode: "public"` por `dataMode: "proxy"`.
5. Publique novamente. A função fará as leituras no servidor com escopo somente-leitura.

**Importante:** embora as credenciais e a planilha não fiquem expostas diretamente, a rota `/api/planilha` entrega os dados lidos aos visitantes do app. Se os dados não puderem ser vistos por qualquer visitante, será necessário acrescentar autenticação e autorização ao app e à função; não publique apenas um proxy aberto.

## Rodar localmente

Na pasta do projeto, execute:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000`. Servir por HTTP ajuda a reproduzir o comportamento de uma hospedagem real e facilita identificar problemas de compartilhamento da planilha.

## Publicar grátis no GitHub Pages

1. Crie um repositório no GitHub e envie os arquivos desta pasta para a raiz do branch `main`.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione o branch `main` e a pasta `/(root)`; clique em **Save**.
5. Aguarde a publicação e abra o endereço apresentado em **Pages**.

Não é necessário configurar comando de build. O GitHub Pages publica o `index.html` da raiz. Esta opção funciona com `dataMode: "public"` ou com `"api-key"`. Ela **não executa** `api/planilha.js`; use a Vercel para o modo proxy privado. Sites publicados no Pages são acessíveis pela internet, então não inclua credenciais nem arquivos privados no repositório.

## Publicar na Vercel

1. Envie o projeto para um repositório GitHub.
2. Na Vercel, escolha **Add New → Project**, conecte o GitHub e importe o repositório.
3. Para o modo público, mantenha o framework como **Other** e não configure comando de build; implante.
4. Para o modo proxy privado, adicione as duas variáveis de ambiente indicadas acima, configure `dataMode: "proxy"` e implante.
5. Os próximos pushes ao branch conectado iniciam novas implantações automaticamente.

A disponibilidade e os limites dos planos gratuitos de hospedagem podem mudar. Verifique as condições atuais da plataforma antes de escolher a publicação.

## Atualização e notas

As alterações feitas na planilha aparecem na próxima sincronização automática (até cinco minutos) ou ao clicar em **Atualizar**. A avaliação sensorial não altera a planilha: o app não tem credenciais nem permissão de escrita. Para compartilhar notas entre participantes ou gravá-las na planilha, será necessário criar um backend autenticado, definir as permissões e acrescentar um fluxo explícito de escrita.

## Referências de publicação

- [Documentação do GitHub Pages: configurar a origem de publicação](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Documentação da Vercel: implantar projetos conectados ao GitHub](https://vercel.com/docs/git/vercel-for-github)
- [Google Sheets API: guia de início rápido](https://developers.google.com/sheets/api/quickstart)
