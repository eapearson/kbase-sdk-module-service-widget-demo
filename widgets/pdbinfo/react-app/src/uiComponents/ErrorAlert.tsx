import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Component, PropsWithChildren } from 'react';
import { Alert } from 'react-bootstrap';
import './ErrorAlert.css';

export type ErrorAlertProps = PropsWithChildren<{
    title?: string;
    message: string;
    render?: () => JSX.Element;
}>;

export default class ErrorAlert extends Component<ErrorAlertProps> {
    renderTitle() {
        const title = this.props.title || 'Error!';
        return (
            <span>
                <FontAwesomeIcon icon={faTriangleExclamation} style={{ marginRight: '0.5em' }} />
                {title}
            </span>
        );
    }
    render() {
        const content = (() => {
            if (this.props.render) {
                return this.props.render();
            }
            return this.props.message || this.props.children;
        })();
        return (
            <Alert variant="danger" className="ErrorAlert">
                <Alert.Heading>{this.renderTitle()}</Alert.Heading>
                {content}
            </Alert>
        );
    }
}
