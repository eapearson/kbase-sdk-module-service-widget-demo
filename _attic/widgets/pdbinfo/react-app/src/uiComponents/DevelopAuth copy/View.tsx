import { Component, createRef } from 'react';
import Button from 'react-bootstrap/esm/Button';
// import { Authentication, AuthenticationStatus } from '../../redux/auth/store';
// import { DevelopState, DevelopStateError, DevelopStateReady, DevelopStatus } from '../../redux/develop/store';
import { faSignIn, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Form from 'react-bootstrap/esm/Form';
import { SimpleError } from '../widgetSupport';
import { DevelopAuthentication, DevelopAuthStatus } from './index';
import styles from './style.module.css';

export type Params<K extends string> = { [key in K]: string };


export interface DevelopAuthProps {
    authState: DevelopAuthentication;
    removeAuthentication: () => void;
    addAuthentication: (token: string) => void;
}

export type DevelopAuthState = {}

export default class DevelopAuth extends Component<DevelopAuthProps, DevelopAuthState> {
    tokenRef: React.RefObject<HTMLInputElement>;

    constructor(props: DevelopAuthProps) {
        super(props);

        this.tokenRef = createRef();
    }

    // Events

    onLoginClick() {
        if (this.tokenRef.current === null) {
            return;
        }
        const token = this.tokenRef.current.value;
        if (token.length === 0) {
            return;
        }
        this.props.addAuthentication(token);
    }

    onLogoutClick() {
        this.props.removeAuthentication();
    }

    // DEV

    renderAuthForm() {
        return (
            <div className={styles.authForm}>
                <div>
                    <b>Not Logged In!</b> Enter a Login Token below.
                </div>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <span>Token: </span>
                    <Form.Control ref={this.tokenRef} style={{ width: '30em', flex: '0 0 auto' }} />
                    <Button type="submit" onClick={this.onLoginClick.bind(this)}>
                        <FontAwesomeIcon icon={ faSignIn }  />{' '}Sign In
                    </Button>
                </div>
            </div>
        );
    }

    renderAuthToolbar() {
        if (this.props.authState.status !== DevelopAuthStatus.AUTHENTICATED) {
            return;
        }
        return (
            <div className={styles.authToolbar}>
                Logged in as{' '}
                <b>
                    <span>{this.props.authState.authentication.realname}</span> (
                    <span>{this.props.authState.authentication.username}</span>
                </b>
                ){' '}
                <Button onClick={this.onLogoutClick.bind(this)}>
                    < FontAwesomeIcon icon={faSignOut} />{' '}Sign Out
                </Button>
            </div>
        );
    }

    renderError(error: SimpleError) {
        return <div>Dev Error: ${error.message}</div>;
    }

    render() {
        switch (this.props.authState.status) {
            case DevelopAuthStatus.AUTHENTICATED:
                return <div className={`${styles.auth} ${styles.authAuthenticated} ${styles.scrollableFlexColumn}`}>{this.renderAuthToolbar()}</div>;
            case DevelopAuthStatus.UNAUTHENTICATED:
                return <div className={`${styles.auth} ${styles.authUnauthenticated} ${styles.scrollableFlexColumn}`}>{this.renderAuthForm()}</div>;
        }
    }
}
