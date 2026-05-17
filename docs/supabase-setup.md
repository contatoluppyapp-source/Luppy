# Setup do Supabase para coleta de respostas

Este guia te leva do zero até as respostas das pesquisas (B2C e B2B) caindo na sua tabela do Supabase, tanto em ambiente local quanto na Vercel.

Tempo estimado: ~15 minutos.

---

## Parte 1 — Criar projeto Supabase

1. Acesse [https://supabase.com](https://supabase.com) e clique em **Start your project**
2. Faça login com GitHub (mais fácil) ou crie conta com email
3. Clique em **New project**
4. Preencha:
   - **Name:** `luppy`
   - **Database password:** gere uma senha forte e **anote** em local seguro
   - **Region:** `South America (São Paulo)` — mais perto, menos latência
   - **Pricing plan:** Free
5. Clique em **Create new project**
6. Aguarde ~2 minutos enquanto o Supabase provisiona o banco

---

## Parte 2 — Criar a tabela `surveys`

1. Na sidebar esquerda do dashboard, clique em **Table Editor** (ícone de planilha)
2. Clique em **New table** (botão verde no topo)
3. Configure assim:
   - **Name:** `surveys`
   - **Description:** (opcional) `Respostas das pesquisas B2C e B2B`
   - **Enable Row Level Security (RLS):** deixe **MARCADO** (segurança ligada)
4. Em **Columns**, mantenha as colunas padrão `id` e `created_at` e adicione:

| Nome | Tipo | Default | Nullable |
|------|------|---------|----------|
| `user_type` | `text` | — | NÃO |
| `session_id` | `text` | — | sim |
| `device` | `text` | — | sim |
| `answers` | `jsonb` | — | NÃO |

Para cada coluna nova:
- Clique em **Add column**
- Preencha o nome e tipo
- Em colunas nullable, mantenha "Is Nullable" marcado; nas obrigatórias, desmarque

5. Clique em **Save** no final

---

## Parte 3 — Configurar Row Level Security (acesso público sem login)

Como o MVP não tem autenticação, vamos liberar `INSERT` e `SELECT` para usuários anônimos.

1. Sidebar → **Authentication** → **Policies**
2. Encontre a tabela `surveys` na lista
3. Clique em **New Policy** → **For full customization**
4. Crie a **Policy 1 (INSERT)**:
   - **Policy name:** `anon can insert`
   - **Allowed operation:** `INSERT`
   - **Target roles:** `anon`
   - **WITH CHECK expression:** `true`
   - Clique em **Review** → **Save policy**
5. Crie a **Policy 2 (SELECT)**:
   - Clique em **New Policy** → **For full customization** novamente
   - **Policy name:** `anon can select`
   - **Allowed operation:** `SELECT`
   - **Target roles:** `anon`
   - **USING expression:** `true`
   - Clique em **Review** → **Save policy**

> **Nota de segurança:** isso libera leitura pública. Para o MVP é aceitável porque a `anon key` já vai exposta no client. Quando crescer, considere mover a leitura para uma route com `service_role` e proteger `/admin` com senha.

---

## Parte 4 — Pegar as credenciais

1. Sidebar → **Project Settings** (engrenagem no rodapé) → **API**
2. Você vai precisar de dois valores:
   - **Project URL** (formato `https://xxxxxxxxxx.supabase.co`)
   - **anon public key** (string grande começando com `eyJ...`)
3. Mantenha essa aba aberta para a próxima etapa

---

## Parte 5 — Configurar local (`.env.local`)

1. Na raiz do projeto, crie ou abra o arquivo `.env.local` (sem o `.example`)
2. Adicione:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Cole exatamente os valores da Parte 4.

3. Inicie o dev server:

```bash
npm run dev
```

4. Abra `http://localhost:3000/designer`, responda 1–2 perguntas e clique até concluir
5. Volte ao Supabase → **Table Editor** → `surveys` — sua resposta deve aparecer aí

---

## Parte 6 — Configurar na Vercel

1. Acesse [vercel.com](https://vercel.com) → seu projeto **luppy**
2. Vá em **Settings** → **Environment Variables**
3. Adicione as duas variáveis:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
     **Value:** (mesma URL do `.env.local`)
     **Environments:** marque todos (Production, Preview, Development)
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     **Value:** (mesma anon key)
     **Environments:** marque todos
4. Clique em **Save**
5. Faça o redeploy:
   - **Deployments** → último deploy → clique em **...** → **Redeploy**
   - Ou faça um `git push` qualquer que dispara um deploy automático
6. Após o deploy concluir, acesse seu domínio em produção → responda à pesquisa → conferir o registro no Supabase

---

## Parte 7 — Visualizar e exportar dados

### Pelo painel da própria Luppy
- Acesse `https://seu-dominio.vercel.app/admin` (ou `http://localhost:3000/admin` em dev)
- Veja stats totais, B2C, B2B
- Filtre por tipo
- Expanda cada card para ver as respostas
- Clique em **Exportar JSON** para baixar todas as respostas em um arquivo

### Pelo dashboard do Supabase
- **Table Editor** → `surveys` → vê tudo em formato tabela
- Pode editar/deletar registros manualmente
- Botão "..." no canto superior → **Export to CSV** para baixar como planilha

---

## Troubleshooting

**Erro "supabaseUrl is required" no log do server**
- A variável de ambiente não foi carregada. Confirme:
  - Arquivo `.env.local` está na raiz do projeto (não em `src/`)
  - Variáveis começam com `NEXT_PUBLIC_` (obrigatório para serem lidas no client e em rotas)
  - Reiniciou o `npm run dev` após criar/editar o `.env.local`
  - Na Vercel, fez redeploy depois de adicionar as vars

**Erro "new row violates row-level security policy" ao enviar resposta**
- Faltam as policies da Parte 3. Volte e crie as duas (INSERT e SELECT para role `anon`).

**O painel `/admin` carrega vazio mesmo com respostas enviadas**
- Verifique se o anon role tem permissão de `SELECT` (Parte 3, policy 2)
- Confirme que `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão setadas em produção também

**Respostas chegam mas o `answers` está vazio**
- Provavelmente a coluna `answers` foi criada como `text` em vez de `jsonb`. No Table Editor, edite a coluna e mude o tipo para `jsonb`.
