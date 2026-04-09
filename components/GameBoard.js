import { useState, useEffect } from 'react'

export default function GameBoard({ board, onMove, disabled, playerNumber, gameResult, winningLine }) {
  const [showWinLine, setShowWinLine] = useState(false)
  const [animateCollapse, setAnimateCollapse] = useState(false)

  useEffect(() => {
    if (winningLine && winningLine.length === 3) {
      // Step 1: Show winning line animation
      setShowWinLine(true)
      
      // Step 2: After line animation, trigger collapse
      setTimeout(() => {
        setAnimateCollapse(true)
      }, 600)
    }
  }, [winningLine])

  const getSymbol = (cellValue) => {
    if (cellValue === 0) return ''
    return cellValue === 1 ? 'X' : 'O'
  }

  const getCellClass = (cellValue, index) => {
    let classes = "game-cell "
    
    if (cellValue === 0 && !disabled) {
      classes += ""
    } else {
      classes += "disabled "
    }
    
    if (cellValue === 1) {
      classes += "game-cell-x "
    } else if (cellValue === 2) {
      classes += "game-cell-o "
    }

    // Add fade out animation when collapsing
    if (animateCollapse) {
      classes += "fade-out-cell "
    }
    
    return classes.trim()
  }

  const handleCellClick = (index) => {
    if (disabled || board[index] !== 0) return
    onMove(index)
  }

  // Calculate winning line position
  const getLineStyle = () => {
    if (!winningLine || winningLine.length !== 3) return null

    const [a, b, c] = winningLine
    
    // Determine line type and position
    // Rows
    if (a === 0 && b === 1 && c === 2) return { type: 'horizontal', row: 0 }
    if (a === 3 && b === 4 && c === 5) return { type: 'horizontal', row: 1 }
    if (a === 6 && b === 7 && c === 8) return { type: 'horizontal', row: 2 }
    
    // Columns
    if (a === 0 && b === 3 && c === 6) return { type: 'vertical', col: 0 }
    if (a === 1 && b === 4 && c === 7) return { type: 'vertical', col: 1 }
    if (a === 2 && b === 5 && c === 8) return { type: 'vertical', col: 2 }
    
    // Diagonals
    if (a === 0 && b === 4 && c === 8) return { type: 'diagonal', direction: 'main' }
    if (a === 2 && b === 4 && c === 6) return { type: 'diagonal', direction: 'anti' }
    
    return null
  }

  const lineStyle = getLineStyle()

  return (
    <div className="flex justify-center relative">
      <div className={`game-board-container ${animateCollapse ? 'collapse-animation' : ''}`}>
        <div className="grid grid-cols-3 gap-4 p-8 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl border-4 border-black shadow-bold-xl relative">
          {board.map((cell, index) => (
            <div
              key={index}
              className={getCellClass(cell, index)}
              onClick={() => handleCellClick(index)}
            >
              {getSymbol(cell)}
            </div>
          ))}
          
          {/* Winning Line Overlay */}
          {showWinLine && lineStyle && (
            <div className={`winning-line ${lineStyle.type} ${lineStyle.type === 'horizontal' ? `row-${lineStyle.row}` : ''} ${lineStyle.type === 'vertical' ? `col-${lineStyle.col}` : ''} ${lineStyle.type === 'diagonal' ? lineStyle.direction : ''} ${animateCollapse ? 'fade-out-line' : ''}`}></div>
          )}
        </div>
      </div>
    </div>
  )
}