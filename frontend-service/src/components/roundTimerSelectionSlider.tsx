import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { useState, useEffect } from "react";

// Timer options data structure
export const TIMER_OPTIONS = [
	{ timeMs: 5000, desktopLabel: "5 seconds", mobileLabel: "5s" },
	{ timeMs: 10000, desktopLabel: "10 seconds", mobileLabel: "10s" },
	{ timeMs: 20000, desktopLabel: "20 seconds", mobileLabel: "20s" },
	{ timeMs: 30000, desktopLabel: "30 seconds", mobileLabel: "30s" },
	{ timeMs: 50000, desktopLabel: "50 seconds", mobileLabel: "50s" },
	{ timeMs: 0, desktopLabel: "No timer", mobileLabel: "No timer" }, // 0 means no timer
];

interface TimeSliderProps {
	onChange: (hasTimer: boolean, timeMs: number) => void;
}

export default function DiscreteTimeSlider({ onChange }: TimeSliderProps) {
    // Default to last index which is "No timer"
    const [index, setIndex] = useState(TIMER_OPTIONS.length - 1);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const { timeMs } = TIMER_OPTIONS[index];
        const hasTimer = timeMs > 0;
        onChange(hasTimer, timeMs);
    }, [index, onChange]);

    return (
        <div className="w-full p-4 bg-background rounded-lg border border-border shadow-sm">
            <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-6"
                min={0}
                max={TIMER_OPTIONS.length - 1}
                step={1}
                value={[index]}
                onValueChange={([i]) => setIndex(i)}
            >
                <Slider.Track className="bg-blue-300 relative grow rounded-full h-[0.375rem]">
                    <Slider.Range className="absolute bg-blue-800 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-5 h-5 bg-blue-800 hover:bg-blue-800/90 rounded-full shadow-md" />
            </Slider.Root>

            <div className="flex justify-between mt-3 text-muted-foreground text-sm">
                {TIMER_OPTIONS.map((option, i) => (
                    <span 
                        key={i} 
                        className={`text-center px-1 ${index === i ? "text-foreground font-medium" : ""}`}
                    >
                        {isMobile ? option.mobileLabel : option.desktopLabel}
                    </span>
                ))}
            </div>
        </div>
    );
}
