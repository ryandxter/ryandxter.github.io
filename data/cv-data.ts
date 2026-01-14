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
    name: "Yadwinder Singh",
    title: "Freelance Product Designer",
    email: "yadwinder.design@gmail.com",
    location: "India",
    bio: "Passionate product designer with 5+ years of experience creating intuitive and beautiful digital experiences. Specialized in UI/UX design, design systems, and user research.",
  },
  social: [
    {
      label: "Email",
      href: "mailto:yadwinder.design@gmail.com",
      value: "yadwinder.design@gmail.com",
    },
    {
      label: "Twitter",
      href: "https://x.com/ydwndr",
    },
    {
      label: "Dribbble",
      href: "https://dribbble.com/yadwinders",
    },
    {
      label: "GitHub",
      href: "https://github.com/singh-yadwinder",
    },
  ],
  experience: [
    {
      company: "TechNova",
      position: "Senior Product Designer",
      period: "2023 - present",
      description: "Leading UX design for cutting-edge AI-powered productivity tools.",
      highlights: [
        "Designed and shipped 10+ major features",
        "Led design system implementation",
        "Improved user satisfaction by 35%",
      ],
    },
    {
      company: "QuantumLeap",
      position: "Product Designer",
      period: "2021 - 2023",
      description:
        "Spearheaded the design of quantum computing visualization interfaces, bridging complex data with intuitive user experiences.",
      highlights: [
        "Created interactive visualization components",
        "Collaborated with 5+ engineers",
        "Published design case studies",
      ],
    },
    {
      company: "EcoSphere",
      position: "Junior Product Designer",
      period: "2019 - 2021",
      description: "Designed sustainable product packaging and digital experiences for eco-friendly consumer goods.",
      highlights: [
        "Led redesign of main product",
        "Conducted user research interviews",
        "Improved conversion rate by 28%",
      ],
    },
  ],
  education: [
    {
      school: "National Institute of Design",
      degree: "Bachelor of Design",
      field: "Product Design",
      graduationYear: 2019,
      gpa: "3.8/4.0",
    },
    {
      school: "Google Design Certificate",
      degree: "Professional Certificate",
      field: "UX/UI Design",
      graduationYear: 2021,
    },
  ],
  skills: [
    {
      category: "Design Tools",
      items: [
        { name: "Figma", level: 95 },
        { name: "Adobe XD", level: 85 },
        { name: "Sketch", level: 80 },
        { name: "Protopie", level: 75 },
      ],
    },
    {
      category: "Design Skills",
      items: [
        { name: "UI Design", level: 95 },
        { name: "UX Design", level: 90 },
        { name: "User Research", level: 85 },
        { name: "Design Systems", level: 80 },
        { name: "Prototyping", level: 85 },
      ],
    },
    {
      category: "Frontend Development",
      items: [
        { name: "HTML/CSS", level: 80 },
        { name: "JavaScript", level: 75 },
        { name: "React", level: 70 },
        { name: "TypeScript", level: 65 },
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
