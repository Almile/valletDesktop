import valletLogo from "../assets/valletlogo.png";

export default function Brand({ large = false }) {
  return (
    <div className={`brand ${large ? "brand--large" : ""}`}>
      <img src={valletLogo} alt="Vallet" />
    </div>
  );
}
