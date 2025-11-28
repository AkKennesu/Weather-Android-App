import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface IconProps {
    size?: number;
    color?: string;
}

export const TennisRacketIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor" }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Racket Head */}
            <Circle cx="12" cy="9" r="6" />
            {/* Handle */}
            <Path d="M12 15v6" />
            {/* Throat */}
            <Path d="M12 15l-2 2" />
            <Path d="M12 15l2 2" />
            {/* Strings (Horizontal) */}
            <Path d="M8 7h8" />
            <Path d="M7 9h10" />
            <Path d="M8 11h8" />
            {/* Strings (Vertical) */}
            <Path d="M12 5v8" />
            <Path d="M10 5.5v7" />
            <Path d="M14 5.5v7" />
        </Svg>
    );
};
