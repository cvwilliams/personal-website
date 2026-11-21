export const site = {
  name: 'Cameron Williams',
  intro: 'Engineer, tinkerer, overthinker',
  /** The homepage's <title>: name plus role and city, to tell this Cameron Williams apart in search. */
  title: 'Cameron Williams · Software engineer in New York',
  description:
    "Cameron Williams is a software engineer in New York who builds mobile apps, currently working on Bitkey at Block. Projects, writing and what he's up to now.",
  url: 'https://cameronwillia.ms',
  location: 'New York, NY',
  goodreadsUserId: '52174720',
  links: {
    github: 'https://github.com/cvwilliams',
    linkedin: 'https://linkedin.com/in/cameronvwilliams',
    email: '',
  },
} as const;

export type Section = 'resume' | 'projects' | 'thoughts' | 'now' | 'about';

export const sections: { id: Section; label: string; href: string }[] = [
  { id: 'now', label: 'Now', href: '/now' },
  { id: 'projects', label: 'Projects', href: '/projects' },
  { id: 'thoughts', label: 'Thoughts', href: '/thoughts' },
  { id: 'resume', label: 'Resume', href: '/resume' },
  { id: 'about', label: 'About', href: '/about' },
];
