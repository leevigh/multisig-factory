import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MultisigModule = buildModule("MultisigModule", (m) => {
  const quorum = m.getParameter("_quorum", 3);
  const validSigners = m.getParameter("_validSigners", ["0x0f490D84DDd5E0A2881eF8F319664C7f8Fd6335C", "0x4fe4C7Fb6D7Bc04F98866074Dd9299681F981346"]);

  const multisig = m.contract("Multisig", [quorum, validSigners]);

  return { multisig };
});

export default MultisigModule;
