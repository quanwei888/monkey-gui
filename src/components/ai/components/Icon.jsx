import React from 'react';

export const PlayIcon = () => {
    return (
        <svg viewBox="0 0 1024 1024"
             xmlns="http://www.w3.org/2000/svg"
             width="30" height="30"
             fill={"currentColor"}
        >
            <path
                d="M213.333333 65.386667a85.333333 85.333333 0 0 1 43.904 12.16L859.370667 438.826667a85.333333 85.333333 0 0 1 0 146.346666L257.237333 946.453333A85.333333 85.333333 0 0 1 128 873.28V150.72a85.333333 85.333333 0 0 1 85.333333-85.333333z m0 64a21.333333 21.333333 0 0 0-21.184 18.837333L192 150.72v722.56a21.333333 21.333333 0 0 0 30.101333 19.456l2.197334-1.152L826.453333 530.282667a21.333333 21.333333 0 0 0 2.048-35.178667l-2.048-1.386667L224.298667 132.416A21.333333 21.333333 0 0 0 213.333333 129.386667z"
            ></path>
        </svg>
    );
};

export const PlayNextIcon = () => {
    return (
        <svg
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            width={30}
            height={30}
            fill={"currentColor"}
        >
            <path
                d="M32 820.48V203.52a96 96 0 0 1 141.76-84.48l569.6 308.48a96 96 0 0 1 0 168.96l-569.6 308.48A96 96 0 0 1 32 820.48zM96 203.52v616.96a32 32 0 0 0 47.36 28.16l569.6-308.48a32 32 0 0 0 0-56.32L143.36 175.36A32 32 0 0 0 96 203.52zM960 928a32 32 0 0 1-32-32V128a32 32 0 0 1 64 0v768a32 32 0 0 1-32 32z"
            />
        </svg>
    );
};
export const VoiceIcon = () => {
    return (
        <svg width="30" height="30" viewBox="0 0 20 20" fill={"currentColor"} xmlns="http://www.w3.org/2000/svg"
             className="icon">
            <path
                d="M7.33496 15.5V4.5C7.33496 4.13275 7.63275 3.83499 8 3.83496C8.36727 3.83496 8.66504 4.13273 8.66504 4.5V15.5C8.66504 15.8673 8.36727 16.165 8 16.165C7.63275 16.165 7.33496 15.8673 7.33496 15.5ZM11.335 13.1309V7.20801C11.335 6.84075 11.6327 6.54298 12 6.54297C12.3673 6.54297 12.665 6.84074 12.665 7.20801V13.1309C12.665 13.4981 12.3672 13.7959 12 13.7959C11.6328 13.7959 11.335 13.4981 11.335 13.1309ZM3.33496 11.3535V8.81543C3.33496 8.44816 3.63273 8.15039 4 8.15039C4.36727 8.15039 4.66504 8.44816 4.66504 8.81543V11.3535C4.66504 11.7208 4.36727 12.0186 4 12.0186C3.63273 12.0186 3.33496 11.7208 3.33496 11.3535ZM15.335 11.3535V8.81543C15.335 8.44816 15.6327 8.15039 16 8.15039C16.3673 8.15039 16.665 8.44816 16.665 8.81543V11.3535C16.665 11.7208 16.3673 12.0186 16 12.0186C15.6327 12.0186 15.335 11.7208 15.335 11.3535Z"></path>
        </svg>

    );
};
export const LoadingIcon = () => {
    return (
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#3498db" stop-opacity="1"/>
                    <stop offset="100%" stop-color="#3498db" stop-opacity="0.2"/>
                </linearGradient>
            </defs>

            <circle cx="50" cy="50" r="40" stroke="#e0e0e0" stroke-width="8" fill="none"/>

            <circle cx="50" cy="50" r="40" stroke="url(#gradient)" stroke-width="8" fill="none"
                    stroke-dasharray="80 175">
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    dur="1.5s"
                    repeatCount="indefinite"/>
            </circle>

        </svg>
    );
};

