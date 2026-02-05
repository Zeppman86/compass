import React from 'react';
import { 
  Users, 
  Heart, 
  Flame, 
  Baby, 
  UserPlus, 
  BookOpen, 
  Activity, 
  Sparkles, 
  Globe, 
  Coffee, 
  Briefcase, 
  Gamepad, 
  Wallet,
  Compass as CompassIcon,
  ShieldCheck,
  Zap,
  RotateCw,
  Target
} from 'lucide-react';
import { ActionTemplate } from './types';

export const INITIAL_VALUE_TEMPLATES = [
  { id: 'family', name: 'Семья (родительская)', icon: <Users className="w-5 h-5" />, description: 'Отношения с родителями, братьями, сестрами.' },
  { id: 'partner', name: 'Отношения с партнером', icon: <Heart className="w-5 h-5" />, description: 'Близость, поддержка, любовь в паре.' },
  { id: 'sex', name: 'Секс / интимность', icon: <Flame className="w-5 h-5" />, description: 'Физическая близость и сексуальное выражение.' },
  { id: 'parenting', name: 'Родительство', icon: <Baby className="w-5 h-5" />, description: 'Воспитание детей и роль родителя.' },
  { id: 'friends', name: 'Друзья', icon: <UserPlus className="w-5 h-5" />, description: 'Социальные связи и глубокая дружба.' },
  { id: 'learning', name: 'Обучение / саморазвитие', icon: <BookOpen className="w-5 h-5" />, description: 'Новые знания, навыки и личностный рост.' },
  { id: 'health', name: 'Здоровье', icon: <Activity className="w-5 h-5" />, description: 'Физическое состояние и отсутствие болезней.' },
  { id: 'spirituality', name: 'Духовность', icon: <Sparkles className="w-5 h-5" />, description: 'Поиск смысла, вера или связь с чем-то большим.' },
  { id: 'community', name: 'Общественная жизнь', icon: <Globe className="w-5 h-5" />, description: 'Вклад в общество, волонтерство.' },
  { id: 'self-care', name: 'Забота о себе', icon: <Coffee className="w-5 h-5" />, description: 'Сон, питание, отдых.' },
  { id: 'work', name: 'Работа', icon: <Briefcase className="w-5 h-5" />, description: 'Карьера, профессионализм, достижения.' },
  { id: 'leisure', name: 'Развлечения / досуг', icon: <Gamepad className="w-5 h-5" />, description: 'Хобби, игры, удовольствия.' },
  { id: 'finance', name: 'Деньги и благополучие', icon: <Wallet className="w-5 h-5" />, description: 'Финансовая стабильность и безопасность.' },
];

export interface MasterySecret {
  id: string;
  title: string;
  text: string;
  icon: React.ReactNode;
  color: string;
}

export const MASTERY_SECRETS: MasterySecret[] = [
  {
    id: 's1',
    title: 'Правило одного месяца',
    text: 'Вам не обязательно отмечать всё до конца жизни. Попробуйте делать это всего один месяц — и вы увидите паттерны поведения, которые раньше ускользали от внимания.',
    icon: <RotateCw className="w-8 h-8" />,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
  },
  {
    id: 's2',
    title: 'Компас, а не карта',
    text: 'Ценности — это направление, а не точка назначения. Вы не можете «достичь» здоровья раз и навсегда, вы можете только выбирать идти в его сторону каждый день.',
    icon: <CompassIcon className="w-8 h-8" />,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
  },
  {
    id: 's3',
    title: 'Данные, а не приговор',
    text: 'Отрицательные баллы — это не провал, а ценная информация. Они подсвечивают моменты, когда ваши привычки оказываются сильнее ваших намерений.',
    icon: <ShieldCheck className="w-8 h-8" />,
    color: 'text-rose-600 bg-rose-50 border-rose-100'
  },
  {
    id: 's4',
    title: 'Сила малых шагов',
    text: 'Даже действие на +0.5 — это победа. В ACT важна не грандиозность поступка, а сам факт того, что вы сделали осознанный выбор в пользу своей ценности.',
    icon: <Zap className="w-8 h-8" />,
    color: 'text-amber-600 bg-amber-50 border-amber-100'
  },
  {
    id: 's5',
    title: 'Психологическая гибкость',
    text: 'Ваш список ценностей не высечен в камне. Если сфера жизни перестала «откликаться» — измените её приоритет. Слышать себя — это и есть мастерство.',
    icon: <Target className="w-8 h-8" />,
    color: 'text-purple-600 bg-purple-50 border-purple-100'
  }
];

