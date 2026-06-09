"use client";

import { useState } from "react";
import { MaterialType } from "@/types";

interface Material {
  id: string;
  title: string;
  type: MaterialType;
  contentUrl: string;
  order: number;
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

const typeLabels: Record<MaterialType, string> = {
  VIDEO: "Video", PDF: "PDF", DOCUMENT: "Dokumen", LINK: "Tautan",
};

const typeColors: Record<MaterialType, string> = {
  VIDEO: "bg-red-100 text-red-700",
  PDF: "bg-orange-100 text-orange-700",
  DOCUMENT: "bg-blue-100 text-blue-700",
  LINK: "bg-green-100 text-green-700",
};

export default function MaterialList({ modules, completedMaterialIds = [], onMarkComplete, isEnrolled = false }: MaterialListProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(modules.map((m) => m.id)));

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  }

  if (modules.length === 0) {
    return <div className="text-center py-8 text-gray-500">Belum ada modul</div>;
  }

  return (
    <div className="space-y-4">
      {modules.map((module) => {
        const isExpanded = expandedModules.has(module.id);
        const completedCount = module.materials.filter((m) => completedMaterialIds.includes(m.id)).length;
        return (
          <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{module.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {module.materials.length} materi
                  {isEnrolled && module.materials.length > 0 && (
                    <span className="ml-2 text-blue-600">{completedCount}/{module.materials.length} selesai</span>
                  )}
                </p>
              </div>
              <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {module.materials.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-gray-500">Belum ada materi</p>
                ) : (
                  module.materials.map((material) => {
                    const isCompleted = completedMaterialIds.includes(material.id);
                    return (
                      <div key={material.id} className={`px-5 py-4 flex items-center gap-4 ${isCompleted ? "bg-green-50" : "bg-white"}`}>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[material.type]}`}>
                          {typeLabels[material.type]}
                        </span>
                        <p className="text-sm font-medium text-gray-900 flex-1">{material.title}</p>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <a href={material.contentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-xs font-medium">Buka</a>
                          {isEnrolled && onMarkComplete && (
                            <button
                              onClick={() => !isCompleted && onMarkComplete(material.id)}
                              disabled={isCompleted}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isCompleted ? "border-green-500 bg-green-500" : "border-gray-300 hover:border-green-400"
                              }`}
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
      })}
    </div>
  );
}
