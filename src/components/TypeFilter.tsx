import { SUBMISSION_TYPES } from "@/lib/validators";

interface TypeFilterProps {
  activeType: string;
  onTypeChange: (type: string) => void;
}

export const typeLabelMap: Record<string, string> = {
  all: "全部",
  poetry: "诗词",
  food: "美食",
  painting: "绘画",
  fashion: "穿搭",
  music: "音乐",
  other: "其他",
};

export const typeColorMap: Record<string, string> = {
  all: "bg-ink/5 border-ink/10 text-ink hover:bg-ink/10",
  poetry: "bg-orchid/10 border-orchid/20 text-orchid hover:bg-orchid/15",
  food: "bg-[rgb(166,123,91)]/10 border-[rgb(166,123,91)]/20 text-[rgb(166,123,91)] hover:bg-[rgb(166,123,91)]/15",
  painting: "bg-mugwort/10 border-mugwort/20 text-mugwort hover:bg-mugwort/15",
  fashion: "bg-[rgb(196,145,142)]/10 border-[rgb(196,145,142)]/20 text-[rgb(196,145,142)] hover:bg-[rgb(196,145,142)]/15",
  music: "bg-[rgb(107,127,166)]/10 border-[rgb(107,127,166)]/20 text-[rgb(107,127,166)] hover:bg-[rgb(107,127,166)]/15",
  other: "bg-ink-light/10 border-ink-light/20 text-ink-light hover:bg-ink-light/15",
};

export const typeActiveColorMap: Record<string, string> = {
  all: "bg-ink text-paper border-ink",
  poetry: "bg-orchid text-paper border-orchid",
  food: "bg-[rgb(166,123,91)] text-paper border-[rgb(166,123,91)]",
  painting: "bg-mugwort text-paper border-mugwort",
  fashion: "bg-[rgb(196,145,142)] text-paper border-[rgb(196,145,142)]",
  music: "bg-[rgb(107,127,166)] text-paper border-[rgb(107,127,166)]",
  other: "bg-ink-light text-paper border-ink-light",
};

export default function TypeFilter({ activeType, onTypeChange }: TypeFilterProps) {
  const types = ["all", ...SUBMISSION_TYPES];

  return (
    <div className="flex flex-wrap gap-2 justify-center py-2">
      {types.map((type) => {
        const isActive = activeType === type;
        return (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
              isActive ? typeActiveColorMap[type] : typeColorMap[type]
            }`}
          >
            {typeLabelMap[type]}
          </button>
        );
      })}
    </div>
  );
}
