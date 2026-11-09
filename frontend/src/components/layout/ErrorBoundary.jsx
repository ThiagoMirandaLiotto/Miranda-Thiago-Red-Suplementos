import { Component } from "react";
import styles from "./ErrorBoundary.module.css";

// Si un componente falla al renderizar, se muestra esta pantalla en lugar de una página en blanco.
export default class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error(error, info.componentStack);
    }

    render() {
        if (!this.state.error) return this.props.children;
        return (
            <main className={styles.pantalla}>
                <h1 className={styles.titulo}>Algo se rompió en esta pantalla</h1>
                <p>Volvé a cargar la página. Si el problema sigue, avisanos por Instagram.</p>
                <a className={styles.enlace} href="/">Volver al inicio</a>
            </main>
        );
    }
}
