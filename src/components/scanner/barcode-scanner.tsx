import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Receipt,
  Barcode,
  Plus,
  ImageIcon,
  Sparkles,
} from 'lucide-react'
import { scanBarcode, scanReceipt, type BarcodeResult, type ReceiptResult } from '@/lib/gemini'

// ---- Sub-types ----
interface BarcodeScannerProps {
  onAddTransaction: (data: {
    description: string
    amount: number
    category: string
    type: 'expense'
    notes?: string
  }) => void
  onClose: () => void
}

// ---- Helper: image drop zone ----
function ImageDropZone({ 
  onImageSelect, 
  preview, 
  onClear,
  label
}: { 
  onImageSelect: (file: File) => void
  preview: string | null
  onClear: () => void
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file)
    }
  }, [onImageSelect])

  return (
    <div className="relative">
      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-white/10">
          <img src={preview} alt="Preview" className="w-full h-48 object-contain bg-black/20" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 
              hover:bg-red-500/80 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200
            ${dragging 
              ? 'border-blue-400 bg-blue-500/10' 
              : 'border-white/20 hover:border-blue-400/50 hover:bg-white/5'
            }
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ImageIcon size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">{label}</p>
              <p className="text-xs text-white/40 mt-1">
                Click to browse or drag & drop
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                JPG, PNG, WEBP supported
              </p>
            </div>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onImageSelect(file)
        }}
      />
    </div>
  )
}

