import { cvData } from "@/data/cv-data"

interface EducationProps {
  isLoaded: boolean
}

export function Education({ isLoaded }: EducationProps) {
  return (
    <div
      className={`flex flex-col gap-6 transition-all duration-500 ease-out ${
        isLoaded ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-[4px] translate-y-2"
      }`}
      style={{ transitionDelay: "550ms" }}
    >
      <h2 className="text-sm text-neutral-400 uppercase">EDUCATION</h2>
      <div className="flex flex-col gap-6">
        {cvData.education.map((edu) => (
          <div key={`${edu.school}-${edu.degree}`} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-neutral-900">{edu.school}</span>
              <span className="text-sm text-neutral-500">{edu.graduationYear}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-sm text-neutral-700">{edu.degree}</p>
              {edu.gpa && <span className="text-xs text-neutral-500">GPA: {edu.gpa}</span>}
            </div>
            <p className="text-sm text-neutral-600">{edu.field}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
