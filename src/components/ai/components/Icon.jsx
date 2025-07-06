import React from 'react';

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

// 发送图标SVG
export const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
         stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
    </svg>
);

// 播放图标SVG
export const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
         stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
);

// 暂停图标SVG
export const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
         stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
);

// 加载动画SVG
export const LoadingSpinner = () => (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// 麦克风图标SVG
export const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg"   fill="none" viewBox="0 0 24 24"
         stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
    </svg>
);

// 添加一个录音中的图标组件
export const RecordingMicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24"   fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="22"></line>
        <circle cx="12" cy="12" r="8" strokeDasharray="30" strokeDashoffset="0" className="animate-pulse"></circle>
    </svg>
);

export const MuteIcon = ({ isMuted }) => (
    isMuted ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15 9.34V4.8c0-1.71 1.47-2.44 2.47-1.44L22 8l-4.53 4.64c-1 1-2.47.27-2.47-1.44V9.34z"></path>
        </svg>
    )
);

export const HelpIcon = () => {
    return (
        <svg width="30" height="30" viewBox="0 0 20 20" fill={"currentColor"} xmlns="http://www.w3.org/2000/svg"
             className="icon">
            <path
                d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 3.33333C13.6819 3.33333 16.6667 6.31814 16.6667 10C16.6667 13.6819 13.6819 16.6667 10 16.6667C6.31814 16.6667 3.33333 13.6819 3.33333 10C3.33333 6.31814 6.31814 3.33333 10 3.33333ZM7.5 6.5C7.22386 6.5 7 6.72386 7 7V13C7 13.2761 7.22386 13.5 7.5 13.5C7.77614 13.5 8 13.2761 8 13V7C8 6.72386 7.77614 6.5 7.5 6.5ZM10 8C9.72386 8 9.5 8.22386 9.5 8.5V11.5C9.5 11.7761 9.72386 12 10 12C10.2761 12 10.5 11.7761 10.5 11.5V8.5C10.5 8.22386 10.2761 8 10 8ZM12.5 6.5C12.2239 6.5 12 6.72386 12 7V13C12 13.2761 12.2239 13.5 12.5 13.5C12.7761 13.5 13 13.2761 13 13V7C13 6.72386 12.7761 6.5 12.5 6.5Z"></path>
        </svg>
    );
};

export const ShareIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 8.5V5a3 3 0 10-6 0v3.5M12 15v-7.5M19.07 12.93a2.5 2.5 0 10-2.12 2.12l2.12-2.12zm-14.14 0a2.5 2.5 0 102.12-2.12l-2.12 2.12z"
        />
    </svg>
);
