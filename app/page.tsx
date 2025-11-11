import Link from 'next/link';
import { ArrowRight, Clock3, PlayCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Card from './components/Card';
import styles from './styles/Home.module.css';

type LearningTrack = {
  id: string;
  title: string;
  description: string;
  progress: number;
  updatedAt: string;
  highlight?: string;
};

type UpcomingSession = {
  id: string;
  title: string;
  mentor: string;
  start: string;
  location: string;
  focus?: string;
};

const fallbackData: { tracks: LearningTrack[]; sessions: UpcomingSession[] } = {
  tracks: [
    {
      id: 'algorithms',
      title: 'Алгоритмы и структуры данных',
      description: 'Практикум по сложным задачам + live-кодинг с наставником.',
      progress: 72,
      updatedAt: 'Обновлено 2 часа назад',
      highlight: 'Спринт #3',
    },
    {
      id: 'ml',
      title: 'Машинное обучение',
      description: 'Работа с Supabase Vector и быстрая доставка модели в Vercel.',
      progress: 64,
      updatedAt: 'Синхронизировано сегодня в 08:15',
      highlight: 'Labs',
    },
    {
      id: 'uiux',
      title: 'UX-стратегии и прототипирование',
      description: 'Сбор обратной связи и гипотезы для нового дашборда.',
      progress: 85,
      updatedAt: 'Вчера · 21:40',
      highlight: 'DesignOps',
    },
  ],
  sessions: [
    {
      id: 'session-1',
      title: 'Deep Dive по ядру Supabase',
      mentor: 'Кирилл Мещеряков',
      start: 'Сегодня · 18:30',
      location: 'Zoom · комната #3',
      focus: 'Практика',
    },
    {
      id: 'session-2',
      title: 'Разбор задач по дискретной математике',
      mentor: 'Екатерина Ли',
      start: 'Завтра · 09:00',
      location: 'Кампус · аудитория D4',
      focus: 'Семинар',
    },
    {
      id: 'session-3',
      title: 'Product review спринта',
      mentor: 'Алексей Ким',
      start: 'Четверг · 14:00',
      location: 'Miro board · live',
      focus: 'Review',
    },
  ],
};

async function fetchDashboardData(): Promise<{
  tracks: LearningTrack[];
  sessions: UpcomingSession[];
}> {
  try {
    const supabase = await createClient();

    const [
      {
        data: tracksData,
        error: tracksError,
      },
      {
        data: sessionsData,
        error: sessionsError,
      },
    ] = await Promise.all([
      // Пример запроса: замените имена таблиц на свои при подключении настоящих данных.
      supabase
        .from('learning_tracks')
        .select('id,title,description,progress,updated_at,highlight')
        .order('updated_at', { ascending: false })
        .limit(3),
      supabase
        .from('upcoming_sessions')
        .select('id,title,mentor,start_at,location,focus')
        .order('start_at', { ascending: true })
        .limit(3),
    ]);

    if (tracksError) {
      throw tracksError;
    }

    if (sessionsError) {
      throw sessionsError;
    }

    const tracks =
      tracksData?.map(track => ({
        id: String(track.id),
        title: track.title ?? 'Неизвестный модуль',
        description: track.description ?? 'Описание скоро появится.',
        progress: Math.round(track.progress ?? 0),
        updatedAt: track.updated_at
          ? new Intl.DateTimeFormat('ru-RU', {
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(track.updated_at))
          : 'Обновление ожидается',
        highlight: track.highlight ?? undefined,
      })) ?? [];

    const sessions =
      sessionsData?.map(session => ({
        id: String(session.id),
        title: session.title ?? 'Занятие',
        mentor: session.mentor ?? 'Наставник уточняется',
        start: session.start_at
          ? new Intl.DateTimeFormat('ru-RU', {
              weekday: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(session.start_at))
          : 'Дата согласуется',
        location: session.location ?? 'Площадка уточняется',
        focus: session.focus ?? undefined,
      })) ?? [];

    return {
      tracks: tracks.length ? tracks : fallbackData.tracks,
      sessions: sessions.length ? sessions : fallbackData.sessions,
    };
  } catch (error) {
    console.error('Не удалось получить данные Supabase', error);
    return fallbackData;
  }
}

export default async function HomePage() {
  const { tracks, sessions } = await fetchDashboardData();

  const averageProgress =
    tracks.length > 0
      ? Math.round(tracks.reduce((sum, track) => sum + track.progress, 0) / tracks.length)
      : 0;

  const nextSession = sessions[0];

  const heroStats = [
    { label: 'Средний прогресс', value: `${averageProgress}%`, meta: 'по активным курсам' },
    {
      label: 'Следующее занятие',
      value: nextSession?.start ?? '—',
      meta: nextSession?.title ?? 'Запланируйте событие',
    },
    { label: 'Подготовленные конспекты', value: '12', meta: 'офлайн доступ' },
  ];

  return (
    <div className={styles.dashboard}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p>Командный образовательный поток</p>
          <h2>Учись гибко, получай точную аналитику и оставайся в фокусе.</h2>
          <span>
            Поддерживаем Supabase Auth, таблицы прогресса и любые кастомные источники данных.
            Запускайте платформу на Vercel без долгой подготовки.
          </span>
          <div className={styles.heroActions}>
            <Link href="/protected" className={styles.primaryAction}>
              Начать спринт
              <ArrowRight size={16} />
            </Link>
            <Link href="/grades" className={styles.secondaryAction}>
              Смотреть аналитику
            </Link>
          </div>
        </div>

        <div className={styles.heroPanel}>
          {heroStats.map(stat => (
            <div key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <p>{stat.meta}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h3>Прогресс по курсам</h3>
          <span>Данные подтягиваются из Supabase таблицы learning_tracks</span>
        </div>
        <div className={styles.cardGrid}>
          {tracks.map(track => (
            <Card
              key={track.id}
              eyebrow={track.highlight ?? 'Курс'}
              title={track.title}
              description={track.description}
              percent={track.progress}
              footer={track.updatedAt}
              highlight={`${track.progress >= 80 ? 'Приоритет: высокий' : 'В пути'}`}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <h3>Ближайшие занятия</h3>
          <span>Планируйте недели вперёд и держите группу в одном темпе.</span>
        </div>
        <div className={styles.sessionList}>
          {sessions.map(session => (
            <article key={session.id} className={styles.sessionCard}>
              <div className={styles.sessionBadge}>
                <PlayCircle size={18} />
                {session.focus ?? 'Live'}
              </div>
              <h4>{session.title}</h4>
              <p>{session.mentor}</p>
              <div className={styles.sessionMeta}>
                <span>
                  <Clock3 size={16} />
                  {session.start}
                </span>
                <span>{session.location}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
