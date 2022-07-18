import './ZoomButtons.css'

type ZoomButtonsProps = {
  onZoom: (deltaZ: number) => void
}
export default function ZoomButtons({ onZoom }: ZoomButtonsProps) {
  return (
    <span className="zoom-button-container">
      <button className="zoom-button" onClick={() => onZoom(-0.5)}>
        -
      </button>
      <button className="zoom-button" onClick={() => onZoom(0.5)}>
        +
      </button>
    </span>
  )
}
