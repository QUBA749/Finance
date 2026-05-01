import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import BarcodeScanner from './barcode-scanner'
import { useTransactions } from '@/hooks/use-transactions'
import type { TransactionCategory } from '@/types/finance'

const VALID_CATEGORIES: TransactionCategory[] = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Healthcare', 'Utilities', 'Salary', 'Freelance', 'Investment',
  'Housing', 'Education', 'Travel', 'Other',
]

function toValidCategory(raw: string): TransactionCategory {
  const match = VALID_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.toLowerCase()
  )
  return match ?? 'Other'
}

/**
 * ScannerFAB — Floating Action Button that appears on every page.
 *
 * When clicked it opens a modal containing the BarcodeScanner component
 * (which has two tabs: barcode/product scan and full receipt scan).
 *
 * Transactions are saved to Supabase via the useTransactions hook
 * and a sonner toast confirms each addition.
 */
export default function ScannerFAB() {
  const [open, setOpen] = useState(false)
  const { addTransaction } = useTransactions()

  /**
   * Handle adding a scanned transaction.
   * Persists to Supabase and shows a toast notification.
   */
  const handleAddTransaction = async (data: {
    description: string
    amount: number
    category: string
    type: 'expense'
    notes?: string
  }) => {
    try {
      await addTransaction({
        date: new Date().toISOString().split('T')[0],
        description: data.description,
        category: toValidCategory(data.category),
        amount: data.amount,
        type: data.type,
        status: 'completed',
        account_id: null,
        notes: data.notes ?? '',
      })

      toast.success('Transaction added!', {
        description: `${data.description} — Rs. ${data.amount.toLocaleString()}`,
      })
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to save transaction')
    }
  }

  return (
    <>
      {/* ── FAB Button ── */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip (visible when modal is closed) */}
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="absolute right-16 top-1/2 -translate-y-1/2 
                bg-gray-900 border border-white/10 text-white text-xs 
                px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none
                shadow-xl"
            >
              Scan Barcode or Receipt
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 
                w-2 h-2 bg-gray-900 border-r border-t border-white/10 rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated pulse ring behind the button */}
        {!open && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-blue-500 
              animate-ping opacity-20" />
          </div>
        )}

        {/* Main FAB button */}
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="relative w-14 h-14 rounded-full 
            bg-gradient-to-br from-blue-500 to-purple-600
            flex items-center justify-center shadow-2xl
            shadow-blue-500/40
            hover:shadow-blue-500/60 transition-shadow"
        >
          <Camera size={22} className="text-white" />
        </motion.button>
      </div>

      {/* ── Modal overlay + panel ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />

            {/* Modal panel — bottom-sheet on mobile, centered on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-auto 
                sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
                sm:w-[480px] sm:max-h-[85vh]
                bg-[#0F1117] border border-white/10 
                rounded-t-3xl sm:rounded-2xl
                shadow-2xl shadow-black/60
                flex flex-col max-h-[90vh] overflow-hidden"
            >
              <BarcodeScanner
                onAddTransaction={handleAddTransaction}
                onClose={() => setOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
