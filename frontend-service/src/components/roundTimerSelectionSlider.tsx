import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { useState, useEffect } from "react";
import { getTimerPreferences, saveTimerPreferences } from "../services/userPreferences";
import { TIMER_OPTIONS } from "../objects/roundTimerSliderOptions";

interface TimeSliderProps {
	onChange: (hasTimer: boolean, timeMs: number) => void;
}

const roundTimerSelectionSlider = ({ onChange }: TimeSliderProps) => {
    // Get saved preferences or default to "No timer"
    const savedPrefs = getTimerPreferences();
    const defaultIndex = savedPrefs.roundTimerIndex;

    const [index, setIndex] = useState(defaultIndex);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Initially call onChange to register previous timer preference if it exists
        onChange(savedPrefs.hasTimer, savedPrefs.roundTimeMs);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSliderValueChange = ([index]: number[]) => {
        setIndex(index);
        const { timeMs } = TIMER_OPTIONS[index];
        const hasTimer = timeMs > 0;

        saveTimerPreferences({
            roundTimerIndex: index,
            roundTimeMs: timeMs,
            hasTimer
        });

        onChange(hasTimer, timeMs);
    };

    return (
        <div className="w-full p-4 bg-background rounded-lg border border-border shadow-sm">
            <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-6"
                min={0}
                max={TIMER_OPTIONS.length - 1}
                step={1}
                value={[index]}
                onValueChange={handleSliderValueChange}
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

export default roundTimerSelectionSlider