export const DEFAULT_ACTION_TEMPLATES: ActionTemplate[] = [
  // --- HEALTH (Здоровье) ---
  { id: 'h1', description: 'Сделал утреннюю зарядку', impacts: [{ valueId: 'health', impact: 2 }], usageCount: 0 },
  { id: 'h2', description: 'Прогулка 30 минут', impacts: [{ valueId: 'health', impact: 2 }, { valueId: 'self-care', impact: 1 }], usageCount: 0 },
  { id: 'h3', description: 'Посетил врача', impacts: [{ valueId: 'health', impact: 4 }], usageCount: 0 },
  { id: 'h4', description: 'Сдал анализы', impacts: [{ valueId: 'health', impact: 3 }], usageCount: 0 },
  { id: 'h5', description: 'Интенсивная тренировка', impacts: [{ valueId: 'health', impact: 5 }], usageCount: 0 },
  { id: 'h6', description: 'Выпил 2л воды за день', impacts: [{ valueId: 'health', impact: 2 }], usageCount: 0 },
  { id: 'h7', description: 'Отказ от сахара сегодня', impacts: [{ valueId: 'health', impact: 3 }], usageCount: 0 },
  { id: 'h8', description: 'Выкурил сигарету', impacts: [{ valueId: 'health', impact: -3 }], usageCount: 0 },
  { id: 'h9', description: 'Выпил алкоголь', impacts: [{ valueId: 'health', impact: -4 }, { valueId: 'self-care', impact: -2 }], usageCount: 0 },
  { id: 'h10', description: 'Сильное похмелье', impacts: [{ valueId: 'health', impact: -5 }, { valueId: 'work', impact: -3 }, { valueId: 'self-care', impact: -3 }], usageCount: 0 },
  { id: 'h11', description: 'Срыв на вредную еду', impacts: [{ valueId: 'health', impact: -2 }], usageCount: 0 },
  { id: 'h12', description: 'Пропустил прием лекарств', impacts: [{ valueId: 'health', impact: -4 }], usageCount: 0 },
  { id: 'h13', description: 'Записался к врачу', impacts: [{ valueId: 'health', impact: 2 }], usageCount: 0 },

  // --- FAMILY (Семья) ---
  { id: 'f1', description: 'Позвонил родителям', impacts: [{ valueId: 'family', impact: 3 }], usageCount: 0 },
  { id: 'f2', description: 'Ужин с семьей', impacts: [{ valueId: 'family', impact: 4 }], usageCount: 0 },
  { id: 'f3', description: 'Помог родным с делами', impacts: [{ valueId: 'family', impact: 3 }], usageCount: 0 },
  { id: 'f4', description: 'Спокойно выслушал маму/папу', impacts: [{ valueId: 'family', impact: 3 }], usageCount: 0 },
  { id: 'f5', description: 'Ссора с родителями', impacts: [{ valueId: 'family', impact: -4 }], usageCount: 0 },
  { id: 'f6', description: 'Проигнорировал звонок близких', impacts: [{ valueId: 'family', impact: -2 }], usageCount: 0 },
  { id: 'f7', description: 'Забыл про семейное событие', impacts: [{ valueId: 'family', impact: -3 }], usageCount: 0 },
  { id: 'f8', description: 'Игра с братьями/сестрами', impacts: [{ valueId: 'family', impact: 3 }], usageCount: 0 },

  // --- PARTNER (Отношения) ---
  { id: 'p1', description: 'Свидание с партнером', impacts: [{ valueId: 'partner', impact: 5 }], usageCount: 0 },
  { id: 'p2', description: 'Честный разговор о чувствах', impacts: [{ valueId: 'partner', impact: 4 }], usageCount: 0 },
  { id: 'p3', description: 'Маленький подарок без повода', impacts: [{ valueId: 'partner', impact: 3 }], usageCount: 0 },
  { id: 'p4', description: 'Ссора с партнером', impacts: [{ valueId: 'partner', impact: -5 }], usageCount: 0 },
  { id: 'p5', description: 'Критика в адрес партнера', impacts: [{ valueId: 'partner', impact: -3 }], usageCount: 0 },
  { id: 'p6', description: 'Поддержал партнера в трудный момент', impacts: [{ valueId: 'partner', impact: 4 }], usageCount: 0 },
  { id: 'p7', description: 'Провели вечер без телефонов', impacts: [{ valueId: 'partner', impact: 4 }, { valueId: 'self-care', impact: 2 }], usageCount: 0 },
  { id: 'p8', description: 'Ложь партнеру', impacts: [{ valueId: 'partner', impact: -5 }, { valueId: 'spirituality', impact: -2 }], usageCount: 0 },

  // --- SELF-CARE (Забота о себе) ---
  { id: 'sc1', description: 'Лег спать до 23:00', impacts: [{ valueId: 'self-care', impact: 4 }, { valueId: 'health', impact: 2 }], usageCount: 0 },
  { id: 'sc2', description: 'Принял ванну / расслабился', impacts: [{ valueId: 'self-care', impact: 3 }], usageCount: 0 },
  { id: 'sc3', description: 'Час без гаджетов', impacts: [{ valueId: 'self-care', impact: 3 }], usageCount: 0 },
  { id: 'sc4', description: 'Посетил психолога', impacts: [{ valueId: 'self-care', impact: 5 }, { valueId: 'health', impact: 2 }], usageCount: 0 },
  { id: 'sc5', description: 'Заедал стресс', impacts: [{ valueId: 'self-care', impact: -3 }, { valueId: 'health', impact: -2 }], usageCount: 0 },
  { id: 'sc6', description: 'Недосып (менее 6 часов)', impacts: [{ valueId: 'self-care', impact: -4 }, { valueId: 'health', impact: -3 }], usageCount: 0 },
  { id: 'sc7', description: 'Весь день в соцсетях', impacts: [{ valueId: 'self-care', impact: -3 }, { valueId: 'learning', impact: -2 }], usageCount: 0 },
  { id: 'sc8', description: 'Прогулка на природе', impacts: [{ valueId: 'self-care', impact: 4 }], usageCount: 0 },
  { id: 'sc9', description: 'Занимался хобби', impacts: [{ valueId: 'self-care', impact: 4 }, { valueId: 'leisure', impact: 3 }], usageCount: 0 },

  // --- WORK (Работа) ---
  { id: 'w1', description: 'Завершил важную задачу', impacts: [{ valueId: 'work', impact: 5 }], usageCount: 0 },
  { id: 'w2', description: 'Продуктивная работа без отвлечений', impacts: [{ valueId: 'work', impact: 4 }], usageCount: 0 },
  { id: 'w3', description: 'Помог коллеге', impacts: [{ valueId: 'work', impact: 3 }, { valueId: 'community', impact: 1 }], usageCount: 0 },
  { id: 'w4', description: 'Прокрастинировал весь день', impacts: [{ valueId: 'work', impact: -5 }], usageCount: 0 },
  { id: 'w5', description: 'Опоздал на работу', impacts: [{ valueId: 'work', impact: -2 }], usageCount: 0 },
  { id: 'w6', description: 'Конфликт на работе', impacts: [{ valueId: 'work', impact: -3 }], usageCount: 0 },
  { id: 'w7', description: 'Переработка / засиделся допоздна', impacts: [{ valueId: 'work', impact: 2 }, { valueId: 'self-care', impact: -4 }], usageCount: 0 },
  { id: 'w8', description: 'Обучение новым навыкам', impacts: [{ valueId: 'work', impact: 4 }, { valueId: 'learning', impact: 3 }], usageCount: 0 },

  // --- LEARNING (Обучение) ---
  { id: 'l1', description: 'Прочитал 20 страниц книги', impacts: [{ valueId: 'learning', impact: 3 }], usageCount: 0 },
  { id: 'l2', description: 'Посмотрел учебный вебинар', impacts: [{ valueId: 'learning', impact: 3 }], usageCount: 0 },
  { id: 'l3', description: 'Занимался иностранным языком', impacts: [{ valueId: 'learning', impact: 4 }], usageCount: 0 },
  { id: 'l4', description: 'Прошел урок курса', impacts: [{ valueId: 'learning', impact: 5 }], usageCount: 0 },
  // Fix: Removed extra curly braces in line 149
  { id: 'l5', description: 'Бессмысленно смотрел YouTube', impacts: [{ valueId: 'learning', impact: -2 }, { valueId: 'self-care', impact: -1 }], usageCount: 0 },
  { id: 'l6', description: 'Изучал профессиональную статью', impacts: [{ valueId: 'learning', impact: 3 }, { valueId: 'work', impact: 2 }], usageCount: 0 },

  // --- FINANCE (Финансы) ---
  { id: 'fi1', description: 'Отложил деньги в накопления', impacts: [{ valueId: 'finance', impact: 4 }], usageCount: 0 },
  { id: 'fi2', description: 'Анализ расходов за неделю', impacts: [{ valueId: 'finance', impact: 3 }], usageCount: 0 },
  { id: 'fi3', description: 'Импульсивная покупка', impacts: [{ valueId: 'finance', impact: -3 }], usageCount: 0 },
  { id: 'fi4', description: 'Потратил деньги на вредные привычки', impacts: [{ valueId: 'finance', impact: -3 }, { valueId: 'health', impact: -3 }], usageCount: 0 },
  { id: 'fi5', description: 'Нашел новый источник дохода', impacts: [{ valueId: 'finance', impact: 5 }, { valueId: 'work', impact: 2 }], usageCount: 0 },
  { id: 'fi6', description: 'Забыл оплатить счета вовремя', impacts: [{ valueId: 'finance', impact: -2 }], usageCount: 0 },

  // --- FRIENDS (Друзья) ---
  { id: 'fr1', description: 'Встреча с друзьями', impacts: [{ valueId: 'friends', impact: 5 }], usageCount: 0 },
  { id: 'fr2', description: 'Просто написал другу узнать как дела', impacts: [{ valueId: 'friends', impact: 2 }], usageCount: 0 },
  { id: 'fr3', description: 'Помог другу в беде', impacts: [{ valueId: 'friends', impact: 5 }], usageCount: 0 },
  { id: 'fr4', description: 'Отменил встречу в последний момент', impacts: [{ valueId: 'friends', impact: -3 }], usageCount: 0 },
  { id: 'fr5', description: 'Сплетничал о друзьях', impacts: [{ valueId: 'friends', impact: -4 }, { valueId: 'spirituality', impact: -2 }], usageCount: 0 },
  { id: 'fr6', description: 'Завел новое знакомство', impacts: [{ valueId: 'friends', impact: 3 }], usageCount: 0 },

  // --- SPIRITUALITY (Духовность) ---
  { id: 'sp1', description: 'Медитация', impacts: [{ valueId: 'spirituality', impact: 3 }, { valueId: 'self-care', impact: 2 }], usageCount: 0 },
  { id: 'sp2', description: 'Размышления о смысле жизни', impacts: [{ valueId: 'spirituality', impact: 2 }], usageCount: 0 },
  { id: 'sp3', description: 'Практика благодарности', impacts: [{ valueId: 'spirituality', impact: 4 }], usageCount: 0 },
  { id: 'sp4', description: 'Действовал вопреки своим ценностям', impacts: [{ valueId: 'spirituality', impact: -5 }], usageCount: 0 },
  { id: 'sp5', description: 'Посещение храма / общины', impacts: [{ valueId: 'spirituality', impact: 4 }], usageCount: 0 },

  // --- COMMUNITY (Общество) ---
  { id: 'cm1', description: 'Пожертвовал на благотворительность', impacts: [{ valueId: 'community', impact: 4 }, { valueId: 'finance', impact: -1 }], usageCount: 0 },
  { id: 'cm2', description: 'Участвовал в волонтерстве', impacts: [{ valueId: 'community', impact: 5 }], usageCount: 0 },
  { id: 'cm3', description: 'Помог незнакомцу', impacts: [{ valueId: 'community', impact: 3 }], usageCount: 0 },
  { id: 'cm4', description: 'Мусорил на улице', impacts: [{ valueId: 'community', impact: -4 }], usageCount: 0 },
  { id: 'cm5', description: 'Грубил людям в интернете/очереди', impacts: [{ valueId: 'community', impact: -3 }], usageCount: 0 },

  // --- LEISURE (Досуг) ---
  { id: 'ls1', description: 'Сходил в кино / на выставку', impacts: [{ valueId: 'leisure', impact: 3 }], usageCount: 0 },
  { id: 'ls2', description: 'Играл в видеоигры (в меру)', impacts: [{ valueId: 'leisure', impact: 2 }], usageCount: 0 },
  { id: 'ls3', description: 'Весь день "пролежал овощем"', impacts: [{ valueId: 'leisure', impact: 1 }, { valueId: 'self-care', impact: -2 }, { valueId: 'work', impact: -2 }], usageCount: 0 },
  { id: 'ls4', description: 'Путешествие / поездка за город', impacts: [{ valueId: 'leisure', impact: 5 }, { valueId: 'self-care', impact: 3 }], usageCount: 0 },

  // --- PARENTING (Родительство) ---
  { id: 'pr1', description: 'Игра с ребенком', impacts: [{ valueId: 'parenting', impact: 5 }], usageCount: 0 },
  { id: 'pr2', description: 'Помог ребенку с уроками', impacts: [{ valueId: 'parenting', impact: 4 }], usageCount: 0 },
  { id: 'pr3', description: 'Сорвался / накричал на ребенка', impacts: [{ valueId: 'parenting', impact: -5 }], usageCount: 0 },
  { id: 'pr4', description: 'Почитал сказку на ночь', impacts: [{ valueId: 'parenting', impact: 4 }], usageCount: 0 },

  // --- SEX (Секс) ---
  { id: 'sx1', description: 'Интимная близость', impacts: [{ valueId: 'sex', impact: 5 }, { valueId: 'partner', impact: 3 }], usageCount: 0 },
  { id: 'sx2', description: 'Обсуждение сексуальных желаний', impacts: [{ valueId: 'sex', impact: 4 }], usageCount: 0 },
  { id: 'sx3', description: 'Отказ от близости без объяснения', impacts: [{ valueId: 'sex', impact: -2 }, { valueId: 'partner', impact: -2 }], usageCount: 0 },
];