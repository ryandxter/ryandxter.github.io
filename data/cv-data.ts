export interface CVData {
  personal: {
    name: string
    title: string
    email: string
    phone?: string
    location?: string
    bio: string
  }
  social: {
    label: string
    href: string
    value?: string
  }[]
  experience: {
    company: string
    position: string
    period: string
    description: string
    highlights?: string[]
  }[]
  education: {
    school: string
    degree: string
    field: string
    graduationYear: number
    gpa?: string
  }[]
  skills: {
    category: string
    items: {
      name: string
      level: number // 0-100
      icon?: string
    }[]
  }[]
  projects: {
    title: string
    description: string
    image?: string
    technologies: string[]
    link?: string
    github?: string
  }[]
}

export const cvData: CVData = {
  personal: {
    name: "Riansyah Rizky Poetra",
    title: "R&D Photography Videography - System",
    email: "ryndxtr@gmail.com",
    location: "Indonesia",
    bio: "Passionate product designer with 5+ years of experience creating intuitive and beautiful digital experiences. Specialized in UI/UX design, design systems, and user research.",
  },
  social: [
    {
      label: "Email",
      href: "mailto:ryndxtr@gmail.com",
      value: "ryndxtr@gmail.com",
    },
    {
      label: "Twitter",
      href: "https://x.com/ryandxter",
    },
    {
      label: "GitHub",
      href: "https://github.com/ryandxter",
    },
  ],
  experience: [
    {
      company: "Reflection Photography",
      position: "R&D, Production Manager",
      period: "2018 - present",
      description: "Escalate business development by creating innovative photography and videography products and services that meet market needs.",
      highlights: [
        "Developing new photography techniques",
        "Breakthrough in retail studio business",
      ],
    },
  ],
  education: [
    {
      school: "Yogyakarta State University",
      degree: "Bachelor of Education",
      field: "Educational Technology",
      graduationYear: 2017,
      gpa: "3.48/4.0",
    },
  ],
  skills: [
    {
      category: "Photography & Videography",
      items: [
        { name: "Camera", level: 90 },
        { name: "Lighting", level: 90 },
        { name: "Still Editing", level: 80 },
        { name: "Motion Editing", level: 50 },
      ],
    },
    {
      category: "Tech Skills",
      items: [
        { name: "UI/UX Design", level: 80 },
        { name: "Basic Coding", level: 40 },
        { name: "AI Prompting", level: 75 },
      ],
    },
  ],
  projects: [
    {
      title: "AI Productivity Suite",
      description: "A comprehensive productivity tool powered by AI, helping teams manage projects more efficiently.",
      technologies: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
      link: "https://example.com",
      github: "https://github.com",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
    },
    {
      title: "Design System",
      description: "A comprehensive design system for enterprise applications with 200+ components.",
      technologies: ["Figma", "React Storybook", "CSS-in-JS"],
      link: "https://example.com",
    },
    {
      title: "Mobile Shopping App",
      description: "E-commerce mobile application with intuitive shopping experience and seamless checkout.",
      technologies: ["React Native", "Firebase", "Stripe"],
      link: "https://example.com",
    },
  ],
}
