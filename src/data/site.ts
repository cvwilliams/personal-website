export const site = {
  name: 'Cameron Williams',
  intro: 'Engineer, tinkerer, overthinker',
  description: 'Resume, projects, thoughts and what Cameron Williams is working on now.',
  url: 'https://cameronwillia.ms',
  links: {
    github: 'https://github.com/cvwilliams',
    linkedin: 'https://linkedin.com/in/cameronvwilliams',
    email: '',
  },
} as const;

export type Section = 'resume' | 'projects' | 'thoughts' | 'now';

export const sections: { id: Section; label: string; href: string }[] = [
  { id: 'now', label: 'Now', href: '/now' },
  { id: 'projects', label: 'Projects', href: '/projects' },
  { id: 'thoughts', label: 'Thoughts', href: '/thoughts' },
  { id: 'resume', label: 'Resume', href: '/resume' },
];