export const RecordingIcon = () => {
    return (
        <svg width="100" height="100" viewBox="0 0 100 100" fill={"currentColor"} xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" fill="#f0f0f0"/>
            <circle cx="50" cy="50" r="15" fill="#ff3b30"/>
            <circle cx="50" cy="50" r="15" fill="#ff3b30" opacity="0.8">
                <animate attributeName="r" values="15;35;15" dur="2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="50" cy="50" r="15" fill="#ff3b30" opacity="0.6">
                <animate attributeName="r" values="15;35;15" dur="2s" begin="0.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" begin="0.5s" repeatCount="indefinite"/>
            </circle>
        </svg>
    );
};

export const SpeakingIcon = () => {
    return (
        <svg fill={"currentColor"} width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
            <rect className="bar" x="20" y="40" width="8" height="20" rx="4">
                <animate attributeName="height" values="10;40;10" dur="1s" repeatCount="indefinite" begin="0.1s"/>
                <animate attributeName="y" values="45;25;45" dur="1s" repeatCount="indefinite" begin="0.1s"/>
            </rect>

            <rect className="bar" x="36" y="30" width="8" height="40" rx="4">
                <animate attributeName="height" values="10;45;10" dur="1.1s" repeatCount="indefinite" begin="0.2s"/>
                <animate attributeName="y" values="45;22.5;45" dur="1.1s" repeatCount="indefinite" begin="0.2s"/>
            </rect>

            <rect className="bar" x="52" y="35" width="8" height="30" rx="4">
                <animate attributeName="height" values="10;35;10" dur="1.3s" repeatCount="indefinite" begin="0.3s"/>
                <animate attributeName="y" values="45;27.5;45" dur="1.3s" repeatCount="indefinite" begin="0.3s"/>
            </rect>

            <rect className="bar" x="68" y="25" width="8" height="50" rx="4">
                <animate attributeName="height" values="10;50;10" dur="0.8s" repeatCount="indefinite" begin="0.4s"/>
                <animate attributeName="y" values="45;20;45" dur="0.8s" repeatCount="indefinite" begin="0.4s"/>
            </rect>

            <rect className="bar" x="84" y="30" width="8" height="40" rx="4">
                <animate attributeName="height" values="10;45;10" dur="0.9s" repeatCount="indefinite" begin="0.5s"/>
                <animate attributeName="y" values="45;22.5;45" dur="0.9s" repeatCount="indefinite" begin="0.5s"/>
            </rect>

            <rect className="bar" x="100" y="35" width="8" height="30" rx="4">
                <animate attributeName="height" values="10;35;10" dur="1.2s" repeatCount="indefinite" begin="0.1s"/>
                <animate attributeName="y" values="45;27.5;45" dur="1.2s" repeatCount="indefinite" begin="0.1s"/>
            </rect>

            <rect className="bar" x="116" y="28" width="8" height="44" rx="4">
                <animate attributeName="height" values="10;40;10" dur="1s" repeatCount="indefinite" begin="0.3s"/>
                <animate attributeName="y" values="45;25;45" dur="1s" repeatCount="indefinite" begin="0.3s"/>
            </rect>

            <rect className="bar" x="132" y="33" width="8" height="34" rx="4">
                <animate attributeName="height" values="10;30;10" dur="1.1s" repeatCount="indefinite" begin="0.4s"/>
                <animate attributeName="y" values="45;30;45" dur="1.1s" repeatCount="indefinite" begin="0.4s"/>
            </rect>

            <rect className="bar" x="148" y="40" width="8" height="20" rx="4">
                <animate attributeName="height" values="10;25;10" dur="0.9s" repeatCount="indefinite" begin="0.5s"/>
                <animate attributeName="y" values="45;32.5;45" dur="0.9s" repeatCount="indefinite" begin="0.5s"/>
            </rect>

            <rect className="bar" x="164" y="37" width="8" height="26" rx="4">
                <animate attributeName="height" values="10;30;10" dur="1.2s" repeatCount="indefinite" begin="0.2s"/>
                <animate attributeName="y" values="45;30;45" dur="1.2s" repeatCount="indefinite" begin="0.2s"/>
            </rect>
        </svg>

    );
};

