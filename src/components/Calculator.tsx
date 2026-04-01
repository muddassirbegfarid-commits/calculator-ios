import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, Percent, Divide, X, Minus, Plus, Equal, ChevronDown, Repeat } from 'lucide-react';

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'INR';

const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.34,
  INR: 83.34,
};

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState<Currency>('USD');
  const [targetCurrency, setTargetCurrency] = useState<Currency>('EUR');
  const [showBaseDropdown, setShowBaseDropdown] = useState(false);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  const convertedValue = (parseFloat(display.replace(/,/g, '')) * (EXCHANGE_RATES[targetCurrency] / EXCHANGE_RATES[baseCurrency])).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display.replace(/,/g, ''));

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      const newValue = performCalculation(currentValue, inputValue, operator);
      setPrevValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const performCalculation = (prev: number, next: number, op: string) => {
    switch (op) {
      case '÷': return prev / next;
      case '×': return prev * next;
      case '−': return prev - next;
      case '+': return prev + next;
      default: return next;
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display.replace(/,/g, ''));
    if (operator && prevValue !== null) {
      const newValue = performCalculation(prevValue, inputValue, operator);
      setDisplay(String(newValue));
      setPrevValue(null);
      setOperator(null);
      setWaitingForOperand(false);
    }
  };

  const handlePercent = () => {
    const value = parseFloat(display.replace(/,/g, ''));
    setDisplay(String(value / 100));
  };

  const handleToggleSign = () => {
    const value = parseFloat(display.replace(/,/g, ''));
    setDisplay(String(value * -1));
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const Button = ({ children, onClick, className = '', variant = 'number' }: any) => {
    const bgClass = variant === 'function' ? 'bg-[#FF9500]' : variant === 'special' ? 'bg-[#A5A5A5] text-black' : 'bg-[#2C2C2E]';
    
    const handleClick = (e: React.MouseEvent) => {
      triggerHaptic();
      onClick(e);
    };

    return (
      <motion.button
        whileTap={{ scale: 0.92, filter: 'brightness(1.2)', boxShadow: '0 0 15px rgba(255,255,255,0.2)' }}
        onClick={handleClick}
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl font-medium transition-colors ${bgClass} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  const CurrencySelector = ({ currency, setCurrency, isOpen, setIsOpen, align = 'right' }: any) => (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
      >
        {currency} <ChevronDown size={12} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute z-10 mt-2 w-20 bg-[#1C1C1E] border border-white/10 rounded-xl overflow-hidden shadow-2xl ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            {(Object.keys(EXCHANGE_RATES) as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => { setCurrency(c); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors"
              >
                {c}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white font-sans overflow-hidden p-4 sm:p-6">
      {/* Display Section */}
      <div className="flex-1 flex flex-col justify-end pb-6 sm:pb-8">
        <div className="flex flex-col items-end gap-1 sm:gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <CurrencySelector 
              currency={baseCurrency} 
              setCurrency={setBaseCurrency} 
              isOpen={showBaseDropdown} 
              setIsOpen={setShowBaseDropdown} 
            />
            <h1 className="text-5xl sm:text-7xl font-light tracking-tight break-all text-right">
              {parseFloat(display).toLocaleString()}
            </h1>
          </div>
          
          <div className="w-full h-[1px] bg-white/10 my-1 sm:my-2" />
          
          <div className="flex items-center gap-2 sm:gap-3">
            <CurrencySelector 
              currency={targetCurrency} 
              setCurrency={setTargetCurrency} 
              isOpen={showTargetDropdown} 
              setIsOpen={setShowTargetDropdown} 
            />
            <p className="text-xl sm:text-3xl text-gray-500 font-light break-all text-right">
              {convertedValue}
            </p>
          </div>
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8 justify-items-center">
        {/* Row 1 */}
        <Button onClick={handleClear} variant="special" className="text-black">C</Button>
        <Button onClick={handleDelete} variant="special" className="text-black"><Delete size={24} /></Button>
        <Button onClick={handlePercent} variant="special" className="text-black"><Percent size={24} /></Button>
        <Button onClick={() => handleOperator('÷')} variant="function"><Divide size={28} /></Button>

        {/* Row 2 */}
        <Button onClick={() => handleDigit('7')}>7</Button>
        <Button onClick={() => handleDigit('8')}>8</Button>
        <Button onClick={() => handleDigit('9')}>9</Button>
        <Button onClick={() => handleOperator('×')} variant="function"><X size={28} /></Button>

        {/* Row 3 */}
        <Button onClick={() => handleDigit('4')}>4</Button>
        <Button onClick={() => handleDigit('5')}>5</Button>
        <Button onClick={() => handleDigit('6')}>6</Button>
        <Button onClick={() => handleOperator('−')} variant="function"><Minus size={28} /></Button>

        {/* Row 4 */}
        <Button onClick={() => handleDigit('1')}>1</Button>
        <Button onClick={() => handleDigit('2')}>2</Button>
        <Button onClick={() => handleDigit('3')}>3</Button>
        <Button onClick={() => handleOperator('+')} variant="function"><Plus size={28} /></Button>

        {/* Row 5 */}
        <Button onClick={handleToggleSign}>+/-</Button>
        <Button onClick={() => handleDigit('0')}>0</Button>
        <Button onClick={handleDecimal}>.</Button>
        <Button onClick={handleEquals} variant="function"><Equal size={28} /></Button>
      </div>
    </div>
  );
};

export default Calculator;
