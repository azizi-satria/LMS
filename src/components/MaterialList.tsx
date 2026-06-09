"use client";

import { useState } from "react";
import { MaterialType } from "@/types";

interface Material {
  id: string;
  title: string;
  type: MaterialType;
  contentUrl: string;
  order: number;
  progress?: { completedAt: Date }[];
}

interface Module {
  id: string;
  title: string;
  order: number;
  materials: Material[];
}

interface MaterialListProps {
  modules: Module[];
  completedMaterialIds?: string[];
  onMarkComplete?: (materialId: string) => void;
  isEnrolled?: boolean;
}

const materialTypeLabels: Record<MaterialType, string> = {
  VIDEO: "Video",
  PDF: "PDF",
  DOCUMENT: "Dokumen",
  LINK: "Tautan",
};

const materialTypeIcons: Record<MaterialType, React.ReactNode> = {
  VIDEO: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  PDF: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  DOCUMENT: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  LINK: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
};

const materialTypeStyles: Record<MaterialType, { bg: string; color: string; border: string }> = {
  VIDEO: { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.25)" },
  PDF: { bg: "rgba(249,115,22,0.12)", color: "#fb923c", border: "rgba(249,115,22,0.25)" },
  DOCUMENT: { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  LINK: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
};

export default function MaterialList({
  modules,
  completedMaterialIds = [],
  onMarkComplete,
  isEnrolled = false,
}: MaterialListProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {modules.length === 0 ? (
        <div className="text-center py-10" style={{ color: "#64748b" }}>
          <svg
            className="w-12 h-12 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "#334155" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>Belum ada modul</p>
        </div>
      ) : (
        modules.map((module) => {
          const isExpanded = expandedModules.has(module.id);
          const completedCount = module.materials.filter((m) =>
            completedMaterialIds.includes(m.id)
          ).length;

          return (
            <div
              key={module.id}
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #1e1e2e" }}
            >
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderBottom: isExpanded ? "1px solid #1e1e2e" : "none",
                }}
              >
                <div>
                  <h3 className="font-semibold" style={{ color: "#f1f5f9" }}>{module.title}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                    {module.materials.length} materi
                    {isEnrolled && module.materials.length > 0 && (
                      <span className="ml-2" style={{ color: "#a855f7" }}>
                        {completedCount}/{module.materials.length} selesai
                      </span>
                    )}
                  </p>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "#64748b" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div>
                  {module.materials.length === 0 ? (
                    <p className="px-5 py-4 text-sm" style={{ color: "#64748b" }}>Belum ada materi</p>
                  ) : (
                    module.materials.map((material, idx) => {
                      const isCompleted = completedMaterialIds.includes(material.id);
                      const typeStyle = materialTypeStyles[material.type];
                      return (
                        <div
                          key={material.id}
                          className="px-5 py-3.5 flex items-center gap-4 transition-all"
                          style={{
                            borderTop: idx > 0 ? "1px solid rgba(255,255,255,0.04)" : "none",
                            background: isCompleted
                              ? "rgba(16,185,129,0.04)"
                              : "transparent",
                          }}
                        >
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                              background: typeStyle.bg,
                              color: typeStyle.color,
                              border: `1px solid ${typeStyle.border}`,
                            }}
                          >
                            {materialTypeIcons[material.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
                              {material.title}
                            </p>
                            <span
                              className="text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 inline-block"
                              style={{
                                background: typeStyle.bg,
                                color: typeStyle.color,
                              }}
                            >
                              {materialTypeLabels[material.type]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <a
                              href={material.contentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium transition-colors"
                              style={{ color: "#a855f7" }}
                            >
                              Buka
                            </a>
                            {isEnrolled && onMarkComplete && (
                              <button
                                onClick={() => !isCompleted && onMarkComplete(material.id)}
                                disabled={isCompleted}
                                className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                                style={
                                  isCompleted
                                    ? {
                                        borderColor: "#10b981",
                                        background: "#10b981",
                                        boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                                      }
                                    : {
                                        borderColor: "#334155",
                                      }
                                }
                                title={isCompleted ? "Selesai" : "Tandai selesai"}
                              >
                                {isCompleted && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
