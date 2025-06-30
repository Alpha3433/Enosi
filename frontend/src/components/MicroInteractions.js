import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced Button with micro-interactions
export const InteractiveButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  isLoading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium font-sans transition-all duration-200 relative overflow-hidden';
  
  const variants = {
    primary: 'bg-cement text-white hover:bg-millbrook shadow-lg hover:shadow-xl',
    secondary: 'border border-coral-reef text-kabul hover:bg-linen hover:border-cement',
    ghost: 'text-cement hover:text-millbrook hover:bg-linen/50'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-sm rounded-lg',
    medium: 'px-4 py-2.5 text-sm rounded-lg',
    large: 'px-6 py-3 text-base rounded-xl'
  };

  return (
    <motion.button
      whileHover={{ 
        scale: disabled ? 1 : 1.02,
        y: disabled ? 0 : -1
      }}
      whileTap={{ 
        scale: disabled ? 1 : 0.98,
        y: disabled ? 0 : 0
      }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {/* Background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center space-x-2">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};

// Enhanced Input with floating label
export const FloatingLabelInput = ({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  error,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value && value.length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className="relative">
      <motion.input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full px-3 py-3 bg-linen border-2 rounded-lg transition-all duration-200 font-sans text-kabul
          focus:bg-white focus:outline-none
          ${error 
            ? 'border-red-300 focus:border-red-500' 
            : 'border-coral-reef focus:border-cement'
          }
        `}
        whileFocus={{ scale: 1.01 }}
        {...props}
      />
      
      <motion.label
        className={`
          absolute left-3 font-sans pointer-events-none transition-all duration-200
          ${error ? 'text-red-500' : isFloating ? 'text-cement' : 'text-napa'}
        `}
        animate={{
          y: isFloating ? -10 : 12,
          scale: isFloating ? 0.85 : 1,
          x: isFloating ? -2 : 0
        }}
        style={{
          backgroundColor: isFloating ? 'white' : 'transparent',
          padding: isFloating ? '0 4px' : '0',
          zIndex: 10
        }}
      >
        {label}
      </motion.label>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-red-500 font-sans"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Animated Card Wrapper
export const AnimatedCard = ({ 
  children, 
  className = '',
  hover = true,
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={hover ? { 
        y: -8, 
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)' 
      } : {}}
      className={`transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Loading Skeleton
export const LoadingSkeleton = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <motion.div
      className={`bg-gradient-to-r from-coral-reef via-linen to-coral-reef rounded ${className}`}
      style={{ width, height }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

// Ripple Effect
export const RippleButton = ({ children, onClick, className = '', ...props }) => {
  const [ripples, setRipples] = useState([]);

  const addRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick && onClick(event);
  };

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={addRipple}
      {...props}
    >
      {children}
      
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </button>
  );
};

// Success/Error Toast Animation
export const ToastNotification = ({ 
  type = 'success', 
  message, 
  isVisible, 
  onClose 
}) => {
  const variants = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-cement text-white'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ⓘ'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`
            fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2
            ${variants[type]}
          `}
        >
          <span className="text-lg">{icons[type]}</span>
          <span className="font-medium font-sans">{message}</span>
          <button onClick={onClose} className="ml-2 hover:opacity-80">
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};