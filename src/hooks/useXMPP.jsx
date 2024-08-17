import { useContext } from 'react';
import XMPPContext from '../context/XMPPContext';

const useXMPP = () => {
    const context = useContext(XMPPContext);
    if (context === undefined) {
        throw new Error('useXMPP debe ser utilizado dentro de un XMPPProvider');
    }
    return context;
};

export default useXMPP;