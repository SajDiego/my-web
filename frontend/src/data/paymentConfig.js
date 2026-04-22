// Configuración de Métodos de Pago e Instrucciones
export const metodosPorMoneda = {
    ARS: ['Mercado Pago', 'Transferencia Bancaria', 'PagoFacil / Rapipago', 'QR'],
    USD: ['AstroPay', 'Binance Pay']
};

export const bankAccounts = [
    {
        banco: 'AstroPay',
        numero: '0000177500092064038112',
        tipo: 'CVU',
        alias: 'integralpro.cr',
        titular: 'Diego Fernando Saj'
    },
    {
        banco: 'NaranjaX',
        numero: '4530000800015867566941',
        tipo: 'CBU',
        alias: 'DSAJ.NX.ARS',
        titular: 'Diego Fernando Saj'
    },
    {
        banco: 'Brubank',
        numero: '1430001713024552310013',
        tipo: 'CBU',
        alias: 'Diegosaj.bru',
        titular: 'Diego Fernando Saj'
    }
];

export const cashInstructions = {
    pagoFacil: {
        nombre: 'Pago Fácil',
        instruccion: 'Dirigite a una sucursal, indicá que querés realizar una carga en ClaroPay y dictá este número:',
        dato: '1133148649',
        color: '#d97706'
    },
    rapipago: {
        nombre: 'Rapipago',
        instruccion: 'Dirigite a una sucursal e indicá que querés realizar una carga en PREX a esta cuenta:',
        dato: '14234836',
        color: '#d97706'
    }
};

export const qr = {
    nombre: 'QR Mercado Pago/MODO',
    instruccion: 'Escaneá el código QR con Mercado Pago, modo, uala, Nx o tu billetera favorita para realizar el pago:',
    imagen: '/qr-pago.png.png',
    color: '#009ee3'
};

export const binancePay = {
    nombre: 'Binance Pay',
    instruccion: 'You must make the payment from your Binance Pay app. Pay exact amount',
    payId: '199828457',
    imagen: '/binance-pay.png',
    color: '#F0B90B'
};
