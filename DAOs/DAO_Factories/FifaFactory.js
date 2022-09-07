import "dotenv/config";
import FifaDAO from "../Fifa.js";
import FakeFifaDAO from "../FakeMatches.js";

let fifaDAO;

switch (process.env.MODO_PRUEBA) {
  case "FAKE_DATA":
    fifaDAO = new FakeFifaDAO();
    break;
  case "RUSIA":
    fifaDAO = new FifaDAO(true);
    break;
  default:
    fifaDAO = new FifaDAO(false);
}

export const getFifaDao = () => {
  return fifaDAO;
};
