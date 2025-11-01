/**
 * Identity Confirmation Component
 * Protects app access with identity verification
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordPromptProps {
  onSuccess: () => void;
}

export function PasswordPrompt({ onSuccess }: PasswordPromptProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (confirmed) {
      // Store authentication in sessionStorage
      sessionStorage.setItem('app_authenticated', 'true');
      sessionStorage.setItem('auth_timestamp', Date.now().toString());
      sessionStorage.setItem('authenticated_user', 'Atilio Ciuffolini');
      onSuccess();
    } else {
      setError('Por favor confirma tu identidad para acceder a la aplicación.');
    }
  };

  const handleDeny = () => {
    setError('Acceso denegado. Solo Atilio Ciuffolini puede usar esta aplicación.');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md mx-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🌾</div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Farm Visit App
              </h1>
              <p className="text-sm text-slate-600 mb-4">
                Verificación de identidad
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <p className="text-lg font-semibold text-slate-900 text-center mb-2">
                  ¿Eres Atilio Ciuffolini?
                </p>
                <p className="text-sm text-slate-600 text-center">
                  Confirma tu identidad para acceder a la aplicación
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-center p-4 border-2 border-slate-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => {
                      setConfirmed(e.target.checked);
                      setError('');
                    }}
                    className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 focus:ring-2"
                  />
                  <span className="ml-3 text-slate-700 font-medium">
                    Sí, soy Atilio Ciuffolini
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={handleConfirm}
                    disabled={!confirmed}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar y Acceder
                  </button>
                  <button
                    onClick={handleDeny}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-300 transition"
                  >
                    No soy yo
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500">
                App offline-first. Los datos se guardan localmente.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
