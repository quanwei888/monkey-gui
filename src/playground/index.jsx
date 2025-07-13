// Polyfills
import 'es6-object-assign/auto';
import 'core-js/fn/array/includes';
import 'core-js/fn/promise/finally';
import 'intl'; // For Safari 9

import React from 'react';
import ReactDOM from 'react-dom';

import AppStateHOC from '../lib/app-state-hoc.jsx';
import BrowserModalComponent from '../components/browser-modal/browser-modal.jsx';
import supportedBrowser from '../lib/supported-browser';

import styles from './index.css';
import queryString from "query-string";

const appTarget = document.createElement('div');
appTarget.className = styles.app;
document.body.appendChild(appTarget);

if (supportedBrowser()) {
    // 检查URL参数或路径
    const { player, projectId } = queryString.parse(window.location.search);

    if (player == "1") {
        // 播放器模式
        console.log('Loading player mode...');
        require('./player.jsx').default(appTarget,projectId);
    } else {
        // 编辑器模式（默认）
        console.log('Loading editor mode...');
        require('./render-gui.jsx').default(appTarget,projectId);
    }
} else {
    BrowserModalComponent.setAppElement(appTarget);
    const WrappedBrowserModalComponent = AppStateHOC(BrowserModalComponent, true /* localesOnly */);
    const handleBack = () => {};
    // eslint-disable-next-line react/jsx-no-bind
    ReactDOM.render(<WrappedBrowserModalComponent onBack={handleBack} />, appTarget);
}
