import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {compose} from 'redux';

import Box from '../components/box/box.jsx';
import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';

import {setPlayer} from '../reducers/mode';

import styles from './player.css';

const Player = ({isPlayerOnly, onSeeInside, projectId}) => (
    <Box className={classNames(isPlayerOnly ? styles.stageOnly : styles.editor)}>
        <GUI
            canEditTitle
            enableCommunity
            isPlayerOnly={true}
            projectId={projectId}
        />
    </Box>
);

Player.propTypes = {
    isPlayerOnly: PropTypes.bool,
    onSeeInside: PropTypes.func,
    projectId: PropTypes.string
};

/*
 * Render the player mode. This is a separate function because importing anything
 * that instantiates the VM causes unsupported browsers to crash
 * @param {object} appTarget - the DOM element to render to
 * @param {string} projectId - optional project ID to load
 */
export default (appTarget, projectId) => {
    if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
        // Warn before navigating away
        window.onbeforeunload = () => true;
    }

    // Map state to props function that respects passed in projectId
    const mapStateToProps = state => ({
        isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
        // Use passed projectId if available, otherwise use default or from state
        projectId: projectId
    });

    const mapDispatchToProps = dispatch => ({
        onSeeInside: () => dispatch(setPlayer(false))
    });

    const ConnectedPlayer = connect(
        mapStateToProps,
        mapDispatchToProps
    )(Player);

    // Note that redux's 'compose' function is just being used as a general utility to make
    // the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
    // ability to compose reducers.
    const WrappedPlayer = compose(
        AppStateHOC,
        HashParserHOC
    )(ConnectedPlayer);

    ReactDOM.render(
        <WrappedPlayer
            isPlayerOnly
            projectId={projectId}  // Pass projectId to the wrapped component
        />,
        appTarget
    );
};
