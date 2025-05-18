import React from "react";
import * as Slider from "@radix-ui/react-slider";
import { useState } from "react";

const DESKTOP_OPTIONS = ["5 seconds", "10 seconds", "20 seconds", "30 seconds", "50 seconds", "No timer"];
const MOBILE_OPTIONS = ["5s", "10s", "20s", "50s", "No timer"];

export default function DiscreteTimeSlider() {
    const [index, setIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const OPTIONS = isMobile ? MOBILE_OPTIONS : DESKTOP_OPTIONS;

    return (
        <div className="w-full p-4 bg-background rounded-lg border border-border shadow-sm">
            <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-6"
                min={0}
                max={OPTIONS.length - 1}
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
                {OPTIONS.map((label, i) => (
                    <span 
                        key={i} 
                        className={`text-center px-1 ${index === i ? "text-foreground font-medium" : ""}`}
                    >
                        {label}
                    </span>
                ))}
            </div>
        </div>
    );
}
