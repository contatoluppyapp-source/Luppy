export type QuestionType = "choice" | "multi" | "scale" | "open";

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  helper?: string;
}

export const B2C_SURVEY: SurveyQuestion[] = [
  { id: "experience", type: "scale", text: "O que você achou da experiência?" },
  {
    id: "useBefore",
    type: "choice",
    text: "Você usaria isso antes de fazer as unhas?",
    options: ["Sim", "Talvez", "Não"],
  },
  {
    id: "simulation",
    type: "scale",
    text: "A simulação ajudou você a imaginar melhor o resultado?",
  },
  {
    id: "saveIdeas",
    type: "scale",
    text: "Você gostaria de salvar inspirações dentro do app?",
  },
  {
    id: "findDesigners",
    type: "scale",
    text: "Você gostaria de encontrar profissionais de unhas pelo app?",
  },
  {
    id: "mostLiked",
    type: "choice",
    text: "Do que você MAIS gostou na experiência?",
    options: [
      "Ver a unha na minha própria mão",
      "Explorar inspirações de unhas",
      "Descobrir estilos novos",
      "Facilidade de uso",
      "Rapidez da simulação",
      "Outra",
    ],
  },
  {
    id: "futureIdeas",
    type: "choice",
    text: "Qual dessas ideias futuras da Luppy mais te interessaria?",
    options: [
      "Comunidade para compartilhar inspirações",
      "Encontrar nail designers perto de mim",
      "Agendamento direto pelo app",
      "Promoções de estúdios próximos",
      "Perfil de nail designers",
      "Clube de assinatura mensal",
      "Outra",
    ],
  },
  { id: "improve", type: "open", text: "O que deixaria o app ainda melhor?" },
];

export const B2B_SURVEY: SurveyQuestion[] = [
  {
    id: "profile",
    type: "choice",
    text: "Qual o seu perfil hoje?",
    options: [
      "Sou autônoma",
      "Trabalho em um estúdio",
      "Tenho meu próprio estúdio",
      "Estou começando agora",
    ],
  },
  {
    id: "workplace",
    type: "choice",
    text: "Onde você atende?",
    options: [
      "Em casa",
      "No meu próprio estúdio",
      "Em estúdio de terceiros",
      "Vou até a cliente",
      "Várias opções",
    ],
  },
  {
    id: "experience",
    type: "choice",
    text: "Há quanto tempo trabalha com unhas?",
    options: ["Menos de 1 ano", "1 a 3 anos", "3 a 7 anos", "Mais de 7 anos"],
  },
  {
    id: "volume",
    type: "choice",
    text: "Quantas clientes você atende por mês?",
    options: ["0 a 20", "21 a 50", "51 a 100", "Mais de 100"],
  },
  {
    id: "revenue",
    type: "choice",
    text: "Quanto você fatura por mês com unhas?",
    options: [
      "Até R$1.500",
      "R$1.500 a R$3.500",
      "R$3.500 a R$7.000",
      "Mais de R$7.000",
      "Prefiro não responder",
    ],
  },
  {
    id: "acquisition",
    type: "multi",
    text: "Como suas clientes te encontram hoje?",
    options: [
      "Indicação de outras clientes",
      "Instagram",
      "WhatsApp",
      "Google ou Maps",
      "Vitrine ou ponto físico",
      "Outra",
    ],
  },
  {
    id: "pains",
    type: "multi",
    text: "Quais suas maiores dificuldades hoje?",
    options: [
      "Conseguir clientes novas",
      "Agenda vazia em alguns dias",
      "Faltas e cancelamentos",
      "Mostrar como vai ficar antes",
      "Fidelizar clientes",
      "Organizar a agenda",
      "Controle financeiro",
      "Criar conteúdo",
    ],
  },
  {
    id: "simulationValue",
    type: "scale",
    text: "Mostrar para a cliente como a unha vai ficar antes ajudaria você a fechar mais atendimentos?",
  },
  {
    id: "communityValue",
    type: "scale",
    text: "O quanto faria sentido aparecer num app onde clientes da sua região buscam profissionais?",
  },
  {
    id: "subscriptionClub",
    type: "choice",
    text: "Você toparia oferecer um clube de assinatura para suas clientes? (ela paga uma mensalidade e faz quando quiser)",
    options: [
      "Sim, faria muito sentido",
      "Talvez, dependendo",
      "Não, prefiro cobrar por sessão",
      "Já faço algo parecido",
    ],
  },
  {
    id: "budget",
    type: "choice",
    text: "Quanto pagaria por mês por um app completo? (vitrine, agenda, IA, financeiro, clientes novas)",
    options: [
      "Até R$29",
      "R$29 a R$79",
      "R$79 a R$149",
      "R$149 a R$249",
      "Mais de R$249",
    ],
  },
  {
    id: "commission",
    type: "choice",
    text: "Você aceitaria pagar uma comissão por cada cliente nova que o app trouxesse?",
    options: [
      "Sim, vale a pena",
      "Talvez, depende da taxa",
      "Não, prefiro mensalidade fixa",
      "Outra opinião",
    ],
  },
  {
    id: "dreamApp",
    type: "open",
    text: "Como seria o app perfeito pra uma profissional como você?",
  },
];

export type SurveyAnswers = Record<string, string | string[] | number>;
