import valletLogo from "../assets/vallet_logo.png";

export default function Brand({ large = false }) {
  return (
    <div className={`brand ${large ? "brand--large" : ""}`}>
      <img src={valletLogo} alt="Vallet" />
    </div>
  );
}
