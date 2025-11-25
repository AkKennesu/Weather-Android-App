import SunCalc from 'suncalc';
import { Moon, Circle, CircleDot } from 'lucide-react-native';

export const getMoonPhase = (date: Date) => {
    const moonIllumination = SunCalc.getMoonIllumination(date);
    const phase = moonIllumination.phase; // 0.0 to 1.0

    let label = '';
    let icon = Moon;

    if (phase === 0 || phase === 1) {
        label = 'New Moon';
        icon = Circle; // Representing empty/new
    } else if (phase < 0.25) {
        label = 'Waxing Crescent';
        icon = Moon;
    } else if (phase === 0.25) {
        label = 'First Quarter';
        icon = CircleDot; // Approximate
    } else if (phase < 0.5) {
        label = 'Waxing Gibbous';
        icon = Moon;
    } else if (phase === 0.5) {
        label = 'Full Moon';
        icon = Circle; // Filled
    } else if (phase < 0.75) {
        label = 'Waning Gibbous';
        icon = Moon;
    } else if (phase === 0.75) {
        label = 'Last Quarter';
        icon = CircleDot;
    } else {
        label = 'Waning Crescent';
        icon = Moon;
    }

    return {
        phase,
        label,
        icon,
        fraction: moonIllumination.fraction // Illuminated fraction
    };
};
