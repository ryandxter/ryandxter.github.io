import { cvData } from "@/data/cv-data"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"
import { OptimizedGalleryImage } from "@/components/OptimizedGalleryImage"

interface ProjectsProps {
  isLoaded: boolean
}

export function Projects({ isLoaded }: ProjectsProps) {
  return (
    <div
      className={`flex flex-col gap-8 transition-all duration-500 ease-out ${
        isLoaded ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-[4px] translate-y-2"
      }`}
      style={{ transitionDelay: "450ms" }}
    >
      <h2 className="text-sm text-neutral-400 uppercase">PROJECTS</h2>
      <div className="grid gap-6">
        {cvData.projects.map((project, index) => (
          <div
            key={project.title}
            className="border border-neutral-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-300 group"
          >
            {project.image && (
              <div className="mb-4 w-full h-48 relative rounded-md overflow-hidden bg-neutral-100">
                <OptimizedGalleryImage
                  src={project.image}
                  alt={project.title}
                  width={600}
                  height={192}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px"
                  quality={85}
                />
              </div>
            )}
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">{project.title}</h3>
            <p className="text-sm text-neutral-600 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              {project.link && (
                <Button variant="outline" size="sm" asChild className="gap-2 h-8">
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Visit
                  </a>
                </Button>
              )}
              {project.github && (
                <Button variant="outline" size="sm" asChild className="gap-2 h-8">
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