// ---- Confidence badge ----
function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { color: 'text-emerald-400 bg-emerald-400/15 border-emerald-400/30', label: 'High Confidence' },
    medium: { color: 'text-amber-400 bg-amber-400/15 border-amber-400/30', label: 'Medium Confidence' },
    low: { color: 'text-red-400 bg-red-400/15 border-red-400/30', label: 'Low Confidence' }
  }
  const c = config[level]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${c.color}`}>
      {c.label}
    </span>
  )
}

// ---- Main Scanner Component ----
export default function BarcodeScanner({ onAddTransaction, onClose }: BarcodeScannerProps) {
  const [activeTab, setActiveTab] = useState<'barcode' | 'receipt'>('barcode')

  // Barcode tab state
  const [barcodeFile, setBarcodeFile] = useState<File | null>(null)
  const [barcodePreview, setBarcodePreview] = useState<string | null>(null)
  const [barcodeLoading, setBarcodeLoading] = useState(false)
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null)
  const [barcodeError, setBarcodeError] = useState<string | null>(null)

  // Receipt tab state  
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [receiptResult, setReceiptResult] = useState<ReceiptResult | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  const handleImageSelect = (file: File, type: 'barcode' | 'receipt') => {
    const url = URL.createObjectURL(file)
    if (type === 'barcode') {
      setBarcodeFile(file)
      setBarcodePreview(url)
      setBarcodeResult(null)
      setBarcodeError(null)
    } else {
      setReceiptFile(file)
      setReceiptPreview(url)
      setReceiptResult(null)
      setReceiptError(null)
      setSelectedItems(new Set())
    }
  }

  const handleScanBarcode = async () => {
    if (!barcodeFile) return
    setBarcodeLoading(true)
    setBarcodeError(null)
    setBarcodeResult(null)
    try {
      const result = await scanBarcode(barcodeFile)
      if (result.error) {
        setBarcodeError(result.error)
      } else {
        setBarcodeResult(result)
      }
    } catch (err) {
      setBarcodeError(err instanceof Error ? err.message : 'Scan failed. Please try again.')
    } finally {
      setBarcodeLoading(false)
    }
  }

  const handleScanReceipt = async () => {
    if (!receiptFile) return
    setReceiptLoading(true)
    setReceiptError(null)
    setReceiptResult(null)
    setSelectedItems(new Set())
    try {
      const result = await scanReceipt(receiptFile)
      if (result.error) {
        setReceiptError(result.error)
      } else {
        setReceiptResult(result)
        // Select all items by default
        setSelectedItems(new Set(result.items.map((_, i) => i)))
      }
    } catch (err) {
      setReceiptError(err instanceof Error ? err.message : 'Scan failed. Please try again.')
    } finally {
      setReceiptLoading(false)
    }
  }

  const handleAddBarcodeTransaction = () => {
    if (!barcodeResult) return
    onAddTransaction({
      description: barcodeResult.productName,
      amount: barcodeResult.estimatedPrice,
      category: barcodeResult.category,
      type: 'expense',
      notes: barcodeResult.notes
    })
    onClose()
  }

  const toggleItem = (index: number) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const handleAddSelectedItems = () => {
    if (!receiptResult) return
    receiptResult.items.forEach((item, index) => {
      if (selectedItems.has(index)) {
        onAddTransaction({
          description: item.name,
          amount: item.price * item.quantity,
          category: item.category,
          type: 'expense',
          notes: `From ${receiptResult.storeName} receipt`
        })
      }
    })
    onClose()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
            flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">AI Scanner</h2>
            <p className="text-xs text-white/40">Powered by Google Gemini</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={18} className="text-white/60" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-3 mx-4 mt-4 bg-white/5 rounded-xl border border-white/[0.08]">
        {[
          { id: 'barcode' as const, label: 'Barcode / Product', icon: Barcode },
          { id: 'receipt' as const, label: 'Full Receipt', icon: Receipt }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 px-3 
              rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-white/50 hover:text-white/80'
              }
            `}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {activeTab === 'barcode' ? (
            <motion.div
              key="barcode"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs text-white/50">
                Upload a photo of any product, barcode, or price tag. 
                AI will identify the product and estimate the price in PKR.
              </p>

              <ImageDropZone
                onImageSelect={(file) => handleImageSelect(file, 'barcode')}
                preview={barcodePreview}
                onClear={() => {
                  setBarcodeFile(null)
                  setBarcodePreview(null)
                  setBarcodeResult(null)
                  setBarcodeError(null)
                }}
                label="Upload product image or barcode"
              />

              {barcodeFile && !barcodeResult && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleScanBarcode}
                  disabled={barcodeLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600
                    text-white text-sm font-medium flex items-center justify-center gap-2
                    hover:from-blue-500 hover:to-purple-500 transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-lg shadow-blue-500/20"
                >
                  {barcodeLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Scan with Gemini AI
                    </>
                  )}
                </motion.button>
              )}

              {/* Loading animation */}
              {barcodeLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 
                        border-t-blue-500 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-300 font-medium">
                        Analyzing image...
                      </p>
                      <p className="text-xs text-blue-400/60 mt-0.5">
                        Gemini is identifying the product
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error state */}
              {barcodeError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 
                    flex items-start gap-3"
                >
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-300 font-medium">Scan Failed</p>
                    <p className="text-xs text-red-400/70 mt-1">{barcodeError}</p>
                  </div>
                </motion.div>
              )}

              {/* Success result */}
              {barcodeResult && !barcodeResult.error && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08] p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-300">
                        Product Detected
                      </span>
                    </div>
                    <ConfidenceBadge level={barcodeResult.confidence} />
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-white/40">Product</span>
                      <span className="text-sm text-white font-medium text-right max-w-48">
                        {barcodeResult.productName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">Price (PKR)</span>
                      <span className="text-lg font-bold text-white font-mono">
                        Rs. {barcodeResult.estimatedPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">Category</span>
                      <span className="text-xs bg-blue-500/20 text-blue-300 
                        px-2.5 py-1 rounded-full border border-blue-500/30">
                        {barcodeResult.category}
                      </span>
                    </div>
                    {barcodeResult.notes && (
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-xs text-white/40 flex-shrink-0">Notes</span>
                        <span className="text-xs text-white/60 text-right">
                          {barcodeResult.notes}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAddBarcodeTransaction}
                    className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400
                      text-white text-sm font-medium flex items-center justify-center gap-2
                      transition-all shadow-lg shadow-emerald-500/25"
                  >
                    <Plus size={15} />
                    Add as Transaction
                  </button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="receipt"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-xs text-white/50">
                Upload a receipt photo. AI will extract all items and prices 
                so you can add them as transactions.
              </p>

              <ImageDropZone
                onImageSelect={(file) => handleImageSelect(file, 'receipt')}
                preview={receiptPreview}
                onClear={() => {
                  setReceiptFile(null)
                  setReceiptPreview(null)
                  setReceiptResult(null)
                  setReceiptError(null)
                  setSelectedItems(new Set())
                }}
                label="Upload receipt image"
              />

              {receiptFile && !receiptResult && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleScanReceipt}
                  disabled={receiptLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600
                    text-white text-sm font-medium flex items-center justify-center gap-2
                    hover:from-blue-500 hover:to-purple-500 transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-lg shadow-blue-500/20"
                >
                  {receiptLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Reading receipt...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Scan Receipt with AI
                    </>
                  )}
                </motion.button>
              )}

              {receiptLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 
                      border-t-purple-500 animate-spin" />
                    <div>
                      <p className="text-sm text-purple-300 font-medium">
                        Reading receipt...
                      </p>
                      <p className="text-xs text-purple-400/60 mt-0.5">
                        Extracting all items and prices
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {receiptError && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 
                    flex items-start gap-3"
                >
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-300 font-medium">Scan Failed</p>
                    <p className="text-xs text-red-400/70 mt-1">{receiptError}</p>
                  </div>
                </motion.div>
              )}

              {receiptResult && !receiptResult.error && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Receipt header */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 
                    flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {receiptResult.storeName}
                      </p>
                      <p className="text-xs text-white/40">
                        {receiptResult.date} • {receiptResult.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/40">Total</p>
                      <p className="text-base font-bold text-white font-mono">
                        Rs. {receiptResult.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Select all */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-white/40">
                      {selectedItems.size} of {receiptResult.items.length} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedItems(
                          new Set(receiptResult.items.map((_, i) => i))
                        )}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Select All
                      </button>
                      <span className="text-white/20">•</span>
                      <button
                        onClick={() => setSelectedItems(new Set())}
                        className="text-xs text-white/40 hover:text-white/60"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {receiptResult.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => toggleItem(index)}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border cursor-pointer
                          transition-all duration-150
                          ${selectedItems.has(index)
                            ? 'border-blue-500/40 bg-blue-500/10'
                            : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08]'
                          }
                        `}
                      >
                        <div className={`
                          w-4 h-4 rounded-full border-2 flex-shrink-0
                          flex items-center justify-center transition-all
                          ${selectedItems.has(index)
                            ? 'border-blue-400 bg-blue-400'
                            : 'border-white/30'
                          }
                        `}>
                          {selectedItems.has(index) && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{item.name}</p>
                          <p className="text-xs text-white/40">
                            {item.category} • Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-mono font-semibold text-white flex-shrink-0">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Add selected button */}
                  {selectedItems.size > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleAddSelectedItems}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600
                        text-white text-sm font-medium flex items-center justify-center gap-2
                        hover:from-emerald-500 hover:to-teal-500 transition-all
                        shadow-lg shadow-emerald-500/20"
                    >
                      <Plus size={15} />
                      Add {selectedItems.size} Transaction{selectedItems.size > 1 ? 's' : ''}
                    </motion.button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
