import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QrCode({ value, size = 200 }) {
    if (!value) return null;

    return (
        <div style={styles.container}>
            <QRCodeSVG
                value={value}
                size={size}
                level="M"
                bgColor="#ffffff"
                fgColor="#111111"
            />
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        padding: '1.25rem',
        background: '#ffffff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        width: 'fit-content',
    },
};