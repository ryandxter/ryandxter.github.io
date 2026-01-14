"use client"

import { cvData } from "@/data/cv-data"

interface SkillsProps {
  isLoaded: boolean
}

export function Skills({ isLoaded }: SkillsProps) {
  return (
    <div
      className={`flex flex-col gap-8 transition-all duration-500 ease-out ${
        isLoaded ? "opacity-100 blur-none translate-y-0" : "opacity-0 blur-[4px] translate-y-2"
      }`}
      style={{ transitionDelay: "500ms" }}
    >
      <h2 className="text-sm text-neutral-400 uppercase">SKILLS</h2>
      <div className="flex flex-col gap-8">
        {cvData.skills.map((skillGroup) => (
          <div key={skillGroup.category} className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-neutral-900">{skillGroup.category}</h3>
            <div className="flex flex-col gap-3">
              {skillGroup.items.map((skill) => (
                <div key={skill.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">{skill.name}</span>
                    <span className="text-xs text-neutral-400">{skill.level}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: isLoaded ? `${skill.level}%` : "0%",
                        transitionDelay: "100ms",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
